import util from "./Util.js";
import PaydayTable from "./PaydayTable.js";

/**
 * Class object for management of the GUI functions. 
 */
export default class GUI {
    
    /**
     * @param {Builder} builder 
     */
    constructor(builder) {  
        /**
         * The Builder instance that instantiated this
         * @type {Builder}
         */
        this.builder = builder;
    }

    /** Change site title. Useful for naming builds, you can later find them easier in your history for example.
     * @param {String} titleText Title to change to.
     */
    Title_ChangeTo(titleText) {
        document.title = titleText ? titleText : "Payday 2 Builder";
    }

    /**
     * Show or hide the spinner to show that the passed build in the querystring is loading. 
     * @param {Boolean} display Boolean true or false (show or hide)
     */
    LoadingSpinner_Display(display) {
        document.getElementById("loading_spinner").style.display = display ? "" : "none";
    }

    /** 
     * Change selected Tab to another. 
     * @param {String} tabId Id of the Tab to switch to 
     */
    Tab_ChangeTo(tabId) {
        const btnId = tabId.replace("_page", "_button");
        document.querySelectorAll("#tab_page_buttons button").forEach(e => {
            e.classList.remove("tab_selected"); 
        }); 
        document.getElementById(btnId).classList.add("tab_selected"); 

        for(const { style } of document.getElementsByClassName("tab_page_content")) {
            style.display = "none";
        }
        document.getElementById(tabId).style.display = ""; 
    }

    /** 
     * Returns true if the currently selected tab is that passed to the function. 
     * @param {String} tabId Id of the Tab to check 
     * @returns {Boolean}
     */
    Tab_IsOn(tabId) {
        return document.getElementById(tabId).offsetParent !== null; 
    }
    
    /**
     * Gives current tab
     * @returns {String} ID of current tab
     */
    get Tab_Current() {
        return document.querySelector(".tab_selected").id.replace("_button", "_page");
    }

    /** 
     * Opens/closes the description card, the place where every item's description is shown on mobile 
     * @param {Boolean} open Should the card open or close? true = open | false = close 
     */
    DescriptionCard_Show(open = true) {
        const descriptionCard = document.getElementById("description_card");
        descriptionCard.style.cssText = "";
        if (open) {
            descriptionCard.classList.add("active"); 
        }
        else {
            descriptionCard.classList.remove("active"); 
        }        
    }

    /**
     * Change how much description card is shown on mobile
     * @param {Number} open
     */
    DescriptionCard_Analog(open) {
        const descriptionCard = document.getElementById("description_card");
        descriptionCard.style.cssText = `right: ${open}px; transition-duration: 0ms`;
    }

    /**
     * Change selected Skill Tree to another.
     * @param {String} treeId Id of the Tree to switch to 
     */
    Tree_ChangeTo(treeId) {
        const tree = treeId.split("_")[1];
        // Clean the skill description text 
        const desc = document.querySelector("#description_container, .sk_description");
        desc.dataset.skill = "none";
        desc.innerHTML = "";
        
        document.querySelectorAll(".sk_tree_button_active").forEach(e => {
            e.classList.remove("sk_tree_button_active");
        });
        document.getElementById(`sk_${tree}_button`).classList.add("sk_tree_button_active"); 

        // Switch tree content 
        document.querySelectorAll("#sk_container_r > .sk_tree").forEach(e => {
            e.style.display = "none"; 
        });
        document.getElementById(treeId).style.display = "";

        // Change displayed subtree names 
        const subtrees = [];
        document.querySelectorAll(`#${treeId} > .sk_subtree`).forEach(e => {
            subtrees.push(e.dataset.name); 
        });

        // Manage the buttons
        if(this.builder.mobile) {
            document.getElementById("sk_tree_buttons").dataset.tree = tree;
            document.querySelector("#sk_tree_buttons button").textContent = this.builder.lang.get(`system.skills.${tree}.title`);

            const trees = [...document.querySelectorAll(".sk_tree_button_group > div")];
            const index = trees.findIndex(el => 
                el.classList.contains("sk_tree_button_active")
            );
            if(index == 0) {
                this.Tree_PrevOpacity(false);
                this.Tree_NextOpacity();
            } else if(index == trees.length - 1) {
                this.Tree_NextOpacity(false);
                this.Tree_PrevOpacity();
            } else {
                this.Tree_NextOpacity();
                this.Tree_PrevOpacity();
            }
        } else {
            document.querySelector("#sk_subtree_name_left p").innerHTML = this.builder.lang.get(`system.skills.${tree}.subtrees.${subtrees[0]}`);
            document.querySelector("#sk_subtree_name_center p").innerHTML = this.builder.lang.get(`system.skills.${tree}.subtrees.${subtrees[1]}`);
            document.querySelector("#sk_subtree_name_right p").innerHTML = this.builder.lang.get(`system.skills.${tree}.subtrees.${subtrees[2]}`);
        }
    }

