// 1. НАСТРОЙКА МЕНЮ
// 1. НАСТРОЙКА МЕНЮ
const MENU_ITEMS = [
    { title: "Главная", url: "index.html" },
    { title: "Телевизоры", url: "tv.html" },
    { title: "Компьютеры", url: "pc.html" },
    { title: "Смартфоны", url: "phones.html" },
    { title: "Тренажер печати", url: "typing.html" },
    { title: "Симуляторы", url: "simulators.html" },
    { title: "SVG → Код", url: "svg-editor.html" },
    { title: "Решение проблем", url: "troubleshooting.html" }
];


// 2. БАЗА СТАТЕЙ
const ARTICLES = [
    {
        id: "tv-oled-vs-qled",
        category: "tv",
        tag: "Телевизоры",
        date: "18 ноября 2026",
        title: "OLED против QLED: какой телевизор выбрать в 2026 году",
        summary: "Разбираем главные отличия матриц, уровень черного цвета и риск выгорания пикселей.",
        content: `
            <p><strong>OLED (Organic Light-Emitting Diode)</strong> — каждый пиксель светится самостоятельно. Это дает идеальный черный цвет и бесконечную контрастность. Идеально для просмотра кино в темной комнате.</p>
            <p><strong>QLED / Mini-LED</strong> — это усовершенствованные ЖК-экраны с яркой светодиодной подсветкой. Они значительно ярче OLED, не боятся статичной картинки и лучше подходят для солнечных комнат.</p>
            <p><strong>Вердикт Техно-Эксперта:</strong> Для киноманов и геймеров — OLED. Для светлой гостиной и просмотра ТВ-каналов — Mini-LED.</p>
        `
    },
    {
        id: "tv-settings",
        category: "tv",
        tag: "Телевизоры",
        date: "15 ноября 2026",
        title: "5 настроек телевизора, которые нужно отключить сразу после покупки",
        summary: "Как убрать «эффект мыльной оперы» и получить естественную цветопередачу за 2 минуты.",
        content: `
            <p>1. <strong>Эко-режим (датчик освещенности):</strong> искусственно затемняет картинку в зависимости от света в комнате.</p>
            <p>2. <strong>Сглаживание движений (TruMotion / Motionflow):</strong> превращает кино с частотой 24 кадра в дешевый телеспектакль.</p>
            <p>3. <strong>Динамическая контрастность:</strong> «съедает» детали в тенях и пересвечивает светлые участки.</p>
            <p>4. <strong>Резкость (Sharpness):</strong> ставьте на 0 или 10%, иначе вокруг объектов появятся белые ореолы.</p>
            <p>5. <strong>Режим изображения «Динамический»:</strong> переключите на «Кино» или «Filmmaker Mode».</p>
        `
    },
    {
        id: "pc-ssd-health",
        category: "pc",
        tag: "Компьютеры",
        date: "12 ноября 2026",
        title: "Как продлить жизнь SSD-накопителю и проверить его износ",
        summary: "Какие настройки Windows лишний раз нагружают память и как следить за здоровьем диска.",
        content: `
            <p>Современные SSD служат годами, но несколько правил помогут сохранить их скорость:</p>
            <p>• <strong>Оставляйте 15–20% свободного места:</strong> контроллеру диска нужно пространство для равномерного распределения износа ячеек.</p>
            <p>• <strong>Никогда не делайте дефрагментацию:</strong> для SSD она бесполезна и только тратит ресурс перезаписи (Windows сама делает команду TRIM).</p>
            <p>• <strong>Проверяйте температуру:</strong> для быстрых NVMe-дисков желательно держать температуру ниже 60°C с помощью радиатора.</p>
        `
    },
    {
        id: "pc-thermal-paste",
        category: "pc",
        tag: "Компьютеры",
        date: "9 ноября 2026",
        title: "Когда пора менять термопасту в компьютере или ноутбуке",
        summary: "Признаки перегрева процессора и правила выбора правильного термоинтерфейса.",
        content: `
            <p>Если кулеры начали шуметь даже при открытии браузера, а в играх появились резкие падения FPS (троттлинг) — пора чистить систему охлаждения.</p>
            <p>В среднем термопасту меняют <strong>раз в 2–3 года</strong> на ПК и <strong>раз в 1.5–2 года</strong> на игровых ноутбуках. Выбирайте проверенные пасты (например, Arctic MX-4/MX-6 или Noctua NT-H1).</p>
        `
    },
    {
        id: "phones-battery-care",
        category: "phones",
        tag: "Смартфоны",
        date: "5 ноября 2026",
        title: "Как правильно заряжать смартфон, чтобы батарея не деградировала",
        summary: "Вредна ли быстрая зарядка на 100 Вт и стоит ли оставлять телефон на кабеле на всю ночь.",
        content: `
            <p>Литий-ионные и кремний-углеродные аккумуляторы больше всего боятся не быстрой зарядки, а <strong>перегрева</strong> и глубокого разряда в ноль.</p>
            <p>• <strong>Держите заряд в диапазоне 20–80%:</strong> современные Android и iPhone позволяют ограничить максимальный заряд на уровне 80–85% в настройках батареи.</p>
            <p>• <strong>Не играйте во время быстрой зарядки:</strong> двойной нагрев (от процессора и от контроллера питания) быстрее всего снижает емкость АКБ.</p>
            <p>• <strong>Используйте оригинальные кабели:</strong> дешевые провода могут греться и давать нестабильное напряжение.</p>
        `
    },
    {
        id: "phones-amoled-pwm",
        category: "phones",
        tag: "Смартфоны",
        date: "2 ноября 2026",
        title: "Что такое ШИМ (PWM) в экранах смартфонов и почему от него устают глаза",
        summary: "Как проверить свой экран на мерцание и включить функцию DC Dimming.",
        content: `
            <p>Многие OLED и AMOLED-дисплеи регулируют яркость не снижением напряжения, а быстрым включением и выключением подсветки (мерцанием). Это называется <strong>ШИМ (широтно-импульсная модуляция)</strong>.</p>
            <p><strong>Что делать, если болят глаза:</strong></p>
            <p>1. Зайдите в <em>Настройки → Экран</em> и включите функцию <strong>«Устранение мерцания» (DC Dimming)</strong>, если она поддерживается.</p>
            <p>2. Не снижайте яркость экрана ниже 35% в темноте — лучше включите ночной режим (фильтр синего) или снизьте точку белого.</p>
        `
    }
];

