import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

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
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DoctorProfileModalComponent {
  @Input() doctor!: Doctor;

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }
}