    /**
     * Change tree with the mouse wheel like in the game. Skip one ahead or behind of the currently selected tree. 
     * Pass true to the parameter to move forward, false to move backwards
     * @param {Boolean} forward Change forward? True, change backwards? false. 
     */
    Tree_ChangeByScrolling(forward) {
        const treeList = [...document.getElementsByClassName("sk_tree")]; 
        const activeTree = document.getElementsByClassName("sk_tree_button_active")[0].getAttribute("id").replace("button", "container"); 

        for (const t of treeList) {
            if (t.getAttribute("id") !== activeTree) {
                continue;
            }
            const indexOf = treeList.indexOf(t);
            let treeId = ""; 

            if (forward) {
                if (indexOf === treeList.length-1) return; // Prevent out of range 

                treeId = treeList[indexOf+1].getAttribute("id"); 
            } else {
                if (indexOf === 0) return; 

                treeId = treeList[indexOf-1].getAttribute("id"); 
            }                
                
            this.Tree_ChangeTo(treeId); 

        }
    }

    /**
     * Shows the submenu for selecting a skill tree (MOBILE ONLY!)
     * @param {Boolean} open Show or hide
     */
    Tree_ShowSelection(open = true) {
        const { classList } = document.querySelector(".sk_tree_button_group");
        if(open) {
            classList.add("active");
        } else {
            classList.remove("active");
        }
    }

    /**
     * Change opacity of the next button
     * @param {Boolean} opacity Show(true) or hide(false)
     */
    Tree_NextOpacity(opacity = true) {
        const { classList } = document.getElementById("sk_next_tree");
        if(opacity) {
            classList.remove("hidden");
        } else {
            classList.add("hidden");
        }
    }

    /**
     * Change opacity of the previous button
     * @param {Boolean} opacity Show(true) or hide(false)
     */
    Tree_PrevOpacity(opacity = true) {
        const { classList } = document.getElementById("sk_prev_tree");
        if(opacity) {
            classList.remove("hidden");
        } else {
            classList.add("hidden");
        }
    }

    /**
     * Raise or lower the subtree background according to points set in it.
     * @param {String} subtreeId Id of the subtree to move
     * @param {Number} pointsInTree Number of points to "move to"
     */
    Subtree_MoveBackground(subtreeId, pointsInTree) {
        const element = document.getElementById(`sk_${subtreeId}_subtree`);
        let progress = 0;
        let points = pointsInTree;

        for(const [index, pointsNeeded] of [0, 1, 2, 13].entries()) {
            if(pointsNeeded <= points) {
                points -= pointsNeeded;
                progress += 25;
                this.Tier_Unlock(subtreeId, index+1);
            } else {
                progress += (points/pointsNeeded)*25;
                this.Tier_Lock(subtreeId, index+1);
            }
        }
        element.style.backgroundSize = this.builder.mobile ? `${Math.round(progress)}% 100%` : `100% ${Math.round(progress)}%`;
    }

    /**
     * Called when hovering over a specific subtree, to highlight it and its name below the column. 
     * @param {HTMLDivElement} subtree An element representing the subtree that's being hovered over. 
     */
    Subtree_HoveringHighlightOn(subtree) {
        if (!subtree) return; 

        const subtreeId = subtree.getAttribute("id"); 
        const subtreeName = subtreeId.split("_")[1].toUpperCase(); 

        subtree.classList.add("sk_subtree_highlight"); 
        for(const e of document.getElementsByClassName("sk_subtree_name")) {
            if (e.firstElementChild.innerHTML === subtreeName) {
                e.classList.add("sk_subtree_name_highlight"); 
            }
        }
    }

