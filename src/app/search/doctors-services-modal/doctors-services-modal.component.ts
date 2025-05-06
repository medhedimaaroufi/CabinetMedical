import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ModalController, ModalOptions } from '@ionic/angular';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { DoctorFilterModalComponent } from '../doctor-filter-modal/doctor-filter-modal.component';
import { DoctorProfileModalComponent } from '../doctor-profile-modal/doctor-profile-modal.component';

interface Doctor {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  speciality: string | null;
}

@Component({
  selector: 'app-doctors-services-modal',
  templateUrl: './doctors-services-modal.component.html',
  styleUrls: ['./doctors-services-modal.component.scss'],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  standalone: true
})
export class DoctorsServicesModalComponent implements OnInit {
  @Input() specialty: string = '';
  searchTerm: string = '';
  doctors: Doctor[] = [];
  specialties: string[] = [];
  filteredDoctors: Doctor[] = [];
  doctorSpecialtyControl = new FormControl('');

  constructor(private http: HttpClient, private modalController: ModalController) {}

  ngOnInit() {
    if (this.specialty) {
      this.loadDoctors(this.specialty);
      this.doctorSpecialtyControl.setValue(this.specialty);
    }
    this.doctorSpecialtyControl.valueChanges.subscribe(() => this.filterDoctors());
  }

  async loadDoctors(specialty: string) {
    const url = `${environment.apiUrl}/search/${encodeURIComponent(specialty)}`;
    this.http.get<Doctor[]>(url).subscribe({
      next: (doctors) => {
        console.log('API Response:', doctors);
        this.doctors = doctors.map(doctor => ({
          ...doctor,
          id: typeof doctor.id === 'string' && /^\d+$/.test(doctor.id) ? parseInt(doctor.id) : doctor.id
        }));
        this.filteredDoctors = [...this.doctors];
        this.specialties = [...new Set(
          this.doctors
            .filter(doctor => doctor.speciality !== null)
            .map(doctor => doctor.speciality!)
        )];
        this.filterDoctors();
      },
      error: (error) => {
        console.error(`Error fetching doctors for specialty ${specialty}:`, error);
        this.filteredDoctors = [];
        this.specialties = [];
      }
    });
  }

  async openFilterModal() {
    const modalOptions = {
      component: DoctorFilterModalComponent,
      componentProps: {
        doctors: this.doctors,
        currentNameFilter: this.searchTerm,
        currentAddressFilter: ''
      }
    } as ModalOptions;

    const modal = await this.modalController.create(modalOptions);

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const { nameFilter, addressFilter } = result.data;
        this.searchTerm = nameFilter;
        this.filterDoctors(nameFilter, addressFilter);
      }
    });

    await modal.present();
  }

  async selectDoctor(doctor: Doctor) {
    console.log('Doctor ID:', doctor.id, 'Type:', typeof doctor.id);
    const modalOptions = {
      component: DoctorProfileModalComponent,
      componentProps: {
        doctorId: doctor.id.toString()
      }
    } as ModalOptions;

    const modal = await this.modalController.create(modalOptions);
    await modal.present();
  }

  filterDoctors(nameFilter: string = this.searchTerm, addressFilter: string = '') {
    const nameTerm = nameFilter.toLowerCase();
    const addressTerm = addressFilter.toLowerCase();
    const specialty = this.doctorSpecialtyControl.value || this.specialty;

    this.filteredDoctors = this.doctors.filter(doctor =>
      (doctor.name.toLowerCase().includes(nameTerm) ||
        doctor.email.toLowerCase().includes(nameTerm)) &&
      (!addressTerm || doctor.address.toLowerCase().includes(addressTerm)) &&
      (!specialty || doctor.speciality === specialty)
    );
  }

  async close() {
    await this.modalController.dismiss();
  }
}
