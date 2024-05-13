const Battle = require('./battle.js')
const { calculate, Generations, Pokemon, Move } = require('@smogon/calc');
const GlobalUtil = require("./globalUtility.js");

class BattleManager{
   //might not need this class
   constructor(dbConnection){
      this.dbConnection = dbConnection
      this.gen = Generations.get(9);
   }
   
   async saveBattle(battle){
      await this.dbConnection.upsertObject('battles', battle, {
			"uuid": battle.uuid
		})
   }
   
   async deleteBattle(uuid){
      await this.dbConnection.deleteFromCollectionByField('battles', {
			"uuid": uuid
		})
   }
   async saveTimeout(timeout){
      await this.dbConnection.upsertObject('timeouts', timeout, {
			"uuid": timeout.uuid
		})
   }
   
   async deleteTimeout(timeout){
      await this.dbConnection.deleteFromCollectionByField('timeouts', timeout, {
			"uuid": timeout.uuid
		})
   }
   async simulateBattle(userPokemon, wildPokemon){
      var result = {}
      var steps = []
      var startHealth = wildPokemon.stats.hp
      var p1 = new Pokemon(this.gen, GlobalUtil.capitalizeWords(userPokemon.name), {
          item: GlobalUtil.capitalizeWords(userPokemon.heldItem),
          nature: GlobalUtil.capitalizeWords(userPokemon.nature.name),
          ivs: GlobalUtil.convertToCalcFormat(userPokemon.iv),
          evs: GlobalUtil.convertToCalcFormat(userPokemon.ev),
          stats: GlobalUtil.convertToCalcFormat(userPokemon.stats),
          boosts: {},
          level: userPokemon.level,
          ability: GlobalUtil.capitalizeWords(userPokemon.ability)
          
        })
      var p2 = new Pokemon(this.gen, GlobalUtil.capitalizeWords(wildPokemon.name), {
          item: GlobalUtil.capitalizeWords(wildPokemon.heldItem),
          nature: GlobalUtil.capitalizeWords(wildPokemon.nature.name),
          ivs: GlobalUtil.convertToCalcFormat(wildPokemon.iv),
          evs: GlobalUtil.convertToCalcFormat(wildPokemon.ev),
          stats: GlobalUtil.convertToCalcFormat(wildPokemon.stats),
          boosts: {},
          level: wildPokemon.level,
          ability: GlobalUtil.capitalizeWords(wildPokemon.ability)
        })
      while(startHealth >= 0){
         result = calculate(
           this.gen,p1,p2,
           new Move(this.gen, GlobalUtil.capitalizeWords(GlobalUtil.getRandomFromArray(GlobalUtil.valuesToArray(userPokemon.moves))))
         );
         startHealth = startHealth - GlobalUtil.getRandomFromArray(result.damage)
         steps.push(result)
      }
      //console.log(steps)
      return steps
   }
   async createBattle(channel, user, userPokemon, wildPokemon, embed, file){
      var b = new Battle(channel, user, userPokemon, wildPokemon, embed, file)
      var steps = this.simulateBattle(userPokemon, wildPokemon)
      await b.startBattle(steps.length)
      //console.log(b)
      
      return b
   }
   
   
   
   async getUserInBattle(userId){
      return await this.dbConnection.getFromCollectionByField('battles', {users: {$in: [userId]}})
   }

   async getUserTimeout(userId){
      return await this.dbConnection.getFromCollectionByField('timeouts', {userId: userId})
   }   

}

module.exports = BattleManager