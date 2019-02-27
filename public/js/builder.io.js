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
        // Drafting it with gui objects because I don't know the system behind the internal management of stuff 
        var self = this; // Prevent jQuery from screwing up this's scope
        let buildString = window.location.href; 
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
        var pkCount = 0; 
        $(".pk_deck").each(function () {
            if ($(this).hasClass("pk_deck_selected")) return; 
            
            pkCount++; 
        });
        buildString += "&p=" + pkCount; 

        // Manage Armors
        var armCount = 0; 
        $(".arm_icon").each(function () {
            if ($(this).hasClass("arm_selected")) return; 

            armCount++; 
        });
        buildString += "&a=" + armCount; 

        // Manage Throwables
        var thCount = 0; 
        $(".th_icon").each(function () {
            if ($(this).hasClass("th_selected")) return; 

            thCount++; 
        });
        buildString += "&t=" + thCount; 

        // Manage Deployables
        var dpCount = 0; 
        $(".dp_icon").each(function () {
            if ($(this).hasClass("dp_selected")) return; 

            dpCount++; 
        });
        buildString += "&d=" + dpCount;         

        return buildString; 
    }

    /**
     * Decodes the passed parameter, a build URI string, and sets the current build to match it. 
     * @param {string} encodedString Build to be decoded 
     */
    LoadBuildFromEncoded(encodedString) {
        var self = this; 
        let buildString = decodeURIComponent(encodedString); 
        let skillsString = buildString;  // Should be uri.paramter.skills in some way


        $(".sk_subtree").each(function () {
            let subtreeBasicChar = self.DecodeByte(skillsString.substr(0, 1)); 
            let subtreeAcedChar = self.DecodeByte(skillsString.substr(1, 1));  
            let mask = 1; 

            $(this).children(".sk_tier").reverse().each(function () {
                $(this).find(".sk_icon").reverse().each(function () {
                    let skillBasicBit = subtreeBasicChar & mask;
                    let skillAcedBit = subtreeAcedChar & mask; 
        
                    if (skillBasicBit !== 0) {
                        $(this).addClass("sk_selected_basic"); // This is not how this should work, needs underlying system to be proper
                    }
                    else if (skillAcedBit !== 0) {
                        $(this).addClass("sk_selected_aced"); // Just a proof of concept
                    }

                    mask = mask << 1; 
                });
            });
            skillsString = skillsString.substr(2); 
        }); 
    }
}

const io = new IO();