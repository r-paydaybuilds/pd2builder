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
        this.previousSkill;
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
     * Change selected Tab to another. 
     * @param {string} tabId Id of the Tab to switch to 
     */
    Tab_ChangeTo(tabId) {
        const btnId = tabId.replace("_page", "_button");
        $("#tab_page_buttons button").each(function () {
            $(this).removeClass("tab_selected"); 
        }); 
        $("#" + btnId).addClass("tab_selected"); 

        $(".tab_page_content").each(function () {
            $(this).hide(); 
        });
        $("#" + tabId).show(); 
    }

    /** 
     * Returns true if the currently selected tab is that passed to the function. 
     * @param {string} tabId Id of the Tab to check 
     * @returns {boolean}
     */
    Tab_IsOn(tabId) {
        return $("#" + tabId).is(":visible"); 
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
     * Called when hovering over a specific subtree, to highlight it and its name below the column. 
     * @param {Object} subtreeObj A jQuery object representing the subtree that's being hovered over. 
     */
    Subtree_HoveringHighlightOn(subtreeObj) {
        if (!subtreeObj) return; 

        const subtreeId = subtreeObj.attr("id"); 
        const subtreeName = subtreeId.split("_")[1].toUpperCase(); 

        subtreeObj.addClass("sk_subtree_highlight"); 
        $(".sk_subtree_name").each(function () {
            if ($(this).children("p").text() === subtreeName) {
                $(this).addClass("sk_subtree_name_highlight"); 
            }
        }); 
    }

    /**
     * Called when moving the mouse out of a subtree, to stop highlighting it and its name below the column.  
     */
    Subtree_HoveringHighlightOff() {
        $(".sk_subtree").removeClass("sk_subtree_highlight"); 
        $(".sk_subtree_name").removeClass("sk_subtree_name_highlight"); 
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

        if (pointsRemaining === 0) {
            this.Skill_ColorizePointsRemaining("#FF4751");
        }
        else {
            this.Skill_ColorizePointsRemaining();
        }
    }

    /**
     * Colorize the Points Remaining text with the specified color. If color is omitted, it defaults to white
     * @default #f0f0f0
     * @param {string} color A css compatible color (format: #rrggbb)
     */
    Skill_ColorizePointsRemaining(color = "#f0f0f0") {
        $(".sk_points_remaining").css("color", color);
    }

    /**
     * Display a skill's description inside the description container. 
     * @param {string} skillId Id of the skill of which to display the description
     */
    Skill_DisplayDescription(skillId) {
        const desc = $(".sk_description"); 
        const skill = skills.get(skillId);

        let html = `<p class="description_title">${skill.name.toUpperCase()}</p><p>${skill.description}</p>`
            .replace(/\n/g, "</p><p>")
            .replace(/\t/g, "<br>")
            .replace(/\b(?!OVE9000)[0-9]+([,.][0-9]+)?( point(s)?|%|cm)?/g, match => `<span class="color_number">${match}</span>`);

        desc.html(html);
        desc.data("skill", skillId);
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
        if (skillObj.hasClass("sk_invalid")) return;

        skillObj.addClass("sk_invalid");
        setTimeout(function(skillObj) {
            skillObj.removeClass("sk_invalid");
        }, 400, skillObj);
    }

    /**
     * Select a specified perk deck. 
     * @param {Object} perkdeckObj A jQuery object representing the clicked perk deck
     */
    PerkDeck_Select(perkdeckObj) {
        if (perkdeckObj.hasClass("pk_selected")) return; 

        const oldTitle = $(".pk_deck.pk_selected p").text();
        $(".pk_deck.pk_selected p").text(oldTitle.replace("EQUIPPED: ", "")); 
        $(".pk_deck.pk_selected").removeClass("pk_selected"); 

        perkdeckObj.addClass("pk_selected"); 
        const newTitle = perkdeckObj.children("p"); 
        newTitle.text("EQUIPPED: " + newTitle.text()); 

        $(".pk_deck").each(function () {
            if ($(this) !== perkdeckObj) {
                $(this).addClass("pk_dim"); 
            }
        });
        perkdeckObj.removeClass("pk_dim"); 
    }

    /**
     * Display a perk deck's description inside the description container. 
     * @param {string} perkdeckId Id of the perkdeck of which to display the description
     */
    PerkDeck_DisplayDescription(perkdeckId) {
        const desc = $(".pk_description"); 
        const pk = perkDecks.get(perkdeckId);

        let html = `<p class="description_title">${pk.name.toUpperCase()}</p><p>${pk.description}</p>`
            .replace(/\n/g, "</p><p>")
            .replace(/\t/g, "<br>")
            .replace(/\b(?!OVE9000)[0-9]+([,.][0-9]+)?( point(s)?|%|cm)?/g, match => `<span class="color_number">${match}</span>`);

        desc.html(html);
        desc.data("perkDeck", perkdeckId);
    }

    /**
     * Select a specified armor.
     * @param {Object} armorObj A jQuery object representing the clicked armor icon
     */
    Armor_Select(armorObj) {
        $(".arm_icon.arm_selected").removeClass("arm_selected"); 
        armorObj.addClass("arm_selected"); 
    }

    /**
     * Unlocks the specified armor
     * @param {Object} armorObj A jQuery object representing the armor icon
     */
    Armor_Unlock(armorObj) {
        if (!armorObj.hasClass("arm_locked")) return;

        armorObj.removeClass("arm_locked");
    }

    /**
     * Locks the specified armor
     * @param {Object} armorObj A jQuery object representing the armor icon
     */
    Armor_Lock(armorObj) {
        if (armorObj.hasClass("arm_locked")) return;

        armorObj.addClass("arm_locked");
    }

    /**
     * Select a specified throwable. Pass "" (empty string) to this function to only delesect without reselecting another. 
     * @param {Object} throwableObj A jQuery object representing the clicked throwable icon
     */
    Throwable_Select(throwableObj) {
        if (throwableObj.hasClass("th_selected") || throwableObj.hasClass("th_locked")) return; 

        $(".th_icon.th_selected").removeClass("th_selected"); 
        if (throwableObj !== "") {
            throwableObj.addClass("th_selected"); 
        }
    }

    /**
     * Unlocks the specified throwable
     * @param {Object} throwableObj A jQuery object representing the throwable icon
     */
    Throwable_Unlock(throwableObj) {
        if (!throwableObj.hasClass("th_locked")) return;

        throwableObj.removeClass("th_locked");
    }

    /**
     * Locks the specified throwable 
     * @param {Object} throwableObj A jQuery object representing the throwable icon
     */
    Throwable_Lock(throwableObj) {
        if (throwableObj.hasClass("th_locked")) return;

        throwableObj.addClass("th_locked");
    }

    /**
     * Select a specified deployable
     * @param {Object} deployableObj A jQuery object representing the clicked deployable icon
     */
    Deployable_Select(deployableObj) {
        if (deployableObj.hasClass("dp_selected") || deployableObj.hasClass("dp_primary") || deployableObj.hasClass("dp_locked")) return; 

        if ($("#jack_of_all_trades").closest(".sk_icon").hasClass("sk_selected_aced")) { 
            $(".dp_icon.dp_primary").removeClass("dp_primary"); 
            deployableObj.addClass("dp_primary"); 
        }
        else {
            $(".dp_icon.dp_selected").removeClass("dp_selected"); 
            deployableObj.addClass("dp_selected"); 
        }
    }

    /**
     * Select a specified deployable as secondary
     * @param {Object} deployableObj A jQuery object representing the clicked deployable icon
     */
    Deployable_SelectSecondary(deployableObj) {
        if (deployableObj.hasClass("dp_primary") || deployableObj.hasClass("dp_secondary") || deployableObj.hasClass("dp_locked")) return; 

        if (!$("#jack_of_all_trades").closest(".sk_icon").hasClass("sk_selected_aced")) { 
            this.Deployable_Select(deployableObj); 
        }

        if (!$(".dp_icon").hasClass("dp_primary")) { // Means: if no primary is selected, treat right click as primary. 
            this.Deployable_Select(deployableObj); 
        }
        else {
            $(".dp_icon.dp_secondary").removeClass("dp_secondary"); 
            deployableObj.addClass("dp_secondary"); 
        }       
    }

    /**
     * Unlocks the specified deployable
     * @param {Object} throwableObj A jQuery object representing the deployable icon
     */
    Deployable_Unlock(deployableObj) {
        if (!deployableObj.hasClass("dp_locked")) return;

        deployableObj.removeClass("dp_locked");
    }

    /**
     * Locks the specified deployable 
     * @param {Object} deployableObj A jQuery object representing the deployable icon
     */
    Deployable_Lock(deployableObj) {
        if (deployableObj.hasClass("dp_locked")) return;

        deployableObj.addClass("dp_locked");
    }    

    /**
     * Make the share build link textbox flash green and change the button text, to give feedback that the link has been copied in the clipboard. 
     */
    IO_CopyLinkFlash() {
        let el = $("#io_share_link"); 
        if (el.hasClass("io_link_flash")) return; 
        
        el.addClass("io_link_flash");    

        let btn = $("#io_copy_btn"); 
        let text = btn.text(); 
        btn.text("Link copied!"); 

        setTimeout(function () {
            el.removeClass("io_link_flash"); 

            btn.text(text); 
        }, 500); 
    }

    /**
     * Lock or Unlock ICTV armor according to the iron man skill state. 
     * @param {Object} ironManSkill 
     */
    HandleIronMan(ironManSkill) {
        if (ironManSkill && ironManSkill.state == "aced") {
            gui.Armor_Unlock($("#ictv").parent());
        }                    
        else {
            gui.Armor_Lock($("#ictv").parent());
        }                     
    }

    /**
     * Allow or disallow double deployable options according to the jack of all trades skill state. 
     * @param {Object} jackOfAllTradesSkill 
     */
    HandleJackOfAllTrades(jackOfAllTradesSkill) {
        if (jackOfAllTradesSkill && jackOfAllTradesSkill.state == "aced") {
            $(".dp_icon").each(function () {
                if ($(this).hasClass("dp_selected")) {
                    $(this).removeClass("dp_selected"); 
                    $(this).addClass("dp_primary"); 
                }
            });
        }
        else {
            $(".dp_secondary").removeClass("dp_secondary"); 
            $(".dp_icon").each(function () {
                if ($(this).hasClass("dp_primary")) {
                    $(this).removeClass("dp_primary"); 
                    $(this).addClass("dp_selected"); 
                }
            });
        }
    }

    /**
     * Called when switching to throwables page, to check if any of the special throwables need to be locked or unlocked. 
     */
    HandleSpecialThrowables() {
        // Lock the old special throwable if the previously selected perk deck unlocked one and if it was selected, deselect it
        if (exp.perkDeckPrevious === "stoic") {
            this.Throwable_Lock($("#stoic_hip_flask").parent()); 
            if (exp.throwable === "stoic_hip_flask") {
                this.Throwable_Select(""); 
            }
        }
        else if (exp.perkDeckPrevious === "hacker") {
            this.Throwable_Lock($("#pocket_ecm").parent()); 
            if (exp.throwable === "pocket_ecm") {
                this.Throwable_Select(""); 
            }
        }
        else if (exp.perkDeckPrevious === "sicario") {
            this.Throwable_Lock($("#smoke_bomb").parent()); 
            if (exp.throwable === "smoke_bomb") {
                this.Throwable_Select(""); 
            }
        }
        else if (exp.perkDeckPrevious === "tag_team") {
            this.Throwable_Lock($("#gas_dispenser").parent()); 
            if (exp.throwable === "gas_dispenser") {
                this.Throwable_Select(""); 
            }
        }
        else if (exp.perkDeckPrevious === "kingpin") {
            this.Throwable_Lock($("#injector").parent()); 
            if (exp.throwable === "injector") {
                this.Throwable_Select(""); 
            }
        }

        // Then unlock the currently selected special if any
        if (exp.perkDeck === "stoic") {
            this.Throwable_Unlock($("#stoic_hip_flask").parent()); 
        }
        else if (exp.perkDeck === "hacker") {
            this.Throwable_Unlock($("#pocket_ecm").parent()); 
        }
        else if (exp.perkDeck === "sicario") {
            this.Throwable_Unlock($("#smoke_bomb").parent()); 
        }
        else if (exp.perkDeck === "tag_team") {
            this.Throwable_Unlock($("#gas_dispenser").parent()); 
        }
        else if (exp.perkDeck === "kingpin") {
            this.Throwable_Unlock($("#injector").parent()); 
        }
    }
}

const gui = new GUI(); // eslint-disable-line no-unused-vars