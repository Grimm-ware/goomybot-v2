const {
	EmbedBuilder,
} = require('discord.js');

class EmbedGenerator{
   async getGenericEmbed(description, file, attachment){
      var embed = ''
      var structure = {}
      if(attachment == ''){
         embed = new EmbedBuilder()
            .setDescription(description)
         structure = {embeds: [embed]}  
      }
      else{
         embed = new EmbedBuilder()
            .setDescription(description)
            .setImage(attachment)
         structure = {embeds: [embed], files: [file]}
      }
      return structure;
      
      
   }
   
   async getTableEmbed(user, table){
      var str = ''
      console.log(table)
      for(var i =0; i < Object.keys(table).length; i++){
         //console.log(i)
         str = str.concat(i, ": ", table[i].name, '\n')
      }
      //console.log(user)
      var embed = new EmbedBuilder()
            .setDescription(user.name.concat('\'s Pokemon: \n', str))
      var structure = {embeds: [embed]}
      return structure;
   }
   
   async getPokemonView(pokemon, filter, file, attachment){
      var str = ''
      console.log(pokemon.types[0])
      if(filter == 'minimal'){
         str = `
         Name: ${pokemon.name}
         Level: ${pokemon.level}
         Shiny: ${pokemon.isShiny}
      `}
      if(filter == 'stats'){
         str = `
         Name: ${pokemon.name}
         HP: ${pokemon.stats.hp} (${pokemon.iv.hp})
         Attack: ${pokemon.stats.attack} (${pokemon.iv.attack}) 
         Defense: ${pokemon.stats.defense} (${pokemon.iv.defense})  
         Special Attack: ${pokemon.stats.specialAttack} (${pokemon.iv.specialAttack})
         Special Defense: ${pokemon.stats.specialDefense} (${pokemon.iv.specialDefense})
         Speed: ${pokemon.stats.speed} (${pokemon.iv.speed})
      `
      }else{
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
      
      return this.getGenericEmbed(str, file, attachment)
   }
   

}

module.exports = EmbedGenerator