import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-tile',
  templateUrl: './game-tile.component.html',
  styleUrls: ['./game-tile.component.css'],
})
export class GameTileComponent {
  fakeTile = { home: 'mbozzi', away: 'franco', result: '0-0' };

  @Input() game: any;

  constructor() {}
}
