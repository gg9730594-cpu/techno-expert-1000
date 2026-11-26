let activeSimulator = "nokia";

function switchSim(name, btn) {
    activeSimulator = name;
    document.querySelectorAll(".sim-tabs .filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.getElementById("sim-nokia").style.display = name === "nokia" ? "flex" : "none";
    document.getElementById("sim-tv").style.display = name === "tv" ? "flex" : "none";
    document.getElementById("sim-xp").style.display = name === "xp" ? "flex" : "none";
    document.getElementById("sim-dos").style.display = name === "dos" ? "flex" : "none";
}

// ==========================================
// 1. NOKIA 3310 (ЗМЕЙКА НА SVG)
// ==========================================
const COLS = 18;
const ROWS = 11;
let snake = [{x: 8, y: 5}, {x: 7, y: 5}, {x: 6, y: 5}];
let dir = {x: 1, y: 0};
let nextDir = {x: 1, y: 0};
let food = {x: 13, y: 5};
let score = 0;
let snakeTimer = null;
let snakeRunning = false;

function drawSnakeBoard() {
    const board = document.getElementById("snake-board");
    document.getElementById("nokia-score").textContent = `SCORE: ${String(score).padStart(3, "0")}`;

    let html = `<rect x="${80 + food.x * 10 + 1}" y="${142 + food.y * 10 + 1}" width="8" height="8" rx="2" fill="#1a240b"/>`;
    snake.forEach((seg, idx) => {
        const px = 80 + seg.x * 10;
        const py = 142 + seg.y * 10;
        html += `<rect x="${px + 0.5}" y="${py + 0.5}" width="9" height="9" rx="${idx === 0 ? 3 : 1}" fill="#1a240b"/>`;
    });
    board.innerHTML = html;
}

function spawnFood() {
    while (true) {
        const fx = Math.floor(Math.random() * COLS);
        const fy = Math.floor(Math.random() * ROWS);
        if (!snake.some(s => s.x === fx && s.y === fy)) {
            food = {x: fx, y: fy};
            break;
        }
    }
}

function setSnakeDir(dx, dy) {
    if (!snakeRunning) {
        startSnakeGame();
        return;
    }
    if (dir.x + dx === 0 && dir.y + dy === 0) return;
    nextDir = {x: dx, y: dy};
}

function startSnakeGame() {
    clearInterval(snakeTimer);
    snake = [{x: 8, y: 5}, {x: 7, y: 5}, {x: 6, y: 5}];
    dir = {x: 1, y: 0};
    nextDir = {x: 1, y: 0};
    score = 0;
    snakeRunning = true;

    document.getElementById("nokia-overlay").style.display = "none";
    spawnFood();
    drawSnakeBoard();
    snakeTimer = setInterval(stepSnake, 180);
}

function stepSnake() {
    dir = nextDir;
    const head = {
        x: (snake[0].x + dir.x + COLS) % COLS,
        y: (snake[0].y + dir.y + ROWS) % ROWS
    };

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        snakeRunning = false;
        clearInterval(snakeTimer);
        document.getElementById("nokia-msg-1").textContent = "GAME OVER!";
        document.getElementById("nokia-msg-2").textContent = `Счет: ${score}`;
        document.getElementById("nokia-overlay").style.display = "block";
        return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        spawnFood();
    } else {
        snake.pop();
    }
    drawSnakeBoard();
}

document.addEventListener("keydown", (e) => {
    if (activeSimulator !== "nokia") return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp") setSnakeDir(0, -1);
        if (e.key === "ArrowDown") setSnakeDir(0, 1);
        if (e.key === "ArrowLeft") setSnakeDir(-1, 0);
        if (e.key === "ArrowRight") setSnakeDir(1, 0);
    }
});
drawSnakeBoard();

// ==========================================
// 2. СИМУЛЯТОР ТЕЛЕВИЗОРА
// ==========================================
let tvPower = true;
let tvChannel = 1;
let tvVolume = 6;

