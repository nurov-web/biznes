import type { Locale } from "@/lib/locale-query";
import type { NicheId } from "@/lib/niche";

export type AcademyLocale = Locale;

function L(tg: string, ru: string, en: string): Record<AcademyLocale, string> {
  return { tg, ru, en };
}

export type LessonStep = {
  title: Record<AcademyLocale, string>;
  body: Record<AcademyLocale, string>;
};

export type LessonQuiz = {
  question: Record<AcademyLocale, string>;
  options: Record<AcademyLocale, [string, string, string]>;
  correct: 0 | 1 | 2;
  why: Record<AcademyLocale, string>;
};

export type AcademyLesson = {
  id: string;
  unitId: string;
  xp: number;
  title: Record<AcademyLocale, string>;
  steps: LessonStep[];
  quiz: LessonQuiz;
};

export type AcademyUnit = {
  id: string;
  title: Record<AcademyLocale, string>;
  lead: Record<AcademyLocale, string>;
  lessons: AcademyLesson[];
};

function lesson(
  id: string,
  unitId: string,
  title: Record<AcademyLocale, string>,
  steps: LessonStep[],
  quiz: LessonQuiz,
): AcademyLesson {
  return { id, unitId, xp: 15, title, steps, quiz };
}

export const ACADEMY_UNITS: AcademyUnit[] = [
  {
    id: "asos",
    title: L("Асос: рақам, на ҳис", "Основа: цифра, не чувство", "Foundation: numbers, not gut"),
    lead: L(
      "Аввал фарқи фурӯш ва фоидаро мефаҳмем. Бе ин панел танҳо зебо менамояд.",
      "Сначала отделяем выручку от прибыли. Без этого панель только красивая.",
      "First we separate sales from profit. Without that the panel is only pretty.",
    ),
    lessons: [
      lesson(
        "asos-1",
        "asos",
        L("Фурӯш пул нест", "Выручка — не прибыль", "Sales are not profit"),
        [
          {
            title: L("Як мисол", "Один пример", "One example"),
            body: L(
              "Шумо дар як рӯз ба 1 000 сомонӣ фурӯхтед. Хариди мол 700, иҷора ва роҳ 200. Дар даст 100 сомонӣ монд. Фурӯш калон буд — фоида хурд.",
              "За день продали на 1 000 сомони. Закуп 700, аренда и дорога 200. В кассе осталось 100. Выручка большая — прибыль маленькая.",
              "You sold 1,000 TJS in a day. Goods cost 700, rent and transport 200. You kept 100. Sales look big — profit is small.",
            ),
          },
          {
            title: L("Ду калима", "Два слова", "Two words"),
            body: L(
              "Фурӯш — пуле, ки мизоҷ дод. Фоида — он чи пас аз ҳамаи хароҷот мемонад. Панел ҳар дуро ҷудо нишон медиҳад.",
              "Выручка — деньги покупателя. Прибыль — то, что осталось после всех расходов. Панель показывает оба числа отдельно.",
              "Sales is what the customer paid. Profit is what remains after every cost. The panel shows both, separately.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Пеш аз қарори калон: «фурӯш чанд?» напурсед. Пурсед: «пас аз хароҷот чанд мемонад?»",
              "Перед большим решением не спрашивайте «сколько продали». Спросите: «сколько осталось после расходов?»",
              "Before a big decision do not ask “how much did we sell?”. Ask: “what is left after costs?”",
            ),
          },
        ],
        {
          question: L(
            "Фурӯш 2 000 сомонӣ, хароҷот 1 800. Фоида чанд аст?",
            "Выручка 2 000 сомони, расходы 1 800. Сколько прибыль?",
            "Sales 2,000 TJS, costs 1,800. What is profit?",
          ),
          options: {
            tg: ["2 000", "1 800", "200"],
            ru: ["2 000", "1 800", "200"],
            en: ["2,000", "1,800", "200"],
          },
          correct: 2,
          why: L(
            "Фоида = фурӯш − хароҷот. 2 000 − 1 800 = 200. Рақами калони фурӯш шуморо гумроҳ накунад.",
            "Прибыль = выручка − расходы. 2 000 − 1 800 = 200. Большая выручка не должна обманывать.",
            "Profit = sales − costs. 2,000 − 1,800 = 200. A big sales number should not fool you.",
          ),
        },
      ),
      lesson(
        "asos-2",
        "asos",
        L("Арзиши воқеӣ", "Реальная себестоимость", "True cost"),
        [
          {
            title: L("Нархи харид кам аст", "Цена закупа мало", "Buy price is not enough"),
            body: L(
              "Молро ба 100 харидед. Роҳ, шикаст, вақти шумо ва бонк ҳам пул мегиранд. Арзиши воқеӣ аксар вақт 120–140 аст, на 100.",
              "Купили товар за 100. Дорога, брак, ваше время и банк тоже стоят денег. Реальная себестоимость часто 120–140, не 100.",
              "You bought a unit for 100. Transport, spoilage, your time and the bank also cost money. True cost is often 120–140, not 100.",
            ),
          },
          {
            title: L("Чаро ин муҳим", "Зачем это", "Why it matters"),
            body: L(
              "Агар ба 130 фурӯшед ва арзиш 140 бошад, шумо «фурӯш» мебинед — ва пул гум мекунед. Панел арзиши воқеиро аз харид ва фурӯш ҳисоб мекунад.",
              "Если продаёте за 130, а себестоимость 140, вы видите «продажу» и теряете деньги. Панель считает себестоимость из закупа и продажи.",
              "If you sell at 130 and true cost is 140, you see a “sale” and lose money. The panel computes true cost from buy and sell.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Барои 3 моли асосӣ харид, роҳ ва талафро нависед. Баъд нархи фурӯшро аз нав санҷед.",
              "Для 3 главных товаров запишите закуп, дорогу и потери. Затем заново проверьте цену продажи.",
              "For your 3 main products write buy price, transport and loss. Then check the sell price again.",
            ),
          },
        ],
        {
          question: L(
            "Арзиши воқеӣ аз чӣ иборат аст?",
            "Из чего состоит реальная себестоимость?",
            "What is true cost made of?",
          ),
          options: {
            tg: [
              "Танҳо нархи харид",
              "Харид + роҳ + талаф + вақт",
              "Танҳо нархи рақиб",
            ],
            ru: ["Только закупочная цена", "Закуп + дорога + потери + время", "Только цена конкурента"],
            en: ["Buy price only", "Buy + transport + loss + time", "Competitor price only"],
          },
          correct: 1,
          why: L(
            "Харид танҳо як қисм аст. Бе роҳ ва талаф шумо фоидаи дурӯғ мебинед.",
            "Закуп — только часть. Без дороги и потерь вы видите ложную прибыль.",
            "Buy price is only one part. Without transport and loss you see fake profit.",
          ),
        },
      ),
      lesson(
        "asos-3",
        "asos",
        L("Сифр хатарнок аст", "Ноль опасен", "Zero is dangerous"),
        [
          {
            title: L("Панели холӣ", "Пустая панель", "Empty panel"),
            body: L(
              "Агар фурӯш, мол ва рақиб ворид нашуда бошанд, панел сифр нишон медиҳад. Ин «ҳама хуб» нест — ин «маълумот нест».",
              "Если продажи, товары и конкуренты не введены, панель показывает ноль. Это не «всё хорошо» — это «нет данных».",
              "If sales, products and rivals are missing, the panel shows zero. That is not “all fine” — it is “no data”.",
            ),
          },
          {
            title: L("AI бе рақам", "ИИ без цифр", "AI without numbers"),
            body: L(
              "Маслиҳати AI аз рақамҳои шумо мебарояд. Бе CSV ё пайвасти мағоза ӯ тахмин мекунад — ва инро рӯирост мегӯяд.",
              "Совет ИИ строится на ваших цифрах. Без CSV или магазина он гадает — и пишет это честно.",
              "AI advice is built from your numbers. Without CSV or a store it guesses — and says so plainly.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Имрӯз як чизро пур кунед: мол, фурӯш ё пайвасти сайт. Як сатри воқеӣ аз даҳ тахмин беҳтар аст.",
              "Сегодня заполните одно: товар, продажу или сайт. Одна реальная строка лучше десяти догадок.",
              "Fill one thing today: a product, a sale, or the store link. One real row beats ten guesses.",
            ),
          },
        ],
        {
          question: L(
            "Агар панел сифр нишон диҳад, ин чӣ маъно дорад?",
            "Если панель показывает ноль, что это значит?",
            "If the panel shows zero, what does it mean?",
          ),
          options: {
            tg: ["Бизнес комилан солим аст", "Маълумот ҳанӯз кам аст", "AI хато кардааст"],
            ru: ["Бизнес полностью здоров", "Данных ещё мало", "ИИ ошибся"],
            en: ["The business is perfectly healthy", "There is not enough data yet", "The AI made a mistake"],
          },
          correct: 1,
          why: L(
            "Сифр = ҳоло рақам нест. Аввал мол ё фурӯшро ворид кунед, баъд қарор гиред.",
            "Ноль = цифр пока нет. Сначала внесите товар или продажу, потом решайте.",
            "Zero means there are no numbers yet. Enter a product or a sale first, then decide.",
          ),
        },
      ),
    ],
  },
  {
    id: "furush",
    title: L("Фурӯш: ҳар қадамро нависед", "Продажи: пишите каждый шаг", "Sales: write every step"),
    lead: L(
      "Он чи навишта нашуд — дар ҳисоб нест. Мағоза ва хазина бояд як забон гӯянд.",
      "Что не записано — того нет в отчёте. Магазин и касса должны говорить одним языком.",
      "What is not written does not exist in the report. Store and till must speak one language.",
    ),
    lessons: [
      lesson(
        "furush-1",
        "furush",
        L("Ҳар фурӯш — як сатр", "Каждая продажа — строка", "Every sale is a row"),
        [
          {
            title: L("Қоидаи оддӣ", "Простое правило", "Simple rule"),
            body: L(
              "Номи мол, шумора, нархи фурӯш, нархи харид. Бе ин 4 рақам график дурӯғ мегӯяд.",
              "Название, количество, цена продажи, цена закупа. Без этих 4 цифр график врёт.",
              "Name, quantity, sell price, buy price. Without those 4 numbers the chart lies.",
            ),
          },
          {
            title: L("CSV ё POS", "CSV или POS", "CSV or POS"),
            body: L(
              "Агар хазина дошта бошед — калиди API. Агар не — файли CSV. Ҳарду ба як ҷо мераванд: /data.",
              "Если есть касса — API-ключ. Если нет — файл CSV. Оба ведут в одно место: /data.",
              "If you have a till — an API key. If not — a CSV file. Both land in the same place: /data.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Фурӯши дирӯзро ҳозир нависед — ҳатто 3 сатр. Сипас ҳафтаро дар панел бинед.",
              "Запишите вчерашние продажи сейчас — хотя бы 3 строки. Затем смотрите неделю на панели.",
              "Write yesterday’s sales now — even 3 rows. Then read the week on the dashboard.",
            ),
          },
        ],
        {
          question: L(
            "Барои ҳисоби дуруст дар ҳар фурӯш чӣ лозим аст?",
            "Что нужно в каждой продаже для верного расчёта?",
            "What does every sale need for a correct total?",
          ),
          options: {
            tg: ["Танҳо номи мол", "Мол, шумора, фурӯш ва харид", "Танҳо акс дар Instagram"],
            ru: ["Только название", "Товар, количество, продажа и закуп", "Только фото в Instagram"],
            en: ["Only the product name", "SKU, quantity, sell and buy", "Only an Instagram photo"],
          },
          correct: 1,
          why: L(
            "Бе нархи харид маржа ҳисоб намешавад. Бе шумора — ҳаҷм. Ҳарду лозиманд.",
            "Без закупа нет маржи. Без количества нет объёма. Нужны оба.",
            "Without buy price there is no margin. Without quantity there is no volume. You need both.",
          ),
        },
      ),
      lesson(
        "furush-2",
        "furush",
        L("Пайвасти мағоза", "Подключение магазина", "Connecting the store"),
        [
          {
            title: L("Силка + логин", "Ссылка + логин", "Link + login"),
            body: L(
              "Агар сайт ё Instagram-мағоза дошта бошед — силкаро гузоред, логин ва пароли админро нависед. Парол дар система ҳамчун матн намемонад.",
              "Если есть сайт или Instagram-магазин — вставьте ссылку, логин и пароль админа. Пароль текстом не хранится.",
              "If you have a site or Instagram shop — paste the URL, admin login and password. The password is never stored as text.",
            ),
          },
          {
            title: L("Калиди API", "API-ключ", "API key"),
            body: L(
              "Пас аз пайваст калид ва суроғаи webhook мегиред. Сайт ё POS ҳар фурӯшро ба ин суроға мефиристад. Мо ба панели WordPress/Shopify-и шумо ворид намешавем.",
              "После подключения вы получаете ключ и адрес webhook. Сайт или касса шлёт каждую продажу туда. Мы не входим в ваш WordPress/Shopify.",
              "After connect you get a key and a webhook URL. The site or till posts every sale there. We do not log into your WordPress/Shopify admin.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Агар сайт дошта бошед — ҳозир пайваст кунед. Агар не — «сайт надорам»-ро пахш кунед ва CSV истифода баред.",
              "Если сайт есть — подключите сейчас. Если нет — нажмите «нет сайта» и ведите CSV.",
              "If you have a site — connect it now. If not — tap “no website” and use CSV.",
            ),
          },
        ],
        {
          question: L(
            "Пас аз пайвасти сайт фурӯш чӣ тавр меояд?",
            "Как после подключения приходят продажи?",
            "How do sales arrive after you connect the site?",
          ),
          options: {
            tg: [
              "Худкор тавассути калиди API / webhook",
              "Мо ҳар рӯз ба админ ворид мешавем",
              "Аз Somon худкор кашида мешавад",
            ],
            ru: [
              "Автоматически через API-ключ / webhook",
              "Мы каждый день входим в админку",
              "Сами забираем с Somon",
            ],
            en: [
              "Automatically via API key / webhook",
              "We log into your admin every day",
              "We scrape Somon for you",
            ],
          },
          correct: 0,
          why: L(
            "Пайваст = калид + webhook. Бе ворид шудан ба админи бегона ва бе парсинги бозор.",
            "Подключение = ключ + webhook. Без входа в чужую админку и без парсинга рынка.",
            "Connect means a key plus a webhook. No third-party admin login and no market scrape.",
          ),
        },
      ),
      lesson(
        "furush-3",
        "furush",
        L("Ҳафтаро хондан", "Читать неделю", "Reading the week"),
        [
          {
            title: L("7 рӯз, на як рӯз", "7 дней, не один", "Seven days, not one"),
            body: L(
              "Як рӯзи хуб шуморо гумроҳ мекунад. Як рӯзи бад ҳам. Графики ҳафта самтро нишон медиҳад.",
              "Один хороший день обманывает. Плохой — тоже. График недели показывает направление.",
              "One good day fools you. A bad day does too. The week chart shows direction.",
            ),
          },
          {
            title: L("Се савол", "Три вопроса", "Three questions"),
            body: L(
              "Кадом рӯз баланд? Кадом мол фурӯхт? Оё маржа ҳам баланд буд, ё танҳо фурӯш?",
              "Какой день высокий? Какой товар ушёл? Маржа тоже выросла — или только выручка?",
              "Which day is high? Which product moved? Did margin rise too — or only sales?",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Пас аз 7 рӯзи сабт як ҷумла нависед: «ин ҳафта пул аз … омад». Ин хотираи бизнес мешавад.",
              "После 7 дней записи напишите одно предложение: «на этой неделе деньги пришли из …». Это память бизнеса.",
              "After 7 days of records write one sentence: “this week money came from …”. That becomes business memory.",
            ),
          },
        ],
        {
          question: L(
            "Чаро як рӯзи фурӯш барои қарор кам аст?",
            "Почему одного дня продаж мало для решения?",
            "Why is one sales day too little for a decision?",
          ),
          options: {
            tg: ["Чунки рӯз тасодуфӣ буда метавонад", "Чунки AI дӯст намедорад", "Чунки бонк баста аст"],
            ru: ["Потому что день может быть случайным", "Потому что ИИ не любит", "Потому что банк закрыт"],
            en: ["Because a single day can be luck", "Because the AI dislikes it", "Because the bank is closed"],
          },
          correct: 0,
          why: L(
            "Ҳафта тасодуфро ҳамвор мекунад. Қарори калонро аз як ҷумъа нагиред.",
            "Неделя сглаживает случайность. Большое решение с одной пятницы не принимают.",
            "A week smooths luck. Do not make a big call from one Friday.",
          ),
        },
      ),
    ],
  },
  {
    id: "narx",
    title: L("Нарх: на арзонтар аз ҳама", "Цена: не дешевле всех", "Price: not cheapest of all"),
    lead: L(
      "Нархи паст фурӯшро осон мекунад ва фоидаро мекушад. Нархро аз арзиш месозем.",
      "Низкая цена облегчает продажу и убивает прибыль. Цену строим от себестоимости.",
      "A low price makes the sale easy and kills profit. We build price from cost.",
    ),
    lessons: [
      lesson(
        "narx-1",
        "narx",
        L("Харид ва фурӯш", "Закуп и продажа", "Buy and sell"),
        [
          {
            title: L("Ду нарх", "Две цены", "Two prices"),
            body: L(
              "Харид — он чи шумо додед. Фурӯш — он чи мизоҷ медиҳад. Фарқ бояд хароҷотро пӯшонад ва каме монад.",
              "Закуп — что отдали вы. Продажа — что даёт клиент. Разница должна покрыть расходы и оставить запас.",
              "Buy is what you paid. Sell is what the customer pays. The gap must cover costs and leave a little.",
            ),
          },
          {
            title: L("Формулаи кӯтоҳ", "Короткая формула", "Short formula"),
            body: L(
              "Нархи фурӯш ≈ арзиши воқеӣ × 1.25…1.40 барои савдои хурд. Ин қоида аст, на қонун — аммо аз «ҳис» беҳтар аст.",
              "Цена продажи ≈ себестоимость × 1.25…1.40 для малой торговли. Это ориентир, не закон — но лучше «на глаз».",
              "Sell ≈ true cost × 1.25–1.40 for small trade. A guide, not a law — better than guessing.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Як молро гиред. Арзиш × 1.3-ро ҳисоб кунед. Бо нархи ҳозираатон муқоиса кунед.",
              "Возьмите один товар. Посчитайте себестоимость × 1.3. Сравните с вашей текущей ценой.",
              "Pick one product. Compute true cost × 1.3. Compare it with your current price.",
            ),
          },
        ],
        {
          question: L(
            "Нархи фурӯшро аз куҷо сар кардан беҳтар аст?",
            "Откуда лучше начинать цену продажи?",
            "Where should a sell price start?",
          ),
          options: {
            tg: ["Аз нархи рақиби арзонтарин", "Аз арзиши воқеии худ", "Аз рекламаи Instagram"],
            ru: ["С самой низкой цены конкурента", "Со своей себестоимости", "С рекламы в Instagram"],
            en: ["From the cheapest rival", "From your own true cost", "From an Instagram ad"],
          },
          correct: 1,
          why: L(
            "Аввал арзиши худ. Баъд рақиб. Агар аз рақиб сар кунед, метавонед зери арзиш фурӯшед.",
            "Сначала своя себестоимость. Потом конкурент. Если начать с конкурента, можно продавать ниже себестоимости.",
            "Start from your cost, then look at rivals. If you start from rivals you can sell below cost.",
          ),
        },
      ),
      lesson(
        "narx-2",
        "narx",
        L("Ҷанги нарх", "Ценовая война", "Price war"),
        [
          {
            title: L("Дом", "Ловушка", "The trap"),
            body: L(
              "Рақиб 10 сомонӣ арзонтар кард. Шумо ҳам. Ӯ боз. Пас аз як моҳ ҳарду бе фоида мемонед — мизоҷ одат кард ба нарх.",
              "Конкурент скинул 10 сомони. Вы тоже. Он снова. Через месяц оба без прибыли — клиент привык к цене.",
              "A rival drops 10 TJS. You follow. He drops again. A month later both have no profit — the customer learned the price.",
            ),
          },
          {
            title: L("Ба ҷои ҷанг", "Вместо войны", "Instead of war"),
            body: L(
              "Хизмат, суръат, кафолат, бастабандӣ, маслиҳат. Нархро як маротиба равшан нависед — на ҳар рӯз паст.",
              "Сервис, скорость, гарантия, упаковка, совет. Цену пишите ясно один раз — не снижайте каждый день.",
              "Service, speed, warranty, packing, advice. Write the price clearly once — do not cut it every day.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Як чизеро нависед, ки рақиб намедиҳад (суръат, кафолат, маслиҳат). Нархро ба он пайваст кунед, на ба тарс.",
              "Запишите одно, чего нет у конкурента (скорость, гарантия, совет). К этому вяжите цену, не к страху.",
              "Write one thing a rival does not give (speed, warranty, advice). Tie price to that, not to fear.",
            ),
          },
        ],
        {
          question: L(
            "Агар рақиб нархро паст кунад, қадами аввал кадом аст?",
            "Если конкурент снизит цену, какой первый шаг?",
            "If a rival cuts price, what is the first step?",
          ),
          options: {
            tg: [
              "Дарҳол аз ӯ арзонтар шудан",
              "Аввал арзиш ва фарқи худатонро санҷидан",
              "Мағозаро бастани",
            ],
            ru: [
              "Сразу стать дешевле него",
              "Сначала проверить свою себестоимость и отличие",
              "Закрыть магазин",
            ],
            en: [
              "Immediately go cheaper than them",
              "First check your cost and your difference",
              "Close the shop",
            ],
          },
          correct: 1,
          why: L(
            "Аввал ҳисоб. Агар шумо ҳам паст кунед бе ҳисоб — ҷангро шумо маблағгузорӣ мекунед.",
            "Сначала счёт. Если снижать без расчёта — войну финансируете вы.",
            "Count first. If you cut without a sum, you are the one funding the war.",
          ),
        },
      ),
      lesson(
        "narx-3",
        "narx",
        L("Маржаи солим", "Здоровая маржа", "Healthy margin"),
        [
          {
            title: L("Фоиз", "Процент", "The percent"),
            body: L(
              "Маржа = (фурӯш − харид) / фурӯш. 10% барои савдои хурд одатан танг аст: иҷора ва талаф мехӯранд.",
              "Маржа = (продажа − закуп) / продажа. 10% для малой торговли обычно тесно: аренда и брак съедают.",
              "Margin = (sell − buy) / sell. 10% is usually tight for a small shop: rent and loss eat it.",
            ),
          },
          {
            title: L("Дар панел", "На панели", "On the panel"),
            body: L(
              "Саҳифаи нарх барои ҳар мол «чаро ҳамин нарх»-ро менависад. Агар маржа сурх бошад — аввал он молро ислоҳ кунед.",
              "Страница цены пишет «почему эта цена» по каждому товару. Если маржа красная — чините этот SKU первым.",
              "The pricing page writes “why this price” per SKU. If margin is red — fix that product first.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Молҳои бо маржаи пасттаринро пайдо кунед. Нархро бардоред ё харидро иваз кунед — ё фурӯшашро кам кунед.",
              "Найдите товары с самой низкой маржой. Поднимите цену, смените закуп — или продавайте меньше.",
              "Find the lowest-margin products. Raise the price, change the buy — or sell less of them.",
            ),
          },
        ],
        {
          question: L(
            "Маржа чӣ тавр ҳисоб мешавад?",
            "Как считается маржа?",
            "How is margin calculated?",
          ),
          options: {
            tg: ["Фурӯш − харид, тақсим ба фурӯш", "Танҳо фурӯш", "Нархи рақиб − нархи шумо"],
            ru: ["Продажа − закуп, делить на продажу", "Только выручка", "Цена конкурента − ваша цена"],
            en: ["(Sell − buy) / sell", "Sales only", "Rival price − your price"],
          },
          correct: 0,
          why: L(
            "Маржа аз нархи фурӯш ва харид мебарояд, на аз рақиб. Рақиб баъдтар муқоиса аст.",
            "Маржа из вашей продажи и закупа, не из конкурента. Конкурент — сравнение потом.",
            "Margin comes from your sell and buy, not from the rival. The rival is a later comparison.",
          ),
        },
      ),
    ],
  },
  {
    id: "raqib",
    title: L("Рақиб: фаҳмидан, на нусха", "Конкурент: понять, не копировать", "Rivals: understand, don’t copy"),
    lead: L(
      "Рақиб маълумот аст, на устод. Нархҳои Somon худкор кашида намешаванд — ин қасдан аст.",
      "Конкурент — данные, не учитель. Цены Somon сами не снимаются — так задумано.",
      "A rival is data, not a teacher. Somon prices are not auto-scraped — that is on purpose.",
    ),
    lessons: [
      lesson(
        "raqib-1",
        "raqib",
        L("Кӣ рақиби воқеӣ аст", "Кто реальный конкурент", "Who the real rival is"),
        [
          {
            title: L("На ҳар дӯкон", "Не каждый киоск", "Not every stall"),
            body: L(
              "Рақиб касест, ки ҳамон мизоҷро барои ҳамон мол мегирад. Дӯкони дигар дар кӯчаи дигар — на ҳамеша рақиб.",
              "Конкурент тот, кто забирает того же клиента за тот же товар. Лавка на другой улице — не всегда конкурент.",
              "A rival takes the same customer for the same product. A stall on another street is not always a rival.",
            ),
          },
          {
            title: L("Се ном", "Три имени", "Three names"),
            body: L(
              "3 рақиби асосӣ кифоя аст. Барои ҳар кадом: мол, нарх, аксия. Бештар — садо, камтар фоида.",
              "3 главных конкурента хватит. По каждому: товар, цена, акция. Больше — шум, меньше пользы.",
              "Three main rivals are enough. For each: product, price, promo. More is noise, less use.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Се номро дар /competitors нависед. Нархро худатон аз витрина ё сӯҳбат гиред — на аз ваъдаи «парсинг».",
              "Впишите три имени в /competitors. Цену возьмите сами с витрины или из разговора — не из обещания «парсинга».",
              "Write three names in /competitors. Take the price yourself from the window or a talk — not from a “scrape” promise.",
            ),
          },
        ],
        {
          question: L(
            "Рақиби воқеӣ кист?",
            "Кто реальный конкурент?",
            "Who is a real rival?",
          ),
          options: {
            tg: [
              "Ҳар дӯкон дар шаҳр",
              "Он ки ҳамон мизоҷро барои ҳамон мол мегирад",
              "Танҳо Amazon",
            ],
            ru: [
              "Каждая лавка в городе",
              "Тот, кто берёт того же клиента за тот же товар",
              "Только Amazon",
            ],
            en: [
              "Every stall in the city",
              "Whoever takes the same customer for the same product",
              "Only Amazon",
            ],
          },
          correct: 1,
          why: L(
            "Рақиб = ҳамон мизоҷ + ҳамон мол. На ҳар вывеска дар кӯча.",
            "Конкурент = тот же клиент + тот же товар. Не каждая вывеска на улице.",
            "A rival is the same customer plus the same product. Not every sign on the street.",
          ),
        },
      ),
      lesson(
        "raqib-2",
        "raqib",
        L("Нусха накунед", "Не копируйте", "Do not copy"),
        [
          {
            title: L("Чаро нусха суст аст", "Почему копия слабая", "Why a copy is weak"),
            body: L(
              "Шумо хароҷоти ӯро намедонед. Нарх ва аксияи ӯ барои ӯ аст. Нусха шуморо ба ҷанги беҳисоб мебарад.",
              "Вы не знаете его расходов. Его цена и акция — для него. Копия уводит вас в войну без счёта.",
              "You do not know their costs. Their price and promo are for them. A copy pulls you into a war without a sum.",
            ),
          },
          {
            title: L("Чӣ гирифтан мумкин", "Что можно взять", "What you can take"),
            body: L(
              "Кадом мол меравад, кадом бастабандӣ, кадом вақти кор. Ин ишора аст — на фармон.",
              "Какой товар идёт, какая упаковка, какие часы. Это намёк — не приказ.",
              "Which product moves, which pack, which hours. That is a hint — not an order.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Як чизи рақибро нависед, ки нусха намекунед — ва чаро. Ин сарҳади шумост.",
              "Запишите одно у конкурента, что вы не копируете — и почему. Это ваша граница.",
              "Write one rival move you will not copy — and why. That is your boundary.",
            ),
          },
        ],
        {
          question: L(
            "Чаро нархи рақибро худкор нусха кардан хатарнок аст?",
            "Почему опасно слепо копировать цену конкурента?",
            "Why is blindly copying a rival’s price dangerous?",
          ),
          options: {
            tg: [
              "Чунки хароҷоти ӯро намедонед",
              "Чунки қонун манъ мекунад",
              "Чунки AI иҷозат намедиҳад",
            ],
            ru: [
              "Потому что вы не знаете его расходов",
              "Потому что закон запрещает",
              "Потому что ИИ не разрешает",
            ],
            en: [
              "Because you do not know their costs",
              "Because the law forbids it",
              "Because the AI forbids it",
            ],
          },
          correct: 0,
          why: L(
            "Нархи ӯ барои киссаи ӯст. Шумо бояд аз арзиши худ сар кунед.",
            "Его цена для его кармана. Вам нужно начинать со своей себестоимости.",
            "Their price fits their pocket. You start from your own cost.",
          ),
        },
      ),
      lesson(
        "raqib-3",
        "raqib",
        L("Бозор рӯирост", "Рынок честно", "The market, honestly"),
        [
          {
            title: L("Чӣ намекунем", "Чего не делаем", "What we do not do"),
            body: L(
              "Somon, OLX ва Amazon-ро худкор намекашем. Ин ваъдаи дурӯғин аст ва қонунан ҳам хатарнок.",
              "Мы не снимаем Somon, OLX и Amazon автоматически. Это ложное обещание и юридически рискованно.",
              "We do not auto-pull Somon, OLX or Amazon. That promise is false and legally risky.",
            ),
          },
          {
            title: L("Чӣ мекунем", "Что делаем", "What we do"),
            body: L(
              "Шумо нархро ворид мекунед. Система муқоиса ва таъсири моҳонаро ҳисоб мекунад. Пешгӯӣ — на кафолат.",
              "Вы вводите цену. Система сравнивает и считает эффект за месяц. Прогноз — не гарантия.",
              "You enter the price. The system compares and estimates a monthly effect. A forecast — not a guarantee.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Як нархи рақибро имрӯз дастӣ нависед. Баъд дар панел «vs мо»-ро хонед.",
              "Одну цену конкурента сегодня впишите вручную. Затем на панели прочитайте «против нас».",
              "Enter one rival price by hand today. Then read “vs us” on the panel.",
            ),
          },
        ],
        {
          question: L(
            "Нархи Somon/OLX дар ин система чӣ тавр меояд?",
            "Как в этой системе появляются цены Somon/OLX?",
            "How do Somon/OLX prices enter this system?",
          ),
          options: {
            tg: ["Худкор ҳар соат", "Шумо дастӣ ё бо CSV менависед", "Аз пароли админи рақиб"],
            ru: ["Автоматически каждый час", "Вы вводите вручную или CSV", "Из пароля админки конкурента"],
            en: ["Automatically every hour", "You type them or import CSV", "From a rival’s admin password"],
          },
          correct: 1,
          why: L(
            "Парсинг нест. Нархро шумо меоред — система ҳисоб мекунад. Ин рӯирост аст.",
            "Парсинга нет. Цену приносите вы — система считает. Так честно.",
            "There is no scrape. You bring the price — the system does the math. That is honest.",
          ),
        },
      ),
    ],
  },
  {
    id: "hafta",
    title: L("Ҳафта: як қарор", "Неделя: одно решение", "The week: one decision"),
    lead: L(
      "Система ба ҷои шумо қарор намегирад. Шумо як қадами равшан мегиред — ва онро месанҷед.",
      "Система не решает за вас. Вы берёте один ясный шаг — и проверяете его.",
      "The system does not decide for you. You take one clear step — and you test it.",
    ),
    lessons: [
      lesson(
        "hafta-1",
        "hafta",
        L("Health чӣ мегӯяд", "Что говорит Health", "What Health says"),
        [
          {
            title: L("Як рақам", "Одно число", "One number"),
            body: L(
              "Health аз 0 то 100: маълумот, маржа, ҷараёни пул, ҳашдор. 90 зебо аст. 40 яъне аввал як сӯрохиро бандед.",
              "Health от 0 до 100: данные, маржа, денежный поток, сигналы. 90 красиво. 40 — сначала закройте одну дыру.",
              "Health is 0–100: data, margin, cash, alerts. 90 looks fine. 40 means close one hole first.",
            ),
          },
          {
            title: L("На баҳои одам", "Не оценка человека", "Not a grade for you"),
            body: L(
              "Health шуморо «бад» намегӯяд. Он мегӯяд: кадом қисм холӣ ё хатарнок аст.",
              "Health не говорит, что вы «плохой». Он говорит, какая часть пустая или опасная.",
              "Health does not call you “bad”. It says which part is empty or risky.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Рақами Health-ро кушоед. Яке аз ҳашдорҳои сурхро хонед — ва ҳамонро имрӯз ислоҳ кунед.",
              "Откройте Health. Прочитайте один красный сигнал — и его сегодня исправьте.",
              "Open Health. Read one red alert — and fix that one today.",
            ),
          },
        ],
        {
          question: L(
            "Health-и паст аввал чӣ мегӯяд?",
            "Низкий Health о чём говорит в первую очередь?",
            "What does a low Health score say first?",
          ),
          options: {
            tg: ["Шумо соҳибкори бад ҳастед", "Як қисми рақам ё хатар холӣ аст", "Бояд мағозаро бандед"],
            ru: ["Вы плохой предприниматель", "Какая-то цифра или риск пустые", "Нужно закрыть магазин"],
            en: ["You are a bad owner", "Some number or risk is empty", "You must close the shop"],
          },
          correct: 1,
          why: L(
            "Health харита аст, на ҳукм. Яке аз сӯрохиҳоро бандед — рақам мехезад.",
            "Health — карта, не приговор. Закройте одну дыру — число поднимется.",
            "Health is a map, not a verdict. Close one hole — the number rises.",
          ),
        },
      ),
      lesson(
        "hafta-2",
        "hafta",
        L("Як қарор дар як рӯз", "Одно решение в день", "One decision a day"),
        [
          {
            title: L("Кам, равшан", "Мало, ясно", "Few, clear"),
            body: L(
              "Даҳ вазифа = ҳеҷ вазифа. Як қарор: нарх, харид, ё пайвасти фурӯш. Баъд андоза гиред.",
              "Десять задач = ноль задач. Одно решение: цена, закуп или подключение продаж. Потом измерьте.",
              "Ten tasks equal zero tasks. One decision: price, purchase, or sales connect. Then measure.",
            ),
          },
          {
            title: L("Тугмаи қарор", "Кнопка решения", "The decide button"),
            body: L(
              "«Қарори AI» пайдарҳамӣ медиҳад: таҳлил → шарҳ → симуляция → тавсия. Шумо тасдиқ мекунед. Бе шумо амали беруна нест.",
              "«Решение ИИ» даёт цепочку: анализ → объяснение → симуляция → совет. Подтверждаете вы. Без вас внешнего действия нет.",
              "“AI decide” gives a chain: analyze → explain → simulate → recommend. You confirm. Nothing outside runs without you.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Имрӯз як қарорро нависед ва то ҷумъа натиҷаашро санҷед. На даҳ қарор.",
              "Сегодня запишите одно решение и до пятницы проверьте результат. Не десять решений.",
              "Write one decision today and check the result by Friday. Not ten decisions.",
            ),
          },
        ],
        {
          question: L(
            "Чаро як қарор дар як рӯз беҳтар аз даҳ вазифа аст?",
            "Почему одно решение в день лучше десяти задач?",
            "Why is one decision a day better than ten tasks?",
          ),
          options: {
            tg: [
              "Чунки натиҷаро санҷида метавонед",
              "Чунки AI танҳо як тугма дорад",
              "Чунки қонун ҳамин тавр аст",
            ],
            ru: [
              "Потому что результат можно проверить",
              "Потому что у ИИ одна кнопка",
              "Потому что так написано в законе",
            ],
            en: [
              "Because you can measure the result",
              "Because the AI has only one button",
              "Because the law says so",
            ],
          },
          correct: 0,
          why: L(
            "Даҳ кори нимта натиҷа намедиҳад. Як қадами ченшаванда бизнесро пеш мебарад.",
            "Десять полудел не дают результата. Один измеримый шаг двигает бизнес.",
            "Ten half-done jobs give no result. One measurable step moves the business.",
          ),
        },
      ),
      lesson(
        "hafta-3",
        "hafta",
        L("Ҷумъаи баррасӣ", "Пятница проверки", "Friday review"),
        [
          {
            title: L("15 дақиқа", "15 минут", "Fifteen minutes"),
            body: L(
              "Ҷумъа: Health, графики ҳафта, 1 ҳашдор, 1 қарори ҳафтаи оянда. Бе ҷаласаи дароз.",
              "Пятница: Health, график недели, 1 сигнал, 1 решение на следующую неделю. Без длинного собрания.",
              "Friday: Health, the week chart, 1 alert, 1 decision for next week. No long meeting.",
            ),
          },
          {
            title: L("Пешгӯӣ, на қасам", "Прогноз, не клятва", "Forecast, not an oath"),
            body: L(
              "Ҳар рақами оянда тахмин аст. Агар хато шуд — модели шумо нав мешавад, на «система дурӯғ гуфт».",
              "Каждая цифра будущего — оценка. Если ошиблись — обновляется ваша модель, а не «система солгала».",
              "Every future number is an estimate. If it misses — your model updates, not “the system lied”.",
            ),
          },
          {
            title: L("Қадами шумо", "Ваш шаг", "Your step"),
            body: L(
              "Ҷумъа як ҷумла нависед: чӣ кор кард, чӣ не. Ин аз дафтари пурбеҳуда беҳтар аст.",
              "В пятницу напишите одно предложение: что сработало, что нет. Это лучше толстой тетради.",
              "On Friday write one sentence: what worked, what did not. That beats a fat unused notebook.",
            ),
          },
        ],
        {
          question: L(
            "Рақами пешгӯӣ дар панел чӣ аст?",
            "Что такое прогнозная цифра на панели?",
            "What is a forecast number on the panel?",
          ),
          options: {
            tg: ["Кафолати фоида", "Тахмин барои қарор", "Қурби расмии бонк"],
            ru: ["Гарантия прибыли", "Оценка для решения", "Официальный курс банка"],
            en: ["A profit guarantee", "An estimate for a decision", "The official bank rate"],
          },
          correct: 1,
          why: L(
            "Пешгӯӣ барои фикр аст, на қасам. Қарор бо шумост.",
            "Прогноз для мысли, не клятва. Решение за вами.",
            "A forecast is for thinking, not a vow. The decision stays yours.",
          ),
        },
      ),
    ],
  },
];

