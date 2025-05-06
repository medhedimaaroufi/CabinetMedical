import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.backendUrl}/api/search`;

  constructor(private http: HttpClient) {}

  getDoctors(): Observable<{ doctors: any[]; services: string[] }> {
    return this.http.get<{ doctors: any[]; services: string[] }>(this.apiUrl);
  }

  getDoctorById(doctorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctors/${doctorId}`);
  }
}
