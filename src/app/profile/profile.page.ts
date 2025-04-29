import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user/user.service';
import { IonicModule } from "@ionic/angular";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { Appointment } from "../../models/Appointment";
import { AppointmentService } from "../../services/appointment/appointment.service";
import { MedicalFileService } from "../../services/medicalFile/medicalfile.service";

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
    { start: 8, end: 12 }, // 8 AM to 12 PM
    { start: 14, end: 18 } // 2 PM to 6 PM
  ];
  daysOff: string[] = [];
  workingWeekends: string[] = []; // Dates (Saturdays/Sundays) the doctor has marked as working
  appointmentDuration: number = 30; // Each appointment is 30 minutes

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private medicalFileService: MedicalFileService
  ) {}

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.name = user.name;
        this.initials = this.getInitials(user.name);
        this.role = user.role.toLowerCase() === 'docteur' ? 'doctor' : user.role.toLowerCase();
        console.log('User fetched - Name:', this.name, 'Role:', this.role);
        this.fetchAppointments();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.role = '';
        this.fetchAppointments();
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
    this.date = selectedDateValue; // Update the date property
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
    this.updateHighlightedDates(); // Refresh highlights for the new month
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

    // Check if the day is a weekend (Saturday=6, Sunday=0)
    const isWeekend = day === 0 || day === 6;

    // A day is a working day if:
    // - It's a weekday (Monday to Friday) and not in daysOff, OR
    // - It's a weekend day but explicitly marked as working in workingWeekends
    return (this.workingDays.includes(day) && !this.daysOff.includes(dateString)) ||
      (isWeekend && this.workingWeekends.includes(dateString));
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
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;

    if (isWeekend) {
      // If it's a weekend, toggle it in workingWeekends
      const index = this.workingWeekends.indexOf(dateString);
      if (index > -1) {
        // If already marked as working, remove it (make it non-working again, red mark returns)
        this.workingWeekends.splice(index, 1);
      } else {
        // If not marked as working, add it (make it a working day, red mark disappears)
        this.workingWeekends.push(dateString);
        // Remove from daysOff if it was there
        const daysOffIndex = this.daysOff.indexOf(dateString);
        if (daysOffIndex > -1) {
          this.daysOff.splice(daysOffIndex, 1);
        }
      }
    } else {
      // If it's a weekday, toggle it in daysOff
      const index = this.daysOff.indexOf(dateString);
      if (index > -1) {
        // If already marked as a day off, remove it (make it working again)
        this.daysOff.splice(index, 1);
      } else {
        // If not marked as a day off, add it (make it non-working)
        this.daysOff.push(dateString);
        // Remove from workingWeekends if it was there
        const workingWeekendsIndex = this.workingWeekends.indexOf(dateString);
        if (workingWeekendsIndex > -1) {
          this.workingWeekends.splice(workingWeekendsIndex, 1);
        }
      }
    }
    this.updateHighlightedDates();
  }

  updateHighlightedDates() {
    // Determine the month and year to highlight
    const referenceDate = this.selectedDate || new Date(this.date);
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth(); // 0 = January, 11 = December

    // Set start and end dates for the month
    const startDate = new Date(year, month, 1); // First day of the month
    const endDate = new Date(year, month + 1, 0); // Last day of the month

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
}
