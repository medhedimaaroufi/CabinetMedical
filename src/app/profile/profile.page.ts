import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user/user.service';
import {IonicModule, ModalController, ModalOptions} from "@ionic/angular";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { Appointment } from "../../models/Appointment";
import { AppointmentService } from "../../services/appointment/appointment.service";
import { MedicalFileService } from "../../services/medicalFile/medicalfile.service";
import {Consultation} from "../../models/Consultation";
import {ConsultationService} from "../../services/consultation/consultation.service";
import {CalendarService} from "../../services/calendar/calendar.service";
import {FormsModule} from "@angular/forms";
import {environment} from "../../environments/environment";
import {SendMedicalDocsPage} from "../send-medical-docs/send-medical-docs.page";
import {PatientProfileModalComponent} from "./patient-profile-modal/patient-profile-modal.component";
import {Doctor} from "../../models/Doctor";
import {Patient} from "../../models/Patient";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    NgForOf,
    NgClass,
    FormsModule,
    SendMedicalDocsPage
  ]
})
export class ProfilePage implements OnInit {
  isModalOpen = false;
  isAppointmentModalOpen = false; // New property for doctor's appointments modal
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
  workingDays: number[] = [0, 1, 2, 3, 4, 5, 6]; // All days of the week
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
  isUpdatingAvailability = false; // For loading state
  availabilityError: string | null = null; // For error feedback
  // New properties for patient tabs
  selectedTab: string = 'upcoming'; // Default tab
  // New properties for doctor tabs
  selectedDoctorTab: string = 'schedule'; // Default doctor tab
  todayAppointments: Appointment[] = []; // Appointments for today
  weeklyAppointments: number = 0; // Number of appointments this week
  nextAvailableSlot: string = 'None'; // Next available time slot
  patientSearchTerm: string = ''; // Search term for patients
  patientCategory: string = 'all'; // Filter category for patients
  patientsList: any[] = []; // List of all patients
  recentPatients: any[] = []; // Recently seen patients
  upcomingPatients: any[] = []; // Patients with upcoming appointments
  filteredPatients: any[] = []; // Filtered list of patients
  analyticsPeriod: string = 'week'; // Analytics period
  analytics = {
    totalPatients: 0,
    patientChange: 0,
    consultations: 0,
    consultationChange: 0,
    appointmentRate: 0,
    rateChange: 0,
    avgDuration: 0,
    durationChange: 0,
    chartData: [{ label: 'Thursday', value: 25 }],
    appointmentTypes: [
      { name: 'Follow-up', percentage: 60, startAngle: 0, endAngle: 216, color: '#4CAF50' },
      { name: 'New Patient', percentage: 40, startAngle: 216, endAngle: 360, color: '#2196F3' }
    ]
  };
  patient_id: string = localStorage.getItem("id") || '';

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private medicalFileService: MedicalFileService,
    private consultationService: ConsultationService,
    private calendarService: CalendarService,
    private modalController: ModalController
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
        if (this.role === 'doctor') {
          this.fetchAvailability();
          this.updateDoctorData();
          this.getPatients();// Initialize doctor-specific data
        }
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
            this.updateDoctorData();
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
            this.updateDoctorData();
          }
        }
      });
    }
  }

  updateDoctorData() {
    const today = new Date();
    this.todayAppointments = this.appointments.filter(appt => {
      const apptDate = new Date(appt.dateTime);
      return apptDate.toDateString() === today.toDateString();
    });
    this.weeklyAppointments = this.appointments.filter(appt => {
      const apptDate = new Date(appt.dateTime);
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return apptDate >= weekStart && apptDate <= weekEnd;
    }).length;
    this.nextAvailableSlot = this.calculateNextAvailableSlot();
  }

  calculateNextAvailableSlot(): string {
    // Placeholder logic to calculate next available slot
    const now = new Date();
    for (let day = 0; day < 7; day++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + day);
      if (this.isWorkingDay(checkDate) && !this.isFullyBooked(checkDate)) {
        return checkDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
    }
    return 'None';
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

  setAppointmentModalOpen(isOpen: boolean) {
    this.isAppointmentModalOpen = isOpen;
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
    this.isAppointmentModalOpen = true; // Open doctor's appointments modal
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

    // Update highlighted dates and save to backend
    this.updateHighlightedDates();
    this.updateAvailability();
  }

  updateHighlightedDates() {
    const referenceDate = this.selectedDate || new Date(this.date);
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
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
    console.log('Highlighted dates:', this.highlightedDates);
  }

  // Medical File
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

  // Consultations
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
    this.isModalOpen = true; // Open the consultation modal
  }

  // New method for patient segment tab change
  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
    console.log('Selected tab:', this.selectedTab);
  }

  // New method for doctor segment tab change
  doctorSegmentChanged(event: any) {
    this.selectedDoctorTab = event.detail.value;
    console.log('Selected doctor tab:', this.selectedDoctorTab);
    if (this.selectedDoctorTab === 'schedule') this.updateDoctorData();
  }

  // New method to view appointment details (placeholder)
  viewAppointmentDetails(appointment: Appointment) {
    console.log('Viewing details for appointment:', appointment);
    this.selectedConsultation = null; // Ensure consultation modal is closed
    this.isModalOpen = true; // Open a potential appointment modal (to be implemented if needed)
  }

  // New method to get status icon class
  getStatusIconClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'scheduled':
        return 'success';
      default:
        return 'medium';
    }
  }

  // Fetch the doctor's availability from the backend
  fetchAvailability() {
    this.calendarService.getAvailability().subscribe({
      next: (response) => {
        this.daysOff = response.daysOff || [];
        this.updateHighlightedDates();
      },
      error: (err) => {
        console.error('Error fetching availability:', err);
        this.availabilityError = 'Failed to load availability. Please try again.';
      }
    });
  }

  // Update the doctor's availability in the backend
  updateAvailability() {
    this.isUpdatingAvailability = true;
    this.availabilityError = null;

    this.calendarService.updateAvailability(this.daysOff).subscribe({
      next: () => {
        this.isUpdatingAvailability = false;
        console.log('Availability updated successfully');
      },
      error: (err) => {
        console.error('Error updating availability:', err);
        this.availabilityError = 'Failed to update availability. Please try again.';
        this.isUpdatingAvailability = false;
      }
    });
  }

  // New methods for doctor functionality
  getPatients() {
    this.userService.getPatients().subscribe(data => {
      console.log('Raw API response:', data);
      this.patientsList = Array.isArray(data) ? data : data.patients || [];
      this.filteredPatients = this.patientsList;
      console.log('Patients fetched:', this.patientsList);
    });
  }


  searchPatients() {
    this.filteredPatients = this.patientsList.filter(patient =>
      patient.name.toLowerCase().includes(this.patientSearchTerm.toLowerCase())
    );
    this.filterPatients(this.patientCategory);
  }

  filterPatients(category: string) {
    this.patientCategory = category;
    switch (category) {
      case 'all':
        this.filteredPatients = this.patientsList;
        break;
      case 'recent':
        this.filteredPatients = this.recentPatients;
        break;
      case 'upcoming':
        this.filteredPatients = this.upcomingPatients;
        break;
    }
  }

  viewPatientProfile(patient: any) {
    console.log('Viewing profile for patient:', patient);
    // Implement navigation or modal logic
  }

  contactPatient(patient: any) {
    console.log('Contacting patient:', patient);
    // Implement contact logic (e.g., email)
  }

  updateAnalytics() {
    console.log('Updating analytics for period:', this.analyticsPeriod);
    // Implement API call or logic to update analytics data
  }

  openNewAppointment() {
    console.log('Opening new appointment form');
    // Implement navigation or form logic
  }

  manageDaysOff() {
    console.log('Managing days off');
    // Implement days off management logic
  }

  openTimeSlots() {
    console.log('Opening time slots management');
    // Implement time slots management logic
  }

  openSettings() {
    console.log('Opening settings');
    // Implement settings navigation
  }

  viewPatientDetails(appointment: Appointment) {
    console.log('Viewing patient details for appointment:', appointment);
    // Implement patient details view
  }

  startConsultation(appointment: Appointment) {
    console.log('Starting consultation for appointment:', appointment);
    // Implement consultation start logic (e.g., video call)
  }

  protected readonly Math = Math;
  protected readonly environment = environment;
  async selectPatient(patient: Patient) {
    console.log('Patient ID:', patient._id, 'Type:', typeof patient._id);
    const modalOptions = {
      component: PatientProfileModalComponent,
      componentProps: {
        UserId: patient._id.toString()
      }
    } as ModalOptions;

    const modal = await this.modalController.create(modalOptions);
    await modal.present();
  }
}
