// Полноценный эмулятор архитектуры CHIP-8 (4 КБ ОЗУ, видеочип 64x32, 16 регистров)
const c8Canvas = document.getElementById("chip8-canvas");
const c8Ctx = c8Canvas.getContext("2d");

let c8Memory = new Uint8Array(4096);
let c8V = new Uint8Array(16);       // Регистры V0..VF
let c8I = 0;                        // Адресный регистр I
let c8PC = 0x200;                   // Программы CHIP-8 стартуют с 0x200
let c8Display = new Uint8Array(64 * 32);
let c8Keys = new Uint8Array(16);
let c8Running = true;
let currentRomName = "ibm";

// Настоящие программы в машинных кодах (байт-код CHIP-8)
const CHIP8_ROMS = {
    // 1. Классический тест-логотип IBM (1977)
    ibm: [
        0x00, 0xE0, // CLS
        0xA2, 0x2A, // LD I, 0x22A (адрес спрайта 'I')
        0x60, 0x0C, // LD V0, 12 (X)
        0x61, 0x08, // LD V1, 8  (Y)
        0xD0, 0x1F, // DRW V0, V1, 15
        0x70, 0x09, // ADD V0, 9
        0xA2, 0x39, // LD I, 0x239 (спрайт 'B')
        0xD0, 0x1F, // DRW V0, V1, 15
        0xA2, 0x48, // LD I, 0x248 (левая часть 'M')
        0x70, 0x08, // ADD V0, 8
        0xD0, 0x1F, // DRW V0, V1, 15
        0x70, 0x04, // ADD V0, 4
        0xA2, 0x57, // LD I, 0x257 (правая часть 'M')
        0xD0, 0x1F, // DRW V0, V1, 15
        0x12, 0x1E, // JMP 0x21E (бесконечный цикл удержания кадра)
        // Графические спрайты (15 байт на букву):
        0xFF, 0x00, 0xFF, 0x00, 0x3C, 0x00, 0x3C, 0x00, 0x3C, 0x00, 0x3C, 0x00, 0x3C, 0x00, 0xFF,
        0xFF, 0x00, 0xFF, 0x00, 0x38, 0x00, 0x3F, 0x00, 0x3F, 0x00, 0x38, 0x00, 0xFF, 0x00, 0xFF,
        0xFC, 0x00, 0xFE, 0x00, 0x3E, 0x00, 0x3F, 0x00, 0x3B, 0x00, 0x39, 0x00, 0xF8, 0x00, 0xF8,
        0x03, 0x00, 0x07, 0x00, 0x0F, 0x00, 0xBF, 0x00, 0xFB, 0x00, 0xF3, 0x00, 0xE3, 0x00, 0x43
    ],
    // 2. Анимация отскакивающего мяча (сдвиг координат X/Y и XOR-стирание)
    bounce: [
        0x00, 0xE0, // 0x200: CLS
        0x60, 0x0A, // 0x202: V0 = 10 (X)
        0x61, 0x05, // 0x204: V1 = 5  (Y)
        0x62, 0x01, // 0x206: V2 = 1  (скорость dX)
        0x63, 0x01, // 0x208: V3 = 1  (скорость dY)
        0xA2, 0x26, // 0x20A: I = 0x226 (адрес спрайта мяча)
        0xD0, 0x14, // 0x20C: DRW V0, V1, 4 (нарисовать мяч)
        0xD0, 0x14, // 0x20E: DRW V0, V1, 4 (стереть мяч через XOR)
        0x80, 0x24, // 0x210: V0 += V2
        0x81, 0x34, // 0x212: V1 += V3
        0x40, 0x3B, // 0x214: SNE V0, 59 (если X == 59, сменить знак dX)
        0x62, 0xFF, // 0x216: V2 = -1
        0x40, 0x01, // 0x218: SNE V0, 1
        0x62, 0x01, // 0x21A: V2 = +1
        0x41, 0x1B, // 0x21C: SNE V1, 27
        0x63, 0xFF, // 0x21E: V3 = -1
        0x41, 0x01, // 0x220: SNE V1, 1
        0x63, 0x01, // 0x222: V3 = +1
        0x12, 0x0C, // 0x224: JMP 0x20C
        // Спрайт мяча 4x4 пикселя:
        0x60, 0xF0, 0xF0, 0x60
    ],
    // 3. Космический корабль с управлением клавишами 4 (влево) и 6 (вправо)
    ship: [
        0x00, 0xE0, // 0x200: CLS
        0x60, 0x1C, // 0x202: V0 = 28 (X центра экрана)
        0x61, 0x18, // 0x204: V1 = 24 (Y низ экрана)
        0x64, 0x04, // 0x206: V4 = клавиша '4'
        0x65, 0x06, // 0x208: V5 = клавиша '6'
        0xA2, 0x1A, // 0x20A: I = 0x21A (спрайт корабля)
        0xD0, 0x15, // 0x20C: DRW V0, V1, 5
        0xE4, 0xA1, // 0x20E: SKNP V4 (пропустить если не нажата '4')
        0x70, 0xFE, // 0x210: V0 -= 2
        0xE5, 0xA1, // 0x212: SKNP V5 (пропустить если не нажата '6')
        0x70, 0x02, // 0x214: V0 += 2
        0x00, 0xE0, // 0x216: CLS
        0x12, 0x0C, // 0x218: JMP 0x20C
        // Спрайт звездолета 8x5:
        0x18, 0x3C, 0x7E, 0xFF, 0xA5
    ]
};

