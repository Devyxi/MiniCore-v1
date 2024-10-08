const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const config = require('../../config/config.js');
const cooldowns = new Map();

module.exports = {
    name: 'interactionCreate',
    run: async (interaction, client) => {
        if (!interaction.isCommand() && !interaction.isUserContextMenuCommand() && !interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) {
            return; 
        }

        const command = client.collection.interactionCommands.get(interaction.commandName);
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            if (interaction.isCommand()) {
                if (!command) return;

                if (command.conf && command.conf.Slash) {
                    if (command.conf.Slash.cooldown) {
                        const cooldownTarget = command.conf.Slash.globalCooldown ? 'global' : interaction.user.id;

                        if (!cooldowns.has(command.name)) {
                            cooldowns.set(command.name, new Map());
                        }

                        const now = Date.now();
                        const timestamps = cooldowns.get(command.name);
                        const cooldownAmount = (command.conf.Slash.cooldown || 3) * 1000;

                        if (timestamps.has(cooldownTarget)) {
                            const expirationTime = timestamps.get(cooldownTarget) + cooldownAmount;

                            if (now < expirationTime) {
                                return await interaction.reply({
                                    content: command.conf.Slash.globalCooldown
                                        ? `Slow down! This command is under a global cooldown. Please wait until <t:${Math.round(expirationTime / 1000)}:R> to try again`
                                        : `Slow down! You're using this command too quickly. Please wait until <t:${Math.round(expirationTime / 1000)}:R> before trying again`,
                                    ephemeral: true
                                });
                            }
                        }

                        timestamps.set(cooldownTarget, now);
                        setTimeout(() => timestamps.delete(cooldownTarget), cooldownAmount);
                    }

                    if (command.conf.Slash.ownerOnly && !config.users.developerIds.includes(interaction.user.id)) {
                        return await interaction.reply({
                            content: 'This command is restricted to developers only',
                            ephemeral: true
                        });
                    }

                    if (command.conf.Slash.userPerms && command.conf.Slash.userPerms.length > 0) {
                        const member = interaction.member;
                        const missingPermissions = command.conf.Slash.userPerms.filter(permission => !member.permissions.has(permission));

                        if (missingPermissions.length > 0) {
                            return await interaction.reply({
                                content: `You lack the following permissions to use this command: ${missingPermissions.join(', ')}`,
                                ephemeral: true
                            });
                        }
                    }

                    if (command.conf.Slash.botPerms && command.conf.Slash.botPerms.length > 0) {
                        const botMember = await interaction.guild.members.fetch(client.user.id);
                        const missingBotPermissions = command.conf.Slash.botPerms.filter(permission => !botMember.permissions.has(permission));

                        if (missingBotPermissions.length > 0) {
                            return await interaction.reply({
                                content: `I lack the following permissions to execute this command: ${missingBotPermissions.join(', ')}`,
                                ephemeral: true
                            });
                        }
                    }

                    if (command.conf.Slash.maintenance) {
                        return await interaction.reply({
                            content: 'This command is currently under maintenance. Please try again later',
                            ephemeral: true
                        });
                    }

                    try {
                        await command.slashRun(interaction, client);
                    } catch (error) {
                        clientLogger.error(error, "err");
                        const errorCode = `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10000 + Math.random() * 90000)}`;

                        const errorEmbed = new EmbedBuilder()
                            .setColor('#FF0000') 
                            .setTitle('An Error Occurred')
                            .setDescription(`\`\`\`bash\n${error.message}\n\`\`\`\n\nThis error has been reported to our developers and should be fixed as soon as possible`);

                        const errorButton = new ButtonBuilder()
                            .setLabel(errorCode)
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true) 
                            .setCustomId(`error_code`); 

                        const actionRow = new ActionRowBuilder().addComponents(errorButton);

                        await interaction.reply({ embeds: [errorEmbed], components: [actionRow] });
                    }
                }
            }

            if (interaction.isContextMenuCommand()) {
                const contextMenuCommand = client.collection.interactionCommands.get(interaction.commandName);
                if (!contextMenuCommand) {
                    return await interaction.reply({ content: 'This context menu command does not exist', ephemeral: true });
                }

                try {
                    await command.contextMenuRun(interaction, client);
                } catch (error) {
                    clientLogger.error(error, "err");
                    const errorCode = `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10000 + Math.random() * 90000)}`;

                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000') 
                        .setTitle('An Error Occurred')
                        .setDescription(`\`\`\`bash\n${error.message}\n\`\`\`\n\nThis error has been reported to our developers and should be fixed as soon as possible`);

                    const errorButton = new ButtonBuilder()
                        .setLabel(errorCode)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true) 
                        .setCustomId(`error_code`); 

                    const actionRow = new ActionRowBuilder().addComponents(errorButton);

                    await interaction.reply({ embeds: [errorEmbed], components: [actionRow] });
                }
            }
        }

        if (interaction.isButton()) {
            const buttonComponent = client.components.buttons.get(interaction.customId);
            if (buttonComponent) {
                try {
                    await buttonComponent.run(interaction);
                } catch (error) {
                    clientLogger.error(error, "err");
                }
            }

        } else if (interaction.isModalSubmit()) {
            const modalComponent = client.components.modals.get(interaction.customId);
            if (modalComponent) {
                try {
                    await modalComponent.run(interaction);
                } catch (error) {
                    clientLogger.error(error, "err");
                }
            }

        } else if (interaction.isSelectMenu()) {
            const selectMenuComponent = client.components.selectMenus.get(interaction.customId);
            if (selectMenuComponent) {
                try {
                    await selectMenuComponent.run(interaction);
                } catch (error) {
                    clientLogger.error(error, "err");
                }
            }
        }
    },
};