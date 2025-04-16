import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonDatetime, IonHeader, IonInput, IonItem, IonLabel, IonModal, IonText, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import {DatePipe, NgIf} from "@angular/common";
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/services/auth/auth.service';

@Component({
  selector: 'app-signup-doctor',
  templateUrl: './signup-doctor.page.html',
  styleUrls: ['./signup-doctor.page.scss'],
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
    RouterLink,
    IonBackButton,
    NgIf
  ]
})
export class SignupDoctorPage {
  name: string = '';
  email: string = '';
  phone: string = '';
  dob: string = '';
  password: string = '';
  address: string = '';

  showDateModal: boolean = false;

  // Validation error messages
  nameError: boolean = false;
  emailError: boolean = false;
  phoneError: boolean = false;
  dobError: boolean = false;
  passwordError: boolean = false;
  addressError: boolean = false;

  constructor(private authService: AuthService, private cookieService: CookieService, private router: Router) {}

  openDateModal() {
    this.showDateModal = true;
  }

  closeDateModal() {
    this.showDateModal = false;
  }

  validateForm(): boolean {
    this.nameError = this.name.trim() === '';
    this.emailError = this.email.trim() === '';
    this.phoneError = this.phone.trim() === '';
    this.dobError = this.dob.trim() === '';
    this.passwordError = this.password.length < 8;
    this.addressError = this.address.trim() === '';

    return !(this.nameError || this.emailError || this.phoneError || this.dobError || this.passwordError || this.addressError);
  }

  signup(event: Event) {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.authService.registerDoctor(this.name, this.email, this.phone, this.dob.slice(0, 10), this.password, this.address)
      .subscribe(
        (response: any) => {
          console.log('Signup Success:', response);
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Signup Error:', error);
        }
      );
  }
}
