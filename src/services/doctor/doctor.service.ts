import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  // Mock doctor data
  private mockDoctors = [
    { id: 1, name: 'John Doe', speciality: 'Cardiology', nextAvailable: '2025-05-07 10:00' },
    { id: 2, name: 'Jane Smith', speciality: 'Pediatrics', nextAvailable: '2025-05-08 14:00' },
    { id: 3, name: 'Emily Johnson', speciality: 'Dermatology', nextAvailable: '2025-05-09 09:00' }
  ];

  getDoctors(): Observable<{ doctors: any[] }> {
    return of({ doctors: this.mockDoctors });
  }
}
