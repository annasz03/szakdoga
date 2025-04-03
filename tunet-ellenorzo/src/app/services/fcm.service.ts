import { Injectable, isDevMode } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Messaging, getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';

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


@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private messaging: Messaging;
  private firebaseApp: FirebaseApp;
  currentUser:any;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.firebaseApp = initializeApp(firebaseConfig);
    this.messaging = getMessaging(this.firebaseApp);
    
  }

  // 1. Engedély kérése és token lekérése
  async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: firebaseConfig.vapidKey
        });
        console.log('FCM token:', token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Permission error:', error);
      return null;
    }
  }

  listenToMessages() {
    return onMessage(this.messaging, (payload) => {
      console.log('Message received:', payload);
      this.showNotification(
        payload.notification?.title || 'Új értesítés',
        payload.notification?.body || '',
        payload.notification?.icon
      );
    });
  }

  // 4. Értesítés megjelenítése
  private showNotification(title: string, body: string, icon?: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: icon || '/assets/icons/icon-72x72.png' });
    }
  }
}