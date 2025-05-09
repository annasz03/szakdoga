import { Component, EventEmitter, inject, Input, Output, PipeTransform } from '@angular/core';
import { deleteDoc, doc, Firestore } from '@angular/fire/firestore';
import { Alerts } from '../alerts';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialog } from '../notification-page/notification-page.component';
import { CommonModule } from '@angular/common';
import { I18NextModule, I18NextService } from 'angular-i18next';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, I18NextModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent  {
  @Input()
  alert!: Alerts;
  @Output() alertDeleted = new EventEmitter<void>();

  alertService = inject(AlertService)

  constructor(private dialog: MatDialog, private i18next: I18NextService) {}

  getTranslatedFrequency(frequency: string): string {
    return this.i18next.t(`frequency.${frequency}`);
  }

  editAlert(alert: Alerts) {
    console.log(alert)
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
    this.alertService.deleteAlert(alertId).subscribe({
        next: (res) => {
          this.alertDeleted.emit()
        }
    });      
  }
  

}
