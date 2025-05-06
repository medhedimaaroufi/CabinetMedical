import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notifications/notification.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

interface Notification {
  id: string;
  type: string;
  object: string;
  message: string;
  date: string;
  read: boolean;
  actionable: boolean;
  related_id?: string;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NotificationPage implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  notificationCategory: string = 'all';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.filteredNotifications = []
    this.loadNotifications();
  }

  loadNotifications() {
    const id = localStorage.getItem("id") || '';
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService.getNotifications(id).subscribe({
      next: (data: { notifications: Notification[] }) => {
        this.notifications = data.notifications;
        this.filterNotifications(this.notificationCategory);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load notifications. Please try again.';
        this.isLoading = false;
        console.error('Error loading notifications:', err);
      }
    });
  }

  filterNotifications(category: string) {
    this.notificationCategory = category;

    switch(category) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.read);
        break;
      case 'appointment':
        this.filteredNotifications = this.notifications.filter(n => n.type === 'appointment');
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotificationIcon(type: string): string {
    switch (type){
      case 'system':
        return 'settings-outline';
      case 'reminder':
        return 'alarm-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'appointment':
        return 'calendar-outline';
      default:
        return "notifications-outline";
    }
  }

  getActionText(type: string): string {
    switch (type) {
      case 'system':
        return 'Acknowledge';
      case 'reminder':
        return 'Mark Complete';
      case 'message':
        return 'Read Message';
      case 'appointment':
        return 'View Details';
      default:
        return 'View';
    }
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    } else if (diffHrs < 24) {
      return `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  }

  handleNotificationAction(notification: Notification) {
    notification.read = true;

    switch(notification.type) {
      case 'appointment':
        this.router.navigate(['/appointments', notification.related_id]);
        break;
      case 'message':
        this.router.navigate(['/messages', notification.related_id]);
        break;
      default:
        console.log('Action performed on notification:', notification.id);
    }
  }

  dismissNotification(notification: Notification) {
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
    this.filterNotifications(this.notificationCategory);
  }
}
