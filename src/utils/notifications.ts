import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

/**
 * Avisos locales para los temporizadores. Con la app en pantalla ya vibra el
 * propio temporizador; las notificaciones cubren el caso de móvil bloqueado
 * o app en segundo plano. No existen en web.
 */

export type NotificationKey = 'rest' | 'workout-timer' | 'free-timer';

export interface ScheduledAlert {
  /** Segundos desde ahora. */
  inSec: number;
  title: string;
  body: string;
}

const CHANNEL_ID = 'timers';
const supported = Platform.OS !== 'web';
const scheduled = new Map<NotificationKey, string[]>();
/** Evita que una cancelación llegue antes que la programación anterior. */
const queues = new Map<NotificationKey, Promise<void>>();
let permission: Promise<boolean> | null = null;

export function setupNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      const background = AppState.currentState !== 'active';
      return {
        shouldShowBanner: background,
        shouldShowList: background,
        shouldPlaySound: background,
        shouldSetBadge: false,
      };
    },
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Temporizadores',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 400, 200, 400],
    }).catch(() => {});
  }
}

function ensurePermission(): Promise<boolean> {
  permission ??= Notifications.requestPermissionsAsync()
    .then((res) => res.granted || res.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL)
    .catch(() => false);
  return permission;
}

function enqueue(key: NotificationKey, task: () => Promise<void>) {
  const next = (queues.get(key) ?? Promise.resolve()).then(task).catch(() => {});
  queues.set(key, next);
}

async function cancelNow(key: NotificationKey) {
  const ids = scheduled.get(key) ?? [];
  scheduled.delete(key);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

/** Sustituye los avisos programados bajo `key` por los nuevos. */
export function scheduleAlerts(key: NotificationKey, alerts: ScheduledAlert[]) {
  if (!supported) return;
  enqueue(key, async () => {
    await cancelNow(key);
    const future = alerts.filter((a) => a.inSec >= 1);
    if (future.length === 0 || !(await ensurePermission())) return;
    const ids = await Promise.all(
      future.map((alert) =>
        Notifications.scheduleNotificationAsync({
          content: { title: alert.title, body: alert.body },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.round(alert.inSec),
            channelId: CHANNEL_ID,
          },
        }),
      ),
    );
    scheduled.set(key, ids);
  });
}

export function cancelAlerts(key: NotificationKey) {
  if (!supported) return;
  enqueue(key, () => cancelNow(key));
}
