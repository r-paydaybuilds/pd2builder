//prototype methods

/**
 * Array intersection, to find the elements present in each of the passed arguments. Accepts an array of arrays as parameter
 * @param {...Array<Object>} param An array containg what to intersect
 * @memberof Array.prototype
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
 * Reverse middle of array that is not of odd length
 * @memberof Array.prototype
 */
Array.prototype.reverseMiddle = function() {
    const array = this.slice(1, this.length - 1);
    for(let i = 0; i < array.length; i += 2) {
        [array[i], array[i+1]] = [array[i+1], array[i]];
    }
    return [this[0], ...array, this[this.length - 1]];
};

/**
 * Returns the string in camelCase if it has snake_case
 * @memberof String.prototype
 */
String.prototype.toCamelCase = function() {
    return this.replace(/(_\w)/g, (m) => m[1].toUpperCase());
};

Number.prototype.maybeRound = function(precision) {
    return parseFloat(this.toFixed(precision));
};


/**
 * A class that should be filled with absolutely not useless stuff
 * @static
 */
class Util {
    constructor() {
        throw new Error("This class isn't supposed to be initialized");
    }

    /**
     * Gives you a nice Payday 2 requires text
     * @static
     * @param {String} type type of thing
     * @param {String} name name of thing
     * @param {Language} lang language instance
     * @returns {String}
     */
    static resolveRequire(type, name, lang) {
        return lang.get("system.requires." + type)({ rep: { name }});
    }

    /**
     * Sets new parameters in the current query string context
     * @static
     * @param {...String[]} args
     * @returns {URLSearchParams} query string
     */
    static setParams(...args) {
        const params = new URLSearchParams(window.location.search);
        for(const [key, value] of args) {
            params.set(key, value);
        }
        return params;
    }

    static makeState(lang, exp, tab) {
        const state = {
            skills: exp.skills.toJSON(),
            armor: exp.armor,
            perkDeck: exp.perkDeck,
            copycat: exp.copycat,
            copycat_mimic: exp.copycat_mimic,
            perk_deck_unlock: exp.perk_deck_unlock,
            throwable: exp.throwable,
            deployable: exp.deployable,
            deployableSecondary: exp.deployableSecondary,
            infamyDisabled: exp.infamyDisabled
        };
        if(tab) state.tab = tab;
        if(lang) state.lang = lang;
        return state;
    }

    /**
     * Used for filtering nodes
     * @callback filterCallback
     * @param {Node} value 
     * @param {Number} index 
     * @param {Node[]} array
     * @param {Object} thisArg
     */

    /**
     * Gives you the index of the node related to it's sibilings
     * @static
     * @param {Node} e 
     * @param {filterCallback} filter
     * @returns {Number}
     */
    static getNodeIndex(e, filter = () => true) {
        return [...e.parentNode.children].filter(filter).indexOf(e);
    }


    /**
     * Get parent element of rec times. Like parentElement(e, 2) = e.parentElement.parentElement
     * @static
     * @param {Element} e 
     * @param {Number=} rec 
     * @returns {Element}
     */
    static parentElement(e, rec = 1) {
        let parent = e;
        for(let i = 0; i < rec; i++) {
            parent = parent.parentElement;
        }
        return parent;
    }

    /**
     * Tells you if your touch id is in the touch list
     * @static
     * @param {TouchList} list 
     * @param {Number} id
     * @returns {false|Touch} 
     */
    static findTouch(list, id) {
        for(const touch of list) {
            if(touch.identifier === id) return touch;
        }
        return false;
    }
}

/**
 * An object representing a skill's state.
 * state = 1 if 'basic' version is unlocked. state = 2 if 'aced' version is unlocked.
 * @typedef {{state: Number}} SkillState
 */


/**
 * This is used to organize skills based on their subtrees or something like that y'know?
 * holds a map of {tier number : {skill name: skill state}}
 * (intended to make SkillMap less of a pain in the arse to use later on probably)
 * @extends {Map<Number, Map<String, Number>>}
 */