    /**
     * Called when moving the mouse out of a subtree, to stop highlighting it and its name below the column.  
     */
    Subtree_HoveringHighlightOff() {
        document.querySelectorAll(".sk_subtree.sk_subtree_highlight").forEach(e => { 
            e.classList.remove("sk_subtree_highlight");
        });
        document.querySelectorAll(".sk_subtree_name.sk_subtree_name_highlight").forEach(e => { 
            e.classList.remove("sk_subtree_name_highlight");
        });
    }
    
    /**
     * Lock skills in a tier of a subtree.
     * @param {String} subtreeId Id of the subtree
     * @param {Number} tierId Id of the tier 
     */
    Tier_Lock(subtreeId, tierId) {
        document.querySelectorAll(`#sk_${subtreeId}_subtree > .sk_tier[data-tier='${tierId}'] > div > .sk_icon:not(.sk_locked)`).forEach(
            e => e.classList.add("sk_locked")
        );
    }

    /**
     * Unlock skills in a tier of a subtree. 
     * @param {string} subtreeId Id of the subtree
     * @param {number} tierId Id of the tier 
     */
    Tier_Unlock(subtreeId, tierId) {
        document.querySelectorAll(`#sk_${subtreeId}_subtree > .sk_tier[data-tier='${tierId}'] > div > .sk_icon.sk_locked`).forEach(
            e => e.classList.remove("sk_locked")
        );
    }

    /**
     * Updates the label with remaining points with the provided number. 
     * @param {Number} pointsRemaining Number to set the label to
     */
    Skill_UpdatePointsRemaining(pointsRemaining) {
        document.querySelector(".sk_points_remaining p span").innerHTML = pointsRemaining; 

        if (pointsRemaining === 0) {
            this.Skill_ColorizePointsRemaining("#FF4751");
        } else {
            this.Skill_ColorizePointsRemaining();
        }
    }

    /**
     * Colorize the Points Remaining text with the specified color. If color is omitted, it defaults to white
     * @default #f0f0f0
     * @param {String} color A css compatible color (format: #rrggbb)
     */
    Skill_ColorizePointsRemaining(color = "#f0f0f0") {
        document.getElementsByClassName("sk_points_remaining")[0].style.color = color;
    }

    /**
     * Display a skill's description inside the description container. 
     * @param {String} skillId ID of the skill that needs its description shown
     */
    Skill_DisplayDescription(skillId) {
        const desc = document.querySelector("#description_container, .sk_description");
        const skill = this.builder.lang.get(`skills.${skillId}`);

        let html = `<p class="description_title">${skill.name.toUpperCase()}</p><p>${
            skill.description
                .replace(/\n/g, "</p><p>")
                .replace(/\t/g, "<br>")
                .replace(this.constructor.COLOR_PATTERN, match => `<span class="color_number">${match}</span>`)
        }</p>`;

        desc.innerHTML = html;
        desc.dataset.skill = skillId;
    }

    /**
     * Supposed to be triggered by clicking on an icon of a skill. 
     * This checks the state of the clicked skill and adds it basic or aced, accordingly to the state it is in. 
     * @param {HTMLDivElement} skill An element object representing the clicked parent div of the skill icon  
     */
    Skill_Add({ classList }) {
        if (classList.contains("sk_selected_basic")) {
            classList.remove("sk_selected_basic"); 
            classList.add("sk_selected_aced"); 
        } else {
            classList.add("sk_selected_basic"); 
        }
    }

    /**
     * Supposed to be triggered by clicking on an icon of a skill. 
     * This checks the state of the clicked skill and removes it basic or aced, accordingly to the state it is in. 
     * @param {HTMLDivElement} skill An element object representing the clicked parent div of the skill icon  
     */
    Skill_Remove({ classList }) {
        if (classList.contains("sk_selected_aced")) {
            classList.remove("sk_selected_aced"); 
            classList.add("sk_selected_basic"); 
        } else if (classList.contains("sk_selected_basic")) {
            classList.remove("sk_selected_basic"); 
        }
    }
    
    /**
     * Animate a skill icon by adding the invalid class to it, temporarily. 
     * @param {HTMLDivElement} skill An element object representing the skill icon  
     */
    Skill_AnimateInvalid({ classList }) {
        if (classList.contains("sk_invalid")) return;
        if("vibrate" in navigator) navigator.vibrate(75);
        classList.add("sk_invalid");
        setTimeout(() =>{
            classList.remove("sk_invalid");
        }, 400);
    }

