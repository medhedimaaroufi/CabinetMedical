import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-doctor-filter-modal',
  templateUrl: './doctor-filter-modal.component.html',
  styleUrls: ['./doctor-filter-modal.component.scss'],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
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

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.nameFilter = this.currentNameFilter;
    this.addressFilter = this.currentAddressFilter;
    this.filterDoctors();
  }

  filterDoctors() {
    const nameTerm = this.nameFilter.toLowerCase();
    const addressTerm = this.addressFilter.toLowerCase();

    this.filteredDoctors = this.doctors.filter(doctor =>
      (doctor.name.toLowerCase().includes(nameTerm) ||
        doctor.email.toLowerCase().includes(nameTerm)) &&
      (!addressTerm || doctor.address.toLowerCase().includes(addressTerm))
    );
  }

  onNameFilterChange() {
    this.filterDoctors();
  }

  onAddressFilterChange() {
    this.filterDoctors();
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
