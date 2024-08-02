/**
 * Class object for management of the Save/Load (import/export) functions. 
 */
export default class IO {
    constructor(builder) {
        /** 
         * Array of usable characters for encoding bits
         * @type {string}
         * @private
        */
        this.charString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,@";
        
        /**
         * The Builder instance that instantiated this
         * @type {import("./Builder").default}
         */
        this.builder = builder;
    }

    /**
     * Encode the byte and return the respective character in the character array for coding. 
     * @param {byte} byte The byte to be encoded 
     * @returns {string}
     */
    EncodeByte(byte) {
        return this.charString.charAt(byte); 
    }

    /**
     * Decodes a byte using the custom character set and returns the original bit-flags
     * @param {string} char 
     * @returns {byte} 
     */
    DecodeByte(char) {
        return this.charString.indexOf(char); 
    }

    /**
     * Encode the currently set build into a URI string parameter.
     * @returns {URL}
     */
    GetEncodedBuild() {
        const url = new URL(window.location.href); // Get pure address without params 
        url.href = url.href.replace(url.search, "");
        
        url.href = url.href.replace("mobile.html", ""); // Remove mobile specification if necessary

        // Manage Skills
        if(this.builder.exp.skills.points !== 120) url.searchParams.set("s", this.encodeSkills()); 

        // Manage Perk Decks
        if(this.builder.exp.perkDeck){
            url.searchParams.set("p", this.encodePerkDeck());

            if (this.encodePerkDeck() == "m"){ // If copycat is chosen, encode the current copycat boosts.
                url.searchParams.set("c",this.encodeCopycatBoosts());
            }
        }

        // Manage Armors
        if(this.builder.exp.armor) url.searchParams.set("a", this.encodeArmor());

        // Manage Throwables
        if(this.builder.exp.throwable) url.searchParams.set("t", this.encodeThrowable());

        // Manage Deployables
        if(this.builder.exp.deployable) url.searchParams.set("d", this.encodeDeployables());

        // Manage disabled infamy (encoded as 'n' (as in "no infamy") rather than 'i' - as 'i' would denote 'yes infamy value' when this is a 'no infamy value')
        if(this.builder.exp.infamyDisabled) url.searchParams.set("n", this.encodeInfamyDisabled());
        
        for(const [key, value] of url.searchParams) {
            url.searchParams.set(key, this.compressData(value));
        }

        return url; 
    }

    /**
     * Encodes the skills into a loadable string
     * @returns {String}
     */
    encodeSkills() {
        let skillsString = "";
        for(const e of document.getElementsByClassName("sk_subtree")) {
            let subtreeBasicChar = 0; 
            let subtreeAcedChar = 0; 

            const arr = [...e.querySelectorAll(".sk_icon")];
            (this.builder.mobile ? arr.reverse().reverseMiddle() : arr).forEach(e => {
                if (e.classList.contains("sk_selected_basic")) {
                    subtreeBasicChar = subtreeBasicChar | 1;
                }
                else if (e.classList.contains("sk_selected_aced")) {
                    subtreeAcedChar = subtreeAcedChar | 1; 
                }

                if (e.closest(".sk_tier").dataset.tier != 1) { // Skip for last 
                    subtreeBasicChar = subtreeBasicChar << 1; 
                    subtreeAcedChar = subtreeAcedChar << 1; 
                }
            }); 
            skillsString += this.EncodeByte(subtreeBasicChar) + this.EncodeByte(subtreeAcedChar); 
        } 
        return skillsString;
    }

    /**
     * Encodes the perk deck into a loadable string
     * @returns {String}
     */
    encodePerkDeck() {
        let pkCount = 0; 
        for(const { classList } of document.getElementsByClassName("pk_deck")) {
            if (classList.contains("pk_selected")) break; 
            pkCount++; 
        }
        return this.EncodeByte(pkCount);
    }

    /**
     * Encodes selected copycat boosts into a loadable string
     * @returns {String}
     */
    encodeCopycatBoosts(){
        let ccVals = [];
        for (const card of document.getElementsByClassName("pk_has_boost")){
            ccVals.push(this.EncodeByte(card.querySelector(".copycat_current_num").innerText));
        }
        return ccVals.join("");
    }

    /**
     * Encodes the armor into a loadable number
     * @returns {Number}
     */
    encodeArmor() {
        let armCount = 0; 
        for(const { classList } of document.getElementsByClassName("arm_icon")) {
            if (classList.contains("arm_selected")) break; 
            armCount++; 
        }
        return armCount;
    }

