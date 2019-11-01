import Builder from "./Builder.js";
import Util from "./Util.js";

const langs = ["en-us", "ru-ru"];
let defaultLang = "en-us";

jQuery.fn.reverse = [].reverse;

const builder = new Builder();

$(document).ready(async function () {
    let fetchLang, curLang;
    //Add a big ass loading spinner to make people not touch things //
    builder.gui.LoadingSpinner_Display(true); 

    //
    // Bind Events on page 
    {
        const langDrop = document.getElementById("langDrop");
        const params = new URLSearchParams(window.location.search);
        // Fill the select node
        for(const lang of langs) {
            const option = new Option(lang);
            langDrop.appendChild(option);
        }

        // Save what lang is going to be used
        if(params.has("lang") && langs.includes(params.get("lang"))) {
            const lang = params.get("lang");
            curLang = lang;
            sessionStorage.setItem("lang", lang);
        } else if(sessionStorage.getItem("lang")) {
            curLang = sessionStorage.getItem("lang");
        } else {
            if(langs.includes(navigator.language)) {
                defaultLang = navigator.language;
            } else {
                defaultLang = navigator.languages.find(e => langs.includes(e.toLowerCase())) || defaultLang;
            }

            defaultLang = defaultLang.toLowerCase(),
            curLang = defaultLang;
        }
        // Fetch it and put it as default on select
        fetchLang = fetch(`./lang/${curLang}.json`).then(res => res.json()),
        langDrop.value = curLang;

        // Bind event for when select is changed
        langDrop.addEventListener("change", async (e) => {
            const choosenLang = e.target.value;
            sessionStorage.setItem("lang", choosenLang);
            window.history.pushState(Util.makeState(builder.lang.used, builder.exp), `language changed to ${choosenLang}`);
            builder.loadLanguage(await fetch(`./lang/${choosenLang}.json`).then(res => res.json()), choosenLang);
        });
    }

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
        $(this).click(function (e) {
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

                if(e.hasOwnProperty("originalEvent")) {
                    window.history.pushState(
                        Util.makeState(builder.lang.used, builder.exp),
                        `added skill ${id}`,
                        `?${Util.setParams(["s", builder.io.compressData(builder.io.encodeSkills())])}`
                    );
                }
            } else {
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

                if(event.hasOwnProperty("originalEvent")) {
                    window.history.pushState(
                        Util.makeState(builder.lang.used, builder.exp),
                        `removed skill ${id}`,
                        `?${Util.setParams(["s", builder.io.compressData(builder.io.encodeSkills())])}`
                    );
                }
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
        $(this).click(function (e) {
            const id = this.id; 
            if (builder.exp.perkDeck === id || $(this).hasClass("pk_locked")) return; 

            builder.exp.perkDeck = id; 
            builder.gui.PerkDeck_Select($(this));
            
            if(e.hasOwnProperty("originalEvent")) {
                window.history.pushState(
                    Util.makeState(builder.lang.used, builder.exp),
                    `used perk ${id}`,
                    `?${Util.setParams(["p", builder.io.compressData(builder.io.encodePerkDeck())])}`
                );
            }
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
        $(this).click(function (e) {
            const id = this.firstElementChild.id;
            if (builder.exp.armor === id || $(this).hasClass("arm_locked")) return;

            builder.exp.armor = id;
            builder.gui.Armor_Select($(this)); 
            builder.gui.Armor_DisplayDescriptionCard(id);

            if(e.hasOwnProperty("originalEvent")) {
                window.history.pushState(
                    Util.makeState(builder.lang.used, builder.exp),
                    `used armor ${id}`,
                    `?${Util.setParams(["a", builder.io.compressData(builder.io.encodeArmor().toString())])}`
                );
            }
        });

        $(this).mouseenter(function () {
            builder.gui.Armor_DisplayDescriptionCard(this.firstElementChild.id);
        });
    });

    // Throwables icon buttons // 
    $(".th_icon").each(function () {
        $(this).click(function (e) {
            const id = this.firstElementChild.id;
            if (builder.exp.throwable === id || $(this).hasClass("th_locked")) return;

            builder.exp.throwable = id;
            builder.gui.Throwable_Select($(this));

            if(e.hasOwnProperty("originalEvent")) {
                window.history.pushState(
                    Util.makeState(builder.lang.used, builder.exp),
                    `used throwable ${id}`,
                    `?${Util.setParams(["t", builder.io.compressData(builder.io.encodeThrowable())])}`
                );
            }
        });
        $(this).mouseenter(function() {
            builder.gui.Throwable_DisplayDescriptionCard(this.firstElementChild.id); 
        });
    });

    // Deployables icon buttons //
    $(".dp_icon").each(function () {
        $(this).click(function (e) {
            const id = this.firstElementChild.id;
            if (builder.exp.deployable === id || $(this).hasClass("dp_locked")) return; 
            builder.exp.deployable = id;
            builder.gui.Deployable_Select($(this));

            if(e.hasOwnProperty("originalEvent")) {
                window.history.pushState(
                    Util.makeState(builder.lang.used, builder.exp),
                    `used perk ${id}`,
                    `?${Util.setParams(["d", builder.io.compressData(builder.io.encodeDeployables())])}`
                );
            }
        });

        $(this).contextmenu(function (event) {
            event.preventDefault(); 
            const jackOfAllTradesSkill = builder.exp.skills.get("jack_of_all_trades");
            if (jackOfAllTradesSkill && jackOfAllTradesSkill.state == 2 && builder.exp.deployable) {
                const id = this.firstElementChild.id;
                builder.exp.deployableSecondary = id;
                builder.gui.Deployable_SelectSecondary($(this));

                if(event.hasOwnProperty("originalEvent")) {
                    window.history.pushState(
                        Util.makeState(builder.lang.used, builder.exp),
                        `used perk ${id}`,
                        `?${Util.setParams(["d", builder.io.compressData(builder.io.encodeDeployables())])}`
                    );
                }
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

    // When in popups, do like the popups do (history pop event)
    window.onpopstate = async e => {
        if(!e.state) return;
        for(const [type, value] of Object.entries(e.state)) {
            switch(type) {
            case "lang":
                sessionStorage.setItem("lang", value);
                document.getElementById("langDrop").value = value;
                builder.loadLanguage(await fetch(`./lang/${value}.json`).then(res => res.json()), value);
                break;
            case "skills":
                for(const [key, value2] of Array.from(builder.exp.skills).reverse()) {
                    const originalValue = value[key];
                    if(!originalValue) {
                        for(let val = value2.state; val > 0; val--) {
                            $(`#${key}`).parent().contextmenu();
                        }
                    } else if(value2.state > originalValue.state) {
                        $(`#${key}`).parent().contextmenu();
                    } else if(value2.state < originalValue.state) {
                        $(`#${key}`).parent().click();
                    }
                    delete value[key];
                }
                for(const [key, originalValue] of Object.entries(value)) {
                    for(let val = 0; val < originalValue.state; val++) {
                        $(`#${key}`).parent().click();
                    }
                } 
                break;
            case "perkDeck":
                if(!value) {
                    builder.exp.perkDeck = null;
                    builder.gui.PerkDeck_Unselect();
                    break;
                }
                $(`#${value}`).click();
                break;
            case "armor":
                if(!value) {
                    builder.exp.armor = null;
                    builder.gui.Armor_Unselect();
                    break;
                }
                //fallthrough
            case "throwable":
                if(!value) {
                    builder.exp.throwable = null;
                    builder.gui.Throwable_Unselect();
                    break;
                }
                //fallthrough
            case "deployable":
                if(!value) {
                    builder.exp.deployable = null;
                    builder.gui.Deployable_Unselect();
                    break;
                }
                $(`#${value}`).parent().click();
                break;
            case "deployableSecondary":
                if(!value) {
                    builder.exp.deployableSecondary = null;
                    break;
                }
                $(`#${value}`).parent().contextmenu();
                break;
            }
        }
    };

    // Wait for all DBs to load before loading anything //
    await builder.fetchPromises;

    // Load language
    builder.loadLanguage(await fetchLang, curLang);

    // Prepare document when first opening // 
    builder.gui.Tab_ChangeTo("tab_skills_page"); 
    builder.gui.Skill_UpdatePointsRemaining(builder.exp.skills.points); 
    builder.gui.Tree_ChangeTo("sk_mastermind_container");

    // Load build if it has one
    if (builder.io.HasToLoadBuild()) {
        builder.io.LoadBuildFromIterable(new URLSearchParams(window.location.search));
    }
    window.history.replaceState(Util.makeState(curLang, builder.exp), "PD2 Builder");

    // Disable the loading spinner so people know that they should touch things now //
    builder.gui.LoadingSpinner_Display(false);

    if ($(window).width() < 1003) { // #UNSUPPORTED 
        $("#modal_notification").modal("show"); 
    }
});

window.builder = builder; //make the builder instance visible so people can hack it and we can debug it
