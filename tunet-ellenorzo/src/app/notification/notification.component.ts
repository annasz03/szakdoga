import { Component, Input } from '@angular/core';
import { deleteDoc, doc, Firestore } from '@angular/fire/firestore';
import { Alerts } from '../alerts';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialog } from '../notification-page/notification-page.component';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, I18NextModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
  @Input()
  alert!: Alerts;

  constructor(private dialog: MatDialog, private firestore: Firestore, private http:HttpClient) {}

  editAlert(alert: Alerts) {
    const dialogRef = this.dialog.open(NotificationDialog, {
      width: '400px',
      data: { ...alert },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('success', result);
      }
    });
  }

  deleteAlert(alertId: string) {
    this.http.post('http://localhost:3000/api/delete-alert', { alertId })
      .subscribe({
        next: (res) => {
          console.log('Értesítés sikeresen törölve:', res);
        }
      });
  }
  

}
