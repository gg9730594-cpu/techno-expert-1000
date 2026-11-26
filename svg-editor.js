const guiSvg = document.getElementById("gui-svg");
const widgetsLayer = document.getElementById("widgets-layer");

let widgets = [
    { id: 1, type: "label", x: 30, y: 55, w: 180, h: 24, text: "Введите ваше имя:" },
    { id: 2, type: "input", x: 30, y: 85, w: 220, h: 30, text: "Техно-Эксперт" },
    { id: 3, type: "checkbox", x: 30, y: 130, w: 190, h: 24, text: "Запомнить выбор" },
    { id: 4, type: "button", x: 30, y: 175, w: 130, h: 34, text: "Запустить" }
];

let selectedId = 4;
let draggingWidget = null;
let dragOffset = { x: 0, y: 0 };

function addWidget(type) {
    const newId = Date.now();
    const defaults = {
        button:   { w: 120, h: 34, text: "Кнопка" },
        input:    { w: 200, h: 30, text: "Поле ввода..." },
        label:    { w: 150, h: 24, text: "Текстовая метка" },
        checkbox: { w: 170, h: 24, text: "Опция 1" }
    };
    const cfg = defaults[type];
    widgets.push({
        id: newId,
        type,
        x: 40 + (widgets.length * 10) % 100,
        y: 60 + (widgets.length * 15) % 140,
        w: cfg.w,
        h: cfg.h,
        text: cfg.text
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

function escapeXml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderDesigner() {
    const winTitle = document.getElementById("win-title").value || "Программа";
    document.getElementById("svg-win-title").textContent = winTitle;

    widgetsLayer.innerHTML = widgets.map(w => {
        const isSel = w.id === selectedId;
        const selOutline = isSel 
            ? `<rect x="${w.x - 3}" y="${w.y - 3}" width="${w.w + 6}" height="${w.h + 6}" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4 2"/>` 
            : "";

        let inner = "";
        if (w.type === "button") {
            inner = `
                <rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="6" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.5"/>
                <text x="${w.x + w.w / 2}" y="${w.y + w.h / 2 + 5}" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${escapeXml(w.text)}</text>
            `;
        } else if (w.type === "input") {
            inner = `
                <rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
                <text x="${w.x + 10}" y="${w.y + w.h / 2 + 5}" fill="#475569" font-family="sans-serif" font-size="13">${escapeXml(w.text)}</text>
            `;
        } else if (w.type === "label") {
            inner = `
                <text x="${w.x}" y="${w.y + 17}" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="600">${escapeXml(w.text)}</text>
            `;
        } else if (w.type === "checkbox") {
            inner = `
                <rect x="${w.x}" y="${w.y + 4}" width="16" height="16" rx="3" fill="#2563eb"/>
                <path d="M ${w.x + 4} ${w.y + 12} L ${w.x + 7} ${w.y + 15} L ${w.x + 13} ${w.y + 8}" fill="none" stroke="#ffffff" stroke-width="2"/>
                <text x="${w.x + 24}" y="${w.y + 17}" fill="#0f172a" font-family="sans-serif" font-size="13">${escapeXml(w.text)}</text>
            `;
        }

        return `<g class="widget-item" data-id="${w.id}">${selOutline}${inner}</g>`;
    }).join("");

    // Обновляем панель свойств
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
        propCoords.textContent = "Ничего не выбрано";
    }

    generateProgramCode();
}

// Перетаскивание виджетов мышью
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
    // Привязка к сетке 5px и ограничение внутри рабочей области окна (y >= 35)
    let nx = Math.round((pos.x - dragOffset.x) / 5) * 5;
    let ny = Math.round((pos.y - dragOffset.y) / 5) * 5;
    draggingWidget.x = Math.max(5, Math.min(400 - draggingWidget.w - 5, nx));
    draggingWidget.y = Math.max(36, Math.min(300 - draggingWidget.h - 5, ny));
    renderDesigner();
});

window.addEventListener("mouseup", () => {
    draggingWidget = null;
});

