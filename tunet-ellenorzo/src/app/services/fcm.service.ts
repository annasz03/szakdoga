import { Injectable, inject } from '@angular/core';
import { getToken, onMessage } from 'firebase/messaging';
import { Firestore } from '@angular/fire/firestore';
import { Messaging } from '@angular/fire/messaging';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private messaging = inject(Messaging);

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: 'BHOITvdfR1Rxq2avMamPKhsTfuDhqSCFm7I-oOA8OmoSWN6onoOHJ9MVEFP5kYtW_DEi1dq1mumdCXW9kiV6aSI'
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

  private showNotification(title: string, body: string, icon?: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: icon || '/assets/icons/icon-72x72.png' });
    }
  }
}
