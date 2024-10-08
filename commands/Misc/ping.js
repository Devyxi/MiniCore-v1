const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports.conf = {
    Prefix: {
        enabled: true,
        aliases: ["ping"],
        userPermissions: [],
        botPerms: [],
        cooldown: 0,
        globalCooldown: false,
        ownerOnly: false,
        guildOnly: false,
        maintenance: false,
    },
    Slash: {
        enabled: true,
        userPermissions: [],
        botPerms: [],
        cooldown: 0,
        globalCooldown: false,
        ownerOnly: false,
        maintenance: false,
    },
    ContextMenu: {
        enabled: false,
    },
};

module.exports.help = {
    Prefix: {
        name: "ping",
        description: "ping",
    },
    Slash: {
        data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("ping"),
    },
    ContextMenu: {
        data: null,
    },
};

const updateLatencies = (interaction) => {
    const webLatency = Date.now() - interaction.createdTimestamp;
    const apiLatency = interaction.client.ws.ping;
    const uptime = interaction.client.uptime || 0; // Added a default value to avoid potential undefined
    return { webLatency, apiLatency, totalLatency: webLatency + apiLatency, uptime };
};

const getColor = (latency) => {
    if (latency < 200) return 0x43B581; // Green
    else if (latency < 500) return 0xF3C35D; // Yellow
    return 0xF04747; // Red
};

const formatUptime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const createPingEmbed = (latencies, botStartedAt) => {
    const { webLatency, apiLatency, totalLatency, uptime } = latencies;
    return new EmbedBuilder()
        .setTitle('Advanced Latency and Server Information')
        .setColor(getColor(totalLatency))
        .addFields(
            { name: '🌐 Websocket Latency:', value: `\`\`\`yml\n${webLatency}ms\`\`\``, inline: true },
            { name: '🚀 API Latency:', value: `\`\`\`yml\n${apiLatency}ms\`\`\``, inline: true },
            { name: '⏰ Bot Started At:', value: botStartedAt, inline: false },
            { name: '🕒 Server Uptime:', value: `\`\`\`yml\n${formatUptime(uptime)}\`\`\``, inline: false }
        )
        .setTimestamp();
};

module.exports.prefixRun = async (client, message, args) => {
    const latencies = updateLatencies(message);
    const botStartedAtTimestamp = Math.floor(client.readyTimestamp / 1000);
    const botStartedAt = `<t:${botStartedAtTimestamp}:F>`;

    const pingEmbed = createPingEmbed(latencies, botStartedAt);
    await message.reply({ embeds: [pingEmbed] });
};

module.exports.slashRun = async (interaction) => {
    const latencies = updateLatencies(interaction);
    const botStartedAtTimestamp = Math.floor(interaction.client.readyTimestamp / 1000);
    const botStartedAt = `<t:${botStartedAtTimestamp}:F>`;

    const pingEmbed = createPingEmbed(latencies, botStartedAt);
    await interaction.reply({ embeds: [pingEmbed] });
};