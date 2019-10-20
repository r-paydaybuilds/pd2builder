import { skillMap, System, dbMap } from "./Util.js";
import GUI from "./GUI.js";
import IO from "./IO.js";

/**
 * Singleton class containing million of things (gangs of four accepts this)
 */
export default class Builder {
    constructor() {
        /**
         * An object containing most info that should be exported
         * @type {Object}
         */
        this.exp = {
            skills: new skillMap(),
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
            throwable: null,
            deployable: null, 
            deployableSecondary: null
        };
        
        /**
         * The System that manages the Skills
         * @type {System}
         */
        this.sys = new System(this);
        
        /**
         * The IO that exports and imports data outside of the UI itself
         * @type {IO}
         */
        this.io = new IO(this);

        /**
         * The GUI that manages CSS and HTML part of the code
         * @type {GUI}
         */
        this.gui = new GUI(this);
        
        /**
         * The Databases where you can find info of each type of thing
         * @type {dbMap}
         */
        this.dbs = new dbMap([
            ["skills", null],
            ["perk_decks", null],
            ["perk_cards", null],
            ["deployables", null],
            ["throwables", null],
            ["armors", null]
        ]);
        
        /**
         * The promise of the fetching of all databases
         * @type {Promise<Array>}
         */
        this.fetchPromises = this.dbs.fetchAll();
    }
}

/**
 * Array that keeps the name of each skill tree
 * @type {Array}
 */
Builder.TREES = ["mastermind", "enforcer", "technician", "ghost", "fugitive"];
