const Pokemon = require('./pokemon.js')
const GlobalUtil = require("./globalUtility.js");

	class PokemonManager {
      
	constructor(dbConnection) {
		this.dbConnection = dbConnection
      this.pageSize = 10;
	}
	async getNewPokemon(id, level, isShiny, originalTrainerId) {
		//pokemon constructor(id, name, types, level, exp, nextExp, nickName, ability, nature, stats, ev, iv, moves, gender, statusCondition, tier, region, heldItem, isShiny, sprite, originalTrainerId)
		var dbResponse = (await this.dbConnection.getFromCollectionByField('pokemon', {
				id: id
			}))[0]   
      var name = dbResponse.name
      //console.log(`Name: ${JSON.stringify(name)}`)
      var nature = GlobalUtil.getRandomFromArray(this.getNatures());
      //console.log(`Nature: ${JSON.stringify(nature)}`)
      var iv = this.getRandomIv();
      //console.log(`IV: ${JSON.stringify(iv)}`)
      var ev = this.getEv();
      var stats = this.getStats(dbResponse, level, iv, ev, nature)
      //console.log(`Stats: ${JSON.stringify(stats)}`)
      var types = this.getTypes(dbResponse)
      //console.log(`Type(s): ${JSON.stringify(types)}`)
      var ability = this.getRandomAbility(dbResponse);
      //console.log(`Ability: ${JSON.stringify(ability)}`)
      var gender = this.getRandomGender()
      //console.log(`Gender: ${JSON.stringify(gender)}`)
      var sprite = this.getSprite(dbResponse, isShiny)
      //console.log(`Sprite: ${JSON.stringify(sprite)}`)
      //console.log(`Growth Rate: ${JSON.stringify(dbResponse.growth_rate)}`)
      var exp = this.calculateExp(dbResponse, level)
      //console.log(`EXP: ${JSON.stringify(exp)}`)     
      var nextExp = 0
      if(level != 100){
         nextExp = this.calculateExp(dbResponse, level+1)
      }
      //console.log(`Next EXP: ${JSON.stringify(nextExp)}`) 
      var moves = this.getRandomMoves(dbResponse, level)
      //console.log(`Moves: ${JSON.stringify(moves)}`)
      var heldItem = this.getRandomHeldItem(dbResponse, level)
      //console.log(`Held Item: ${JSON.stringify(heldItem)}`)
      var p = new Pokemon(originalTrainerId, id, dbResponse.name, types, level, exp, nextExp, "", ability, nature, stats, ev, iv, moves, gender, "", dbResponse.tier, dbResponse.region, heldItem, isShiny, sprite, originalTrainerId)
      //console.log(JSON.stringify(p))
      return p
	}
   
   /*
      User is presented list of their pokemon like: 
         1: bulbasaur
         2: charmander
         3: squirtle
         
         if user selects 1 then we should get the uuid that corresponds and mark as safe
         userTable takes form of: 
         1: {name: bulbasaur, uuid: xxxxxxxx}
   */
   async favoritePokemon(userTable, number){
      
   }
   
   async catchPokemon(pokemon, userId){
      pokemon.userId = userId
      pokemon.originalTrainerId = userId
      await this.dbConnection.upsertObject("userPokemon", pokemon, {"uuid": pokemon.uuid})
   }
   
   async catchPokemonBulk(bulkOperation){
      await this.dbConnection.upsertBulkObject("userPokemon", bulkOperation, "uuid")
   }
   
   async getUserPokemon(userId, pageNumber){
      //getFromCollectionByFieldsWithPagination(collection, fields, pageNumber, itemsPerPage)
      return await this.dbConnection.getFromCollectionByFieldsWithPagination("userPokemon", {"userId": userId}, pageNumber, this.pageSize,)   
   }
   
   async getUserPokemonTable(filter, pageNumber){
      var result = await this.dbConnection.getFromCollectionByFieldsWithPagination("userPokemon", filter, pageNumber, this.pageSize, ["name", "uuid"])
      var table = {}
      for(var i = 0; i < result.length; i++){
         table[i] = result[i]
      }
      return table
   }
   
   async getUserPokemonByField(userId, fieldName, fieldValue, pageNumber, projection){
      return await this.dbConnection.getFromCollectionByFieldsWithPagination("userPokemon", {"userId": userId, [fieldName]: fieldValue}, pageNumber, this.pageSize, projection)   
   }
   
   
   getRandomHeldItem(dbResponse){
      if(Math.random() <= .5 && dbResponse.held_items.length != 0){
         return GlobalUtil.getRandomFromArray(dbResponse.held_items).item.name    
      }else{
         return ""
      }             
   }
   
   getRandomMoves(dbResponse, level){
      var possible = []
      for(var i =0; i < dbResponse.moves.length; i++){
         if(dbResponse.moves[i].version_group_details[0].level_learned_at <= level && dbResponse.moves[i].version_group_details[0].move_learn_method.name != "egg" && dbResponse.moves[i].version_group_details[0].move_learn_method.name != "machine" && dbResponse.moves[i].version_group_details[0].move_learn_method.name != "tutor"){
            possible.push(dbResponse.moves[i].move.name)
         } 
      }
      if(possible.length == 1){
         return {1: possible[0], 2: null, 3: null, 4: null} 
      }else if(possible.length == 2){
         return {1: possible[0], 2: possible[1], 3: null, 4: null} 
      }else if(possible.length == 3){
         return {1: possible[0], 2: possible[1], 3: possible[2], 4: null} 
      }else if(possible.length >= 4){
         var randomMoves = GlobalUtil.getRandomDistinctElements(possible, 4)
         return {1: randomMoves[0], 2: randomMoves[1], 3: randomMoves[2], 4: randomMoves[3]} 
      }
      
   }
   
   calculateExp(dbResponse, level){
      var exp = 0
      if(dbResponse.growth_rate == "slow-then-very-fast"){
         if(level < 50){
            exp = (Math.pow(level,3) * (100-level))/50
         }else if(level >= 50 && level < 68){
            exp = (Math.pow(level,3) * (150-level))/100
         }else if(level >= 68 && level < 98){
            exp = (Math.pow(level,3) * ((1911-10*level)/3))/500
         }else{
            exp = (Math.pow(level,3) * ((160-level)))/100
         }
      }
      else if(dbResponse.growth_rate == "slow"){
         exp = (5 * Math.pow(level, 3))/4
      }
      else if(dbResponse.growth_rate == "medium-slow"){
         exp = (6/5 * Math.pow(level, 3)) - (15 * Math.pow(level, 2)) + 100*level - 140
      }
      else if(dbResponse.growth_rate == "medium"){
         exp = Math.pow(level,3)
      }
      else if(dbResponse.growth_rate == "fast"){
         exp = (4 * Math.pow(level,3))/5
      }else if(dbResponse.growth_rate == "fast-then-very-slow"){
         if(level < 15){
            exp = (Math.pow(level,3) * ((level + 1)/3) + 24)/50
         }else if(level >= 15 && level < 68){
            exp = (Math.pow(level,3) * (level+14))/50
         }else {
            exp = (Math.pow(level,3) * ((level/2) + 32))/50
         }
      }
      return exp
   }
   
   getSprite(dbResponse, isShiny){
      if(isShiny){
         return {front: dbResponse.sprites.front_shiny, back: dbResponse.sprites.back_shiny}
      }else{
         return {front: dbResponse.sprites.front_default, back: dbResponse.sprites.back_default}
      }
   }
   
   getTypes(dbResponse) {
      var types = []
      for(var i =0; i < dbResponse.types.length; i++){
         types.push(dbResponse.types[i].type.name)
      }
      return types;
   }

	getRandomAbility(dbResponse) {
      return GlobalUtil.getRandomFromArray(dbResponse.abilities).ability.name;
   }
   
   getRandomGender(){
      return GlobalUtil.getRandomFromArray(['Male', 'Female'])
   }

	getStats(dbResponse, level, iv, ev, nature) {
		//HP = floor(0.01 x (2 x Base + IV + floor(0.25 x EV)) x Level) + Level + 10
		//Other Stats = (floor(0.01 x (2 x Base + IV + floor(0.25 x EV)) x Level) + 5) x Nature
		var hp = Math.floor((0.01 * ((2 * dbResponse.stats[0].base_stat + iv.hp + Math.floor(.25 * ev.hp))) * level) + level + 10)
      var temp = 0
      var attack = 0
      var defense = 0
      var specialAttack = 0
      var specialDefense = 0
      var speed = 0
      if(nature.increases == "Attack") {
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[1].base_stat + iv.attack + Math.floor(.25 * ev.attack))) * level) + 5)
         attack = Math.floor(temp + (temp*.1))
      } else if(nature.decreases == "Attack"){
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[1].base_stat + iv.attack + Math.floor(.25 * ev.attack))) * level) + 5)
         attack =Math.floor(temp - (temp*.1))
      }else {
         attack = Math.floor((0.01 * ((2 * dbResponse.stats[1].base_stat + iv.attack + Math.floor(.25 * ev.attack))) * level) + 5)
      } 
      
		if(nature.increases == "Defense") {
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[2].base_stat + iv.defense + Math.floor(.25 * ev.defense))) * level) + 5)
         defense = Math.floor(temp + (temp*.1))
      } else if(nature.decreases == "Defense"){
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[2].base_stat + iv.defense + Math.floor(.25 * ev.defense))) * level) + 5)
         defense = Math.floor(temp - (temp*.1))
      } else {
         defense = Math.floor((0.01 * ((2 * dbResponse.stats[2].base_stat + iv.defense + Math.floor(.25 * ev.defense))) * level) + 5)
      }
      
      if(nature.increases == "Special Attack") {
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[3].base_stat + iv.specialAttack + Math.floor(.25 * ev.specialAttack))) * level) + 5)
         specialAttack = Math.floor(temp + (temp*.1))
      } else if(nature.decreases == "Special Attack"){
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[3].base_stat + iv.specialAttack + Math.floor(.25 * ev.specialAttack))) * level) + 5)
         specialAttack =Math.floor(temp - (temp*.1))
      } else {
         specialAttack = Math.floor((0.01 * ((2 * dbResponse.stats[3].base_stat + iv.specialAttack + Math.floor(.25 * ev.specialAttack))) * level) + 5)
      }
      
      if(nature.increases == "Special Defense") {
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[4].base_stat + iv.specialDefense + Math.floor(.25 * ev.specialDefense))) * level) + 5)
         specialDefense = Math.floor(temp + (temp*.1))
      } else if(nature.decreases == "Special Defense"){
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[4].base_stat + iv.specialDefense + Math.floor(.25 * ev.specialDefense))) * level) + 5)
         specialDefense =Math.floor(temp - (temp*.1))
      } else {
         specialDefense = Math.floor((0.01 * ((2 * dbResponse.stats[4].base_stat + iv.specialDefense + Math.floor(.25 * ev.specialDefense))) * level) + 5)
      }
      
      if(nature.increases == "Speed") {
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[5].base_stat + iv.speed + Math.floor(.25 * ev.speed))) * level) + 5)
         speed = Math.floor(temp + (temp*.1))
      } else if(nature.decreases == "Speed"){
         temp = Math.floor((0.01 * ((2 * dbResponse.stats[5].base_stat + iv.speed + Math.floor(.25 * ev.speed))) * level) + 5)
         speed =Math.floor(temp - (temp*.1))
      } else {
         speed = Math.floor((0.01 * ((2 * dbResponse.stats[5].base_stat + iv.speed + Math.floor(.25 * ev.speed))) * level) + 5)
      }
      return {
			hp: hp,
			attack: attack,
			defense: defense,
			specialAttack: specialAttack,
			specialDefense: specialDefense,
			speed: speed
		};
	}
   
   

	getNatures() {
	return [
  {
    "name": "Adamant",
    "increases": "Attack",
    "decreases": "Special Attack"
  },
  {
    "name": "Bashful",
    "increases": "",
    "decreases": ""
  },
  {
    "name": "Bold",
    "increases": "Defense",
    "decreases": "Special Attack"
  },
  {
    "name": "Brave",
    "increases": "Attack",
    "decreases": "Speed"
  },
  {
    "name": "Calm",
    "increases": "Special Defense",
    "decreases": "Special Attack"
  },
  {
    "name": "Careful",
    "increases": "Special Defense",
    "decreases": "Special Attack"
  },
  {
    "name": "Docile",
    "increases": "",
    "decreases": ""
  },
  {
    "name": "Gentle",
    "increases": "Special Defense",
    "decreases": "Defense"
  },
  {
    "name": "Hardy",
    "increases": "",
    "decreases": ""
  },
  {
    "name": "Hasty",
    "increases": "Speed",
    "decreases": "Defense"
  },
  {
    "name": "Impish",
    "increases": "Defense",
    "decreases": "Special Attack"
  },
  {
    "name": "Jolly",
    "increases": "Speed",
    "decreases": "Special Attack"
  },
  {
    "name": "Lax",
    "increases": "Defense",
    "decreases": "Special Defense"
  },
  {
    "name": "Lonely",
    "increases": "Attack",
    "decreases": "Defense"
  },
  {
    "name": "Mild",
    "increases": "Special Attack",
    "decreases": "Defense"
  },
  {
    "name": "Modest",
    "increases": "Special Attack",
    "decreases": "Attack"
  },
  {
    "name": "Naive",
    "increases": "Speed",
    "decreases": "Special Defense"
  },
  {
    "name": "Naughty",
    "increases": "Attack",
    "decreases": "Special Defense"
  },
  {
    "name": "Quiet",
    "increases": "Special Attack",
    "decreases": "Speed"
  },
  {
    "name": "Quirky",
    "increases": "",
    "decreases": ""
  },
  {
    "name": "Rash",
    "increases": "Special Attack",
    "decreases": "Special Defense"
  },
  {
    "name": "Relaxed",
    "increases": "Defense",
    "decreases": "Speed"
  },
  {
    "name": "Sassy",
    "increases": "Special Defense",
    "decreases": "Speed"
  },
  {
    "name": "Serious",
    "increases": "",
    "decreases": ""
  },
  {
    "name": "Timid",
    "increases": "Speed",
    "decreases": "Attack"
  }
]

	}

	
	getRandomIv(){
		return {
			hp: Math.floor(Math.random() * 32), // Generates a random integer between 0 and 31
			attack: Math.floor(Math.random() * 32),
			defense: Math.floor(Math.random() * 32),
			specialAttack: Math.floor(Math.random() * 32),
			specialDefense: Math.floor(Math.random() * 32),
			speed: Math.floor(Math.random() * 32)
		};
	}

	getEv(){
		return {
			hp: 0,
			attack: 0,
			defense: 0,
			specialAttack: 0,
			specialDefense: 0,
			speed: 0
		};
	}



}

module.exports = PokemonManager