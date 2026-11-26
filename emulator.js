// 16 байт оперативной памяти (каждый элемент от 0x00 до 0xFF)
let ram = new Array(16).fill(0x00);
let pc = 0;       // Program Counter (Счетчик команд: 0..15)
let acc = 0;      // Accumulator (Регистр-аккумулятор: 0..255)
let outReg = 0;   // Регистр вывода на дисплей и светодиоды
let halted = false;
let runTimer = null;

// Готовые программы в машинных кодах
const PRESETS = {
    counter: [
        0x1E, // 0: LDA 14 (загрузить 0)
        0x2F, // 1: ADD 15 (прибавить 1)
        0xE0, // 2: OUT    (вывести на экран)
        0x4E, // 3: STA 14 (сохранить обратно в 14)
        0x60, // 4: JMP 0  (прыгнуть в начало)
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, // 14 (0xE): Текущее значение счетчика
        0x01  // 15 (0xF): Шаг прибавления (+1)
    ],
    add: [
        0x1E, // 0: LDA 14 (загрузить число 15)
        0x2F, // 1: ADD 15 (прибавить число 27)
        0xE0, // 2: OUT    (вывести результат 42)
        0xF0, // 3: HLT    (остановка)
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x0F, // 14 (0xE): Число 15 (0x0F)
        0x1B  // 15 (0xF): Число 27 (0x1B)
    ],
    blink: [
        0x1F, // 0: LDA 15 (загрузить 1)
        0xE0, // 1: OUT    (зажечь светодиод)
        0x4E, // 2: STA 14 (сохранить в 14)
        0x2E, // 3: ADD 14 (умножить на 2 = сдвиг бита влево!)
        0xE0, // 4: OUT
        0x62, // 5: JMP 2  (повторять сдвиг)
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, // 14 (0xE): Временная ячейка
        0x01  // 15 (0xF): Начальный бит (00000001)
    ]
};

function decodeInstruction(byte) {
    const opcode = (byte >> 4) & 0x0F;
    const operand = byte & 0x0F;
    const hexAddr = operand.toString(16).toUpperCase();

    switch (opcode) {
        case 0x0: return `NOP (Данные: ${byte})`;
        case 0x1: return `LDA ${operand} (Взять из [${hexAddr}])`;
        case 0x2: return `ADD ${operand} (Прибавить [${hexAddr}])`;
        case 0x3: return `SUB ${operand} (Вычесть [${hexAddr}])`;
        case 0x4: return `STA ${operand} (Записать в [${hexAddr}])`;
        case 0x6: return `JMP ${operand} (Прыжок на ${operand})`;
        case 0xE: return `OUT (Вывод на экран)`;
        case 0xF: return `HLT (Стоп)`;
        default:  return `DATA (${byte})`;
    }
}

function renderAll() {
    // Обновляем регистры
    document.getElementById("reg-pc").textContent = pc;
    document.getElementById("reg-acc").textContent = acc;
    document.getElementById("reg-ir").textContent = decodeInstruction(ram[pc]).split(" ");

    // Обновляем 7-сегментный дисплей
    document.getElementById("out-display").textContent = String(outReg).padStart(3, "0");

    // Обновляем 8 светодиодов (биты от 7 до 0)
    const ledsEl = document.getElementById("leds-container");
    let ledsHtml = "";
    for (let bit = 7; bit >= 0; bit--) {
        const isOn = (outReg >> bit) & 1;
        ledsHtml += `<div class="led ${isOn ? "on" : ""}" title="Бит ${bit}"></div>`;
    }
    ledsEl.innerHTML = ledsHtml;

    // Обновляем таблицу ОЗУ
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

// Выполнение одного машинного такта (Fetch -> Decode -> Execute)
function cpuStep() {
    if (halted) {
        document.getElementById("cpu-status").textContent = "Процессор остановлен (HLT). Нажмите «Сброс».";
        stopRun();
        return;
    }

    const instruction = ram[pc];
    const opcode = (instruction >> 4) & 0x0F;
    const addr = instruction & 0x0F;
    const desc = decodeInstruction(instruction);

    pc = (pc + 1) & 0x0F; // Переходим к следующей ячейке (0..15)

    switch (opcode) {
        case 0x1: // LDA
            acc = ram[addr];
            break;
        case 0x2: // ADD
            acc = (acc + ram[addr]) & 0xFF;
            break;
        case 0x3: // SUB
            acc = (acc - ram[addr] + 256) & 0xFF;
            break;
        case 0x4: // STA
            ram[addr] = acc;
            break;
        case 0x6: // JMP
            pc = addr;
            break;
        case 0xE: // OUT
            outReg = acc;
            break;
        case 0xF: // HLT
            halted = true;
            stopRun();
            break;
    }

    document.getElementById("cpu-status").textContent = `Выполнено: ${desc}`;
    renderAll();
}

function toggleRun() {
    if (runTimer) {
        stopRun();
    } else {
        if (halted) resetCpu();
        document.getElementById("run-btn").textContent = "⏸️ Пауза";
        runTimer = setInterval(cpuStep, 450);
    }
}

function stopRun() {
    clearInterval(runTimer);
    runTimer = null;
    document.getElementById("run-btn").textContent = "▶️ Автозапуск";
}

function resetCpu() {
    stopRun();
    pc = 0;
    acc = 0;
    outReg = 0;
    halted = false;
    document.getElementById("cpu-status").textContent = "Сброс выполнен. PC = 0.";
    renderAll();
}

function loadPreset(name, btn) {
    if (btn) {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }
    ram = [...PRESETS[name]];
    resetCpu();
}

// Загружаем счетчик по умолчанию
loadPreset("counter", null);
