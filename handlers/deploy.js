const {
  REST
} = require('@discordjs/rest');
const {
  Routes
} = require('discord-api-types/v9');
const config = require('../config/config');

module.exports = async (client) => {
  const commands = client.applicationCommandsArray;
  const rest = new REST({
      version: '10'
  }).setToken(config.client.token);

  try {
      clientLogger.info('Started refreshing application (/) commands');

      if (config.devGuildOnly.enabled) {
          await rest.put(
              Routes.applicationGuildCommands(config.client.id, config.devGuildOnly.guildId), {
                  body: commands
              },
          );
          clientLogger.success(`Successfully reloaded application (/) commands for guild ID: ${config.devGuildOnly.guildId}`);
      } else {
          await rest.put(
              Routes.applicationCommands(config.client.id), {
                  body: commands
              },
          );
          clientLogger.success('Successfully reloaded global application (/) commands');
      }

  } catch (error) {
      clientLogger.error(`Failed to register application commands: ${error.message}`);
  }
};