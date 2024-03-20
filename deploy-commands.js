const { REST, Routes } = require("discord.js");
const { applicationId, testGuildId, token } = require("./config.json");
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property.`);
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application commands.`);

        // Very naive argv implementation
        // Adding "--test" to the end of the command line instruction will only sync commands in test guild specified in config.json
        if (process.argv[2] == "--test") {
            const data = await rest.put(
                Routes.applicationGuildCommands(applicationId, testGuildId),
                { body: commands },
            );
        } else {
            const data = await rest.put(
                Routes.applicationCommands(applicationId),
                { body: commands },
            );
        }

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();