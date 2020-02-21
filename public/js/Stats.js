/**
 * Stats classs
 */
export default class Stats {
    /**
     * @param {Builder} builder 
     */
    constructor(builder) {
        /**
         * Each base stat is stored in here
         * @type {Map<String, Number>}
         */
        this.baseStats = new Map(Stats.definedBaseStats);
        /**
         * The Builder instance that instantiated this
         * @type {Builder}
         */
        this.builder = builder;
    }



    /**
     * Sets the base stat
     * @param {String} key
     * @param {Number} value
     */
    setBaseStat(key, value) {
        this.baseStats(key, value);
    }

    /**
     * Returns the base stat requested
     * @param {String} key
     * @returns {Number} 
     */
    getBaseStat(key) {
        return this.baseStats(key);
    }
}

/**
 * Stats that are already defined without choosing anything
 * @static
 * @type {Array<String|Number>[]}
 */
Stats.definedBaseStats = [
    ["health", 230]
];