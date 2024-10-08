module.exports = {
  prefix: '?',
  client: {
    token: '',
    id: '',
  },
  devGuildOnly: {
    enabled: false,
    guildId: '',
  },
  commands: {
    prefixEnabled: true,
    slashEnabled: true,
    contextMenuEnabled: true,
  },
  database: {
    mongodb: {
      enabled: false,
      uri: '',
    },
    mysql: {
      enabled: false,
      config: {
        host: '',
        user: '',
        password: '',
        database: '',
      },
    },
    postgresql: {
      enabled: false,
      config: {
        host: '',
        user: '',
        password: '',
        database: '',
      },
    },
    sqlite: {
      enabled: false,
      config: {
        path: './database.sqlite',
      },
    },
  },
  users: {
    developerIds: [
      '',
      '',
    ],
    ownerId: '',
  },
};