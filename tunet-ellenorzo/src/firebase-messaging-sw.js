importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyD5JSxkcZOBFie5bfWu1wM7vwMW-c9WzYU",
    authDomain: "tunet-ellenorzo-f8999.firebaseapp.com",
    projectId: "tunet-ellenorzo-f8999",
    storageBucket: "tunet-ellenorzo-f8999.firebasestorage.app",
    messagingSenderId: "371815094536",
    appId: "1:371815094536:web:c25c0e6a29b08715d234bd",
    measurementId: "G-XQ1DQ23QDG"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Érkezett egy háttérértesítés:', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/assets/icon.png'
  });
});
