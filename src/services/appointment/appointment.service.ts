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

  getPatientAppointments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/patient/appointments?email=${localStorage.getItem('email')}`);
  }

  getDoctorAppointments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/doctor/appointments?email=${localStorage.getItem('email')}`);
  }
}
