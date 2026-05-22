export const MOCK_USER = {
  name: 'Melissa',
  initials: 'MD',
  coach: { name: 'Alex Bennani', initials: 'AB', experience: '6 ans', verified: true },
  weight: 68.5,
  weightStart: 72.0,
  weightDelta: -3.5,
  weeklyDelta: -0.6,
  streak: 6,
  goal: 'Perte de poids',
  kcalTarget: 1800,
  kcalDone: 1240,
  macros: {
    protein: { done: 92, target: 130 },
    carbs: { done: 128, target: 180 },
    fat: { done: 38, target: 55 },
  },
};

export const MOCK_SESSION = {
  id: 's04',
  name: 'Upper Body — Push',
  program: '4 WEEK FAT LOSS PLAN',
  week: 'S04',
  day: 'J11',
  exercises: 8,
  duration: 45,
  coach: 'Coach Alex',
  sets: 3,
  repsPerSet: 3,
};

export const MOCK_EXERCISES = [
  { id: '0', name: 'Échauffement vélo', detail: '5 min · zone 2', done: true, type: 'cardio' },
  { id: '1', name: 'Développé couché', detail: '3×10 · 60-80kg · Coach Alex', done: false, type: 'strength' },
  { id: '2', name: 'Développé incliné haltères', detail: '3×10 · 22kg', done: false, type: 'strength' },
  { id: '3', name: 'Élévations latérales', detail: '3×12 · 8kg', done: false, type: 'strength' },
  { id: '4', name: 'Dips', detail: '3×max', done: false, type: 'strength' },
  { id: '5', name: 'Triceps poulie haute', detail: '3×15 · 20kg', done: false, type: 'strength' },
  { id: '6', name: 'Curl marteau', detail: '3×12 · 14kg', done: false, type: 'strength' },
  { id: '7', name: 'Gainage', detail: '3×45s', done: false, type: 'core' },
];

export const MOCK_SETS = [
  { set: 1, weight: 60, reps: 10, rpe: 7, done: true },
  { set: 2, weight: 60, reps: 10, rpe: 8, done: true },
  { set: 3, weight: 60, reps: null, rpe: null, done: false },
];

export const MOCK_MEALS = [
  {
    id: 'm1',
    name: 'Petit-déjeuner',
    time: '8h',
    detail: 'Flocons, banane, amandes',
    kcal: 420,
    protein: 18, carbs: 52, fat: 10,
    icon: '🌅',
  },
  {
    id: 'm2',
    name: 'Déjeuner',
    time: '12h30',
    detail: 'Poulet riz brun broccoli',
    kcal: 560,
    protein: 42, carbs: 55, fat: 12,
    icon: '🍽️',
  },
  {
    id: 'm3',
    name: 'Collation',
    time: '16h',
    detail: 'Yaourt grec + myrtilles',
    kcal: 180,
    protein: 18, carbs: 18, fat: 4,
    icon: '🥕',
  },
  {
    id: 'm4',
    name: 'Dîner',
    time: '19h30',
    detail: 'Saumon patate douce épinards',
    kcal: 540,
    protein: 38, carbs: 42, fat: 22,
    icon: '🌙',
  },
];

export const MOCK_WEIGHT_HISTORY = [72.0, 71.2, 70.5, 69.8, 69.1, 68.5];
export const MOCK_WEIGHT_LABELS = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06'];

export const MOCK_CALENDAR: Record<string, { label: string; color: string }[]> = {
  '2026-05-11': [{ label: 'Upper · Push', color: '#3A6FE8' }],
  '2026-05-12': [{ label: 'Cardio HIIT', color: '#34C759' }],
  '2026-05-13': [{ label: 'Lower', color: '#FF9500' }],
  '2026-05-14': [{ label: 'Mobilité', color: '#5856D6' }],
  '2026-05-15': [{ label: 'Upper · Push', color: '#3A6FE8' }],
  '2026-05-18': [{ label: 'Upper · Push', color: '#3A6FE8' }],
  '2026-05-19': [{ label: 'Cardio HIIT', color: '#34C759' }],
  '2026-05-20': [{ label: 'Lower', color: '#FF9500' }],
  '2026-05-21': [{ label: 'Mobilité', color: '#5856D6' }],
  '2026-05-22': [{ label: 'Upper · Push', color: '#3A6FE8' }],
  '2026-05-25': [{ label: 'Upper · Push', color: '#3A6FE8' }],
  '2026-05-26': [{ label: 'Cardio HIIT', color: '#34C759' }],
  '2026-05-27': [{ label: 'Lower', color: '#FF9500' }],
};

export const MOCK_CHAT = [
  { id: '1', from: 'coach', text: "Salut Melissa ! Comment tu te sens après la séance d'hier ?", time: '07:24', day: 'HIER' },
  { id: '2', from: 'user', text: 'Plutôt bien 💪 Un peu de courbatures aux épaules mais ça va.', time: '07:35', day: 'HIER' },
  { id: '3', from: 'coach', text: "Normal après les élévations 😅 N'oublie pas les étirements ce soir.", time: '07:53', day: 'HIER' },
  { id: '4', from: 'coach', text: "J'ai vu ton check-in de la semaine, super progrès sur le poids ! Continue exactement comme ça pour la S05.", time: '09:18', day: "AUJOURD'HUI" },
  { id: '5', from: 'user', text: 'Merci coach 🙏 Question rapide : je peux remplacer le riz brun par du quinoa ?', time: '09:14', day: "AUJOURD'HUI" },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1', group: "AUJOURD'HUI", icon: 'chatbubble', color: '#3A6FE8',
    title: "Alex t'a envoyé un message", body: 'Super progrès sur le poids ! Continue comme ça pour la S05.', time: 'il y a 12 min', unread: true,
  },
  {
    id: 'n2', group: "AUJOURD'HUI", icon: 'trophy', color: '#FF9500',
    title: 'Palier atteint · 6 séances', body: "Tu as complété 6 séances en 2 semaines. Bravo 🏆", time: 'il y a 2h', unread: true,
  },
  {
    id: 'n3', group: 'HIER', icon: 'notifications', color: '#8E8E93',
    title: 'Bilan hebdo dans 2 jours', body: 'Pèse-toi et prends 3 photos dimanche matin.', time: 'HIER 18:00', unread: false,
  },
  {
    id: 'n4', group: 'HIER', icon: 'ellipse', color: '#34C759',
    title: 'Nouveau programme · S05', body: 'Alex a publié la semaine 5. Mêmes séances avec +5% intensité.', time: 'HIER 09:30', unread: false,
  },
  {
    id: 'n5', group: 'CETTE SEMAINE', icon: 'alert-circle', color: '#FF9500',
    title: "Calories sous l'objectif", body: "Tu étais à 1200 kcal en moyenne (objectif 1 800).", time: 'MARDI', unread: false,
  },
];
