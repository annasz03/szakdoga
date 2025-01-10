import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { NotificationComponent } from '../notification/notification.component';
import { DataService } from '../data.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

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
  frequency:string = "";
  frequencies: string[] = [
    'Naponta egyszer',
    'Naponta kétszer',
    'Naponta háromszor',
    'Hetente egyszer',
    'Havonta egyszer'
  ];

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

  constructor(public dialogRef: MatDialogRef<NotificationDialog>) {}

  onChange(){
    
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