    /**
     * Encodes the throwable into a loadable string
     * @returns {String}
     */
    encodeThrowable() {
        let thCount = 0; 
        for(const { classList } of document.getElementsByClassName("th_icon")) {
            if (classList.contains("th_selected")) break; 
            thCount++; 
        }
        return this.EncodeByte(thCount);
    }

    /**
     * Encodes the deployable into a loadable number
     * @returns {Number}
     */
    encodeDeployable() {
        let dpCount = 0; 
        for(const { classList } of document.getElementsByClassName("dp_icon")) {
            if (classList.contains("dp_selected") || classList.contains("dp_primary")) break; 
            dpCount++; 
        }
        return dpCount;
    }

    /**
     * Encodes the secondary deployable into a loadable number
     * @returns {Number}
     */
    encodeSecondaryDeployable() {
        let dpCount = 0; 
        for(const { classList } of document.getElementsByClassName("dp_icon")) {
            if (classList.contains("dp_secondary")) break; 
            dpCount++; 
        }
        return dpCount;
    }

    /**
     * Encodes both deployables into a loadable string
     * @returns {String}
     */
    encodeDeployables() {
        let ret = "" + this.encodeDeployable();
        if(this.builder.exp.deployableSecondary) ret += this.encodeSecondaryDeployable();
        return ret;
    }

    /**
     * Encodes 'infamyDisabled' into a loadable number (true -> 1, false/null -> 0)
     * @returns {Number}
     */
    encodeInfamyDisabled() {
        return this.builder.exp.infamyDisabled ? 1 : 0;
    }

    /**
     * Decodes the parameters in the iterable, and sets the current build to match it the build encoded in it. 
     * @param {Iterable<String[Object]>|URLSearchParams} iterable to load
     * @returns {void}
     */
    LoadBuildFromIterable(iterable) {

        //let s = null;
        //let c = null;
        //let a = null;
        //let t = null;
        //let d = null;
        

        for(const [key, value] of iterable) {
            const decompressed = this.decompressData(value);
            switch(key) {
            case "s":
                //s = decompressed;
                this.loadSkills(decompressed);
                break;
            case "k":
                this.loadSkillPoints(parseInt(decompressed));
                break;
            case "p":
                this.loadPerkDeck(parseInt(this.DecodeByte(decompressed)));
                break;
            case "c":
                //c = decompressed;
                this.loadCopycatBoosts(decompressed);
                break;
            case "a":
                //a = decompressed;
                this.loadArmor(parseInt(decompressed));
                break;
            case "t":
                //t = decompressed;
                this.loadThrowable(parseInt(this.DecodeByte(decompressed)));
                break;
            case "d":
                //d = decompressed;
                this.loadDeployable(decompressed); // Passed as string, because it's two different numbers beside each other. Sliced inside the function
                break;
            case "n":
                this.loadInfamyDisabled(parseInt(decompressed));
                break;
            }
        }

        this.builder.sys.Validate_Skills();

        /*
        if (c != null){
            this.loadCopycatBoosts(c);
        }
        if (t != null){
            this.loadThrowable(parseInt(this.DecodeByte(t)));
        }
        if (s != null){
            this.loadSkills(s);
        }
        if (a != null){
            this.loadArmor(a);
        }
        if (d != null){
            this.loadDeployable(d);
        }

        window.history.pushState(
            Util.makeState(null, this.builder.exp, this.builder.gui.Tab_Current),
            "loaded the build.",
            this.GetEncodedBuild()
        );
        */
    }

    /**
     * Loads s parameter to the UI
     * @param {String} skills An encoded string which contains all skills that the build has
     * @returns {void}
     */
    loadSkills(skills) {
        for(const e of document.getElementsByClassName("sk_subtree")) {
            //console.log(e.id);
            let subtreeBasicChar = this.DecodeByte(skills.substr(0, 1)); 
            let subtreeAcedChar = this.DecodeByte(skills.substr(1, 1));  
            let mask = 1; 

            //console.log(subtreeBasicChar);
            //console.log(subtreeAcedChar);

            const tiers = [...e.querySelectorAll(".sk_tier")];
            //console.log(tiers);
            (this.builder.mobile ? tiers : tiers.reverse()).forEach(el =>
                [...el.querySelectorAll(".sk_icon")].reverse().forEach(ele => {
                    let skillBasicBit = subtreeBasicChar & mask;
                    let skillAcedBit = subtreeAcedChar & mask; 
            
                    if (skillBasicBit !== 0) {
                        ele.click(); 
                    }
                    else if (skillAcedBit !== 0) {
                        ele.click(); 
                        ele.click();
                    }

                    mask = mask << 1; 
                })
            );
            skills = skills.substr(2); 
        } 
    }

