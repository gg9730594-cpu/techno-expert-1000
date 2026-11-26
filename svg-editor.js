const guiSvg = document.getElementById("gui-svg");
const widgetsLayer = document.getElementById("widgets-layer");

let widgets = [
    { id: 1, type: "label", x: 30, y: 55, w: 200, h: 24, text: "Введите пароль:" },
    { id: 2, type: "input", x: 30, y: 85, w: 220, h: 30, text: "1234" },
    { id: 3, type: "checkbox", x: 30, y: 130, w: 190, h: 24, text: "Я согласен" },
    { id: 4, type: "button", x: 30, y: 175, w: 130, h: 34, text: "Войти" }
];

let logicRule = {
    triggerId: 4,
    condType: "equals",
    condVal: "1234",
    thenAct: "msgbox",
    thenVal: "Доступ разрешен!",
    elseVal: "Неверный пароль!"
};

let selectedId = 4;
let draggingWidget = null;
let dragOffset = { x: 0, y: 0 };

const THEMES = {
    modern: {
        winBg: "#f1f5f9", barBg: "#1e293b", barText: "#ffffff",
        btnBg: "#2563eb", btnBorder: "#1d4ed8", btnText: "#ffffff", btnRadius: 6,
        inputBg: "#ffffff", inputBorder: "#94a3b8", inputText: "#334155",
        textColor: "#0f172a", font: "sans-serif"
    },
    win95: {
        winBg: "#c0c0c0", barBg: "#000080", barText: "#ffffff",
        btnBg: "#c0c0c0", btnBorder: "#404040", btnText: "#000000", btnRadius: 0,
        inputBg: "#ffffff", inputBorder: "#808080", inputText: "#000000",
        textColor: "#000000", font: "Tahoma, sans-serif"
    },
    dos: {
        winBg: "#0000aa", barBg: "#00aaaa", barText: "#000000",
        btnBg: "#00aaaa", btnBorder: "#ffffff", btnText: "#000000", btnRadius: 0,
        inputBg: "#000000", inputBorder: "#55ffff", inputText: "#55ff55",
        textColor: "#ffff55", font: "Consolas, monospace"
    },
    dark: {
        winBg: "#1e293b", barBg: "#0f172a", barText: "#f8fafc",
        btnBg: "#3b82f6", btnBorder: "#60a5fa", btnText: "#ffffff", btnRadius: 6,
        inputBg: "#0f172a", inputBorder: "#475569", inputText: "#e2e8f0",
        textColor: "#f1f5f9", font: "sans-serif"
    }
};

function addWidget(type) {
    const newId = Date.now();
    const defaults = {
        button:   { w: 120, h: 34, text: "Кнопка" },
        input:    { w: 200, h: 30, text: "Текст..." },
        label:    { w: 160, h: 24, text: "Статус: ожидание" },
        checkbox: { w: 170, h: 24, text: "Опция 1" }
    };
    const cfg = defaults[type];
    widgets.push({
        id: newId, type,
        x: 40 + (widgets.length * 10) % 100,
        y: 60 + (widgets.length * 15) % 140,
        w: cfg.w, h: cfg.h, text: cfg.text
    });
    selectedId = newId;
    renderDesigner();
}

function deleteSelected() {
    if (!selectedId) return;
    widgets = widgets.filter(w => w.id !== selectedId);
    selectedId = widgets.length ? widgets[widgets.length - 1].id : null;
    renderDesigner();
}

function updateSelectedText(val) {
    const w = widgets.find(item => item.id === selectedId);
    if (!w) return;
    w.text = val;
    renderDesigner();
}

