import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeaturesRoutingModule } from './features-routing.module';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangeImageDirective } from './components/profile/change-image.directive';

@NgModule({
  declarations: [
    NavbarComponent,
    HomeComponent,
    ProfileComponent,
    ChangeImageDirective,
  ],
  imports: [CommonModule, FeaturesRoutingModule],
})
export class FeaturesModule {}
