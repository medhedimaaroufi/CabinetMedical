import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../../services/doctor/doctor.service';

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
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class DoctorProfileModalComponent implements OnInit {
  @Input() doctorId: string = '';
  doctor: Doctor | null = null;
  error: string | null = null;

  constructor(
    private doctorService: DoctorService,
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
    this.doctorService.getDoctorById(id).subscribe({
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

  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
  }

  async close() {
    await this.modalController.dismiss();
  }

  async bookAppointment() {
    if (this.doctor) {
      await this.modalController.dismiss();
      await this.navController.navigateForward('/appointments', {
        queryParams: { doctorId: this.doctor.id }
      });
    }
  }
}
