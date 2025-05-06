import { Component, OnInit, Input } from '@angular/core';
import {IonicModule, ModalController, NavController} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Doctor {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  speciality: string | null;
}

@Component({
  selector: 'app-doctor-profile-modal',
  templateUrl: './doctor-profile-modal.component.html',
  styleUrls: ['./doctor-profile-modal.component.scss'],
  imports: [
    IonicModule,
    CommonModule
  ],
  standalone: true
})
export class DoctorProfileModalComponent implements OnInit {
  @Input() doctorId: string = '';
  doctor: Doctor | null = null;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private navController: NavController
  ) {}

  ngOnInit() {
    if (this.doctorId) {
      this.loadDoctor(this.doctorId);
    } else {
      this.error = 'No doctor ID provided';
    }
  }

  loadDoctor(id: string) {
    const url = `${environment.backendUrl}/api/search/doctors/${id}`;
    this.http.get<Doctor>(url).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.error = null;
      },
      error: (err) => {
        console.error('Error fetching doctor:', err);
        this.error = 'Failed to load doctor profile';
        this.doctor = null;
      }
    });
  }

  close() {
    this.modalController.dismiss();
  }

  async bookAppointment() {
    if (this.doctor) {
      await this.modalController.dismiss();
      await this.navController.navigateForward(`/appointments`, {
        queryParams: {doctorId: this.doctor.id}
      });
    }
  }
}