    /**
     * Select a specified perk deck. 
     * @param {HTMLDivElement} perkDeck An element object representing the perk deck
     */
    PerkDeck_Select(element) {
        this.PerkDeck_Unselect();

        const p = element.querySelector("p"); 

        element.classList.add("pk_selected"); 
        p.innerHTML = `${this.builder.lang.get("system.equipped")}: ${p.innerHTML}`; 

        document.querySelectorAll(".pk_deck:not(.pk_deck_dim)").forEach(e => e.classList.add("pk_deck_dim"));
        element.classList.remove("pk_deck_dim"); 
    }

    /**
     * Unselect selected perk deck
     */
    PerkDeck_Unselect() {
        const [selected] = document.getElementsByClassName("pk_selected");
        if(selected) {
            selected.querySelector("p").innerHTML = selected.querySelector("p").innerHTML.replace(`${this.builder.lang.get("system.equipped")}: `, ""); 
            selected.classList.remove("pk_selected"); 
            document.querySelectorAll(".pk_deck.pk_deck_dim").forEach(e => e.classList.remove("pk_deck_dim"));
        }
    }

    /**
     * Display a perk deck's description inside the description container. 
     * @param {string} perkdeckId ID of the perk deck that needs its description shown
     */
    PerkDeck_DisplayDescription(perkdeckId) {
        const desc = document.querySelector("#description_container, .pk_description"); 
        const pk = this.builder.lang.get(`perk_decks.${perkdeckId}`);
        
        desc.innerHTML = `<p class="description_title">${pk.name.toUpperCase()}</p><p>${
            pk.description
                .replace(/\n/g, "</p><p>")
                .replace(/\t/g, "<br>")
        }</p>`;
        desc.dataset.perkDeck = perkdeckId;
    }

    /**
     * Display a perk deck card's description inside the bottom description container. 
     * @param {HTMLDivElement} card An element object representing the hovered perk deck card 
     */
    PerkCard_DisplayDescription(card) {
        if (!card) return; 

        const desc = document.querySelector("#description_container, .pk_description"); 
        const pk = this.builder.dbs.get("perk_decks").get(
            util.parentElement(card, this.builder.mobile ? 3 : 2).id
        );
        const perkCard = this.builder.lang.get(`perk_cards.${pk.perks[util.getNodeIndex(card, (e) => 
            e instanceof Element && e.tagName === "DIV"
        )]}`);

        let html = `<p class="description_title">${perkCard.name.toUpperCase()}`;
        
        html += `</p><p>${perkCard.description}</p>`
            .replace(/\n/g, "</p><p>")
            .replace(/\t/g, "<br>")
            .replace(this.constructor.COLOR_PATTERN, match => `<span class="color_number">${match}</span>`);

        desc.innerHTML = html;

        // Copycat mockup 
        if (!card.id || !this.builder.dbs.get("perk_cards").get(card.id).has_copycat_boost) return; 
        const boosts = [...this.builder.dbs.get("perk_cards").entries()].filter(c => c[1].is_copycat_boost); 
        const boostLabel = card.querySelector("span").innerText.split("/"); 

        desc.innerHTML += `<br><p class="description_title">${boosts[boostLabel[0] - 1][1].name.toUpperCase()}<span class="description_title_sub"> (boost)</span></p>`; 
        desc.innerHTML += `<p>${boosts[boostLabel[0] - 1][1].description}</p>`
            .replace(/\n/g, "</p><p>")
            .replace(/\t/g, "<br>")
            .replace(this.constructor.COLOR_PATTERN, match => `<span class="color_number">${match}</span>`);
    }

    /**
     * When hovering over a specific perk deck card, dim its siblings to highlight it. 
     * @param {HTMLDivElement} card An element Object representing the hovered perk deck card
     */
    PerkCard_HoveringHighlightOn(card) {
        if (!card) return; 

        for(const e of card.parentElement.children) {
            if(util.getNodeIndex(card) !== util.getNodeIndex(e)) e.classList.add("pk_card_dim");
        }
        card.classList.remove("pk_card_dim");
    }

