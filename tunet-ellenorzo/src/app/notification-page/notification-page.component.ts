import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { NotificationComponent } from '../notification/notification.component';
import { DataService } from '../data.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { addDoc, doc, Firestore, getDocs, updateDoc, } from '@angular/fire/firestore';
import { collection, collectionData, query } from '@angular/fire/firestore';
import { FcmService } from '../services/fcm.service';
import { Alerts } from '../alerts';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { I18NextModule } from 'angular-i18next';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [CommonModule, NotificationComponent,MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.css'
})
export class NotificationPageComponent {

  constructor(private dialog: MatDialog, private firestore: Firestore, private authService: AuthService, private http:HttpClient) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.getAlerts();
    });
    
  }

  alerts: Alerts[] = [];
  currentUser: any;

  openDialog(): void {
    this.dialog.open(NotificationDialog, {});
  }

  getAlerts() {
    this.http.post<{ alerts: any[] }>('http://localhost:3000/get-alerts', { uid: this.currentUser!.uid })
      .subscribe({
        next: (res) => {
          console.log(res)
          this.alerts = res.alerts;
        }
      });
  }
  
}


//TODO: google naptarba
@Component({
  selector: 'notification-dialog',
  templateUrl: './notification-dialog.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule,I18NextModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule],
    styleUrl: './notification-page.component.css'
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
    @Inject(MAT_DIALOG_DATA) public data: any, private http:HttpClient
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


      this.http.post<{ alert: any }>('http://localhost:3000/save-alert', newDoc)
        .subscribe({
          next: (res) => {
            this.dialogRef.close(res.alert);
          }
        });
    });
  }
  
}
