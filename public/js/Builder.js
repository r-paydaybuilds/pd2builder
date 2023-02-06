import { SkillMap, System, DBMap, XScrollTransformer } from "./Util.js";
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
            copycat: {
                tactical_reload: null,
                head_games: null,
                is_this_your_bullet: null,
                grace_period: null,
                mimicry: null
            },
            /* perkDeckUnlock is used to lock/unlock perk deck throwables
            (specified as the 'requirement' in throwables.json).
            Updated via calling builder.perkDeckUnlockHandler()
            */
            perkDeckUnlock: null,
            throwable: null,
            deployable: null, 
            deployableSecondary: null
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
         * The databases where you can find info of each type of thing
         * @type {DBMap}
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
         * Util class that transforms X movement to X scrolling
         * @type {XScrollTransformer}
         */
        this.scrollTransformer = new XScrollTransformer();
        
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

        // and also calls the perkDeckUnlockHandler thingy
        this.perkDeckUnlockHandler();
    }


    /**
     * Validates the 'exp' object
     * setting the 'perkDeckUnlock' value of it to
     * either the id of the equipped perk deck
     * or the id of the equipped copycat mimicry.mimics if the perk deck is 'copycat'
     */
    perkDeckUnlockHandler()
    {

        if (this.exp.perkDeck === "copycat"){
            if (this.exp.copycat.mimicry === null){
                this.exp.perkDeckUnlock = null;
                return;
            }
            this.exp.perkDeckUnlock = this.dbs.get("copycat_mimicry").get(this.exp.copycat.mimicry).mimics;
        } else {
            this.exp.perkDeckUnlock = this.exp.perkDeck;
        }

    }

    /**
     * Loads language to the Builder page
     * @param {string} curLang Current lang that is being sued
     */
    loadLanguage(curLang) {
        document.documentElement.setAttribute("lang", curLang);

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


    /**
     * Give this sucker a copycat perk card (and the number of the new boost to give it (or don't give it to increment the boost number))
     * and boom it will change that card to the new boost and update the backendy logic stuff to take that boost into account too.
     * 
     * very epic I know :)
     * @param {Element} cardElement 
     * @param {number} newBoost new boost number to use
     * (if not given, increments the current boost number by 1. If -1 is given, decrements current boost number by 1)
     */
    changeCardBoost(cardElement, newBoost = undefined){
        //const boostLabel = cardElement.querySelector("span").innerText.split("/");


        const boost_quantity = cardElement.querySelector(".copycat_boosts_num").innerText;

        if (newBoost === -1){
            newBoost = --cardElement.querySelector(".copycat_current_num").innerText;
            newBoost = (newBoost <= 0) ? boost_quantity : newBoost;
        } else if (newBoost === undefined){
            newBoost = ++cardElement.querySelector(".copycat_current_num").innerText;
            newBoost = (newBoost > boost_quantity) ? 1 : newBoost;
        } else if (newBoost <= 0 || newBoost > boost_quantity){
            newBoost = 1;
        }
    
        
        cardElement.querySelector(".copycat_current_num").innerText = newBoost;
        
        const isMimicry = !!(this.dbs.get("perk_cards").get(cardElement.id).has_mimicry_boost);

        /*
        const newBoostID = (
            (isMimicry)
            ?   [...this.dbs.get("copycat_mimicry").entries()]
            :   [...this.dbs.get("copycat_boosts").entries()]
        )[newBoost-1][0];
        this.exp.copycat[cardElement.id] = newBoostID;
        */

        this.exp.copycat[cardElement.id] = (
            isMimicry ?
                [...this.dbs.get("copycat_mimicry").entries()] :
                [...this.dbs.get("copycat_boosts").entries()]
        )[newBoost-1][0];

        this.perkDeckUnlockHandler();

        this.io.GetEncodedBuild();

    }
}

/**
 * Array that keeps the name of each skill tree
 * @type {Array}
 */
Builder.TREES = ["mastermind", "enforcer", "technician", "ghost", "fugitive"];
