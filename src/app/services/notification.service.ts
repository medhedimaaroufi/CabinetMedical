import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) {}

  // Fetch notifications (optional filter by ID)
  getNotifications(id?: string): Observable<any> {
    const url = id ? `${environment.backendUrl}/api/notifications?id=${id}` :
      `${environment.backendUrl}/api/notifications`;
    return this.http.get(url);
  }

  // Add a new notification
  addNotification(data: any): Observable<any> {
    return this.http.post(environment.backendUrl, data);
  }
}
