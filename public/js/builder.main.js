$(document).ready(function () {
  
  // Bind Events on page 
  
  // Skill tab navigation //
  $("#sk_mastermind_tab").click(function () {
    TabChangeTo("sk_mastermind_container"); 
  });
  $("#sk_enforcer_tab").click(function () {
    TabChangeTo("sk_enforcer_container"); 
  });
  $("#sk_technician_tab").click(function () {
    TabChangeTo("sk_technician_container"); 
  });
  $("#sk_ghost_tab").click(function () {
    TabChangeTo("sk_ghost_container"); 
  });
  $("#sk_fugitive_tab").click(function () {
    TabChangeTo("sk_fugitive_container"); 
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
      $(".sk_description").css("visibility", "visible"); 
    });
    
    // Bind on mouse leave, to hide skill description
    $(this).mouseleave(function () {
      $(".sk_description").css("visibility", "hidden"); 
    }); 

  });

  //$(".sk_points_remaining span").text(skills.pointsRemaining); 
  gui.Tab_ChangeTo("sk_mastermind_container"); 
});