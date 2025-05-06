import { Component } from '@angular/core';
import {environment} from "../../environments/environment";
import {IonButton, IonContent, IonHeader, IonTitle, IonToolbar} from "@ionic/angular/standalone";

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.page.html',
  styleUrls: ['./doctor-dashboard.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
  ],
  standalone: true
})
export class DoctorDashboardPage {
  constructor() {}

  downloadFile(id: string) {
    // Redirect to the Flask endpoint
    console.log(id)
    window.location.href = `${environment.backendUrl}/api/patient/get-document?id=${id}`;
  }
}
