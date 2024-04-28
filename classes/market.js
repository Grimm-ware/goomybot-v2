class Market{
   constructor(dbConnection){
      this.dbConnection = dbConnection
      /*Market entry:
      {
         uuid: "1234"
         userId: "1"
         price: 0
         pokemon: {}
      }
      
      Market operations: 
         getListings
         getListing (singular)
         addListing
         deleteListing
         buyListing         
      
      UserInteractionGuide: 
         .getMarket 
      */
   }
   
   getListings(filter){
      
   }
   
   getListing(uuid){
      
   }
   
   addListing(price, pokemon){
      
   }
   
   deleteListing(uuid){
      
   }
   
   buyListing(uuid){
      
   }
   
   
   
   
}

module.exports = Market