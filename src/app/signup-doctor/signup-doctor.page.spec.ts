import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupDoctorPage } from './signup-doctor.page';

describe('SignupDoctorPage', () => {
  let component: SignupDoctorPage;
  let fixture: ComponentFixture<SignupDoctorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupDoctorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
