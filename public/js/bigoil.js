import "./Util.js";

// Full array of engines
const engines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; 

// Valid engines 
const valid_engines = {
    h_1: [1, 2],
    h_2: [3, 4, 5, 6],
    h_3: [7, 8, 9, 10, 11, 12],
    nitrogen: [1, 4, 8, 11],
    deuterium: [2, 5, 9, 12],
    helium: [3, 6, 7, 10],
    higher: [2, 3, 4, 6, 10, 11, 12], 
    lower: [1, 3, 4, 5, 7, 8, 9, 10]
};

$(document).ready(function() {
    $("#hydrogen").children().each(function() {
        $(this).click(function () {
            $("#hydrogen > .selected").removeClass("selected");
            $(this).addClass("selected");
            const active = calculate();
            for(let i = 1; i < engines.length + 1; i++) {
                if(active.includes(i)) {
                    $(`#en${i}`).addClass("active");
                } else {
                    $(`#en${i}`).removeClass("active");
                }
            }
        });
    });
    $("#element").children().each(function() {
        $(this).click(function () {
            $("#element > .selected").removeClass("selected");
            $(this).addClass("selected");
            const active = calculate();
            for(let i = 1; i < engines.length + 1; i++) {
                if(active.includes(i)) {
                    $(`#en${i}`).addClass("active");
                } else {
                    $(`#en${i}`).removeClass("active");
                }
            }
        });
    });
    $("#pressure").children().each(function() {
        $(this).click(function () {
            $("#pressure > .selected").removeClass("selected");
            $(this).addClass("selected");
            const active = calculate();
            for(let i = 1; i < engines.length + 1; i++) {
                if(active.includes(i)) {
                    $(`#en${i}`).addClass("active");
                } else {
                    $(`#en${i}`).removeClass("active");
                }
            }
        });
    });
});

function calculate() {
    const array = [];
    for(const element of $(".selected")) {
        const valid = valid_engines[element.id];
        if(valid) {
            array.push(valid);
        }
    }
    return engines.intersect(...array);
}