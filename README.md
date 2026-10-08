# App de Ejercicio

Aplicación de fitness con dos modos:

- **Modo Militar**: calistenia, resistencia y disciplina. Programas predefinidos (Murph, prueba de condición física, Cindy, EMOM, Tabata), temporizadores AMRAP/EMOM/Tabata, registro rápido con checkbox y rangos de Recluta a Fuerzas Especiales.
- **Modo Gimnasio**: hipertrofia y fuerza. Creador de rutinas, biblioteca de ejercicios por grupo muscular, registro de series/reps/peso (kg o lbs), descanso automático entre series, historial de volumen y 1RM estimado.

Cada modo tiene su paleta: verde oliva/negro para militar y azul/gris oscuro para gimnasio.

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
