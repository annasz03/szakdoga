import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'auth', loadComponent: () => import('./auth-page/auth-page.component').then(m => m.AuthPageComponent) },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
  { path: 'home', canActivate: [AuthGuard], loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'symptom-checker', canActivate: [AuthGuard], loadComponent: () => import('./symptom-checker/symptom-checker.component').then(m => m.SymptomCheckerComponent) },
  { path: 'symptom-checker-result', canActivate: [AuthGuard], loadComponent: () => import('./result-page/result-page.component').then(m => m.ResultPageComponent) },
  { path: 'profile/:uid', canActivate: [AuthGuard], loadComponent: () => import('./profile-page/profile-page.component').then(m => m.ProfilePageComponent) },
  { path: 'doctor-finder', canActivate: [AuthGuard], loadComponent: () => import('./doctor-finder-page/doctor-finder-page.component').then(m => m.DoctorFinderPageComponent) },
  { path: 'forum', canActivate: [AuthGuard], loadComponent: () => import('./forum-page/forum-page.component').then(m => m.ForumPageComponent) },
  { path: 'diseases-edit', canActivate: [AuthGuard], loadComponent: () => import('./edit-diseases-admin/edit-diseases-admin.component').then(m => m.EditDiseasesAdminComponent) },
  { path: 'search-result', canActivate: [AuthGuard], loadComponent: () => import('./profile-search-result/profile-search-result.component').then(m => m.ProfileSearchResultComponent) },
  { path: 'edit-disease/:id', canActivate: [AuthGuard], loadComponent: () => import('./edit-disease/edit-disease.component').then(m => m.EditDiseaseComponent) }
];
