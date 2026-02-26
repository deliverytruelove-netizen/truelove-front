/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js",
);

// La config se inyecta por query params al registrar el SW, o se hardcodea aqui
// Usamos self.__FIREBASE_CONFIG si se setea, o valores por defecto
const firebaseConfig = {
  apiKey: "AIzaSyBlvOELcZamVEgrb535qYZkZtZvjz9MfS0",
  projectId: "notifacacion",
  messagingSenderId: "718991696253",
  appId: "1:718991696253:web:b53106792ed4f2a582ec14",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// URL del API - se recibe del cliente principal via postMessage
let API_URL = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SET_API_URL") {
    API_URL = event.data.apiUrl;
    console.log("[SW] API_URL configurada:", API_URL);
  }
});

// Reportar estado de notificacion al backend
function reportNotificationStatus(notificationId, status) {
  if (!notificationId) return;

  // Usar API_URL si fue seteada, o intentar inferirla
  const baseUrl = API_URL || self.location.origin + "/api";

  fetch(baseUrl + "/notifications/update-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notification_id: notificationId, status: status }),
  }).catch((err) => {
    console.warn("[SW] Error reportando notificacion:", err);
  });
}

// Manejar mensajes en segundo plano (cuando la pestana no esta activa)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Mensaje en segundo plano:", payload);

  const data = payload.data || {};

  // Reportar received_at al backend
  reportNotificationStatus(data.notification_id, "received");

  // data-only messages: title/body vienen en payload.data
  const title = data.title || payload.notification?.title || "Nuevo Pedido";
  const options = {
    body: data.body || payload.notification?.body || "Tienes un nuevo pedido por revisar",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    sound: "/sounds/nuevo_pedido.wav",
    vibrate: [200, 100, 200, 100, 200],
    tag: "pedido-" + Date.now(),
    requireInteraction: true,
    data: data,
  };

  self.registration.showNotification(title, options);
});

// Manejar click en la notificacion -> reportar opened_at
self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data || {};

  // Reportar opened_at al backend
  reportNotificationStatus(data.notification_id, "opened");

  event.notification.close();
  // Abrir la pagina de pedidos activos
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una pestana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes("/socio/admin") && "focus" in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva
        return clients.openWindow("/socio/admin/pedidos-activos");
      }),
  );
});
