const {
	EmbedBuilder,
} = require('discord.js');

class EmbedGenerator{
   async getGenericEmbed(user, description, attachment) {
       const embed = new EmbedBuilder()
           .setTitle(user.name)
           .setDescription(description);
       if (attachment !== '') {
           embed.setImage(attachment); // Use the attachment URL directly
           //embed.setThumbnail(attachment); // Set the thumbnail to display next to the embed
           
       }

       return embed;
   }
   
   async setColor(embed, shiny, tier){
      var color = 'Blue'
      if(tier == 2){
         color = 'Green'
      }else if(tier == 3){
         color = 'Yellow'
      }else if(tier == 4){
         color = 'Red'
      }
      if(shiny){
         color = '#f5baea'
      }
         
      embed.setColor(color)
      return embed
   }

      
   async getTableEmbed(user, table){
      var str = ''
      //console.log(table)
      for(var i =0; i < Object.keys(table).length; i++){
         //console.log(i)
         str = str.concat(i, ": ", table[i].name, '\n')
      }
      //console.log(user)
      var embed = new EmbedBuilder()
            .setDescription(user.name.concat('\'s Pokemon: \n', str))
      return embed
   }
   
   async getPokemonView(user, pokemon, filter, attachment){
      var str = ''
      if(filter == 'minimal'){
         str = `
         Name: ${pokemon.name}
         Level: ${pokemon.level}
         Shiny: ${pokemon.isShiny}
      `}
      else if(filter == 'stats'){
         str = `
         Name: ${pokemon.name}
         HP: ${pokemon.stats.hp} (${pokemon.iv.hp})
         Attack: ${pokemon.stats.attack} (${pokemon.iv.attack}) 
         Defense: ${pokemon.stats.defense} (${pokemon.iv.defense})  
         Special Attack: ${pokemon.stats.specialAttack} (${pokemon.iv.specialAttack})
         Special Defense: ${pokemon.stats.specialDefense} (${pokemon.iv.specialDefense})
         Speed: ${pokemon.stats.speed} (${pokemon.iv.speed})
      `
      }
      else if(filter == "moves"){
         
         var moves = ''
         for(var i = 1; i < 5; i++){
            if(pokemon.moves[i] != undefined){
               moves = moves.concat(pokemon.moves[i], '\n')
            }
         }
         str = `
         Name: ${pokemon.name}
         Moves:
         ${moves}
      `
      }
      else{
         var types = ''
         if(pokemon.types[1] != undefined) 
            types = pokemon.types[0].concat(' ', pokemon.types[1])
         else 
            types = pokemon.types[0]
         str = `
         Name: ${pokemon.name}
         Level: ${pokemon.level}
         Held Item: ${pokemon.heldItem}
         Shiny: ${pokemon.isShiny}
         Type(s): ${types}
         
      `
      
      }
      
      return this.getGenericEmbed(user, str, attachment)
   }
   

}

module.exports = EmbedGenerator