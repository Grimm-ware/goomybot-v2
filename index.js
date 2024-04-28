const express = require('express');
const app = express();
var server = require('http').Server(app);
const DatabaseManager = require("./classes/databaseManager.js");
const PokemonAPI = require("./classes/pokemonAPI.js");
const GlobalUtil = require("./classes/globalUtility.js");
const PokemonManagerClass = require("./classes/pokemonManager.js");
const UserManagerClass = require("./classes/userManager.js");
const EmbedGeneratorClass = require("./classes/embedGenerator.js")
//const Battle = require('./classes/battle.js');
const dbConnection = new DatabaseManager();
const pokemonAPI = new PokemonAPI();
const userManager = new UserManagerClass(dbConnection);
const pokemonManager = new PokemonManagerClass(dbConnection);
const embedGenerator = new EmbedGeneratorClass();
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
			var p = await pokemonManager.getNewPokemon(3, 100, true, '1');
			var p2 = await pokemonManager.getNewPokemon(150, 5, true, '1');
			var buffer = await pokemonManager.createBattleScene(p, p2);
			// Define the embed here
			var file = new AttachmentBuilder(buffer, 'battlescene.png');
         var desc = `${userMessage.username} encountered ${p2.name.charAt(0).toUpperCase() + p2.name.slice(1)}!`
         var attachment = 'attachment://battlescene.png'
         // Send the embed
         var embed = embedGenerator.getGenericEmbed(desc, file, attachment)   
			message.channel.send({
					embeds: [embed],
					files: [file]
			});
		}
      
      else if (message.content.includes('.register')) {
         //Get user pokemon choice
         var choices = ['charmander', 'squirtle', 'bulbasaur'] 
         var choice =(message.content.split(' '))[1]
         if(choices.includes(choice)){
            var currentPokemon = await pokemonManager.getNewPokemonByName(choice, 5, true, message.author.id)
            //Create new user
            //console.log(currentPokemon);
            var user = await userManager.registerUser(message.author.id, userMessage.username, currentPokemon, "Kanto");
            await pokemonManager.saveUserPokemon(currentPokemon);
            //console.log(user)
            var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
            var file = new AttachmentBuilder(buffer, 'pokemonView.png');
            var desc = `Registered ${userMessage.username}`
            var attachment = 'attachment://pokemonView.png'
            var embed = await embedGenerator.getGenericEmbed(desc, file, attachment)
         }
         else{
            var embed = await embedGenerator.getGenericEmbed('Please choose a starter','','')
         }
         message.channel.send(embed);
      }
      if(message.content.includes('.delete')){
         //var user = await userManager.getUser(message.author.id)
         await userManager.deleteUser(message.author.id);
         //await userManager.deleteUser('1');
      }
      if (message.content.includes('.profile')) {
         
      }
      if (message.content.includes('.filter')) {
         var split = message.content.split(' ')
         var filter = {userId: message.author.id}
         var page = 1
         if(split.includes('shiny')){
            filter = {...filter, ...{isShiny: true}}
         }
         if(split.includes('name')){
            filter = {...filter, ...{name: split[split.indexOf("name") + 1]}}
         }
         if(split.includes('tier')){
            filter = {...filter, ...{tier: Number(split[split.indexOf("tier") + 1])}}
         }
         if(split.includes('type')){
            filter = {...filter, ...{types: split[split.indexOf("type") + 1]}}
         }
         if(split.includes('region')){
            filter = {...filter, ...{region: split[split.indexOf("region") + 1]}}
         }
         if(split.includes('page')){
            page = split[split.indexOf("page") + 1]
         }
         //console.log(filter)
         var user = await userManager.getUser(message.author.id)
         var table = await userManager.getUserPokemonTable(filter, page);
         user = {...user, ...{lastFilter: table}}
         await userManager.updateUser(user)
         var embed = await embedGenerator.getTableEmbed(user, table);
         message.channel.send(embed);   
      }
      if(message.content.includes('.table')){
         var user = await userManager.getUser(message.author.id)
         var table = await userManager.getUserPokemonTable({userId: message.author.id}, 1);
         var embed = await embedGenerator.getTableEmbed(user, table);
         message.channel.send(embed);
      }
      if(message.content.includes('.select')){
         var choice =(message.content.split(' '))[1]
         var user = await userManager.getUser(message.author.id)
         console.log(user.lastFilter[choice].uuid)
         var currentPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.lastFilter[choice].uuid})
         user.currentPokemon = currentPokemon.uuid
         await userManager.updateUser(user)
         var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
         var file = new AttachmentBuilder(buffer, 'pokemonView.png');
         var desc = `Set buddy to ${currentPokemon.name}!`
         var attachment = 'attachment://pokemonView.png'
         var embed = await embedGenerator.getGenericEmbed(desc, file, attachment)
         message.channel.send(embed);
      }
      if(message.content.includes('.view')){
         var split = message.content.split(' ')
         var filter = 'minimal'
         if(split.includes('stats')){
            filter = "stats"
         }
         var choice = split[split.length-1]
         var user = await userManager.getUser(message.author.id)
         var currentPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.lastFilter[choice].uuid})
         var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
         var file = new AttachmentBuilder(buffer, 'pokemonView.png');
         var attachment = 'attachment://pokemonView.png'
         var embed = await embedGenerator.getPokemonView(currentPokemon, filter, file, attachment)
         message.channel.send(embed);
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

async function startBattle(userMessage){
   var user = await userManager.getUser(userMessage.id);
   const p = user.currentPokemon;
   const p2 = await pokemonManager.getNewPokemon(150, 5, true, '1');
   var battle = new Battle(p2)
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

async function getProfile(userMessage){
   
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

async function finishBattle(){
   
}



main().catch(console.error);