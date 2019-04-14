$(document).ready(async function () {
    //Add a big ass loading spinner to make people not touch things //
    gui.LoadingSpinner_Display(true); 

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

    // Want websites to behave like games? Call me // 
    $("#sk_page").on("wheel", function(event) {
        if (event.originalEvent.deltaY < 0) {
            gui.Tree_ChangeByScrolling(false); 
        } else {
            gui.Tree_ChangeByScrolling(true); 
        }
        event.preventDefault();
    });

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
        $(this).click(function () {
            const element = $(this);
            const id = this.firstElementChild.id; 

            if (element.hasClass("sk_locked") || element.hasClass("sk_selected_aced")) {
                gui.Skill_AnimateInvalid(element);
                return;
            }

            if (sys.Skill_Add(id)) {
                gui.Skill_Add(element); 

                const s = dbs.get("skills").get(id);
                gui.Skill_UpdatePointsRemaining(exp.skills.points);
                gui.Subtree_MoveBackground(s.subtree, exp.subtrees[s.subtree].points);
            }
            else {
                gui.Skill_AnimateInvalid(element);
            }
        });

        $(this).contextmenu(function (event) {
            event.preventDefault(); 

            const element = $(this);
            const id = this.firstElementChild.id; 

            if (sys.Skill_Remove(id)) { 
                gui.Skill_Remove(element); 
                
                const s = dbs.get("skills").get(id);
                gui.Skill_UpdatePointsRemaining(exp.skills.points);
                gui.Subtree_MoveBackground(s.subtree, exp.subtrees[s.subtree].points);
            }
            else {
                gui.Skill_AnimateInvalid(element);
            }
        });

        $(this).mouseover(function () {
            const id = this.firstElementChild.id; 
            
            if ($(".sk_description").data("skill") !== id) {
                gui.Skill_DisplayDescription(id); 
            }
        });

    });

    // Perk deck buttons //
    $(".pk_deck").each(function () {
        $(this).click(function () {
            const id = this.id; 
            if (exp.perkDeck === id) return; 

            exp.perkDeckPrevious = exp.perkDeck; 
            exp.perkDeck = id; 
            gui.PerkDeck_Select($(this)); 
        });

        $(this).mouseenter(function () {
            const id = this.id; 
            
            if ($(".pk_description").data("perkdeck") !== id) {
                gui.PerkDeck_DisplayDescription(id); 
            }
        });
    }); 

    // Perk deck cards highlight // 
    $(".pk_deck > div").each(function () {
        $(this).mouseenter(function () {
            gui.PerkDeck_HoveringHighlightOn($(this)); 
            gui.PerkDeck_DisplayDescriptionCard($(this)); 
        });

        $(this).mouseleave(function () {
            gui.PerkDeck_HoveringHighlightOff(); 
        });
    });

    // Armor icon buttons //
    $(".arm_icon").each(function () {
        $(this).click(function () {
            const id = this.firstElementChild.id;
            if (exp.armor === id) return;

            exp.armor = id;
            gui.Armor_Select($(this)); 
        });
    });

    // Throwables icon buttons // 
    $(".th_icon").each(function () {
        $(this).click(function () {
            const id = this.firstElementChild.id;
            if (exp.throwable === id) return;

            exp.throwable = id;
            gui.Throwable_Select($(this));
        });
        $(this).mouseenter(function() {
            gui.Throwable_DisplayDescriptionCard(this.firstElementChild.id); 
        });
    });

    // Deployables icon buttons //
    $(".dp_icon").each(function () {
        $(this).click(function () {
            gui.Deployable_Select($(this));
        });

        $(this).contextmenu(function (event) {
            event.preventDefault(); 
            gui.Deployable_SelectSecondary($(this)); 
        });
        $(this).mouseenter(function() {
            gui.Deployable_DisplayDescriptionCard(this.firstElementChild.id); 
        });
    });

    // Share build section //
    $("#io_copy_btn").click(function () {
        let el = $("#io_share_link"); 
        
        el.val(el.val()).select();
        document.execCommand("copy");
        el.blur(); 

        gui.IO_CopyLinkFlash(); 
    });

    // Prepare document when first opening // 
    gui.Tab_ChangeTo("tab_skills_page"); 
    gui.Skill_UpdatePointsRemaining(exp.skills.points); 
    gui.Tree_ChangeTo("sk_mastermind_container");

    // Wait for all DBs to load before loading build from URL //
    await fetchPromises;
    if (io.HasToLoadBuild()) {
        io.LoadBuildFromURL();
    }

    // Disable the loading spinner so people know that they should touch things now //
    gui.LoadingSpinner_Display(false);

    if ($(window).width() < 1003) { // #UNSUPPORTED 
        $("#modal_notification").modal("show"); 
    }
});

