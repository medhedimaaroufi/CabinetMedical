import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';// Importer l’environnement
import { User } from 'src/models/User';
import {Patient} from "../../models/Patient";
import {map} from "rxjs/operators";



@Injectable({
  providedIn: 'root'
})

export class UserService {

  private apiUrl = environment.backendUrl; // Utiliser l'URL du backend

  constructor(private http: HttpClient) {}

  getUser(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/api/auth/user?email=${localStorage.getItem('email')}`);
  }
  getPatients(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/doctor/get-patients?email=${localStorage.getItem('email')}`);
  }
  getUserById(userId: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/api/doctor/get-patient?pid=${userId}`);
  }
}
