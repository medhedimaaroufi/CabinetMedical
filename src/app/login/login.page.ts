import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonInput,
  IonText,
  IonToolbar
} from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonContent,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonInput,
    IonText,
    RouterLink,
    FormsModule,
    NgIf
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';

  emailError: boolean = false;
  passwordError: boolean = false;

  constructor(private authService: AuthService, private router: Router, private cookieService: CookieService) {}

  login(event: Event) {
    event.preventDefault();

    // Validate input fields
    this.emailError = !this.email;
    this.passwordError = !this.password || this.password.length < 8;

    if (this.emailError || this.passwordError) {
      return;
    }

    this.authService.login(this.email, this.password).subscribe(
      () => {
        // Get user role from token in cookie
        const token = this.cookieService.get('token'); // Assuming backend sets this cookie
        if (token) {
          try {
            const decodedToken: any = jwtDecode(token); // Decode token
            const role = decodedToken?.role; // Extract role

            if (role === 'doctor') {
              this.router.navigate(['/']);
            } else {
              this.router.navigate(['/']);
            }
          } catch (error) {
            console.error('Invalid token:', error);
          }
        } else {
          console.error('No token found');
        }
      },
      (error) => {
        console.error('Login failed:', error);
      }
    );
  }
}
