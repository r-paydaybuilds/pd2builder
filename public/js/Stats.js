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
        this.baseStats = new Map();
        /**
         * The Builder instance that instantiated this
         * @type {Builder}
         */
        this.builder = builder;
    }

    get(key) {
        let base = this.getBaseStat(key);
        const mods = this.modifiers.filter(e => {
            let bool = e.type === key;
            if(e.whitelist) bool = bool && e.whitelist.includes(this.builder.exp.armor);
            if(e.blacklist) bool = bool && !e.blacklist.includes(this.builder.exp.armor);
            return bool;
        });
        for(const mod of mods) {
            const args = mod.arguments ? this.getMultiple(...mod.arguments) : [];
            base = mod.exec(base, ...args);
        }
        return base;
    }

    getMultiple(...keys) {
        return keys.map(e => this.get(e));
    }

    get modifiers() {
        const modsSkills = new Map(), mods = [], modsPerks = new Map();
        for(const [key, { state }] of this.builder.exp.skills) {
            const value = this.builder.dbs.get("skills").get(key);
            value.state = state;
            if(value.stats) modsSkills.set(key, value);
        }
        for(const [,value] of modsSkills) {
            if(value.overrides) modsSkills.delete(value.overrides);
        }
        for(const { stats, state } of [...modsSkills.values()].sort((a, b) => a.tier - b.tier)) {
            if(stats.basic) mods.push(...stats.basic);
            if(stats.ace && state > 1) mods.push(...stats.ace);
        }
        if(this.builder.exp.perkDeck) {
            const perkCards = this.builder.dbs.get("perk_decks").get(this.builder.exp.perkDeck).perks;
            const db = this.builder.dbs.get("perk_cards");
            for(const key of perkCards) {
                const value = db.get(key);
                if(value.stats) modsPerks.set(key, value);
            }
            for(const [,value] of modsPerks) {
                if(value.overrides) modsPerks.delete(value.overrides);
            }
            for(const [,value] of modsPerks) {
                mods.push(...value.stats);
            }
        }
        return mods;
    }

    setBaseStats(obj) {
        for(const prop in obj) {
            this.baseStats.set(prop, obj[prop]);
        }
    }

    getBaseStat(key) {
        return this.baseStats.get(key);
    }

    getBaseStats(...keys) {
        return keys.map(e => this.baseStats.get(e));
    }
}