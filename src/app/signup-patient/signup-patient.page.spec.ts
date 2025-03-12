import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupPatientPage } from './signup-patient.page';

describe('SignupPatientPage', () => {
  let component: SignupPatientPage;
  let fixture: ComponentFixture<SignupPatientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupPatientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
