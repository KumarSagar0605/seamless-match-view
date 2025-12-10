export const Phase = {
  PRE_MATCH: "PRE_MATCH",
  FIRST_HALF: "FIRST_HALF",
  HALF_TIME: "HALF_TIME",
  SECOND_HALF: "SECOND_HALF",
  ENDED: "ENDED",
} as const;

export type PhaseType = (typeof Phase)[keyof typeof Phase];

export const HALF_PLAY_SECONDS = 90; // 3 minutes per half
export const HALVES = 2;
export const HALF_TIME_BREAK_SECONDS = 90; // 1:30 half-time
export const TIMEOUT_ALLOWED_SECONDS = 30;
export const TIMEOUT_TECHNICAL_THRESHOLD = 45; // Technical point awarded
export const TIMEOUT_DQ_THRESHOLD = 90; // 1:30 = disqualification
