import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordComponent } from './components/password/password.component';
import { PopupComponent } from './components/popup/popup.component';

@NgModule({
  declarations: [LoginComponent, SignupComponent, PasswordComponent, PopupComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedRoutingModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
