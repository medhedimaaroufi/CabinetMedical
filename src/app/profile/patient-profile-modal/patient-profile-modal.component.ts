import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/services/user/user.service';
import {Patient} from "../../../models/Patient";
import {environment} from "../../../environments/environment";

interface patient {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  speciality: string | null;
}

@Component({
  selector: 'app-patient-profile-modal',
  templateUrl: './patient-profile-modal.component.html',
  styleUrls: ['./patient-profile-modal.component.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class PatientProfileModalComponent implements OnInit {
  @Input() UserId: string = '';
  patient: Patient | null = null;
  error: string | null = null;

  constructor(
    private patientService: UserService,
    private modalController: ModalController,
    private navController: NavController
  ) {}

  ngOnInit() {
    console.log('UserId:', this.UserId);
    if (this.UserId) {
      this.loadpatient(this.UserId);
    } else {
      this.error = 'No patient ID provided';
    }
  }

  loadpatient(id: string) {
    console.log('Loading patient with ID:', id);
    this.patientService.getUserById(id).subscribe(data => {
      console.log('Raw API response:', data);
      this.patient = data as Patient || [];
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
  }

  async close() {
    await this.modalController.dismiss();
  }

  async bookAppointment() {
    if (this.patient) {
      await this.modalController.dismiss();
      await this.navController.navigateForward('/appointments', {
        queryParams: { patientId: this.patient._id }
      });
    }
  }

  protected readonly parent = parent;
  protected readonly environment = environment;
}
