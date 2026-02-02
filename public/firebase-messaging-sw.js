/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js",
);

// La config se inyecta por query params al registrar el SW, o se hardcodea aquí
// Usamos self.__FIREBASE_CONFIG si se setea, o valores por defecto
const firebaseConfig = {
  apiKey: "AIzaSyBlvOELcZamVEgrb535qYZkZtZvjz9MfS0",
  projectId: "notifacacion",
  messagingSenderId: "718991696253",
  appId: "1:718991696253:web:b53106792ed4f2a582ec14",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Manejar mensajes en segundo plano (cuando la pestaña no está activa)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Mensaje en segundo plano:", payload);

  const title = payload.notification?.title || "Nuevo Pedido";
  const options = {
    body: payload.notification?.body || "Tienes un nuevo pedido por revisar",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    sound: "/sounds/nuevo_pedido.wav",
    vibrate: [200, 100, 200, 100, 200],
    tag: "pedido-" + Date.now(),
    requireInteraction: true,
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});

// Manejar click en la notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Abrir la página de pedidos activos
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una pestaña abierta, enfocarla
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
