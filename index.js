require('./utils/Overrides/interactions')();
require('./utils/Overrides/interactionEvent')();

const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const dotenv = require('dotenv');
const config = require('./config/config.js');
require('./utils/logger.js')
dotenv.config();

// Create a new Discord client with all necessary intents and partials
const client = new Client({
  intents: Object.values(GatewayIntentBits).slice(0, 22),
  partials: Object.values(Partials),
});

client.activeCollectors = new Map();

const errors = [];
if (typeof config.client.token !== 'string' || config.client.token.length === 0) {
  errors.push('Please provide a valid TOKEN in config.js');
}
if (typeof config.client.id !== 'string' || config.client.id.length === 0) {
  errors.push('Please provide a valid CLIENT ID in config.js');
}
if (typeof config.devGuildOnly.guildId !== 'string' || config.devGuildOnly.guildId.length === 0) {
  errors.push('Please provide a valid DEV_GUILD_ID in config.js');
}

if (errors.length > 0) {
  for (const error of errors) {
    clientLogger.error(`${error}`);
  }
  process.exit(1);
}

const handlers = [
  'events', 
  'commands', 
  'components', 
  'deploy', 
  'database'
];

handlers.forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

const token = config.client.token;
client.login(token)
  .then(() => {
    const acts = [
      {
        name: `${client.guilds.cache.size} Guild(s)!`,
        type: ActivityType.Playing, 
        status: "online",
      },
      {
        name: `discord.gg/M375Bh6QyK`,
        type: ActivityType.Playing, 
        status: "online",
      },
    ];

    clientLogger.info(`Logged in as ${client.user.tag}`);

    setInterval(async () => {
      const currentAct = acts.shift();
      await client.user.setPresence({
        activities: [
          {
            name: currentAct.name.toString(),
            type: currentAct.type,
          },
        ],
        status: currentAct.status,
      });
      acts.push(currentAct);
    }, 7000);
  });
