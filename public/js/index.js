import Builder from "./Builder.js";
import Util from "./Util.js";

const langs = ["en-us", "ru-ru"];
let defaultLang = "en-us";

jQuery.fn.reverse = [].reverse;

const builder = new Builder(/Mobi|Android/i.test(navigator.userAgent));

document.onreadystatechange = async () => {
    let fetchLang, curLang;
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
            builder.loadLanguage(await fetch(`./lang/${choosenLang}.json`).then(res => res.json()), choosenLang);
            window.history.pushState(Util.makeState(builder.lang.used, builder.exp), `language changed to ${choosenLang}`);
        });
    }

    // Tab page navigation //
    document.querySelectorAll("#tab_page_buttons button").forEach(e => {      
        e.addEventListener("click", () => {
            const targetTab = e.getAttribute("id").replace("_button", "_page");
            if (builder.gui.Tab_IsOn(targetTab)) return;

            if (targetTab === "tab_deployables_page") { 
                const jackOfAllTradesSkill = builder.exp.skills.get("jack_of_all_trades"); 
                builder.gui.HandleJackOfAllTrades(jackOfAllTradesSkill); 
            } else if (targetTab === "tab_io_page") { // Display build string when changing to save/load tab 
                document.getElementById("io_share_link").value = builder.io.GetEncodedBuild(); 
            }

            builder.gui.HandleRequirements(e.getAttribute("id").replace(/tab_|_button/g, ""));

            builder.gui.Tab_ChangeTo(targetTab); 
        });
    }); 

    if(!builder.mobile) {
        // Skill tab navigation //
        for (const value of Builder.TREES) {
            document.getElementById(`sk_${value}_button`).addEventListener("click", event => {
                builder.gui.Tree_ChangeTo(event.target.id.replace("button", "container")); 
            }); 
        }
    

        // Want websites to behave like games? Call me // 
        document.getElementById("sk_page").addEventListener("wheel", (event) => {
            if (event.deltaY < 0) {
                builder.gui.Tree_ChangeByScrolling(false); 
            } else {
                builder.gui.Tree_ChangeByScrolling(true); 
            }
            event.preventDefault();
        });
    }

    // Subtree //
    for(const e of document.getElementsByClassName("sk_subtree")) {
        e.addEventListener("mouseenter", () => {
            builder.gui.Subtree_HoveringHighlightOn(e); 
        });

        e.addEventListener("mouseleave", () => {
            builder.gui.Subtree_HoveringHighlightOff(); 
        });
    }

    // Skill Icon buttons //
    for(const e of document.getElementsByClassName("sk_icon")) {
        let touching;

        e.addEventListener("click", ev => {
            const id = e.firstElementChild.id; 

            if (e.classList.contains("sk_locked") || e.classList.contains("sk_selected_aced")) {
                builder.gui.Skill_AnimateInvalid(e);
                return;
            }

            if (builder.sys.Skill_Add(id)) {
                builder.gui.Skill_Add(e); 

                const s = builder.dbs.get("skills").get(id);
                builder.gui.Skill_UpdatePointsRemaining(builder.exp.skills.points);
                builder.gui.Subtree_MoveBackground(s.subtree, builder.exp.subtrees[s.subtree].points);

                if(ev.isTrusted) {
                    window.history.pushState(
                        Util.makeState(builder.lang.used, builder.exp),
                        `added skill ${id}`,
                        `?${Util.setParams(["s", builder.io.compressData(builder.io.encodeSkills())])}`
                    );
                }
            } else {
                builder.gui.Skill_AnimateInvalid(e);
            }
        });

        e.addEventListener("contextmenu", ev => {
            ev.preventDefault(); 
            const id = e.firstElementChild.id; 

            if (builder.sys.Skill_Remove(id)) { 
                builder.gui.Skill_Remove(e); 
                
                const s = builder.dbs.get("skills").get(id);
                builder.gui.Skill_UpdatePointsRemaining(builder.exp.skills.points);
                builder.gui.Subtree_MoveBackground(s.subtree, builder.exp.subtrees[s.subtree].points);

                if(ev.isTrusted) {
                    window.history.pushState(
                        Util.makeState(builder.lang.used, builder.exp),
                        `removed skill ${id}`,
                        `?${Util.setParams(["s", builder.io.compressData(builder.io.encodeSkills())])}`
                    );
                }
            } else {
                builder.gui.Skill_AnimateInvalid(e);
            }
        });

        e.addEventListener("mouseover", () => {
            const id = e.firstElementChild.id; 
            
            if (document.getElementsByClassName("sk_description")[0].dataset.skill !== id) {
                builder.gui.Skill_DisplayDescription(id); 
            }
        });

        const start = () => {
            if(touching) clearTimeout(touching);
            touching = setTimeout(() => {
                e.dispatchEvent(new MouseEvent("contextmenu"));
                start();
            }, 500);
        };
        const end = () => {
            if(!touching) return;
            clearTimeout(touching);
            touching = null;
        };

        e.addEventListener("touchstart", start, false);
        e.addEventListener("touchend", end, false);
        e.addEventListener("touchcancel", end, false);
    }

    // Perk deck buttons //
    for(const e of document.getElementsByClassName("pk_deck")) {
        e.addEventListener("click", ev => {
            const id = e.id; 
            if (builder.exp.perkDeck === id) return; 

            builder.exp.perkDeck = id; 
            builder.gui.PerkDeck_Select(e);
            
            if(ev.isTrusted) {
                window.history.pushState(
                    Util.makeState(builder.lang.used, builder.exp),
                    `used perk ${id}`,
                    `?${Util.setParams(["p", builder.io.compressData(builder.io.encodePerkDeck())])}`
                );
            }
        });

        e.addEventListener("mouseenter", () => {
            const id = e.id; 
            if (document.getElementsByClassName("pk_description")[0].dataset.perkdeck !== id) {
                builder.gui.PerkDeck_DisplayDescription(id); 
            }
        });
    } 

    // Perk deck cards highlight // 
    document.querySelectorAll(".pk_deck > div").forEach(e => {
        e.addEventListener("mouseenter", () => {
            builder.gui.PerkCard_HoveringHighlightOn(e); 
            builder.gui.PerkCard_DisplayDescription(e); 
        });

        e.addEventListener("mouseleave", () => {
            builder.gui.PerkCard_HoveringHighlightOff(); 
        });
    });

    // Armor icon buttons //
    for(const e of document.getElementsByClassName("arm_icon")) {
        e.addEventListener("click", ev => {
            const id = e.firstElementChild.id;
            if (builder.exp.armor === id || e.classList.contains("arm_locked")) return;

            builder.exp.armor = id;
            builder.gui.Armor_Select(e); 
            builder.gui.Armor_DisplayDescriptionCard(id);

            if(ev.isTrusted) {
                window.history.pushState(
                    Util.makeState(builder.lang.used, builder.exp),
                    `used armor ${id}`,
                    `?${Util.setParams(["a", builder.io.compressData(builder.io.encodeArmor().toString())])}`
                );
            }
        });

        e.addEventListener("mouseenter", () => {
            builder.gui.Armor_DisplayDescriptionCard(e.firstElementChild.id);
        });
    }

    // Throwables icon buttons // 
    for(const e of document.getElementsByClassName("th_icon")) {
        e.addEventListener("click", ev => {
            const id = e.firstElementChild.id;
            if (builder.exp.throwable === id || e.classList.contains("th_locked")) return;

            builder.exp.throwable = id;
            builder.gui.Throwable_Select(e);

            if(ev.isTrusted) {
                window.history.pushState(
                    Util.makeState(builder.lang.used, builder.exp),
                    `used throwable ${id}`,
                    `?${Util.setParams(["t", builder.io.compressData(builder.io.encodeThrowable())])}`
                );
            }
        });
        e.addEventListener("mouseenter", () => builder.gui.Throwable_DisplayDescriptionCard(e.firstElementChild.id));
    }

    // Deployables icon buttons //
    for(const e of document.getElementsByClassName("dp_icon")) {
        e.addEventListener("click", ev => {
            const id = e.firstElementChild.id;
            if (builder.exp.deployable === id || e.classList.contains("dp_locked")) return; 
            builder.exp.deployable = id;
            builder.gui.Deployable_Select(e);

            if(ev.isTrusted) {
                window.history.pushState(
                    Util.makeState(builder.lang.used, builder.exp),
                    `used perk ${id}`,
                    `?${Util.setParams(["d", builder.io.compressData(builder.io.encodeDeployables())])}`
                );
            }
        });

        e.addEventListener("contextmenu", ev => {
            ev.preventDefault(); 
            const jackOfAllTradesSkill = builder.exp.skills.get("jack_of_all_trades");
            if (jackOfAllTradesSkill && jackOfAllTradesSkill.state == 2 && builder.exp.deployable) {
                const id = e.firstElementChild.id;
                builder.exp.deployableSecondary = id;
                builder.gui.Deployable_SelectSecondary(e);

                if(ev.isTrusted) {
                    window.history.pushState(
                        Util.makeState(builder.lang.used, builder.exp),
                        `used perk ${id}`,
                        `?${Util.setParams(["d", builder.io.compressData(builder.io.encodeDeployables())])}`
                    );
                }
            } else {
                e.click();
            } 
            
        });
        e.addEventListener("mouseenter", () => 
            builder.gui.Deployable_DisplayDescriptionCard(e.firstElementChild.id)
        );
    }

    // Share build section //
    if(!builder.mobile) {
        document.getElementById("io_copy_btn").addEventListener("click", () => {
            const e = document.getElementById("io_share_link"); 
        
    
            e.select();
            document.execCommand("copy");
            e.blur(); 

            builder.gui.IO_CopyLinkFlash(); 
        });
    }

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
                for(const [key, value2] of [...builder.exp.skills].reverse()) {
                    const originalValue = value[key];
                    const e = document.getElementById(key).parentElement;
                    if(!originalValue) {
                        for(let val = value2.state; val > 0; val--) {
                            e.dispatchEvent(new MouseEvent("contextmenu"));
                        }
                    } else if(value2.state > originalValue.state) {
                        e.dispatchEvent(new MouseEvent("contextmenu"));
                    } else if(value2.state < originalValue.state) {
                        e.click();
                    }
                    delete value[key];
                }
                for(const [key, originalValue] of Object.entries(value)) {
                    for(let val = 0; val < originalValue.state; val++) {
                        document.getElementById(key).parentElement.click();
                    }
                } 
                break;
            case "perkDeck":
                if(!value) {
                    builder.exp.perkDeck = null;
                    builder.gui.PerkDeck_Unselect();
                    builder.gui.PerkCard_HoveringHighlightOff();
                    break;
                }
                document.getElementById(value).click();
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
                    builder.gui.Deployable_Unselect(document.querySelector(".dp_primary, .dp_selected"));
                    break;
                }
                document.getElementById(value).parentElement.click();
                break;
            case "deployableSecondary":
                if(!value) {
                    builder.exp.deployableSecondary = null;
                    builder.gui.Deployable_Unselect(document.querySelector(".dp_secondary"));
                    break;
                }
                document.getElementById(value).parentElement.dispatchEvent(new MouseEvent("contextmenu"));
                break;
            }
        }
    };

    // Wait for all DBs to load before loading anything //
    await builder.fetchPromises;

    if(!builder.mobile) {
        // Load language
        builder.loadLanguage(await fetchLang, curLang);

        // Prepare document when first opening // 
        builder.gui.Tab_ChangeTo("tab_skills_page"); 
        builder.gui.Skill_UpdatePointsRemaining(builder.exp.skills.points); 
        builder.gui.Tree_ChangeTo("sk_mastermind_container");
    }

    // Load build if it has one
    if (builder.io.HasToLoadBuild()) {
        builder.io.LoadBuildFromIterable(new URLSearchParams(window.location.search));
    }
    window.history.replaceState(Util.makeState(curLang, builder.exp), "PD2 Builder");

    // Disable the loading spinner so people know that they should touch things now //
    builder.gui.LoadingSpinner_Display(false);

    if (window.outerWidth < 1003) { // #UNSUPPORTED 
        $("#modal_notification").modal("show"); 
    }
};

window.builder = builder; //make the builder instance visible so people can hack it and we can debug it
