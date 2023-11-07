import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { SpeedTestService } from 'ng-speed-test';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
})
export class LoadingComponent implements OnInit {
  block: boolean;

  constructor(
    private readonly loader: LoaderService,
    private readonly speedTestService: SpeedTestService
  ) {
    this.block = true;
  }

  async ngOnInit() {
    this.speedTestService.getMbps().subscribe((speed) => {
      console.log('Your speed is ' + speed);
      if (speed > 100) this.block = false;
    });
  }

  checkStatus(): Boolean {
    return this.loader.getStatus();
  }
}
