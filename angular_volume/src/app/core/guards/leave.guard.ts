import type { CanDeactivateFn } from '@angular/router';
import { PongComponent } from 'src/app/game/components/pong/pong.component';

export const LeaveGuard: CanDeactivateFn<PongComponent> = (component: PongComponent) => {
	if (component.scene)
		return confirm('Are you sure you want to leave ? You will lose the match');
 	return true;
};
