$(document).ready(function () {

    //
    // Bind Events on page 

    // Tab page navigation //
    $("#tab_page_buttons button").each(function (){
        $(this).click(function () {
            const targetTab = $(this).attr("id").replace("_button", "_page");
            if (gui.Tab_IsOn(targetTab)) return;

            if (targetTab === "tab_armors_page") { 
                const ironManSkill = exp.skills.get("iron_man");
                gui.HandleIronMan(ironManSkill); 
            }
            else if (targetTab === "tab_deployables_page") { 
                const jackOfAllTradesSkill = exp.skills.get("jack_of_all_trades"); 
                gui.HandleJackOfAllTrades(jackOfAllTradesSkill); 
            }
            else if (targetTab === "tab_throwables_page") { 
                gui.HandleSpecialThrowables(exp.perkDeck); 
            }
            else if (targetTab === "tab_io_page") { // Display build string when changing to save/load tab 
                $("#io_share_link").val(io.GetEncodedBuild()); 
            }

            gui.Tab_ChangeTo(targetTab); 
        });
    }); 

    // Skill tab navigation //
    for (const value of trees) {
        $(`#sk_${value}_button`).click(function (event) {
            gui.Tree_ChangeTo(event.target.id.replace("button", "container")); 
        }); 
    }

    // Subtree //
    $(".sk_subtree").each(function () {
        $(this).mouseenter(function () {
            gui.Subtree_HoveringHighlightOn($(this)); 
        });
        
        $(this).mouseleave(function () {
            gui.Subtree_HoveringHighlightOff(); 
        });
    });

    // Skill Icon buttons //
    $(".sk_icon").each(function () {

        // Bind on left click
        $(this).click(function () {
            const element = $(this);
            const id = this.firstElementChild.id; 
            const skill = exp.skills.get(id);
            const skillStore = skills.get(id);

            if (element.hasClass("sk_locked") || element.hasClass("sk_selected_aced")) {
                gui.Skill_AnimateInvalid(element);
                return;
            }


            if(skill) {
                if(exp.skills.points-skillStore.ace < 0) return;
                const subtree = exp.subtrees[skillStore.subtree];
                subtree.points += skillStore.ace;
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
                exp.skills.points -= skillStore.ace;
                skill.state = "aced";
            } else {
                if(exp.skills.points-skillStore.basic < 0) return;
                const subtree = exp.subtrees[skillStore.subtree];
                subtree.points += skillStore.basic;
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
                exp.skills.points -= skillStore.basic;
                exp.skills.set(this.firstElementChild.id, {
                    state: "basic"
                });
            }

            if (exp.skills.points === 0) gui.Skill_ColorizePointsRemaining("#FF4751");
            gui.Skill_Add(element); 
            gui.Skill_UpdatePointsRemaining(exp.skills.points);
            gui.Subtree_MoveBackground(skillStore.subtree, exp.subtrees[skillStore.subtree].points);
        });

        // Bind on right click
        $(this).contextmenu(function (event) {
            event.preventDefault(); 


            const skill = exp.skills.get(this.firstElementChild.id);
            if (!skill) return;

            const skillStore = skills.get(this.firstElementChild.id);
            const element = $(this);

            for(let i=skillStore.tier+1; i < 5; i++) {
                if(exp.skills.getTierPoints(i, skillStore.subtree, skills) === 0) continue;
                const tierPoints = exp.skills.getTiersToFloorPoints(i-1, skillStore.subtree, skills);
                if(tierPoints - (skill.state === "aced" ? skillStore.ace : skillStore.basic) < tiers2[i-1]) return;
            }

            if(exp.skills.points === 0) gui.Skill_ColorizePointsRemaining();
            
            if(skill.state === "aced") {
                const subtree = exp.subtrees[skillStore.subtree];
                subtree.points -= skillStore.ace;
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
                exp.skills.points += skillStore.ace;
                skill.state = "basic";
            } else if(skill.state === "basic") {
                const subtree = exp.subtrees[skillStore.subtree];
                subtree.points -= skillStore.basic;
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
                exp.skills.points += skillStore.basic;
                exp.skills.delete(this.firstElementChild.id);
            }
            
            gui.Skill_Remove(element); 
            gui.Skill_UpdatePointsRemaining(exp.skills.points);
            gui.Subtree_MoveBackground(skillStore.subtree, exp.subtrees[skillStore.subtree].points);
        });

        // Bind on hovering mouse, to show skill description
        $(this).mouseover(function (event) {
            const id = this.firstElementChild.id; 
            
            if ($(".sk_description").data("skill") !== id) {
                gui.Skill_DisplayDescription(id); 
            }
        });

    });

    $(".pk_deck").each(function () {
        $(this).click(function () {
            const perkdeckObj = $(this); 
            const id = this.id; 

            if (exp.perkDeck === id) return; 

            exp.perkDeckPrevious = exp.perkDeck; 
            exp.perkDeck = id; 
            gui.PerkDeck_Select(perkdeckObj); 
        });
    }); 

    $(".arm_icon").each(function () {
        $(this).click(function () {
            const armorObj = $(this);
            const id = this.firstElementChild.id;

            if (exp.armor === id) return;

            exp.armor = id;
            gui.Armor_Select(armorObj); 
        });
    });

    $(".th_icon").each(function () {
        $(this).click(function () {
            gui.Throwable_Select($(this));
        });
    });

    $(".dp_icon").each(function () {
        $(this).click(function () {
            gui.Deployable_Select($(this));
        });

        $(this).contextmenu(function (event) {
            event.preventDefault(); 
            gui.Deployable_SelectSecondary($(this)); 
        });
    })

    $("#io_copy_btn").click(function () {
        let el = $("#io_share_link"); 
        
        el.val(el.val()).select();
        document.execCommand("copy");
        el.blur(); 

        gui.CopyLinkFlash(); 
    });

    gui.Tab_ChangeTo("tab_skills_page"); 
    gui.Skill_UpdatePointsRemaining(exp.skills.points); 
    gui.Tree_ChangeTo("sk_mastermind_container"); 

    setTimeout(function () { io.LoadBuildFromURL(); }, 1500); // Would like to get this on a callback or promise instead of this ugly timeout
});

