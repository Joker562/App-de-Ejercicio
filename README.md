# App de Ejercicio

Aplicación de fitness con dos modos:

- **Modo Militar**: calistenia, resistencia y disciplina. Programas predefinidos (Murph, prueba de condición física, Cindy, EMOM, Tabata...), temporizadores AMRAP/EMOM/Tabata con avisos de voz, registro de reps y tiempos por serie, y rangos de Recluta a Fuerzas Especiales.
  - Rangos por puntos: cada programa da puntos según su dificultad (prorrateados por lo completado) y los programas se desbloquean al subir de rango.
  - Prueba física con nota sobre 300 según edad y sexo (estimación basada en las tablas históricas de la APFT, no oficial).
  - Mejores marcas por programa (rondas en AMRAP, tiempo en Murph, nota en la prueba física).
  - Rutinas militares personalizadas con los ejercicios de calistenia del catálogo.
  - Progresiones de calistenia (flexiones, dominadas, fondos, piernas, core) que se marcan solas al registrar el objetivo.
- **Modo Gimnasio**: hipertrofia y fuerza. Creador de rutinas, biblioteca de ejercicios por grupo muscular, registro de series/reps/peso (kg o lbs), descanso automático entre series, historial de volumen y 1RM estimado. Durante la sesión:
  - "La última vez": el peso se rellena con la sesión anterior y se muestra la serie previa; si completaste todo, sugiere subir el peso (doble progresión).
  - Tipos de serie (calentamiento, dropset, al fallo), RPE y notas por ejercicio.
  - Superseries (el descanso llega tras el último ejercicio del grupo), añadir, quitar y reordenar ejercicios.
  - Calentamiento automático y calculadora de discos por lado.
  - Descanso por defecto y descanso automático configurables en Perfil.

Cada modo tiene su paleta: verde oliva/negro para militar y azul/gris oscuro para gimnasio.

**Progreso e historial** (ambos modos):
- Mapa de calor de actividad de las últimas 15 semanas; tocar un día muestra sus sesiones.
- Detalle de cada sesión y gráfico por ejercicio (1RM estimado y peso máximo, o repeticiones máximas).
- Récords personales detectados al guardar cada sesión (peso, 1RM, reps, rondas, tiempo, nota), con aviso de voz.
- Series semanales por grupo muscular, con el rango orientativo de 10-20 series en gimnasio.
- Peso corporal, % de grasa y medidas con su evolución (Perfil > Peso y medidas).

## Catálogo de ejercicios

876 ejercicios de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público), con nombres traducidos al español, búsqueda en español o inglés y filtros por grupo muscular, equipo y tipo. Están separados por modo: 256 de calistenia militar (peso corporal, barra y paralelas, saltos, estiramientos) y 620 de gimnasio (barras, mancuernas, poleas, máquinas, kettlebells...). El reparto se decide en `scripts/build-exercises.mjs`. Cada ejercicio muestra una animación que alterna la foto de la posición inicial y la final, músculos trabajados e instrucciones (en inglés).

- Las fotos se cargan desde GitHub la primera vez y quedan en caché en el dispositivo.
- **Rutinas precreadas** (`src/data/routineTemplates.ts`): 10 programas de gimnasio (Full Body, PPL, Torso/Pierna, 5×5, split por grupo, glúteos, mancuernas, kettlebell, máquinas y core). Se pueden empezar al momento o guardar en Mis rutinas, de una en una o el programa completo.
- **Programas militares** (`src/data/data.ts`): 10 programas de calistenia; sus movimientos enlazan con la animación del catálogo.
- Para regenerar `src/data/exercises.json` (por ejemplo, tras actualizar la base o corregir una traducción en `scripts/exercise-names-es.json`):

```bash
node scripts/build-exercises.mjs
```

## Stack

- Expo SDK 57 + React Native + TypeScript
- React Navigation (bottom tabs + native stack)
- Zustand con persistencia en AsyncStorage (offline-first)
- react-native-svg para los gráficos

## Requisitos

- Node.js 22 LTS (React Native 0.86 requiere Node >= 20.19.4)
- App Expo Go en el móvil, o un emulador Android / simulador iOS

## Arranque

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go o pulsa `a` para abrir el emulador Android.

### En PC (navegador)

```bash
npx expo start --web
```

Abre http://localhost:8081. En Windows PowerShell, si aparece el error "la ejecución de scripts está deshabilitada", usa `npx.cmd` en lugar de `npx`.

En web los diálogos de confirmación usan los del navegador y la vibración de los temporizadores no está disponible.

## Estructura

```
src/
├── components/   Componentes reutilizables (ModeSelector, SetRow, IntervalTimer, RestTimer...)
├── data/         Datos de prueba: programas militares, ejercicios, rutinas y rangos
├── navigation/   AppNavigator (tabs), DashboardStack y tipos de rutas
├── screens/      Pantallas generales y subcarpetas military/ y gym/
├── store/        Stores de Zustand (modo y ajustes, entrenamiento activo, historial, rutinas)
├── theme/        Paletas por modo y hook useTheme
├── types/        Tipos del dominio
└── utils/        Formato, estadísticas, 1RM, lógica de intervalos y reloj
```

## Comprobaciones

```bash
npx tsc --noEmit
npm run lint
npx expo-doctor
```
