import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ModalController, ModalOptions } from '@ionic/angular';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { DoctorFilterModalComponent } from './doctor-filter-modal/doctor-filter-modal.component';

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
    CommonModule
  ],
  standalone: true
})
export class SearchPage implements OnInit {
  segment: 'services' | 'doctors' = 'services';
  searchTerm: string = '';

  // Medical Services (hardcoded as fallback)
  services: MedicalService[] = [
    { id: 1, name: 'Cardiology Consultation', category: 'Cardiology' },
    { id: 2, name: 'Orthopedic Surgery', category: 'Orthopedics' },
    { id: 3, name: 'Pediatric Checkup', category: 'Pediatrics' },
    { id: 4, name: 'Neurological Exam', category: 'Neurology' },
    { id: 5, name: 'Dermatology Consultation', category: 'Dermatology' }
  ];
  categories = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology'];
  filteredServices: MedicalService[] = [...this.services];
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

  loadDoctors(query: string = '') {
    const url = `${environment.backendUrl}/search?query=${encodeURIComponent(query)}`;
    this.http.get<SearchResponse>(url).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.doctors = response.doctors;
        this.filteredDoctors = [...this.doctors];
        // Extract unique specialties, excluding null
        this.specialties = [...new Set(
          this.doctors
            .filter(doctor => doctor.speciality !== null)
            .map(doctor => doctor.speciality!)
        )];
        // Apply current filters
        this.filterDoctors();
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
      this.filterServices();
    } else {
      // Reload doctors with search query
      this.loadDoctors(this.searchTerm);
    }
  }

  filterServices() {
    const searchTerm = this.searchTerm.toLowerCase();
    const category = this.serviceCategoryControl.value || '';

    this.filteredServices = this.services.filter(service =>
      service.name.toLowerCase().includes(searchTerm) &&
      (!category || service.category === category)
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
    this.loadDoctors(); // Refresh doctors
  }

  selectService(service: MedicalService) {
    console.log('Selected Service:', service);
  }

  selectDoctor(doctor: Doctor) {
    console.log('Selected Doctor:', doctor);
  }
}