export function academyLessons(): AcademyLesson[] {
  return ACADEMY_UNITS.flatMap((unit) => unit.lessons);
}

export function findLesson(id: string): AcademyLesson | undefined {
  return academyLessons().find((lesson) => lesson.id === id);
}

export function lessonOrder(): string[] {
  return academyLessons().map((lesson) => lesson.id);
}

export function isLessonLocked(lessonId: string, completed: string[]): boolean {
  const order = lessonOrder();
  const index = order.indexOf(lessonId);
  if (index <= 0) return false;
  const prev = order[index - 1];
  return Boolean(prev && !completed.includes(prev));
}

export function nextLessonId(completed: string[]): string | null {
  const order = lessonOrder();
  return order.find((id) => !completed.includes(id)) ?? null;
}

export function academyNicheIntro(niche: NicheId, locale: Locale): string {
  const pack: Record<NicheId, Record<Locale, string>> = {
    cars: L(
      "Шумо самти мошинро интихоб кардед. Дарсҳо ҳамон қоидаанд: запчаст, мойка ё фурӯши мошин — аввал арзиш, баъд нарх.",
      "Вы выбрали авто. Уроки те же: запчасть, мойка или авто — сначала себестоимость, потом цена.",
      "You chose cars. The lessons stay the same: parts, wash or cars — cost first, then price.",
    ),
    phones: L(
      "Самти телефон ва гаҷет. Қоида як аст: нархи харид + кафолат + талаф, на ҷанги нарх бо бозор.",
      "Направление телефоны и гаджеты. Правило одно: закуп + гарантия + потери, не война цен с рынком.",
      "Phones and gadgets. Same rule: buy + warranty + loss, not a price war with the market.",
    ),
    clothes: L(
      "Либос: мавсим ва боқимонда муҳим аст. Дарсҳо нишон медиҳанд, чӣ тавр молро «мурда» нагузоред.",
      "Одежда: сезон и остаток важны. Уроки покажут, как не оставить «мёртвый» товар.",
      "Clothes: season and leftover matter. Lessons show how not to leave dead stock.",
    ),
    food: L(
      "Хӯрок ва қаҳва: талаф ва рӯз ҳисоб мешавад. Як рӯзи холӣ ҳафтаро мешиканад — аз ҳамин сабаб сабт лозим аст.",
      "Еда и кофе: списание и день решают. Один пустой день ломает неделю — поэтому запись нужна.",
      "Food and coffee: waste and the day matter. One empty day breaks the week — that is why you record.",
    ),
    construction: L(
      "Сохтмон: харид калон, гардиш суст. Маржа ва пешпардохт аз дарсҳои нарх ва ҳафта бармеоянд.",
      "Стройка: закуп большой, оборот медленный. Маржа и предоплата — из уроков цены и недели.",
      "Construction: big buy, slow turn. Margin and prepay come from the price and week lessons.",
    ),
    agriculture: L(
      "Кишоварзӣ: мавсим дароз аст. Қарорро аз як ҳафта нагиред — дарсҳои ҳафта ҳаминро мегӯянд.",
      "Сельское хозяйство: сезон длинный. Решение с одной недели не берут — уроки недели об этом.",
      "Agriculture: the season is long. Do not decide from one week — the week lessons say that.",
    ),
    education: L(
      "Таълим: мизоҷ такрор меояд. CRM ва қарори ҳафта аз молҳои рафта муҳимтаранд.",
      "Обучение: клиент возвращается. CRM и решение недели важнее ушедшего товара.",
      "Education: the client returns. CRM and the weekly decision matter more than sold goods.",
    ),
    it: L(
      "IT / сомона: вақти шумо — арзиш аст. Дарси арзиши воқеӣ-ро ба соатҳои худ татбиқ кунед.",
      "IT / сайт: ваше время — себестоимость. Урок реальной себестоимости примените к своим часам.",
      "IT / sites: your time is the cost. Apply the true-cost lesson to your hours.",
    ),
    repair: L(
      "Таъмир: қисм + соат. Нархро аз ҳарду ҳисоб кунед, на танҳо аз қисм.",
      "Ремонт: деталь + час. Цену считайте из обоих, не только из детали.",
      "Repair: part + hour. Price both, not the part alone.",
    ),
    online: L(
      "Фурӯши онлайн: пайвасти сайт дар дарсҳои фурӯш аст. Бе сабти фармоиш панел холӣ мемонад.",
      "Онлайн-продажи: подключение сайта — в уроках продаж. Без записи заказа панель пустая.",
      "Online sales: connecting the site is in the sales lessons. Without order records the panel stays empty.",
    ),
    service: L(
      "Хизмат: вақт мол аст. Дарсҳои нарх ва ҳафта ба соатҳои шумо дахл доранд.",
      "Услуга: время — товар. Уроки цены и недели про ваши часы.",
      "Service: time is the product. Price and week lessons are about your hours.",
    ),
    general: L(
      "Самти шумо савдои хурд аст. Дарсҳо умумӣанд: рақам, нарх, рақиб, як қарор дар як ҳафта.",
      "Ваше направление — малая торговля. Уроки общие: цифра, цена, конкурент, одно решение в неделю.",
      "Your path is small trade. Lessons stay general: numbers, price, rivals, one decision a week.",
    ),
  };
  return pack[niche][locale];
}
