import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ModalOptions } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorProfileModalComponent } from '../doctor-profile-modal/doctor-profile-modal.component';

interface Doctor {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  speciality: string | null;
}

@Component({
  selector: 'app-doctor-filter-modal',
  templateUrl: './doctor-filter-modal.component.html',
  styleUrls: ['./doctor-filter-modal.component.scss'],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    DoctorProfileModalComponent
  ],
  standalone: true
})
export class DoctorFilterModalComponent {
  @Input() doctors: Doctor[] = [];
  @Input() currentNameFilter: string = '';
  @Input() currentAddressFilter: string = '';

  nameFilter: string = '';
  addressFilter: string = '';
  filteredDoctors: Doctor[] = [];
  specialityFilter: string = '';

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.nameFilter = this.currentNameFilter;
    this.addressFilter = this.currentAddressFilter;
    this.filterDoctors();
  }

  filterDoctors() {
    const nameTerm = this.nameFilter.toLowerCase();
    const addressTerm = this.addressFilter.toLowerCase();
    const specialty = this.specialityFilter.toLowerCase();

    console.log('Name Filter:', nameTerm, 'Address Filter:', addressTerm, 'Specialty Filter:', specialty);

    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesName =
        !nameTerm ||
        doctor.name.toLowerCase().includes(nameTerm) ||
        doctor.email.toLowerCase().includes(nameTerm);

      const matchesAddress =
        !addressTerm || doctor.address.toLowerCase().includes(addressTerm);

      const matchesSpecialty =
        !specialty || doctor.speciality?.toLowerCase().includes(specialty);

      return matchesName && matchesAddress && matchesSpecialty;
    });
  }

  onNameFilterChange() {
    this.filterDoctors();
  }

  onAddressFilterChange() {
    this.filterDoctors();
  }

  onSpecialityFilterChange() {
    this.filterDoctors();
  }

  async openModalProfile(doctor: Doctor) {
    const modalOptions = {
      component: DoctorProfileModalComponent,
      componentProps: {
        doctor: doctor
      }
    } as ModalOptions;

    const modal = await this.modalController.create(modalOptions);
    await modal.present();
  }

  selectDoctor(doctor: Doctor) {
    console.log('Selected Doctor:', doctor);
    this.openModalProfile(doctor);
  }

  applyFilters() {
    this.modalController.dismiss({
      nameFilter: this.nameFilter,
      addressFilter: this.addressFilter
    });
  }

  cancel() {
    this.modalController.dismiss();
  }
}
