const https = require("https");
const GlobalUtil = require("./globalUtility.js");

class PokemonAPI {
  constructor() {}
   async getPokemonById(id) {
     return new Promise((resolve, reject) => {
       https.get(`https://pokeapi.co/api/v2/pokemon/${id}`, (resp) => {
         let data = "";

         // A chunk of data has been received.
         resp.on("data", (chunk) => {
           data += chunk;
         });

         // The whole response has been received.
         resp.on("end", () => {
           const parsedData = GlobalUtil.parseJSON(data);
           resolve(parsedData); // Resolve the Promise with the parsed data
         });
       }).on("error", (err) => {
         console.log("Error: " + err.message);
         reject(err); // Reject the Promise with the error
       });
     });
   }

   async getItemById(id) {
     return new Promise((resolve, reject) => {  
       https.get(`https://pokeapi.co/api/v2/item/${id}`, (resp) => {
         let data = "";

         // A chunk of data has been received.
         resp.on("data", (chunk) => {
           data += chunk;
         });

         // The whole response has been received.
         resp.on("end", () => {
           var parsedData = GlobalUtil.parseJSON(data);
           //console.log(parsedData)
           resolve(parsedData); // Resolve the Promise with the parsed data
         });
       }).on("error", (err) => {
         console.log("Error: " + err.message);
         reject(err); // Reject the Promise with the error
       });
     });
   }
   
   
   async getResourceById(id,resource) {
     return new Promise((resolve, reject) => {  
       https.get(`https://pokeapi.co/api/v2/${resource}/${id}`, (resp) => {
         let data = "";

         // A chunk of data has been received.
         resp.on("data", (chunk) => {
           data += chunk;
         });

         // The whole response has been received.
         resp.on("end", () => {
           var parsedData = GlobalUtil.parseJSON(data);
           //console.log(parsedData)
           resolve(parsedData); // Resolve the Promise with the parsed data
         });
       }).on("error", (err) => {
         console.log("Error: " + err.message);
         reject(err); // Reject the Promise with the error
       });
     });
   }

}

module.exports = PokemonAPI;