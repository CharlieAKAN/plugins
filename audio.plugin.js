/**
 * @name AudioRoute
 * @author Charlie
 * @version 1.0.0
 * @description Adds a "Route Audio" option to the user context menu in Discord.
 */

module.exports = (_ => {
    const config = {
        info: {
            name: "AudioRoute",
            authors: [
                {
                    name: "Charlie",
                    discord_id: "YOUR_DISCORD_ID",
                    github_username: "YOUR_GITHUB_USERNAME",
                    twitter_username: "YOUR_TWITTER_USERNAME"
                }
            ],
            version: "1.0.0",
            description: "Adds a 'Route Audio' option to the user context menu in Discord.",
            github: "https://github.com/YOUR_GITHUB_REPO",
            github_raw: "https://raw.githubusercontent.com/YOUR_GITHUB_REPO/master/audioroute.plugin.js"
        },
        changelog: [
            {
                title: "Initial Release",
                items: ["Added basic functionality to add a 'Route Audio' context menu item."]
            }
        ]
    };

    return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
        constructor (meta) { for (let key in meta) this[key] = meta[key]; }
        getName () { return this.name; }
        getAuthor () { return this.author; }
        getVersion () { return this.version; }
        getDescription () { return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`; }

        downloadLibrary () {
            BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", async (error, response, body) => {
                        if (error) return BdApi.alert("Error", "Could not download BDFDB library plugin. Try again later or download it manually from the GitHub repository.");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), body, r));
                        BdApi.Plugins.enable("0BDFDB");
                    });
                }
            });
        }

        load () {
            if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
            if (!window.BDFDB_Global.downloadModal) {
                window.BDFDB_Global.downloadModal = true;
                this.downloadLibrary();
            }
            if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
        }
        start () { this.load(); }
        stop () {}
    } : (([Plugin, BDFDB]) => {
        return class AudioRoute extends Plugin {
            onStart () {
                this.patchContextMenus();
            }

            onStop () {
                BDFDB.PatchUtils.forceAllUpdates(this);
            }

            patchContextMenus () {
                BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.ContextMenuUtils, "openContextMenu", {
                    after: e => {
                        const [contextMenu, contextArgs] = e.returnValue;
                        const user = contextArgs[0]?.user;
                        if (user) {
                            const newItem = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
                                label: "Route Audio",
                                id: "route-audio",
                                action: () => {
                                    // Add your audio routing logic here
                                    BdApi.alert("Route Audio", `Routing audio for ${user.username}`);
                                }
                            });
                            contextMenu.props.children.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
                                children: [newItem]
                            }));
                        }
                    }
                });
            }
        };
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
