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
         * @type {Builder}
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
     * @returns {string}
     */
    GetEncodedBuild() {
        var self = this; // Prevent jQuery from screwing up this's scope

        let buildString = window.location.href.replace(window.location.search, ""); // Get pure address without params 
        let skillsString = ""; 
        
        // Manage Skills
        $(".sk_subtree").each(function () {
            let subtreeBasicChar = 0; 
            let subtreeAcedChar = 0; 

            $(this).children(".sk_tier").each(function () {
                $(this).find(".sk_icon").each(function () {
                    if ($(this).hasClass("sk_selected_basic")) {
                        subtreeBasicChar = subtreeBasicChar | 1;
                    }
                    else if ($(this).hasClass("sk_selected_aced")) {
                        subtreeAcedChar = subtreeAcedChar | 1; 
                    }

                    if ($(this).closest(".sk_tier").data("tier") != 1) { // Skip for last 
                        subtreeBasicChar = subtreeBasicChar << 1; 
                        subtreeAcedChar = subtreeAcedChar << 1; 
                    }
                });
            }); 
            skillsString += self.EncodeByte(subtreeBasicChar) + self.EncodeByte(subtreeAcedChar); 
        }); 
        buildString += "?s=" + encodeURIComponent(skillsString); 
        buildString += "&k=" + this.builder.exp.skills.points; 

        // Manage Perk Decks
        let pkCount = 0; 
        $(".pk_deck").each(function () {
            if ($(this).hasClass("pk_selected")) return false; 
            
            pkCount++; 
        });
        buildString += "&p=" + self.EncodeByte(pkCount); 

        // Manage Armors
        let armCount = 0; 
        $(".arm_icon").each(function () {
            if ($(this).hasClass("arm_selected")) return false; 

            armCount++; 
        });
        buildString += "&a=" + armCount; 

        // Manage Throwables
        let thCount = 0; 
        $(".th_icon").each(function () {
            if ($(this).hasClass("th_selected")) return false; 

            thCount++; 
        });
        buildString += "&t=" + self.EncodeByte(thCount);  

        // Manage Deployables
        let dpCount = 0; 
        $(".dp_icon").each(function () {
            if ($(this).hasClass("dp_selected") || $(this).hasClass("dp_primary")) return false; 

            dpCount++; 
        });
        buildString += "&d=" + dpCount;
        
        // Account for secondary deployables 
        let dpCount2 = 0; 
        if ($(".dp_icon").hasClass("dp_secondary")) {
            $(".dp_icon").each(function () {
                if ($(this).hasClass("dp_secondary")) return false; 
    
                dpCount2++; 
            });
            buildString += dpCount2.toString();
        }

        return buildString; 
    }

    /**
     * Decodes the parameters in the URI, and sets the current build to match it the build encoded in it. 
     * @returns {void}
     */
    LoadBuildFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        for(const [key, value] of urlParams) {
            switch(key) {
            case "s":
                this.loadSkills(decodeURIComponent(value));
                break;
            case "k":
                this.loadSkillPoints(parseInt(value));
                break;
            case "p":
                this.loadPerkDeck(parseInt(this.DecodeByte(value)));
                break;
            case "a":
                this.loadArmor(parseInt(value));
                break;
            case "t":
                this.loadThrowable(parseInt(this.DecodeByte(value)));
                break;
            case "d":
                this.loadDeployable(value); // Passed as string, because it's two different numbers beside each other. Sliced inside the function
                break;
            }
        }
    }

    /**
     * Loads s parameter to the UI
     * @param {String} skills An encoded string which contains all skills that the build has
     * @returns {void}
     */
    loadSkills(skills) {
        let self = this;
        $(".sk_subtree").each(function () {
            let subtreeBasicChar = self.DecodeByte(skills.substr(0, 1)); 
            let subtreeAcedChar = self.DecodeByte(skills.substr(1, 1));  
            let mask = 1; 

            $(this).children(".sk_tier").reverse().each(function () {
                $(this).find(".sk_icon").reverse().each(function () {
                    let skillBasicBit = subtreeBasicChar & mask;
                    let skillAcedBit = subtreeAcedChar & mask; 
            
                    if (skillBasicBit !== 0) {
                        $(this).click(); 
                    }
                    else if (skillAcedBit !== 0) {
                        $(this).click(); 
                        $(this).click();
                    }

                    mask = mask << 1; 
                });
            });
            skills = skills.substr(2); 
        }); 
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
        $(".pk_deck").each(function (index) {
            if (index === perk) {
                $(this).click();
                $("#tab_perk_decks_button").one("click", 
                    () => this.scrollIntoView({ block: "center" })
                );
            }
        }); 
    } 

    /**
     * Loads a parameter to the UI
     * @param {Number} armor Index of the armor that is being used
     * @returns {void}
     */
    loadArmor(armor) {
        $(".arm_icon").each(function (index) {
            if (index === armor) {
                $(this).click();
            }
        }); 
    }

    /**
     * Loads t parameter to the UI
     * @param {Number} throwable Index of the throwable that is being used
     * @returns {void}
     */
    loadThrowable(throwable) {
        $(".th_icon").each(function (index) {
            if (index === throwable) {
                $(this).click();
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
        const self = this;
        let dp1 = dpParam.substr(0, 1); // === deployable if deployable.length === 1
        let dp2 = dpParam.length > 1 ? dpParam.substr(1, 1) : -1; 

        $(".dp_icon").each(function (index) {
            if (index === parseInt(dp1)) {
                self.builder.gui.Deployable_Select($(this));
            }
            else if (index === parseInt(dp2)) {
                self.builder.gui.Deployable_SelectSecondary($(this));
            }
        }); 
    }

    /**
     * Check if an encoded build is present in the url querystring. Returns true if there is one, false if it's fresh
     * @returns {boolean}
     */
    HasToLoadBuild() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has("s") || urlParams.has("k") || urlParams.has("p") || urlParams.has("a") || urlParams.has("t") || urlParams.has("d");
    }
}