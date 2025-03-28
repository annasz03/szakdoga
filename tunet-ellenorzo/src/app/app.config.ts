import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideServiceWorker } from '@angular/service-worker';


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

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideDatabase(() => getDatabase()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};

