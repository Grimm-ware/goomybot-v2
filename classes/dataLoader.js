const DatabaseManager = require("./databaseManager.js")
const PokemonAPI = require("./pokemonAPI.js")
const dbConnection = new DatabaseManager();
const pokemonAPI = new PokemonAPI();
const GlobalUtil = require("./globalUtility.js");

async function main() {
   await dbConnection.connect();
   //await addGrowthRateToPokemon();
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

main().catch(console.error);

async loadMoves(){
   
}

async function loadTest(){
   var startTime = Date.now();
   //console.log(`Start time: ${startTime}`)
   //console.log(`Loading pokemon`)
   var data = (await dbConnection.getFromCollectionByField("pokemon", {id: 1}));
   if (data && data != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      //console.log(`Writing pokemon`)
      await dbConnection.upsertBulkObject("speedTest", [data], "name");
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
   //console.log(`End time(seconds): ${ (Date.now() - startTime )/ 1000}`)
   return ((Date.now() - startTime )/ 1000)
}

async function addGrowthRateToPokemon() {
  var bulkOperation = []
  for (var i = 1; i <= 1017; i++) {
    console.log(`adding fields to pokemon iteration: ${i}`);
    var pokemonData = (await dbConnection.getFromCollectionByField("pokemon", {id: i}))[0];
    //console.log("getting species");
    var speciesData = (await dbConnection.getFromCollectionByField("species", {name: pokemonData.species.name}))[0];
    pokemonData.growth_rate = speciesData.growth_rate.name
    
    
    
    if (pokemonData && pokemonData != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      bulkOperation.push(pokemonData)
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
  }
  console.log(await dbConnection.upsertBulkObject("pokemon", bulkOperation, "name"))
}


async function addTierAndRegionToPokemon() {
  for (var i = 1; i <= 1017; i++) {
    console.log(`adding fields to pokemon iteration: ${i}`);
    var pokemonData = (await dbConnection.getFromCollectionByField("pokemon", {id: i}))[0];
    var speciesData = (await dbConnection.getFromCollectionByField("species", {id: i}))[0];
    if(speciesData.generation.name == "generation-i"){
      pokemonData.region = "Kanto"  
    } 
    else if(speciesData.generation.name == "generation-ii"){
      pokemonData.region = "Johto"  
    } 
    else if(speciesData.generation.name == "generation-iii"){
      pokemonData.region = "Hoenn"  
    } 
    else if(speciesData.generation.name == "generation-iv"){
      pokemonData.region = "Sinnoh"  
    }
    else if(speciesData.generation.name == "generation-v"){
      pokemonData.region = "Unova"  
    }
    else if(speciesData.generation.name == "generation-vi"){
      pokemonData.region = "Kalos"  
    }
    else if(speciesData.generation.name == "generation-vii"){
      pokemonData.region = "Alola"  
    }
    else if(speciesData.generation.name == "generation-viii"){
      pokemonData.region = "Galar"  
    }
    else if(speciesData.generation.name == "generation-ix"){
      pokemonData.region = "Paldea"  
    }
    
    if(speciesData.is_legendary == true || speciesData.is_mythical == true ){
      pokemonData.tier = 4  
    }
    else if(pokemonData.base_experience > 200){
      pokemonData.tier = 3  
    }
    else if(pokemonData.base_experience < 200 && pokemonData.base_experience > 100){
      pokemonData.tier = 2 
    }
    else 
      pokemonData.tier = 1
  console.log(`Name: ${pokemonData.name}\nRegion: ${pokemonData.region}\nTier: ${pokemonData.tier}`)
    
    
    if (pokemonData && pokemonData != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      await dbConnection.upsertObject("pokemon", pokemonData, {id: pokemonData.id});
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
    await GlobalUtil.sleep(300);
  }
}

async function addTierAndRegionToRaidPokemon() {
  var bulkOperation = []
  for (var i = 10001; i <= 10275; i++) {
    console.log(`adding fields to pokemon iteration: ${i}`);
    var pokemonData = (await dbConnection.getFromCollectionByField("raidPokemon", {id: i}))[0];
    console.log("getting species");
    var speciesData = (await dbConnection.getFromCollectionByField("species", {name: pokemonData.species.name}))[0];
    console.log(pokemonData.species.name)
    var pokemonSpeciesData = (await dbConnection.getFromCollectionByField("pokemon", {id: speciesData.id}))[0];
    console.log(pokemonSpeciesData.name)
    if(speciesData.generation.name == "generation-i"){
      pokemonData.region = "Kanto"  
    } 
    else if(speciesData.generation.name == "generation-ii"){
      pokemonData.region = "Johto"  
    } 
    else if(speciesData.generation.name == "generation-iii"){
      pokemonData.region = "Hoenn"  
    } 
    else if(speciesData.generation.name == "generation-iv"){
      pokemonData.region = "Sinnoh"  
    }
    else if(speciesData.generation.name == "generation-v"){
      pokemonData.region = "Unova"  
    }
    else if(speciesData.generation.name == "generation-vi"){
      pokemonData.region = "Kalos"  
    }
    else if(speciesData.generation.name == "generation-vii"){
      pokemonData.region = "Alola"  
    }
    else if(speciesData.generation.name == "generation-viii"){
      pokemonData.region = "Galar"  
    }
    else if(speciesData.generation.name == "generation-ix"){
      pokemonData.region = "Paldea"  
    }
    
    if(speciesData.is_legendary == true || speciesData.is_mythical == true ){
      pokemonData.tier = 4  
    }
    else if(pokemonSpeciesData.base_experience > 200){
      pokemonData.tier = 3  
    }
    else if(pokemonSpeciesData.base_experience < 200 && pokemonSpeciesData.base_experience > 100){
      pokemonData.tier = 2 
    }
    else 
      pokemonData.tier = 1
  console.log(`Name: ${pokemonData.name}\nRegion: ${pokemonData.region}\nTier: ${pokemonData.tier}`)
    
    
    if (pokemonData && pokemonData != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      bulkOperation.push(pokemonData)
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
  }
  console.log(await dbConnection.upsertBulkObject("raidPokemon", bulkOperation, "name"))
}


async function loadPokemon() {
  for (var i = 1; i <= 1017; i++) {
    console.log(`Pokemon Iteration: ${i}`);
    const data = await pokemonAPI.getPokemonById(i);

    if (data && data != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      await dbConnection.upsertObject("pokemon", data, {name: data.name});
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
    await GlobalUtil.sleep(2000);
  }
}

async function loadItemPocket() {
  for (var i = 1; i <= 8; i++) {
    console.log(`Item Pokect Iteration: ${i}`);
    const data = await pokemonAPI.getResourceById(i, "item-pocket");

    if (data && data != 'Not Found') {
      console.log("item-pocket:", data.name);
      // You can handle the data here
      await dbConnection.upsertObject("itemPocket", data, {name: data.name});
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
    await GlobalUtil.sleep(2000);
  }
}

async function loadItemCategory() {
  for (var i = 1; i <= 55; i++) {
    console.log(`Item Category Iteration: ${i}`);
    const data = await pokemonAPI.getResourceById(i, "item-category");

    if (data && data != 'Not Found') {
      console.log("item-category:", data.name);
      // You can handle the data here
      await dbConnection.upsertObject("itemCategory", data, {name: data.name});
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
    await GlobalUtil.sleep(2000);
  }
}

async function loadMoves() {
  for (var i = 1; i <= 904; i++) {
    console.log(`Move Iteration: ${i}`);
    const data = await pokemonAPI.getResourceById(i, "move");

    if (data && data != 'Not Found') {
      console.log("Move:", data.name);
      // You can handle the data here
      await dbConnection.upsertObject("moves", data, {name: data.name});
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
    await GlobalUtil.sleep(2000);
  }
}

async function loadRaidPokemon() {
  for (var i = 10001; i <= 10275; i++) {
    console.log(`Raid Iteration: ${i}`);
    const data = await pokemonAPI.getPokemonById(i);

    if (data && data != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      await dbConnection.upsertObject("raidPokemon", data, {name: data.name});
    } else {
      console.log("Data was not found");
      // Handle the error here
      
    }
    await GlobalUtil.sleep(1000);
  }
}

async function loadItems() {
  for (var i = 1; i <= 2109; i++) {
    console.log(`Item Iteration: ${i}`);
    const data = await pokemonAPI.getItemById(i);
    if (data && data != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      await dbConnection.upsertObject("items", data, {name: data.name});
    } else {
      console.log("Data was not found");
      // Handle the error here
    }
      await  GlobalUtil.sleep(1000);
  }
}

async function loadBerries() {
  for (var i = 1; i <= 64; i++) {
    console.log(`Berry Iteration: ${i}`);
    const data = await pokemonAPI.getResourceById(i,'berry');
    if (data && data != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      await dbConnection.upsertObject("berries", data, {name: data.name});
    } else {
      console.log("Data was not found");
      // Handle the error here
    }
    await GlobalUtil.sleep(1000);
  }
}

async function loadSpecies() {
  for (var i = 1; i <= 1017; i++) {
    console.log(`Species Iteration: ${i}`);
    const data = await pokemonAPI.getResourceById(i,'pokemon-species');
    if (data && data != 'Not Found') {
      //console.log("Received data:", data);
      // You can handle the data here
      await dbConnection.upsertObject("species", data, {id: data.id});
    } else {
      console.log("Data was not found");
      // Handle the error here
    }
    await GlobalUtil.sleep(1000);
  }
}
