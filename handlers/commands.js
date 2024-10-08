const { readdirSync, statSync } = require('fs');
const path = require('path');
const { Collection, SlashCommandBuilder, ContextMenuCommandBuilder } = require('discord.js');
const config = require('../config/config.js');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    let loadedContextMenuCommandCount = 0;
    let loadedSlashCommandCount = 0;
    let loadedPrefixCommandCount = 0;

    client.collection = {
        interactionCommands: new Collection(),
        prefixCommands: new Collection(),
    };
    client.applicationCommandsArray = [];

    const loadCommands = (commandsPath) => {
        try {
            const entries = readdirSync(commandsPath);
            for (const entry of entries) {
                const entryPath = path.join(commandsPath, entry);
                const entryStat = statSync(entryPath);

                if (entryStat.isDirectory()) {
                    loadCommands(entryPath);
                } else if (entryStat.isFile() && entry.endsWith('.js')) {
                    try {
                        const command = require(entryPath);
                        if (!command || !command.conf || !command.help) {
                            clientLogger.error(`Command module "${entryPath}" does not have 'conf' or 'help' properties - Command will not be registered!`);
                            continue;
                        }

                        const prefixEnabled = command.conf.Prefix && command.conf.Prefix.enabled;
                        const slashEnabled = command.conf.Slash && command.conf.Slash.enabled;
                        const contextMenuEnabled = command.conf.ContextMenu && command.conf.ContextMenu.enabled;

                        if (prefixEnabled && config.commands.prefixEnabled) {
                            client.collection.prefixCommands.set(command.help.Prefix.name || entry, command);
                            loadedPrefixCommandCount++;
                        }

                        if (slashEnabled && config.commands.slashEnabled) {
                            if (command.help.Slash.data instanceof SlashCommandBuilder) {
                                const commandData = command.help.Slash.data.toJSON();
                                client.collection.interactionCommands.set(commandData.name, command);
                                client.applicationCommandsArray.push(commandData);
                                loadedSlashCommandCount++;
                            }
                        }

                        if (contextMenuEnabled && config.commands.contextMenuEnabled) {
                            if (command.help.ContextMenu.data instanceof ContextMenuCommandBuilder) {
                                const commandData = command.help.ContextMenu.data.toJSON();
                                client.collection.interactionCommands.set(commandData.name, command);
                                client.applicationCommandsArray.push(commandData);
                                loadedContextMenuCommandCount++;
                            }
                        }
                    } catch (error) {
                        clientLogger.error(`Failed to load command ${entryPath}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            clientLogger.error(`Failed to read commands directory: ${error.message}`);
        }
    };

    loadCommands(commandsPath);

    const hasEnabledCommands = 
        (config.commands.prefixEnabled && loadedPrefixCommandCount > 0) ||
        (config.commands.slashEnabled && loadedSlashCommandCount > 0) ||
        (config.commands.contextMenuEnabled && loadedContextMenuCommandCount > 0);
    
    if (!hasEnabledCommands) {
        clientLogger.error('You must have at least one command type (prefix, slash, or context menu) enabled');
        process.exit(0);
    }

    clientLogger.success(`Loaded ${loadedSlashCommandCount} Slash Command(s)`);
    clientLogger.success(`Loaded ${loadedPrefixCommandCount} Prefix Command(s)`);
    clientLogger.success(`Loaded ${loadedContextMenuCommandCount} Context Menu Command(s)`);
};