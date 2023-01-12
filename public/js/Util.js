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
            throwable: exp.throwable,
            deployable: exp.deployable,
            deployableSecondary: exp.deployableSecondary
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
 * Map for storing skills that are active
 * @extends {Map}
 */
class SkillMap extends Map {
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

/**
 * Class object for holding the copycat boosts
 */
class CopycatBoosts {

    constructor(builder){
        /**
         * The Builder instance that instantiated this
         * @type {Builder}
         */
        this.builder = builder;

        this.boostA = 1;
        this.boostB = 1;
        this.boostC = 1;
        this.boostD = 1;
        this.mimic = 1;
    }

    isCopycatActive(){
        return this.builder.exp.perkDeck === "copycat";
    }

    

}

/**
 * Map for storing all DBs
 * @extends {Map<String,Map<String,Object>>}
 * 
 */
class DBMap extends Map {
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
                skill.state = 2;
                subtree.tier = System.getSubtreeTierLevel(subtree.points);

                return true; 
            }
        } else { 
            if (exp.skills.points-skillStore.basic >= 0) {
                subtree.points += skillStore.basic;
                exp.skills.points -= skillStore.basic;
                exp.skills.set(skillId, { state: 1 });
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
                
                if (skill.state === 2) { // If removing the ace/basic points from the subtree makes the invested total go under the required for owned tiers, quit
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
        if (skill.state === 2) {
            subtree.points -= skillStore.ace;
            exp.skills.points += skillStore.ace;
            skill.state = 1;
        } else if (skill.state === 1) {
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

export { Util as default, SkillMap, DBMap, System, XScrollTransformer, UIEventHandler, CopycatBoosts };
