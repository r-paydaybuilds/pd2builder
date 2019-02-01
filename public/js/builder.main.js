$(document).ready(function () {

    //
    // Bind Events on page 
  
    // Skill tab navigation //
    $("#sk_mastermind_tab").click(function () {
        gui.Tree_ChangeTo("sk_mastermind_container"); 
    });
    $("#sk_enforcer_tab").click(function () {
        gui.Tree_ChangeTo("sk_enforcer_container"); 
    });
    $("#sk_technician_tab").click(function () {
        gui.Tree_ChangeTo("sk_technician_container"); 
    });
    $("#sk_ghost_tab").click(function () {
        gui.Tree_ChangeTo("sk_ghost_container"); 
    });
    $("#sk_fugitive_tab").click(function () {
        gui.Tree_ChangeTo("sk_fugitive_container"); 
    });

    // Skill Icon buttons //
    $(".sk_icon").each(function () {
    // Bind on left click
        $(this).click(function () {
            const element = $(this);
            if(element.hasClass("sk_locked") || element.hasClass("sk_selected_aced")) return;
            gui.Skill_Add(element); 
            // Skill backend here
            const skill = exp.skills.get(this.firstElementChild.id);
            const skillStore = skills.get(this.firstElementChild.id);
            if(skill) {
                const subtree = exp.subtrees[skillStore.subtree];
                subtree.points += skillStore.ace;
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
                skill.state = "aced";
            } else {
                const subtree = exp.subtrees[skillStore.subtree];
                subtree.points += skillStore.basic;
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
                exp.skills.set(this.firstElementChild.id, {
                    state: "basic"
                });
            }
            gui.Subtree_MoveBackground(skillStore.subtree, exp.subtrees[skillStore.subtree].points);
        });

        // Bind on right click
        $(this).contextmenu(function (event) {
            event.preventDefault(); 

            const skill = exp.skills.get(this.firstElementChild.id);
            if(!skill) return;
            const skillsExpArray = Array.from(exp.skills);
            const skillStore = skills.get(this.firstElementChild.id);
            const element = $(this);

            for(let i=skillStore.tier+1; i < 5; i++) {
                if(exp.skills.getTierPoints(i, skillStore.subtree, skills) === 0) continue;
                const tierPoints = exp.skills.getTiersToFloorPoints(skillStore.tier, skillStore.subtree, skills);
                if(tierPoints - (skill.state === "aced" ? skillStore.ace : skillStore.basic) < tiers2[i-1]) return;
            }

            gui.Skill_Remove(element); 
            if(skill.state === "aced") {
                const subtree = exp.subtrees[skillStore.subtree];
                subtree.points -= skillStore.ace;
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
                skill.state = "basic";
            } else if(skill.state === "basic") {
                const subtree = exp.subtrees[skillStore.subtree];
                subtree.points -= skillStore.basic;
                subtree.tier = subtree.points > 0 ? (subtree.points > 2 ? (subtree.points > 16 ? 4 : 3) : 2 ) : 1;
                exp.skills.delete(this.firstElementChild.id);
            }
            gui.Subtree_MoveBackground(skillStore.subtree, exp.subtrees[skillStore.subtree].points);
            // Skill backend here
        });

        // Bind on hovering mouse, to show skill description
        $(this).mouseover(function () {
            const element = $(".sk_description");
            if(element.data("skill") !== this.firstElementChild.id) {
                const skill = skills.get(this.firstElementChild.id);
                let html = `<p>${skill.name.toUpperCase()}</p><p>${skill.description}</p>`
                    .replace(/\n/g, "</p><p>")
                    .replace(/\t/g, "<br>")
                    .replace(/[0-9]+([,.][0-9]+)?( point(s)?|%|cm)?/g, match => `<span class="color_number">${match}</span>`);
                element.html(html);
                element.data("skill", this.firstElementChild.id);
            }
            element.css("visibility", "visible"); 
        });
    
        // Bind on mouse leave, to hide skill description
        $(this).mouseleave(function () {
            $(".sk_description").css("visibility", "hidden"); 
        }); 

    });

    //$(".sk_points_remaining span").text(skills.pointsRemaining); 
    gui.Tree_ChangeTo("sk_mastermind_container"); 
});

