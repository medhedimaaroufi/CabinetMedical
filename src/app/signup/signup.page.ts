import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonCard, IonCardContent,
  IonContent,
  IonToolbar
} from "@ionic/angular/standalone";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [
    IonToolbar,
    IonContent,
    IonCard,
    IonCardContent,
    FormsModule,
    IonButtons,
    IonBackButton,
    RouterLink
  ],
  standalone: true
})

export class SignupPage {

  constructor() {}

}