class SkillSubtree extends Map {

    constructor(){
        super([
            [1, new Map()],
            [2, new Map()],
            [3, new Map()],
            [4, new Map()]
        ]);
        /** holds the number of points invested in each tier
         * @type {Map<Number, Number>} tierPoints */
        this.tierPoints = new Map([
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0]
        ]);

        /**
         * The maximum tier we can use
         * @type {Number} 
         */
        this.maxTier = 1;

        /**
         * The number of points we have invested in this tree
         * @type {Number}
         */
        this.points = 0;
    }

    

    /**
     * Updates the specified tier to hold the skill with
     * the given name and its current state.
     * @param {Number} _tierNum
     * @param {String} _skillName 
     * @param {Number} _skillState 
     */
    setSkill(_tierNum, _skillName, _skillState){
        /**
         * this tier's skills
         * @type {Map<String, Number>}
         * @const */
        const tierSkills = this.get(_tierNum);

        tierSkills.set(_skillName, _skillState);
        this.set(_tierNum, tierSkills);
        this.__updateTierPoints2(_tierNum,tierSkills);
        this.__updateTotalPoints();
    }

    /**
     * DO NOT CALL THIS DIRECTLY (PLEASE CALL setSkill INSTEAD!)
     * @param {Number} _tierNum tier number 
     * @param {Map<String, Number>} _tierSkills map of {skill name: state} for the tier
     * @returns {SkillSubtree}
     * @inheritdoc
     */
    set(_tierNum, _tierSkills){
        super.set(_tierNum, _tierSkills);
        if (this.tierPoints === undefined){
            return;
        }

        // only call these if the tierpoints map has been created
        //this.__updateTierPoints2(_tierNum,_tierSkills);
        //this.__updateTotalPoints();
    }

    /**
     * use this to delete a skill if we don't know the tier of the skill rn
     * @param {String} _skillName 
     * @returns {Boolean}
     */
    deleteSkillUnknownTier(_skillName){
        let tierNum = 0;
        for(const [tnum, skills] in this){
            if (skills.has(_skillName)){
                tierNum = tnum;
                break;
            }
        }
        return this.deleteSkill(tierNum, _skillName);
    }

    /**
     * Removes a skill from the subtree.
     * @param {Number} _tierNum the tier number of the skill 
     * @param {String} _skillName the name of the skill
     * @returns {Boolean}
     */
    deleteSkill(_tierNum, _skillName){
        /**
         * this tier's skills
         * @type {Map<String, Number>}
         * @const */
        const tierSkills = this.get(_tierNum);
        const result = tierSkills.delete(_skillName);
        this.set(_tierNum, tierSkills);
        this.__updateTierPoints2(_tierNum,tierSkills);
        this.__updateTotalPoints();
        return result;
    }

    /**
     * Use this to refresh the points invested in a certain tier
     * (passing an existing reference to that tier's skills + states)
     * @param {Number} _tierNum the tier number we want to update 
     * @param {Map<String, Number>} _tierSkills the name:state map for the tier we're doing stuff with
     */
    __updateTierPoints2(_tierNum,_tierSkills){
        let points = 0;
        for (const skillState of [..._tierSkills.values()]){
            // points += System.SKILL_COST_PER_TIER[_tierNum][skillState];
            for (let i = 1; i <= skillState; i++){
                points += System.SKILL_COST_PER_TIER[_tierNum][i];
            }
        }
        this.tierPoints.set(_tierNum, points);
    }

    /**
     * Use this to refresh the points invested in a certain tier.
     * @param {Number} _tierNum the tier number we want to update 
     */
    __updateTierPoints(_tierNum){
        this.__updateTierPoints2(this.get(_tierNum));
    }
    
    /**
     * sets this.points to be the sum of each of the tierPoints values
     */
    __updateTotalPoints(){
        this.points = [...this.tierPoints.values()].reduce((total, tierPts) => total + tierPts, 0);
    }

    /**
     * Find out what the highest unlocked tier should be.
     * @param {Boolean} _infamyDisabled set this to true if we're using non-infamy thresholds
     * @returns {Number} the highest unlocked tier number (based on points invested) 
     */
    getMaximumUnlockedTier(_infamyDisabled){
        /**
         * this holds the costs to unlock each tier. 0-indexed.
         * each entry in this array is the total number of points needed for each tier
         * [t1 cost (0), t2 cost, t3 cost, t4 cost]
         * @type {Array<Number>}
         * @const */
        const tierCosts = System.getTierUtil(_infamyDisabled);

        let maxTier = 1;
        let investedPoints = 0;

        // we go through the tier costs array, skipping index 0 (we do indices 1-3)
        for(let i = 1; i < tierCosts.length; i++){
            investedPoints += this.tierPoints.get(i); // add Tier i points to total invested points
            if (investedPoints >= tierCosts[i]){
                // if we have invested enough points to unlock the next tier
                maxTier++; // increase maxTier
            } else{
                break; // otherwise, we stop where we are.
            }
        }

        this.maxTier = maxTier;
        return maxTier; // This is the maximum tier we can use.

    }


    /**
     * Use this method to go through all of the skills in this subtree,
     * and look for any skills which are invalid (at a higher tier than should be allowed)
     * @param {Boolean} _infamyDisabled true if infamy should be disabled, otherwise false.
     * @param {Number} [_maxTier = undefined] the maximum tier for the subtree (if undefined, will work that out on the fly)
     * @returns {Array[String]} names of all invalid skills (at a higher tier than we've unlocked)
     */
    getInvalidSkills(_infamyDisabled, _maxTier = undefined){
        /**
         * the highest tier that we can use based on point investment so far
         * @type {Number}
         * @const */
        const maxTier = (
            _maxTier === undefined
                ? this.getMaximumUnlockedTier(_infamyDisabled)
                : _maxTier
        );
        console.log(maxTier);
        //const maxTier = this.getMaximumUnlockedTier(_infamyDisabled);

        // if we've unlocked tier 4, we have nothing to worry about :)
        if (maxTier == 4){
            return [];
        }

        /**
         * list of all the names of the invalid skills (which shouldn't be unlocked)
         * @type {Array<String>}
         */
        let invalidSkillNames = [];

        [...this.keys()].filter(
            tierNum => tierNum > maxTier
        ).forEach(
            tierNum2 => invalidSkillNames.push(...this.get(tierNum2).keys())
        );
        
        return invalidSkillNames;
    }
    
}

