import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { NotificationComponent } from '../notification/notification.component';
import { DataService } from '../data.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { addDoc, doc, Firestore, getDocs, updateDoc, } from '@angular/fire/firestore';
import { collection, collectionData, query } from '@angular/fire/firestore';
import { FcmService } from '../services/fcm.service';
import { Alerts } from '../alerts';
//import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [CommonModule, NotificationComponent,/* AlertComponent*/],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.css'
})
export class NotificationPageComponent {

  constructor(private dialog: MatDialog, private firestore: Firestore, private authService: AuthService) {
    this.getAlerts();
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  alerts: Alerts[] = [];
  currentUser: any;

  openDialog(): void {
    this.dialog.open(NotificationDialog, {});
  }

  getAlerts() {
    const alertCollection = collection(this.firestore, 'alerts');
    const alertsQuery = query(alertCollection);

    getDocs(alertsQuery).then((querySnapshot) => {
      const currentUserUid = this.currentUser?.uid;
      this.alerts = querySnapshot.docs
        .filter(doc => doc.data()['uid'] === currentUserUid)
        .map(doc => {
          const data = doc.data();
          return {
            uid: data['uid'],
            id: doc.id,
            createdAt: data['createdAt'],
            fcmToken: data['fcmToken'],
            frequency: data['frequency'],
            isActive: data['isActive'],
            name: data['name'],
            times: data['times']
          };
        });
    })
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
  name: string = "";
  frequency: string = "";
  frequencies: string[] = [
    'Naponta egyszer',
    'Naponta kétszer',
    'Naponta háromszor',
    'Hetente egyszer',
    'Havonta egyszer'
  ];

  hour: string = "";
  hours: string[] = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00',
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00'
  ];

  timeDiv: number = 0;
  timeArray: number[] = [];
  currentUser: any;
  id: string | null = null;
  buttonTitle = "Hozzáadás";
  times: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<NotificationDialog>,
    private authService: AuthService,
    private firestore: Firestore,
    private fcmService: FcmService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    if (this.data) {
      this.id = this.data.id || null;
      this.name = this.data.name;
      this.frequency = this.data.frequency;
      this.times = this.data.times || [];
      this.buttonTitle = "Módosítás";

      
      this.timeDiv = this.times.length || 1;
      this.timeArray = Array(this.timeDiv).fill(0).map((_, i) => i);
    }
  }

  onChange() {
    switch (this.frequency) {
      case 'Naponta egyszer':
        this.timeDiv = 1;
        break;
      case 'Naponta kétszer':
        this.timeDiv = 2;
        break;
      case 'Naponta háromszor':
        this.timeDiv = 3;
        break;
      default:
        this.timeDiv = 1;
        break;
    }

    this.timeArray = Array(this.timeDiv).fill(0).map((_, i) => i);
    this.times = new Array(this.timeDiv).fill("");
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveAlert() {
    if (this.times.some(time => !time)) {
      alert('Kérjük, töltse ki az összes időpontot!');
      return;
    }

    this.fcmService.requestPermission().then((token) => {
      if (!token) {
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

      if (this.id) {
        const alertRef = doc(this.firestore, 'alerts', this.id);
        updateDoc(alertRef, newDoc).then(() => {
          this.dialogRef.close(newDoc);
        })
      } else {
        const alertCollection = collection(this.firestore, 'alerts');
        addDoc(alertCollection, newDoc).then(() => {
          this.dialogRef.close(newDoc);
        })
      }
    })
  }
}
