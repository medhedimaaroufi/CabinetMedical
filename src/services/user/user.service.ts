import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';// Importer l’environnement
import { User } from 'src/models/User';



@Injectable({
  providedIn: 'root'
})

export class UserService {

  private apiUrl = environment.BACKENDURL; // Utiliser l'URL du backend

  constructor(private http: HttpClient) {}

  getUser(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/api/user?email=${localStorage.getItem('email')}`);
  }
}