/**
 * Map for storing skills that are active
 * @extends {Map<String, SkillState>}
 */
class SkillMap extends Map {
    constructor(...args) {
        super(...args);
        /** @type {Number} */
        this.points = 120;
        /** 
         * Holds the named subtrees for all the skills we have
         * @type {Map<String, SkillSubtree>}
         */
        this.subtrees = new Map();
    }
    
    /**
     * Mildly overrides the 'set' function to also categorize the skill into its subtree and tier
     * (for validation and stuff later on)
     * @param {String} skillName skill name
     * @param {SkillState} skillState skill state
     * @param {String} subtreeName name of the subtree that this skill is in
     * @param {Number} skillTier the tier of this skill
     * @returns {SkillMap}
     */
    set_subtree(skillName, skillState, subtreeName, skillTier){
        super.set(skillName, skillState);
        if (!this.subtrees.has(subtreeName)){
            this.subtrees.set(subtreeName, new SkillSubtree());
        }
        this.subtrees.get(subtreeName).setSkill(
            skillTier, skillName, skillState.state
        );
        return this;
    }

    /**
     * Mildly overrides the 'set' function to warn about not to using this directly.
     * @param {String} key 
     * @param {SkillState} value 
     * @returns {SkillMap}
     */
    set(key, value){
        console.warn("Please avoid using SkillMap.set, please use SkillMap.set_subtree instead if possible");
        super.set(key, value);
        return this;
    }

