importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    messagingSenderId: "371815094536",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Érkezett egy háttérértesítés:', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/assets/icon.png'
  });
});
