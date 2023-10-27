import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeaturesRoutingModule } from './features-routing.module';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangeImageDirective } from './components/profile/change-image.directive';
import { FriendsComponent } from './components/friends/friends.component';
import { DropmenuDirective } from './components/navbar/dropmenu.directive';
import { FormsModule } from '@angular/forms';
import { FriendCardComponent } from './components/friend-card/friend-card.component';
import { CoreModule } from '../core/core.module';
import { RequestCardComponent } from './components/request-card/request-card.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

@NgModule({
  declarations: [
    NavbarComponent,
    HomeComponent,
    ProfileComponent,
    ChangeImageDirective,
    FriendsComponent,
    DropmenuDirective,
    FriendCardComponent,
    RequestCardComponent,
    LeaderboardComponent,
  ],
  imports: [CommonModule, FeaturesRoutingModule, FormsModule, CoreModule],
})
export class FeaturesModule {}
