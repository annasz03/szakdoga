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

  async requestPermission(): Promise<string | null> {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(this.messaging, {
        vapidKey: 'BHOITvdfR1Rxq2avMamPKhsTfuDhqSCFm7I-oOA8OmoSWN6onoOHJ9MVEFP5kYtW_DEi1dq1mumdCXW9kiV6aSI'
      });
      return token;
    }
    return null;
  }
}
