import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonList,
  IonAlert,
  IonIcon,
  AlertButton,
  AlertInput, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { AuthService } from 'src/services/auth/auth.service';
import {Doctor} from "../../models/Doctor";
import {NgForOf, NgIf} from "@angular/common";
import {reload} from "ionicons/icons";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonText,
    IonSpinner,
    IonList,
    IonAlert,
    NgIf,
    NgForOf,
    IonButtons,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    FormsModule
  ],
  standalone: true
})
export class AdminDashboardPage implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedStatus: string = 'all';

  // Define alert inputs (radio buttons for status selection)
  alertInputs: AlertInput[] = [
    {
      type: 'radio',
      label: 'Approved',
      value: 'approved',
      checked: false
    },
    {
      type: 'radio',
      label: 'Pending',
      value: 'pending',
      checked: false
    },
    {
      type: 'radio',
      label: 'Rejected',
      value: 'rejected',
      checked: false
    }
  ];

  // Define alert buttons (Cancel and OK)
  alertButtons: AlertButton[] = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Status update cancelled');
      }
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: (value: 'pending' | 'approved' | 'rejected') => {
        if (!value) return; // No value selected
        const doctorId = this.currentDoctor?.id; // Store the current doctor being edited
        if (doctorId) {
          this.updateStatus(doctorId, value);
        }
      }
    }
  ];

  private currentDoctor: Doctor | null = null; // Track the doctor being edited

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/signin']);
      return;
    }
    this.fetchDoctors();
  }

  fetchDoctors(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.filteredDoctors = this.doctors;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch doctors. Please try again.';
        this.loading = false;
        console.error('Fetch doctors error:', error);
      }
    });
  }

  // Called when the button is clicked to open the alert
  presentAlert(doctor: Doctor): void {
    this.currentDoctor = doctor;
    // Update alert inputs to reflect the current doctor's status
    this.alertInputs = this.alertInputs.map(input => ({
      ...input,
      checked: input.value === doctor.registrationStatus
    }));
  }

  updateStatus(doctorId: string, status: 'pending' | 'approved' | 'rejected'): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.updateDoctorStatus(doctorId, status).subscribe({
      next: () => {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (doctor) {
          doctor.registrationStatus = status; // Update local state
          this.successMessage = `Status for ${doctor.name} updated to ${status}.`;
        }
        this.loading = false;
        this.currentDoctor = null; // Clear current doctor
      },
      error: (error) => {
        this.errorMessage = 'Failed to update status. Please try again.';
        this.loading = false;
        this.currentDoctor = null;
        console.error('Update status error:', error);
      }
    })
    this.ngOnInit();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }

  filterDoctors() {
    if (this.selectedStatus === 'all') {
      this.filteredDoctors = this.doctors;
    } else {
      this.filteredDoctors = this.doctors.filter(doctor => doctor.registrationStatus === this.selectedStatus);
    }
  }
}
