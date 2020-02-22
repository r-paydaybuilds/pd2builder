/**
 * Stats classs
 */
export default class Stats {
    /**
     * @param {Builder} builder 
     */
    constructor(builder) {
        /**
         * Each base stat is stored in here
         * @type {Map<String, Number>}
         */
        this.baseStats = new Map(Stats.definedBaseStats);
        /**
         * The Builder instance that instantiated this
         * @type {Builder}
         */
        this.builder = builder;
    }

    //Armor stats
    get armorCore() {
        let stat = this.baseStats.get("armor");
        for(const armMod of this.getModifiersOf("armMod")) {
            stat += Stats.calculate(armMod);
        }
        let bonus = 1;
        for(const bonusMod of this.getModifiersOf("armBonus")) {
            bonus += Stats.calculate(bonusMod);
        }
        return stat * bonus;
    }

    get armorFromHealth() {
        const health = this.healthCore;
        let ratio = 0;
        for(const armorRatio of this.getModifiersOf("armorFromHealthRatio")) {
            ratio += Stats.calculate(armorRatio);
        }
        return health * ratio;
    }

    get netArmor() {
        const armor = this.armorCore;
        let bonus = 1;
        for(const armBonus of this.getModifiersOf("armBonus")) {
            bonus += Stats.calculate(armBonus);
        }
        let armToHealth = 1;
        for(const ratio of this.getModifiersOf("armorToHealth")) {
            armToHealth += Stats.calculate(ratio);
        }
        return (armor + (this.armorFromHealth * bonus)) * armToHealth;
    }

    get healthCore() {
        let stat = this.baseStats.get("health");
        for(const healthArmor of this.getModifiersOf("healthFromArmor")) {
            stat += Stats.calculate(healthArmor);
        }
        let bonus = 1;
        for(const bonusMod of this.getModifiersOf("healthBonus")) {
            bonus += Stats.calculate(bonusMod);
        }
        for(const healthConv of this.getModifiersOf("healthToArmor")) {
            bonus += Stats.calculate(healthConv);
        }
        return stat * bonus;
    }

    get netHealth() {
        const health = this.healthCore;
        let frenzy = 1;
        for(const removed of this.getModifiersOf("healthFrenzy")) {
            frenzy += Stats.calculate(removed);
        }
        return health * frenzy;
    }

    /**
     * Returns active modifiers that are in x part of the formula
     * @param {String} part 
     * @returns {Number[]}
     */
    getModifiersOf(part) {
        return this.modifiers.filter(stat => stat.part == part);
    }

    /**
     * Returns all active modifiers
     * @type {StatModifiers[]}
     */
    get modifiers() {
        const modifiers = [], 
            perkDeck = this.builder.dbs.get("perk_decks").get(this.builder.exp.perkDeck),
            skills = this.builder.exp.skills,
            armor = this.builder.exp.armor,
            skillDB = this.builder.dbs.get("skills");

        if(perkDeck && perkDeck.stats) {
            modifiers.push(...perkDeck.stats.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
        }
        
        for(const [id, { state }] of skills) {
            const skill = skillDB.get(id);
            if(!skill.stats) continue;
            if(skill.stats.basic) modifiers.push(...skill.stats.basic.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
            if(state == 1) continue;
            if(skill.stats.ace) modifiers.push(...skill.stats.ace.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
        }

        const over = [];
        for(const { overrides } of modifiers) {
            if(overrides) over.push(...overrides);
        }
        
        return modifiers.filter(({ id }) => !over.includes(id));
    }

    /**
     * Sets multiple base stats
     * @param {Object} baseStats 
     */
    setBaseStats(baseStats) {
        for(const base in baseStats) {
            this.baseStats.set(base, baseStats[base]);
        }
    }
    
    /**
     * Gets stats with modifiers
     * @param  {...Iterable<String, Number>} stats 
     * @returns {Array<String, Number>[]}
     */
    getStats(...stats) {
        const arr = [];
        for(const [string, number] of stats) {
            const first = string.substring(0, 1), camel = `net${string.replace(first, first.toUpperCase())}`;
            if(camel in this) {
                arr.push([string, this[camel]]);
            } else {
                arr.push([string, number]);
            }
        }
        return arr;
    }

    /**
     * Check if armor is whitelisted in stat
     * @static
     * @param {String=} armor 
     * @param {!Object} stat
     * @param {String[]=} stat.whitelist
     */
    static isWhitelisted(armor, { whitelist }) {
        return (!armor || !whitelist) || whitelist.includes(armor);
    }

    /**
     * Check if armor is blacklisted in stat
     * @static
     * @param {String=} armor 
     * @param {!Object} stat
     * @param {String[]=} stat.blacklist
     */
    static isBlacklisted(armor, { blacklist }) {
        return armor && blacklist && blacklist.includes(armor);
    }

    /**
     * Used for calculation of complicated stats
     * @static
     * @param {Object} modifier 
     */
    static calculate(modifier) {
        if(!modifier.exec) return modifier.value;
        const args = [];
        for(const arg of modifier.arguments) {
            args.push(this[arg]);
        }
        return modifier.exec(...args);
    }
}

/**
 * Stats that are already defined without choosing anything
 * @static
 * @type {Array<String|Number>[]}
 */
Stats.definedBaseStats = [
    ["health", 230]
];