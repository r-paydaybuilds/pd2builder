import { skillMap, System, dbMap } from "./Util.js";
import GUI from "./GUI.js";
import IO from "./IO.js";
import Language from "./Language.js";

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

    loadLanguage(obj) {
        const self = this;
        this.lang = new Language(obj);

        $(".navbar-brand").text(this.lang.get("system.name"));
        $(".navbar-link").text(this.lang.get("system.home"));

        $("#tab_page_buttons > button").each(function() {
            $(this).text(self.lang.get(`system.${$(this).data("name")}.title`));
        });

        for(const value of Builder.TREES) {
            $(`#sk_${value}_button`).text(this.lang.get(`system.skills.${value}.title`));
        }

        for(const [key] of this.dbs.get("skills")) {
            $(`#${key}`).parent().next().text(this.lang.get(`skills.${key}.name`).toLocaleUpperCase());
        }

        $(".sk_points_remaining > p").html(this.lang.get("system.skills.remaining") + $(".sk_points_remaining p span")[0].outerHTML);

        for(const [key] of this.dbs.get("perk_decks")) {
            $(`#${key} > p`).text(this.lang.get(`perk_decks.${key}.name`).toLocaleUpperCase());
        }

        $("#io_save_r p").text(this.lang.get("system.share.description"));
        $("#io_copy_btn").text(this.lang.get("system.share.copy"));

        $("#io_other_r > p").text(this.lang.get("system.credits.title"));
        $("#io_other_r > .font-size-16 p:first-child").text(this.lang.get("system.credits.p1"));
        $("#io_other_r > .font-size-16 p:last-child").html(this.lang.get("system.credits.p2")({
            ref: [x => `<a href="https://github.com/r-paydaybuilds/pd2builder/blob/master/CONTRIBUTORS.md">${x}</a>`]
        }));
        $("#io_other_r > .font-size-14").children().html(this.lang.get("system.credits.license")({
            ref: [x => `<a href="https://opensource.org/licenses/MIT">${x}</a>`]
        }));
        $(".io_widgets > p").text(this.lang.get("system.credits.reach"));
    }
}

/**
 * Array that keeps the name of each skill tree
 * @type {Array}
 */
Builder.TREES = ["mastermind", "enforcer", "technician", "ghost", "fugitive"];
