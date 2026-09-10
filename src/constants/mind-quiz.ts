import type { Locale } from "@/lib/locale-query";

function L(tg: string, ru: string, en: string): Record<Locale, string> {
  return { tg, ru, en };
}

export type MindQuestion = {
  id: string;
  title: Record<Locale, string>;
  options: [Record<Locale, string>, Record<Locale, string>, Record<Locale, string>];
};

/** 10 савол пеш аз курс — мафкура, на тестҳои «дуруст/хато». */
export const MIND_QUESTIONS: MindQuestion[] = [
  {
    id: "q1",
    title: L("Нархро чӣ тавр мегузоред?", "Как вы ставите цену?", "How do you set a price?"),
    options: [
      L("Аз харид ва хароҷоти худ ҳисоб мекунам", "Считаю от закупа и своих расходов", "I count from my cost and expenses"),
      L("Аз нархи рақиб ё бозор", "От цены конкурента или рынка", "From the rival or the market"),
      L("Ҳис мекунам, ки мизоҷ чӣ медиҳад", "По ощущению, сколько даст клиент", "By gut — what the customer will pay"),
    ],
  },
  {
    id: "q2",
    title: L("Фоида барои шумо чӣ аст?", "Что для вас прибыль?", "What is profit to you?"),
    options: [
      L("Он чи пас аз ҳамаи хароҷот мемонад", "То, что осталось после всех расходов", "What remains after every cost"),
      L("Ҳамаи пуле, ки мизоҷ дод", "Все деньги, что дал клиент", "Everything the customer paid"),
      L("Агар дар хазина пул бошад — фоида ҳаст", "Если в кассе деньги — есть прибыль", "If the till has cash, there is profit"),
    ],
  },
  {
    id: "q3",
    title: L("Фурӯшро чӣ қадар сабт мекунед?", "Как часто записываете продажи?", "How often do you record sales?"),
    options: [
      L("Ҳар рӯз ё аз хазина/сайт худкор", "Каждый день или с кассы/сайта", "Every day or from the till/site"),
      L("Ҳафтае як бор, тахминӣ", "Раз в неделю, примерно", "Once a week, roughly"),
      L("Қариб наменависам", "Почти не пишу", "I almost never write them down"),
    ],
  },
  {
    id: "q4",
    title: L("Рақиб нархро паст кард. Қадами аввал?", "Конкурент снизил цену. Первый шаг?", "A rival cut price. First step?"),
    options: [
      L("Аввал арзиши худро месанҷам", "Сначала проверяю свою себестоимость", "I check my own cost first"),
      L("Дарҳол аз ӯ арзонтар мешавам", "Сразу становлюсь дешевле", "I go cheaper immediately"),
      L("Метарсам ва интизор мешавам", "Боюсь и жду", "I wait and worry"),
    ],
  },
  {
    id: "q5",
    title: L("Қарори калонро чӣ тавр мегиред?", "Как принимаете крупное решение?", "How do you make a big decision?"),
    options: [
      L("Як рақам ва як қадам — баъд месанҷам", "Одна цифра и один шаг — потом проверяю", "One number, one step — then I measure"),
      L("Якбора бисёр корро сар мекунам", "Сразу начинаю много дел", "I start many things at once"),
      L("То эҳсоси пурра интизор мешавам", "Жду полного ощущения уверенности", "I wait until I feel sure"),
    ],
  },
  {
    id: "q6",
    title: L("Вақти шумо дар ҳафта чӣ гуна тақсим аст?", "Как делится ваше время за неделю?", "How is your week split?"),
    options: [
      L("Медонам: фурӯш, харид, идора", "Знаю: продажи, закуп, управление", "I know: sales, buying, admin"),
      L("Ҳамааш омехта, рӯз мегузарад", "Всё смешано, день уходит", "It mixes together and the day goes"),
      L("Бештар дар телефон / интизорӣ", "Больше в телефоне / в ожидании", "Mostly on the phone / waiting"),
    ],
  },
  {
    id: "q7",
    title: L("Мол дар анбор монд. Шумо чӣ мекунед?", "Товар завис на складе. Что делаете?", "Stock is sitting. What do you do?"),
    options: [
      L("Мешуморам: чанд рӯз, чанд пул баста аст", "Считаю: сколько дней и сколько денег заморожено", "I count days and frozen cash"),
      L("Нархро паст мекунам, то равад", "Снижаю цену, чтобы ушло", "I cut the price until it moves"),
      L("Мегузорам, шояд дертар фурӯшад", "Оставляю — вдруг потом продастся", "I leave it — maybe later"),
    ],
  },
  {
    id: "q8",
    title: L("Афзоиш барои шумо чӣ маъно дорад?", "Что для вас рост?", "What does growth mean to you?"),
    options: [
      L("Маржа ва пули озод зиёд шавад", "Чтобы выросли маржа и свободные деньги", "More margin and free cash"),
      L("Фурӯш ва шумораи мол зиёд шавад", "Чтобы выросли продажи и ассортимент", "More sales and more SKUs"),
      L("Дигарон бубинанд, ки ман калон шудаам", "Чтобы другие видели, что я вырос", "So others see that I got bigger"),
    ],
  },
  {
    id: "q9",
    title: L("Вақте рақам бад аст, аввал чӣ?", "Когда цифра плохая, что первым?", "When the number is bad, first move?"),
    options: [
      L("Мефаҳмам кадом мол ё рӯз вайрон кард", "Понимаю, какой товар или день сломал", "I find which product or day broke it"),
      L("Худамро айбдор мекунам ва меистам", "Вину на себя и останавливаюсь", "I blame myself and stop"),
      L("Реклама ё қарз мегирам, то пӯшонам", "Беру рекламу или долг, чтобы закрыть", "I buy ads or debt to cover it"),
    ],
  },
  {
    id: "q10",
    title: L("Аз курс чӣ мехоҳед?", "Чего хотите от курса?", "What do you want from the course?"),
    options: [
      L("Тартиби рақам ва як қарор дар як ҳафта", "Порядок в цифрах и одно решение в неделю", "Order in the numbers and one decision a week"),
      L("Нархи баландтар ва фурӯши бештар", "Выше цена и больше продаж", "Higher price and more sales"),
      L("AI ба ҷои ман қарор гирад", "Чтобы ИИ решал вместо меня", "For AI to decide instead of me"),
    ],
  },
];

export function mindQuestionCount(): number {
  return MIND_QUESTIONS.length;
}
