import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MedicalFileService {

  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  getMedicalFile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/patient/medicalFile?email=${localStorage.getItem('email')}`,{
      responseType: 'blob' as 'json' // Use 'blob' but cast as 'json' to satisfy TypeScript
    }) as Observable<Blob>;
  }
}
