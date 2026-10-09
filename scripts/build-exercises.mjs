/**
 * Genera src/data/exercises.json a partir de free-exercise-db (dominio
 * público, https://github.com/yuhonas/free-exercise-db) y de las
 * traducciones de scripts/exercise-names-es.json.
 *
 * Uso:
 *   node scripts/build-exercises.mjs                 # descarga el commit fijado
 *   node scripts/build-exercises.mjs ruta/exercises.json
 *
 * Para actualizar la base: cambia SOURCE_COMMIT (y IMAGE_BASE_URL en
 * src/data/exercises.ts), vuelve a ejecutar y traduce los nombres nuevos.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_COMMIT = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5';
const SOURCE_URL = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${SOURCE_COMMIT}/dist/exercises.json`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Músculo de la base -> grupo muscular de la app. */
const MUSCLE_TO_GROUP = {
  chest: 'Pecho',
  lats: 'Espalda',
  'middle back': 'Espalda',
  'lower back': 'Espalda',
  traps: 'Espalda',
  quadriceps: 'Piernas',
  hamstrings: 'Piernas',
  glutes: 'Piernas',
  calves: 'Piernas',
  adductors: 'Piernas',
  abductors: 'Piernas',
  shoulders: 'Hombros',
  neck: 'Cuello',
  biceps: 'Brazos',
  triceps: 'Brazos',
  forearms: 'Brazos',
  abdominals: 'Core',
};

/**
 * Modo de la app al que pertenece cada ejercicio (excluyente):
 * - militar: calistenia con peso corporal, saltos, carrera y estiramientos sin equipo;
 * - gimnasio: todo lo que usa material de gimnasio (barras, mancuernas, poleas,
 *   máquinas, kettlebells, bandas, balones, strongman...).
 */
const MILITARY_EQUIPMENT = new Set(['body only', 'none']);

/** Equipo "other" que en realidad es calistenia (barra, paralelas, anillas, TRX, cajón...). */
const MILITARY_OTHER = new Set([
  'Band Assisted Pull-Up',
  'Mixed Grip Chin',
  'One Arm Chin-Up',
  'Gironda Sternum Chins',
  'Side To Side Chins',
  'Rocky Pull-Ups/Pulldowns',
  'Knee/Hip Raise On Parallel Bars',
  'One Handed Hang',
  'Dips - Chest Version',
  'Ring Dips',
  'Parallel Bar Dip',
  'Muscle Up',
  'Kipping Muscle Up',
  'Rope Climb',
  'Suspended Fallout',
  'Suspended Reverse Crunch',
  'Suspended Push-Up',
  'Suspended Row',
  'Suspended Split Squat',
  'Inverted Row with Straps',
  'Bodyweight Mid Row',
  'Drop Push',
  'Single-Leg High Box Squat',
  'Rope Jumping',
  'Skating',
  'Bicycling',
]);

/** Pliometría con equipo "other" que sí es de gimnasio. */
const GYM_OTHER_PLYOMETRICS = new Set(['Heavy Bag Thrust', 'Sledgehammer Swings']);

function exerciseMode(e) {
  if (MILITARY_EQUIPMENT.has(e.equipment ?? 'none')) return 'military';
  if (e.equipment !== 'other') return 'gym';
  if (MILITARY_OTHER.has(e.name)) return 'military';
  if (e.category === 'stretching') return 'military';
  if (e.category === 'plyometrics' && !GYM_OTHER_PLYOMETRICS.has(e.name)) return 'military';
  return 'gym';
}

/**
 * Correcciones de músculos de la base original, que tiene algunos ejercicios
 * asignados a un músculo que no corresponde con el movimiento.
 */
const MUSCLE_OVERRIDES = {
  // Aducción de cadera: trabaja los aductores, no el cuádriceps.
  'Cable Hip Adduction': { primaryMuscles: ['adductors'], secondaryMuscles: [] },
  // Elevación lateral de pierna (abducción): abductores y glúteo medio.
  'Side Leg Raises': { primaryMuscles: ['abductors'], secondaryMuscles: ['glutes'] },
};

async function loadSource() {
  const localPath = process.argv[2];
  if (localPath) return JSON.parse(await readFile(localPath, 'utf8'));
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`No se pudo descargar ${SOURCE_URL}: ${res.status}`);
  return res.json();
}

const source = await loadSource();
/**
 * Instrucciones en español: scripts/exercise-instructions-es/*.json, cada uno
 * un objeto { id: [pasos] }. Si falta un ejercicio se deja en inglés y se avisa.
 */
async function loadInstructionsEs() {
  const dir = join(root, 'scripts', 'exercise-instructions-es');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  const all = {};
  for (const file of files) Object.assign(all, JSON.parse(await readFile(join(dir, file), 'utf8')));
  return all;
}
const instructionsEs = await loadInstructionsEs();

const names = JSON.parse(
  await readFile(join(root, 'scripts', 'exercise-names-es.json'), 'utf8'),
);

const missing = source.filter((e) => !names[e.name]).map((e) => e.name);
if (missing.length > 0) {
  console.error(`Faltan ${missing.length} traducciones:\n${missing.join('\n')}`);
  process.exit(1);
}

const exercises = source.map((original) => {
  const e = { ...original, ...MUSCLE_OVERRIDES[original.name] };
  const group = MUSCLE_TO_GROUP[e.primaryMuscles[0]];
  if (!group) throw new Error(`Músculo sin grupo: ${e.primaryMuscles[0]} (${e.id})`);
  return {
    id: e.id,
    name: names[e.name],
    nameEn: e.name,
    mode: exerciseMode(e),
    muscleGroup: group,
    primaryMuscles: e.primaryMuscles,
    secondaryMuscles: e.secondaryMuscles,
    equipment: e.equipment ?? 'none',
    category: e.category,
    level: e.level,
    force: e.force ?? null,
    mechanic: e.mechanic ?? null,
    instructions: instructionsEs[e.id] ?? e.instructions,
    images: e.images,
  };
});

exercises.sort((a, b) => a.name.localeCompare(b.name, 'es'));

await writeFile(join(root, 'src', 'data', 'exercises.json'), JSON.stringify(exercises));
const untranslated = source.filter((e) => e.instructions.length > 0 && !instructionsEs[e.id]);
const mismatched = source.filter(
  (e) => instructionsEs[e.id] && instructionsEs[e.id].length !== e.instructions.length,
);
if (untranslated.length > 0) {
  console.warn(`Aviso: ${untranslated.length} ejercicios siguen con instrucciones en inglés.`);
}
if (mismatched.length > 0) {
  console.warn(`Aviso: número de pasos distinto al original en: ${mismatched.map((e) => e.id).join(', ')}`);
}
console.log(`OK: ${exercises.length} ejercicios -> src/data/exercises.json`);
