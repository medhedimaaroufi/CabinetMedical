import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user/user.service';
import {IonicModule} from "@ionic/angular";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Appointment} from "../../models/Appointment";
import {AppointmentService} from "../../services/appointment/appointment.service";


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
  name: string = '';
  initials: string = '';
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  oldAppointments: Appointment[] = [];
  groupedAppointments: { date: string; events: Appointment[] }[] = [];
  role: string = '';

  constructor(private userService: UserService, private appointmentService: AppointmentService) {
  }

  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      this.name = user.name;
      this.initials = this.getInitials(user.name);
      this.role = user.role;
    });

    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        this.appointments = response.appointments || [];
        this.splitAppointments();
      },
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
      // Upcoming appointments: future dates with "scheduled" or "pending" status
      if (apptDate >= now && ['scheduled', 'pending'].includes(appt.status.toLowerCase())) {
        this.upcomingAppointments.push(appt);
      }
      // Old appointments: past dates or canceled/completed appointments
      else if (apptDate < now || appt.status.toLowerCase() === 'completed') {
        this.oldAppointments.push(appt);
      }
      // Optional: Handle other statuses (e.g., "canceled") if needed
    }
    // Sort upcoming appointments by date ascending
    this.upcomingAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    // Sort old appointments by date descending
    this.oldAppointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }

  getDate(dateTime: string): string {
    const [datePart] = dateTime.split('T');
    return datePart; // e.g., "2025-03-05"
  }

  getTime(dateTime: string): string {
    const [, timePart] = dateTime.split('T');
    return timePart; // e.g., "09:15"
  }
}
