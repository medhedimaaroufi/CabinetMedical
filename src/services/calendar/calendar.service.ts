import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = environment.backendUrl;
  constructor(private http: HttpClient) {}

  updateAvailability(daysOff: string[]): Observable<any> {
    const email = localStorage.getItem('email');
    return this.http.post(`${this.apiUrl}/api/doctor/update-availability`, {
      email,
      daysOff
    });
  }

  getAvailability(): Observable<{ daysOff: string[] }> {
    const email = localStorage.getItem('email');
    return this.http.get<{ daysOff: string[] }>(
      `${this.apiUrl}/api/doctor/get-availability?email=${email}`
    );
  }
}