// 3. УПРАВЛЕНИЕ ИЗБРАННЫМ (localStorage)
function getFavorites() {
    return JSON.parse(localStorage.getItem("techno-favorites") || "[]");
}

function isFavorite(articleId) {
    return getFavorites().includes(articleId);
}

function toggleFavorite(articleId, btnElement = null) {
    let favs = getFavorites();
    if (favs.includes(articleId)) {
        favs = favs.filter(id => id !== articleId);
    } else {
        favs.push(articleId);
    }
    localStorage.setItem("techno-favorites", JSON.stringify(favs));

    // Обновляем вид кнопки сразу, если она передана
    if (btnElement) {
        const saved = favs.includes(articleId);
        btnElement.classList.toggle("saved", saved);
        btnElement.innerHTML = saved ? "❤️ В избранном" : "🤍";
    }

    // Если на главной сейчас открыт фильтр "Избранное", перерисовываем список
    if (typeof currentCategory !== "undefined" && currentCategory === "favorites") {
        applyFilters();
    }
}

// 4. УПРАВЛЕНИЕ ТЕМОЙ
(function initTheme() {
    const savedTheme = localStorage.getItem("techno-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
})();

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("techno-theme", next);
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.getElementById("theme-btn");
    if (!btn) return;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    btn.innerHTML = isDark ? "☀️ Светлая" : "🌙 Темная";
}

// 5. ИНИЦИАЛИЗАЦИЯ ШАПКИ И ПОДВАЛА
document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
});

function renderHeader() {
    const header = document.getElementById("site-header");
    if (!header) return;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = MENU_ITEMS.map(item =>
        `<li><a href="${item.url}" class="${currentPage === item.url ? 'active' : ''}">${item.title}</a></li>`
    ).join("");

    header.innerHTML = `
        <div class="nav-container">
            <a href="index.html" class="logo">⚡ Техно-Эксперт</a>
            <div class="nav-right">
                <nav><ul>${navLinks}</ul></nav>
                <button id="theme-btn" class="theme-toggle" onclick="toggleTheme()"></button>
            </div>
        </div>
    `;
    updateThemeButton();
}

function renderFooter() {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    footer.innerHTML = `<p>© ${new Date().getFullYear()} Техно-Эксперт — База знаний и инструменты для вашей техники.</p>`;
}

// 6. ОТРИСОВКА КАРТОЧЕК СТАТЕЙ (Поддерживает 'all', 'tv', 'pc', 'phones', 'favorites')
function renderArticles(containerId, category = "all", searchQuery = "") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const query = searchQuery.trim().toLowerCase();
    const favs = getFavorites();

    const filtered = ARTICLES.filter(art => {
        let matchCategory = false;
        if (category === "all") matchCategory = true;
        else if (category === "favorites") matchCategory = favs.includes(art.id);
        else matchCategory = art.category === category;

        const matchSearch = !query ||
            art.title.toLowerCase().includes(query) ||
            art.summary.toLowerCase().includes(query) ||
            art.tag.toLowerCase().includes(query);

        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        const emptyMsg = category === "favorites" && !query
            ? "У вас пока нет сохраненных статей. Нажмите на сердечко на любой карточке, чтобы добавить её сюда."
            : `По вашему запросу ничего не найдено.`;
        container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1;">${emptyMsg}</p>`;
        return;
    }

    container.innerHTML = filtered.map(art => {
        const saved = favs.includes(art.id);
        return `
            <article class="card">
                <div>
                    <div class="card-header">
                        <span class="tag">${art.tag}</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${art.date || ""}</span>
                    </div>
                    <h3>${art.title}</h3>
                    <p>${art.summary}</p>
                </div>
                <div class="card-actions">
                    <a href="article.html?id=${art.id}" class="btn btn-outline" style="flex: 1; text-align: center;">Читать статью</a>
                    <button 
                        class="fav-btn ${saved ? 'saved' : ''}" 
                        onclick="toggleFavorite('${art.id}', this)" 
                        title="Сохранить в избранное"
                    >${saved ? '❤️ В избранном' : '🤍'}</button>
                </div>
            </article>
        `;
    }).join("");
}
