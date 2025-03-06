import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonDatetime, IonHeader, IonInput, IonItem, IonLabel, IonModal, IonText, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import {DatePipe, NgIf} from "@angular/common";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup-patient',
  templateUrl: './signup-patient.page.html',
  styleUrls: ['./signup-patient.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    FormsModule,
    IonDatetime,
    IonButton,
    IonModal,
    IonButtons,
    IonText,
    DatePipe,
    IonBackButton,
    RouterLink,
    NgIf
  ],
  standalone: true  // Added standalone: true for Ionic v7+ compatibility
})
export class SignupPatientPage {
  name: string = '';
  email: string = '';
  phone: string = '';
  dob: string = '';  // Stored as ISO string (YYYY-MM-DD)
  password: string = '';
  address: string = '';  // Added to match Utilisateur class

  showDateModal: boolean = false;

  // Validation error messages
  nameError: boolean = false;
  emailError: boolean = false;
  phoneError: boolean = false;
  dobError: boolean = false;
  passwordError: boolean = false;
  addressError: boolean = false;  // Added for address

  constructor(private authService: AuthService, private router: Router) {}

  openDateModal() {
    this.showDateModal = true;
  }

  closeDateModal() {
    this.showDateModal = false;
  }

  validateForm(): boolean {
    this.nameError = this.name.trim() === '';
    this.emailError = this.email.trim() === '' || !this.isValidEmail(this.email);
    this.phoneError = this.phone.trim() === '' || !this.isValidPhone(this.phone);
    this.dobError = this.dob.trim() === '' || !this.isValidDate(this.dob);
    this.passwordError = this.password.length < 8;
    this.addressError = this.address.trim() === '';

    return !(this.nameError || this.emailError || this.phoneError || this.dobError || this.passwordError || this.addressError);
  }

  // Validation helpers
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;  // Simple phone number validation (e.g., +1234567890 or 123-456-7890)
    return phoneRegex.test(phone);
  }

  private isValidDate(dob: string): boolean {
    const date = new Date(dob);
    return !isNaN(date.getTime()) && date <= new Date();  // Ensure date is valid and not in the future
  }

  signup(event: Event) {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.authService.registerPatient(this.name, this.email, this.phone, this.dob.slice(0, 10), this.password, this.address)
      .subscribe(
        (response: any) => {
          console.log('Signup Success:', response);
          this.authService.logTokenFromCookie();
          this.router.navigate(['/']);  // Navigate to home or dashboard
        },
        (error: any) => {
          console.error('Signup Error:', error);
          // Handle specific backend errors (e.g., email already exists)
          if (error.error?.message) {
            if (error.error.message.includes('Email already exists')) {
              this.emailError = true;
            }
          }
        }
      );
  }
}
