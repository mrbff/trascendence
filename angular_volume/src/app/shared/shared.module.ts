import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordComponent } from './components/password/password.component';
import { PopupComponent } from './components/popup/popup.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DropmenuDirective } from './components/navbar/dropmenu.directive';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    PasswordComponent,
    PopupComponent,
    NavbarComponent,
    DropmenuDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedRoutingModule,
  ],
  exports: [NavbarComponent, DropmenuDirective],
})
export class SharedModule {}
