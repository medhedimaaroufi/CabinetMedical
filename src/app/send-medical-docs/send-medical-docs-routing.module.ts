import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SendMedicalDocsPage } from './send-medical-docs.page';

const routes: Routes = [
  {
    path: '',
    component: SendMedicalDocsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SendMedicalDocsPageRoutingModule {}
