const DatabaseManager = require("./classes/databaseManager.js")
const PokemonAPI = require("./classes/pokemonAPI.js")
const GlobalUtil = require("./classes/globalUtility.js");
const PokemonManagerClass = require("./classes/pokemonManager.js")
const UserManagerClass = require("./classes/userManager.js")
const dbConnection = new DatabaseManager();
const pokemonAPI = new PokemonAPI();
const userManager = new UserManagerClass(dbConnection)
const pokemonManager = new PokemonManagerClass(dbConnection);

async function main() {
	await dbConnection.connect();

	//await dbConnection.deleteFromCollectionByField("userPokemon", {"userId": "1"})
	//var p = await pokemonManager.getNewPokemon(1, 5, true, "1");
	await filterUserPokemon("1", {
		"region": "Kanto"
	}, 16)

	/*await pokemonManager.catchPokemon(p, "1");
	await userManager.registerUser("1", "Kenny", p, "Kanto");
	var bulkOperation = []
	for(var i = 2; i <= 151; i++){
	bulkOperation.push(await pokemonManager.getNewPokemon(i, 100, false, "1"));
	//console.log(`Iteration: ${i}`)
	}

	await pokemonManager.catchPokemonBulk(bulkOperation)
	 */

	/*  var p = await pokemonManager.getNewPokemon(1, 5, true, 1);

	await pokemonManager.catchPokemon(p, "1");
	//registerUser(id, name, currentPokemon, location) {


	var bulkOperation = []
	for(var j = 0; j < 10; j++){
	for(var i = 1; i <= 1017; i++){
	bulkOperation.push(await pokemonManager.getNewPokemon(i, 100, true, "1"));
	//console.log(`Iteration: ${i}`)
	}
	}

	await pokemonManager.catchPokemonBulk(bulkOperation)
	 */
	//var result = await pokemonManager.getUserPokemon("1")
	//console.log(`Result size: ${result.length}`)
	//await addFieldsToPokemon();
	//var keepAlive = []
	//var o = {}
	/*for (var i =0; i < 100000; i++){
	obj = {name: i}
	keepAlive.push(loadTest(o));
	}
	values = await Promise.all(keepAlive)
	console.log(values)
	var total = 0
	for(var i =0; i < values.length; i++){
	total = total + values[i]
	}
	const averageTime = total / values.length;
	console.log(`Average time: ${averageTime}`);
	//console.log(`Average time: ${total/values.length}`)
	 */
	await dbConnection.disconnect();

}

/*filter options: {name: ""}{region: ""}{isShiny: ""}{safe: ""}{level: 0}
 */
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