import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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
  callback: (payload: {
    title: string;
    body: string;
    notificationId?: string;
    data?: Record<string, string>;
  }) => void,
) {
  const msg = await getMessagingInstance();
  if (!msg) return;

  onMessage(msg, (payload) => {
    console.log("Mensaje FCM en primer plano:", payload);
    // data-only messages: title/body vienen en payload.data, no en payload.notification
    const data = payload.data as Record<string, string> | undefined;
    callback({
      title: data?.title || payload.notification?.title || "Nueva notificación",
      body: data?.body || payload.notification?.body || "",
      notificationId: data?.notification_id,
      data,
    });
  });
}

export { app };

/** Abre el popup de Google y devuelve el ID token de Firebase para validarlo en el backend. */
export async function signInWithGoogle(): Promise<string> {
  return (await signInWithGoogleProfile()).idToken;
}

/** Igual que signInWithGoogle, pero también devuelve correo y nombre de la cuenta de Google. */
export async function signInWithGoogleProfile(): Promise<{
  idToken: string;
  email: string;
  displayName: string;
}> {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  await auth.signOut(); // la sesión real es la de Sanctum, no la de Firebase
  return {
    idToken,
    email: result.user.email ?? "",
    displayName: result.user.displayName ?? "",
  };
}