// ==========================================
// ГЕНЕРАЦИЯ ИСХОДНОГО КОДА ДЕКСТОП-ПРОГРАММ
// ==========================================
function generateProgramCode() {
    const lang = document.getElementById("lang-select").value;
    const title = document.getElementById("win-title").value || "Моя программа";
    const out = document.getElementById("code-output");
    let code = "";

    if (lang === "cpp_win32") {
        code += "// C++ Win32 API (Компилируется в .exe без сторонних библиотек)\n";
        code += "#include <windows.h>\n\n";
        code += "LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {\n";
        code += "    switch (msg) {\n";
        code += "    case WM_CREATE:\n";

        widgets.forEach((w, i) => {
            const ctrlId = 100 + i;
            // Вычитаем 32px шапки SVG-макета для точных клиентских координат Windows
            const cy = Math.max(5, w.y - 32);
            if (w.type === "button") {
                code += `        CreateWindowW(L"BUTTON", L"${w.text}", WS_VISIBLE | WS_CHILD, ${w.x}, ${cy}, ${w.w}, ${w.h}, hwnd, (HMENU)${ctrlId}, NULL, NULL);\n`;
            } else if (w.type === "input") {
                code += `        CreateWindowW(L"EDIT", L"${w.text}", WS_VISIBLE | WS_CHILD | WS_BORDER, ${w.x}, ${cy}, ${w.w}, ${w.h}, hwnd, (HMENU)${ctrlId}, NULL, NULL);\n`;
            } else if (w.type === "label") {
                code += `        CreateWindowW(L"STATIC", L"${w.text}", WS_VISIBLE | WS_CHILD, ${w.x}, ${cy}, ${w.w}, ${w.h}, hwnd, (HMENU)${ctrlId}, NULL, NULL);\n`;
            } else if (w.type === "checkbox") {
                code += `        CreateWindowW(L"BUTTON", L"${w.text}", WS_VISIBLE | WS_CHILD | BS_AUTOCHECKBOX, ${w.x}, ${cy}, ${w.w}, ${w.h}, hwnd, (HMENU)${ctrlId}, NULL, NULL);\n`;
            }
        });

        code += "        break;\n";
        code += "    case WM_COMMAND:\n";
        code += '        if (LOWORD(wp) >= 100) MessageBoxW(hwnd, L"Событие нажатия!", L"Инфо", MB_OK);\n';
        code += "        break;\n";
        code += "    case WM_DESTROY:\n";
        code += "        PostQuitMessage(0);\n";
        code += "        break;\n";
        code += "    }\n";
        code += "    return DefWindowProcW(hwnd, msg, wp, lp);\n";
        code += "}\n\n";
        code += "int WINAPI WinMain(HINSTANCE hInst, HINSTANCE, LPSTR, int nShow) {\n";
        code += '    WNDCLASSW wc = {0}; wc.lpfnWndProc = WndProc; wc.hInstance = hInst;\n';
        code += '    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1); wc.lpszClassName = L"TechnoApp";\n';
        code += "    RegisterClassW(&wc);\n";
        code += `    HWND hwnd = CreateWindowW(L"TechnoApp", L"${title}", WS_OVERLAPPEDWINDOW | WS_VISIBLE, 100, 100, 420, 310, NULL, NULL, hInst, NULL);\n`;
        code += "    MSG msg; while (GetMessageW(&msg, NULL, 0, 0)) { TranslateMessage(&msg); DispatchMessageW(&msg); }\n";
        code += "    return 0;\n}";
    } 
    else if (lang === "cpp_imgui") {
        code += '// C++ Dear ImGui (Функция отрисовки окна интерфейса)\n';
        code += '#include "imgui.h"\n\n';
        code += "void RenderMyApp() {\n";
        code += '    ImGui::SetNextWindowSize(ImVec2(400, 300), ImGuiCond_FirstUseEver);\n';
        code += `    ImGui::Begin("${title}");\n\n`;

        widgets.forEach((w, i) => {
            const cy = Math.max(25, w.y);
            code += `    ImGui::SetCursorPos(ImVec2(${w.x}, ${cy}));\n`;
            if (w.type === "button") {
                code += `    if (ImGui::Button("${w.text}", ImVec2(${w.w}, ${w.h}))) {\n        // Действие при нажатии\n    }\n\n`;
            } else if (w.type === "input") {
                code += `    static char buf_${i}[128] = "${w.text}";\n`;
                code += `    ImGui::SetNextItemWidth(${w.w});\n`;
                code += `    ImGui::InputText("##input_${i}", buf_${i}, sizeof(buf_${i}));\n\n`;
            } else if (w.type === "label") {
                code += `    ImGui::Text("${w.text}");\n\n`;
            } else if (w.type === "checkbox") {
                code += `    static bool check_${i} = true;\n`;
                code += `    ImGui::Checkbox("${w.text}", &check_${i});\n\n`;
            }
        });

        code += "    ImGui::End();\n}";
    } 
    else if (lang === "python_tk") {
        code += "# Python 3 (Готовая оконная программа на Tkinter)\n";
        code += "import tkinter as tk\nfrom tkinter import messagebox\n\n";
        code += "root = tk.Tk()\n";
        code += `root.title("${title}")\n`;
        code += 'root.geometry("400x270")\n\n';

        widgets.forEach((w, i) => {
            const cy = Math.max(5, w.y - 32);
            if (w.type === "button") {
                code += `btn_${i} = tk.Button(root, text="${w.text}", command=lambda: messagebox.showinfo("Инфо", "Кнопка нажата!"))\n`;
                code += `btn_${i}.place(x=${w.x}, y=${cy}, width=${w.w}, height=${w.h})\n\n`;
            } else if (w.type === "input") {
                code += `entry_${i} = tk.Entry(root)\n`;
                code += `entry_${i}.insert(0, "${w.text}")\n`;
                code += `entry_${i}.place(x=${w.x}, y=${cy}, width=${w.w}, height=${w.h})\n\n`;
            } else if (w.type === "label") {
                code += `lbl_${i} = tk.Label(root, text="${w.text}")\n`;
                code += `lbl_${i}.place(x=${w.x}, y=${cy})\n\n`;
            } else if (w.type === "checkbox") {
                code += `var_${i} = tk.BooleanVar(value=True)\n`;
                code += `chk_${i} = tk.Checkbutton(root, text="${w.text}", variable=var_${i})\n`;
                code += `chk_${i}.place(x=${w.x}, y=${cy})\n\n`;
            }
        });

        code += "root.mainloop()";
    } 
    else if (lang === "csharp_wf") {
        code += "// C# Windows Forms (Создание формы и элементов)\n";
        code += "using System;\nusing System.Drawing;\nusing System.Windows.Forms;\n\n";
        code += "public class MainForm : Form {\n";
        code += "    public MainForm() {\n";
        code += `        this.Text = "${title}";\n`;
        code += "        this.ClientSize = new Size(400, 270);\n\n";

        widgets.forEach((w, i) => {
            const cy = Math.max(5, w.y - 32);
            if (w.type === "button") {
                code += `        var btn${i} = new Button { Text = "${w.text}", Location = new Point(${w.x}, ${cy}), Size = new Size(${w.w}, ${w.h}) };\n`;
                code += `        btn${i}.Click += (s, e) => MessageBox.Show("Нажато!");\n`;
                code += `        this.Controls.Add(btn${i});\n\n`;
            } else if (w.type === "input") {
                code += `        var txt${i} = new TextBox { Text = "${w.text}", Location = new Point(${w.x}, ${cy}), Size = new Size(${w.w}, ${w.h}) };\n`;
                code += `        this.Controls.Add(txt${i});\n\n`;
            } else if (w.type === "label") {
                code += `        var lbl${i} = new Label { Text = "${w.text}", Location = new Point(${w.x}, ${cy}), AutoSize = true };\n`;
                code += `        this.Controls.Add(lbl${i});\n\n`;
            } else if (w.type === "checkbox") {
                code += `        var chk${i} = new CheckBox { Text = "${w.text}", Location = new Point(${w.x}, ${cy}), Checked = true, AutoSize = true };\n`;
                code += `        this.Controls.Add(chk${i});\n\n`;
            }
        });

        code += "    }\n    [STAThread] static void Main() => Application.Run(new MainForm());\n}";
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
