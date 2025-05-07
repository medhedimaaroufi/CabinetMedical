import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Appointment {
  _id: string;
  calendarSlotId: number;
  dateTime: string;
  doctor_id: string;
  id: number;
  patient_id: string;
  status: string;
}

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class AppointmentsPage implements OnInit {
  appointments: Appointment[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private navController: NavController
  ) {}

  ngOnInit() {
    const email = localStorage.getItem('email');
    if (!email) {
      this.errorMessage = 'Please log in to view appointments';
      return;
    }
    this.loadAppointments(email);
  }

  loadAppointments(email: string) {
    this.isLoading = true;
    this.errorMessage = '';
    const url = `${environment.backendUrl}/api/doctor/appointments?email=${encodeURIComponent(email)}`;
    this.http.get<{ appointments: Appointment[] }>(url).subscribe({
      next: (response) => {
        this.appointments = response.appointments;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching appointments:', err);
        this.errorMessage = err.status === 404 ? 'Doctor not found' : 'Failed to load appointments';
        this.appointments = [];
        this.isLoading = false;
      }
    });
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

  trackById(index: number, appointment: Appointment): string {
    return appointment._id;
  }
}
