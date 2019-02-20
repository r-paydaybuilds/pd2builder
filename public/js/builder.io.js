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
     * @param {Object} byte The byte to be encoded 
     * @returns {string}
     */
    EncodeByte(byte) {
        return this.charString.charAt(byte); 
    }

    /**
     * Docs later
     * @param {string} char 
     */
    DecodeByte(char) {
        return this.charString.indexOf(char); 
    }

    /**
     * Temp
     * @returns {string}
     */
    GetEncodedBuild() {
        // Drafting it with gui objects because I don't know the system behind the internal management of stuff 
        var self = this; // Prevent jQuery from screwing up this's scope
        let buildString = ""; 
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

        return encodeURIComponent(skillsString); 
    }

    /**
     * Will write doc later
     * @param {string} encodedString 
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