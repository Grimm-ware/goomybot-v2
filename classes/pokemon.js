const { v4: uuidv4 } = require('uuid');

class Pokemon {
    constructor(userId, id, name, types, level, exp, nextExp, nickName, ability, nature, stats, ev, iv, moves, gender, statusCondition, tier, region, heldItem, isShiny, sprite, originalTrainerId) {
        this.userId = userId
        this.id = id;
        this.uuid = uuidv4();
        this.name = name;
        this.types = types;
        this.level = level;
        this.exp = exp;
        this.nextExp = nextExp;
        this.nickName = nickName;
        this.ability = ability;
        this.nature = nature;
        this.stats = stats;
        this.ev = ev;
        this.iv = iv;
        this.moves = moves;
        this.gender = gender;
        this.statusCondition = statusCondition;
        this.tier = tier;
        this.region = region;
        this.heldItem = heldItem;
        this.isShiny = isShiny;
        this.sprite = sprite;
        this.originalTrainerId = originalTrainerId;
        this.safe = isShiny
    }
}

module.exports = Pokemon