function saveLogic() {
    const trig = document.getElementById("logic-trigger");
    if (trig.value) logicRule.triggerId = Number(trig.value);
    logicRule.condType = document.getElementById("logic-cond-type").value;
    logicRule.condVal = document.getElementById("logic-cond-val").value;
    logicRule.thenAct = document.getElementById("logic-then-act").value;
    logicRule.thenVal = document.getElementById("logic-then-val").value;
    logicRule.elseVal = document.getElementById("logic-else-val").value;

    document.getElementById("logic-cond-val").style.display = logicRule.condType === "equals" ? "inline-block" : "none";
    document.getElementById("logic-else-row").style.display = logicRule.condType === "always" ? "none" : "flex";
    document.getElementById("logic-then-val").style.display = ["msgbox", "set_label"].includes(logicRule.thenAct) ? "inline-block" : "none";

    generateProgramCode();
}

function refreshLogicDropdowns() {
    const trigSelect = document.getElementById("logic-trigger");
    const buttons = widgets.filter(w => w.type === "button");
    if (buttons.length === 0) {
        trigSelect.innerHTML = `<option value="">(Добавьте кнопку)</option>`;
        return;
    }
    if (!buttons.some(b => b.id === logicRule.triggerId)) {
        logicRule.triggerId = buttons.id;
    }
    trigSelect.innerHTML = buttons.map(b => 
        `<option value="${b.id}" ${b.id === logicRule.triggerId ? "selected" : ""}>Кнопка «${b.text}»</option>`
    ).join("");
}

function escapeXml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderDesigner() {
    const themeKey = document.getElementById("win-theme").value;
    const t = THEMES[themeKey];
    const winTitle = document.getElementById("win-title").value || "Программа";

    document.getElementById("svg-win-bg").setAttribute("fill", t.winBg);
    document.getElementById("svg-win-bar").setAttribute("fill", t.barBg);
    const titleEl = document.getElementById("svg-win-title");
    titleEl.setAttribute("fill", t.barText);
    titleEl.setAttribute("font-family", t.font);
    titleEl.textContent = winTitle;

    widgetsLayer.innerHTML = widgets.map(w => {
        const isSel = w.id === selectedId;
        const selOutline = isSel 
            ? `<rect x="${w.x - 3}" y="${w.y - 3}" width="${w.w + 6}" height="${w.h + 6}" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 2"/>` 
            : "";

        let inner = "";
        if (w.type === "button") {
            inner = `
                <rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="${t.btnRadius}" fill="${t.btnBg}" stroke="${t.btnBorder}" stroke-width="2"/>
                <text x="${w.x + w.w / 2}" y="${w.y + w.h / 2 + 5}" fill="${t.btnText}" font-family="${t.font}" font-size="13" font-weight="bold" text-anchor="middle">${escapeXml(w.text)}</text>
            `;
        } else if (w.type === "input") {
            inner = `
                <rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="${t.btnRadius ? 4 : 0}" fill="${t.inputBg}" stroke="${t.inputBorder}" stroke-width="1.5"/>
                <text x="${w.x + 10}" y="${w.y + w.h / 2 + 5}" fill="${t.inputText}" font-family="${t.font}" font-size="13">${escapeXml(w.text)}</text>
            `;
        } else if (w.type === "label") {
            inner = `<text x="${w.x}" y="${w.y + 17}" fill="${t.textColor}" font-family="${t.font}" font-size="14" font-weight="600">${escapeXml(w.text)}</text>`;
        } else if (w.type === "checkbox") {
            inner = `
                <rect x="${w.x}" y="${w.y + 4}" width="16" height="16" rx="${t.btnRadius ? 3 : 0}" fill="${t.btnBg}" stroke="${t.btnBorder}"/>
                <path d="M ${w.x + 4} ${w.y + 12} L ${w.x + 7} ${w.y + 15} L ${w.x + 13} ${w.y + 8}" fill="none" stroke="${t.btnText}" stroke-width="2"/>
                <text x="${w.x + 24}" y="${w.y + 17}" fill="${t.textColor}" font-family="${t.font}" font-size="13">${escapeXml(w.text)}</text>
            `;
        }
        return `<g class="widget-item" data-id="${w.id}">${selOutline}${inner}</g>`;
    }).join("");

    const selWidget = widgets.find(w => w.id === selectedId);
    const propInput = document.getElementById("prop-text");
    const propCoords = document.getElementById("prop-coords");
    if (selWidget) {
        propInput.disabled = false;
        if (document.activeElement !== propInput) propInput.value = selWidget.text;
        propCoords.textContent = `X: ${selWidget.x}, Y: ${selWidget.y}`;
    } else {
        propInput.disabled = true;
        propInput.value = "";
        propCoords.textContent = "Не выбрано";
    }

    refreshLogicDropdowns();
    saveLogic();
}

