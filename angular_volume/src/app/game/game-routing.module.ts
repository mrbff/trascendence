import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PongComponent } from './components/pong/pong.component';
import { LeaveGuard } from '../core/guards/leave.guard';

const routes: Routes = [
  {
    pathMatch: 'full',
    path: '',
    component: PongComponent,
	canDeactivate: [LeaveGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
