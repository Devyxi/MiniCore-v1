const PrefixModel = require('../../schemas/guildPrefix');
const config = require('../../config/config.js');

const cooldowns = new Map();

module.exports = {
    name: 'messageCreate',
    run: async (message, client) => {
        if (message.author.bot) return;

        try {
            const prefixData = await PrefixModel.findOne({ guildId: message.guild.id });
            const prefix = prefixData ? prefixData.prefix : '?';

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = client.collection.prefixCommands.get(commandName);

            if (!command) return;

            if (command.conf.Prefix.ownerOnly && !config.users.developerIds.includes(message.author.id)) {
            }

            if (command.conf.Prefix.userPermissions && command.conf.Prefix.userPermissions.length > 0) {
                const userPermissions = command.conf.Prefix.userPermissions;
                const member = message.member;

                const missingPermissions = userPermissions.filter(permission => !member.permissions.has(permission));

                if (missingPermissions.length > 0) {
                    return await message.reply({
                        content: `You lack the following permissions to use this command: ${missingPermissions.join(', ')}`,
                    });
                }
            }

            if (command.conf.Prefix.botPerms && command.conf.Prefix.botPerms.length > 0) {
                const botMember = message.guild.members.cache.get(client.user.id);
                const missingBotPermissions = command.conf.Prefix.botPerms.filter(permission => !botMember.permissions.has(permission));

                if (missingBotPermissions.length > 0) {
                    return await message.reply({
                        content: `I lack the following permissions to execute this command: ${missingBotPermissions.join(', ')}`,
                    });
                }
            }

            const cooldownTarget = command.conf.Prefix.globalCooldown ? 'global' : message.author.id;

            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Map());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.name);
            const cooldownAmount = (command.conf.Prefix.cooldown || 3) * 1000;

            if (timestamps.has(cooldownTarget)) {
                const expirationTime = timestamps.get(cooldownTarget) + cooldownAmount;

                if (now < expirationTime) {
                    return await message.reply({
                        content: command.conf.Prefix.globalCooldown
                            ? `Slow down buddy! This command is on a global cooldown <t:${Math.round(expirationTime / 1000)}:R>`
                            : `Slow down buddy! You're too fast to use this command, wait <t:${Math.round(expirationTime / 1000)}:R>`,
                    });
                }
            }

            timestamps.set(cooldownTarget, now);
            setTimeout(() => timestamps.delete(cooldownTarget), cooldownAmount);

            await command.prefixRun(client, message, args);
        } catch (error) {
            clientLogger.error(`Error processing message: ${error.message}`);
            await message.reply({ content: 'There was an error while processing your message' });
        }
    },
};