function renderTV() {
    const content = document.getElementById("tv-channel-content");
    const led = document.getElementById("tv-led");
    const osd = document.getElementById("tv-osd");
    const chLabel = document.getElementById("tv-ch-label");
    const volLabel = document.getElementById("tv-vol-label");

    if (!tvPower) {
        led.setAttribute("fill", "#ef4444");
        osd.style.display = "none";
        content.innerHTML = `<rect x="95" y="135" width="490" height="330" fill="#090d16"/>`;
        return;
    }

    led.setAttribute("fill", "#22c55e");
    osd.style.display = "block";
    chLabel.textContent = `CH 0${tvChannel}`;
    volLabel.textContent = `VOL ${"|".repeat(tvVolume)}${"-".repeat(10 - tvVolume)}`;

    if (tvChannel === 1) {
        const colors = ["#ffffff", "#facc15", "#06b6d4", "#22c55e", "#d946ef", "#ef4444", "#2563eb"];
        let bars = colors.map((c, i) => `<rect x="${95 + i * 70}" y="135" width="70" height="330" fill="${c}"/>`).join("");
        bars += `
            <circle cx="340" cy="300" r="95" fill="none" stroke="#0f172a" stroke-width="6"/>
            <rect x="220" y="275" width="240" height="50" rx="6" fill="#0f172a"/>
            <text x="340" y="307" fill="#ffffff" font-family="monospace" font-size="22" font-weight="bold" text-anchor="middle">ТЕХНО-ТВ HD</text>
        `;
        content.innerHTML = bars;
    } else if (tvChannel === 2) {
        content.innerHTML = `
            <rect x="95" y="135" width="490" height="330" fill="#1e1b4b"/>
            <circle cx="340" cy="290" r="85" fill="#f97316"/>
            <rect x="95" y="305" width="490" height="160" fill="#0f172a"/>
            <line x1="95" y1="305" x2="585" y2="305" stroke="#ec4899" stroke-width="4"/>
            <text x="340" y="210" fill="#38bdf8" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">КАНАЛ 2: КИНОЗАЛ</text>
        `;
    } else if (tvChannel === 3) {
        content.innerHTML = `
            <rect x="95" y="135" width="490" height="330" fill="#1d4ed8"/>
            <text x="340" y="305" fill="#ffffff" font-family="monospace" font-size="28" font-weight="bold" text-anchor="middle">AV1 — НЕТ СИГНАЛА</text>
        `;
    } else {
        let dots = "";
        for (let i = 0; i < 160; i++) {
            const rx = 95 + Math.random() * 480;
            const ry = 135 + Math.random() * 320;
            const shade = Math.random() > 0.5 ? "#cbd5e1" : "#475569";
            dots += `<rect x="${rx}" y="${ry}" width="12" height="4" fill="${shade}"/>`;
        }
        content.innerHTML = `<rect x="95" y="135" width="490" height="330" fill="#1e293b"/>` + dots;
    }
}

function tvTogglePower() { tvPower = !tvPower; renderTV(); }
function tvChangeChannel(delta) {
    if (!tvPower) return;
    tvChannel += delta;
    if (tvChannel > 4) tvChannel = 1;
    if (tvChannel < 1) tvChannel = 4;
    renderTV();
}
function tvChangeVolume(delta) {
    if (!tvPower) return;
    tvVolume = Math.max(0, Math.min(10, tvVolume + delta));
    renderTV();
}
renderTV();

// ==========================================
// 3. СИМУЛЯТОР WINDOWS XP
// ==========================================
function updateXpClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const el = document.getElementById("xp-clock");
    if (el) el.textContent = `${hh}:${mm}`;
}
setInterval(updateXpClock, 5000);
updateXpClock();

