import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { PongComponent } from './game/components/pong/pong.component';
import { LeaveGuard } from './core/guards/leave.guard';

const routes: Routes = [
  {
    path: 'trascendence',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/features-routing.module').then(
        (mod) => mod.FeaturesRoutingModule
      ),
  },
  {
    path: '',
    canActivate: [loginGuard],
    loadChildren: () =>
      import('./shared/shared-routing.module').then(
        (mod) => mod.SharedRoutingModule
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
  {
    path: 'trascendence/pong',
    component: PongComponent,
    canDeactivate: [LeaveGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
