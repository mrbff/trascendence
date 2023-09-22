import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { LoginComponent } from './components/login/login.component';
import { PasswordComponent } from './components/password/password.component';
import { SignupComponent } from './components/signup/signup.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [LoginComponent, SignupComponent, PasswordComponent],
  imports: [CommonModule, FormsModule, SharedRoutingModule],
  providers: [LoginComponent],
})
export class SharedModule {}
