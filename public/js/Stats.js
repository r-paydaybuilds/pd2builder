/**
 * Stats classs
 */
export default class Stats {
    /**
     * @param {import("./Builder.js").default} builder 
     */
    constructor(builder) {
        /**
         * Each base stat is stored in here
         * @type {Map<String, Number>}
         */
        this.baseStats = new Map(Stats.definedBaseStats);
        /**
         * The Builder instance that instantiated this
         * @type {import("./Builder.js").default}
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

    get netDodge(){
        let stat = this.baseStats.get("dodge");
        for(const dodgeMod of this.getModifiersOf("dodgeMod")) {
            stat += Stats.calculate(dodgeMod);
        }
        let bonus = 1;
        for(const bonusMod of this.getModifiersOf("dodgeBonus")) {
            bonus += Stats.calculate(bonusMod);
        }
        return stat * bonus;
    }

    get netSpeed(){
        let stat = this.baseStats.get("speed");
        for(const speedMod of this.getModifiersOf("speedMod")) {
            stat += Stats.calculate(speedMod);
        }
        let bonus = 1;
        for(const bonusMod of this.getModifiersOf("speedBonus")) {
            bonus += Stats.calculate(bonusMod);
        }
        return stat * bonus;
    }

    get netConcealment(){
        let stat = this.baseStats.get("concealment");
        for(const concealmentMod of this.getModifiersOf("concealmentMod")) {
            stat += Stats.calculate(concealmentMod);
        }
        let bonus = 1;
        for(const bonusMod of this.getModifiersOf("concealmentBonus")) {
            bonus += Stats.calculate(bonusMod);
        }
        return stat * bonus;
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

            allPerks = this.builder.dbs.get("perk_cards"),
            skills = this.builder.exp.skills,
            armor = this.builder.exp.armor,
            skillDB = this.builder.dbs.get("skills");

        //console.log(perkDeck);
        
        if (perkDeck) {
            const deckCards = perkDeck.perks.map(perkName => allPerks.get(perkName)).filter(
                card => card.stats !== undefined
            );

            //console.log(deckCards);

            for (const card of deckCards){
                //console.log(card);
                modifiers.push(...card.stats.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
            }
        }

        if (this.builder.exp.perkDeck === "copycat"){
            const ccBoosts = Array.from(allPerks.values()).filter(
                perkCard => (perkCard.is_copycat_boost !== undefined) && (perkCard.is_copycat_boost) 
            );

            //console.log(ccBoosts);
            //console.log(modifiers);

            for (const boost of [this.builder.exp.copycat.tactical_reload, this.builder.exp.copycat.head_games, this.builder.exp.copycat.is_this_your_bullet, this.builder.exp.copycat.grace_period]){
                //console.log(boost);
                //console.log(ccBoosts[boost]);
                if (ccBoosts[boost].stats !== undefined){
                    modifiers.push(...ccBoosts[boost].stats.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
                }
                //console.log(modifiers);
            }

            const mimicBoosts = Array.from(allPerks.values()).filter(
                perkCard => (perkCard.copycat_mimicry_available !== undefined) && (perkCard.copycat_mimicry_available) 
            );

            const mimicryCard = mimicBoosts[this.builder.exp.copycat.mimicry];

            if (mimicryCard.copycat_stats !== undefined){
                modifiers.push(...mimicryCard.copycat_stats.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
            } else if (mimicryCard.stats !== undefined){
                modifiers.push(...mimicryCard.stats.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
            }


        }

        //const deckCards = perkDeck.perks.array.map(perkName => allPerks.get(perkName));

        if(perkDeck && perkDeck.stats) {
            //modifiers.push(...perkDeck.stats.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
        }
        
        for(const [id, { state }] of skills) {
            const skill = skillDB.get(id);
            if(!skill.stats) continue;
            if(skill.stats.basic) modifiers.push(...skill.stats.basic.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
            if(state == 1) continue;
            if(skill.stats.ace) modifiers.push(...skill.stats.ace.filter(stat => !Stats.isBlacklisted(armor, stat) && Stats.isWhitelisted(armor, stat)));
        }

        //console.log(modifiers);

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