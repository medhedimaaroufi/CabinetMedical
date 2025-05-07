import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppointmentsPatientsPage } from './appointments-patients.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentsPatientsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsPatientsPageRoutingModule {}
