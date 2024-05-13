const express = require('express');
const app = express();
var server = require('http').Server(app);
const DatabaseManager = require("./classes/databaseManager.js");
const PokemonAPI = require("./classes/pokemonAPI.js");
const GlobalUtil = require("./classes/globalUtility.js");
const PokemonManagerClass = require("./classes/pokemonManager.js");
const UserManagerClass = require("./classes/userManager.js");
const BattleManagerClass = require("./classes/battleManager.js");
const EmbedGeneratorClass = require("./classes/embedGenerator.js")
const GeneratorClass = require("./classes/generator.js")
const { performance } = require('perf_hooks');
//const Battle = require('./classes/battle.js');
const { v4: uuidv4 } = require('uuid');
const dbConnection = new DatabaseManager();
const pokemonAPI = new PokemonAPI();
const userManager = new UserManagerClass(dbConnection);
const pokemonManager = new PokemonManagerClass(dbConnection);
const battleManager = new BattleManagerClass(dbConnection);
const embedGenerator = new EmbedGeneratorClass();
const generator = new GeneratorClass(dbConnection);
var timers = []

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
   var startTime = performance.now()
   
	if (message.author.id === '1161801960740110386') {
		return; // Ignore messages from the bot itself
	}
   var user = {}
   try{
      //console.log(`Loading user ${message.author.id}`)
      user = await userManager.getUser(message.author.id)
      if(user != undefined){
         var currentBattle = await battleManager.getUserInBattle(user.id)
      }
   } catch(error){
      //console.log('Could not load user')
   }
   
   const regex = /\.(.*?)(?=\s\.|$)/g;

   let matches = [];
   let match;

   while ((match = regex.exec(message.content)) !== null) {
       matches.push(match[1]);
   }
	////console.log(user);
	var userMessage = message.author 
   var command = '' 
   var embeds = []
   var files = []
   var embed = await embedGenerator.getGenericEmbed({name: message.author.id}, 'Default Embed', '') 
   //console.log(matches)
   
   var commandsUsed = []
      for(var i =0; i < matches.length && i < 10; i++){
         command = matches[i]
         
         if (command.includes('spawn') && (!commandsUsed.includes('spawn') || user.id == '701062435678846998')) {
            commandsUsed.push('spawn')
            ////console.log('Received command');
            if(currentBattle.length == 0){
               var choice =(command.split(' '))[1]
               var userPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.currentPokemon})
               var level = userPokemon.level
               if(choice && parseInt(choice) > userPokemon.level - 5){
                  level = parseInt(choice)
               }
               //getShiny(seed, currentFrame, targetFrame)
               var isShiny = user.frame + 1 == user.shinyFrame
               //var isShiny = generator.getNextShinyFrame(user.shinySeed, user.tierSeed, user.PokemonSeed, user.frame).frame == user.frame+1
               console.log(isShiny)
               //getTier(seed, currentFrame, targetFrame)
               var tier = generator.getTier(user.tierSeed, user.frame, user.frame + 1)
               //getPokemon(seed, currentFrame, targetFrame, tier)
               var pokemonPool = generator.getPokemon(user.pokemonSeed, user.frame, user.frame+1, tier)
               var pokemonId = (await pokemonManager.getPokemonTierIndex(tier, pokemonPool)).id
               var p2 = await pokemonManager.getNewPokemon(pokemonId, level, isShiny, user.id);
               user.frame = user.frame + 1
               await userManager.updateUser(user)
               var battleSteps = await battleManager.simulateBattle(userPokemon, p2)
               var battleLength = battleSteps.length * 4000
               if(tier > 2 || isShiny){
                  battleLength = battleLength * 2
               }
               var buffer = await pokemonManager.createBattleScene(userPokemon, p2);
               // Define the embed here
               var file = new AttachmentBuilder(buffer).setName('pokemonBattle.png')
               var desc = `Encountered ${GlobalUtil.capitalizeWords(p2.name)}\n${battleLength/1000}s`
               var attachment = 'attachment://pokemonBattle.png'
               embed = await embedGenerator.getGenericEmbed(user, desc, attachment)
               embed = await embedGenerator.setColor(embed, isShiny, tier)
               embeds.push(embed)
               files.push(file)
               ////console.log(message)
               //new Battle(channel, user, userPokemon, wildPokemon, embed, file)
               buffer = await pokemonManager.createPokemonView(p2, user.avatar);
               file = new AttachmentBuilder(buffer).setName('encounterEnd.png')
               desc = `Caught ${p2.name}`
               attachment = 'attachment://encounterEnd.png'
               embed = await embedGenerator.getGenericEmbed(user, desc, attachment)
               embed = await embedGenerator.setColor(embed, isShiny, tier)
               
               var battle = await battleManager.createBattle(message.channelId, user, userPokemon, p2, embed, file) 
                ////console.log(JSON.stringify(battle))
               var timer = setTimeout(async () => {
                  for(var k=0; k < battle.users.length; k++){
                     await pokemonManager.catchPokemon(p2, battle.users[k])
                  }
                  message.channel.send({embeds: battle.embeds, files: battle.files})
                  battleManager.deleteBattle(battle.uuid)               
               }, battleLength);
               
               var timerId = uuidv4()
               timer.timerId = timerId
               timers.push(timer)
               battle.timerId = timerId
               await battleManager.saveBattle(battle)            
            }else{
               
            }
         }
         if(command.includes('level')){
            var choice =(command.split(' '))[1]
            var userPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.currentPokemon})
            userPokemon.level = parseInt(choice)
            await pokemonManager.updatePokemon(userPokemon)
         } 
         if(command.includes('run') && !commandsUsed.includes('run')){
            commandsUsed.push('run')
            //find battle that the user is in
            if(currentBattle.length != 0){
            //cancel timer 
            var timeout = timers.find((element) => element.timerId === currentBattle[0].timerId);
            clearTimeout(timeout)
            //delete battle from db
            await battleManager.deleteBattle(currentBattle[0].uuid)
            user.frame = user.frame -1
            await userManager.updateUser(user)
            embed = await embedGenerator.getGenericEmbed(user, 'Ran away from the battle')
            embeds.push(embed)
            }            

            
         }
         if(command.includes('shinyFrame')){
            var shinyFrame = generator.getNextShinyFrame(user.shinySeed, user.tierSeed, user.pokemonSeed, user.frame)
            var pokemonId = (await pokemonManager.getPokemonTierIndex(shinyFrame.tier, shinyFrame.pokemonPool)).id
            var shiny = await pokemonManager.getNewPokemon(pokemonId, 5, true, user.id)
            user.shinyFrame = shinyFrame.frame
            await userManager.updateUser(user)
            var buffer = await pokemonManager.createGenericPokemon(shiny)
            var file = new AttachmentBuilder(buffer).setName('genericView.png')
            var desc = `Current Frame: ${user.frame}\nShiny Frame: ${shinyFrame.frame}`
            var attachment = 'attachment://genericView.png'
            embed = await embedGenerator.getGenericEmbed(user, desc, attachment)
            embed.setColor('#f5baea')
            embeds.push(embed)
            files.push(file)
         }
         if(command.includes('skipFrame') &&user.id == '701062435678846998'){
            var choice =(command.split(' '))[1]
            user.frame = user.frame + parseInt(choice)
            await userManager.updateUser(user)
         }
         
         if(command.includes('newSeeds')){
            user.tierSeed = uuidv4()
            user.shinySeed = uuidv4()
            user.pokemonSeed = uuidv4()
            user.frame = 1
            await userManager.updateUser(user)
         }
         
         if (command.includes('register')) {
            //Get user pokemon choice
            var choices = ['charmander', 'squirtle', 'bulbasaur'] 
            var choice =(command.split(' '))[1]
            if(choices.includes(choice)){
               var currentPokemon = await pokemonManager.getNewPokemonByName(choice, 5, true, message.author.id)
               //Create new user
               ////console.log(currentPokemon);
               user = await userManager.registerUser(message.author.id, message.author.username, currentPokemon, "Kanto");
               await pokemonManager.saveUserPokemon(currentPokemon);
               ////console.log(user)
               var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
               var file = new AttachmentBuilder(buffer).setName('pokemonViewRegister.png')
               var desc = `Registered ${message.author.username}`
               var attachment = 'attachment://pokemonViewRegister.png'
               embed = await embedGenerator.getGenericEmbed(user, desc, attachment)

               embeds.push(embed)
               files.push(file)
            }
            else{
               embed = await embedGenerator.getGenericEmbed('Please choose a starter','','')
               embeds.push(embed)
            }
         }
         if(command.includes('delete')){
            //var user = await userManager.getUser(message.author.id)
            await userManager.deleteUser(message.author.id);
            //await userManager.deleteUser('1');
            //user, desc, attachment
            embed = await embedGenerator.getGenericEmbed(user,'deleted','')
            embeds.push(embed)
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
            ////console.log(filter)
            var table = await pokemonManager.getUserPokemonTable(filter, page);
            user = {
               ...user,
               ...{
                     filter: filter,
                     lastFilterTable: table,
                     page: page
                  }
            }
            await userManager.updateUser(user)
            embed = await embedGenerator.getTableEmbed(user, table);
            embeds.push(embed)
         }
         if(command.includes('next')){
            var page = user.page + 1
            var table = await pokemonManager.getUserPokemonTable(user.filter, page);
            user = {
               ...user,
               ...{
                     lastFilterTable: table,
                     page: page
                  }
            }
            await userManager.updateUser(user)
            embed = await embedGenerator.getTableEmbed(user, table);
            embeds.push(embed)
         }
         if(command.includes('table')){
            var table = await pokemonManager.getUserPokemonTable({userId: message.author.id}, 1);
            embed = await embedGenerator.getTableEmbed(user, table);
            embeds.push(embed)
         }
         if(command.includes('select')){
            var choice =(command.split(' '))[1]
            ////console.log(user.lastFilterTable[choice].uuid)
            var currentPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.lastFilterTable[choice].uuid})
            user.currentPokemon = currentPokemon.uuid
            await userManager.updateUser(user)
            var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
            var file = new AttachmentBuilder(buffer).setName(`selectPokemonView${i}.png`);
            var desc = `Set buddy to ${currentPokemon.name}!`
            var attachment = `attachment://selectPokemonView${i}.png`
            embed = await embedGenerator.getGenericEmbed(user, desc, attachment)
            embed = await embedGenerator.setColor(embed, currentPokemon.isShiny, currentPokemon.tier)
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
               currentPokemon = await pokemonManager.loadUserPokemon({userId: user.id, uuid: user.lastFilterTable[choice].uuid})
            }
            var buffer = await pokemonManager.createPokemonView(currentPokemon, user.avatar);
            var file = new AttachmentBuilder(buffer).setName(`viewPokemonView${i}.png`);
            var attachment = `attachment://viewPokemonView${i}.png`
            embed = await embedGenerator.getPokemonView(user,currentPokemon, filter, attachment)
            embed = await embedGenerator.setColor(embed, currentPokemon.isShiny, currentPokemon.tier)
            embeds.push(embed)
            files.push(file)
         }
         if(command.includes('load')){
            var choice =(command.split(' '))[1]
            var pokemon = []
            //await addFieldsToPokemon()
            pokemon = await pokemonManager.getNewPokemonBulkRegion(choice, Math.floor(Math.random() * 100), true, message.author.id)
            await pokemonManager.catchPokemonBulk(pokemon);
            
         }
         
      }
      if(embeds.length != 0){
         message.channel.send({embeds: embeds, files: files})   
      }
      
      var endTime = performance.now()
      console.log(`Message took ${endTime - startTime} milliseconds`)
      }catch(error){
         console.log(error)
      }
})

