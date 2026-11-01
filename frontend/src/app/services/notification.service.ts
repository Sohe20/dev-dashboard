import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/notifications`;

  list() {
    return this.http.get<AppNotification[]>(this.url);
  }

  markRead(id: number) {
    return this.http.put(`${this.url}/${id}/read`, {});
  }

  markAllRead() {
    return this.http.put(`${this.url}/read-all`, {});
  }
}