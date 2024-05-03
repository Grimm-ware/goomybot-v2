class User {
    constructor(id, name, currentPokemon, wallet, items, achievements, quests, avatar, location, tier, filter, lastFilterTable, page) {
        this.id = id; // Discord user ID
        this.name = name;
        this.currentPokemon = currentPokemon;
        this.wallet = wallet;
        this.items = items;
        this.achievements = achievements;
        this.quests = quests;
        this.avatar = avatar;
        this.location = location;
        this.tier = tier;
        this.pokemonSeed = Math.random();
        this.shinySeed = Math.random();
        this.tierSeed = Math.random();
        this.filter = filter;
        this.lastFilterTable = lastFilterTable;
        this.page = page
    }
}

module.exports = User