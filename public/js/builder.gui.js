/**
 * Class-like object for management of the GUI functions. 
 */
function GUI() { 
  
}; 

/** Change site title. Useful for naming builds, you can later find them easier in your history for example.
 * @param {string} titleText Title to change to.
 */
GUI.prototype.Title_ChangeTo = function (titleText) {
  if (titleText) {
    $("head title").text(titleText);
  }
  else {
    $("head title").text("Payday 2 Builder");
  }
}

/**
 * Change selected Skill Tab to another.
 * @param {string} containerId Id of the Tab to switch to 
 */
GUI.prototype.Tab_ChangeTo = function (containerId) {
  $("#sk_container").children(".sk_container").each(function () {
    $(this).hide(); 
  });
  $("#" + containerId).show(); 
}

/**
 * Raise or lower the subtree background according to points set in it.
 * Does not yet support accurate moving (only at set thresholds)
 * @param {string} subtreeId Id of the subtree to move
 * @param {number} pointsInTree Number of points to "move to"
 */
GUI.prototype.Subtree_MoveBackground = function (subtreeId, pointsInTree) {
  if (pointsInTree >= 16) {
    $("#" + sk_subtreeName).css("background-size", "99% 100%"); 
  }
  else if (pointsInTree >= 3) {
    $("#" + sk_subtreeName).css("background-size", "99% 75%"); 
  }
  else if (pointsInTree >= 1) {
    $("#" + sk_subtreeName).css("background-size", "99% 50%");     
  }
  else if (pointsInTree == 0) {
    $("#" + sk_subtreeName).css("background-size", "99% 25%"); 
  }
};

/**
 * Supposed to be triggered by clicking on an icon of a skill. 
 * This checks the state of the clicked skill and adds it basic or aced, accordingly to the state it is in. 
 * @param {Object} skillObj A jQuery object representing the clicked skill icon  
 */
GUI.prototype.Skill_Add = function (skillObj) {
  if (!skillObj.hasClass("sk_locked")) {
    if (skillObj.hasClass("sk_selected_basic") || skillObj.hasClass("sk_selected_aced")) {
      skillObj.removeClass("sk_selected_basic"); 
      skillObj.addClass("sk_selected_aced"); 
    }
    else {
      skillObj.addClass("sk_selected_basic"); 
    }
    
    //Subtree_MoveBackground()
  } 
}

/**
 * Supposed to be triggered by clicking on an icon of a skill. 
 * This checks the state of the clicked skill and removes it basic or aced, accordingly to the state it is in. 
 * @param {Object} skillObj A jQuery object representing the clicked skill icon  
 */
GUI.prototype.Skill_Remove = function (skillObj) {
  if (skillObj.hasClass("sk_selected_aced")) {
    skillObj.removeClass("sk_selected_aced"); 
    skillObj.addClass("sk_selected_basic"); 
  }
  else if (skillObj.hasClass("sk_selected_basic")) {
    skillObj.removeClass("sk_selected_basic"); 
  }
  
  //MoveBackground(sT, skills.pointsSpent[sT.split("_")[1]]); 
}

const gui = new GUI();  