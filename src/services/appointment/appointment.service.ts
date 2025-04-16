import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Appointment} from "src/models/Appointment";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = environment.backendUrl; // Utiliser l'URL du backend

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/appointment?email=${localStorage.getItem('email')}`);
  }
}
