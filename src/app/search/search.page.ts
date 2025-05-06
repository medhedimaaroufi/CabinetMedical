import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ModalController, ModalOptions } from '@ionic/angular';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { DoctorFilterModalComponent } from './doctor-filter-modal/doctor-filter-modal.component';
import { DoctorProfileModalComponent } from './doctor-profile-modal/doctor-profile-modal.component';
import { DoctorsServicesModalComponent } from './doctors-services-modal/doctors-services-modal.component';

interface Doctor {
  id: number;
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
    CommonModule
  ],
  standalone: true
})
export class SearchPage implements OnInit {
  segment: 'services' | 'doctors' = 'services';
  searchTerm: string = '';

  services: string[] = [];
  categories: string[] = [];
  filteredServices: string[] = [];
  serviceCategoryControl = new FormControl('');

  doctors: Doctor[] = [];
  specialties: string[] = [];
  filteredDoctors: Doctor[] = [];
  doctorSpecialtyControl = new FormControl('');

  doctorsByService: { [service: string]: Doctor[] } = {};

  constructor(private http: HttpClient, private modalController: ModalController) {}

  ngOnInit() {
    this.loadDoctors();
    this.serviceCategoryControl.valueChanges.subscribe(() => this.filterServices());
    this.doctorSpecialtyControl.valueChanges.subscribe(() => this.filterDoctors());
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

  async selectService(service: string) {
    console.log('Selected Service:', service);
    const modalOptions = {
      component: DoctorsServicesModalComponent,
      componentProps: {
        specialty: service
      }
    } as ModalOptions;

    const modal = await this.modalController.create(modalOptions);
    await modal.present();
  }

  loadDoctors(query: string = '') {
    const url = `${environment.apiUrl}/search?query=${encodeURIComponent(query)}`;
    this.http.get<SearchResponse>(url).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.doctors = response.doctors.map(doctor => ({
          ...doctor,
          id: typeof doctor.id === 'string' && /^\d+$/.test(doctor.id) ? parseInt(doctor.id) : doctor.id
        }));
        this.filteredDoctors = [...this.doctors];
        this.services = response.services;
        this.filteredServices = [...this.services];
        this.categories = [...new Set(this.services)];
        this.specialties = [...new Set(
          this.doctors
            .filter(doctor => doctor.speciality !== null)
            .map(doctor => doctor.speciality!)
        )];

        // Populate doctorsByService
        this.doctorsByService = {};
        this.services.forEach(service => {
          this.doctorsByService[service] = this.doctors.filter(
            doctor => doctor.speciality === service
          );
        });

        this.filterServices();
        this.filterDoctors();
      },
      error: (error) => {
        console.error('Error fetching doctors:', error);
        this.filteredDoctors = [];
        this.specialties = [];
        this.services = [];
        this.filteredServices = [];
        this.categories = [];
        this.doctorsByService = {};
      }
    });
  }

  search(event: any) {
    this.searchTerm = event.target.value || '';
    if (this.segment === 'services') {
      this.filterServices();
    } else {
      this.loadDoctors(this.searchTerm);
    }
  }

  filterServices() {
    const searchTerm = this.searchTerm.toLowerCase();
    const category = this.serviceCategoryControl.value || '';

    this.filteredServices = this.services.filter(service =>
      service.toLowerCase().includes(searchTerm) &&
      (!category || service.toLowerCase().includes(category.toLowerCase()))
    );
  }

  filterDoctors(nameFilter: string = this.searchTerm, addressFilter: string = '') {
    const nameTerm = nameFilter.toLowerCase();
    const addressTerm = addressFilter.toLowerCase();
    const specialty = this.doctorSpecialtyControl.value || '';

    this.filteredDoctors = this.doctors.filter(doctor =>
      (doctor.name.toLowerCase().includes(nameTerm) ||
        doctor.email.toLowerCase().includes(nameTerm)) &&
      (!addressTerm || doctor.address.toLowerCase().includes(addressTerm)) &&
      (!specialty || doctor.speciality === specialty)
    );
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
    this.searchTerm = '';
    this.serviceCategoryControl.setValue('');
    this.doctorSpecialtyControl.setValue('');
    this.filterServices();
    this.loadDoctors();
  }
}