    /**
     * Inverse of the above, when hovering off a specific perk deck card, restore the opacity. 
     */
    PerkCard_HoveringHighlightOff() {
        document.querySelectorAll(".pk_card_dim").forEach(e => e.classList.remove("pk_card_dim"));
    }

    /**
     * Select a specified armor.
     * @param {HTMLDivElement} armor An element object representing the clicked armor icon
     */
    Armor_Select({ classList }) {
        this.Armor_Unselect();
        classList.add("arm_selected"); 
    }

    /**
     * Unselect selected armor
     */
    Armor_Unselect() {
        const query = document.querySelector(".arm_selected");
        if(query) query.classList.remove("arm_selected"); 
    }

    /**
     * Unlocks the specified armor
     * @param {HTMLDivElement} armor An element object representing the armor icon
     */
    Armor_Unlock({ classList }) {
        classList.remove("arm_locked");
    }

    /**
     * Locks the specified armor
     * @param {HTMLDivElement} armor An element object representing the armor icon
     */
    Armor_Lock({ classList }) {
        classList.add("arm_locked");
    }

    /**
     * Display an armor's description inside the description container. 
     * @param {String} armorId ID of the armor of which to display the description
     */
    Armor_DisplayDescriptionCard(armorId) {
        const desc = document.querySelector("#description_container, .arm_description");
        const arm = this.builder.dbs.get("armors").get(armorId);
        const oldArm = this.builder.dbs.get("armors").get(this.builder.exp.armor);
        const lang = this.builder.lang.get("system.armors.table"),
            armStats = Object.entries(arm.stats);

        let html = `<p class="description_title">${this.builder.lang.get(`armors.${armorId}`).toUpperCase()}`;


        if(!oldArm) {
            html +=  "</p>" + new PaydayTable(["selected"], Object.keys(arm.stats), { tableClass: "armor_not_chosen" })
                .addRows("selected", armStats)
                .translate(lang)
                .toHTML();
        } else if(armorId === this.builder.exp.armor) {
            const modified = this.builder.stats.getStats(...armStats);
            const modify = [];
            for(let i = 0; i < modified.length; i++) {
                const stat = modified[i];
                modify.push([stat[0], stat[1] - armStats[i][1]]);
            }
            html += `<br><span>${this.builder.lang.get("system.equipped")}</span></p>` 
            + new PaydayTable(["total", "base", "skill"], Object.keys(arm.stats), { tableClass: "armor_details" })
                .addRows("base", armStats)
                .addRows("total", modified.map(stat => [stat[0], stat[1].maybeRound(1)] ))
                .addRows("skill", modify.map(val => [val[0], val[1].maybeRound(1)] ))
                .translate(lang)
                .toHTML();
        } else {
            html += "</p>" + new PaydayTable(["equipped", "selected"], Object.keys(arm.stats), { tableClass: "armor_compare" })
                .addRows("equipped", Object.entries(oldArm.stats))
                .addRows("selected", armStats)
                .compare("equipped", "selected")
                .translate(lang)
                .toHTML();
        }

        if(document.getElementById(armorId).parentElement.classList.contains("arm_locked")) {
            for(const requirement of arm.requires) {
                html += "<br><span class=\"requires\">" + util.resolveRequire(
                    requirement.type,
                    this.builder.lang.get(`${requirement.type}s.${requirement.name}.name`),
                    this.builder.lang
                ) + "</span>";
            }
        }

        desc.innerHTML = html;
    }

    /**
     * Select a specified throwable. 
     * @param {HTMLDivElement} throwable An element object representing the clicked throwable icon
     */
    Throwable_Select({ classList }) {
        this.Throwable_Unselect();
        classList.add("th_selected");
    }

    /**
     * Unselect selected throwable
     */
    Throwable_Unselect() {
        const query = document.querySelector(".th_selected");
        if(query) query.classList.remove("th_selected"); 
    }

    /**
     * Unlocks the specified throwable
     * @param {HTMLDivElement} throwable An element object representing the throwable icon
     */
    Throwable_Unlock({ classList }) {
        classList.remove("th_locked");
    }

    /**
     * Locks the specified throwable 
     * @param {HTMLDivElement} throwable An element object representing the throwable icon
     */
    Throwable_Lock({ classList }) {
        classList.add("th_locked");
    }

