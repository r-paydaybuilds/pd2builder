import Builder from "./Builder.js";
import Language from "./Language.js";

jQuery.fn.reverse = [].reverse;

const builder = new Builder();

$(document).ready(async function () {
    //Add a big ass loading spinner to make people not touch things //
    builder.gui.LoadingSpinner_Display(true); 

    //
    // Bind Events on page 

    // Tab page navigation //
    $("#tab_page_buttons button").each(function (){
        $(this).click(function () {
            const targetTab = $(this).attr("id").replace("_button", "_page");
            if (builder.gui.Tab_IsOn(targetTab)) return;

            if (targetTab === "tab_deployables_page") { 
                const jackOfAllTradesSkill = builder.exp.skills.get("jack_of_all_trades"); 
                builder.gui.HandleJackOfAllTrades(jackOfAllTradesSkill); 
            } else if (targetTab === "tab_io_page") { // Display build string when changing to save/load tab 
                $("#io_share_link").val(builder.io.GetEncodedBuild()); 
            }

            builder.gui.HandleRequirements($(this).attr("id").replace(/tab_|_button/g, ""));

            builder.gui.Tab_ChangeTo(targetTab); 
        });
    }); 

    // Skill tab navigation //
    for (const value of Builder.TREES) {
        $(`#sk_${value}_button`).click(function (event) {
            builder.gui.Tree_ChangeTo(event.target.id.replace("button", "container")); 
        }); 
    }

    // Want websites to behave like games? Call me // 
    $("#sk_page").on("wheel", function(event) {
        if (event.originalEvent.deltaY < 0) {
            builder.gui.Tree_ChangeByScrolling(false); 
        } else {
            builder.gui.Tree_ChangeByScrolling(true); 
        }
        event.preventDefault();
    });

    // Subtree //
    $(".sk_subtree").each(function () {
        $(this).mouseenter(function () {
            builder.gui.Subtree_HoveringHighlightOn($(this)); 
        });

        $(this).mouseleave(function () {
            builder.gui.Subtree_HoveringHighlightOff(); 
        });
    });

    // Skill Icon buttons //
    $(".sk_icon").each(function () {
        $(this).click(function () {
            const element = $(this);
            const id = this.firstElementChild.id; 

            if (element.hasClass("sk_locked") || element.hasClass("sk_selected_aced")) {
                builder.gui.Skill_AnimateInvalid(element);
                return;
            }

            if (builder.sys.Skill_Add(id)) {
                builder.gui.Skill_Add(element); 

                const s = builder.dbs.get("skills").get(id);
                builder.gui.Skill_UpdatePointsRemaining(builder.exp.skills.points);
                builder.gui.Subtree_MoveBackground(s.subtree, builder.exp.subtrees[s.subtree].points);
            }
            else {
                builder.gui.Skill_AnimateInvalid(element);
            }
        });

        $(this).contextmenu(function (event) {
            event.preventDefault(); 

            const element = $(this);
            const id = this.firstElementChild.id; 

            if (builder.sys.Skill_Remove(id)) { 
                builder.gui.Skill_Remove(element); 
                
                const s = builder.dbs.get("skills").get(id);
                builder.gui.Skill_UpdatePointsRemaining(builder.exp.skills.points);
                builder.gui.Subtree_MoveBackground(s.subtree, builder.exp.subtrees[s.subtree].points);
            }
            else {
                builder.gui.Skill_AnimateInvalid(element);
            }
        });

        $(this).mouseover(function () {
            const id = this.firstElementChild.id; 
            
            if ($(".sk_description").data("skill") !== id) {
                builder.gui.Skill_DisplayDescription(id); 
            }
        });

    });

    // Perk deck buttons //
    $(".pk_deck").each(function () {
        $(this).click(function () {
            const id = this.id; 
            if (builder.exp.perkDeck === id || $(this).hasClass("pk_locked")) return; 

            builder.exp.perkDeck = id; 
            builder.gui.PerkDeck_Select($(this)); 
        });

        $(this).mouseenter(function () {
            const id = this.id; 
            
            if ($(".pk_description").data("perkdeck") !== id) {
                builder.gui.PerkDeck_DisplayDescription(id); 
            }
        });
    }); 

    // Perk deck cards highlight // 
    $(".pk_deck > div").each(function () {
        $(this).mouseenter(function () {
            builder.gui.PerkDeck_HoveringHighlightOn($(this)); 
            builder.gui.PerkDeck_DisplayDescriptionCard($(this)); 
        });

        $(this).mouseleave(function () {
            builder.gui.PerkDeck_HoveringHighlightOff(); 
        });
    });

    // Armor icon buttons //
    $(".arm_icon").each(function () {
        $(this).click(function () {
            const id = this.firstElementChild.id;
            if (builder.exp.armor === id || $(this).hasClass("arm_locked")) return;

            builder.exp.armor = id;
            builder.gui.Armor_Select($(this)); 
            builder.gui.Armor_DisplayDescriptionCard(id);
        });

        $(this).mouseenter(function () {
            builder.gui.Armor_DisplayDescriptionCard(this.firstElementChild.id);
        });
    });

    // Throwables icon buttons // 
    $(".th_icon").each(function () {
        $(this).click(function () {
            const id = this.firstElementChild.id;
            if (builder.exp.throwable === id || $(this).hasClass("th_locked")) return;

            builder.exp.throwable = id;
            builder.gui.Throwable_Select($(this));
        });
        $(this).mouseenter(function() {
            builder.gui.Throwable_DisplayDescriptionCard(this.firstElementChild.id); 
        });
    });

    // Deployables icon buttons //
    $(".dp_icon").each(function () {
        $(this).click(function () {
            const id = this.firstElementChild.id;
            if (builder.exp.deployable === id || $(this).hasClass("dp_locked")) return; 
            builder.exp.deployable = id;
            builder.gui.Deployable_Select($(this));
        });

        $(this).contextmenu(function (event) {
            event.preventDefault(); 
            const jackOfAllTradesSkill = builder.exp.skills.get("jack_of_all_trades");
            if (jackOfAllTradesSkill && jackOfAllTradesSkill.state == 2) {
                builder.exp.deployableSecondary = this.firstElementChild.id;
                builder.gui.Deployable_SelectSecondary($(this));
            } else {
                $(this).click();
            } 
            
        });
        $(this).mouseenter(function() {
            builder.gui.Deployable_DisplayDescriptionCard(this.firstElementChild.id); 
        });
    });

    // Share build section //
    $("#io_copy_btn").click(function () {
        let el = $("#io_share_link"); 
        
        el.val(el.val()).select();
        document.execCommand("copy");
        el.blur(); 

        builder.gui.IO_CopyLinkFlash(); 
    });

    // Prepare document when first opening // 
    builder.gui.Tab_ChangeTo("tab_skills_page"); 
    builder.gui.Skill_UpdatePointsRemaining(builder.exp.skills.points); 
    builder.gui.Tree_ChangeTo("sk_mastermind_container");

    // Wait for all DBs to load before loading build from URL //
    await builder.fetchPromises;
    if (builder.io.HasToLoadBuild()) {
        builder.io.LoadBuildFromURL();
    }

    builder.loadLanguage(await fetch("./lang/en-us.json").then(res => res.json()));

    // Disable the loading spinner so people know that they should touch things now //
    builder.gui.LoadingSpinner_Display(false);

    if ($(window).width() < 1003) { // #UNSUPPORTED 
        $("#modal_notification").modal("show"); 
    }
});

window.builder = builder; //make the builder instance visible so people can hack it and we can debug it
window.Language = Language;
