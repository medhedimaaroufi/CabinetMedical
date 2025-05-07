import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentsPatientsPageRoutingModule } from './appointments-patients-routing.module';

import { AppointmentsPatientsPage } from './appointments-patients.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentsPatientsPageRoutingModule,
    AppointmentsPatientsPage
  ],
})
export class AppointmentsPatientsPageModule {}
