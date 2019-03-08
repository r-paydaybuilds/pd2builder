/**
 * Class object for management of the Save/Load (import/export) functions. 
 */
class IO {
    constructor() {
        /** 
         * Array of usable characters for encoding bits
         * @type {string}
         * @private
        */
        this.charString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,@"; 
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
        buildString += "&k=" + exp.skills.points; 

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
            if ($(this).hasClass("dp_selected")) return false; 

            dpCount++; 
        });
        buildString += "&d=" + dpCount;         

        return buildString; 
    }

    /**
     * Decodes the parameters in the URI, and sets the current build to match it the build encoded in it. 
     * @returns {Promise<Boolean>}
     */
    LoadBuildFromURL() {
        var self = this; // Prevent jQuery from screwing up this's scope

        const urlParams = new URLSearchParams(window.location.search);

        if (!urlParams.has("s") || !urlParams.has("k") || !urlParams.has("p") || !urlParams.has("a") || !urlParams.has("t") || !urlParams.has("d")); 
                
        let skillsString = decodeURIComponent(urlParams.get("s"));
        $(".sk_subtree").each(function () {
            let subtreeBasicChar = self.DecodeByte(skillsString.substr(0, 1)); 
            let subtreeAcedChar = self.DecodeByte(skillsString.substr(1, 1));  
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
            skillsString = skillsString.substr(2); 
        }); 
        let k = parseInt(urlParams.get("k"));
        gui.Skill_UpdatePointsRemaining(k); 
        exp.skills.points = k; 

        let p = parseInt(self.DecodeByte(urlParams.get("p"))); 
        let pkCount = 0; 
        $(".pk_deck").each(function () {
            if (pkCount === p) {
                $(this).click();
            }

            pkCount++; 
        }); 

        let a = parseInt(urlParams.get("a")); 
        let armCount = 0; 
        $(".arm_icon").each(function () {
            if (armCount === a) {
                $(this).click();
            }

            armCount++; 
        }); 

        let t = parseInt(self.DecodeByte(urlParams.get("t"))); 
        let thCount = 0; 
        $(".th_icon").each(function () {
            if (thCount === t) {
                $(this).click();
            }

            thCount++; 
        }); 

        let d = parseInt(urlParams.get("d")); 
        let dpCount = 0; 
        $(".dp_icon").each(function () {
            if (dpCount === d) {
                $(this).click();
            }

            dpCount++; 
        }); 
    }

    /**
     * Check if an encoded build is present in the url querystring. Returns true if there is one, false if it's fresh
     * @returns {boolean}
     */
    HasToLoadBuild() {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has("s") || !urlParams.has("k") || !urlParams.has("p") || !urlParams.has("a") || !urlParams.has("t") || !urlParams.has("d")) return false; 
        else return true; 
    }
}

const io = new IO(); // eslint-disable-line no-unused-vars