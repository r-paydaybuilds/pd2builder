/* eslint no-unused-vars: "off" */

class extMap extends Map {
    constructor(...args) {
        super(...args);
        this.points = 120;
    }

    getTierPoints(tier, subtree, skills) {
        let points = 0;
        for(const [key,value] of this) {
            const skill = skills.get(key);
            if(skill.subtree !== subtree) continue;
            if(skill.tier !== tier) continue;
            points += (value.state === "aced") ? skill.ace + skill.basic : skill.basic;
        }
        return points;
    }

    getTiersToFloorPoints(tier, subtree, skills) {
        let points = 0;
        for(let i = 0; i<=tier; i++)
            points += this.getTierPoints(i, subtree, skills);
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

        if (skill) {
            if (exp.skills.points-skillStore.ace >= 0) {
                const subtree = exp.subtrees[skillStore.subtree];

                subtree.points += skillStore.ace;
                exp.skills.points -= skillStore.ace;
                skill.state = "aced";
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
            }
        } else {
            if (exp.skills.points-skillStore.basic >= 0) {
                const subtree = exp.subtrees[skillStore.subtree];

                subtree.points += skillStore.basic;
                exp.skills.points -= skillStore.basic;
                exp.skills.set(skillId, { state: "basic" });
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
            }
        }
    }

    Skill_Remove(skillId) {
        const skill = exp.skills.get(skillId);
        const skillStore = skills.get(skillId);
        if (!skill) return;        

        for (let i = skillStore.tier+1; i < 5; i++) {
            if (exp.skills.getTierPoints(i, skillStore.subtree, skills) === 0) {
                const tierPoints = exp.skills.getTiersToFloorPoints(i-1, skillStore.subtree, skills);
                
                if (tierPoints - (skill.state === "aced" ? skillStore.ace : skillStore.basic) < tiers2[i-1]) return;
            }
        }
        
        if (skill.state === "aced") {
            const subtree = exp.subtrees[skillStore.subtree];

            subtree.points -= skillStore.ace;
            exp.skills.points += skillStore.ace;
            skill.state = "basic";
            subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
        } 
        else if (skill.state === "basic") {
            const subtree = exp.subtrees[skillStore.subtree];

            subtree.points -= skillStore.basic;
            exp.skills.points += skillStore.basic;
            exp.skills.delete(skillId);
            subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
        }
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
let previous;

jQuery.fn.reverse = [].reverse;

fetch("/db/skills.json").then(res => res.json()).then(json => { skills = new Map(Object.entries(json));});
fetch("/db/perk_decks.json").then(res => res.json()).then(json => { perkDecks = new Map(Object.entries(json));});