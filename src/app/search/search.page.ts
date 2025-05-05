import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ModalController, ModalOptions } from '@ionic/angular';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { DoctorFilterModalComponent } from './doctor-filter-modal/doctor-filter-modal.component';
import { DoctorProfileModalComponent } from './doctor-profile-modal/doctor-profile-modal.component';

interface MedicalService {
  id: number;
  name: string;
  category: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  speciality: string | null;
}

interface SearchResponse {
  doctors: Doctor[];
  services: string[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DoctorProfileModalComponent
  ],
  standalone: true
})
export class SearchPage implements OnInit {
  segment: 'services' | 'doctors' = 'services';
  searchTerm: string = '';

  // Medical Services (hardcoded as fallback)
  services: string[] = [];
  filteredServices: string[] = this.services;
  serviceCategoryControl = new FormControl('');

  // Doctors (fetched from backend)
  doctors: Doctor[] = [];
  specialties: string[] = [];
  filteredDoctors: Doctor[] = [];
  doctorSpecialtyControl = new FormControl('');

  constructor(private http: HttpClient, private modalController: ModalController) {}

  ngOnInit() {
    // Initialize filtered services
    this.filterServices();

    // Fetch doctors from backend
    this.loadDoctors();

    // Subscribe to filter changes
    this.serviceCategoryControl.valueChanges.subscribe(() => this.filterServices(this.searchTerm));
    this.doctorSpecialtyControl.valueChanges.subscribe(() => this.filterDoctors(this.searchTerm, this.searchTerm, this.searchTerm));
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
        this.filterDoctors(nameFilter, addressFilter, '');
      }
    });

    await modal.present();
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

  loadDoctors(query: string = '') {
    const url = `${environment.backendUrl}/api/search?query=${encodeURIComponent(query)}`;
    this.http.get<SearchResponse>(url).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.doctors = response.doctors;
        this.filteredDoctors = [...this.doctors];
        // Extract unique specialties, excluding null
        this.specialties = response.services;
        console.log('Specialties:', this.specialties);
        this.filteredServices = this.specialties;
        console.log('Filtered Services:', this.filteredServices);
        // Apply current filters
        this.filterDoctors(this.searchTerm, this.searchTerm, this.searchTerm);
      },
      error: (error) => {
        console.error('Error fetching doctors:', error);
        this.filteredDoctors = [];
        this.specialties = [];
      }
    });
  }

  search(event: any) {
    this.searchTerm = event.target.value || '';
    if (this.segment === 'services') {
      this.filterServices(this.searchTerm);
    } else {
      // Reload doctors with search query
      this.searchDoctors();
    }
  }

  filterServices(value: string = this.searchTerm) {
    const searchTerm = value.toLowerCase();

    console.log('Search Term:', searchTerm);

    this.filteredServices = this.specialties.filter(service =>
      service.toLowerCase().includes(searchTerm)
    );

    console.log('Filtered Services:', this.filteredServices);
  }

  filterDoctors(nameFilter: string = '', addressFilter: string = '', specialtyFilter: string = '') {
    const nameTerm = nameFilter.toLowerCase();
    const addressTerm = addressFilter.toLowerCase();
    const specialty = specialtyFilter.toLowerCase();

    console.log('Name Filter:', nameFilter, 'Address Filter:', addressFilter, 'Specialty Filter:', specialtyFilter);

    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesName =
        !nameTerm ||
        doctor.name.toLowerCase().includes(nameTerm) ||
        doctor.email.toLowerCase().includes(nameTerm);

      const matchesAddress =
        !addressTerm || doctor.address.toLowerCase().includes(addressTerm);

      const matchesSpecialty =
        !specialty || doctor.speciality?.toLowerCase() === specialty;

      return matchesName && matchesAddress && matchesSpecialty;
    });
  }

  searchDoctors() {
    this.filteredDoctors = this.doctors.filter(doctor => {
      return (
        doctor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.address.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor?.speciality?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
    this.searchTerm = '';
    this.serviceCategoryControl.setValue('');
    this.doctorSpecialtyControl.setValue('');
    this.filterServices();
    this.loadDoctors(); // Refresh doctors
  }

  selectService(service: string) {
    console.log('Selected Service:', service);
    this.segment = 'doctors';
    this.searchTerm = service;
    this.filterDoctors('', '', service);
  }

  selectDoctor(doctor: Doctor) {
    console.log('Selected Doctor:', doctor);
    this.openModalProfile(doctor);
  }
}
