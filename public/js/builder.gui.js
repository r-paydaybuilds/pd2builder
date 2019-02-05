/**
 * Class object for management of the GUI functions. 
 */
class GUI {
    constructor() {
        /** 
         * The previous skill that had it's text appeared.
         * @type {Object}
         * @private
        */
        this.previousSkill
    }

    /** Change site title. Useful for naming builds, you can later find them easier in your history for example.
     * @param {string} titleText Title to change to.
     */
    Title_ChangeTo(titleText) {
        if (titleText) {
            $("head title").text(titleText);
        } else {
            $("head title").text("Payday 2 Builder");
        }
    }

    /**
     * Change selected Skill Tree to another.
     * @param {string} treeId Id of the Tree to switch to 
     */
    Tree_ChangeTo(treeId) {
        // Clean the skill description text 
        const desc = $(".sk_description");
        desc.data("skill", "none");
        desc.text("");
        if (previous) previous.css("visibility", "hidden"); 
        previous = null;

        // Manage the buttons
        $("#sk_tree_buttons").children().removeClass("sk_tree_button_active"); 
        $("#sk_" + treeId.split("_")[1] + "_button").addClass("sk_tree_button_active"); 

        // Switch tree content 
        $("#sk_container_r").children(".sk_tree").each(function () {
            $(this).hide(); 
        });
        $("#" + treeId).show(); 

        // Change displayed subtree names 
        let subtrees = $("#" + treeId).children(".sk_subtree");
        for (let i = 0; i < subtrees.length; i++) {
            subtrees[i] = String($(subtrees[i]).data("name")).toUpperCase(); 
        }
        $("#sk_subtree_name_left p").text(subtrees[0]);
        $("#sk_subtree_name_center p").text(subtrees[1]);
        $("#sk_subtree_name_right p").text(subtrees[2]);
    }

    /**
     * Raise or lower the subtree background according to points set in it.
     * Does not yet support accurate moving (only at set thresholds)
     * @param {string} subtreeId Id of the subtree to move
     * @param {number} pointsInTree Number of points to "move to"
     */
    Subtree_MoveBackground(subtreeId, pointsInTree) {
        const element = $(`#sk_${subtreeId}_subtree`);
        let progress = 0;
        let points = pointsInTree;

        for(const [index, pointsNeeded] of tiers.entries()) {
            if(pointsNeeded <= points) {
                points -= pointsNeeded;
                progress += 25;
                this.Tier_Unlock(subtreeId, index+1);
            } else {
                progress += (points/pointsNeeded)*25;
                this.Tier_Lock(subtreeId, index+1);
            }
        }
        element.css("background-size", `100% ${Math.round(progress)}%`);
    }
    
    /**
     * Lock skills in a tier of a subtree.
     * @param {string} subtreeId Id of the subtree
     * @param {number} tierId Id of the tier 
     */
    Tier_Lock(subtreeId, tierId) {
        const element = $(`#sk_${subtreeId}_subtree`)
            .children(`.sk_tier[data-tier='${tierId}']`)
            .find(".sk_icon");
        if(!element.hasClass("sk_locked")) {
            element.addClass("sk_locked");
        }
    }

    /**
     * Unlock skills in a tier of a subtree. 
     * @param {string} subtreeId Id of the subtree
     * @param {number} tierId Id of the tier 
     */
    Tier_Unlock(subtreeId, tierId) {
        const element = $(`#sk_${subtreeId}_subtree`)
            .children(`.sk_tier[data-tier='${tierId}']`)
            .find(".sk_icon");
        if(element.hasClass("sk_locked")) {
            element.removeClass("sk_locked");
        }
    }

    /**
     * Updates the label with remaining points with the provided number. 
     * @param {number} pointsRemaining Number to set the label to
     */
    Skill_UpdatePointsRemaining(pointsRemaining) {
        $(".sk_points_remaining p span").text(pointsRemaining); 
    }

    /**
     * Colorize the Points Remaining text with the specified color. If color is omitted, it defaults to white
     * @default #f0f0f0
     * @param {String} color A css compatible color (format: #rrggbb)
     */
    Skill_ColorizePointsRemaining(color = "#f0f0f0") {
        $(".sk_points_remaining").css("color", color);
    }

    /**
     * Supposed to be triggered by clicking on an icon of a skill. 
     * This checks the state of the clicked skill and adds it basic or aced, accordingly to the state it is in. 
     * @param {Object} skillObj A jQuery object representing the clicked skill icon  
     */
    Skill_Add(skillObj) {
        if (skillObj.hasClass("sk_selected_basic")) {
            skillObj.removeClass("sk_selected_basic"); 
            skillObj.addClass("sk_selected_aced"); 
        } else {
            skillObj.addClass("sk_selected_basic"); 
        }
    }

    /**
     * Supposed to be triggered by clicking on an icon of a skill. 
     * This checks the state of the clicked skill and removes it basic or aced, accordingly to the state it is in. 
     * @param {Object} skillObj A jQuery object representing the clicked skill icon  
     */
    Skill_Remove(skillObj) {
        if (skillObj.hasClass("sk_selected_aced")) {
            skillObj.removeClass("sk_selected_aced"); 
            skillObj.addClass("sk_selected_basic"); 
        } else if (skillObj.hasClass("sk_selected_basic")) {
            skillObj.removeClass("sk_selected_basic"); 
        }
    }
    
    /**
     * Animate a skill icon by adding the invalid class to it, temporarily. 
     * @param {Object} skillObj A jQuery object representing the skill icon  
     */
    Skill_AnimateInvalid(skillObj) {
        if(skillObj.hasClass("sk_invalid")) return;
        skillObj.addClass("sk_invalid");
        setTimeout(function(skillObj) {
            skillObj.removeClass("sk_invalid");
        }, 400, skillObj);
    }
}

const gui = new GUI();