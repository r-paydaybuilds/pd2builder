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
    armor: null
};

const tiers = [0,1,2,13];
const tiers2 = [0,1,3,16];
const trees = ["mastermind", "enforcer", "technician", "ghost", "fugitive"];

let skills;
let previous;

fetch("/js/skills.json").then(res => res.json()).then(json => { skills = new Map(Object.entries(json));});