    /**
     * Display a throwable's description inside the description container. 
     * @param {String} throwableId ID of the throwable of which to display the description
     */
    Throwable_DisplayDescriptionCard(throwableId) {
        const desc = document.querySelector("#description_container, .th_description");
        const th = this.builder.dbs.get("throwables").get(throwableId);
        let lang = this.builder.lang.get("throwables." + throwableId);
        if (!lang) lang = th; 

        let html = `<p class="description_title">${lang.name}`;

        if(document.getElementById(throwableId).parentElement.classList.contains("th_locked")) {
            for(const requirement of th.requires) {
                html += "<br><span class=\"requires\">" + util.resolveRequire(
                    requirement.type,
                    this.builder.lang.get(`${requirement.type}s.${requirement.name}.name`),
                    this.builder.lang
                ) + "</span>";
            }
        }

        html += `</p><p>${lang.description}</p>`
            .replace(/\n/g, "</p><p>")
            .replace(/\t/g, "<br>");

        desc.innerHTML = html;
    }

    /**
     * Select a specified deployable
     * @param {HTMLDivElement} deployable An element object representing the clicked deployable icon
     */
    Deployable_Select({ classList }) {
        const dp = document.querySelector(".dp_primary, .dp_selected");
        if(dp) this.Deployable_Unselect(dp); 
        if (document.getElementById("jack_of_all_trades").parentElement.classList.contains("sk_selected_aced")) { 
            classList.add("dp_primary"); 
        } else {
            classList.add("dp_selected"); 
        }
    }

    /**
     * Unselect a specified deployable
     * @param {HTMLDivElement} deployable An element object representing the deployable icon
     */
    Deployable_Unselect({ classList }) {
        classList.remove("dp_primary", "dp_selected", "dp_secondary");
    }

    /**
     * Unselect secondary deployable
     */
    DeployableSecondary_Unselect() {
        const [query] = document.getElementsByClassName("dp_secondary");
        if(query) query.classList.remove("dp_secondary");
    }

    /**
     * Select a specified deployable as secondary
     * @param {HTMLDivElement} deployable An element object representing the clicked deployable icon
     */
    Deployable_SelectSecondary({ classList }) {
        if (classList.contains("dp_primary") || classList.contains("dp_secondary") || classList.contains("dp_locked")) return; 

        const [dp] = document.getElementsByClassName("dp_secondary");
        if(dp) this.Deployable_Unselect(dp); 
        classList.add("dp_secondary");        
    }

    /**
     * Unlocks the specified deployable
     * @param {HTMLDivElement} throwable An element object representing the deployable icon
     */
    Deployable_Unlock({ classList }) {
        classList.remove("dp_locked");
    }

    /**
     * Locks the specified deployable 
     * @param {HTMLDivElement} deployable An element object representing the deployable icon
     */
    Deployable_Lock({ classList }) {
        classList.add("dp_locked");
    }    

    /**
     * Display a deployable's description inside the description container. 
     * @param {String} deployableId ID of the deployable of which to display the description
     */
    Deployable_DisplayDescriptionCard(deployableId) {
        const desc = document.querySelector("#description_container, .dp_description");
        const dp = this.builder.dbs.get("deployables").get(deployableId);
        const lang = this.builder.lang.get("deployables." + deployableId);

        let html = `<p class="description_title">${lang.name}`;

        if(document.getElementById(deployableId).parentElement.classList.contains("dp_locked")) {
            for(const requirement of dp.requires) {
                html += "<br><span class=\"requires\">" + util.resolveRequire(
                    requirement.type,
                    this.builder.lang.get(`${requirement.type}s.${requirement.name}.name`),
                    this.builder.lang
                ) + "</span>";
            }
        }
        
        html += `</p><p>${lang.description}</p>`
            .replace(/\n/g, "</p><p>")
            .replace(/\t/g, "<br>");

        desc.innerHTML = html;
    }

    /**
     * Make the share build link textbox flash green and change the button text, to give feedback that the link has been copied in the clipboard. 
     */
    IO_CopyLinkFlash() {
        let {classList} = document.getElementById("io_share_link"); 
        if (classList.contains("io_link_flash")) return; 
        
        classList.add("io_link_flash");    

        let btn = document.getElementById("io_copy_btn"); 
        let text = btn.innerText; 
        btn.innerText = this.builder.lang.get("system.share.copied"); 

        setTimeout(() => {
            classList.remove("io_link_flash"); 

            btn.innerText = text; 
        }, 500); 
    }

