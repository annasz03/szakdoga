/*import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyD5JSxkcZOBFie5bfWu1wM7vwMW-c9WzYU",
  authDomain: "tunet-ellenorzo-f8999.firebaseapp.com",
  projectId: "tunet-ellenorzo-f8999",
  storageBucket: "tunet-ellenorzo-f8999.firebasestorage.app",
  messagingSenderId: "371815094536",
  appId: "1:371815094536:web:c25c0e6a29b08715d234bd",
  measurementId: "G-XQ1DQ23QDG",
  vapidKey: "BHOITvdfR1Rxq2avMamPKhsTfuDhqSCFm7I-oOA8OmoSWN6onoOHJ9MVEFP5kYtW_DEi1dq1mumdCXW9kiV6aSI"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

navigator.serviceWorker.getRegistration(
    "./ngsw-worker.js"
).then(
    (registration) => {
        getToken(messaging, 
            {
                vapidKey: "BHOITvdfR1Rxq2avMamPKhsTfuDhqSCFm7I-oOA8OmoSWN6onoOHJ9MVEFP5kYtW_DEi1dq1mumdCXW9kiV6aSI",
                serviceWorkerRegistration: registration
            }
        ).then(
        (currentToken) => {
            if (currentToken) {
                console.log(currentToken);
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        })
        .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
        });

    }
);

*/