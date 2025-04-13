import { Component, Input } from '@angular/core';
import { deleteDoc, doc, Firestore } from '@angular/fire/firestore';
import { Alerts } from '../alerts';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialog } from '../notification-page/notification-page.component';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
  @Input()
  alert!: Alerts;

  constructor(private dialog: MatDialog, private firestore: Firestore) {}

  editAlert(alert: Alerts) {
    const dialogRef = this.dialog.open(NotificationDialog, {
      width: '400px',
      data: { ...alert }, // Teljes objektumot átadjuk
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Sikeresen módosítottuk az alertet:', result);
      }
    });
  }

  async deleteAlert(alertId: string) {
    if (!confirm('Biztosan törölni szeretnéd ezt az értesítést?')) {
      return;
    }

    try {
      const alertRef = doc(this.firestore, 'alerts', alertId);
      await deleteDoc(alertRef);
      console.log('Értesítés sikeresen törölve:', alertId);
    } catch (error) {
      console.error('Hiba történt a törlés közben:', error);
    }
  }

}
