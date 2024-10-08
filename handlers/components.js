const { readdirSync, statSync } = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
    const componentsPath = path.join(__dirname, '..', 'components');
    client.components = {
        buttons: new Collection(),
        modals: new Collection(),
        selectMenus: new Collection(),
    };

    const loadComponents = (componentsPath) => {
        try {
            const entries = readdirSync(componentsPath);

            for (const entry of entries) {
                const entryPath = path.join(componentsPath, entry);
                const entryStat = statSync(entryPath);

                if (entryStat.isDirectory()) {
                    loadComponents(entryPath);
                } else if (entryStat.isFile() && entry.endsWith('.js')) {
                    try {
                        const component = require(entryPath);

                        if (!component || !component.run) {
                            clientLogger.error(`Possibly invalid component module "${entryPath}" - Component will not be registered!`);
                            continue;
                        }

                        const typeMatch = entryPath.match(/components\/(buttons|modals|selectMenus)/);
                        if (typeMatch && typeMatch[1]) {
                            const type = typeMatch[1];
                            if (type === 'buttons') {
                                client.components.buttons.set(component.id, component);
                            } else if (type === 'modals') {
                                client.components.modals.set(component.id, component);
                            } else if (type === 'selectMenus') {
                                client.components.selectMenus.set(component.id, component);
                            }
                        }
                    } catch (error) {
                        clientLogger.error(`Failed to load component ${entryPath}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            clientLogger.error(`Failed to read components directory: ${error.message}`);
        }
    };

    loadComponents(componentsPath);

    clientLogger.success(`Loaded ${client.components.buttons.size} Button(s)`);
    clientLogger.success(`Loaded ${client.components.modals.size} Modal(s)`);
    clientLogger.success(`Loaded ${client.components.selectMenus.size} Select Menu(s)`);
};