const GlobalUtil = require("./classes/globalUtility.js");

class Batlle{
   constructor(wildPokemon){
      this.id = GlobalUtil.getuuid();
      this.users = []
      this.wildPokemon = {}
      //end time in Date.now() format
      this.timer = null;
      this.rewards = []
   }
   
   //user includes currentPokemon
   //passing in a finish battle function, will handle logic around sending messages, adding pokemon to users and user rewards
   //call this without await
   async startBattle(user, finishBattle){   
      this.users.push(userId);
      this.simulateBattle(user.currentPokemon);
      return new Promise((resolve) => {
        return setTimeout(() => {
        finishBattle(this);
        resolve(); // Resolve the promise when the timer expires
      }, this.timer);
    })
     
   }
   
   simulateBattle(){
      this.timer = 5000
   }
   
   joinBattle(userId){
      
   }
}