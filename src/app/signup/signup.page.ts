import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import {
  IonButton,
  IonContent,
  IonHeader, IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";
import {FormsModule} from "@angular/forms";

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    FormsModule,
    IonTextarea,
    IonButton,
    IonIcon,
    RouterLink
  ]
})
export class SignupPage {
  user = {
    name: '',
    dob: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  };

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async signUp() {
    const loading = await this.loadingCtrl.create({
      message: 'Creating account...',
    });
    await loading.present();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: this.user.email,
        password: this.user.password,
        options: {
          data: {
            full_name: this.user.name,
            dob: this.user.dob,
            phone: this.user.phone,
            address: this.user.address,
          },
        },
      });

      if (error) throw error;

      await loading.dismiss();
      this.showToast('Account created! Check your email for verification.', 'success');
      this.router.navigate(['/login']);
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error.message, 'danger');
    }
  }

  async signUpWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;

      this.showToast('Google Sign-In successful!', 'success');
      this.router.navigate(['/home']); // Redirect to home page
    } catch (error: any) {
      this.showToast(error.message, 'danger');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
    });
    toast.present();
  }
}
