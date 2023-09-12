import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';
import { SignupComponent } from './components/signup/signup.component';
import { PasswordComponent } from './components/password/password.component';

@NgModule({
  declarations: [
    PublicComponent,
    LoginComponent,
    SignupComponent,
    PasswordComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PublicRoutingModule
  ],
  providers: [LoginComponent]
})
export class PublicModule { }
