/**
 * @name AudioRouter
 * @author Charlie
 * @version 1.0.0
 * @description Route audio streams from different users to different outputs.
 * @website https://example.com/AudioRouter
 * @source https://github.com/charlie/AudioRouter
 * @updateUrl https://raw.githubusercontent.com/charlie/AudioRouter/master/AudioRouter.plugin.js
 */

module.exports = (_ => {
    const config = {
        info: {
            name: "AudioRouter",
            authors: [{
                name: "Charlie",
                discord_id: "",
                github_username: "yourusername",
            }],
            version: "1.0.0",
            description: "Route audio streams from different users to different outputs."
        },
        changeLog: {
            fixed: {
                "Context Menu": "Fixed context menu not showing up correctly."
            }
        }
    };

    if (!window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started)) {
        return class {
            getName() { return config.info.name; }
            getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
            getVersion() { return config.info.version; }
            getDescription() { return `The Library Plugin needed for ${config.info.name} is missing. Please install it.`; }

            load() {
                window.BDFDB_Global = window.BDFDB_Global || {};
                if (!window.BDFDB_Global.downloadModal) {
                    window.BDFDB_Global.downloadModal = true;
                    BdApi.showConfirmationModal("Library Missing",
                        `The Library Plugin needed for ${this.getName()} is missing. Click "Download Now" to install it.`,
                        {
                            confirmText: "Download Now",
                            onConfirm: () => {
                                BdApi.showToast("Downloading the library...", {type: "info"});
                                BdApi.Net.fetch("https://path/to/BDFDB/library.js")
                                    .then(resp => resp.text())
                                    .then(text => {
                                        BdApi.saveData("BDFDB", "library", text);
                                        BdApi.showToast("Library downloaded successfully", { type: "success" });
                                        window.BDFDB_Global.downloadModal = false;
                                    })
                                    .catch(err => {
                                        BdApi.showToast("Failed to download the library", { type: "error" });
                                        console.error(err);
                                        window.BDFDB_Global.downloadModal = false;
                                    });
                            },
                            onCancel: () => {
                                window.BDFDB_Global.downloadModal = false;
                            }
                        });
                }
            }
        };
    } else {
        return (([Plugin, BDFDB]) => {
            return class AudioRouter extends Plugin {
                onLoad() {
                    this.defaults = {
                        general: {
                            enableCustomRouting: { value: true, description: "Enable custom routing of user audio." }
                        }
                    };

                    BDFDB.DataUtils.load(this, this.defaults);
                }

                onStart() {
                    this.patchContextMenu();
                }

                onStop() {
                    BDFDB.PluginUtils.clear(this);
                }

                getSettingsPanel() {
                    return BDFDB.PluginUtils.createSettingsPanel(this, {
                        items: [
                            BDFDB.FormUtils.createSetting({
                                name: "Enable Custom Routing",
                                key: "enableCustomRouting",
                                type: "switch",
                                value: this.defaults.general.enableCustomRouting.value,
                                onChange: value => { this.defaults.general.enableCustomRouting.value = value; }
                            })
                        ]
                    });
                }

                patchContextMenu() {
                    BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.ContextMenuUtils, "openContextMenu", { after: (that, args, value) => {
                        console.log("ContextMenu patch triggered"); // Debug log to check if function is called
                        const [event] = args;
                        if (event.contextMenuType === "UserContextMenu") {
                            console.log("Patching UserContextMenu"); // Additional debug log
                            const menuItem = new BDFDB.LibraryComponents.MenuItems.MenuItem({
                                label: "Route Audio",
                                id: BDFDB.ContextMenuUtils.createItemId(this.name, "route-audio"),
                                action: () => {
                                    console.log("Route audio option clicked"); // Confirm action trigger
                                }
                            });
                            if (value && value.props && Array.isArray(value.props.children)) {
                                value.props.children.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
                                    children: [menuItem]
                                }));
                                console.log("Menu item added"); // Debug log to confirm addition
                            }
                        }
                    }});
                }                
            };
        })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
    }
})();
