import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/components/home/home.component';
import { LoginComponent } from './shared/components/login/login.component';
import { ProfileComponent } from './features/components/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { SignupComponent } from './shared/components/signup/signup.component';

const routes: Routes = [
  { pathMatch: 'full', path: '', component: LoginComponent },
  { pathMatch: 'full', path: 'signup', component: SignupComponent },
  {
    pathMatch: 'full',
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    pathMatch: 'full',
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  { pathMatch: 'full', path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
