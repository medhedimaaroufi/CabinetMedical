import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard'; // Adjust the path as needed

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then((m) => m.SignupPageModule),
  },
  {
    path: 'signup-patient',
    loadChildren: () => import('./signup-patient/signup-patient.module').then((m) => m.SignupPatientPageModule),
  },
  {
    path: 'signup-doctor',
    loadChildren: () => import('./signup-doctor/signup-doctor.module').then((m) => m.SignupDoctorPageModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'patient',
    loadChildren: () => import('./patient-dashboard/patient-dashboard.module').then((m) => m.PatientDashboardPageModule),
    canActivate: [authGuard] // Protect patient dashboard
  },
  {
    path: 'doctor',
    loadChildren: () => import('./doctor-dashboard/doctor-dashboard.module').then((m) => m.DoctorDashboardPageModule),
    canActivate: [authGuard] // Protect doctor dashboard
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then((m) => m.AdminDashboardPageModule),
    canActivate: [authGuard] // Protect admin dashboard
  },
  {
    path: '**', // Wildcard route for 404
    redirectTo: 'home'
  },
  {
    path: 'patient-dashboard',
    loadChildren: () => import('./patient-dashboard/patient-dashboard.module').then( m => m.PatientDashboardPageModule)
  },
  {
    path: 'doctor-dashboard',
    loadChildren: () => import('./doctor-dashboard/doctor-dashboard.module').then( m => m.DoctorDashboardPageModule)
  },
  {
    path: 'admin-dashboard',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then( m => m.AdminDashboardPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
