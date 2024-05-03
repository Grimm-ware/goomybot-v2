const GlobalUtil = require("./globalUtility.js");

class Battle{
   constructor(channel, user, userPokemon, wildPokemon, embed, file){
      this.id = GlobalUtil.getRandomRange(1000)
      this.channel =''
      this.uuid = GlobalUtil.getuuid();
      this.users = []
      this.embeds = []
      this.files = []
      this.users.push(user.id)
      this.wildPokemon = wildPokemon
      
      this.embeds.push(embed)
      this.files.push(file)      
      this.startTime = ''
      this.timer = null
      this.rewards = []
   }
   
   startBattle(){
      this.startTime = Date.now()
      this.simulateBattle()
   }
   
   simulateBattle(){
      this.timer = 5000
   }
   
   joinBattle(user, embed, file){
      this.users.push(user.id)
      this.embeds.push(embed)
      this.files.push(files)
   }
}

module.exports = Battle