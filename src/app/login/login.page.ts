import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonInput,
  IonSpinner,
  IonText,
  IonToolbar
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardContent,
    IonInput,
    IonSpinner, // Added IonSpinner
    IonText,
    RouterLink,
    FormsModule,
    NgIf
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  loading: boolean = false; // Track loading state

  emailError: boolean = false;
  passwordError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  login(event: Event) {
    event.preventDefault();

    // Validate input fields
    this.emailError = !this.email;
    this.passwordError = !this.password || this.password.length < 8;

    if (this.emailError || this.passwordError) {
      return;
    }

    this.loading = true; // Show spinner

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false; // Hide spinner
        // Get user role from token in cookie
        const token = this.cookieService.get('token');
        if (token) {
          try {
            const decodedToken: any = jwtDecode(token);
            const role = decodedToken?.role;

            if (role === 'doctor') {
              window.location.reload();
            } else {
              window.location.reload()
            }
          } catch (error) {
            console.error('Invalid token:', error);
          }
        } else {
          console.error('No token found');
        }
      },
      error: (error) => {
        this.loading = false; // Hide spinner
        console.error('Login failed:', error);
      }
    });
  }
}
