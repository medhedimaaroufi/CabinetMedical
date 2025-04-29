import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user/user.service';
import { IonicModule } from "@ionic/angular";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { Appointment } from "../../models/Appointment";
import { AppointmentService } from "../../services/appointment/appointment.service";
import { MedicalFileService } from "../../services/medicalFile/medicalfile.service";
import {Consultation} from "../../models/Consultation";
import {ConsultationService} from "../../services/consultation/consultation.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    NgForOf,
    NgClass
  ]
})
export class ProfilePage implements OnInit {
  isModalOpen = false;
  selectedDate: Date | null = null;
  date: string = '2025-04-01'; // Start at April 1, 2025
  name: string = '';
  initials: string = '';
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  oldAppointments: Appointment[] = [];
  groupedAppointments: { date: string; events: Appointment[] }[] = [];
  selectedDayAppointments: Appointment[] = [];
  role: string = '';
  highlightedDates: { date: string; textColor: string; backgroundColor: string }[] = [];
  // Doctor's schedule
  workingDays: number[] = [2, 3, 4, 5, 6]; // Monday to Friday
  workingHours: { start: number; end: number }[] = [
    {start: 8, end: 12}, // 8 AM to 12 PM
    {start: 14, end: 18} // 2 PM to 6 PM
  ];
  daysOff: string[] = [];
  appointmentDuration: number = 30; // Each appointment is 30 minutes
  // Consultations properties
  consultations: Consultation[] = [];
  isLoadingConsultations = false;
  consultationsError: string | null = null;
  selectedConsultation: Consultation | null = null; // To store the consultation for the modal

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private medicalFileService: MedicalFileService,
    private consultationService: ConsultationService
  ) {
  }

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.name = user.name;
        this.initials = this.getInitials(user.name);
        this.role = user.role.toLowerCase() === 'docteur' ? 'doctor' : user.role.toLowerCase();
        console.log('User fetched - Name:', this.name, 'Role:', this.role);
        this.fetchAppointments();
        this.getConsultations();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.role = '';
        this.fetchAppointments();
        this.getConsultations();
      }
    });
  }

  fetchAppointments() {
    const fetchObservable = this.role === 'doctor'
      ? this.appointmentService.getDoctorAppointments()
      : this.role === 'patient'
        ? this.appointmentService.getPatientAppointments()
        : null;

    if (fetchObservable) {
      fetchObservable.subscribe({
        next: (response) => {
          this.appointments = response.appointments || [];
          console.log('Appointments fetched:', this.appointments);
          this.splitAppointments();
          if (this.role === 'doctor') {
            this.updateHighlightedDates();
          }
        },
        error: (err) => {
          console.error('Error fetching appointments:', err);
          this.appointments = [];
          this.upcomingAppointments = [];
          this.oldAppointments = [];
          this.groupedAppointments = [];
          if (this.role === 'doctor') {
            this.updateHighlightedDates();
          }
        }
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-en-attente';
      case 'cancelled':
        return 'status-annulé';
      case 'scheduled':
        return 'status-confirmé';
      default:
        return '';
    }
  }

  splitAppointments() {
    const now = new Date();
    this.upcomingAppointments = [];
    this.oldAppointments = [];

    for (const appt of this.appointments) {
      const apptDate = new Date(appt.dateTime);
      if (apptDate >= now) {
        this.upcomingAppointments.push(appt);
      } else if (apptDate < now) {
        this.oldAppointments.push(appt);
      }
    }

    this.upcomingAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    this.oldAppointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    console.log('Upcoming appointments:', this.upcomingAppointments);
    console.log('Old appointments:', this.oldAppointments);
  }

  getDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'GMT'
    }).replace(',', '');
  }

  getTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'GMT'
    });
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  onDateChange(event: any) {
    const selectedDateValue = event.detail.value;
    this.selectedDate = new Date(selectedDateValue);
    console.log('Selected date:', this.selectedDate);

    if (this.selectedDate) {
      this.selectedDayAppointments = this.appointments.filter(appt => {
        const apptDate = new Date(appt.dateTime);
        return apptDate.getFullYear() === this.selectedDate!.getFullYear() &&
          apptDate.getMonth() === this.selectedDate!.getMonth() &&
          apptDate.getDate() === this.selectedDate!.getDate();
      });
    } else {
      this.selectedDayAppointments = [];
    }
    console.log('Selected day appointments:', this.selectedDayAppointments);

    this.setOpen(true);
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No date selected.';
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/,/, '').replace(/(\d+) (\d+) (\d+)/, '$1/$2/$3');
  }

  isWorkingDay(date: Date): boolean {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dateString = date.toISOString().split('T')[0];
    return this.workingDays.includes(day) && !this.daysOff.includes(dateString);
  }

  getAvailableSlotsInDay(): number {
    let totalHours = 0;
    this.workingHours.forEach(range => {
      totalHours += range.end - range.start;
    });
    const slotsPerHour = 60 / this.appointmentDuration;
    return totalHours * slotsPerHour;
  }

  isFullyBooked(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    const dayAppointments = this.appointments.filter(appt => {
      const apptDate = new Date(appt.dateTime);
      return apptDate.toISOString().split('T')[0] === dateString;
    });
    const totalSlots = this.getAvailableSlotsInDay();
    return dayAppointments.length >= totalSlots;
  }

  toggleDayOff(date: Date) {
    const dateString = date.toISOString().split('T')[0];
    const index = this.daysOff.indexOf(dateString);
    if (index > -1) {
      this.daysOff.splice(index, 1);
    } else {
      this.daysOff.push(dateString);
    }
    this.updateHighlightedDates();
  }

  updateHighlightedDates() {
    const startDate = new Date(1925, 0, 1); // January 1, 1925
    const endDate = new Date(2125, 0, 1); // January 1, 2125
    const highlighted: { date: string; textColor: string; backgroundColor: string }[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      if (!this.isWorkingDay(d)) {
        highlighted.push({
          date: dateString,
          textColor: '#ff043f',
          backgroundColor: '#ff8a8a' // Red for non-working days
        });
      } else if (this.isFullyBooked(d)) {
        highlighted.push({
          date: dateString,
          textColor: '#333333',
          backgroundColor: '#ffd700' // Yellowish for fully booked days
        });
      }
    }

    this.highlightedDates = highlighted;
  }

  //  Medical File
  downloadMedicalFile() {
    if (this.role !== 'patient') {
      console.log('Only patients can download their medical file.');
      return;
    }

    this.medicalFileService.getMedicalFile().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'medical-file.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Error downloading medical file:', err);
        alert('Failed to download medical file. Please try again later.');
      }
    });
  }

  //Consultations

  getConsultations() {
    const fetchObservable = this.role === 'patient'
      ? this.consultationService.getConsultations()
      : null;

    if (fetchObservable) {
      this.isLoadingConsultations = true;
      fetchObservable.subscribe({
        next: (response: { consultations: Consultation[] }) => {
          this.consultations = response.consultations || [];
          this.consultationsError = null;
          this.isLoadingConsultations = false;
          console.log('Consultations fetched:', this.consultations);
        },
        error: (err: any) => {
          console.error('Error fetching consultations:', err);
          this.consultations = [];
          this.consultationsError = 'Failed to load consultations. Please try again.';
          this.isLoadingConsultations = false;
        }
      });
    }
  }

  // Method to open the modal and set the selected consultation
  openConsultationModal(consultation: Consultation) {
    this.selectedConsultation = consultation;
    this.setOpen(true);
  }
}