    /**
     * Loads k parameter to the UI
     * @param {Number} points Integer that contains amount of points remaining
     * @returns {void}
     */
    loadSkillPoints(points) {
        this.builder.gui.Skill_UpdatePointsRemaining(points); 
        this.builder.exp.skills.points = points; 
    }

    /**
     * Loads p parameter to the UI
     * @param {Number} perk Index of the perk deck that is being used
     * @returns {void}
     */
    loadPerkDeck(perk) {
        document.querySelectorAll(".pk_deck").forEach((e, index) => {
            if (index === perk) {
                e.click();
                document.getElementById("tab_perk_decks_button").addEventListener("click", 
                    () => e.scrollIntoView({ block: "center" }),
                    { once: true });
            }
        });
        this.builder.perkDeckUnlockHandler(); 
    } 

    loadCopycatBoosts(ccBoosts){

        const boostCards = document.getElementsByClassName("pk_has_boost");
        for (let i = 0; i < ccBoosts.length; i++) {
            const thisBoostNum = this.DecodeByte(ccBoosts.charAt(i));
            const thisBoostCard = boostCards.item(i);
            this.builder.changeCardBoost(thisBoostCard, thisBoostNum);
        }
        this.builder.perkDeckUnlockHandler();
    }

    /**
     * Loads a parameter to the UI
     * @param {Number} armor Index of the armor that is being used
     * @returns {void}
     */
    loadArmor(armor) {
        document.querySelectorAll(".arm_icon").forEach((e, index) => {
            if (index === armor) {
                e.click();
            }
        }); 
    }

    /**
     * Loads t parameter to the UI
     * @param {Number} throwable Index of the throwable that is being used
     * @returns {void}
     */
    loadThrowable(throwable) {
        document.querySelectorAll(".th_icon").forEach((e, index) => {
            if (index === throwable) {
                e.click();
            }
        }); 
    }

    /**
     * Loads d parameter to the UI
     * @param {Number} deployable Index of the deployable that is being used
     * @returns {void}
     */
    loadDeployable(deployable) {
        let dpParam = String(deployable); 
        let dp1 = parseInt(dpParam.substr(0, 1)); // === deployable if deployable.length === 1
        let dp2 = parseInt(dpParam.length > 1 ? dpParam.substr(1, 1) : -1); 
        let dp2Found;

        document.querySelectorAll(".dp_icon").forEach((e, index) => {
            if (index === parseInt(dp1)) {
                e.click();
            } else if (index === parseInt(dp2)) {
                dp2Found = e;
            }
        }); 
        if(dp2Found) dp2Found.dispatchEvent(new MouseEvent("contextmenu"));
    }

    /**
     * loads i parameter into the UI
     * @param {Number} infamyDisabledNum true if infamy is supposed to be disabled (otherwise false)
     * @returns {void}
     */
    loadInfamyDisabled(infamyDisabledNum){
        
        // TODO verify that this can also handle the actual logic for disabling infamy
        const infDisabledBool = (infamyDisabledNum !== 0);
        const infCheckbox = document.getElementById("chk_disable_infamy");
        if (infCheckbox.checked != infDisabledBool){
            infCheckbox.click();
        }
    }

    /**
     * Compresses data in a run-length encoding way (its length compression not data compression)
     * @param {String} data Data for compressing
     * @returns {String}
     */
    compressData(data) {
        let count = 1, thing = data.charAt(0), compressed = "";
        for(let i = 1; i < data.length + 1; i++) {
            const value = data.charAt(i);
            if(value === thing) {
                if(count > 8) {
                    compressed += `${thing}-${count}`;
                    count = 0;
                }
                count++;
                continue;
            }
            if(count > 3) {
                compressed += `${thing}-${count}`;
            } else {
                compressed += thing.repeat(count);
            }
            thing = value;
            count = 1;
        }
        return compressed;
    }

    /**
     * Decompresses data in a run-length encoding way
     * @param {String} data Data for decompressing
     * @returns {String}
     */
    decompressData(data) {
        let decompressed = "";
        for(let i = 0; i < data.length; i++) {
            if(data.charAt(i + 1) === "-") {
                decompressed += data.charAt(i).repeat(parseInt(data.charAt(i+2))); 
                i += 2;
                continue;
            }
            decompressed += data.charAt(i);
        }
        return decompressed;
    }

    /**
     * Check if an encoded build is present in the url querystring. Returns true if there is one, false if it's fresh
     * @returns {Boolean}
     */
    HasToLoadBuild() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has("s") || urlParams.has("k") || urlParams.has("p") || urlParams.has("a") || urlParams.has("t") || urlParams.has("d");
    }
}