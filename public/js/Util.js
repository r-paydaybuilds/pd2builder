//prototype methods

/**
 * Array intersection, to find the elements present in each of the passed arguments. Accepts an array of arrays as parameter
 * @param {...Array<Object>} param An array containg what to intersect
 */
Array.prototype.intersect = function(...args) {
    for(const array of args) {
        if(!Array.isArray(array)) throw "This function only accepts Array objects!";
    } 

    return this.filter(x => {
        let bool = true;
        for(let i = 0; i < args.length && bool; i++) {
            bool = args[i].includes(x);
        }
        return bool;
    }); 
};

/**
 * Returns the string in camelCase if it has snake_case
 */
String.prototype.toCamelCase = function() {
    return this.replace(/(_\w)/g, (m) => m[1].toUpperCase());
};

//a lot of classes are in here

class skillMap extends Map {
    constructor(...args) {
        super(...args);
        this.points = 120;
    }

    /**
     * Returns the number of points currently spent in a given tier of a given subtree. 
     * @param {number} tier 
     * @param {string} subtree 
     * @param {Object} skills 
     */
    getTierPoints(tier, subtree, skills) {
        let points = 0;

        for (const [key, value] of this) {
            const skill = skills.get(key);

            if(skill.subtree !== subtree || skill.tier !== tier) continue;
            if (value.state === "aced") {
                points += skill.ace + skill.basic;
            } else {
                points += skill.basic;
            } 
        }

        return points;
    }

    /**
     * Returns the number of points currently spent in all tiers of a given subtree.
     * @param {number} tier 
     * @param {string} subtree 
     * @param {Object} skills 
     */
    getTiersToFloorPoints(tier, subtree, skills) {
        let points = 0;

        for (let i = 0; i <= tier; i++) {
            points += this.getTierPoints(i, subtree, skills);
        }
            
        return points;
    }
}

class dbMap extends Map {
    fetchAll() {
        const array = [];
        const self = this;
        for(const [key] of this) {
            array.push(
                fetch(`./db/${key}.json`)
                    .then( res => res.json() )
                    .then( json => self.set(key, new Map(Object.entries(json))) )
            );
        }
        return Promise.all(array);
    }
}

/**
 * Class object for management of the system functions (underlying system of keeping track of the build).   
 */
class System {
    constructor(builder) {
        /**
         * The Builder instance that instantiated this
         * @type {Builder}
         */
        this.builder = builder;
    }

    Skill_Add(skillId) {
        const exp = this.builder.exp;
        const skill = exp.skills.get(skillId);
        const skillStore = this.builder.dbs.get("skills").get(skillId);
        const subtree = exp.subtrees[skillStore.subtree];

        if (skill) { // If given skill is present in exp.skills, (is already basic) 
            if (exp.skills.points-skillStore.ace >= 0) {
                subtree.points += skillStore.ace;
                exp.skills.points -= skillStore.ace;
                skill.state = "aced";
                subtree.tier = System.getSubtreeTierLevel(subtree.points);

                return true; 
            }
        } else { 
            if (exp.skills.points-skillStore.basic >= 0) {
                subtree.points += skillStore.basic;
                exp.skills.points -= skillStore.basic;
                exp.skills.set(skillId, { state: "basic" });
                subtree.tier = System.getSubtreeTierLevel(subtree.points);

                return true; 
            }
        }

        return false;
    }

    Skill_Remove(skillId) {
        const exp = this.builder.exp;
        const skill = exp.skills.get(skillId);
        const skills = this.builder.dbs.get("skills");
        const skillStore = skills.get(skillId);
        if (!skill) return false; // If the skill is not owned    

        for (let i = skillStore.tier; i < 4; i++) {
            if (exp.skills.getTierPoints(i+1, skillStore.subtree, skills) !== 0) { // Check if the tier above the given skill's tier is empty, else keep looking till top
                const tierPoints = exp.skills.getTiersToFloorPoints(i, skillStore.subtree, skills);
                
                if (skill.state === "aced") { // If removing the ace/basic points from the subtree makes the invested total go under the required for owned tiers, quit
                    if (tierPoints-skillStore.ace < this.constructor.TIER_UTIL[i]) { 
                        return false; 
                    }
                } else {
                    if (tierPoints-skillStore.basic < this.constructor.TIER_UTIL[i]) {
                        return false; 
                    }
                }
            }
        }
        
        const subtree = exp.subtrees[skillStore.subtree];
        if (skill.state === "aced") {
            subtree.points -= skillStore.ace;
            exp.skills.points += skillStore.ace;
            skill.state = "basic";
        } else if (skill.state === "basic") {
            subtree.points -= skillStore.basic;
            exp.skills.points += skillStore.basic;
            exp.skills.delete(skillId);
        }

        subtree.tier = System.getSubtreeTierLevel(subtree.points);

        return true; 
    }
    
    static getSubtreeTierLevel(subtreePoints) {
        // Will never return `0`, only 1-3 or -1 for tier 4
        let subtreeTierLevel = this.TIER_UTIL.findIndex(tierPoints => subtreePoints <= tierPoints);
        if (subtreeTierLevel === -1) { subtreeTierLevel = this.TIER_UTIL.length; }

        return subtreeTierLevel;
    }
}

/**
 * Array which keeps the necessary points for each tier
 * @type {Array}
 */
System.TIER_UTIL = [0, 1, 3, 16];

export { System, dbMap, skillMap };

/**
 * A class that should be filled with absolutely not useless stuff
 */
export default class Util {
    constructor() {
        throw new Error("This class isn't supposed to be initialized");
    }

    /**
     * Gives you a nice Payday 2 requires text
     * @param {String} type type of thing
     * @param {String} name name of thing
     */
    static resolveRequire(type, name) {
        return `Requires the ${name} ${this.resolveType(type)}${this.resolveVerb(type)}`;
    }

    /**
     * Gives you the type name that doesn't look computer-y
     * @param {String} type type of thing 
     */
    static resolveType(type) {
        return this.typeName.get(type);
    }

    /**
     * Gives you the verb that should be used because natural libraries are something that we shouldn't end up using
     * @param {String} type type of thing 
     */
    static resolveVerb(type) {
        return this.typeVerb.get(type);
    }
}

/**
 * Contains a map which has the name of each type
 * @type {Map<String, String>}
 */
Util.typeName = new Map([
    ["perk_deck", "Perk Deck"],
    ["perk_card", "Perk Card"],
    ["throwable", "Throwable"],
    ["skill", "Skill"],
    ["deployable", "Deployable"]
]);

/**
 * Contains a map which has the verb that should be used with each type
 * @type {Map<String, String>}
 */
Util.typeVerb = new Map([
    ["perk_deck", " equipped"],
    ["perk_card", " equipped"],
    ["throwable", " equipped"],
    ["skill", ""],
    ["deployable", " equipped"]
]);