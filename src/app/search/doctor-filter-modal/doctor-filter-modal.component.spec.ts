import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DoctorFilterModalComponent } from './doctor-filter-modal.component';

describe('DoctorFilterModalComponent', () => {
  let component: DoctorFilterModalComponent;
  let fixture: ComponentFixture<DoctorFilterModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DoctorFilterModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorFilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
