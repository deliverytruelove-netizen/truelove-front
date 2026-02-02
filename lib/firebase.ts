import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase solo si no existe
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging: Messaging | null = null;

// Inicializar messaging solo en el navegador y si es soportado
async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (messaging) return messaging;

  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Messaging no es soportado en este navegador");
    return null;
  }

  messaging = getMessaging(app);
  return messaging;
}

export async function requestFCMToken(): Promise<string | null> {
  try {
    const msg = await getMessagingInstance();
    if (!msg) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permiso de notificaciones denegado");
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("VAPID key no configurada");
      return null;
    }

    const token = await getToken(msg, { vapidKey });
    return token;
  } catch (error) {
    console.error("Error obteniendo token FCM:", error);
    return null;
  }
}

export async function onForegroundMessage(
  callback: (payload: { title: string; body: string }) => void,
) {
  const msg = await getMessagingInstance();
  if (!msg) return;

  onMessage(msg, (payload) => {
    console.log("Mensaje FCM en primer plano:", payload);
    callback({
      title: payload.notification?.title || "Nueva notificación",
      body: payload.notification?.body || "",
    });
  });
}

export { app };
