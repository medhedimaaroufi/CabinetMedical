import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  calendarOutline,
  searchOutline,
  notificationsOutline,
  personOutline
} from 'ionicons/icons';
import { ProfilePage } from '../profile/profile.page';
import { NotificationPage } from '../notification/notification.page';
import { SearchPage } from '../search/search.page';
import { PatientDashboardPage } from '../patient-dashboard/patient-dashboard.page';
import { AppointmentsPage } from '../appointments/appointments.page';
import { NgIf } from '@angular/common';
import {AppointmentsPatientsPage} from "../appointments-patients/appointments-patients.page";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonIcon,
    IonTab,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonLabel,
    ProfilePage,
    NotificationPage,
    SearchPage,
    PatientDashboardPage,
    AppointmentsPage,
    NgIf,
    AppointmentsPatientsPage,
  ],
  standalone: true
})
export class HomePage implements OnInit {
  @ViewChild(IonTabs, { static: false }) tabsComponent!: IonTabs;
  public tabs = ['home', 'appointments', 'search', 'notification', 'profile'];
  public activeTab = this.tabs[0];
  public requestedTab = '';
  role: string = localStorage.getItem('role') || '';

  constructor() {
    addIcons({
      'home-outline': homeOutline,
      'calendar-outline': calendarOutline,
      'search-outline': searchOutline,
      'notifications-outline': notificationsOutline,
      'person-outline': personOutline
    });
  }

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    this.requestedTab = urlParams.get('tab') || '';
    if (this.tabs.includes(this.requestedTab)) {
      this.activeTab = this.requestedTab;
    } else {
      this.activeTab = 'home';
    }
    console.log('Active tab:', this.activeTab);
  }

  ionViewDidEnter() {
    // Select the tab programmatically after the view is fully initialized
    if (this.tabsComponent && this.activeTab) {
      this.tabsComponent.select(this.activeTab);
    }
  }
}
