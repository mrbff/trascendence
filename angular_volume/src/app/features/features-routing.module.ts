import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FriendsComponent } from './components/friends/friends.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

const routes: Routes = [
  {
    pathMatch: 'full',
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'profile/:username',
    component: ProfileComponent,
  },
  {
    pathMatch: 'full',
    path: 'friends',
    component: FriendsComponent,
  },
  {
    pathMatch: 'full',
    path: 'leaderboard',
    component: LeaderboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