    /**
     * Checks if primary deployable has selected instead of primary class and viceversa
     */
    HandleJoat() {
        const query = document.querySelector(".dp_selected, .dp_primary");
        if(!query) return;
        if(query.classList.contains("dp_selected")) {
            query.classList.replace("dp_selected", "dp_primary");
        } else {
            query.classList.replace("dp_primary", "dp_selected");
        }
    }

    /**
     * The unlocks of the object containing the properties of the type above for it to be unlocked
     * @typedef {Object} Unlocked
     * @property {String} type The type of the unlocked object
     * @property {String=} name The name of the unlocked object (if none, that means all objects of that type wouldnt exist without the object handling this unlocks)
     */

    /**
     * Allow or disallow double deployable options according to the jack of all trades skill state. 
     * @param {Object} object
     * @param {String=} object.type Type of the object
     * @param {String} object.id ID of the object
     * @param {Unlocked[]} object.unlocks
     * @returns {Unlocked[]} The unlocked of the objects which arent unlocked anymore
     */
    HandleUnlocks(...objects) {
        const ret = [];
        for(const { type, id, unlocks } of objects) {
            if(!unlocks) continue;
            switch(type) {
            case "skill": {
                const { state } = this.builder.exp.skills.get(id) || { state: 0 };
                for(const unlock of unlocks) {
                    if(state < unlock.whenState) ret.push(unlock);
                }
                break;
            }
            default:
                if(this.builder.exp[type] !== id) ret.push(...unlocks);
            }
        }
        for(const { type, name } of ret) {
            const methodType = type.charAt(0).toUpperCase() + type.slice(1, type.length);
            switch(type) {
            case "deployable":
                if(!name) {
                    const query = document.querySelector(".dp_primary, .dp_selected");
                    if(!query) continue;
                    this.Deployable_Unselect(query);
                    this.builder.exp[type] = null;
                } else if(this.builder.exp[type] === name || this.builder.exp.deployableSecondary === name) {
                    this.Deployable_Unselect(document.getElementById(name).parentElement);
                    if(this.builder.exp[type] === name) {
                        this.builder.exp[type] = null;
                    } else {
                        this.builder.exp.deployableSecondary === name;
                        continue;
                    }
                    const secondary = this.builder.exp.deployableSecondary;
                    this.builder.exp.deployableSecondary = null;
                    this.builder.exp[type] = secondary;
                    this.DeployableSecondary_Unselect();
                    this.Deployable_Select(document.getElementById(secondary).parentElement);
                }
                break;
            default:
                if(!name) {
                    this[methodType + "_Unselect"]();
                    this.builder.exp[type] = null;
                } else if(this.builder.exp[type] === name) {
                    this[methodType + "_Unselect"]();
                    this.builder.exp[type] = null;
                }
            }
        }
        return ret;
    }

    /**
     * Handles requirements of all items with such type so they can be locked or unlocked
     * @param {String} type Contains the type of item
     */
    HandleRequirements(type) {
        const db = this.builder.dbs.get(type);
        if(!db) return;
        for(const [key, value] of db) {
            if(!value.requires) continue;
            const e = document.getElementById(key).parentElement;
            for(const obj of value.requires) {
                const exp = this.builder.exp[obj.type.toCamelCase() + "s"] || this.builder.exp[obj.type.toCamelCase()],
                    methodType = type.charAt(0).toUpperCase() + type.slice(1, type.length - 1); 
                if(exp instanceof Map) {
                    const requirement = exp.get(obj.name);
                    if(requirement && requirement.state >= obj.state) {
                        this[`${methodType}_Unlock`](e);
                    } else {
                        this[`${methodType}_Lock`](e);
                    }
                } else {
                    if(exp === obj.name) {
                        this[`${methodType}_Unlock`](e);
                    } else {
                        this[`${methodType}_Lock`](e);
                    }
                }
            }
        }
    }
}

/**
 * Regular expression that globally matches the data of the JSONs that should have color
 * @type {RegExp}
 */
GUI.COLOR_PATTERN = /(\+ ?|- ?|\b(?!OVE9000))[0-9]+([,.][0-9]+)?( point(s)?|%|cm)?/g;
