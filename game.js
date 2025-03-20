let turn = "Output";
let holding = null;
let failsafesTriggered = 0;
const maxFailsafes = 3;
const history = [];

const outputWires = ["Positive (+)", "Neutral (-)", "Ground (x)"];
const inputWires = [];

const turnElement = document.getElementById("turn");
const holdingElement = document.getElementById("holding");
const failsafesElement = document.getElementById("failsafes");

const outputWiresElement = document.getElementById("output-wires");
const inputWiresElement = document.getElementById("input-wires");

document.getElementById("commit").addEventListener("click", commitTurn);
document.getElementById("undo").addEventListener("click", undoAction);
document.getElementById("reset").addEventListener("click", resetWires);
document.getElementById("attach").addEventListener("click", attachWire);

function updateUI() {
    turnElement.textContent = `Turn: ${turn}`;
    holdingElement.textContent = `Holding: ${holding || "None"}`;
    failsafesElement.textContent = `Failsafes Triggered: ${failsafesTriggered}`;

    outputWiresElement.innerHTML = outputWires.map(wire => `<div class="wire ${holding === wire ? 'held' : ''}">${wire}</div>`).join("");
    inputWiresElement.innerHTML = inputWires.map(wire => `<div class="wire ${holding === wire ? 'held' : ''}">${wire}</div>`).join("");

    document.querySelectorAll('.wire').forEach(wireElement => {
        wireElement.addEventListener('click', () => handleWireClick(wireElement));
    });

    document.getElementById(turn === "Output" ? "output-screen" : "input-screen").classList.add("active");
    document.getElementById(turn === "Output" ? "input-screen" : "output-screen").classList.remove("active");
}

function handleWireClick(wireElement) {
    const wireText = wireElement.textContent.trim();

    if (holding) {
        if (holding === wireText) {
            holding = null;
        } else {
            return;
        }
    } else {
        holding = wireText;
        if (turn === "Output") {
            outputWires.splice(outputWires.indexOf(wireText), 1);
        } else {
            inputWires.splice(inputWires.indexOf(wireText), 1);
        }
    }

    updateUI();
}

function attachWire() {
    if (holding) {
        if (turn === "Output") {
            inputWires.push(holding);
        } else {
            outputWires.push(holding);
        }
        holding = null;
        updateUI();
    }
}

function commitTurn() {
    history.push({
        turn: turn,
        holding: holding,
        outputWires: [...outputWires],
        inputWires: [...inputWires],
        failsafesTriggered: failsafesTriggered
    });

    checkFailsafes();
    if (failsafesTriggered >= maxFailsafes) {
        alert("Tamper alarm triggered!");
    }

    if (outputWires.length === 0 && inputWires.length === 3) {
        glitchOut();
    } else {
        turn = turn === "Output" ? "Input" : "Output";
        updateUI();
    }
}

function undoAction() {
    if (history.length > 0) {
        const lastState = history.pop();
        turn = lastState.turn;
        holding = lastState.holding;
        failsafesTriggered = lastState.failsafesTriggered;

        outputWires.length = 0;
        inputWires.length = 0;

        lastState.outputWires.forEach(wire => outputWires.push(wire));
        lastState.inputWires.forEach(wire => inputWires.push(wire));

        updateUI();
    }
}

function checkFailsafes() {
    const outputWiresToCheck = holding ? outputWires : [...outputWires, holding].filter(Boolean);
    const inputWiresToCheck = holding ? inputWires : [...inputWires, holding].filter(Boolean);

    if ((outputWiresToCheck.includes("Positive (+)") && outputWiresToCheck.includes("Neutral (-)")) ||
        (inputWiresToCheck.includes("Positive (+)") && inputWiresToCheck.includes("Neutral (-)"))) {
        triggerFailsafe("ungrounded");
    }
    if ((outputWiresToCheck.includes("Neutral (-)") && outputWiresToCheck.includes("Ground (x)")) ||
        (inputWiresToCheck.includes("Neutral (-)") && inputWiresToCheck.includes("Ground (x)"))) {
        triggerFailsafe("power failure");
    }
}

function triggerFailsafe(type) {
    alert(`Failsafe triggered: ${type}`);
    failsafesTriggered++;
    resetWires();
}

function resetWires() {
    outputWires.length = 0;
    inputWires.length = 0;

    outputWires.push("Positive (+)");
    outputWires.push("Neutral (-)");
    outputWires.push("Ground (x)");

    holding = null;
    turn = "Output";
    updateUI();
}

function glitchOut() {
    const colors = ["red", "green", "blue", "yellow", "purple"];
    let i = 0;
    const interval = setInterval(() => {
        document.body.style.backgroundColor = colors[i % colors.length];
        document.body.style.color = colors[(i + 1) % colors.length];
        i++;
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        document.body.style.backgroundColor = "black";
        document.body.style.color = "black";
        document.body.innerHTML = "";
    }, 3000);
}

updateUI();
