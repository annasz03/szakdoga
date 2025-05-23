import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
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
import { AlertService } from '../alert.service';
import { LangService } from '../lang-service.service';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [CommonModule,I18NextModule, NotificationComponent,MatFormFieldModule,MatInputModule,MatSelectModule,MatOptionModule,MatDialogModule],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.css'
})
export class NotificationPageComponent {
  alertService = inject(AlertService)

  alerts: Alerts[] = [];
  currentUser: any;

  lang:any;

  constructor(private dialog: MatDialog, private authService: AuthService, private langService:LangService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.getAlerts();
    });
    this.langService.currentLang$.subscribe((lang) => {
      this.lang=lang
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(NotificationDialog, {});
  
    dialogRef.afterClosed().subscribe(result => {
      this.getAlerts();
    });
  }

  getAlerts() {
    this.alertService.getAlerts(this.currentUser!.uid).subscribe({
        next: (res) => {
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
  imports: [CommonModule,I18NextModule, FormsModule, MatFormFieldModule,I18NextModule, MatInputModule, MatSelectModule, MatOptionModule, MatDialogModule],
  styleUrl: './notification-page.component.css'
})
export class NotificationDialog {
  name: string = "";
  frequency: string = "";
  frequencies = [
    { key: 'onceADay', value: 'once' },
    { key: 'twiceADay', value: 'twice' },
    { key: 'threeTimesADay', value: 'three' },
    { key: 'onceAWeek', value: 'weekly' },
    { key: 'onceAMonth', value: 'monthly' }
  ];
  

  hour: string = "";
  hours: string[] = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00','20:00', '21:00', '22:00', '23:00'];

  timeDiv: number = 0;
  timeArray: number[] = [];
  currentUser: any;
  id: string | null = null;
  buttonTitle = "Hozzáadás";
  times: string[] = [];

  lang:any;

  alertService= inject(AlertService)
  langService= inject(LangService)

  constructor(public dialogRef: MatDialogRef<NotificationDialog>, private authService: AuthService, private fcmService: FcmService, @Inject(MAT_DIALOG_DATA) public data?: any) {
    this.langService.currentLang$.subscribe((lang) => {
      this.lang=lang
    });
   }

  ngOnInit() {
    this.authService.user$.subscribe(u => this.currentUser = u);
    if (this.data && this.data.frequency) {
      const match = this.frequencies.find(f => f.key === this.data.frequency);
      this.frequency = match ? match.value : 'once';
      this.name = this.data.name;
      this.times = Array.isArray(this.data.times) ? [...this.data.times] : [''];
      this.timeDiv = this.times.length;
      this.timeArray = Array(this.timeDiv).fill(0).map((_, i) => i);
      this.id = this.data.id;
      this.buttonTitle = this.lang === 'hu' ? 'Hozzáadás' : 'Add';
    } else {
      this.frequency = 'once';
      this.times = [''];
      this.timeDiv = 1;
      this.timeArray = [0];
      this.buttonTitle = this.lang === 'hu' ? 'Hozzáadás' : 'Add';

    }
  }

  onChange() {
    switch (this.frequency) {
      case 'once':
        this.timeDiv = 1;
        break;
      case 'twice':
        this.timeDiv = 2;
        break;
      case 'three':
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
      if(this.lang==='hu'){
        alert('Kérjük, töltse ki az összes időpontot!');
      }else{
        alert('Please, fill at options!');
      }
      return;
    }

    const frequencyMap: Record<string, string> = {
      once:    'onceADay',
      twice:   'twiceADay',
      three:   'threeTimesADay',
      weekly:  'onceAWeek',
      monthly: 'onceAMonth'
    };

    const mappedFrequency = frequencyMap[this.frequency] || 'onceADay';

    this.fcmService.requestPermission().then(token => {
      if (!token) return;

      const newDoc = {
        uid:        this.currentUser.uid,
        frequency:  mappedFrequency,
        times:      this.times,
        name:       this.name,
        createdAt:  new Date().toISOString(),
        fcmToken:   token,
        isActive:   true,
      };

      this.alertService.saveAlert(newDoc)
        .subscribe({
          next: ({ alert }) => {
            this.dialogRef.close(alert);
          }
        });
    });
  }
  
  
}
