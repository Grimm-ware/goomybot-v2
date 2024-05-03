const Battle = require('./battle.js')

class BattleManager{
   //might not need this class
   constructor(dbConnection){
      this.dbConnection = dbConnection
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
   
   async createBattle(channel, user, userPokemon, wildPokemon, embed, file){
      var b = new Battle(channel, user, userPokemon, wildPokemon, embed, file)
      await b.startBattle()
      console.log(b)
      await this.saveBattle(b)
      return b
   }
   
   
   checkUserInBattle(){
      for(var i =0; i < this.battles.length; i++){
         
      }
   }
   

}

module.exports = BattleManager