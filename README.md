# App de Ejercicio

Aplicación de fitness con dos modos:

- **Modo Militar**: calistenia, resistencia y disciplina. Programas predefinidos (Murph, prueba de condición física, Cindy, EMOM, Tabata), temporizadores AMRAP/EMOM/Tabata, registro rápido con checkbox y rangos de Recluta a Fuerzas Especiales.
- **Modo Gimnasio**: hipertrofia y fuerza. Creador de rutinas, biblioteca de ejercicios por grupo muscular, registro de series/reps/peso (kg o lbs), descanso automático entre series, historial de volumen y 1RM estimado.

Cada modo tiene su paleta: verde oliva/negro para militar y azul/gris oscuro para gimnasio.

## Catálogo de ejercicios

876 ejercicios de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público), con nombres traducidos al español, búsqueda en español o inglés y filtros por grupo muscular, equipo y tipo. Cada ejercicio muestra una animación que alterna la foto de la posición inicial y la final, músculos trabajados e instrucciones (en inglés).

- Las fotos se cargan desde GitHub la primera vez y quedan en caché en el dispositivo.
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
npx expo-doctor
```
