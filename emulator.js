let ram = new Array(16).fill(0x00);
let pc = 0;
let acc = 0;
let outReg = 0;
let halted = false;
let runTimer = null;
let cpuHz = 2;

const PRESETS = {
    counter: [
        0x1E, 0x2F, 0xE0, 0x4E, 0x60,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x01
    ],
    add: [
        0x1E, 0x2F, 0xE0, 0xF0,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x0F, 0x1B
    ],
    blink: [
        0x1F, 0xE0, 0x4E, 0x2E, 0xE0, 0x62,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x01
    ]
};

function decodeInstruction(byte) {
    const opcode = (byte >> 4) & 0x0F;
    const operand = byte & 0x0F;
    const hexAddr = operand.toString(16).toUpperCase();

    switch (opcode) {
        case 0x0: return `NOP (${byte})`;
        case 0x1: return `LDA [${hexAddr}]`;
        case 0x2: return `ADD [${hexAddr}]`;
        case 0x3: return `SUB [${hexAddr}]`;
        case 0x4: return `STA [${hexAddr}]`;
        case 0x6: return `JMP ${operand}`;
        case 0xE: return `OUT`;
        case 0xF: return `HLT`;
        default:  return `DATA (${byte})`;
    }
}

// Подсветка активных линий на SVG-шине данных
function highlightBus(activeNodes, labelText) {
    const allBoxes = ["pc", "ram", "acc", "out"];
    allBoxes.forEach(id => {
        const isOn = activeNodes.includes(id);
        document.getElementById(`box-${id}`).setAttribute("stroke", isOn ? "#38bdf8" : "#475569");
        document.getElementById(`box-${id}`).setAttribute("fill", isOn ? "#0c4a6e" : "#1e293b");
        document.getElementById(`line-${id}`).setAttribute("stroke", isOn ? "#38bdf8" : "#334155");
    });

    const mainLine = document.getElementById("bus-line-main");
    mainLine.setAttribute("stroke", activeNodes.length ? "#38bdf8" : "#334155");
    document.getElementById("bus-data-label").textContent = labelText;
}

function renderAll() {
    document.getElementById("reg-pc").textContent = pc;
    document.getElementById("reg-acc").textContent = acc;
    document.getElementById("reg-ir").textContent = decodeInstruction(ram[pc]).split(" ");
    document.getElementById("out-display").textContent = String(outReg).padStart(3, "0");

    const ledsEl = document.getElementById("leds-container");
    let ledsHtml = "";
    for (let bit = 7; bit >= 0; bit--) {
        const isOn = (outReg >> bit) & 1;
        ledsHtml += `<div class="led ${isOn ? "on" : ""}" title="Бит ${bit}"></div>`;
    }
    ledsEl.innerHTML = ledsHtml;

    const ramBody = document.getElementById("ram-body");
    ramBody.innerHTML = ram.map((byte, addr) => {
        const hexByte = byte.toString(16).toUpperCase().padStart(2, "0");
        const hexAddr = addr.toString(16).toUpperCase();
        const isCurrent = addr === pc;
        return `
            <tr class="ram-row ${isCurrent ? "active-pc" : ""}">
                <td>${addr} (0x${hexAddr})</td>
                <td><input class="ram-input" maxlength="2" value="${hexByte}" onchange="editRam(${addr}, this.value)"></td>
                <td>${decodeInstruction(byte)}</td>
            </tr>
        `;
    }).join("");
}

function editRam(addr, hexStr) {
    const parsed = parseInt(hexStr, 16);
    ram[addr] = isNaN(parsed) ? 0 : (parsed & 0xFF);
    renderAll();
}

function cpuStep() {
    if (halted) {
        document.getElementById("cpu-status").textContent = "Процессор остановлен (HLT). Нажмите «Сброс».";
        highlightBus(, "BUS: ОСТАНОВЛЕНО (HLT)");
        stopRun();
        return;
    }

    const instruction = ram[pc];
    const opcode = (instruction >> 4) & 0x0F;
    const addr = instruction & 0x0F;
    const desc = decodeInstruction(instruction);
    const hexInst = instruction.toString(16).toUpperCase().padStart(2, "0");

    pc = (pc + 1) & 0x0F;

    switch (opcode) {
        case 0x1: // LDA
            acc = ram[addr];
            highlightBus(["ram", "acc"], `BUS: 0x${acc.toString(16).toUpperCase()} (RAM → ACC)`);
            break;
        case 0x2: // ADD
            acc = (acc + ram[addr]) & 0xFF;
            highlightBus(["ram", "acc"], `BUS: +${ram[addr]} → ACC = ${acc}`);
            break;
        case 0x3: // SUB
            acc = (acc - ram[addr] + 256) & 0xFF;
            highlightBus(["ram", "acc"], `BUS: -${ram[addr]} → ACC = ${acc}`);
            break;
        case 0x4: // STA
            ram[addr] = acc;
            highlightBus(["acc", "ram"], `BUS: ${acc} (ACC → RAM[${addr}])`);
            break;
        case 0x6: // JMP
            pc = addr;
            highlightBus(["pc"], `BUS: Прыжок PC → ${addr}`);
            break;
        case 0xE: // OUT
            outReg = acc;
            highlightBus(["acc", "out"], `BUS: ${acc} (ACC → ПОРТ ВЫВОДА)`);
            break;
        case 0xF: // HLT
            halted = true;
            highlightBus(, "BUS: HLT (Стоп)");
            stopRun();
            break;
        default:
            highlightBus(["pc", "ram"], `BUS: 0x${hexInst} (Чтение)`);
    }

    document.getElementById("cpu-status").textContent = `Такт: ${desc}`;
    renderAll();
}

function updateCpuFreq(hz) {
    cpuHz = Number(hz);
    document.getElementById("freq-label").textContent = `${cpuHz} Гц`;
    if (runTimer) {
        stopRun();
        toggleRun();
    }
}

function toggleRun() {
    if (runTimer) {
        stopRun();
    } else {
        if (halted) resetCpu();
        document.getElementById("run-btn").textContent = "⏸️ Пауза";
        runTimer = setInterval(cpuStep, Math.round(1000 / cpuHz));
    }
}

function stopRun() {
    clearInterval(runTimer);
    runTimer = null;
    document.getElementById("run-btn").textContent = "▶️ Автозапуск";
}

function resetCpu() {
    stopRun();
    pc = 0; acc = 0; outReg = 0; halted = false;
    highlightBus(, "BUS: 0x00 (Сброс)");
    document.getElementById("cpu-status").textContent = "Сброс выполнен.";
    renderAll();
}

function loadPreset(name, btn) {
    if (btn) {
        document.querySelectorAll("#emu-sap1 .filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }
    ram = [...PRESETS[name]];
    resetCpu();
}

loadPreset("counter", null);
