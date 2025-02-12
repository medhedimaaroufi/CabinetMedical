import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel, IonRow, IonTextarea,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonRow,
    IonCol,
    IonCheckbox,
    IonButton,
    IonTextarea
  ]
})
export class SigninPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
