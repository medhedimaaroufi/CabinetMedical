import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendMedicalDocsPage } from './send-medical-docs.page';

describe('SendMedicalDocsPage', () => {
  let component: SendMedicalDocsPage;
  let fixture: ComponentFixture<SendMedicalDocsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SendMedicalDocsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
