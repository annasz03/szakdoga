import { ApplicationConfig, isDevMode, importProvidersFrom, provideZoneChangeDetection, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient } from '@angular/common/http';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations';
//import { provideTranslateLoader } from './translate.provider';
import { BrowserModule, Title } from '@angular/platform-browser';
import { I18NextModule, I18NextTitle, ITranslationService, I18NEXT_SERVICE, defaultInterpolationFormat} from 'angular-i18next';

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

export function appInit(i18next: ITranslationService) {
  return () =>
    i18next.init({
      supportedLngs: ['en', 'hu'],
      fallbackLng: 'hu',
      debug: true,
      returnEmptyString: false,
      ns: ['translation'],
      interpolation: {
        format: I18NextModule.interpolationFormat(defaultInterpolationFormat),
      },
    });
}

export function localeIdFactory(i18next: ITranslationService) {
  return i18next.language;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideAuth(() => getAuth()),
    //provideTranslateLoader(),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),

    importProvidersFrom(BrowserModule, I18NextModule.forRoot()),
    {
      provide: APP_INITIALIZER,
      useFactory: appInit,
      deps: [I18NEXT_SERVICE],
      multi: true,
    },
    {
      provide: Title,
      useClass: I18NextTitle,
    },
    {
      provide: LOCALE_ID,
      deps: [I18NEXT_SERVICE],
      useFactory: localeIdFactory,
    },
  ],
};
