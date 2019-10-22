/**
 * Class for the use of language files
 */
export default class Language {
    constructor(lang) {
        /**
         * An object filled with strings
         * @type {Object}
         */
        this.lang = lang;

        const repeat = (obj) => {
            for(const prop in obj) {
                const thing = obj[prop];
                if(typeof thing === "string") {
                    const [,...res] = Language.LOCATEREGEX.exec(thing) || [];
                    if(res.length === 0) continue;
                    obj[prop] = new Function("obj", `return Language.refFormat(Language.replaceFormat("${thing}", obj.rep), obj.ref);`);
                } else {
                    repeat(thing);
                }
            }
        };

        repeat(this.lang);
    }

    /**
     * Returns the requested object or string
     * @param {String} loc Location of the wanted value
     */
    get(loc = "") {
        const array = loc.split(".");
        let res = this.lang;
        for(const value of array) {
            res = res[value];
        }
        return res;
    }

    format(loc) {
        const str = this.get(loc);
        if(!(str instanceof String)) throw new Error("Location should get you to a string!");

    }
}

/**
 * RegExp that helps locates special variables
 * @type {RegExp}
 */
Language.LOCATEREGEX = /(%|&){(\w+)}/g;

/**
 * RegExp that helps locates reference variables
 * @type {RegExp}
 */
Language.REFREGEX = /&{(\w+)}/g;

/**
 * Function to be used when the variable needs to be replaced
 * @type {Function}
 * @param {String} x Replacement text
 * @param {String} variable Name of variable
 * @param {String} text Original Text
 */
Language.replaceFormat = (text, obj) => {
    for(const prop in obj) {
        text = text.replace(new RegExp(`%{${prop}}`, "g"), obj[prop]);
    }
    return text;
};

/**
 * Function to be used when the text has to be referenced
 * @type {Function}
 * @param {String} text Original Text
 * @param {Array<Function>} args Replacement function that returns text for each one
 */
Language.refFormat = (text, args) => {
    const [,...replace] = Language.REFREGEX.exec(text) || [];
    if(Array.isArray(args) && replace.length !== args.length) throw new Error("The array should have the same amount of functions as the lang text has variable as!");
    for(let i = 0; i < replace.length; i++) {
        text = text.replace(new RegExp(`%{${replace[i]}}`), args[i](replace[i]));
    }
    return text;
};