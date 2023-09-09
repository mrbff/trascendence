import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PublicComponent,
    LoginComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PublicRoutingModule
  ]
})
export class PublicModule { }
