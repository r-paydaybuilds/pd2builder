// Full array of engines
const engines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; 

// Valid engines 
const h_1 = [1, 2]; 
const h_2 = [3, 4, 5, 6];
const h_3 = [7, 8, 9, 10, 11, 12]; 

const nitrogen = [1, 4, 8, 11]; 
const deuterium = [2, 5, 9, 12]; 
const helium = [3, 6, 7, 10]; 

const higher = [2, 3, 4, 6, 10, 11, 12]; 
const lower = [1, 3, 4, 5, 7, 8, 9, 10]; 


/**
 * Array intersection, to find the elements present in each of the passed arguments. Accepts an array of arrays as parameter
 */
Array.prototype.intersect = function() {
    var args = arguments; 
    var res = []; 

    res = $.grep(engines, function(value, index) {
        return args[0].indexOf(value) > -1 && args[1].indexOf(value) > -1 && args[2].indexOf(value) > -1; 
    }); 

    return res; 
}

//Ex. engines.intersect(h_1, nitrogen, lower)