function getMousePos(evt) {
    const rect = guiSvg.getBoundingClientRect();
    return {
        x: Math.round(((evt.clientX - rect.left) / rect.width) * 400),
        y: Math.round(((evt.clientY - rect.top) / rect.height) * 300)
    };
}

guiSvg.addEventListener("mousedown", (e) => {
    const group = e.target.closest(".widget-item");
    if (!group) return;
    const id = Number(group.getAttribute("data-id"));
    selectedId = id;
    draggingWidget = widgets.find(w => w.id === id);
    const pos = getMousePos(e);
    dragOffset.x = pos.x - draggingWidget.x;
    dragOffset.y = pos.y - draggingWidget.y;
    renderDesigner();
});

window.addEventListener("mousemove", (e) => {
    if (!draggingWidget) return;
    const pos = getMousePos(e);
    let nx = Math.round((pos.x - dragOffset.x) / 5) * 5;
    let ny = Math.round((pos.y - dragOffset.y) / 5) * 5;
    draggingWidget.x = Math.max(5, Math.min(400 - draggingWidget.w - 5, nx));
    draggingWidget.y = Math.max(36, Math.min(300 - draggingWidget.h - 5, ny));
    renderDesigner();
});

window.addEventListener("mouseup", () => { draggingWidget = null; });

