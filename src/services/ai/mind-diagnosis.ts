/**
 * Ташхиси мафкура аз 10 ҷавоб — Claude, бо захираи маҳаллӣ.
 */
import { MIND_QUESTIONS } from "@/constants/mind-quiz";
import { llmLanguage, type Locale } from "@/lib/locale-query";
import { wrapOwnerMessage } from "@/lib/tajik-text";
import type { LearnDiagnosis } from "@/lib/store";
import { nowIso } from "@/lib/store";
import { businessSystemPrompt } from "@/services/ai/business-system";
import {
  aiConfigured,
  classifyClaudeError,
  completeClaude,
  extractJsonObject,
} from "@/services/ai/claude";

const UNITS = ["asos", "furush", "narx", "raqib", "hafta"] as const;

function localDiagnosis(answers: number[], locale: Locale): Omit<LearnDiagnosis, "answers" | "createdAt"> {
  const score = answers.reduce((s, n) => s + (n === 0 ? 2 : n === 1 ? 1 : 0), 0);
  const pack =
    score >= 16
      ? {
          profile: "raqam",
          tg: {
            title: "Шумо аз рақам фикр мекунед",
            summary: "Қарорҳоятон ба ҳисоб наздиканд. Курс инро мустаҳкам мекунад: сабт, маржа, як қадам дар як ҳафта.",
            lead: "Шумо аллакай рақамро дӯст медоред. Дарсҳо кӯтоҳанд — аввал асос, баъд ҳафта.",
            advice: "Як ҳафта фурӯшро пурра нависед — баъд Health-ро хонед.",
          },
          ru: {
            title: "Вы мыслите цифрой",
            summary: "Решения близки к счёту. Курс это закрепит: запись, маржа, один шаг в неделю.",
            lead: "Цифра вам уже близка. Уроки короткие — сначала основа, потом неделя.",
            advice: "Запишите продажи за неделю — затем откройте Health.",
          },
          en: {
            title: "You think in numbers",
            summary: "Your calls stay close to a sum. The course locks that in: records, margin, one step a week.",
            lead: "Numbers already fit you. Lessons stay short — foundation first, then the week.",
            advice: "Record a full week of sales — then read Health.",
          },
          focus: ["asos", "hafta"],
        }
      : score >= 10
        ? {
            profile: "narxjang",
            tg: {
              title: "Шумо бештар ба бозор нигоҳ мекунед",
              summary: "Нарх ва рақиб шуморо мекашад. Хатар: зери арзиш фурӯхтан. Курс аввал арзиш, баъд рақибро меомӯзонад.",
              lead: "Аввал арзиши худ, баъд рақиб. Ҷанги нарх дарсҳои алоҳида дорад.",
              advice: "Се моли асосӣ: харид + роҳро нависед, пеш аз паст кардани нарх.",
            },
            ru: {
              title: "Вы смотрите на рынок",
              summary: "Цена и конкурент тянут вас. Риск: продажа ниже себестоимости. Курс начнёт с себестоимости, затем конкурент.",
              lead: "Сначала своя себестоимость, потом конкурент. Ценовая война — отдельный урок.",
              advice: "Три главных товара: закуп + дорога, прежде чем снижать цену.",
            },
            en: {
              title: "You watch the market",
              summary: "Price and rivals pull you. Risk: selling below cost. The course starts with cost, then rivals.",
              lead: "Your cost first, then the rival. Price war is its own lesson.",
              advice: "Write buy + transport for three core products before you cut price.",
            },
            focus: ["narx", "raqib"],
          }
        : {
            profile: "his",
            tg: {
              title: "Шумо бештар бо ҳис кор мекунед",
              summary: "Ин бад нест — аммо панел сифр мемонад. Курс аз асос ва сабти фурӯш сар мешавад.",
              lead: "Аввал фарқи фурӯш ва фоида, баъд ҳар фурӯш як сатр. Бе ин AI тахмин мекунад.",
              advice: "Имрӯз 3 фурӯшро нависед. Баъд дарси аввалро кушоед.",
            },
            ru: {
              title: "Вы больше работаете на ощущении",
              summary: "Это не плохо — но панель останется нулевой. Курс начнёт с основы и записи продаж.",
              lead: "Сначала выручка и прибыль, затем каждая продажа — строка. Иначе ИИ гадает.",
              advice: "Сегодня запишите 3 продажи. Затем откройте первый урок.",
            },
            en: {
              title: "You work more by feel",
              summary: "That is not a flaw — but the panel stays at zero. The course starts with basics and recording sales.",
              lead: "Sales vs profit first, then every sale as a row. Otherwise the AI guesses.",
              advice: "Write 3 sales today. Then open the first lesson.",
            },
            focus: ["asos", "furush"],
          };

  const text = pack[locale];
  return {
    profile: pack.profile,
    title: text.title,
    summary: text.summary,
    strengths: [],
    gaps: [],
    focusUnitIds: pack.focus,
    firstAdvice: text.advice,
    courseLead: text.lead,
    usedAi: false,
    aiError: "no_key",
  };
}

