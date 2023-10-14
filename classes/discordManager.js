const Discord = require('discord.js');
const client = new Discord.Client();
const GlobalUtil = require("./classes/globalUtility.js");
const botConfig = require('./config/botconfig.json')

class discordManager {

	async function login(env) {
		client.once('ready', () => {
			console.log('Ready!');
		});
		if (env == "prod") {
			await client.login(botConfig.prod.token);
		} else {
			await client.login(botConfig.dev.token);
		}
	}
	async function getMessage() {
		await client.on('message', async(message) => {
			if (message.author.id == botConfig.devId) {
				//console.log('is bot message: true');
				return;
			} else if (message[0] == ".") {
            console.log('recieved command');
         }
		}
	}
}
	