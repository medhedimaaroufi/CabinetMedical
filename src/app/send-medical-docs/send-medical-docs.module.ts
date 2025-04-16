import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SendMedicalDocsPageRoutingModule } from './send-medical-docs-routing.module';

import { SendMedicalDocsPage } from './send-medical-docs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SendMedicalDocsPageRoutingModule
  ],
})
export class SendMedicalDocsPageModule {}