export async function diagnoseMind(input: {
  answers: number[];
  locale: Locale;
  focus?: string;
}): Promise<LearnDiagnosis> {
  const answers = input.answers.slice(0, 10);
  if (answers.length !== 10 || answers.some((n) => n < 0 || n > 2)) {
    throw new Error("BAD_ANSWERS");
  }
  const lines = MIND_QUESTIONS.map((q, i) => {
    const pick = q.options[answers[i] ?? 0];
    return `${i + 1}. ${q.title[input.locale]} → ${pick?.[input.locale] ?? ""}`;
  }).join("\n");

  const fallback = localDiagnosis(answers, input.locale);
  const base: LearnDiagnosis = {
    ...fallback,
    answers,
    createdAt: nowIso(),
  };

  if (!aiConfigured()) return base;

  const system = businessSystemPrompt({
    locale: input.locale,
    jsonOnly: true,
    ownerFocus: input.focus,
    ownerMessage: input.focus,
    role: "You diagnose a small-business owner's decision mindset from 10 answers. No praise fluff. Do not decide instead of them. Recommend 2 course unit ids from: asos, furush, narx, raqib, hafta.",
  });
  const ask = [
    input.focus ? wrapOwnerMessage(input.focus) : "",
    `Answers:\n${lines}`,
    `Reply in ${llmLanguage(input.locale)} as JSON only:`,
    `{"profile":"raqam|narxjang|his","title":"","summary":"","strengths":["",""],"gaps":["",""],"focusUnitIds":["asos","furush"],"firstAdvice":"","courseLead":""}`,
    "courseLead is 1–2 sentences that open the course path for this person.",
    "firstAdvice is one concrete action in TJS or a record to write today.",
  ].filter(Boolean).join("\n");

  try {
    const raw = extractJsonObject(
      await completeClaude(system, ask, { timeoutMs: 18000, userLimit: 6000 }),
    );
    if (!raw || typeof raw !== "object") return { ...base, aiError: "fail" };
    const row = raw as Record<string, unknown>;
    const focus = Array.isArray(row.focusUnitIds)
      ? row.focusUnitIds.map((x) => String(x)).filter((id) => UNITS.includes(id as (typeof UNITS)[number]))
      : [];
    return {
      answers,
      profile: String(row.profile ?? fallback.profile).slice(0, 24),
      title: String(row.title ?? fallback.title).slice(0, 120),
      summary: String(row.summary ?? fallback.summary).slice(0, 500),
      strengths: Array.isArray(row.strengths)
        ? row.strengths.map((x) => String(x).slice(0, 160)).slice(0, 3)
        : [],
      gaps: Array.isArray(row.gaps) ? row.gaps.map((x) => String(x).slice(0, 160)).slice(0, 3) : [],
      focusUnitIds: focus.length ? focus : fallback.focusUnitIds,
      firstAdvice: String(row.firstAdvice ?? fallback.firstAdvice).slice(0, 240),
      courseLead: String(row.courseLead ?? fallback.courseLead).slice(0, 360),
      usedAi: true,
      aiError: null,
      createdAt: nowIso(),
    };
  } catch (error) {
    console.warn("[mind-diagnosis] fallback", error);
    return { ...base, aiError: classifyClaudeError(error) };
  }
}
