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

        const buildURLParam = new URLSearchParams(); // Get pure address without params 
        
        // Manage Skills
        if(this.builder.exp.skills.points !== 120) {
            let skillsString = ""; 
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
            buildURLParam.set("s", skillsString); 
        }

        // Manage Perk Decks
        if(this.builder.exp.perkDeck) {
            let pkCount = 0; 
            $(".pk_deck").each(function () {
                if ($(this).hasClass("pk_selected")) return false; 
                
                pkCount++; 
            });
            buildURLParam.set("p", self.EncodeByte(pkCount)); 
        }

        // Manage Armors
        if(this.builder.exp.armor) {
            let armCount = 0; 
            $(".arm_icon").each(function () {
                if ($(this).hasClass("arm_selected")) return false; 

                armCount++; 
            });
            buildURLParam.set("a", armCount); 
        }

        // Manage Throwables
        if(this.builder.exp.throwable) {
            let thCount = 0; 
            $(".th_icon").each(function () {
                if ($(this).hasClass("th_selected")) return false; 

                thCount++; 
            });
            buildURLParam.set("t", self.EncodeByte(thCount));  
        }

        // Manage Deployables
        if(this.builder.exp.deployable) {
            let dpCount = 0; 
            $(".dp_icon").each(function () {
                if ($(this).hasClass("dp_selected") || $(this).hasClass("dp_primary")) return false; 

                dpCount++; 
            });
            buildURLParam.set("d", dpCount);
        }

        // Account for secondary deployables 
        if ($(".dp_icon").hasClass("dp_secondary")) {
            let dpCount2 = 0; 
            $(".dp_icon").each(function () {
                if ($(this).hasClass("dp_secondary")) return false; 
    
                dpCount2++; 
            });
            buildURLParam.set("d", buildURLParam.get("d") + dpCount2);
        }

        
        for(const [key, value] of buildURLParam) {
            buildURLParam.set(key, this.compressData(value));
        }

        return window.location.href.replace(window.location.search, "") + 
            (buildURLParam.toString() == "" ? "" : "?" + buildURLParam.toString()); 
    }

    /**
     * Decodes the parameters in the URI, and sets the current build to match it the build encoded in it. 
     * @returns {void}
     */
    LoadBuildFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        for(const [key, value] of urlParams) {
            const decompressed = this.decompressData(value);
            switch(key) {
            case "s":
                this.loadSkills(decompressed);
                break;
            case "k":
                this.loadSkillPoints(parseInt(decompressed));
                break;
            case "p":
                this.loadPerkDeck(parseInt(this.DecodeByte(decompressed)));
                break;
            case "a":
                this.loadArmor(parseInt(decompressed));
                break;
            case "t":
                this.loadThrowable(parseInt(this.DecodeByte(decompressed)));
                break;
            case "d":
                this.loadDeployable(decompressed); // Passed as string, because it's two different numbers beside each other. Sliced inside the function
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
        let dp1 = dpParam.substr(0, 1); // === deployable if deployable.length === 1
        let dp2 = dpParam.length > 1 ? dpParam.substr(1, 1) : -1; 

        $(".dp_icon").each(function (index) {
            if (index === parseInt(dp1)) {
                $(this).click();
            }
            else if (index === parseInt(dp2)) {
                $(this).contextmenu();
            }
        }); 
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
     * @returns {boolean}
     */
    HasToLoadBuild() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has("s") || urlParams.has("k") || urlParams.has("p") || urlParams.has("a") || urlParams.has("t") || urlParams.has("d");
    }
}