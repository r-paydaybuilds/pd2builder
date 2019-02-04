$(document).ready(function () {

    //
    // Bind Events on page 


    // Skill tab navigation //
    function changeTab(event) {
        gui.Tree_ChangeTo(event.target.id.replace("button", "container")); 
        const element = $(".sk_description");
        element.data("skill", "none");
        element.text("");
        if(previous) previous.css("visibility", "hidden"); 
        previous = null;
    }

    for(const value of trees) {
        $(`#sk_${value}_button`).click(changeTab);
    }

    // Skill Icon buttons //
    $(".sk_icon").each(function () {

        // Bind on left click
        $(this).click(function () {
            const element = $(this);
            const skill = exp.skills.get(this.firstElementChild.id);
            const skillStore = skills.get(this.firstElementChild.id);

            if(element.hasClass("sk_locked")) return;

            if(element.hasClass("sk_selected_aced")) {
                gui.Skill_TemporalInvalid(element);
                return;
            }

            // Skill backend here
            if(skill) {
                if(exp.skills.points-skillStore.ace < 0) {
                    return;
                }
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

            if(exp.skills.points === 0) gui.Skill_ColorizePointsRemaining("#FF4751");
            gui.Skill_Add(element); 
            gui.Skill_UpdatePointsRemaining(exp.skills.points);
            gui.Subtree_MoveBackground(skillStore.subtree, exp.subtrees[skillStore.subtree].points);
        });

        // Bind on right click
        $(this).contextmenu(function (event) {
            event.preventDefault(); 

            const skill = exp.skills.get(this.firstElementChild.id);
            if(!skill) return;
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
            // Skill backend here
        });

        // Bind on hovering mouse, to show skill description
        $(this).mouseover(function (event) {
            const element = $(".sk_description");
            if(element.data("skill") !== this.firstElementChild.id) {
                const skill = skills.get(this.firstElementChild.id);
                let html = `<p>${skill.name.toUpperCase()}</p><p>${skill.description}</p>`
                    .replace(/\n/g, "</p><p>")
                    .replace(/\t/g, "<br>")
                    .replace(/\b(?!OVE9000)[0-9]+([,.][0-9]+)?( point(s)?|%|cm)?/g, match => `<span class="color_number">${match}</span>`);
                element.html(html);
                element.data("skill", this.firstElementChild.id);
            }
        });

    });

    gui.Skill_UpdatePointsRemaining(exp.skills.points); 
    gui.Tree_ChangeTo("sk_mastermind_container"); 
});