function xpToggleStart() {
    const menu = document.getElementById("xp-start-menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
}
function xpCloseWindow() { document.getElementById("xp-window").style.display = "none"; }

function xpOpenWindow(type) {
    const win = document.getElementById("xp-window");
    const title = document.getElementById("xp-win-title");
    const body = document.getElementById("xp-win-body");
    win.style.display = "block";

    if (type === "mycomp") {
        title.textContent = "Мой компьютер";
        body.innerHTML = `
            <text x="24" y="68" fill="#1e293b" font-size="14" font-weight="bold">Жесткие диски:</text>
            <rect x="24" y="82" width="180" height="55" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
            <text x="38" y="106" fill="#0f172a" font-size="14" font-weight="bold">💾 Локальный диск (C:)</text>
            <text x="38" y="125" fill="#64748b" font-size="12">Свободно: 42.5 ГБ из 80 ГБ</text>
            <rect x="220" y="82" width="180" height="55" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
            <text x="234" y="106" fill="#0f172a" font-size="14" font-weight="bold">💿 CD-дисковод (D:)</text>
            <text x="234" y="125" fill="#64748b" font-size="12">Игры 2005.iso</text>
        `;
    } else if (type === "docs") {
        title.textContent = "Техно-Гид.txt — Блокнот";
        body.innerHTML = `
            <text x="24" y="70" fill="#1e293b" font-family="monospace" font-size="15">Добро пожаловать в Windows XP!</text>
            <text x="24" y="100" fill="#334155" font-family="monospace" font-size="14">Это векторный SVG-симулятор.</text>
            <text x="24" y="126" fill="#334155" font-family="monospace" font-size="14">Попробуйте нажать кнопку «Пуск»</text>
            <text x="24" y="152" fill="#334155" font-family="monospace" font-size="14">в левом нижнем углу экрана.</text>
        `;
    } else if (type === "trash") {
        title.textContent = "Корзина";
        body.innerHTML = `<text x="230" y="155" fill="#64748b" font-size="15" text-anchor="middle">🗑️ Корзина пуста</text>`;
    } else if (type === "error") {
        title.textContent = "Системная ошибка Windows";
        body.innerHTML = `
            <circle cx="55" cy="115" r="22" fill="#ef4444"/>
            <text x="55" y="123" fill="white" font-size="24" font-weight="bold" text-anchor="middle">✕</text>
            <text x="95" y="110" fill="#0f172a" font-size="15" font-weight="bold">Операция выполнена успешно!</text>
            <text x="95" y="134" fill="#475569" font-size="13">Классическое сообщение Windows XP (0x00000000).</text>
            <g class="svg-btn" onclick="xpCloseWindow()">
                <rect x="180" y="180" width="100" height="32" rx="4" fill="#e2e8f0" stroke="#64748b"/>
                <text x="230" y="201" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">ОК</text>
            </g>
        `;
    }
}
xpOpenWindow("mycomp");

// ==========================================
// 4. СИМУЛЯТОР MS-DOS
// ==========================================
let dosHistory = [
    "TECHNO-EXPERT MS-DOS Version 6.22",
    "(C) Copyright Techno-Expert Corp 1994-2026.",
    "",
    "Введите 'help' для списка доступных команд.",
    ""
];

function renderDos() {
    const container = document.getElementById("dos-lines");
    const visible = dosHistory.slice(-13);
    let svgText = visible.map((line, idx) => 
        `<text x="60" y="${72 + idx * 24}">${line}</text>`
    ).join("");
    svgText += `<text x="60" y="${72 + visible.length * 24}">C:\\TECHNO&gt; _</text>`;
    container.innerHTML = svgText;
}

function quickDos(cmd) {
    document.getElementById("dos-cmd").value = cmd;
    runDosCommand();
}

function runDosCommand() {
    const input = document.getElementById("dos-cmd");
    const raw = input.value.trim();
    const cmd = raw.toLowerCase();
    input.value = "";

    if (!cmd) return;
    dosHistory.push(`C:\\TECHNO> ${raw}`);

    if (cmd === "help") {
        dosHistory.push("Доступные команды:");
        dosHistory.push("  DIR    - список файлов на диске C:");
        dosHistory.push("  VER    - версия операционной системы");
        dosHistory.push("  MATRIX - сменить цвет терминала");
        dosHistory.push("  CLS    - очистить экран");
    } else if (cmd === "dir") {
        dosHistory.push(" Содержимое папки C:\\TECHNO:");
        dosHistory.push("  COMMAND  COM     54,645  05-31-94");
        dosHistory.push("  DOOM     EXE    715,493  12-10-93");
        dosHistory.push("  README   TXT      2,048  11-26-26");
    } else if (cmd === "ver") {
        dosHistory.push("MS-DOS Version 6.22 [Techno-Expert SVG Edition]");
    } else if (cmd === "matrix") {
        const g = document.getElementById("dos-lines");
        const cur = g.getAttribute("fill");
        g.setAttribute("fill", cur === "#22c55e" ? "#f59e0b" : "#22c55e");
        dosHistory.push("Цвет люминофора монитора переключен.");
    } else if (cmd === "cls") {
        dosHistory = [];
    } else {
        dosHistory.push(`Неверная команда или имя файла: '${raw}'`);
    }
    renderDos();
}
renderDos();
