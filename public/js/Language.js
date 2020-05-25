const langs = new Map([["en-us", "English (American)"], ["ru-ru", "Russian"], ["zh-cn", "Simplified Chinese"]]);
let defaultLang = "en-us";

/**
 * Class for the use of language files
 */
export default class Language {
    /**
     * Class used for loading up a language
     * @param {HTMLSelectElement} selectElement The element to listen to
     */
    constructor(selectElement) {
        /**
         * An object filled with strings, functions and more objects
         * @type {Object}
         */
        this.dictionary;

        /**
         * BCP-47 language version currently being used
         * @type {String}
         */
        this.used;

        /**
         * Element listening to
         * @type {HTMLSelectElement}
         */
        this.select = selectElement;
    }

    /**
     * Starts handling select element
     * @param {loadCallback} callback Callback ran each time a new language is chosen
     * @param {Object=} thisArg Binds the callback to this object
     * @returns {Promise<Object>}
     */
    handleSelect(callback, thisArg) {
        let fetchLang, curLang;
        const params = new URLSearchParams(window.location.search);
        // Fill the select node
        for(const [langKey, langName] of langs) {
            const option = new Option(langName, langKey);
            this.select.appendChild(option);
        }

        const langKeys = [...langs.keys()];
        // If a param with lang has been included, force that one
        if(params.has("lang") && langs.has(params.get("lang"))) {
            const lang = params.get("lang");
            curLang = lang;
            localStorage.setItem("lang", lang);
        // If user already configured a lang use that one
        } else if(localStorage.getItem("lang")) {
            curLang = localStorage.getItem("lang");
        } else {
            // Check if we have the lang currently being used in the PC
            if(langs.has(navigator.language.toLowerCase())) {
                defaultLang = navigator.language;
            // Check if we have a variant of such 
            } else if(langKeys.some(langKey => langKey.startsWith(navigator.language.split("-")[0]) )) {
                defaultLang = langKeys.find(langKey => 
                    langKey.startsWith(navigator.language.split("-")[0])
                );
            } else if(navigator.languages) {
                // Check if we even have any of the languages the PC has
                defaultLang = navigator.languages.find(e => langs.has(e.toLowerCase())) 
                    // Then check if we have any other variants of the languages that the PC has
                    || langKeys.find(langKey => navigator.languages.some(navLang => langKey.startsWith(navLang.split("-")[0]) ))
                    // and then if nothing worked, just go for the already default language
                    || defaultLang;
            }

            defaultLang = defaultLang.toLowerCase(),
            curLang = defaultLang;
        }
        // Fetch it and put it as default on select
        fetchLang = fetch(`./lang/${curLang}.json`).then(res => res.json());
        this.select.value = curLang;
        this.used = curLang;

        // Listen event for when select is changed
        if(thisArg !== undefined) callback = callback.bind(thisArg);
        this.select.addEventListener("change", async (e) => {
            const choosenLang = e.target.value;
            localStorage.setItem("lang", choosenLang);
            this.used = choosenLang;
            this.loadDictionary(await fetch(`./lang/${choosenLang}.json`).then(res => res.json()));
            callback(choosenLang);
        });

        return fetchLang;
    }

    /**
     * Loads an object that contains strings and objects
     * @param {Object} lang
     */
    loadDictionary(obj) {
        for(const prop in obj) {
            const thing = obj[prop];
            if(typeof thing === "string") {
                Language.LOCATEREGEX.lastIndex = 0;
                const [,...res] = Language.LOCATEREGEX.exec(thing) || [];
                if(res.length === 0) continue;
                obj[prop] = obj => Language.refFormat(Language.replaceFormat(thing, obj.rep), obj.ref);
            } else {
                this.loadDictionary(thing);
            }
        }
        this.dictionary = obj;
    }

    /**
     * Returns the requested object or string
     * @param {String} loc Location of the wanted value
     * @returns {Object}
     */
    get(loc = "") {
        const array = loc.split(".");
        let res = this.dictionary;
        for(const value of array) {
            res = res[value];
        }
        return res;
    }

    /**
     * Function to be used when the variable needs to be replaced
     * @static
     * @type {Function}
     * @param {String} x Replacement text
     * @param {String} variable Name of variable
     * @param {String} text Original Text
     * @returns {String}
     */
    static replaceFormat(text, obj) {
        for(const prop in obj) {
            text = text.replace(new RegExp(`%{${prop}}`, "g"), obj[prop]);
        }
        return text;
    }

    /**
     * Used for adapting a certain text to the context
     * @callback parser
     * @param {String} text The text that you need to adapt to
     * @returns {String}
     */

    /**
     * Function to be used when the text has to be referenced
     * @static
     * @type {Function}
     * @param {String} text Original Text
     * @param {Array<parser>} args Replacement function that returns text for each one
     * @returns {String}
     */
    static refFormat(text, args) {
        Language.REFREGEX.lastIndex = 0;
        const [,...replace] = Language.REFREGEX.exec(text) || [];
        if(Array.isArray(args) && replace.length !== args.length) throw new Error("The array should have the same amount of functions as the lang text has variable as!");
        for(let i = 0; i < replace.length; i++) {
            text = text.replace(new RegExp(`&{${replace[i]}}`), args[i](replace[i]));
        }
        return text;
    }
}

/**
 * @callback loadCallback
 * @param {string} curLang
 */

/**
 * RegExp that helps locate special variables
 * @static
 * @type {RegExp}
 */
Language.LOCATEREGEX = /(%|&){(.+)}/g;

/**
 * RegExp that helps locate reference variables
 * @static
 * @type {RegExp}
 */
Language.REFREGEX = /&{(.+)}/g;

/**
 * I dont know how to call this
 * @static
 * @type {Map<String,Object>}
 */
Language.ref = new Map([
    ["system.credits.p2", {ref: [x => `<a href="https://github.com/r-paydaybuilds/pd2builder/blob/master/CONTRIBUTORS.md">${x}</a>`]}],
    ["system.credits.license", {ref: [x => `<a href="https://opensource.org/licenses/MIT">${x}</a>`]}]
]);
