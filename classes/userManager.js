const User = require('./user.js')
	const GlobalUtil = require("./globalUtility.js");

class UserManager {
	constructor(dbConnection) {
		this.dbConnection = dbConnection
	}

	//user will select starter pokemon and start region
	async registerUser(id, name, currentPokemon, location) {
		//constructor(id, name, currentPokemon, wallet, items, achievements, quests, avatar, location, tier)
		await this.updateUser(new User(id, name, currentPokemon, {
				money: 0,
				pokeCoins: 0
			}, [{
						name: "potion",
						quantity: 5
					}
				], [], [], "", location, 1))
	}

	async updateUser(user) {
		await this.dbConnection.upsertObject('user', user, {
			"id": user.id
		})
	}

}

module.exports = UserManager