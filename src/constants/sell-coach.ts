import type { Locale } from "@/lib/locale-query";
import type { NicheId } from "@/lib/niche";

/** Се ҷумла барои гап бо мизоҷ ва се амал барои фурӯши беҳтар. */
export type CoachLines = {
  talk: readonly [string, string, string];
  sell: readonly [string, string, string];
};

function pack(tg: CoachLines, ru: CoachLines, en: CoachLines): Record<Locale, CoachLines> {
  return { tg, ru, en };
}

/**
 * Матни оддӣ барои дӯкондорони Тоҷикистон — бе жаргон.
 * UI-рамка дар messages/*.json, ин ҷо танҳо скрипти фурӯш.
 */
export const SELL_COACH: Record<NicheId, Record<Locale, CoachLines>> = {
  cars: pack(
    {
      talk: [
        "Напурсед «мошин мехоҳед?» — пурсед: барои шаҳр, роҳ ё оила?",
        "Қисмро бо калимаи оддӣ гӯед (тормоз, равған), на танҳо код.",
        "Агар гарон бошад: «Ин дароз меистад; арзон пас аз чанд моҳ дубора харидан аст.»",
      ],
      sell: [
        "5 мизоҷи кӯҳнаро занг занед: «қисми X тамом шуд, ҳозир омад».",
        "Як бандл созед: равған + филтр бо нархи якҷоя.",
        "Ҳар харидро дар касса нависед — ҳисобот аз ҳамин ҷо рост мешавад.",
      ],
    },
    {
      talk: [
        "Не спрашивайте «машину берёте?» — спросите: город, трасса или семья?",
        "Деталь называйте простыми словами (тормоза, масло), не только кодом.",
        "Если дорого: «Это дольше служит; дешёвое через пару месяцев купите снова.»",
      ],
      sell: [
        "Позвоните 5 старым клиентам: «деталь X закончилась, сейчас пришла».",
        "Соберите комплект: масло + фильтр по одной цене.",
        "Каждую продажу пишите в кассе — отчёт берётся оттуда.",
      ],
    },
    {
      talk: [
        "Do not ask “want a car?” — ask: city, highway, or family?",
        "Name the part in plain words (brakes, oil), not only a code.",
        "If it feels expensive: “This lasts; cheap ones come back in a few months.”",
      ],
      sell: [
        "Call 5 past customers: “part X was out, it is in now.”",
        "Make a bundle: oil + filter at one price.",
        "Record every sale at the till — the report comes from that.",
      ],
    },
  ),
  phones: pack(
    {
      talk: [
        "Аввал батарея ва кафолатро гӯед, на гигабайт.",
        "Пурсед: WhatsApp, акс ё бозӣ? Баъд 1–2 моделро нишон диҳед.",
        "Ду нарх гузоред: арзонтар ва каме беҳтар — мизоҷ худаш интихоб мекунад.",
      ],
      sell: [
        "Ба ҳар телефон чеҳол ё кабелро ҳамроҳ пешниҳод кунед.",
        "3 моделеро, ки намефурӯшад, 3 рӯз бо нархи равшан нишон диҳед.",
        "Рақами мизоҷро нависед ва пас аз як ҳафта пурсед: ҳама кор мекунад?",
      ],
    },
    {
      talk: [
        "Сначала батарея и гарантия, не гигабайты.",
        "Спросите: WhatsApp, фото или игры? Потом покажите 1–2 модели.",
        "Две цены: дешевле и чуть лучше — клиент выбирает сам.",
      ],
      sell: [
        "К каждому телефону предложите чехол или кабель.",
        "Три модели, которые не идут, три дня держите с ясной ценой.",
        "Запишите номер и через неделю спросите: всё работает?",
      ],
    },
    {
      talk: [
        "Lead with battery and warranty, not gigabytes.",
        "Ask: WhatsApp, photos, or games? Then show 1–2 models.",
        "Offer two prices: cheaper and a bit better — the customer chooses.",
      ],
      sell: [
        "Offer a case or cable with every phone.",
        "For 3 days, put a clear price on 3 slow models.",
        "Save the number and ask in a week: is everything working?",
      ],
    },
  ),
  clothes: pack(
    {
      talk: [
        "Аввал андоза ва матоъ, баъд нарх.",
        "Пурсед: тӯй, кор ё кӯча? Ба ҳамон ҷо 2 либос нишон диҳед.",
        "Агар дуранд: «Инро бо ҳамин ҷуфт кунед — як либос мешавад.»",
      ],
      sell: [
        "Либосҳои кӯҳнаро як ҷуфт нарх кунед, на як-як.",
        "Акс дар ватсап бо андоза ва нарх — 5 мизоҷи наздик.",
        "Ҳар рӯз 3 касро бо ном салом гӯед — такрор мехаранд.",
      ],
    },
    {
      talk: [
        "Сначала размер и ткань, потом цена.",
        "Спросите: свадьба, работа или улица? Покажите 2 вещи под это.",
        "Если сомневаются: «Это с этим соберётся в один образ.»",
      ],
      sell: [
        "Старые вещи продавайте парой, не по одной.",
        "Фото в WhatsApp с размером и ценой — 5 знакомым клиентам.",
        "Каждый день по имени поприветствуйте 3 человек — они вернутся.",
      ],
    },
    {
      talk: [
        "Size and fabric first, price second.",
        "Ask: wedding, work, or street? Show 2 pieces for that.",
        "If they hesitate: “This pairs with this — one outfit.”",
      ],
      sell: [
        "Price slow pieces as a pair, not one by one.",
        "Send size and price on WhatsApp to 5 regulars.",
        "Greet 3 people by name every day — they come back.",
      ],
    },
  ),
  food: pack(
    {
      talk: [
        "Имрӯз чӣ тару тоза аст ва чӣ тамом шуд — рост гӯед.",
        "Ҷуфт пешниҳод кунед: нон + чой, гӯшт + сабзӣ.",
        "Мизоҷи такрорро бо ном салом гӯед.",
      ],
      sell: [
        "Пеш аз пӯшидан молҳои имрӯзро бо нархи охирин фурӯшед.",
        "Як «порцияи рӯз»-ро дар дари дӯкон нависед.",
        "5 ҳамсояро пурсед: чӣ ҳар рӯз лозим аст — ҳамонро захира кунед.",
      ],
    },
    {
      talk: [
        "Честно скажите, что сегодня свежее и чего уже нет.",
        "Предлагайте пару: хлеб + чай, мясо + овощи.",
        "Постоянных клиентов здоровайте по имени.",
      ],
      sell: [
        "Перед закрытием продайте сегодняшнее с последней ценой.",
        "Напишите на двери «порцию дня».",
        "Спросите 5 соседей, что нужно каждый день — держите это.",
      ],
    },
    {
      talk: [
        "Say honestly what is fresh today and what is gone.",
        "Offer a pair: bread + tea, meat + vegetables.",
        "Greet regulars by name.",
      ],
      sell: [
        "Before closing, sell today’s leftover at a last price.",
        "Write a “dish of the day” on the door.",
        "Ask 5 neighbours what they need daily — stock that.",
      ],
    },
  ),
  construction: pack(
    {
      talk: [
        "Пурсед: таъмир ё бинои нав? Ҳаҷмро қабл аз нарх гӯед.",
        "Нархи як халта/метрро гӯед, то мизоҷ ҳисоб кунад.",
        "Кафолати таҳвилро равшан гӯед: кай меояд.",
      ],
      sell: [
        "Ба устоҳои наздик рӯйхати нархҳои ҳафтаро фиристед.",
        "Семент + қумро якҷоя нарх кунед.",
        "Фармоиши калонро дар касса бо номи мизоҷ нависед.",
      ],
    },
    {
      talk: [
        "Спросите: ремонт или новая стройка? Объём — до цены.",
        "Назовите цену за мешок/метр, чтобы клиент посчитал.",
        "Срок поставки скажите прямо.",
      ],
      sell: [
        "Мастерам рядом пришлите прайс на неделю.",
        "Цемент + песок продавайте комплектом.",
        "Крупный заказ в кассе пишите с именем клиента.",
      ],
    },
    {
      talk: [
        "Ask: repair or new build? Volume before price.",
        "Give the price per bag/metre so they can count.",
        "Say the delivery day clearly.",
      ],
      sell: [
        "Send this week’s prices to nearby builders.",
        "Price cement + sand as a set.",
        "Log large orders at the till with the client’s name.",
      ],
    },
  ),
  agriculture: pack(
    {
      talk: [
        "Пурсед: барои замин ё чорво? Мавсимро ба назар гиред.",
        "Миқдори ҳадди ақалро равшан гӯед.",
        "Агар тухм/нурист — чӣ қадар об ва вақт лозим аст, кӯтоҳ шарҳ диҳед.",
      ],
      sell: [
        "Пеш аз мавсим 10 деҳқонро занг занед.",
        "Тухм + нуриро якҷоя пешниҳод кунед.",
        "Қарзи кӯтоҳро нависед — фаромӯш нашавад.",
      ],
    },
    {
      talk: [
        "Спросите: земля или скот? Учитывайте сезон.",
        "Минимальный объём скажите сразу.",
        "Для семян/удобрения кратко: сколько воды и времени.",
      ],
      sell: [
        "До сезона позвоните 10 фермерам.",
        "Семена + удобрение предлагайте вместе.",
        "Короткий долг запишите, чтобы не забыть.",
      ],
    },
    {
      talk: [
        "Ask: land or livestock? Keep the season in mind.",
        "State the minimum volume up front.",
        "For seed/fertilizer, say water and time in one sentence.",
      ],
      sell: [
        "Before the season, call 10 farmers.",
        "Offer seed + fertilizer together.",
        "Write short credit down so it is not forgotten.",
      ],
    },
  ),
  education: pack(
    {
      talk: [
        "Натиҷаро гӯед: баъд аз курс чӣ мекунад шогирд, на танҳо соатҳо.",
        "Як ҳикояи кӯтоҳи шогирди қаблӣ.",
        "Нархро бо пардохти моҳона шарҳ диҳед, агар гарон бошад.",
      ],
      sell: [
        "Ба падару модарон 5 паём бо натиҷаи ҳафта фиристед.",
        "Дарси озмоишии ройгон — баъд нарх.",
        "Шогирдони кӯҳнаро пурсед: дӯст меоред?",
      ],
    },
    {
      talk: [
        "Говорите результат: что ученик сможет, не только часы.",
        "Короткая история прошлого ученика.",
        "Если дорого — разложите цену по месяцам.",
      ],
      sell: [
        "Родителям — 5 сообщений с итогом недели.",
        "Пробный урок бесплатно, потом цена.",
        "Старых учеников спросите: приведёте друга?",
      ],
    },
    {
      talk: [
        "Talk about the result: what the student can do, not only hours.",
        "One short story from a past student.",
        "If it feels expensive, split the price by month.",
      ],
      sell: [
        "Send 5 parents a weekly result note.",
        "A free trial lesson, then the price.",
        "Ask past students to bring a friend.",
      ],
    },
  ),
  it: pack(
    {
      talk: [
        "Аввал мушкили бизнесро такрор кунед: «шумо мехоҳед X».",
        "Нархро бо марҳила гӯед: сайт, баъд пардохт, баъд реклама.",
        "Мӯҳлатро рост гӯед — ваъдаи дурӯғ боварро мешиканад.",
      ],
      sell: [
        "5 соҳибкори бе сайт — як саҳифаи намуна нишон диҳед.",
        "Хизмати хурдро нарх кунед (лого, WhatsApp-каталог).",
        "Пас аз супоридан, як моҳ дастгирӣ пешниҳод кунед.",
      ],
    },
    {
      talk: [
        "Сначала повторите боль: «вы хотите X».",
        "Цену по этапам: сайт, оплата, реклама.",
        "Срок скажите честно — ложь ломает доверие.",
      ],
      sell: [
        "Пяти бизнесам без сайта покажите одну страницу-пример.",
        "Продайте мелкую услугу (логотип, каталог в WhatsApp).",
        "После сдачи предложите месяц поддержки.",
      ],
    },
    {
      talk: [
        "Repeat the pain first: “you want X”.",
        "Price in stages: site, payments, ads.",
        "Give an honest deadline — a lie breaks trust.",
      ],
      sell: [
        "Show one sample page to 5 shops with no site.",
        "Sell a small job (logo, WhatsApp catalogue).",
        "After delivery, offer one month of support.",
      ],
    },
  ),
  repair: pack(
    {
      talk: [
        "Аввал гӯш кунед: чӣ вайрон шуд ва кай. Баъд нарх.",
        "Ду нарх: таъмири ҳадди ақал ва таъмири дуруст.",
        "Кафолатро бо рӯзҳо гӯед.",
      ],
      sell: [
        "Мизоҷони қаблиро пурсед: боз чӣ садо медиҳад?",
        "Қисмҳои зудтамомшавандаро дар анбор дошта бошед.",
        "Ҳар таъмирро дар касса нависед — фоида пинҳон намемонад.",
      ],
    },
    {
      talk: [
        "Сначала слушайте: что сломалось и когда. Потом цена.",
        "Две цены: минимум и «сделать как надо».",
        "Гарантию скажите в днях.",
      ],
      sell: [
        "Старых клиентов спросите: что ещё шумит?",
        "Держите в запасе детали, которые кончаются быстро.",
        "Каждый ремонт пишите в кассе — прибыль не спрячется.",
      ],
    },
    {
      talk: [
        "Listen first: what broke and when. Then the price.",
        "Two prices: minimum fix and a proper fix.",
        "State the warranty in days.",
      ],
      sell: [
        "Ask past clients what else is making noise.",
        "Keep fast-moving parts in stock.",
        "Log every repair at the till so profit is visible.",
      ],
    },
  ),
  online: pack(
    {
      talk: [
        "Дар аввали паём: мол, нарх, расондан — се сатр.",
        "Акс бо ҳамон мол, на акс аз интернет.",
        "Агар мепурсанд «боқӣ ҳаст?» — ҷавоб дар 10 дақиқа.",
      ],
      sell: [
        "Ҳар рӯз 3 моли беҳтаринро дар статус/канал гузоред.",
        "Ба касе, ки нанавишт, пас аз 1 рӯз нархро ёдрас кунед.",
        "Фурӯши онлайнро ҳам дар касса сабт кунед.",
      ],
    },
    {
      talk: [
        "В первом сообщении: товар, цена, доставка — три строки.",
        "Фото именно вашего товара, не из интернета.",
        "На «есть ещё?» отвечайте за 10 минут.",
      ],
      sell: [
        "Каждый день 3 лучших товара в статус/канал.",
        "Кто не ответил — через день напомните цену.",
        "Онлайн-продажу тоже пишите в кассе.",
      ],
    },
    {
      talk: [
        "First message: item, price, delivery — three lines.",
        "Photo of your actual goods, not from the internet.",
        "Reply to “still available?” within 10 minutes.",
      ],
      sell: [
        "Post your 3 best items every day.",
        "If they go quiet, remind the price the next day.",
        "Log online sales at the till too.",
      ],
    },
  ),
  service: pack(
    {
      talk: [
        "Мушкилро бо ҷумлаи мизоҷ такрор кунед, баъд ҳалли худро гӯед.",
        "Нарх + вақт + чӣ дохил аст — пеш аз кор.",
        "Намуна ё акс аз кори қаблӣ нишон диҳед.",
      ],
      sell: [
        "Пас аз кор пурсед: касе аз дӯстон лозим дорад?",
        "Хизмати такрорро бо нархи маълум пешниҳод кунед.",
        "Ҳар хизматро дар касса нависед.",
      ],
    },
    {
      talk: [
        "Повторите проблему словами клиента, потом решение.",
        "Цена + срок + что входит — до начала работы.",
        "Покажите пример прошлой работы.",
      ],
      sell: [
        "После работы спросите: нужен ли кто из друзей?",
        "Предложите повтор с понятной ценой.",
        "Каждую услугу пишите в кассе.",
      ],
    },
    {
      talk: [
        "Repeat the problem in the client’s words, then your fix.",
        "Price + time + what is included — before you start.",
        "Show a photo of past work.",
      ],
      sell: [
        "After the job, ask if a friend needs the same.",
        "Offer a repeat visit with a clear price.",
        "Log every service at the till.",
      ],
    },
  ),
  general: pack(
    {
      talk: [
        "Як савол: «барои худ ё тӯҳфа?» — ҷавоб нархро осон мекунад.",
        "Ду вариант нишон диҳед, на даҳ. Мизоҷ хаста намешавад.",
        "Агар шубҳа: «фарқи ин дуро дар як дақиқа мегӯям.»",
      ],
      sell: [
        "5 касеро, ки як бор харидаанд, имрӯз ёдрас кунед.",
        "Яке аз молҳои сустро бо нарх ё ҷуфт фурӯшед.",
        "Ҳар харидро дар касса нависед — ҳисобот аз ҳамин ҷост.",
      ],
    },
    {
      talk: [
        "Один вопрос: «себе или в подарок?» — так проще назвать цену.",
        "Покажите два варианта, не десять.",
        "Если сомневаются: «за минуту скажу разницу этих двух.»",
      ],
      sell: [
        "Сегодня напомните 5 людям, кто уже покупал.",
        "Медленный товар продайте со скидкой или в паре.",
        "Каждую покупку пишите в кассе — отчёт оттуда.",
      ],
    },
    {
      talk: [
        "One question: “for you or as a gift?” — pricing gets easier.",
        "Show two options, not ten.",
        "If they hesitate: “I’ll say the difference in one minute.”",
      ],
      sell: [
        "Today, remind 5 people who already bought.",
        "Move one slow item with a price or a pair.",
        "Record every sale at the till — that is the report.",
      ],
    },
  ),
};
