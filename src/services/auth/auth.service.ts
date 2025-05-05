import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import {Doctor} from "../../models/Doctor";

// Interfaces for type safety
interface AuthResponse {
  token: string;
  id: string;
  email: string;
  role?: string;
  message?: string;
}

interface UserRegistration {
  name: string;
  email: string;
  phone: string;
  dob: string; // YYYY-MM-DD
  password: string;
  address: string;
  role: 'patient' | 'doctor';
}

interface Patient {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly backendUrl = environment.backendUrl;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  /**
   * Register a new patient.
   * Corresponds to Utilisateur.register() and Patient-specific registration in the backend.
   *
   * @param name The patient's full name
   * @param email The patient's email address
   * @param phone The patient's phone number
   * @param dob The patient's date of birth (YYYY-MM-DD)
   * @param password The patient's password
   * @param address The patient's address
   * @returns Observable with the registration response
   */
  registerPatient(
    name: string,
    email: string,
    phone: string,
    dob: string,
    password: string,
    address: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.backendUrl}/api/auth/register`, {
        name,
        email,
        phone,
        dob,
        password,
        address,
        role: 'patient'
      })
      .pipe(
        tap((response) => {
          if (response.token && response.id && response.email) {
            this.handleAuthResponse(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Register a new doctor (pending approval by the static admin).
   * Corresponds to Utilisateur.register() and Docteur-specific registration in the backend.
   *
   * @param name The doctor's full name
   * @param email The doctor's email address
   * @param phone The doctor's phone number
   * @param dob The doctor's date of birth (YYYY-MM-DD)
   * @param password The doctor's password
   * @param address The doctor's address
   * @returns Observable with the registration response
   */
  registerDoctor(
    name: string,
    speciality: string,
    email: string,
    phone: string,
    dob: string,
    password: string,
    address: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.backendUrl}/api/auth/register`, {
        name,
        speciality,
        email,
        phone,
        dob,
        password,
        address,
        role: 'doctor'
      })
      .pipe(
        tap((response) => {
          if (response.message) {
            console.log('Registration successful:', response.message);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Log in a user (patient, doctor, or admin).
   * Corresponds to Utilisateur.authenticate() in the backend.
   *
   * @param email The user's email address
   * @param password The user's password
   * @returns Observable with the login response
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.backendUrl}/api/auth/login`, {
        email,
        password
      })
      .pipe(
        tap((response) => {
          if (response.token && response.id && response.email) {
            this.handleAuthResponse(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Log out the current user.
   * Corresponds to Utilisateur.logout() (handled client-side).
   */
  logout(): void {
    this.cookieService.delete('token', '/', undefined, true, 'Lax');
    localStorage.removeItem('id');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  }

  /**
   * Handle successful authentication responses by storing the token and user details.
   *
   * @param response The authentication response from the backend
   */
  private handleAuthResponse(response: AuthResponse): void {
    this.storeToken(response.token);
    localStorage.setItem('id', response.id);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role || '');
  }

  /**
   * Store the JWT token in a cookie.
   *
   * @param token The JWT token received from the backend
   */
  private storeToken(token: string): void {
    this.cookieService.set('token', token, {
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration
      sameSite: 'Lax'
    });
    console.log('Token stored in cookie:', token);
  }

  /**
   * Get the current JWT token from the cookie.
   *
   * @returns The JWT token or an empty string if not found
   */
  getToken(): string {
    return this.cookieService.get('token') || '';
  }

  /**
   * Log the current token from the cookie to the console for debugging.
   */
  logTokenFromCookie(): void {
    const token = this.getToken();
    if (token) {
      console.log('Token from cookie:', token);
    } else {
      console.log('No token found in cookie');
    }
  }

  /**
   * Fetch the list of patients for doctors and admins.
   *
   * @returns Observable with the list of patients
   */
  getPatients(): Observable<Patient[]> {
    return this.http
      .get<Patient[]>(`${this.backendUrl}/api/users/patients`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching patients:', error);
          return of([]); // Return empty array on error
        })
      );
  }

  /**
   * Upload a medical document.
   * Corresponds to the "Envoi des docs médicaux" use case #8.
   *
   * @param formData FormData containing the file and metadata
   * @param uploaderId
   * @returns Observable with the upload event
   */
  uploadDocument(formData: FormData): Observable<HttpEvent<any>> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });

    const req = new HttpRequest('POST', `${this.backendUrl}/api/patient/upload-doc`, formData, {
      reportProgress: true,
      responseType: 'json',
      headers: headers
    });

    return this.http.request(req);
  }

  /**
   * Handle HTTP errors and return an observable with the error.
   *
   * @param error The HTTP error response
   * @returns Observable with the error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      // Backend error with a message
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Fetch the list of doctors for admin management.
   *
   * @returns Observable with the list of doctors
   */
  getDoctors(): Observable<Doctor[]> {
    return this.http
      .get<Doctor[]>(`${this.backendUrl}/api/doctor/doctors`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching doctors:', error);
          return of([]); // Return empty array on error
        })
      );
  }

  /**
   * Update the status of a doctor (pending/approved).
   *
   * @param doctorId The ID of the doctor
   * @param status The new status ('pending' or 'approved')
   * @returns Observable with the update response
   */
  updateDoctorStatus(doctorId: string, status: 'pending' | 'approved' | 'rejected'): Observable<any> {
    return this.http
      .put(`${this.backendUrl}/api/doctor/update-status`, { doctorId, status })
      .pipe(
        catchError(this.handleError)
      );
  }
}
