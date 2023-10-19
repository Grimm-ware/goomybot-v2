const express = require('express');
const app = express();
var server = require('http').Server(app);
const DatabaseManager = require("./classes/databaseManager.js")
	const PokemonAPI = require("./classes/pokemonAPI.js")
	const GlobalUtil = require("./classes/globalUtility.js");
const PokemonManagerClass = require("./classes/pokemonManager.js")
	const UserManagerClass = require("./classes/userManager.js")
	const dbConnection = new DatabaseManager();
const pokemonAPI = new PokemonAPI();
const userManager = new UserManagerClass(dbConnection)
	const pokemonManager = new PokemonManagerClass(dbConnection);
const {
	Client,
	GatewayIntentBits,
	EmbedBuilder,
	AttachmentBuilder
} = require('discord.js');
const discordClient = new Client({
		intents: [GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent]
	});
//await dbConnection.disconnect();
const botConfig = require('./config/botconfig.json')

	async function main() {}
main();

server.listen(3000, async() => {
	await dbConnection.connect();
	await discordLogin("dev")
})

async function discordLogin(env) {
	await discordClient.once('ready', async() => {
		console.log('Ready!');
	});
	if (env == "prod") {
		await discordClient.login(botConfig.prod.token);
	} else {
		await discordClient.login(botConfig.dev.token);
	}

}

discordClient.on('messageCreate', async(message) => {

	if (message.author.id === '1161801960740110386') {
		return; // Ignore messages from the bot itself
	}
	//console.log(message);
	var userMessage = message.author
		if (message.content.includes('.spawn')) {
			console.log('Received command');
			const p = await pokemonManager.getNewPokemon(3, 100, true, '1');
			const p2 = await pokemonManager.getNewPokemon(150, 5, true, '1');
			const buffer = await pokemonManager.createBattleScene(p, p2);
			// Define the embed here
			const file = new AttachmentBuilder(buffer, 'battlescene.png');
			const embed = new EmbedBuilder()
				.setDescription(`${userMessage.username} encountered ${p2.name.charAt(0).toUpperCase()
  + p2.name.slice(1)}!`)
				.setImage('attachment://battlescene.png')
				//console.log(embed)
				// Send the embed
				message.channel.send({
					embeds: [embed],
					files: [file]
				});
		}
});

async function filterUserPokemon(userId, filter, pageNumber) {
	var table = await pokemonManager.getUserPokemonTable({
			...filter,
			...{
				"userId": userId
			}
		}, pageNumber)
		console.log(JSON.stringify(table))
		return table
}

main().catch(console.error);