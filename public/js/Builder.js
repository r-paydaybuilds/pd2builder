import { SkillMap, System, DBMap } from "./Util.js";
import GUI from "./GUI.js";
import IO from "./IO.js";
import Language from "./Language.js";

/**
 * Singleton class containing million of things (gangs of four accepts this)
 */
export default class Builder {
    constructor(mobile = false) {
        /**
         * An object containing most info that should be exported
         * @type {Object}
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
        this.dbs = new DBMap([
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

        document.getElementsByTagName("body")[0].className = lang;

        document.getElementsByClassName("navbar-brand")[0].textContent = this.lang.get("system.name");
        document.getElementsByClassName("nav-link")[0].textContent = this.lang.get("system.home");

        document.querySelectorAll("#tab_page_buttons > button").forEach(e => {
            e.textContent = this.lang.get(`system.${e.dataset.name}.title`);
        });

        document.querySelectorAll(".arm_icon > div, .th_icon > div, .dp_icon > div").forEach(e =>
            e.setAttribute("data-equip", this.lang.get("system.equip"))
        );
        document.querySelectorAll(".dp_icon > div").forEach(e => {
            e.setAttribute("data-primary", this.lang.get("system.primary"));
            e.setAttribute("data-secondary", this.lang.get("system.secondary"));
        });
        for(const value of Builder.TREES) {
            document.getElementById(`sk_${value}_button`).textContent = this.lang.get(`system.skills.${value}.title`);
        }

        for(const [key] of this.dbs.get("skills")) {
            document.getElementById(key).parentElement.nextElementSibling.textContent = this.lang.get(`skills.${key}.name`).toLocaleUpperCase();
        }

        document.querySelector(".sk_points_remaining > p").innerHTML = this.lang.get("system.skills.remaining") + document.querySelector(".sk_points_remaining p span").outerHTML;

        for(const [key] of this.dbs.get("perk_decks")) {
            document.querySelector(`#${key} > p`).textContent = this.lang.get(`perk_decks.${key}.name`).toLocaleUpperCase();
            const query = document.querySelector(`#${key}.pk_selected > p`);
            if(query) query.textContent = `${this.lang.get("system.equipped")}: ${this.lang.get(`perk_decks.${key}.name`).toLocaleUpperCase()}`;
        }

        document.querySelector("#io_save_r p").textContent = this.lang.get("system.share.description");
        document.getElementById("io_copy_btn").textContent = this.lang.get("system.share.copy");

        document.querySelector("#io_other_r > p").textContent = this.lang.get("system.credits.title");
        document.querySelector("#io_other_r > .font-size-16 p:first-child").textContent = this.lang.get("system.credits.p1");
        document.querySelector("#io_other_r > .font-size-16 p:last-child").innerHTML = this.lang.get("system.credits.p2")({
            ref: [x => `<a href="https://github.com/r-paydaybuilds/pd2builder/blob/master/CONTRIBUTORS.md">${x}</a>`]
        });
        document.querySelector("#io_other_r > .font-size-14").children[0].innerHTML = this.lang.get("system.credits.license")({
            ref: [x => `<a href="https://opensource.org/licenses/MIT">${x}</a>`]
        });
        document.querySelector(".io_widgets > p").textContent = this.lang.get("system.credits.reach");
        
        GUI.COLOR_PATTERN = new RegExp(this.lang.get("system.colors"), "g");
    }
}

/**
 * Array that keeps the name of each skill tree
 * @type {Array}
 */
Builder.TREES = ["mastermind", "enforcer", "technician", "ghost", "fugitive"];
