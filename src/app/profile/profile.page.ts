import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user/user.service';
import { IonicModule } from "@ionic/angular";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { Appointment } from "../../models/Appointment";
import { AppointmentService } from "../../services/appointment/appointment.service";

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
  date: string = new Date().toISOString().split('T')[0];
  name: string = '';
  initials: string = '';
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  oldAppointments: Appointment[] = [];
  groupedAppointments: { date: string; events: Appointment[] }[] = [];
  selectedDayAppointments: Appointment[] = [];
  role: string = '';
  highlightedDates = [
    {
      date: '2025-04-05',
      textColor: '#800080',
      backgroundColor: '#ffc0cb',
    },
    {
      date: '2025-04-10',
      textColor: '#09721b',
      backgroundColor: '#c8e5d0',
    },
    {
      date: '2025-04-20',
      textColor: 'var(--ion-color-secondary-contrast)',
      backgroundColor: 'var(--ion-color-secondary)',
    },
    {
      date: '2025-04-23',
      textColor: 'rgb(68, 10, 184)',
      backgroundColor: 'rgb(211, 200, 229)',
    },
  ];

  constructor(private userService: UserService, private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.name = user.name;
        this.initials = this.getInitials(user.name);
        this.role = user.role.toLowerCase() === 'docteur' ? 'doctor' : user.role.toLowerCase();
        console.log('User fetched - Name:', this.name, 'Role:', this.role); // Debug log
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
    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        this.appointments = response.appointments || [];
        console.log('Appointments fetched:', this.appointments); // Debug log
        this.splitAppointments();
      },
      error: (err) => {
        console.error('Error fetching appointments:', err);
        this.appointments = [];
        this.upcomingAppointments = [];
        this.oldAppointments = [];
        this.groupedAppointments = [];
      }
    });
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
    console.log('Upcoming appointments:', this.upcomingAppointments); // Debug log
    console.log('Old appointments:', this.oldAppointments); // Debug log
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
    const selectedDateValue = event.detail.value; // Get the selected date as a string (e.g., "2023-01-05")
    this.selectedDate = new Date(selectedDateValue); // Parse the string into a Date object
    console.log('Selected date:', this.selectedDate); // Debug log

    // Filter appointments for the selected date
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
    console.log('Selected day appointments:', this.selectedDayAppointments); // Debug log

    this.setOpen(true); // Open the modal when a date is clicked
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No date selected.';
    return date.toLocaleDateString('en-GB', {
      weekday: 'long', // "Saturday"
      day: '2-digit', // "19"
      month: '2-digit', // "04"
      year: 'numeric' // "2025"
    }).replace(/,/, '').replace(/(\d+) (\d+) (\d+)/, '$1/$2/$3'); // Format to "Saturday - 19/04/2025"
  }
}
