export interface EmotionOption {
  label: string;
  positive: boolean;
}

export const MENTAL_STATES: EmotionOption[] = [
  { label: "Ясний розум", positive: true },
  { label: "Креативний", positive: true },
  { label: "Зосереджений", positive: true },
  { label: "В потоці", positive: true },
  { label: "Продуктивний", positive: true },
  { label: "Прокрастинація", positive: false },
  { label: "Нудьга", positive: false },
  { label: "Відволікання", positive: false },
  { label: "Туман в голові", positive: false },
];

export const EMOTIONAL_STATES: EmotionOption[] = [
  { label: "Радісний", positive: true },
  { label: "Вдячний", positive: true },
  { label: "Натхненний", positive: true },
  { label: "Впевнений", positive: true },
  { label: "Задоволений", positive: true },
  { label: "Захоплений", positive: true },
  { label: "Оптимістичний", positive: true },
  { label: "Роздратований", positive: false },
  { label: "Сумний", positive: false },
  { label: "Самотній", positive: false },
  { label: "Злий", positive: false },
  { label: "Винуватий", positive: false },
  { label: "Невпевнений", positive: false },
];

export const PHYSICAL_STATES: EmotionOption[] = [
  { label: "Спокійний", positive: true },
  { label: "Розслаблений", positive: true },
  { label: "Енергійний", positive: true },
  { label: "Тривожний", positive: false },
  { label: "Втомлений", positive: false },
  { label: "Перевантажений", positive: false },
  { label: "Вигорання", positive: false },
];

export const ALL_EMOTIONS: EmotionOption[] = [
  ...MENTAL_STATES,
  ...EMOTIONAL_STATES,
  ...PHYSICAL_STATES,
];

export const EMOTION_POLARITY: Record<string, boolean> = Object.fromEntries(
  ALL_EMOTIONS.map((e) => [e.label, e.positive]),
);
