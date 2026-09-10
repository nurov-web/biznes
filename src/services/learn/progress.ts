/**
 * Пешрафти мактаби бизнес — XP, силсила, дарсҳои анҷомшуда.
 */
import {
  ACADEMY_UNITS,
  academyLessons,
  academyNicheIntro,
  findLesson,
  isLessonLocked,
  nextLessonId,
  type AcademyLocale,
} from "@/constants/academy";
import { detectNiche } from "@/lib/niche";
import { newId, nowIso, readDb, withDb, type LearnDiagnosis, type LearnProgressRow } from "@/lib/store";
import type { Locale } from "@/lib/locale-query";

export type PublicDiagnosis = {
  title: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  focusUnitIds: string[];
  firstAdvice: string;
  courseLead: string;
  usedAi: boolean;
  aiError: string | null;
};

export type PublicLearn = {
  xp: number;
  streak: number;
  lastLessonAt: string | null;
  completedLessonIds: string[];
  nextLessonId: string | null;
  totalLessons: number;
  niche: string;
  intro: string;
  needsDiagnosis: boolean;
  diagnosis: PublicDiagnosis | null;
  units: {
    id: string;
    title: string;
    lead: string;
    recommended: boolean;
    lessons: {
      id: string;
      title: string;
      xp: number;
      done: boolean;
      locked: boolean;
    }[];
  }[];
};

export type CheckLesson =
  | { ok: false; error: string }
  | {
      ok: true;
      correct: boolean;
      already: boolean;
      why: string;
      xp: number;
      totalXp: number;
      streak: number;
      completed: boolean;
      nextLessonId: string | null;
    };

function emptyProgress(businessId: string, userId: string): LearnProgressRow {
  const now = nowIso();
  return {
    id: newId(),
    businessId,
    userId,
    xp: 0,
    streak: 0,
    lastLessonAt: null,
    completedLessonIds: [],
    diagnosis: null,
    createdAt: now,
    updatedAt: now,
  };
}

function dayKey(iso: string): string {
  const date = new Date(iso);
  const dushanbe = new Date(date.getTime() + 5 * 60 * 60 * 1000);
  return dushanbe.toISOString().slice(0, 10);
}

function yesterdayKey(today: string): string {
  const [year, month, day] = today.split("-").map(Number);
  const utc = Date.UTC(year ?? 2026, (month ?? 1) - 1, (day ?? 1) - 1);
  return new Date(utc).toISOString().slice(0, 10);
}

function nextStreak(row: LearnProgressRow, now: string): number {
  if (!row.lastLessonAt) return 1;
  const today = dayKey(now);
  const last = dayKey(row.lastLessonAt);
  if (last === today) return Math.max(row.streak, 1);
  if (last === yesterdayKey(today)) return row.streak + 1;
  return 1;
}

export async function getLearnRow(businessId: string, userId: string): Promise<LearnProgressRow> {
  const db = await readDb();
  const found = db.learnProgress.find(
    (row) => row.businessId === businessId && row.userId === userId,
  );
  return found ?? emptyProgress(businessId, userId);
}

export async function publicLearn(
  businessId: string,
  userId: string,
  locale: Locale,
  nicheParts: { goal?: string; typeNote?: string; name?: string },
): Promise<PublicLearn> {
  const row = await getLearnRow(businessId, userId);
  const localeKey = locale as AcademyLocale;
  const niche = detectNiche(nicheParts.goal, nicheParts.typeNote, nicheParts.name);
  const completed = row.completedLessonIds;
  const ready = Boolean(row.diagnosis);
  const focus = row.diagnosis?.focusUnitIds ?? [];
  return {
    xp: row.xp,
    streak: row.streak,
    lastLessonAt: row.lastLessonAt,
    completedLessonIds: completed,
    nextLessonId: ready ? nextLessonId(completed) : null,
    totalLessons: academyLessons().length,
    niche,
    intro: row.diagnosis?.courseLead || academyNicheIntro(niche, locale),
    needsDiagnosis: !ready,
    diagnosis: row.diagnosis
      ? {
          title: row.diagnosis.title,
          summary: row.diagnosis.summary,
          strengths: row.diagnosis.strengths,
          gaps: row.diagnosis.gaps,
          focusUnitIds: row.diagnosis.focusUnitIds,
          firstAdvice: row.diagnosis.firstAdvice,
          courseLead: row.diagnosis.courseLead,
          usedAi: row.diagnosis.usedAi,
          aiError: row.diagnosis.aiError ?? null,
        }
      : null,
    units: ACADEMY_UNITS.map((unit) => ({
      id: unit.id,
      title: unit.title[localeKey],
      lead: unit.lead[localeKey],
      recommended: focus.includes(unit.id),
      lessons: unit.lessons.map((item) => ({
        id: item.id,
        title: item.title[localeKey],
        xp: item.xp,
        done: completed.includes(item.id),
        locked: !ready || isLessonLocked(item.id, completed),
      })),
    })),
  };
}

export async function saveDiagnosis(
  businessId: string,
  userId: string,
  diagnosis: LearnDiagnosis,
): Promise<LearnProgressRow> {
  return withDb((db) => {
    let row = db.learnProgress.find((item) => item.businessId === businessId && item.userId === userId);
    if (!row) {
      row = emptyProgress(businessId, userId);
      db.learnProgress.push(row);
    }
    row.diagnosis = diagnosis;
    row.updatedAt = nowIso();
    return row;
  });
}

export async function checkLesson(
  businessId: string,
  userId: string,
  lessonId: string,
  answerIndex: number,
  locale: Locale,
): Promise<CheckLesson> {
  const lesson = findLesson(lessonId);
  if (!lesson) return { ok: false, error: "not_found" };
  if (answerIndex < 0 || answerIndex > 2) return { ok: false, error: "validation" };

  const localeKey = locale as AcademyLocale;
  const why = lesson.quiz.why[localeKey];
  const correct = answerIndex === lesson.quiz.correct;

  return withDb((db) => {
    let row = db.learnProgress.find((item) => item.businessId === businessId && item.userId === userId);
    if (!row) {
      row = emptyProgress(businessId, userId);
      db.learnProgress.push(row);
    }
    if (!row.diagnosis) {
      return { ok: false, error: "locked" };
    }
    if (isLessonLocked(lessonId, row.completedLessonIds) && !row.completedLessonIds.includes(lessonId)) {
      return { ok: false, error: "locked" };
    }
    if (!correct) {
      return {
        ok: true,
        correct: false,
        already: false,
        why,
        xp: 0,
        totalXp: row.xp,
        streak: row.streak,
        completed: false,
        nextLessonId: nextLessonId(row.completedLessonIds),
      };
    }
    const already = row.completedLessonIds.includes(lessonId);
    const now = nowIso();
    if (!already) {
      row.completedLessonIds.push(lessonId);
      row.xp += lesson.xp;
      row.streak = nextStreak(row, now);
      row.lastLessonAt = now;
      row.updatedAt = now;
    }
    return {
      ok: true,
      correct: true,
      already,
      why,
      xp: already ? 0 : lesson.xp,
      totalXp: row.xp,
      streak: row.streak,
      completed: true,
      nextLessonId: nextLessonId(row.completedLessonIds),
    };
  });
}
