/**
 * Thèmes et niveaux des exercices corrigés. Pour ajouter un thème : l'ajouter
 * ici, puis son libellé dans exercises.themes (fr.ts et en.ts).
 */
export const EXERCISE_THEMES = ['safety', 'rop', 'eoq', 'abc', 'service'] as const;
export type ExerciseTheme = (typeof EXERCISE_THEMES)[number];

export const EXERCISE_LEVELS = ['beginner', 'certification'] as const;
export type ExerciseLevel = (typeof EXERCISE_LEVELS)[number];
