export default class Stats extends Map {
    constructor(...args) {
        super(...args);
        this.baseStats = new Map();
        this.modifiers = [];
    }

    setBaseStats(obj) {
        for(const prop in obj) {
            this.baseStats.set(prop, obj[prop]);
        }
    }

    getBaseStats(key) {
        return this.baseStats.get(key);
    }
}