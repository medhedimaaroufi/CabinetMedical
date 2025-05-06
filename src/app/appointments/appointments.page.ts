import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class AppointmentsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
