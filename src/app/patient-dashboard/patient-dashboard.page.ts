import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor/doctor.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.page.html',
  styleUrls: ['./patient-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, NgForOf, NgIf, FormsModule]
})
export class PatientDashboardPage implements OnInit {
  services: string[] = [];
  doctors: any[] = [];

  constructor(private doctorService: DoctorService) {}

  ngOnInit() {
    this.fetchDoctors();
  }

  fetchDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (response) => {
        this.doctors = response.doctors || [];
        this.services = [...new Set(this.doctors.map(doctor => doctor.speciality))];
        console.log('Doctors fetched:', this.doctors);
        console.log('Services fetched:', this.services);
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        this.doctors = [];
        this.services = [];
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
  }

  viewServiceDetails(service: string) {
    console.log('Viewing details for service:', service);
    // Optionally navigate to service details with query params
  }

  viewDoctorDetails(doctor: any) {
    console.log('Viewing details for doctor:', doctor);
    // Optionally navigate to doctor profile
  }
}