function initChip8Keypad() {
    const keys = [1,2,3,0xC, 4,5,6,0xD, 7,8,9,0xE, 0xA,0,0xB,0xF];
    const pad = document.getElementById("c8-keypad");
    pad.innerHTML = keys.map(k => {
        const hex = k.toString(16).toUpperCase();
        return `<button class="hex-key" onmousedown="c8Keys[${k}]=1" onmouseup="c8Keys[${k}]=0" onmouseleave="c8Keys[${k}]=0">${hex}</button>`;
    }).join("");
}

function loadChip8Rom(name, btn = null) {
    currentRomName = name;
    if (btn) {
        document.querySelectorAll("#emu-chip8 .filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }
    resetChip8();
}

function resetChip8() {
    c8Memory.fill(0);
    c8V.fill(0);
    c8Display.fill(0);
    c8I = 0;
    c8PC = 0x200;

    const rom = CHIP8_ROMS[currentRomName];
    for (let i = 0; i < rom.length; i++) {
        c8Memory[0x200 + i] = rom[i];
    }
    // Выполняем начальную отрисовку для статичного логотипа
    for (let i = 0; i < 16; i++) stepChip8();
}

// Выполнение одной 16-битной инструкции CHIP-8
function stepChip8() {
    const opcode = (c8Memory[c8PC] << 8) | c8Memory[c8PC + 1];
    c8PC += 2;

    const x = (opcode & 0x0F00) >> 8;
    const y = (opcode & 0x00F0) >> 4;
    const n = opcode & 0x000F;
    const nn = opcode & 0x00FF;
    const nnn = opcode & 0x0FFF;

    let info = `PC: 0x${(c8PC - 2).toString(16).toUpperCase()} | Опкод: 0x${opcode.toString(16).toUpperCase().padStart(4, "0")}`;

    if (opcode === 0x00E0) {
        c8Display.fill(0);
        info += " (CLS — Очистка экрана)";
    } else if ((opcode & 0xF000) === 0x1000) {
        c8PC = nnn;
        info += ` (JMP 0x${nnn.toString(16).toUpperCase()})`;
    } else if ((opcode & 0xF000) === 0x4000) {
        if (c8V[x] !== nn) c8PC += 2;
        info += ` (SNE V${x}, ${nn})`;
    } else if ((opcode & 0xF000) === 0x6000) {
        c8V[x] = nn;
        info += ` (LD V${x}, ${nn})`;
    } else if ((opcode & 0xF000) === 0x7000) {
        c8V[x] = (c8V[x] + nn) & 0xFF;
        info += ` (ADD V${x}, ${nn})`;
    } else if ((opcode & 0xF0FF) === 0x8004) {
        const sum = c8V[x] + c8V[y];
        c8V[0xF] = sum > 255 ? 1 : 0;
        c8V[x] = sum & 0xFF;
        info += ` (ADD V${x}, V${y})`;
    } else if ((opcode & 0xF000) === 0xA000) {
        c8I = nnn;
        info += ` (LD I, 0x${nnn.toString(16).toUpperCase()})`;
    } else if ((opcode & 0xF000) === 0xD000) {
        // Аппаратная отрисовка спрайта 8xN методом XOR
        c8V[0xF] = 0;
        for (let row = 0; row < n; row++) {
            const spriteByte = c8Memory[c8I + row];
            for (let col = 0; col < 8; col++) {
                if ((spriteByte & (0x80 >> col)) !== 0) {
                    const px = (c8V[x] + col) % 64;
                    const py = (c8V[y] + row) % 32;
                    const idx = py * 64 + px;
                    if (c8Display[idx] === 1) c8V[0xF] = 1;
                    c8Display[idx] ^= 1;
                }
            }
        }
        info += ` (DRW V${x}, V${y}, ${n})`;
    } else if ((opcode & 0xF0FF) === 0xE0A1) {
        if (c8Keys[c8V[x]] === 0) c8PC += 2;
        info += ` (SKNP V${x})`;
    }

    document.getElementById("c8-disasm").textContent = info;
    document.getElementById("c8-pc-label").textContent = `PC: 0x${c8PC.toString(16).toUpperCase()}`;
    renderChip8Screen();
    renderChip8Regs();
}

function renderChip8Screen() {
    c8Ctx.fillStyle = "#090d16";
    c8Ctx.fillRect(0, 0, 64, 32);
    c8Ctx.fillStyle = "#22c55e";
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 64; x++) {
            if (c8Display[y * 64 + x]) {
                c8Ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

function renderChip8Regs() {
    const grid = document.getElementById("c8-regs-grid");
    let html = "";
    for (let i = 0; i < 16; i++) {
        const hexName = i.toString(16).toUpperCase();
        html += `<div class="chip8-reg-cell"><b>V${hexName}:</b> ${c8V[i]}</div>`;
    }
    html += `<div class="chip8-reg-cell" style="grid-column: span 4; color: var(--primary);"><b>Регистр индекса I:</b> 0x${c8I.toString(16).toUpperCase()}</div>`;
    grid.innerHTML = html;
}

function toggleChip8Run() {
    c8Running = !c8Running;
    document.getElementById("c8-run-btn").textContent = c8Running ? "⏸️ Пауза" : "▶️ Продолжить";
}

initChip8Keypad();
loadChip8Rom("ibm");

// Главный цикл эмуляции CHIP-8 (~15 инструкций в секунду для наглядности)
setInterval(() => {
    if (c8Running && document.getElementById("emu-chip8").style.display !== "none") {
        stepChip8();
    }
}, 65);
