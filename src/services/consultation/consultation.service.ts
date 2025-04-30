import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  private apiUrl = environment.backendUrl; // Utiliser l'URL du backend

  constructor(private http: HttpClient) {}

  getConsultations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/patient/view-medical-history?email=${localStorage.getItem('email')}`);
  }
}
