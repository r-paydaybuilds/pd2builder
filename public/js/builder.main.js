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
            gui.Skill_Add($(this)); 
            // Skill backend here
        });

        // Bind on right click
        $(this).contextmenu(function (event) {
            event.preventDefault(); 

            gui.Skill_Remove($(this)); 
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
                    .replace(/[0-9]+([,.][0-9]+)?( points|%|cm)?/g, match => `<span class="color_number">${match}</span>`);
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