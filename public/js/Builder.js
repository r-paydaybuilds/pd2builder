import { SkillMap, System, DBMap } from "./Util.js";
import GUI from "./GUI.js";
import IO from "./IO.js";
import Language from "./Language.js";
import Stats from "./Stats.js";

/**
 * Singleton class containing million of things (gangs of four accepts this)
 */
export default class Builder {
    constructor(mobile = false) {
        /**
         * An object containing most info that should be exported
         */
        this.exp = {
            skills: new SkillMap(),
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
            deployableSecondary: null,
            primary: {
                value: null,
                mods: []
            },
            secondary: {
                value: null,
                mods: []
            }
        };

        /**
         * The stats manager
         * @type {Stats}
         */
        this.stats = new Stats(this);
        
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
         * @type {DBMap}
         */
        this.dbs = new DBMap([
            ["skills", null],
            ["perk_decks", null],
            ["perk_cards", null],
            ["deployables", null],
            ["throwables", null],
            ["armors", null],
            ["primaries", null]
        ]);
        
        /**
         * The promise of the fetching of all databases
         * @type {Promise<Object[]>}
         */
        this.fetchPromises = this.dbs.fetchAll();

        /**
         * Is this mobile
         * @type {Boolean}
         */
        this.mobile = mobile;

        /**
         * Used for requesting strings of the used language
         * @type {Language}
         */
        this.lang;
    }

    loadLanguage(obj, lang) {
        this.lang = new Language(obj, lang);
        document.documentElement.setAttribute("lang", lang);

        document.querySelectorAll(".arm_icon > div, .th_icon > div, .dp_icon > div").forEach(e =>
            e.setAttribute("data-equip", this.lang.get("system.equip"))
        );
        document.querySelectorAll(".dp_icon > div").forEach(e => {
            e.setAttribute("data-primary", this.lang.get("system.primary"));
            e.setAttribute("data-secondary", this.lang.get("system.secondary"));
        });
        for(const [key] of this.dbs.get("perk_decks")) {
            document.querySelector(`#${key} p`).textContent = this.lang.get(`perk_decks.${key}.name`).toLocaleUpperCase();
            const query = document.querySelector(`#${key}.pk_selected p`);
            if(query) query.textContent = `${this.lang.get("system.equipped")}: ${this.lang.get(`perk_decks.${key}.name`).toLocaleUpperCase()}`;
        }
    
        for(const [key] of this.dbs.get("skills")) {
            document.getElementById(key).parentElement.nextElementSibling.textContent = this.lang.get(`skills.${key}.name`).toLocaleUpperCase();
        }
        document.querySelector(".sk_points_remaining > p").innerHTML = this.lang.get("system.skills.remaining") + document.querySelector(".sk_points_remaining p span").outerHTML;

        this.gui.Tree_ChangeTo(document.querySelector(".sk_tree_button_active").id.replace("button", "container"));

        document.querySelectorAll("[data-lang]").forEach(e => {
            const lang = this.lang.get(e.dataset.lang);
            e.innerHTML = Language.ref.has(e.dataset.lang) ? lang(Language.ref.get(e.dataset.lang)) : lang;
        });
        GUI.COLOR_PATTERN = new RegExp(this.lang.get("system.colors"), "g");
    }
}

/**
 * Array that keeps the name of each skill tree
 * @type {Array}
 */
Builder.TREES = ["mastermind", "enforcer", "technician", "ghost", "fugitive"];
