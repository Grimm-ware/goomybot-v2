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
   try{
	if (message.author.id === '1161801960740110386') {
		return; // Ignore messages from the bot itself
	}
   var user = {}
   try{
      user = await userManager.getUser(message.author.id)
   } catch(error){
      console.log('Could not load user')
   }
   const CommandRegex = /\.(.*?)(?=\s\.|$)/g;
   const regex = /\.(.*?)(?=\s\.|$)/g;

   let matches = [];
   let match;

   while ((match = regex.exec(message.content)) !== null) {
       matches.push(match[1]);
   }
	//console.log(message);
	var userMessage = message.author
   var command = ''
   var embeds = []
   var files = []
         structure = {embeds: [embed], files: [file]}
   console.log(matches)
      for(var i =0; i < matches.length && i <= 3; i++){
         command = matches[i]
         if (command.includes('spawn')) {
            console.log('Received command');
            var p = await pokemonManager.getNewPokemon(3, 100, true, '1');
            var p2 = await pokemonManager.getNewPokemon(150, 5, true, '1');
            var buffer = await pokemonManager.createBattleScene(p, p2);
            // Define the embed here
            var file = new AttachmentBuilder(buffer, 'battlescene.png');
            var desc = `${userMessage.username} encountered ${p2.name.charAt(0).toUpperCase() + p2.name.slice(1)}!`
            var attachment = 'attachment://battlescene.png'
            // Send the embed
            var embed = embedGenerator.getGenericEmbed(user, desc, file, attachment)   
            message.channel.send({
                  embeds: [embed],
                  files: [file]
            });
         }
         
         else if (command.includes('register')) {
            //Get user pokemon choice
            var choices = ['charmander', 'squirtle', 'bulbasaur'] 
            var choice =(command.split(' '))[1]
            if(choices.includes(choice)){
               var currentPokemon = await pokemonManager.getNewPokemonByName(choice, 5, true, message.author.id)
               //Create new user
               //console.log(currentPokemon);
               var user = await userManager.registerUser(message.author.id, userMessage.username, currentPokemon, "Kanto");
               await pokemonManager.saveUserPokemon(currentPokemon);
               //console.log(user)
               var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
               var file = new AttachmentBuilder(buffer).setName('pokemonViewRegister.png')
               var desc = `Registered ${userMessage.username}`
               var attachment = 'attachment://pokemonViewRegister.png'
               var embed = await embedGenerator.getGenericEmbed(user, desc, file, attachment)
               embeds.push(embed)
               files.push(file)
            }
            else{
               var embed = await embedGenerator.getGenericEmbed('Please choose a starter','','')
               embeds.push(embed)
            }
            message.channel.send(embed);
         }
         if(command.includes('delete')){
            //var user = await userManager.getUser(message.author.id)
            await userManager.deleteUser(message.author.id);
            //await userManager.deleteUser('1');
         }
         if (command.includes('profile')) {
            
         }
         if (command.includes('filter')) {
            var split = command.split(' ')
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
            if(split.includes('level')){
               filter = {...filter, ...{level: Number(split[split.indexOf("level") + 1])}}
            }
            if(split.includes('iv perfect')){
               filter = {...filter, ...{iv: {hp: 31, attack: 31,defense: 31,specialAttack: 31,specialDefense: 31,speed: 31}}}
            }
            if(split.includes('page')){
               page = split[split.indexOf("page") + 1]
            }
            console.log(filter)
            var table = await userManager.getUserPokemonTable(filter, page);
            user = {...user, ...{lastFilter: table}}
            await userManager.updateUser(user)
            var embed = await embedGenerator.getTableEmbed(user, table);
            embeds.push(embed)
         }
         if(command.includes('table')){
            var table = await userManager.getUserPokemonTable({userId: message.author.id}, 1);
            var embed = await embedGenerator.getTableEmbed(user, table);
            embeds.push(embed)
         }
         if(command.includes('select')){
            var choice =(command.split(' '))[1]
            //console.log(user.lastFilter[choice].uuid)
            var currentPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.lastFilter[choice].uuid})
            user.currentPokemon = currentPokemon.uuid
            await userManager.updateUser(user)
            var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
            var file = new AttachmentBuilder(buffer).setName('selectPokemonView.png');
            var desc = `Set buddy to ${currentPokemon.name}!`
            var attachment = 'attachment://selectPokemonView.png'
            var embed = await embedGenerator.getGenericEmbed(user, desc, attachment)
            embeds.push(embed)
            files.push(file)
         }
         if(command.includes('view')){
            var split = command.split(' ')
            var filter = 'minimal'
            if(split.includes('stats')){
               filter = "stats"
            }
            if(split.includes('moves')){
               filter = "moves"
            }
            var choice = split[split.length-1]
            var currentPokemon = {}
            if(split.includes('buddy')){
               currentPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.currentPokemon})
            }else{
               currentPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.lastFilter[choice].uuid})
            }
            var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
            var file = new AttachmentBuilder(buffer).setName('viewPokemonView.png');
            var attachment = 'attachment://viewPokemonView.png'
            var embed = await embedGenerator.getPokemonView(user,currentPokemon, filter, attachment)
            embeds.push(embed)
            files.push(file)
         }
         if(command.includes('load')){
            var pokemon = []
            for(var i = 1; i <= 800; i++){
               pokemon.push(await pokemonManager.getNewPokemon(i, Math.floor(Math.random() * 100), false, message.author.id))
            }
            pokemonManager.catchPokemonBulk(pokemon);
         }
         
      }
      message.channel.send({embeds: embeds, files: files})
      }catch(error){
         console.log(error)
      }
})
