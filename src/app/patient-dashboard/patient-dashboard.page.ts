import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/services/auth/auth.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {environment} from "../../environments/environment";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.page.html',
  styleUrls: ['./patient-dashboard.page.scss'],
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
    IonSelect,
    IonSelectOption,
    FormsModule,
    IonButton,
    IonButtons,
    IonText,
    IonBackButton,
    IonSpinner,
    NgIf,
    NgForOf
  ],
  standalone: true
})
export class PatientDashboardPage implements OnInit {
  selectedFile: File | null = null;
  description: string = '';
  patientId: string = ''; // For doctors/admins to select a patient
  patients: { id: string; name: string }[] = []; // List of patients for selection
  uploadProgress: number = 0;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  userRole: string = localStorage.getItem('role') || '';
  userId: string = localStorage.getItem('id') || '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/signin']);
      return;
    }

    // Set patientId based on role
    if (this.userRole === 'patient') {
      this.patientId = this.userId; // Patients upload for themselves
    } else if (this.userRole === 'doctor' || this.userRole === 'admin') {
      this.fetchPatients(); // Fetch patient list for doctors/admins
    }
  }

  fetchPatients(): void {
    this.http
      .get<{ id: string; name: string }[]>(`${environment.backendUrl}/api/users/patients`)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to fetch patients. Please try again later.';
          console.error('Fetch patients error:', error);
          return of([]); // Return empty array on error
        })
      )
      .subscribe((response) => {
        this.patients = response;
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Please upload a PDF, JPEG, or PNG file.';
        this.selectedFile = null;
        return;
      }
      if (file.size > maxSize) {
        this.errorMessage = 'File size must not exceed 10MB.';
        this.selectedFile = null;
        return;
      }

      this.errorMessage = '';
      this.selectedFile = file;
    }
  }

  uploadDocument(event: SubmitEvent): void {
    event.preventDefault(); // Prevent default form submission
    if (!this.selectedFile || !this.description.trim() || (this.userRole !== 'patient' && !this.patientId)) {
      this.errorMessage = 'Please select a file, provide a description, and select a patient (if applicable).';
      return;
    }

    this.loading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('description', this.description);
    formData.append('patient_id', this.patientId); // Use patientId or userId for patients
    formData.append('uploader_id', this.userId);
    formData.append('role', this.userRole);

    this.authService.uploadDocument(formData).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
        } else if (event.type === HttpEventType.Response) {
          this.loading = false;
          this.successMessage = 'Document uploaded successfully!';
          this.selectedFile = null;
          this.description = '';
          this.patientId = this.userRole === 'patient' ? this.userId : '';
          this.uploadProgress = 0;
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Upload failed. Please try again.';
        console.error('Upload error:', error);
      }
    });
  }

  resetForm(): void {
    this.selectedFile = null;
    this.description = '';
    this.patientId = this.userRole === 'patient' ? this.userId : '';
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
