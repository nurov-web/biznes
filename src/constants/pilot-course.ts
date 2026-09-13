export type PilotQuestion = {
  q: string;
  options: [string, string, string];
};

export type PilotModule = {
  id: number;
  titleKey: "m1t" | "m2t" | "m3t" | "m4t" | "m5t" | "m6t";
  descKey: "m1d" | "m2d" | "m3d" | "m4d" | "m5d" | "m6d";
  contentKey: "m1c" | "m2c" | "m3c" | "m4c" | "m5c" | "m6c";
  /** Ҳамин дарс барои анкетаи соҳибкор — маҳсулот, минтақа, нарх. */
  applyKey: "m1a" | "m2a" | "m3a" | "m4a" | "m5a" | "m6a";
  questions: [PilotQuestion, PilotQuestion];
};

/** Матни дарсҳо аз messages.pilotCourse гирифта мешавад. Танҳо id ва калидҳо. */
export const PILOT_MODULES: PilotModule[] = [
  {
    id: 1,
    titleKey: "m1t",
    descKey: "m1d",
    contentKey: "m1c",
    applyKey: "m1a",
    questions: [
      { q: "q1a", options: ["q1a1", "q1a2", "q1a3"] },
      { q: "q1b", options: ["q1b1", "q1b2", "q1b3"] },
    ],
  },
  {
    id: 2,
    titleKey: "m2t",
    descKey: "m2d",
    contentKey: "m2c",
    applyKey: "m2a",
    questions: [
      { q: "q2a", options: ["q2a1", "q2a2", "q2a3"] },
      { q: "q2b", options: ["q2b1", "q2b2", "q2b3"] },
    ],
  },
  {
    id: 3,
    titleKey: "m3t",
    descKey: "m3d",
    contentKey: "m3c",
    applyKey: "m3a",
    questions: [
      { q: "q3a", options: ["q3a1", "q3a2", "q3a3"] },
      { q: "q3b", options: ["q3b1", "q3b2", "q3b3"] },
    ],
  },
  {
    id: 4,
    titleKey: "m4t",
    descKey: "m4d",
    contentKey: "m4c",
    applyKey: "m4a",
    questions: [
      { q: "q4a", options: ["q4a1", "q4a2", "q4a3"] },
      { q: "q4b", options: ["q4b1", "q4b2", "q4b3"] },
    ],
  },
  {
    id: 5,
    titleKey: "m5t",
    descKey: "m5d",
    contentKey: "m5c",
    applyKey: "m5a",
    questions: [
      { q: "q5a", options: ["q5a1", "q5a2", "q5a3"] },
      { q: "q5b", options: ["q5b1", "q5b2", "q5b3"] },
    ],
  },
  {
    id: 6,
    titleKey: "m6t",
    descKey: "m6d",
    contentKey: "m6c",
    applyKey: "m6a",
    questions: [
      { q: "q6a", options: ["q6a1", "q6a2", "q6a3"] },
      { q: "q6b", options: ["q6b1", "q6b2", "q6b3"] },
    ],
  },
];
