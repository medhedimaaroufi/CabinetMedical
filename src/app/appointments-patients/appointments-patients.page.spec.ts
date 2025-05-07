import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsPatientsPage } from './appointments-patients.page';

describe('AppointmentsPatientsPage', () => {
  let component: AppointmentsPatientsPage;
  let fixture: ComponentFixture<AppointmentsPatientsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentsPatientsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
