import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupDoctorPage } from './signup-doctor.page';

const routes: Routes = [
  {
    path: '',
    component: SignupDoctorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupDoctorPageRoutingModule {}
