export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  registrationStatus: 'pending' | 'approved' | 'rejected';
}
