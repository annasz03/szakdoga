import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { SymptomCheckerComponent } from './symptom-checker/symptom-checker.component';
import { AuthGuard } from './auth.guard';
import { ResultPageComponent } from './result-page/result-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { DoctorFinderPageComponent } from './doctor-finder-page/doctor-finder-page.component';
import { ForumPageComponent } from './forum-page/forum-page.component';
import { EditDiseasesAdminComponent } from './edit-diseases-admin/edit-diseases-admin.component';
import { ProfileSearchResultComponent } from './profile-search-result/profile-search-result.component';

export const routes: Routes = [
    { path: '', redirectTo: '/auth', pathMatch: 'full' },
    { path: 'auth', component: AuthPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'symptom-checker', component: SymptomCheckerComponent, canActivate: [AuthGuard] },
    { path: 'symptom-checker-result', component: ResultPageComponent, canActivate: [AuthGuard] },
    { path: 'profile/:uid', component: ProfilePageComponent, canActivate: [AuthGuard] },
    { path: 'doctor-finder', component: DoctorFinderPageComponent, canActivate: [AuthGuard] },
    { path: 'forum', component: ForumPageComponent, canActivate: [AuthGuard] },
    { path: 'diseases-edit', component: EditDiseasesAdminComponent, canActivate: [AuthGuard] },
    { path: 'search-result', component: ProfileSearchResultComponent, canActivate: [AuthGuard] },
];
