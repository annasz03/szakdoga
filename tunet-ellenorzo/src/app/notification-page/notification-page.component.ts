import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { NotificationComponent } from '../notification/notification.component';
import { DataService } from '../data.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { addDoc, Firestore, getDocs, } from '@angular/fire/firestore';
import { collection, collectionData, query } from '@angular/fire/firestore';
import { FcmService } from '../services/fcm.service';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.css'
})
export class NotificationPageComponent {

  constructor(private dataService:DataService, private dialog: MatDialog){}

  openDialog(): void {
    this.dialog.open(NotificationDialog, {
      data: {},
    });
  }
}


//TODO: google naptarba
@Component({
  selector: 'notification-dialog',
  templateUrl: './notification-dialog.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class NotificationDialog {
  name:string = "";
  frequency:string = "";
  frequencies: string[] = [
    'Naponta egyszer',
    'Naponta kétszer',
    'Naponta háromszor',
    'Hetente egyszer',
    'Havonta egyszer'
  ];

  hour:string = "";
  hours: string[] = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ]

  timeDiv:number=0;
  timeArray: number[] = [];
  currentUser:any;
  times: string[] = [];

  constructor(public dialogRef: MatDialogRef<NotificationDialog>, private authService: AuthService, private firestore: Firestore, private fcmService: FcmService) {}

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onChange(){
    switch(this.frequency) {
      case 'Naponta egyszer':
        this.timeDiv=1
        break;
      case 'Naponta kétszer':
        this.timeDiv=2
        break;
      case 'Naponta háromszor':
        this.timeDiv=3
        break;
      default:
        this.timeDiv=1
        break;
    }
    this.timeArray = Array(this.timeDiv).fill(0).map((_, i) => i);
    this.times = new Array(this.timeDiv).fill("");
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  addAlert() {
    const alertCollection = collection(this.firestore, 'alerts');
    if (this.times.some(time => !time)) {
      alert('Kérjük, töltse ki az összes időpontot!');
      return;
    }

    this.fcmService.requestPermission().then((token) => {
      if (!token) {
        console.error('Nem sikerült lekérni az FCM tokent.');
        return;
      }

      const newDoc = {
        uid: this.currentUser.uid,
        frequency: this.frequency,
        times: this.times,
        name: this.name,
        createdAt: new Date().toISOString(),
        fcmToken: token,
        isActive: true
      };

      addDoc(alertCollection, newDoc).then(() => {
        console.log('Sikeresen hozzáadva az alerts kollekcióhoz.');
        this.dialogRef.close();
      }).catch((error) => {
        console.error('Hiba történt az alerts mentése közben:', error);
      });
    }).catch((error) => {
      console.error('FCM engedélykérés hiba:', error);
    });
  }

}
