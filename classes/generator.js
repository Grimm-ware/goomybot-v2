const RandomSeed = require('random-seed')

class Generator{
  constructor(dbConnection){
     this.dbConnection = dbConnection
      this.odds = {
         shinyBound: 4096,
         shinyRate: 1/4096,
         shinyPower: 10000,
         tierBound: 100,
         tier4Rate: 1/100,
         tier3Rate: 25/100,
         tier2Rate: 50/100,
         tier1Rate: 1,
         tierPower: 100
      }
      this.shinyCondition = `(value <= ${this.odds.shinyRate})`
      this.tier4Condition = `(value <= ${this.odds.tier4Rate})`
      this.tier3Condition = `(value <= ${this.odds.tier3Rate})`
      this.tier2Condition = `(value <= ${this.odds.tier2Rate})`
      this.tier1Condition = `(value <= ${this.odds.tier1Rate})`
      this.tier4PoolSize = 91
      this.tier3PoolSize = 150
      this.tier2PoolSize = 437
      this.tier1PoolSize = 339
      
   }
   
   
   
   fastForwardToCurrent(currentFrame, randomizer, range){
      for(var i =0; i < currentFrame; i++){
         randomizer(range)
      }
      return randomizer
   }
   
   fastForwardToCurrentFloat(currentFrame, randomizer){
      for(var i =0; i < currentFrame; i++){
         randomizer.floatBetween(0,1)
      }
      return randomizer
   }
   
   fastForward(currentFrame, targetFrame, randomizer, range){
      randomizer = this.fastForwardToCurrent(currentFrame, randomizer, range)
      for(var i = currentFrame; i < targetFrame; i++){
         randomizer(range)
      }
      //console.log(JSON.stringify(this.odds))
      var result = randomizer(range)
      //console.log(result)
      return result
   }
   
   fastForwardFloat(currentFrame, targetFrame, randomizer){
      randomizer = this.fastForwardToCurrentFloat(currentFrame, randomizer)
      for(var i = currentFrame; i < targetFrame; i++){
        randomizer.floatBetween(0,1)
      }
      //console.log(JSON.stringify(this.odds))
      var result = randomizer.floatBetween(0,1)
      //console.log(result)
      return result
   }
   
   fastForwardUntil(currentFrame, condition, randomizer, range){
      var value = Infinity
      randomizer = this.fastForwardToCurrent(currentFrame, randomizer, range)
      var frame = currentFrame
      while(!(eval(condition))){
         value = randomizer(range)
         //console.log(value)
         frame = frame + 1
      }
      //console.log(JSON.stringify(this.odds))
      //console.log(JSON.stringify({value: value, frame: frame}))
      return {value: value, frame: frame}      
   }
   
   fastForwardUntilNext(currentFrame, condition, nextX, randomizer){
      var value = Infinity
      var frame = 1
      var count = 1
      var result = []
      console.log(nextX)
      while((!(eval(condition)) || (count <= nextX)) || frame < currentFrame){
         value = randomizer.floatBetween(0,1)
         frame = frame + 1
         if(eval(condition) && frame >= currentFrame){
            result.push({value: value, frame: frame})
            count = count + 1
            //console.log(eval(`value/${this.odds.shinyPower}`))
            //console.log(eval(`${this.odds.shinyRate}`))
         }
      }
      //console.log(JSON.stringify(this.odds))
      //console.log(JSON.stringify({value: value, frame: frame}))
      return result
   }
   
   getPokemon(seed, currentFrame, targetFrame, tier){
      var range = Infinity 
      if(tier == 1){
         range = this.tier1PoolSize
      }
      else if(tier == 2){
         range = this.tier2PoolSize
      }
      else if(tier == 3){
         range = this.tier3PoolSize
      }
      else if(tier == 4){
         range = this.tier4PoolSize
      }
      var randomizer = RandomSeed.create(seed)
      return this.fastForward(currentFrame, targetFrame, randomizer, range)
   }
   
   getTier(seed, currentFrame, targetFrame){
      var randomizer = RandomSeed.create(seed)
      var value = this.fastForwardFloat(currentFrame, targetFrame, randomizer)
      var tier = 1
      if(eval(this.tier2Conditon)){
         tier = 2
      }
      if(eval(this.tier3Condition)){
         tier = 3
      }
      if(eval(this.tier4Condition)){
         tier = 4
      }
      return tier
   }
   
   
   getTierNextX(seed, currentFrame, tier, nextX){
      var randomizer = RandomSeed.create(seed)
      var condition = this.tier1Condition
      if(tier == 2){
         condition = this.tier2Condition
      }
      else if(tier == 3){
         condition = this.tier3Condition
      }
      else if(tier == 4){
         condition = this.tier4Condition
      }
      var result = this.fastForwardUntilNext(currentFrame, condition, nextX, randomizer, this.odds.tierBound)
      var value = null
      var tier = 1
      for(var i =0; i < result.length; i++){
         value = result[i].value 
         if(eval(this.tier2Conditon)){
            tier = 2
         }
         if(eval(this.tier3Condition)){
            tier = 3
         }
         if(eval(this.tier4Condition)){
            tier = 4
         }
         result[i] = {tier: tier, frame: result[i].frame}
      }

      return result
   }
   
   getShiny(seed, currentFrame, targetFrame){
      var randomizer = RandomSeed.create(seed)
      var value = this.fastForwardFloat(currentFrame, targetFrame, randomizer)
      if(eval(this.shinyCondition)){
         return true
      }
      else {
         return false
      }
   }
   
   getShinyNextX(seed, currentFrame, nextX){
      var randomizer = RandomSeed.create(seed)
      //fastForwardUntilNext(currentFrame, condition, nextX, randomizer, range)
      var result = this.fastForwardUntilNext(currentFrame, this.shinyCondition, nextX, randomizer)
      return result
   }
   
   getNextShinyFrame(shinySeed, tierSeed, pokemonSeed, currentFrame){
      var randomizer = RandomSeed.create(shinySeed)   
      var shinyFrame = this.fastForwardUntilNext(currentFrame, this.shinyCondition, 1, randomizer)[0]
     
      shinyFrame.tier = this.getTier(tierSeed, currentFrame, shinyFrame.frame)
      shinyFrame.pokemonPool = this.getPokemon(pokemonSeed, currentFrame, shinyFrame.frame, shinyFrame.tier)
      //console.log(shinyFrame)
      return shinyFrame
      
   }
   
}

module.exports = Generator