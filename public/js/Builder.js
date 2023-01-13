import { SkillMap, System, DBMap, XScrollTransformer, CopycatBoosts } from "./Util.js";
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
            copycat_mimicry: null,
            perk_deck_unlock: null,
            throwable: null,
            deployable: null, 
            deployableSecondary: null
        };



        /**
         * Some sort of class to hold active copycat boosts I guess?
         * @type {CopycatBoosts} 
         */
        this.copycat = new CopycatBoosts(this);


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
            ["copycat_boosts",null],
            ["copycat_mimicry",null],
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
     * setting the 'perk_deck_unlock' value of it to
     * either the id of the equipped perk deck
     * or the id of the equipped copycat mimicry.mimics if the perk deck is 'copycat'
     */
    perkDeckUnlockHandler()
    {

        if (this.exp.perkDeck === "copycat"){
            if (this.exp.copycat_mimicry === null){
                this.exp.perk_deck_unlock = null;
                return;
            }
            //console.log(this.exp.copycat_mimicry);
            //console.log(this.dbs.get(`copycat_mimicry`));
            //console.log(this.dbs.get(`copycat_mimicry`).get(this.exp.copycat_mimicry));
            //console.log(this.dbs.get(`copycat_mimicry`).get(this.exp.copycat_mimicry).mimics);
            this.exp.perk_deck_unlock = this.dbs.get(`copycat_mimicry`).get(this.exp.copycat_mimicry).mimics;
        } else {
            this.exp.perk_deck_unlock = this.exp.perkDeck;
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


    changeCardBoost = function(cardElement, newBoost){
        const boostLabel = cardElement.querySelector("span").innerText.split("/");

        const oldBoost = boostLabel[0];
    
        if (newBoost === undefined){
            newBoost = ++boostLabel[0];
            newBoost = (newBoost > boostLabel[1]) ? 1 : newBoost;
        } else if (newBoost <= 0 || newBoost > boostLabel[1]){
            newBoost = 1;
        }
    
        // Mockup of functionality
        cardElement.querySelector("span").innerText = (newBoost) + "/" + boostLabel[1];
        
        const isMimicry = !!(this.dbs.get("perk_cards").get(cardElement.id).has_mimicry_boost);

        if (isMimicry){

            /*
            const oldMimic = [...this.dbs.get("copycat_mimicry").entries()][oldBoost-1][1];
            if (oldMimic.throwable){
                this.gui.Throwable_Lock(document.getElementById(oldMimic.throwable));
            }
            */

            const thisMimic = [...this.dbs.get("copycat_mimicry").entries()][newBoost-1];

            this.exp.copycat_mimicry = thisMimic[0];

            /*
            if (thisMimic[1].throwable){
                const thisThrow = thisMimic[1].throwable;
                this.gui.Throwable_Unlock(document.getElementById(thisThrow));
                this.gui.Throwable_Select(document.getElementById(thisThrow));
                this.exp.throwable = thisThrow;
            }
            */
        }

        this.exp.copycat[cardElement.id] = (
            (isMimicry)
            ?   [...this.dbs.get("copycat_mimicry").entries()][newBoost-1][0]
            :   [...this.dbs.get("copycat_boosts").entries()][newBoost-1][0]
        );

        this.perkDeckUnlockHandler();

        this.io.GetEncodedBuild();

    }
}

/**
 * Array that keeps the name of each skill tree
 * @type {Array}
 */
Builder.TREES = ["mastermind", "enforcer", "technician", "ghost", "fugitive"];