    /**
     * Used to delete a skill from the skill map and also from the subtree it's in
     * @param {String} skillName name of the skill to delete
     * @param {String} subtreeName name of the subtree it's in
     * @param {Number} [skillTier = undefined] the tier of the skill (or undefined if unknown, no biggie)
     * @returns {Boolean} whether or not the super.delete was successful
     */
    delete_subtree(skillName, subtreeName, skillTier){
        const result = super.delete(skillName);

        if (this.subtrees.has(subtreeName)){
            if (skillTier === undefined){
                this.subtrees.get(subtreeName).deleteSkillUnknownTier(
                    skillName
                );
            } else {
                this.subtrees.get(subtreeName).deleteSkill(
                    skillTier, skillName
                );
            }
        }
        return result;
    }

    /**
     * Mildly overrides the 'delete' function to warn about not to using this directly.
     * @param {String} key 
     * @returns {Boolean}
     */
    delete(key){
        console.warn("Please avoid using SkillMap.delete, please use SkillMap.delete_subtree instead if possible");
        return super.delete(key);
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
            if (value.state === 2) {
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

    
    

    /**
     * 
     */
    toJSON() {
        const obj = {};
        for(const [key, value] of this) {
            obj[key] = value;
        }
        return obj;
    }
}

// #region DBmapTypeDefs
/**
 * @typedef {{name: String, description: String, basic: Number,
 * ace: Number, tier: Number, subtree: String, tree: String}} SkillData
 */
// #endregion

/**
 * Map for storing all DBs
 * @extends {Map<String,Map<String,Object>>}
 * 
 */
class DBMap extends Map {

    /**
     * @inheritdoc
     * @param {String} key
     * @returns {Map<String, SkillData> | Map<String, Any> | undefined}
     */
    get(key){
        return super.get(key);
    }

    fetchAll() {
        const array = [];
        for(const [key] of this) {
            array.push(
                fetch(`./db/${key}.json`)
                    .then( res => res.json() )
                    .then( json => {
                        if(key === "skills" || key === "perk_decks") {
                            for(const prop in json) {
                                if(!json[prop].stats) continue;
                                if(key === "skills") {
                                    if(json[prop].stats.basic) DBMap.processModifiers(...json[prop].stats.basic);
                                    if(json[prop].stats.ace) DBMap.processModifiers(...json[prop].stats.ace);
                                } else {
                                    DBMap.processModifiers(...json[prop].stats);
                                }
                            }
                        }
                        else if (key === "perk_cards") {
                            const copycat_boosts = [];
                            const copycat_mimicry = [];
                            for (const prop in json){
                                if (json[prop].is_copycat_boost){
                                    copycat_boosts.push(json[prop]);
                                } else if (json[prop].copycat_mimicry_available){
                                    /**
                                     * TODO: if object has "copycat_description" and/or "copycat_stats",
                                     *  maybe push a copy of that object but with the description/stats
                                     *  overwritten with the copycat version of those things
                                     *  into the copycat_mimicry map?
                                     */
                                    copycat_mimicry.push(json[prop]);
                                }
                            }
                            this.set("copycat_boosts", new Map(Object.entries(copycat_boosts)));
                            this.set("copycat_mimicry", new Map(Object.entries(copycat_mimicry)));
                        }
                        this.set(key, new Map(Object.entries(json)));
                    })
            );
        }
        return Promise.all(array);
    }

    /**
     * The unlocks of the object containing the properties of the type above for it to be unlocked
     * @typedef {Object} StatModifier
     * @property {Number} id Unique number for override (simplest way i though to do it tbh)
     * @property {String} type The stat that is being modified
     * @property {String} part In what part of the formula it is
     * @property {String|Number} value Value to apply if is number. Value to make a function out of if it's an string (needs to return a number)
     * @property {String[]=} arguments Arguments that are stat names to apply to function if value is String
     * @property {String[]=} whitelist Armors that are in the whitelist
     * @property {String[]=} blacklist Armors that are in the blacklist
     * @property {Number[]=} overrides Modifiers that overrides
     */

    /**
     * Makes functions out of the stat modifier info
     * @param  {...StatModifier} mods 
     */
    static processModifiers(...mods) {
        for(const mod of mods) {
            if(!mod) continue;
            if(typeof mod.value === "string") {
                return Function.apply({}, [...mod.arguments, `return (${mod.value})`]);
            }
        }
    }
}

/**
 * Class object for management of the system functions (underlying system of keeping track of the build).   
 */
class System {

    /**
     * @param {import("./Builder").default} builder The Builder instance that instantiated this
     */
    constructor(builder) {
        /** 
         * The Builder instance that instantiated this
         * @type {import("./Builder").default} */
        this.builder = builder;
    }


    /**
     * Call this to (hopefully) validate all of the skills in the skillmap,
     * 
     * @param {String} [checkThisSubtree] the subtree we want to validate (or undefined to validate all of them at once) 
     */
    Validate_Skills(checkThisSubtree){
        /** @type {import("./Builder").Exp} */
        const exp = this.builder.exp;
        /** @type {SkillMap} */
        const skills = exp.skills;


        /** Names of all invalid skills
         * @type {Set<String>} */
        let allInvalidSkills = new Set();

        /** the name(s) of the subtree to check.
         * If we gave a subtree name, we will only check the named subtree.
         * Otherwise, we check all subtrees.
         * @type {Iterable<String>} */
        const treesToCheck = (checkThisSubtree === undefined ?
            skills.subtrees.keys() : [checkThisSubtree]
        );

        //console.log(exp);
        //console.log(exp.skills);
        //console.log(exp.skills.subtrees);

        for (const subtreeName of treesToCheck){
            /** @type {SkillSubtree} */
            const subTree = skills.subtrees.get(subtreeName);

            //console.log(subtreeName);
            //console.log(subTree);

            const invalidSubtreeSkills = subTree.getInvalidSkills(exp.infamyDisabled);
            console.log(invalidSubtreeSkills);

            for (const skillName of invalidSubtreeSkills){
                allInvalidSkills.add(skillName);
                this.Skill_Remove(skillName, true);
            }
            console.log(subTree);

            this.builder.gui.Subtree_MoveBackground(
                subtreeName,
                subTree.points
            );
        }
        this.builder.gui.Skill_UpdatePointsRemaining(exp.skills.points);

        // if any skills had to be removed
        if (allInvalidSkills.size > 0){
            if (allInvalidSkills.has("jack_of_all_trades")){
                this.builder.gui.HandleJoat(true);
            }
            // TODO: handle iron man ICTV stuff
            for(const skill in allInvalidSkills){
                this.builder.gui.HandleUnlocks({
                    type: "skill",
                    skill,
                    unlocks: this.builder.dbs.get("skills").get(skill).unlocks
                });
            }
        }
    }

    Update_Tier_Thresholds(){
        /** @type {import("./Builder").Exp} */
        const exp = this.builder.exp;
        //const skillStore = this.builder.dbs.get("skills");

        //console.log(exp.skills);
        //console.log(exp.subtrees);
        //console.log(Object.values(exp.subtrees));
        //console.log(Object.keys(exp.subtrees));

        
        // TODO: iterate through exp.subtrees, recalculate System.getSubtreeTierLevel(subtree.points, exp.infamyDisabled); 
        Object.entries(exp.subtrees).forEach(([name, tree]) => {
            //console.log(name);
            //console.log(tree);

            tree.tier = System.getSubtreeTierLevel(
                //tree.points,
                exp.skills.getTiersToFloorPoints(
                    3,
                    name,
                    exp.skills
                ),
                exp.infamyDisabled
            );
            //console.log(tree);

            // TODO: work out if there are any skills above the exp.subtree tier
            // TODO: remove those skills.
        });


        // TODO: update tier thresholds based on whether or not infamy should be disabled
        // TODO: remove newly-invalid skills from tiers if appropriate.


    }


    Skill_Add(skillId) {
        /**
         * @type {import("./Builder").Exp}
         */
        const exp = this.builder.exp;
        /** @type {SkillState} */
        const skill = exp.skills.get(skillId);
        /** @type {SkillData} */
        const skillStore = this.builder.dbs.get("skills").get(skillId);
        /** @type {import("./Builder").expSubtree} name of this skill's subtree */
        const subtree = exp.subtrees[skillStore.subtree];

        const skillTier = skillStore.tier;
        const currentTreeTier = subtree.tier;

        if (skillTier > currentTreeTier){
            console.error(`skill ID ${skillId} invalid.\n`+
                `Skill tier ${skillTier}, tree tier ${currentTreeTier}.\n` +
                `(only ${subtree.points} pts in tier)\nSkill has not been added.`
            );
            return false;
        }

        if (skill) { // If given skill is present in exp.skills, (is already basic) 
            if (exp.skills.points-skillStore.ace >= 0) {
                subtree.points += skillStore.ace;
                exp.skills.points -= skillStore.ace;
                skill.state = 2;
                exp.skills.set_subtree(
                    skillId,
                    skill,
                    skillStore.subtree,
                    skillStore.tier
                );
                subtree.tier = System.getSubtreeTierLevel(subtree.points, exp.infamyDisabled);
                //console.log(`${subtree.tier}, ${subtree.points}, ${this.builder.exp.subtrees[skillStore.subtree].tier}, ${this.builder.exp.subtrees[skillStore.subtree].points}`);
                return true; 
            }
        } else { 
            if (exp.skills.points-skillStore.basic >= 0) {
                subtree.points += skillStore.basic;
                exp.skills.points -= skillStore.basic;
                exp.skills.set_subtree(
                    skillId,
                    {state: 1},
                    skillStore.subtree,
                    skillStore.tier
                );
                subtree.tier = System.getSubtreeTierLevel(subtree.points, exp.infamyDisabled);
                //console.log(`${subtree.tier}, ${subtree.points}, ${this.builder.exp.subtrees[skillStore.subtree].tier}, ${this.builder.exp.subtrees[skillStore.subtree].points}`);
                return true; 
            }
        }

        return false;
    }

    /**
     * 
     * @param {String} skillId 
     * @param {Boolean} [fullyRemove = false] set this to 'true' if we want to fully remove the skill, regardless of it being aced/other reasons.
     * @returns 
     */
    Skill_Remove(skillId, fullyRemove = false) {
        /** @type {import("./Builder").Exp} */
        const exp = this.builder.exp;
        /** @type {SkillState} */
        const skill = exp.skills.get(skillId);
        /** @type {Map<String, SkillData>} */
        const skills = this.builder.dbs.get("skills");
        /** @type {SkillData} */
        const skillStore = skills.get(skillId);
        if (!skill) return false; // If the skill is not owned, do nothing 

        // if we aren't doing 'fullyRemove', we ensure that this won't lock any higher tiers of skills first.
        if (!fullyRemove){
            for (let i = skillStore.tier; i < 4; i++) {
                if (exp.skills.getTierPoints(i+1, skillStore.subtree, skills) !== 0) { // Check if the tier above the given skill's tier is empty, else keep looking till top
                    const tierPoints = exp.skills.getTiersToFloorPoints(i, skillStore.subtree, skills);

                    if (skill.state === 2) { // If removing the ace/basic points from the subtree makes the invested total go under the required for owned tiers, quit
                        if (tierPoints-skillStore.ace < this.constructor.getTierUtil(this.builder.exp.infamyDisabled)[i]) { 
                            return false; 
                        }
                    } else {
                        if (tierPoints-skillStore.basic < this.constructor.getTierUtil(this.builder.exp.infamyDisabled)[i]) {
                            return false; 
                        }
                    }
                }
            }
        }

        /** @type {import("./Builder").expSubtree} */
        const subtree = exp.subtrees[skillStore.subtree];
        if (skill.state === 2) {
            if (fullyRemove){
                subtree.points -= (skillStore.ace + skillStore.basic);
                exp.skills.points += (skillStore.ace + skillStore.basic);
                exp.skills.delete_subtree(
                    skillId, skillStore.subtree, skillStore.tier
                );
                console.log(exp.skills);

            } else {
                subtree.points -= skillStore.ace;
                exp.skills.points += skillStore.ace;
                skill.state = 1;
                exp.skills.set_subtree(skillId, skill, skillStore.subtree, skillStore.tier);
            }
        } else if (skill.state === 1) {
            subtree.points -= skillStore.basic;
            exp.skills.points += skillStore.basic;
            //exp.skills.delete(skillId);
            exp.skills.delete_subtree(skillId, skillStore.subtree, skillStore.tier);
        }

        subtree.tier = System.getSubtreeTierLevel(subtree.points, exp.infamyDisabled);

        return true; 
    }




    /**
     * Returns THIS.TIER_UTIL_NON_INFAMY if given truthy, or this.TIER_UTIL if given falsey/undefined
     * @param {Boolean} [infamyDisabled=False] should infamy be disabled yes or no
     * @returns {Array<Number>} TIER_UTIL_NON_INFAMY if truthy, TIER_UTIL if falsey
     */
    static getTierUtil(infamyDisabled){
        return infamyDisabled ? this.TIER_UTIL_NON_INFAMY : this.TIER_UTIL;
    }
    

    static getSubtreeTierLevel(subtreePoints, infamyDisabled) {
        const tier_array = this.getTierUtil(infamyDisabled);
        // Will never return `0`, only 1-3 or -1 for tier 4 - LIES!
        let subtreeTierLevel = tier_array.findIndex(tierPoints => subtreePoints <= tierPoints);
        if (subtreeTierLevel === -1) { subtreeTierLevel = tier_array.length; }
        else {
            // otherwise we need to increment the tier by 1 (as arrays are zero-indexed.)
            subtreeTierLevel++;
        }

        return subtreeTierLevel;
    }
}

/**
 * Array which keeps the necessary points for each tier with infamy
 * (0 for t1, 1 for t2, 3 for t3, 16 for t4)
 * @type {Array<Number>}
 */
System.TIER_UTIL = Object.freeze([0, 1, 3, 16]);

/**
 * Array which keeps the necessary NON-INFAMY points for each tier
 * (0 for t1, 1 for t2, 3 for t3, 18 for t4)
 * @type {Array<Number>}
 */
System.TIER_UTIL_NON_INFAMY = Object.freeze([0, 1, 3, 18]);

/**
 * Object that holds the aced/non-aced cost of skills in each tier.
 * schema: {tier: {1 : non-ace cost, 2: ace cost }} 
 * @type {Number : {Number: Number, Number: Number}}
 */
System.SKILL_COST_PER_TIER = Object.freeze({
    1: Object.freeze({1: 1, 2: 3}),
    2: Object.freeze({1: 2, 2: 4}),
    3: Object.freeze({1: 3, 2: 6}),
    4: Object.freeze({1: 4, 2: 8})
});

/**
 * A class that transform X movement to X scroll
 */
class XScrollTransformer {

    constructor() {
        this.down = false;
        this.contexts = [];
        this.curContext;

        document.addEventListener("mouseup", ev => {
            if(this.down && ev.button == 0) {
                ev.preventDefault();
                this.down = false;
            }
        });
        document.addEventListener("mousemove", ev => {
            if(this.down) this.curContext.element.scrollBy(ev.movementX * this.curContext.multiply, 0);
        }, { passive: true });
    }

    /**
     * Add element for transforming
     * @param {HTMLElement} element Element to listen to
     * @param {Number} [multiply=1] Multiplier for x movement that translates to scroll
     * @param {boolean} [propagate=true] Propagate mouse down event
     */
    addContext(element, multiply = 1, propagate = true) {
        const context = {element, propagate, multiply};
        this.contexts.push(context);

        element.addEventListener("mousedown", ev => {
            if(ev.button == 0) {
                this.down = true;
                this.curContext = context;
                if(!propagate && ev.target.closest(".pk_deck_cards > div")) ev.stopPropagation();
                ev.preventDefault();
            }
        });
    }
}

/**
 * @callback MobileEvent
 * @returns {void}
 */

class UIEventHandler {
    /**
     * 
     * @param {Object} obj
     * @param {HTMLElement} obj.element Element to handle
     * @param {MobileEvent} obj.hold Function for handling element when its being clicked down for 250ms
     * @param {MobileEvent} [obj.double] Function for handling double tap that means its touch only
     * @param {MobileEvent} [obj.click] Function for handling a simple click 
     */
    constructor({ 
        click = () => element.dispatchEvent(new MouseEvent("click", { detail: -1 })), 
        double = () => element.dispatchEvent(new MouseEvent("contextmenu", { detail: -1 })), 
        element, mobile, hold, propagate = false
    }) {    
        this.touchId = null;
        this.last = [];
        this.remaining = [];
        this.holding = false;
        this.didDouble = false;
        this.listen = false;
        /**
         * @param {MouseEvent | TouchEvent} ev
         */
        const start = ev => {
                if(ev instanceof MouseEvent) {
                    if(!propagate) ev.stopPropagation();
                    if(ev.button != 0) return;
                } else {
                    ev.stopImmediatePropagation();
                    if(this.touchId !== null) return;
                    const touch = ev.touches[0];
                    this.touchId = touch.identifier;
                    this.last = [touch.clientX, touch.clientY];
                }
                this.remaining = [
                    (document.documentElement.clientWidth * 2)/100,
                    (document.documentElement.clientHeight * 2)/100
                ];
                this.holding = setTimeout(() => {
                    this.holding = true;
                    this.touchId = null;
                    this.listen = false;
                    hold();
                }, 750);
                this.listen = true;
                
            },
            /**
             * @param {MouseEvent | TouchEvent} ev
             */
            move = ev => {
                if(!this.listen) return;
                if(ev instanceof MouseEvent) {
                    this.remaining[0] -= Math.abs(ev.movementX);
                    this.remaining[1] -= Math.abs(ev.movementY);
                } else {
                    const touch = Util.findTouch(ev.changedTouches, this.touchId);
                    if(!touch) return;
                    this.remaining[0] -= Math.abs(touch.clientX - this.last[0]);
                    this.remaining[1] -= Math.abs(touch.clientY - this.last[1]);
                    this.last = [touch.clientX, touch.clientY];
                }
                if(this.remaining.some(val => val <= 0)) {
                    clearTimeout(this.holding);
                    this.touchId = null;
                    this.listen = false;
                }
            },
            /**
             * @param {MouseEvent | TouchEvent} ev
             */
            stop = ev => {
                if(!this.listen
                || (ev instanceof MouseEvent && ev.button !== 0) 
                || (ev.touches && Util.findTouch(ev.touches, this.touchId))
                ) return;
                ev.stopImmediatePropagation();
                clearTimeout(this.holding);

                if(ev instanceof MouseEvent) {
                    this.listen = false;
                    this.touchId = null;
                    return;
                } else {
                    ev.preventDefault();
                }

                if(this.didDouble) {
                    this.didDouble = false;
                    this.touchId = null;
                    this.listen = false;
                    double();
                    return;
                }

                this.didDouble = true;
                setTimeout(() => { 
                    if(this.didDouble) {
                        this.listen = false;
                        this.touchId = null;
                        this.didDouble = false;
                        click();
                    }
                }, 300);
            };

        element.addEventListener("touchstart", start);
        element.addEventListener("touchcancel", () => this.touchId = null);
        element.addEventListener("touchmove", move);
        element.addEventListener("touchend", stop);
        if(mobile) {
            element.addEventListener("mouseup", stop);
            element.addEventListener("mousemove", move);
            element.addEventListener("mousedown", start);
        }
    }
}

export { Util as default, SkillMap, DBMap, System, XScrollTransformer, UIEventHandler };
