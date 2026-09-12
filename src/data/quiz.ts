export type NicheId =
  | 'mobile_game'
  | 'telegram_game'
  | 'ops_saas'
  | 'bot_product'
  | 'web_tool'
  | 'digital_pack'

export type ScoreMap = Record<NicheId, number>

export interface NicheProfile {
  id: NicheId
  title: string
  subtitle: string
  fitLabel: string
  why: string[]
  watchouts: string[]
  firstStep: string
  hoursFit: string
}

export const NICHES: Record<NicheId, NicheProfile> = {
  mobile_game: {
    id: 'mobile_game',
    title: 'Мобильная игра',
    subtitle: 'Свой игровой продукт в сторах',
    fitLabel: 'Длинный цикл, сильный «вау»-потенциал',
    why: [
      'Тебе нравится создавать ощущения, а не только решать задачи.',
      'Готов учиться геймдизайну, полировке и метрикам удержания.',
      '3 часа в день хватает на маленький прототип, если scope жёстко резать.',
    ],
    watchouts: [
      'До первых денег часто 3–9+ месяцев, если делать «настоящую» игру.',
      'ASO, креативы и баланс — отдельная работа рядом с кодом.',
      'Риск утонуть в фичах без релиза.',
    ],
    firstStep:
      'Сделать 1 игровой прототип на 1 механику и проверить «интересно ли 10 людям 3 минуты подряд».',
    hoursFit: 'При 3 ч/день реалистичен hypercasual / puzzle / one-mechanic, не AAA.',
  },
  telegram_game: {
    id: 'telegram_game',
    title: 'Игра / мини-приложение в Telegram',
    subtitle: 'Игровой продукт ближе к аудитории и быстрее к тесту',
    fitLabel: 'Компромисс: игра + быстрый фидбек',
    why: [
      'Можно совместить интерес к играм с более коротким циклом релиза.',
      'Дистрибуция через чаты, ботов и вирусные механики проще, чем App Store.',
      'Хорошо ложится на ~3 часа в день: web-стек + узкий scope.',
    ],
    watchouts: [
      'Платёжные и антифрод-ограничения Telegram нужно учитывать с первого дня.',
      'Монетизация часто слабее «классического» стора без сильной петли.',
      'Легко сделать «кликер ради кликера» без уникальности.',
    ],
    firstStep:
      'Выбрать одну социальную/соревновательную механику и собрать playable demo в Telegram Mini App.',
    hoursFit: 'Очень хорошо стыкуется с 3 ч/день и твоим возможным опытом вокруг ботов.',
  },
  ops_saas: {
    id: 'ops_saas',
    title: 'Нишевый B2B-инструмент',
    subtitle: 'Продукт под боль бизнеса: сверки, биллинг, админка, отчёты',
    fitLabel: 'Сильный fit, если любишь системы и деньги за боль',
    why: [
      'Платят за сэкономленное время и снятый хаос, а не за «красоту».',
      'Можно продавать дорого малому числу клиентов.',
      'Цикл ценности короче, чем у игры: полезность видно быстрее.',
    ],
    watchouts: [
      'Нужно говорить с клиентами и терпеть «скучные» домены.',
      'Поддержка и edge-cases съедают время.',
      'Без ниши продукт превращается в бесконечную кастомную разработку.',
    ],
    firstStep:
      'Выписать 10 болей из знакомой операционки и выбрать одну, за которую уже платят людьми/таблицами.',
    hoursFit: 'При 3 ч/день реально вести узкий MVP и 2–5 early customers.',
  },
  bot_product: {
    id: 'bot_product',
    title: 'Telegram-бот как продукт',
    subtitle: 'Подписка / доступ / автоматизация внутри мессенджера',
    fitLabel: 'Быстрый путь к своему продукту с понятным каналом',
    why: [
      'Короткий путь от идеи до оплаты и онбординга.',
      'Можно опереться на уже понятные сценарии: участники, заявки, подписки.',
      'Маркетинг часто проще: чаты, сарафан, узкие сообщества.',
    ],
    watchouts: [
      'Конкуренция и «ещё один бот» — нужна острая ниша.',
      'Риск скатиться во фриланс-кастом под каждого клиента.',
      'Зависимость от правил платформы.',
    ],
    firstStep:
      'Сформулировать оффер одной фразой: «Для кого / какая боль / что бот делает за 60 секунд».',
    hoursFit: 'Идеально под 3 ч/день: итерации короткие, релиз можно делать еженедельно.',
  },
  web_tool: {
    id: 'web_tool',
    title: 'Маленький web-tool / micro-SaaS',
    subtitle: 'Утилита с чётким действием: сгенерировать, проверить, сверстать, посчитать',
    fitLabel: 'Хорош, если любишь чистый UX и самостоятельный продукт',
    why: [
      'Понятный one-job продукт легче объяснять и продавать.',
      'Можно стартовать без стора и без сложной игровой петли.',
      'SEO/контент иногда даёт долгий хвост.',
    ],
    watchouts: [
      'Легко сделать «красиво, но никто не платит».',
      'Нужен канал трафика с первого месяца.',
      'Конкуренция шаблонов и no-code высока.',
    ],
    firstStep:
      'Найти задачу, которую люди уже решают через костыли (Notion/Excel/ChatGPT), и сделать её в 10 кликов.',
    hoursFit: 'Реалистично: MVP за 2–4 недели при узком scope.',
  },
  digital_pack: {
    id: 'digital_pack',
    title: 'Цифровой пакет / шаблон / мини-курс',
    subtitle: 'Продажа артефакта: шаблон бота, игровой kit, чеклисты, гайд',
    fitLabel: 'Если хочешь продукт без тяжёлой поддержки',
    why: [
      'Можно монетизировать экспертизу без полноценного SaaS.',
      'Хорошо сочетается с контентом и личным брендом.',
      'Быстрее проверить спрос через пресейл.',
    ],
    watchouts: [
      'Потолок дохода ниже сильного SaaS/игры, если нет аудитории.',
      'Нужна регулярная упаковка и продажи.',
      'Пиратство и «одноразовая» покупка.',
    ],
    firstStep:
      'Собрать один узкий pack из того, что уже умеешь, и продать 5 копиям знакомой аудитории.',
    hoursFit: 'Отлично как параллельный трек к продукту или игре.',
  },
}

