import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { NotificationService } from '../services/notification.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

interface Notification {
  object: string;
  message: string;
  date: string;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule // Add this
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NotificationPage implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    console.log(localStorage.getItem("id"));
    this.loadNotifications(localStorage.getItem("id") || '');
  }

  loadNotifications(id?: string) {
    this.notificationService.getNotifications(id).subscribe({
      next: (data: { notifications: Notification[] }) => {
        this.notifications = data.notifications;
        console.log(this.notifications);
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
      }
    });
  }
}