async function loadPokemon() {
	for (var i = 1; i <= 1017; i++) {
		//console.log(`Pokemon Iteration: ${i}`);
		var data = await pokemonAPI.getPokemonById(i);
      ////console.log(data)
      delete data.game_indices
      for (var j = 0; j < data.moves.length; j++) {
			data.moves[j].version_group_details = [data.moves[j].version_group_details[0]]
         ////console.log(data.moves[i].version_group_details)
		}
      var moves = {id: i, name: data.name, moves: data.moves }
      delete data.moves
      await dbConnection.upsertObject("pokemonMoves", moves, {
				name: data.name,
            id: i
			});
      delete data.sprites.versions
      
      ////console.log(data)
		if (data && data != 'Not Found') {
			////console.log("Received data:", data);
			// You can handle the data here
			await dbConnection.upsertObject("pokemon", data, {
				name: data.name
			});
		} else {
			//console.log("Data was not found");
			// Handle the error here

		}
		await GlobalUtil.sleep(2000);
	}
   //console.log('finished load')
}

async function addFieldsToPokemon() {
	for (var i = 1; i <= 1017; i++) {
		//console.log(`adding fields to pokemon iteration: ${i}`);
		var pokemonData = (await dbConnection.getFromCollectionByField("pokemon", {
				id: i
			}))[0];
		var speciesData = (await dbConnection.getFromCollectionByField("species", {
				id: i
			}))[0];
      pokemonData.growth_rate = speciesData.growth_rate.name
		if (speciesData.generation.name == "generation-i") {
			pokemonData.region = "Kanto"
		} else if (speciesData.generation.name == "generation-ii") {
			pokemonData.region = "Johto"
		} else if (speciesData.generation.name == "generation-iii") {
			pokemonData.region = "Hoenn"
		} else if (speciesData.generation.name == "generation-iv") {
			pokemonData.region = "Sinnoh"
		} else if (speciesData.generation.name == "generation-v") {
			pokemonData.region = "Unova"
		} else if (speciesData.generation.name == "generation-vi") {
			pokemonData.region = "Kalos"
		} else if (speciesData.generation.name == "generation-vii") {
			pokemonData.region = "Alola"
		} else if (speciesData.generation.name == "generation-viii") {
			pokemonData.region = "Galar"
		} else if (speciesData.generation.name == "generation-ix") {
			pokemonData.region = "Paldea"
		}

		if (speciesData.is_legendary == true || speciesData.is_mythical == true) {
			pokemonData.tier = 4
		} else if (pokemonData.base_experience > 200) {
			pokemonData.tier = 3
		} else if (pokemonData.base_experience < 200 && pokemonData.base_experience > 100) {
			pokemonData.tier = 2
		} else
			pokemonData.tier = 1
				//console.log(`Name: ${pokemonData.name}\nRegion: ${pokemonData.region}\nTier: ${pokemonData.tier}`)

				if (pokemonData && pokemonData != 'Not Found') {
					////console.log("Received data:", data);
					// You can handle the data here
					await dbConnection.upsertObject("pokemon", pokemonData, {
						id: pokemonData.id
					});
				} else {
					//console.log("Data was not found");
					// Handle the error here

				}
				await GlobalUtil.sleep(300);
	}
}
