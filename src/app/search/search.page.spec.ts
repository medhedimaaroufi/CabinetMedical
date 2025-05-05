import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchPage } from './search.page';

describe('SearchPage', () => {
  let component: SearchPage;
  let fixture: ComponentFixture<SearchPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchPage],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with services segment', () => {
    expect(component.segment).toBe('services');
  });

  it('should initialize with full services and doctors lists', () => {
    expect(component.filteredServices.length).toBe(component.services.length);
    expect(component.filteredDoctors.length).toBe(component.doctors.length);
  });

  it('should filter services by search term', () => {
    component.serviceSearchControl.setValue('Cardiology');
    component.filterServices();
    fixture.detectChanges();
    expect(component.filteredServices.length).toBe(1);
    expect(component.filteredServices[0].name).toBe('Cardiology Consultation');
  });

  it('should filter services by category', () => {
    component.serviceCategoryControl.setValue('Pediatrics');
    component.filterServices();
    fixture.detectChanges();
    expect(component.filteredServices.length).toBe(1);
    expect(component.filteredServices[0].name).toBe('Pediatric Checkup');
  });

  it('should filter services by search term and category', () => {
    component.serviceSearchControl.setValue('Consultation');
    component.serviceCategoryControl.setValue('Cardiology');
    component.filterServices();
    fixture.detectChanges();
    expect(component.filteredServices.length).toBe(1);
    expect(component.filteredServices[0].name).toBe('Cardiology Consultation');
  });

  it('should filter doctors by search term', () => {
    component.doctorSearchControl.setValue('Smith');
    component.filterDoctors();
    fixture.detectChanges();
    expect(component.filteredDoctors.length).toBe(1);
    expect(component.filteredDoctors[0].name).toBe('John Smith');
  });

  it('should filter doctors by specialty', () => {
    component.doctorSpecialtyControl.setValue('Pediatrician');
    component.filterDoctors();
    fixture.detectChanges();
    expect(component.filteredDoctors.length).toBe(1);
    expect(component.filteredDoctors[0].name).toBe('Michael Chen');
  });

  it('should filter doctors by search term and specialty', () => {
    component.doctorSearchControl.setValue('Johnson');
    component.doctorSpecialtyControl.setValue('Orthopedic Surgeon');
    component.filterDoctors();
    fixture.detectChanges();
    expect(component.filteredDoctors.length).toBe(1);
    expect(component.filteredDoctors[0].name).toBe('Emma Johnson');
  });

  it('should update segment on segmentChanged', () => {
    component.segmentChanged({ detail: { value: 'doctors' } });
    expect(component.segment).toBe('doctors');
  });
});
