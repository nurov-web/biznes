/** Клипҳои кӯтоҳ — ID-и YouTube дар messages ё ин ҷо иваз мешавад. */
export type VideoLesson = { id: string; titleKey: string; youtubeId: string | null };

export const VIDEO_LESSONS: VideoLesson[] = [
  { id: "stock", titleKey: "stock", youtubeId: null },
  { id: "crm", titleKey: "crm", youtubeId: null },
  { id: "pos", titleKey: "pos", youtubeId: null },
  { id: "plan", titleKey: "plan", youtubeId: null },
];
