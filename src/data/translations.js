export const translations = {
    en: {
        nav: {
            home: "Home",
            create: "Create",
            projects: "Projects",
            about: "About",
            brain: "Brain",
            contact: "Contact"
        },
        meta: {
            title: "ALEVOLDON | AI Builder & Creative Technologist",
            description: "Creating digital products at the intersection of AI, design, and engineering."
        },
        hero: {
            title: "Vladimir",
            subtitle: "AI Builder & Creative Technologist",
            description: "Creating digital products at the intersection of AI, design, and engineering.",
            viewProjects: "View Projects",
            workWithMe: "Work With Me",
            connect: "Get In Touch",
            scrollDown: "Scroll Down"
        },
        spotify: {
            buttonTitle: "System Soundtrack",
            iframeTitle: "Spotify playlist soundtrack",
            soundtrack: "SOUNDTRACK"
        },
        create: {
            heading: "What I Create",
            sysCap: "SYS_CAP",
            hoverToAnalyze: "Hover to analyze",
            liveTelemetry: "Live telemetry",
            items: [
                {
                    title: "AI Prototypes",
                    description: "Functional MVPs powered by AI in days. Combining LLMs, agent chains, and custom UIs into working solutions to validate assumptions fast.",
                    log: [
                        "[AGENT] Initializing neural orchestrator...",
                        "[AGENT] Model: Gemini 3.5 Flash | Temp: 0.4",
                        "[AGENT] Status: ACTIVE | Memory context: 128k",
                        "[PROTOTYPE] MVP flow initialized successfully."
                    ]
                },
                {
                    title: "Web Applications",
                    description: "High-performance frontends and full-stack web architectures using React/Next.js/Vite. Focus on interactivity and smooth visual effects.",
                    log: [
                        "[SYSTEM] Starting Vite development server...",
                        "[SYSTEM] Loading routing matrix & state machine...",
                        "[RENDER] Page components painted in 48.2ms",
                        "[SYSTEM] App status: ONLINE | Node environment: v20"
                    ]
                },
                {
                    title: "Automation Scenarios",
                    description: "Streamlining routines via scripts and API integrations. Data extraction, content LLM processing, automated posting, and smart syncing.",
                    log: [
                        "[CRON] Running sync pipeline (Telegram -> DB)...",
                        "[FETCH] Retreived 12 active posts. Parsing...",
                        "[LLM] Extracted tags & keywords: OK",
                        "[DATABASE] 12 entries synced successfully."
                    ]
                },
                {
                    title: "UI/UX Concepts",
                    description: "Immersive user interfaces: glassmorphism panels, shader gradients, 3D orbits, procedural audio feedback, and micro-interactions.",
                    icon: "sliders",
                    log: [
                        "[GUI] Loading Space Grotesk typography...",
                        "[THEME] Compiling Cyberpunk theme preset...",
                        "[FX] Initializing WebGL render pass context...",
                        "[RENDER] Glassmorphic layout: NOMINAL"
                    ]
                },
                {
                    title: "AI & Sound Experiments",
                    description: "Merging Web Audio and generative sound design. Real-time procedural synthesis in the browser, custom synths, and interactive audio.",
                    log: [
                        "[AUDIO] Activating Web Audio API context...",
                        "[SYNTH] CZ-1 Eurorack module patch initialized...",
                        "[LFO] Frequency set: 0.8Hz | Waveform: SINE",
                        "[AUDIO] Spatial coordinates active: Panning nominal."
                    ]
                },
                {
                    title: "Prompt Engineering",
                    description: "Building robust prompts and cognitive structures. System instructions, RAG context templates, chains of thought, and LLM benchmarking.",
                    log: [
                        "[PROMPT] Initializing System Instructions...",
                        "[CHAIN] Loading multi-step reasoning pathway...",
                        "[CONTEXT] Vector store similarity match score: 0.94",
                        "[LOGIC] Thought loop depth capped at N=8."
                    ]
                }
            ]
        },
        projects: {
            heading: "SELECTED",
            headingSpan: "WORKS",
            subheading: "Explore the project matrix and prototypes",
            toggleFeatured: "Featured Projects",
            toggleTelemetry: "GitHub Telemetry",
            resultLabel: "Outcome / Result:",
            noDesc: "Repository telemetry synchronization in progress.",
            items: [
                {
                    name: "index",
                    description: "Interactive project catalog and research roadmap mapping personal studies in AI, sound, and creative technology.",
                    result: "Created a unified public hub with visual project mapping and structural connections.",
                    language: "JavaScript"
                },
                {
                    name: "bot-manager-dashboard",
                    description: "Windows Process Launcher & Live Control Panel for Telegram/Discord bots, scripts, and background services.",
                    result: "Automated bot management and logging with real-time WebSockets & auto-restart.",
                    language: "JavaScript"
                },
                {
                    name: "WindyCheck_bot",
                    description: "Asynchronous Telegram bot for real-time wind tracking, weather forecasts, and automated alerts for windsurfers and sailors.",
                    result: "Delivers automated real-time wind alerts, wind rose charts, and forecast telemetry.",
                    language: "Python"
                },
                {
                    name: "portfolio",
                    description: "Generative portfolio website featuring live GitHub telemetry, Three.js backgrounds, and serverless contact flow.",
                    result: "Created an interactive high-performance portfolio hub.",
                    language: "JavaScript"
                },
                {
                    name: "UPS-ExeGate-SpecialPro-UNB-1200",
                    description: "Python telemetry reader & monitoring service for ExeGate SpecialPro UNB-1200 UPS systems.",
                    result: "Provides automated power stability monitoring and status alerts.",
                    language: "Python"
                },
                {
                    name: "Dump-Assistant-Bot",
                    description: "Smart Telegram bot managing smart comments templates inside channels using LLM-assisted context extraction.",
                    result: "Automated the moderation and template selection flow, reducing manual overhead by 80%.",
                    language: "JavaScript"
                },
                {
                    name: "obsidian_posts_smart_tags",
                    description: "Node.js sync utility pulling Telegram channel posts into Obsidian Markdown notes with automatic AI smart tagging.",
                    result: "Streamlined note archiving and knowledge graph creation.",
                    language: "JavaScript"
                },
                {
                    name: "full_roadmap_ai_enthusiast_2026",
                    description: "Interactive AI Developer Roadmap 2026: building autonomous agents, MCP servers, and micro-SaaS applications.",
                    result: "Structured a comprehensive study map for modern AI engineering.",
                    language: "JavaScript"
                },
                {
                    name: "Smart-Daw-Landing-React",
                    description: "Premium dark-themed React product landing page for an intelligent audio workstation assistant (Smart DAW).",
                    result: "Developed a conversion-oriented product page with inline audio demos and interactive knob UI.",
                    language: "TypeScript"
                },
                {
                    name: "Modular-Genesis",
                    description: "Procedural modular synthesis presets, creative patches for Max/MSP/RNBO, and generative audio design patches.",
                    result: "Formed an open repository of preset blocks to deploy custom browser-based synthesizers.",
                    language: "JavaScript"
                },
                {
                    name: "sc_liked_to_playlist_web",
                    description: "Clean responsive web app to download liked tracks from SoundCloud and automatically compile local MP3 playlists.",
                    result: "Wired direct compilation scripts sorting and syncing files into directories with one click.",
                    language: "JavaScript"
                },
                {
                    name: "habit-tracker",
                    description: "Full-stack habit-tracking tool featuring a GitHub-style commitment grid calendar and custom analytical streak tracking.",
                    result: "Built a gamified tracking interface providing visual streaks and calendar metrics.",
                    language: "React"
                }
            ]
        },
        about: {
            heading: "System Analytics",
            bioHeader: "SYS_PROFILE_BIO",
            bioText: "My path went through industrial design, manufacturing, electronic music, web development, and artificial intelligence. Thanks to this cross-disciplinary background, I look at products simultaneously as a creator, designer, and engineer.",
            radarHeader: "AVAILABILITY_RADAR",
            statusLabel: "STATUS: OPEN FOR COOPERATION",
            capacityLabel: "CURRENT_STACK_LOAD",
            telemetryLabel: "SYS_TELEMETRY: NOMINAL",
            items: [
                { text: "Remote Work: Full-time / part-time availability (UTC+3)" },
                { text: "Contract Projects: MVP development, prompt pipelines, dynamic frontends" },
                { text: "Early-Stage Startups: Rapid prototyping, launching MVP systems" },
                { text: "Focus Areas: AI Agent integration, Web Audio, Generative UI" }
            ],
            gitTitle: "Vladimir's GitHub Stats",
            gitLangs: "Most Used Languages"
        },
        brain: {
            badge: "Mind Vault",
            heading: "Mind",
            headingAccent: "Vault",
            headingSuffix: "& Knowledge Graph",
            subheading: "Interactive archive of thoughts & notes",
            hint: "Each node represents a post or tag. Drag nodes or pan to explore, use scroll wheel to zoom, and click to read.",
            loading: "Loading Knowledge Base...",
            backToFeed: "Back to Feed",
            searchPlaceholder: "Search posts, tags, or links...",
            limit: "Limit",
            hideTags: "Hide Tags",
            showTags: "Show Tags",
            freeze: "Freeze",
            simulate: "Simulate",
            recenterTitle: "Recenter and stabilize",
            posts: "Posts",
            tags: "Tags",
            links: "Links",
            postFeed: "Post Feed",
            clearFilter: "Clear Filter",
            date: "Date",
            tagsHeading: "Tags",
            noPostsFound: "No posts found",
            noPostsHint: "Try clearing tags or changing search query.",
            untitledPost: "Untitled post",
            quickFilters: "Knowledge Base:",
            filterAll: "All",
            filters: [
                { tag: "ai", label: "Artificial Intelligence" },
                { tag: "design", label: "Design & UX" },
                { tag: "3d", label: "3D & WebGL" },
                { tag: "modularsynth", label: "Synth & Sound" },
                { tag: "dev", label: "Development" }
            ]
        },
        contact: {
            subheading: "Ready to collaborate on the next big thing? Send details below.",
            nameLabel: "Name",
            namePlaceholder: "Your name",
            emailLabel: "Email",
            emailPlaceholder: "you@example.com",
            telegramLabel: "Telegram",
            telegramPlaceholder: "@yourusername (optional)",
            messageLabel: "Message",
            messagePlaceholder: "Tell me about the project, timeline, and what you need.",
            protectLabel: "Complete the spam check before sending.",
            btnSend: "Send Message",
            btnSending: "Sending...",
            successMsg: "Message sent. I will get it in Telegram.",
            errorMsg: "Spam protection failed to load. Refresh and try again.",
            turnstileProtected: "Protected by Cloudflare Turnstile."
        },
        controls: {
            title: "AMBIENT ENGINE",
            sysMode: "SYSTEM OPER. MODE",
            manualLock: "Manual Lock",
            manualLockDesc: "Fix theme to selected palette",
            chronoSync: "Chrono Sync",
            chronoSyncDesc: "Sync theme with local hour",
            matrixCycle: "Matrix Cycle",
            matrixCycleDesc: "Cycle themes automatically",
            chronoStatus: "CHRONO STATUS",
            nextCycle: "NEXT DRIFT CYCLE",
            matrixPalette: "MATRIX PALETTE",
            audioMatrix: "AUDIO MATRIX",
            perfProfile: "PERFORMANCE PROFILE",
            brightness: "BRIGHTNESS",
            driftVelocity: "DRIFT VELOCITY",
            patchConsole: "Patch Console",
            ready: "READY",
            nominal: "NOMINAL",
            engine: "ENGINE",
            palette: "PALETTE",
            mode: "MODE",
            load: "LOAD",
            audioModes: {
                silent: { label: "Silent", desc: "Mute all sounds" },
                ui: { label: "UI FX", desc: "Hover & click feedback" },
                immersive: { label: "Ambient", desc: "Full drone & spatial audio" }
            },
            quality: {
                high: { label: "High", desc: "High quality, 1.15x resolution scale, 60 FPS cap" },
                balanced: { label: "Bal", desc: "Balanced, 1.0x resolution scale, 45 FPS cap" },
                eco: { label: "Eco", desc: "Eco friendly, 0.75x resolution scale, 24 FPS cap" },
                static: { label: "Static", desc: "Render background once, freeze animations, 0% GPU load" }
            }
        }
    },
    ru: {
        nav: {
            home: "Главная",
            create: "Создаю",
            projects: "Проекты",
            about: "О себе",
            brain: "Мысли",
            contact: "Контакты"
        },
        meta: {
            title: "ALEVOLDON | AI Builder & Creative Technologist",
            description: "Создаю цифровые продукты на стыке ИИ, дизайна и разработки."
        },
        hero: {
            title: "Владимир",
            subtitle: "AI Builder & Creative Technologist",
            description: "Создаю цифровые продукты на стыке ИИ, дизайна и разработки.",
            viewProjects: "Посмотреть проекты",
            workWithMe: "Работать со мной",
            connect: "Связаться",
            scrollDown: "Прокрутить вниз"
        },
        spotify: {
            buttonTitle: "Системный саундтрек",
            iframeTitle: "Плейлист Spotify",
            soundtrack: "САУНДТРЕК"
        },
        create: {
            heading: "Что я создаю",
            sysCap: "SYS_CAP",
            hoverToAnalyze: "Наведите для анализа",
            liveTelemetry: "Живая телеметрия",
            items: [
                {
                    title: "AI-Прототипы",
                    description: "Функциональные MVP на базе ИИ за считанные дни. Объединяю LLM, агентные цепочки и кастомный UI в единые работающие решения для быстрой проверки гипотез.",
                    log: [
                        "[AGENT] Инициализация нейрооркестратора...",
                        "[AGENT] Модель: Gemini 3.5 Flash | Темп: 0.4",
                        "[AGENT] Статус: АКТИВЕН | Контекст: 128k",
                        "[PROTOTYPE] MVP цепочка успешно запущена."
                    ]
                },
                {
                    title: "Веб-Приложения",
                    description: "Высокопроизводительные интерфейсы и full-stack архитектура на React/Next.js/Vite. Фокус на интерактивности, отзывчивости и сложных визуальных эффектах.",
                    log: [
                        "[SYSTEM] Запуск Vite сервера разработки...",
                        "[SYSTEM] Загрузка роутера и стейт-машины...",
                        "[RENDER] Компоненты отрисованы за 48.2мс",
                        "[SYSTEM] Статус приложения: ONLINE | Node: v20"
                    ]
                },
                {
                    title: "Автоматизация",
                    description: "Оптимизация рутины через скрипты и коннекторы. Сбор данных (scraping), LLM-фильтрация контента, автопостинг и умная синхронизация (например, Telegram -> Сайт).",
                    log: [
                        "[CRON] Запуск скрипта синхронизации (TG -> DB)...",
                        "[FETCH] Получено 12 постов. Парсинг...",
                        "[LLM] Извлечение ключевых тегов: Успешно",
                        "[DATABASE] 12 записей синхронизировано в БД."
                    ]
                },
                {
                    title: "UI/UX Концепции",
                    description: "Интерфейсы будущего с глубоким погружением: стеклянный дизайн (glassmorphism), неоновые шейдеры, трехмерная навигация, процедурный звук и плавные микро-анимации.",
                    log: [
                        "[GUI] Загрузка шрифтов Space Grotesk...",
                        "[THEME] Компиляция пресета Cyberpunk...",
                        "[FX] Инициализация контекста WebGL рендеринга...",
                        "[RENDER] Стеклянный интерфейс: НОМИНАЛ"
                    ]
                },
                {
                    title: "AI-Эксперименты",
                    description: "Проекты на стыке генеративного звука и ИИ. Разработка процедурных аудио-движков, синтезаторов звуков в реальном времени и нейронного синтеза в вебе.",
                    log: [
                        "[AUDIO] Активация контекста Web Audio API...",
                        "[SYNTH] Eurorack CZ-1 пресет инициализирован...",
                        "[LFO] Частота: 0.8Гц | Форма волны: СИНУС",
                        "[AUDIO] Пространственные координаты: Панорама ок."
                    ]
                },
                {
                    title: "Промт-Инжиниринг",
                    description: "Настройка промт-конвейеров и логики рассуждений. Разработка системных инструкций для агентов, RAG-контекстов, chain-of-thought шаблонов и бенчмарков.",
                    log: [
                        "[PROMPT] Инициализация System Instructions...",
                        "[CHAIN] Загрузка шагов рассуждения (chain-of-thought)...",
                        "[CONTEXT] Совпадение вектора сходства: 0.94",
                        "[LOGIC] Глубина мыслительного цикла ограничена N=8."
                    ]
                }
            ]
        },
        projects: {
            heading: "ИЗБРАННЫЕ",
            headingSpan: "ПРОЕКТЫ",
            subheading: "Исследуйте матрицу проектов и прототипов",
            toggleFeatured: "Избранные проекты",
            toggleTelemetry: "GitHub Telemetry",
            resultLabel: "Результат:",
            noDesc: "Синхронизация описания репозитория в процессе.",
            items: [
                {
                    name: "index",
                    description: "Интерактивная карта проектов и дорожная карта (roadmap) личных исследований в области AI, звука и креативных технологий. Систематизирует базы знаний.",
                    result: "Создан единый публичный хаб со сложным визуальным маппингом и связями проектов.",
                    language: "JavaScript"
                },
                {
                    name: "bot-manager-dashboard",
                    description: "Панель управления и запуска процессов в реальном времени для Telegram/Discord ботов, скриптов и туннелей.",
                    result: "Автоматизирован менеджмент процессов с живой трансляцией логов через WebSockets и автоперезапуском.",
                    language: "JavaScript"
                },
                {
                    name: "WindyCheck_bot",
                    description: "Асинхронный Telegram-бот для мониторинга скорости ветра, порывов, прогнозов погоды и автоматических алертов для кайтсерферов и яхтсменов.",
                    result: "Автоматизировал выдачу графиков розы ветров и мгновенных алертов о ветре.",
                    language: "Python"
                },
                {
                    name: "portfolio",
                    description: "Интерактивный веб-сайт портфолио с живой телеметрией GitHub, 3D-фоном Three.js и отправкой сообщений в Telegram.",
                    result: "Создан высокопроизводительный интерактивный генеративный веб-хаб.",
                    language: "JavaScript"
                },
                {
                    name: "UPS-ExeGate-SpecialPro-UNB-1200",
                    description: "Скрипт мониторинга и съема телеметрии для источников бесперебойного питания ExeGate UNB-1200.",
                    result: "Обеспечивает автоматический контроль стабильности питания и оповещения при сбоях.",
                    language: "Python"
                },
                {
                    name: "Dump-Assistant-Bot",
                    description: "Умный Telegram-бот для управления шаблонами комментариев в каналах с использованием контекстного извлечения (context extraction) на базе LLM.",
                    result: "Автоматизирован процесс фильтрации и подбора ответов, сократив время модерации на 80%.",
                    language: "JavaScript"
                },
                {
                    name: "obsidian_posts_smart_tags",
                    description: "Скрипт синхронизации постов Telegram в заметки Obsidian с автоматическим тегированием и обработкой на базе ИИ.",
                    result: "Автоматизировал архивацию постов в единую структурированную базу знаний.",
                    language: "JavaScript"
                },
                {
                    name: "full_roadmap_ai_enthusiast_2026",
                    description: "Интерактивная дорожная карта ИИ-разработчика 2026: создание автономных агентов, MCP-серверов и micro-SaaS приложений.",
                    result: "Сформировал структурный план обучения продвинутому AI-инжинирингу.",
                    language: "JavaScript"
                },
                {
                    name: "Smart-Daw-Landing-React",
                    description: "Премиальный темный лендинг на React для интеллектуального ассистента в сфере музыкального продакшена (Smart DAW Audio Assistant).",
                    result: "Разработан высококонверсионный сайт с интерактивными звуковыми превью и визуализациями.",
                    language: "TypeScript"
                },
                {
                    name: "Modular-Genesis",
                    description: "Библиотека процедурного модульного синтеза, патчи для Max/MSP/RNBO, креативное кодирование и пресеты генеративного звука.",
                    result: "Сформирован открытый репозиторий пресетов для мгновенного развертывания звуковых движков.",
                    language: "JavaScript"
                },
                {
                    name: "sc_liked_to_playlist_web",
                    description: "Веб-интерфейс для управления лайкнутыми треками в SoundCloud и автоматического компилятора плейлистов из локальных MP3 файлов.",
                    result: "Настроен парсинг и сборка аудиофайлов в локальные медиа-библиотеки в один клик.",
                    language: "JavaScript"
                },
                {
                    name: "habit-tracker",
                    description: "Фуллстек-приложение для отслеживания привычек с интерактивным календарем-сеткой в стиле конвейера коммитов GitHub и аналитикой серий.",
                    result: "Реализован удобный персональный планировщик с визуальным игровым откликом.",
                    language: "React"
                }
            ]
        },
        about: {
            heading: "Аналитика системы",
            bioHeader: "SYS_PROFILE_BIO",
            bioText: "Мой путь прошёл через дизайн, производство, музыку, веб-разработку и искусственный интеллект. Благодаря этому я умею смотреть на проекты одновременно как создатель, дизайнер и инженер.",
            radarHeader: "AVAILABILITY_RADAR",
            statusLabel: "STATUS: OPEN FOR COOPERATION",
            capacityLabel: "CURRENT_STACK_LOAD",
            telemetryLabel: "SYS_TELEMETRY: NOMINAL",
            items: [
                { text: "Удаленная работа: Полная / Частичная занятость (UTC+3)" },
                { text: "Контрактные проекты: Разработка MVP, автоматизация, AI-прототипы" },
                { text: "Стартапы на ранней стадии: Быстрое прототипирование и запуск" },
                { text: "Сфера интересов: AI-агенты, Web Audio, Generative UI, инди-хакинг" }
            ],
            gitTitle: "GitHub статистика Владимира",
            gitLangs: "Основные языки кода"
        },
        brain: {
            badge: "Хранилище мыслей",
            heading: "Mind",
            headingAccent: "Vault",
            headingSuffix: "и граф знаний",
            subheading: "Интерактивный архив мыслей и заметок",
            hint: "Каждый узел — это публикация или тег. Двигайте узлы для взаимодействия, используйте колесо мыши для масштабирования, кликайте для чтения.",
            loading: "Загрузка базы знаний...",
            backToFeed: "Назад к ленте",
            searchPlaceholder: "Поиск постов, тегов или ссылок...",
            limit: "Лимит",
            hideTags: "Скрыть теги",
            showTags: "Показать теги",
            freeze: "Заморозить",
            simulate: "Симуляция",
            recenterTitle: "Центрировать и стабилизировать",
            posts: "Посты",
            tags: "Теги",
            links: "Связи",
            postFeed: "Лента постов",
            clearFilter: "Сбросить фильтр",
            date: "Дата",
            tagsHeading: "Теги",
            noPostsFound: "Посты не найдены",
            noPostsHint: "Попробуйте сбросить теги или изменить поисковый запрос.",
            untitledPost: "Без названия",
            quickFilters: "База знаний:",
            filterAll: "Все",
            filters: [
                { tag: "ai", label: "Искусственный интеллект" },
                { tag: "design", label: "Дизайн & UX" },
                { tag: "3d", label: "3D & WebGL" },
                { tag: "modularsynth", label: "Синтез & Звук" },
                { tag: "dev", label: "Разработка" }
            ]
        },
        contact: {
            subheading: "Готовы создать что-то новое? Напишите детали вашего проекта ниже.",
            nameLabel: "Имя",
            namePlaceholder: "Ваше имя",
            emailLabel: "Email",
            emailPlaceholder: "you@example.com",
            telegramLabel: "Telegram",
            telegramPlaceholder: "@yourusername (необязательно)",
            messageLabel: "Сообщение",
            messagePlaceholder: "Расскажите о проекте, сроках и ваших задачах.",
            protectLabel: "Пройдите проверку от спама перед отправкой.",
            btnSend: "Отправить сообщение",
            btnSending: "Отправка...",
            successMsg: "Сообщение отправлено. Я получу его в Telegram.",
            errorMsg: "Проверка на спам не загрузилась. Обновите страницу.",
            turnstileProtected: "Защищено Cloudflare Turnstile."
        },
        controls: {
            title: "ДВИЖОК ЭМБИЕНТА",
            sysMode: "РЕЖИМ СИСТЕМЫ",
            manualLock: "Ручной режим",
            manualLockDesc: "Фиксация выбранной палитры темы",
            chronoSync: "Хроно-синхрон",
            chronoSyncDesc: "Синхронизация темы с вашим временем",
            matrixCycle: "Цикл матрицы",
            matrixCycleDesc: "Автоматическая смена тем",
            chronoStatus: "СТАТУС ХРОНО",
            nextCycle: "СЛЕДУЮЩИЙ ЦИКЛ",
            matrixPalette: "ПАЛИТРА МАТРИЦЫ",
            audioMatrix: "АУДИО МАТРИЦА",
            perfProfile: "ПРОФИЛЬ ПРОИЗВОДИТЕЛЬНОСТИ",
            brightness: "ЯРКОСТЬ",
            driftVelocity: "СКОРОСТЬ ДРЕЙФА",
            patchConsole: "Консоль синтеза",
            ready: "ГОТОВ",
            nominal: "НОРМА",
            engine: "ДВИЖОК",
            palette: "ПАЛИТРА",
            mode: "РЕЖИМ",
            load: "НАГРУЗКА",
            audioModes: {
                silent: { label: "Тишина", desc: "Выключить все звуки" },
                ui: { label: "UI FX", desc: "Звуковой отклик кликов и наведения" },
                immersive: { label: "Эмбиент", desc: "Полное аудио-погружение и пространственный звук" }
            },
            quality: {
                high: { label: "Макс", desc: "Высокое качество, 1.15x разрешение, до 60 FPS" },
                balanced: { label: "Бал", desc: "Сбалансированное, 1.0x разрешение, до 45 FPS" },
                eco: { label: "Эко", desc: "Энергосберегающее, 0.75x разрешение, до 24 FPS" },
                static: { label: "Статик", desc: "Статичный фон, заморозка анимаций, 0% GPU" }
            }
        }
    }
};
