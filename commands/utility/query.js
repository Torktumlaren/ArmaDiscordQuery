const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { queryGameServerInfo, queryGameServerPlayer } = require("steam-server-query");
const { serverIpPort } = require("../../config.json");

const infoEmbed = new EmbedBuilder();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("players")
        .setDescription("Get a list of players on the arma server."),
    async execute(interaction) {
        serverInfo = await queryGameServerInfo(serverIpPort);
        playerInfo = await queryGameServerPlayer(serverIpPort);

        descriptionPlayers = `There are ${serverInfo.players}/${serverInfo.maxPlayers} players on the server.\n`;

        infoEmbed.setTitle(serverInfo.name)
            .setDescription(descriptionPlayers)
            .setFields();
            
        for (player of playerInfo.players) {

            // Format time string depending on playtime.
            if (player.duration < 60) {
                seconds = Math.floor(player.duration);
                time = `${seconds}s`;
            } else if (player.duration < 3600) {
                seconds = player.duration % 60;
                minutes = Math.floor(player.duration / 60);
                time = `${minutes}m ${seconds}s`;
            } else {
                seconds = player.duration%60;
                minutes = Math.floor(player.duration%3600/60);
                hours = Math.floor(player.duration/3600);
                time = `${hours}h ${minutes}m ${seconds}s`;
            }

            infoEmbed.addFields({name:player.name, value:time, inline: true});
        }
        
        await interaction.reply({embeds: [infoEmbed]});
    },
};