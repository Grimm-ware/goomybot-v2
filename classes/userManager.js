const User = require('./user.js')
	const GlobalUtil = require("./globalUtility.js");

class UserManager {
	constructor(dbConnection) {
		this.dbConnection = dbConnection
      this.pageSize = 10
	}
   
   async getUser(id){
      return (await this.dbConnection.getFromCollectionByField("user", {"id": id}))[0]
   }
   
   async deleteUser(id){
      await this.dbConnection.deleteFromCollectionByField('user', {
			"id": id
		})
      await this.dbConnection.deleteFromCollectionByField('userPokemon', {
			"userId": id
		})
   }
   
	//user will select starter pokemon and start region
   
	async registerUser(id, name, currentPokemon, location) {
		//constructor(id, name, currentPokemon, wallet, items, achievements, quests, avatar, location, tier, frame, pokemonSeed, shinySeed, tierSeed, filter, lastFilterTable, page)
		var user = new User(id, name, currentPokemon.uuid, {
				money: 0,
				pokeCoins: 0
			}, [{
						name: "potion",
						quantity: 5
					}
				], [], [], "https://play.pokemonshowdown.com/sprites/trainers/sage.png", location, 1, 1, Math.random(),Math.random(), Math.random(),'',[],1)
      await this.updateUser(user)
      return user;
      
	}

	async updateUser(user) {
		await this.dbConnection.upsertObject('user', user, {
			"id": user.id
		})
	}
   
   

}

module.exports = UserManager