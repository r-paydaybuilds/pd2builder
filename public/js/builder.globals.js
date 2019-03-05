/* eslint no-unused-vars: "off" */

class extMap extends Map {
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

            if (skill.subtree === subtree) {
                if (skill.tier === tier) {
                    if (value.state === "aced") {
                        points += skill.ace + skill.basic;
                    }
                    else {
                        points += skill.basic;
                    } 
                }
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

/**
 * Class object for management of the system functions (underlying system of keeping track of the build).   
 */
class System {
    constructor() {

    }

    Skill_Add(skillId) {
        const skill = exp.skills.get(skillId);
        const skillStore = skills.get(skillId);
        const subtree = exp.subtrees[skillStore.subtree];

        if (skill) { // If given skill is present in exp.skills, (is already basic) 
            if (exp.skills.points-skillStore.ace >= 0) {
                subtree.points += skillStore.ace;
                exp.skills.points -= skillStore.ace;
                skill.state = "aced";
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;

                return true; 
            }
        } else { 
            if (exp.skills.points-skillStore.basic >= 0) {
                subtree.points += skillStore.basic;
                exp.skills.points -= skillStore.basic;
                exp.skills.set(skillId, { state: "basic" });
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;

                return true; 
            }
        }

        return false;
    }

    Skill_Remove(skillId) {
        const skill = exp.skills.get(skillId);
        const skillStore = skills.get(skillId);
        if (!skill) return false; // If the skill is not owned    

        for (let i = skillStore.tier; i < 4; i++) {
            if (exp.skills.getTierPoints(i+1, skillStore.subtree, skills) !== 0) { // Check if the tier above the given skill's tier is empty, else keep looking till top
                const tierPoints = exp.skills.getTiersToFloorPoints(i, skillStore.subtree, skills);
                
                if (skill.state === "aced") { // If removing the ace/basic points from the subtree makes the invested total go under the required for owned tiers, quit
                    if (tierPoints-skillStore.ace < tiers2[i]) { 
                        return false; 
                    }
                }
                else {
                    if (tierPoints-skillStore.basic < tiers2[i]) {
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
            subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
        } 
        else if (skill.state === "basic") {
            subtree.points -= skillStore.basic;
            exp.skills.points += skillStore.basic;
            exp.skills.delete(skillId);
            subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
        }

        return true; 
    }
}

const exp = {
    skills: new extMap(),
    subtrees: {
        medic: { tier: 1, points: 0 },
        controller: { tier: 1, points: 0 },
        sharpshooter: { tier: 1, points: 0 },
        shotgunner: { tier: 1, points: 0 },
        tank: { tier: 1, points: 0 },
        ammo_specialist: { tier: 1, points: 0 },
        engineer: { tier: 1, points: 0 },
        breacher: { tier: 1, points: 0 },
        oppressor: { tier: 1, points: 0 },
        shinobi: { tier: 1, points: 0 },
        artful_dodger: { tier: 1, points: 0 },
        silent_killer: { tier: 1, points: 0 },
        gunslinger: { tier: 1, points: 0 },
        revenant: { tier: 1, points: 0 },
        brawler: { tier: 1, points: 0 }
    },
    armor: null,
    perkDeck: null,
    perkDeckPrevious: null,
    throwable: null,
    deployable: null, 
    deployableSecondary: null
};

const tiers = [0, 1, 2, 13];
const tiers2 = [0, 1, 3, 16];
const trees = ["mastermind", "enforcer", "technician", "ghost", "fugitive"];

const sys = new System(); 

let skills;
let perkDecks; 
let perkCards; 
let previous;

jQuery.fn.reverse = [].reverse;

fetch("/db/skills.json").then(res => res.json()).then(json => { skills = new Map(Object.entries(json));});
fetch("/db/perk_decks.json").then(res => res.json()).then(json => { perkDecks = new Map(Object.entries(json));});
fetch("/db/perk_cards.json").then(res => res.json()).then(json => { perkCards = new Map(Object.entries(json));});