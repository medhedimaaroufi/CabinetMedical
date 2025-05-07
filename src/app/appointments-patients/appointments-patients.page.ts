import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Appointment {
  _id: string;
  calendarSlotId: string;
  dateTime: string;
  doctor_id: string;
  id: number;
  patient_id: string;
  status: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  speciality: string;
}

@Component({
  selector: 'app-appointments-patients',
  templateUrl: './appointments-patients.page.html',
  styleUrls: ['./appointments-patients.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
  standalone: true
})
export class AppointmentsPatientsPage implements OnInit {
  appointments: Appointment[] = [];
  services: string[] = [];
  doctors: Doctor[] = [];
  selectedService: string | null = null;
  selectedDoctorId: string | null = null;
  appointmentDate: string | null = null;
  appointmentTime: string | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private navController: NavController
  ) {}

  ngOnInit() {
    const email = localStorage.getItem('email');
    if (!email) {
      this.errorMessage = 'Please log in to book or view appointments';
      return;
    }
    this.loadServices();
    this.loadAppointments(email);
  }

  loadServices() {
    this.isLoading = true;
    this.http.get<{ services: string[] }>(`${environment.backendUrl}/api/search/services`).subscribe({
      next: (response) => {
        this.services = response.services;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        this.errorMessage = 'Failed to load services';
        this.isLoading = false;
      }
    });
  }

  onServiceChange(event: any) {
    this.selectedService = event.detail.value;
    this.selectedDoctorId = null;
    this.doctors = [];
    if (this.selectedService) {
      this.loadDoctors(this.selectedService);
    }
  }

  loadDoctors(speciality: string) {
    this.isLoading = true;
    const url = `${environment.backendUrl}/api/search/${encodeURIComponent(speciality)}`;
    this.http.get<Doctor[]>(url).subscribe({
      next: (response) => {
        this.doctors = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        this.errorMessage = 'Failed to load doctors';
        this.isLoading = false;
      }
    });
  }

  loadAppointments(email: string) {
    this.isLoading = true;
    this.errorMessage = '';
    const url = `${environment.backendUrl}/api/patient/appointments?email=${encodeURIComponent(email)}`;
    this.http.get<{ appointments: Appointment[] }>(url).subscribe({
      next: (response) => {
        this.appointments = response.appointments;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching appointments:', err);
        this.errorMessage = err.status === 401 ? 'No appointments found' : 'Failed to load appointments';
        this.appointments = [];
        this.isLoading = false;
      }
    });
  }

  bookAppointment() {
    const email = localStorage.getItem('email');
    if (!email || !this.selectedService || !this.selectedDoctorId || !this.appointmentDate || !this.appointmentTime) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    const dateTime = new Date(`${this.appointmentDate}T${this.appointmentTime}:00`);
    const isoDateTime = dateTime.toISOString();
    const gmtDateTime = dateTime.toUTCString();

    const appointmentData = {
      doctor: { id: this.selectedDoctorId },
      date: isoDateTime,
      email
    };

    this.isLoading = true;
    this.errorMessage = '';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post<{ message: string, appointment_id: string }>(
      `${environment.backendUrl}/api/patient/schedule-appointment`,
      appointmentData,
      { headers }
    ).subscribe({
      next: (response) => {
        const newAppointment: Appointment = {
          _id: response.appointment_id,
          calendarSlotId: '1',
          dateTime: gmtDateTime,
          doctor_id: this.selectedDoctorId!,
          id: this.appointments.length + 1,
          patient_id: email,
          status: 'scheduled'
        };
        this.appointments.push(newAppointment);
        this.resetForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error booking appointment:', err);
        this.errorMessage = err.error?.message || 'Failed to book appointment';
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.selectedService = null;
    this.selectedDoctorId = null;
    this.appointmentDate = null;
    this.appointmentTime = null;
    this.doctors = [];
    this.errorMessage = '';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getDoctorName(doctorId: string): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown';
  }

  trackById(index: number, appointment: Appointment): string {
    return appointment._id;
  }
}
