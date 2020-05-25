import "./Util.js";
import Language from "./Language.js";

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

document.onreadystatechange = () => {
    for(const e of document.getElementById("hydrogen").children) {
        e.addEventListener("click", () => {
            document.querySelector("#hydrogen > .selected").classList.remove("selected");
            e.classList.add("selected");
            const active = calculate();
            for(let i = 1; i < engines.length + 1; i++) {
                if(active.includes(i)) {
                    document.getElementById(`en${i}`).classList.add("active");
                } else {
                    document.getElementById(`en${i}`).classList.remove("active");
                }
            }
        });
    }
    for(const e of document.getElementById("element").children) {
        e.addEventListener("click", () => {
            document.querySelector("#element > .selected").classList.remove("selected");
            e.classList.add("selected");
            const active = calculate();
            for(let i = 1; i < engines.length + 1; i++) {
                if(active.includes(i)) {
                    document.getElementById(`en${i}`).classList.add("active");
                } else {
                    document.getElementById(`en${i}`).classList.remove("active");
                }
            }
        });
    }
    for(const e of document.getElementById("pressure").children) {
        e.addEventListener("click", () => {
            document.querySelector("#pressure > .selected").classList.remove("selected");
            e.classList.add("selected");
            const active = calculate();
            for(let i = 1; i < engines.length + 1; i++) {
                if(active.includes(i)) {
                    document.getElementById(`en${i}`).classList.add("active");
                } else {
                    document.getElementById(`en${i}`).classList.remove("active");
                }
            }
        });
    }
};

function calculate() {
    const array = [];
    for(const element of document.getElementsByClassName("selected")) {
        const valid = valid_engines[element.id];
        if(valid) {
            array.push(valid);
        }
    }
    return engines.intersect(...array);
}
