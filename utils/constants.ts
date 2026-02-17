export const ALLOWED_POSITIONS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
  "17", "33", "65",
  "CS3", "CS4", "CS5",
  "17KV", "33KV", "65KV"
] as const;

export type AllowedPosition = typeof ALLOWED_POSITIONS[number];
