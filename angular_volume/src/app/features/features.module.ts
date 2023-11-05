import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeaturesRoutingModule } from './features-routing.module';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangeImageDirective } from './components/profile/components/profile-image/change-image.directive';
import { FriendsComponent } from './components/friends/friends.component';
import { FormsModule } from '@angular/forms';
import { FriendCardComponent } from './components/friends/components/friend-card/friend-card.component';
import { RequestCardComponent } from './components/friends/components/request-card/request-card.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { TwoFactorAuthComponent } from './components/profile/components/two-factor-auth/two-factor-auth.component';
import { UserButtonsComponent } from './components/profile/components/user-buttons/user-buttons.component';
import { ProfileImageComponent } from './components/profile/components/profile-image/profile-image.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    HomeComponent,
    ProfileComponent,
    FriendsComponent,
    FriendCardComponent,
    RequestCardComponent,
    LeaderboardComponent,
    TwoFactorAuthComponent,
    UserButtonsComponent,
    ProfileImageComponent,
    ChangeImageDirective,
  ],
  imports: [CommonModule, SharedModule, FeaturesRoutingModule, FormsModule],
})
export class FeaturesModule {}
