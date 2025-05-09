import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const backendUrl = 'http://localhost:3000/api/';

export interface SavedAlert {
  id: string;
  uid: string;
  name: string;
  frequency: string;
  times: string[];
  createdAt: string;
  fcmToken: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private http: HttpClient) {}

  getAlerts(uid: string) {
    return this.http.post<{ alerts: SavedAlert[] }>( backendUrl + 'get-alerts', { uid });
  }

  deleteAlert(alertId: string) {
    return this.http.post(backendUrl + 'delete-alert', { alertId });
  }

  saveAlert(payload: Partial<SavedAlert> & { uid: string }) {
    return this.http.post<{ alert: SavedAlert }>(backendUrl + 'save-alert', payload);
  }
}
