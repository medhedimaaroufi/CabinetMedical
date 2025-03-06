import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupDoctorPageRoutingModule } from './signup-doctor-routing.module';

import { SignupDoctorPage } from './signup-doctor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupDoctorPageRoutingModule
  ],
  declarations: []
})
export class SignupDoctorPageModule {}
