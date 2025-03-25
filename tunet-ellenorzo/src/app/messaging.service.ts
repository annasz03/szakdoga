import { Injectable } from '@angular/core';
import { getMessaging, onMessage, getToken, Messaging, MessagePayload } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { FirebaseApp } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage = new BehaviorSubject<MessagePayload | null>(null);

  private messaging: Messaging;

  constructor(private firebaseApp: FirebaseApp) {
    this.messaging = getMessaging(firebaseApp);
  }

  /*requestPermission() {
    getToken(this.messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY' })
      .then((token) => {
        if (token) {
          console.log('Token:', token);
        } else {
          console.log('Nem sikerült lekérni a tokent.');
        }
      })
      .catch((err) => console.log('Token lekérése sikertelen', err));
  }

  receiveMessage() {
    onMessage(this.messaging, (payload: MessagePayload) => {
      console.log('Értesítés érkezett:', payload);
      this.currentMessage.next(payload);
    });
  }*/
}