// ==========================================
// ГЕНЕРАТОР ПРОГРАММ С АЛГОРИТМОМ ЕСЛИ-ТОГДА
// ==========================================
function generateProgramCode() {
    const lang = document.getElementById("lang-select").value;
    const title = document.getElementById("win-title").value || "Программа";
    const out = document.getElementById("code-output");
    const r = logicRule;
    const trigIdx = widgets.findIndex(w => w.id === r.triggerId);
    const firstInputIdx = widgets.findIndex(w => w.type === "input");
    const firstLabelIdx = widgets.findIndex(w => w.type === "label");
    const firstCheckIdx = widgets.findIndex(w => w.type === "checkbox");

    let code = "";

    if (lang === "python_tk") {
        code += "# Python 3 (Tkinter + Алгоритм ЕСЛИ-ТОГДА-ИНАЧЕ)\nimport tkinter as tk\nfrom tkinter import messagebox\n\n";
        code += `root = tk.Tk()\nroot.title("${title}")\nroot.geometry("400x270")\n\n`;

        widgets.forEach((w, i) => {
            const cy = Math.max(5, w.y - 32);
            if (w.type === "input") code += `input_${i} = tk.Entry(root)\ninput_${i}.insert(0, "${w.text}")\ninput_${i}.place(x=${w.x}, y=${cy}, width=${w.w}, height=${w.h})\n\n`;
            else if (w.type === "label") code += `label_${i} = tk.Label(root, text="${w.text}")\nlabel_${i}.place(x=${w.x}, y=${cy})\n\n`;
            else if (w.type === "checkbox") code += `chk_var_${i} = tk.BooleanVar(value=True)\ntk.Checkbutton(root, text="${w.text}", variable=chk_var_${i}).place(x=${w.x}, y=${cy})\n\n`;
        });

        // Генерируем функцию-обработчик алгоритма
        code += "def on_button_action():\n";
        let condExpr = "True";
        if (r.condType === "not_empty" && firstInputIdx !== -1) condExpr = `len(input_${firstInputIdx}.get().strip()) > 0`;
        else if (r.condType === "equals" && firstInputIdx !== -1) condExpr = `input_${firstInputIdx}.get() == "${r.condVal}"`;
        else if (r.condType === "checked" && firstCheckIdx !== -1) condExpr = `chk_var_${firstCheckIdx}.get() == True`;

        code += `    if ${condExpr}:  # ЕСЛИ\n`;
        if (r.thenAct === "msgbox") code += `        messagebox.showinfo("${title}", "${r.thenVal}")  # ТОГДА\n`;
        else if (r.thenAct === "set_label" && firstLabelIdx !== -1) code += `        label_${firstLabelIdx}.config(text="${r.thenVal}")\n`;
        else if (r.thenAct === "clear_input" && firstInputIdx !== -1) code += `        input_${firstInputIdx}.delete(0, tk.END)\n`;
        else if (r.thenAct === "exit") code += `        root.destroy()\n`;
        else code += `        messagebox.showinfo("${title}", "${r.thenVal}")\n`;

        if (r.condType !== "always") {
            code += `    else:  # ИНАЧЕ\n        messagebox.showerror("Ошибка", "${r.elseVal}")\n`;
        }
        code += "\n";

        widgets.forEach((w, i) => {
            if (w.type === "button") {
                const cy = Math.max(5, w.y - 32);
                const cmd = i === trigIdx ? ", command=on_button_action" : "";
                code += `tk.Button(root, text="${w.text}"${cmd}).place(x=${w.x}, y=${cy}, width=${w.w}, height=${w.h})\n`;
            }
        });
        code += "\nroot.mainloop()";
    }
    else if (lang === "cpp_win32") {
        code += "// C++ Win32 API (Компилируется в .exe)\n#include <windows.h>\n#include <string>\n\n";
        code += "LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {\n    switch (msg) {\n    case WM_CREATE:\n";
        widgets.forEach((w, i) => {
            const id = 100 + i, cy = Math.max(5, w.y - 32);
            if (w.type === "button") code += `        CreateWindowW(L"BUTTON", L"${w.text}", WS_VISIBLE | WS_CHILD, ${w.x}, ${cy}, ${w.w}, ${w.h}, hwnd, (HMENU)${id}, NULL, NULL);\n`;
            else if (w.type === "input") code += `        CreateWindowW(L"EDIT", L"${w.text}", WS_VISIBLE | WS_CHILD | WS_BORDER, ${w.x}, ${cy}, ${w.w}, ${w.h}, hwnd, (HMENU)${id}, NULL, NULL);\n`;
            else if (w.type === "label") code += `        CreateWindowW(L"STATIC", L"${w.text}", WS_VISIBLE | WS_CHILD, ${w.x}, ${cy}, ${w.w}, ${w.h}, hwnd, (HMENU)${id}, NULL, NULL);\n`;
            else if (w.type === "checkbox") code += `        CreateWindowW(L"BUTTON", L"${w.text}", WS_VISIBLE | WS_CHILD | BS_AUTOCHECKBOX, ${w.x}, ${cy}, ${w.w}, ${w.h}, hwnd, (HMENU)${id}, NULL, NULL);\n`;
        });
        code += "        break;\n    case WM_COMMAND:\n";
        if (trigIdx !== -1) {
            code += `        if (LOWORD(wp) == ${100 + trigIdx}) { // ЕСЛИ нажата кнопка\n`;
            if (firstInputIdx !== -1 && (r.condType === "equals" || r.condType === "not_empty")) {
                code += `            wchar_t buf[256]; GetDlgItemTextW(hwnd, ${100 + firstInputIdx}, buf, 256);\n`;
                const cppCond = r.condType === "equals" ? `wcscmp(buf, L"${r.condVal}") == 0` : `wcslen(buf) > 0`;
                code += `            if (${cppCond}) {\n                MessageBoxW(hwnd, L"${r.thenVal}", L"Успех", MB_OK);\n            } else {\n                MessageBoxW(hwnd, L"${r.elseVal}", L"Ошибка", MB_ICONERROR);\n            }\n`;
            } else {
                code += `            MessageBoxW(hwnd, L"${r.thenVal}", L"${title}", MB_OK);\n`;
            }
            code += "        }\n";
        }
        code += `        break;\n    case WM_DESTROY: PostQuitMessage(0); break;\n    }\n    return DefWindowProcW(hwnd, msg, wp, lp);\n}\n\n`;
        code += `int WINAPI WinMain(HINSTANCE hInst, HINSTANCE, LPSTR, int) {\n    WNDCLASSW wc = {0}; wc.lpfnWndProc = WndProc; wc.hInstance = hInst;\n    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1); wc.lpszClassName = L"App";\n    RegisterClassW(&wc);\n    CreateWindowW(L"App", L"${title}", WS_OVERLAPPEDWINDOW | WS_VISIBLE, 100, 100, 420, 310, NULL, NULL, hInst, NULL);\n    MSG msg; while (GetMessageW(&msg, NULL, 0, 0)) { TranslateMessage(&msg); DispatchMessageW(&msg); }\n    return 0;\n}`;
    }
    else if (lang === "csharp_wf") {
        code += "// C# Windows Forms\nusing System;\nusing System.Drawing;\nusing System.Windows.Forms;\n\n";
        code += `public class MainForm : Form {\n    public MainForm() {\n        this.Text = "${title}";\n        this.ClientSize = new Size(400, 270);\n\n`;
        widgets.forEach((w, i) => {
            const cy = Math.max(5, w.y - 32);
            if (w.type === "input") code += `        var txt${i} = new TextBox { Text = "${w.text}", Location = new Point(${w.x}, ${cy}), Size = new Size(${w.w}, ${w.h}) };\n        Controls.Add(txt${i});\n`;
            else if (w.type === "label") code += `        var lbl${i} = new Label { Text = "${w.text}", Location = new Point(${w.x}, ${cy}), AutoSize = true };\n        Controls.Add(lbl${i});\n`;
            else if (w.type === "checkbox") code += `        var chk${i} = new CheckBox { Text = "${w.text}", Location = new Point(${w.x}, ${cy}), Checked = true, AutoSize = true };\n        Controls.Add(chk${i});\n`;
        });
        widgets.forEach((w, i) => {
            if (w.type === "button") {
                const cy = Math.max(5, w.y - 32);
                code += `\n        var btn${i} = new Button { Text = "${w.text}", Location = new Point(${w.x}, ${cy}), Size = new Size(${w.w}, ${w.h}) };\n`;
                if (i === trigIdx) {
                    let csCond = "true";
                    if (r.condType === "equals" && firstInputIdx !== -1) csCond = `txt${firstInputIdx}.Text == "${r.condVal}"`;
                    else if (r.condType === "not_empty" && firstInputIdx !== -1) csCond = `!string.IsNullOrWhiteSpace(txt${firstInputIdx}.Text)`;
                    else if (r.condType === "checked" && firstCheckIdx !== -1) csCond = `chk${firstCheckIdx}.Checked`;
                    code += `        btn${i}.Click += (s, e) => {\n            if (${csCond}) MessageBox.Show("${r.thenVal}");\n            else MessageBox.Show("${r.elseVal}");\n        };\n`;
                }
                code += `        Controls.Add(btn${i});\n`;
            }
        });
        code += "    }\n    [STAThread] static void Main() => Application.Run(new MainForm());\n}";
    }
    else if (lang === "vb6") {
        code += "' Visual Basic 6.0 (Windows 95/98/XP)\nVERSION 5.00\nBegin VB.Form Form1\n";
        code += `   Caption = "${title}"\n   ClientHeight = 4050\n   ClientWidth = 6000\n`;
        widgets.forEach((w, i) => {
            const cy = Math.max(5, w.y - 32) * 15, cx = w.x * 15, cw = w.w * 15, ch = w.h * 15;
            if (w.type === "button") code += `   Begin VB.CommandButton Command${i + 1}\n      Caption = "${w.text}"\n      Left = ${cx}: Top = ${cy}: Width = ${cw}: Height = ${ch}\n   End\n`;
            else if (w.type === "input") code += `   Begin VB.TextBox Text${i + 1}\n      Text = "${w.text}"\n      Left = ${cx}: Top = ${cy}: Width = ${cw}: Height = ${ch}\n   End\n`;
            else if (w.type === "label") code += `   Begin VB.Label Label${i + 1}\n      Caption = "${w.text}"\n      Left = ${cx}: Top = ${cy}: AutoSize = -1\n   End\n`;
            else if (w.type === "checkbox") code += `   Begin VB.CheckBox Check${i + 1}\n      Caption = "${w.text}"\n      Left = ${cx}: Top = ${cy}: Width = ${cw}: Value = 1\n   End\n`;
        });
        code += 'End\nAttribute VB_Name = "Form1"\n\n';
        if (trigIdx !== -1) {
            code += `Private Sub Command${trigIdx + 1}_Click()\n`;
            let vbCond = "True";
            if (r.condType === "equals" && firstInputIdx !== -1) vbCond = `Text${firstInputIdx + 1}.Text = "${r.condVal}"`;
            else if (r.condType === "not_empty" && firstInputIdx !== -1) vbCond = `Len(Text${firstInputIdx + 1}.Text) > 0`;
            else if (r.condType === "checked" && firstCheckIdx !== -1) vbCond = `Check${firstCheckIdx + 1}.Value = 1`;
            code += `    If ${vbCond} Then\n        MsgBox "${r.thenVal}", vbInformation, "${title}"\n    Else\n        MsgBox "${r.elseVal}", vbCritical, "Ошибка"\n    End If\nEnd Sub`;
        }
    }
    else if (lang === "python_qt") {
        code += "# Python 3 (PyQt6)\nimport sys\nfrom PyQt6.QtWidgets import QApplication, QWidget, QPushButton, QLineEdit, QLabel, QCheckBox, QMessageBox\n\n";
        code += `app = QApplication(sys.argv)\nwin = QWidget()\nwin.setWindowTitle("${title}")\nwin.resize(400, 270)\n\n`;
        widgets.forEach((w, i) => {
            const cy = Math.max(5, w.y - 32);
            if (w.type === "input") code += `inp_${i} = QLineEdit("${w.text}", win); inp_${i}.setGeometry(${w.x}, ${cy}, ${w.w}, ${w.h})\n`;
            else if (w.type === "label") code += `lbl_${i} = QLabel("${w.text}", win); lbl_${i}.move(${w.x}, ${cy})\n`;
            else if (w.type === "checkbox") code += `chk_${i} = QCheckBox("${w.text}", win); chk_${i}.setChecked(True); chk_${i}.move(${w.x}, ${cy})\n`;
        });
        code += "\ndef run_logic():\n";
        let qtCond = "True";
        if (r.condType === "equals" && firstInputIdx !== -1) qtCond = `inp_${firstInputIdx}.text() == "${r.condVal}"`;
        else if (r.condType === "not_empty" && firstInputIdx !== -1) qtCond = `bool(inp_${firstInputIdx}.text().strip())`;
        else if (r.condType === "checked" && firstCheckIdx !== -1) qtCond = `chk_${firstCheckIdx}.isChecked()`;
        code += `    if ${qtCond}:\n        QMessageBox.information(win, "${title}", "${r.thenVal}")\n    else:\n        QMessageBox.warning(win, "Ошибка", "${r.elseVal}")\n\n`;
        widgets.forEach((w, i) => {
            if (w.type === "button") {
                const cy = Math.max(5, w.y - 32);
                code += `btn_${i} = QPushButton("${w.text}", win); btn_${i}.setGeometry(${w.x}, ${cy}, ${w.w}, ${w.h})\n`;
                if (i === trigIdx) code += `btn_${i}.clicked.connect(run_logic)\n`;
            }
        });
        code += "\nwin.show()\nsys.exit(app.exec())";
    }
    else if (lang === "pascal_dos") {
        code += "{ Turbo Pascal 7.0 (MS-DOS BGI + Алгоритм) }\nprogram TechnoDOS;\nuses Graph, Crt;\nvar gd, gm: Integer; userText: String;\nbegin\n";
        code += "  gd := Detect; InitGraph(gd, gm, 'C:\\TP\\BGI');\n";
        code += `  SetFillStyle(SolidFill, Blue); Bar(100, 80, 500, 380);\n  SetFillStyle(SolidFill, Cyan); Bar(100, 80, 500, 110);\n`;
        code += `  SetColor(Black); OutTextXY(112, 92, '${title}');\n\n`;
        widgets.forEach(w => {
            const x1 = 100 + w.x, y1 = 80 + w.y, x2 = x1 + w.w, y2 = y1 + w.h;
            if (w.type === "button") code += `  SetFillStyle(SolidFill, Cyan); Bar(${x1}, ${y1}, ${x2}, ${y2}); SetColor(Black); OutTextXY(${x1 + 10}, ${y1 + 12}, '${w.text}');\n`;
            else if (w.type === "input") code += `  SetFillStyle(SolidFill, Black); Bar(${x1}, ${y1}, ${x2}, ${y2}); SetColor(LightGreen); OutTextXY(${x1 + 8}, ${y1 + 10}, '${w.text}');\n`;
            else if (w.type === "label") code += `  SetColor(Yellow); OutTextXY(${x1}, ${y1 + 8}, '${w.text}');\n`;
            else if (w.type === "checkbox") code += `  SetColor(Yellow); OutTextXY(${x1}, ${y1 + 8}, '[X] ${w.text}');\n`;
        });
        code += `\n  { Проверка условия ЕСЛИ-ТОГДА }\n  userText := '${r.condVal}';\n`;
        code += `  if userText = '${r.condVal}' then OutTextXY(130, 340, '${r.thenVal}') else OutTextXY(130, 340, '${r.elseVal}');\n`;
        code += "  ReadKey; CloseGraph;\nend.";
    }
    else if (lang === "qbasic") {
        code += "' QBasic / MS-DOS (SCREEN 12)\nSCREEN 12\nCLS\nLINE (100, 80)-(500, 380), 1, BF\n";
        code += `LOCATE 6, 15: COLOR 15: PRINT "${title}"\n`;
        widgets.forEach(w => {
            const row = Math.max(7, Math.min(22, Math.round((80 + w.y) / 16) + 1));
            const col = Math.max(15, Math.min(60, Math.round((100 + w.x) / 8) + 1));
            if (w.type === "button") code += `LOCATE ${row}, ${col}: COLOR 11: PRINT "[ ${w.text} ]"\n`;
            else if (w.type === "input") code += `LOCATE ${row}, ${col}: COLOR 10: PRINT "> ${w.text}"\n`;
            else if (w.type === "label") code += `LOCATE ${row}, ${col}: COLOR 14: PRINT "${w.text}"\n`;
            else if (w.type === "checkbox") code += `LOCATE ${row}, ${col}: COLOR 14: PRINT "[X] ${w.text}"\n`;
        });
        code += `\nINPUT "Введите значение: ", U$\nIF U$ = "${r.condVal}" THEN PRINT "${r.thenVal}" ELSE PRINT "${r.elseVal}"\n`;
    }
    else if (lang === "cpp_imgui") {
        code += '// C++ Dear ImGui\n#include "imgui.h"\n\nvoid RenderMyApp() {\n';
        code += `    ImGui::Begin("${title}");\n    static std::string statusMsg = "";\n\n`;
        widgets.forEach((w, i) => {
            const cy = Math.max(25, w.y);
            code += `    ImGui::SetCursorPos(ImVec2(${w.x}, ${cy}));\n`;
            if (w.type === "input") code += `    static char buf_${i} = "${w.text}"; ImGui::SetNextItemWidth(${w.w}); ImGui::InputText("##in${i}", buf_${i}, 128);\n`;
            else if (w.type === "label") code += `    ImGui::Text("${w.text}");\n`;
            else if (w.type === "checkbox") code += `    static bool chk_${i} = true; ImGui::Checkbox("${w.text}", &chk_${i});\n`;
            else if (w.type === "button") {
                code += `    if (ImGui::Button("${w.text}", ImVec2(${w.w}, ${w.h}))) {\n`;
                if (i === trigIdx && firstInputIdx !== -1 && r.condType === "equals") {
                    code += `        if (std::string(buf_${firstInputIdx}) == "${r.condVal}") statusMsg = "${r.thenVal}";\n        else statusMsg = "${r.elseVal}";\n`;
                } else {
                    code += `        statusMsg = "${r.thenVal}";\n`;
                }
                code += `    }\n`;
            }
        });
        code += '\n    ImGui::Text("%s", statusMsg.c_str());\n    ImGui::End();\n}';
    }
    else if (lang === "lua_love") {
        code += `-- Lua (LÖVE 2D)\nlocal msg = ""\nfunction love.load()\n    love.window.setTitle("${title}")\n    love.window.setMode(400, 300)\nend\n\n`;
        code += "function love.draw()\n    love.graphics.clear(0.94, 0.96, 0.98)\n";
        widgets.forEach(w => {
            const cy = Math.max(5, w.y - 32);
            if (w.type === "button") code += `    love.graphics.setColor(0.15, 0.39, 0.92)\n    love.graphics.rectangle("fill", ${w.x}, ${cy}, ${w.w}, ${w.h}, 6)\n    love.graphics.setColor(1, 1, 1)\n    love.graphics.print("${w.text}", ${w.x + 12}, ${cy + 10})\n`;
            else if (w.type === "label") code += `    love.graphics.setColor(0.06, 0.09, 0.16)\n    love.graphics.print("${w.text}", ${w.x}, ${cy})\n`;
            else if (w.type === "input") code += `    love.graphics.setColor(1, 1, 1)\n    love.graphics.rectangle("fill", ${w.x}, ${cy}, ${w.w}, ${w.h})\n    love.graphics.setColor(0, 0, 0)\n    love.graphics.print("${w.text}", ${w.x + 8}, ${cy + 8})\n`;
        });
        code += `    love.graphics.setColor(0.1, 0.6, 0.2)\n    love.graphics.print(msg, 30, 230)\nend\n\n`;
        if (trigIdx !== -1) {
            const btn = widgets[trigIdx];
            const cy = Math.max(5, btn.y - 32);
            code += `function love.mousepressed(x, y, button)\n    if button == 1 and x >= ${btn.x} and x <= ${btn.x + btn.w} and y >= ${cy} and y <= ${cy + btn.h} then\n`;
            code += `        msg = "${r.thenVal}" -- Действие ТОГДА\n    end\nend`;
        }
    }

    out.value = code;
}

function copyGeneratedCode() {
    const out = document.getElementById("code-output");
    navigator.clipboard.writeText(out.value).then(() => {
        const btn = document.getElementById("copy-code-btn");
        btn.textContent = "✅ Скопировано!";
        setTimeout(() => btn.textContent = "📋 Копировать", 2000);
    });
}

renderDesigner();
