import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserLoggedModel } from 'src/app/models/userLogged.model';
import { GoogleAuthService } from '../../../../../core/auth/google-auth.service';
import { StatusService } from 'src/app/core/services/status.service';

@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.css'],
})
export class TwoFactorAuthComponent {
  @Input() user!: UserLoggedModel;
  showQr: boolean;
  newQr: boolean;

  constructor(
    private readonly googleAuth: GoogleAuthService,
    private readonly status: StatusService
  ) {
    this.showQr = false;
    this.newQr = false;
  }

  // CHECK IF USER 2FA ENABLE AND OPEN NEW QR CODE OR LATEST
  async onEnable2FA() {
    this.showQr = true;
    if (this.user.is2faEnabled === false) {
      await this.googleAuth.getLink(this.user.id).then((response) => {
        this.user.qrcode2fa = response.url.qrUrl;
        this.newQr = true;
      });
    } else {
      this.newQr = false;
    }
  }

  async onConfirm2FA() {
    this.user.is2faEnabled = true;
    await this.status.set2fa(this.user.id, true).then(() => {
      this.showQr = false;
    });
  }

  async onReject2FA() {
    this.user.is2faEnabled = false;
    await this.status.set2fa(this.user.id, false).then(() => {
      this.showQr = false;
    });
  }

  closeQr() {
    this.showQr = false;
  }
}