export interface AnswerOption {
  id: string
  label: string
  hint?: string
  scores: Partial<ScoreMap>
}

export interface Question {
  id: string
  title: string
  subtitle?: string
  options: AnswerOption[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'energy',
    title: 'После основной работы что тебя скорее заряжает?',
    subtitle: 'Не «что правильно», а что реально тянет открыть ноутбук.',
    options: [
      {
        id: 'playfeel',
        label: 'Крутить механику, пока «приятно в руках»',
        hint: 'Баланс, ощущение, скорость реакции',
        scores: { mobile_game: 3, telegram_game: 2 },
      },
      {
        id: 'systems',
        label: 'Собирать систему, которая снимает хаос',
        hint: 'Сверки, статусы, автоматизация',
        scores: { ops_saas: 3, bot_product: 2, web_tool: 1 },
      },
      {
        id: 'ship',
        label: 'Быстро выкатить штуку и увидеть реакцию людей',
        scores: { bot_product: 2, telegram_game: 2, web_tool: 2, digital_pack: 1 },
      },
      {
        id: 'teach',
        label: 'Упаковать знание так, чтобы другим стало легче',
        scores: { digital_pack: 3, web_tool: 1, bot_product: 1 },
      },
    ],
  },
  {
    id: 'joy',
    title: 'Что из этого звучит как «хочу делать месяцами»?',
    options: [
      {
        id: 'world',
        label: 'Мир, персонажи, уровни, эмоция игрока',
        scores: { mobile_game: 3, telegram_game: 2 },
      },
      {
        id: 'loop',
        label: 'Короткая игровая петля + соревнование/виральность',
        scores: { telegram_game: 3, mobile_game: 2 },
      },
      {
        id: 'workflow',
        label: 'Рабочий процесс бизнеса стал проще и надёжнее',
        scores: { ops_saas: 3, bot_product: 2 },
      },
      {
        id: 'utility',
        label: 'Один чёткий инструмент, который люди открывают по делу',
        scores: { web_tool: 3, digital_pack: 1, bot_product: 1 },
      },
    ],
  },
  {
    id: 'domain',
    title: 'Где у тебя уже есть «насмотренность» или опыт?',
    subtitle: 'Сильнее всего то, что ты уже нюхал изнутри.',
    options: [
      {
        id: 'games',
        label: 'Игры: много играю / пробовал делать / чувствую жанры',
        scores: { mobile_game: 3, telegram_game: 2 },
      },
      {
        id: 'tg_ops',
        label: 'Telegram, боты, подписки, заявки, панели',
        scores: { bot_product: 3, ops_saas: 2, telegram_game: 1 },
      },
      {
        id: 'biz_ops',
        label: 'Бизнес-операционка, биллинг, отчёты, админки',
        scores: { ops_saas: 3, web_tool: 1, bot_product: 1 },
      },
      {
        id: 'general_dev',
        label: 'Общая разработка / веб, без узкой доменной боли',
        scores: { web_tool: 2, digital_pack: 2, telegram_game: 1 },
      },
    ],
  },
  {
    id: 'patience',
    title: 'Какой горизонт до первых осмысленных денег ок?',
    subtitle: 'Не «хочу миллион», а первый сигнал, что направление живое.',
    options: [
      {
        id: 'fast',
        label: '2–6 недель',
        scores: { bot_product: 3, digital_pack: 3, web_tool: 2, telegram_game: 1 },
      },
      {
        id: 'mid',
        label: '1–3 месяца',
        scores: { telegram_game: 2, web_tool: 2, ops_saas: 2, bot_product: 1 },
      },
      {
        id: 'long',
        label: '3–9 месяцев — нормально, если продукт свой',
        scores: { mobile_game: 3, ops_saas: 2, telegram_game: 1 },
      },
      {
        id: 'very_long',
        label: 'Готов к долгой полировке, деньги не главный критерий старта',
        scores: { mobile_game: 3, telegram_game: 1 },
      },
    ],
  },
  {
    id: 'audience',
    title: 'Кому тебе комфортнее продавать?',
    options: [
      {
        id: 'players',
        label: 'Игрокам / широкой B2C-аудитории',
        scores: { mobile_game: 3, telegram_game: 2 },
      },
      {
        id: 'communities',
        label: 'Сообществам и админам в Telegram',
        scores: { bot_product: 3, telegram_game: 2, digital_pack: 1 },
      },
      {
        id: 'owners',
        label: 'Владельцам малого бизнеса / операторам сервисов',
        scores: { ops_saas: 3, bot_product: 1, web_tool: 1 },
      },
      {
        id: 'makers',
        label: 'Другим разработчикам и мейкерам',
        scores: { digital_pack: 3, web_tool: 2 },
      },
    ],
  },
  {
    id: 'sales',
    title: 'Как относишься к продажам и упаковке?',
    options: [
      {
        id: 'hate',
        label: 'Хочу минимум продаж: продукт сам тянет через сторы/вирал',
        scores: { mobile_game: 2, telegram_game: 2, web_tool: 1 },
      },
      {
        id: 'ok_dm',
        label: 'Могу писать людям в личку и закрывать 5–10 клиентов',
        scores: { ops_saas: 3, bot_product: 2, digital_pack: 1 },
      },
      {
        id: 'content',
        label: 'Готов вести контент/канал как основной канал',
        scores: { digital_pack: 3, web_tool: 2, bot_product: 1 },
      },
      {
        id: 'mixed',
        label: 'Смешанно: и продукт, и точечные продажи',
        scores: { bot_product: 2, ops_saas: 2, telegram_game: 1, web_tool: 1 },
      },
    ],
  },
  {
    id: 'craft',
    title: 'Что важнее в процессе работы?',
    options: [
      {
        id: 'feel',
        label: 'Кайф от «feel»: анимации, темп, отклик',
        scores: { mobile_game: 3, telegram_game: 2 },
      },
      {
        id: 'reliability',
        label: 'Надёжность: чтобы не врало, не зависало, сходилось',
        scores: { ops_saas: 3, bot_product: 2 },
      },
      {
        id: 'clarity',
        label: 'Ясность: один экран — одна задача',
        scores: { web_tool: 3, digital_pack: 1, bot_product: 1 },
      },
      {
        id: 'story',
        label: 'История и подача: чтобы захотели попробовать',
        scores: { digital_pack: 2, mobile_game: 2, telegram_game: 1 },
      },
    ],
  },
  {
    id: 'stack',
    title: 'Какой стек ближе прямо сейчас?',
    subtitle: 'Учитываем, что есть ~3 часа в день — лучше опираться на уже знакомое.',
    options: [
      {
        id: 'engines',
        label: 'Хочу/готов Unity, Godot или похожий игровой стек',
        scores: { mobile_game: 3 },
      },
      {
        id: 'web_game',
        label: 'Web: React/Canvas/Phaser и т.п., можно и в Telegram',
        scores: { telegram_game: 3, mobile_game: 1, web_tool: 1 },
      },
      {
        id: 'bots_backend',
        label: 'Боты, API, SQLite/БД, интеграции, админки',
        scores: { bot_product: 3, ops_saas: 3 },
      },
      {
        id: 'web_apps',
        label: 'Обычные web-приложения и лендинги',
        scores: { web_tool: 3, digital_pack: 2, ops_saas: 1 },
      },
    ],
  },
  {
    id: 'risk',
    title: 'Какой провал психологически легче пережить?',
    options: [
      {
        id: 'no_downloads',
        label: 'Игра вышла, но почти никто не скачал',
        scores: { mobile_game: 2, telegram_game: 1 },
      },
      {
        id: 'no_payers',
        label: 'Сделал полезное, но люди не платят',
        scores: { web_tool: 2, digital_pack: 2, bot_product: 1 },
      },
      {
        id: 'support_hell',
        label: 'Клиенты есть, но поддержка выматывает',
        scores: { ops_saas: 2, bot_product: 2 },
      },
      {
        id: 'slow_build',
        label: 'Долго делал и понял, что идея слабая',
        scores: { mobile_game: 1, ops_saas: 1, telegram_game: 2, web_tool: 2 },
      },
    ],
  },
  {
    id: 'scope',
    title: 'При 3 часах в день какой режим тебе роднее?',
    options: [
      {
        id: 'deep_polish',
        label: 'Долго полировать одну вещь до блеска',
        scores: { mobile_game: 3, ops_saas: 1 },
      },
      {
        id: 'weekly_ship',
        label: 'Каждую неделю что-то выпускать и править по фидбеку',
        scores: { bot_product: 3, telegram_game: 2, web_tool: 2 },
      },
      {
        id: 'mvp_sell',
        label: 'Сначала продать/провалидировать, потом допиливать',
        scores: { ops_saas: 3, digital_pack: 2, bot_product: 2 },
      },
      {
        id: 'content_asset',
        label: 'Собрать актив, который продаётся много раз',
        scores: { digital_pack: 3, web_tool: 1 },
      },
    ],
  },
  {
    id: 'game_lean',
    title: 'Если всё-таки игра — что ближе?',
    subtitle: 'Даже если игра не победит, ответ уточнит вектор.',
    options: [
      {
        id: 'store_premium',
        label: 'Красивая игра в App Store / Google Play',
        scores: { mobile_game: 3 },
      },
      {
        id: 'tg_social',
        label: 'Лёгкая социальная/соревновательная игра в Telegram',
        scores: { telegram_game: 3, bot_product: 1 },
      },
      {
        id: 'hybrid',
        label: 'Игровая обёртка над полезным продуктом',
        hint: 'Квесты, стрики, рейтинги вокруг утилиты',
        scores: { telegram_game: 2, bot_product: 2, web_tool: 1 },
      },
      {
        id: 'not_game',
        label: 'Игра скорее романтика; полезный продукт важнее',
        scores: { ops_saas: 2, bot_product: 2, web_tool: 2, digital_pack: 1 },
      },
    ],
  },
  {
    id: 'edge',
    title: 'Где твоё вероятное преимущество?',
    options: [
      {
        id: 'taste',
        label: 'Вкус к играм и ощущение «что зайдёт»',
        scores: { mobile_game: 3, telegram_game: 2 },
      },
      {
        id: 'ops_reality',
        label: 'Понимание реальной операционки и болей админов',
        scores: { ops_saas: 3, bot_product: 2 },
      },
      {
        id: 'speed',
        label: 'Скорость сборки MVP с AI/Cursor',
        scores: { web_tool: 2, bot_product: 2, telegram_game: 2, digital_pack: 1 },
      },
      {
        id: 'explain',
        label: 'Умею объяснять сложное простыми шагами',
        scores: { digital_pack: 3, web_tool: 1 },
      },
    ],
  },
]

export const EMPTY_SCORES: ScoreMap = {
  mobile_game: 0,
  telegram_game: 0,
  ops_saas: 0,
  bot_product: 0,
  web_tool: 0,
  digital_pack: 0,
}
