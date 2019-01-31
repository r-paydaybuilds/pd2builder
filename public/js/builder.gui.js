/**
 * Class object for management of the GUI functions. 
 */
class GUI {
    constructor() {

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
     * @param {string} containerId Id of the Tree to switch to 
     */
    Tree_ChangeTo(containerId) {
        $("#sk_container").children(".sk_tree").each(function () {
            $(this).hide(); 
        });
        $("#" + containerId).show(); 
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
                this.Tier_Unlocker(subtreeId, index+1);
            } else {
                progress += (points/pointsNeeded)*25;
                this.Tier_Locker(subtreeId, index+1);
            }
        }
        element.css("background-size", `99% ${Math.round(progress)}%`);
    }

    /**
     * Locks the tier
     * @param {string} subtreeId Id of the subtree
     * @param {number} tier The tier to take care of
     */
    Tier_Locker(subtreeId, tier) {
        const element = $(`#sk_${subtreeId}_subtree`)
            .children(`.sk_tier[data-tier='${tier}']`)
            .find(".sk_icon");
        if(!element.hasClass("sk_locked")) {
            element.addClass("sk_locked");
        }
    }

    /**
     * Unlocks the tier
     * @param {string} subtreeId Id of the subtree
     * @param {number} tier The tier to take care of
     */
    Tier_Unlocker(subtreeId, tier) {
        const element = $(`#sk_${subtreeId}_subtree`)
            .children(`.sk_tier[data-tier='${tier}']`)
            .find(".sk_icon");
        if(element.hasClass("sk_locked")) {
            element.removeClass("sk_locked");
        }
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
}

const gui = new GUI();  