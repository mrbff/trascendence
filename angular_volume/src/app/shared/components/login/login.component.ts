import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { OAuth2Service } from 'src/app/core/auth/oauth2.service';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/core/services/socket.service';
import { GoogleAuthService } from 'src/app/core/auth/google-auth.service';
import { CodeService } from '../../services/code.service';
import { StatusService } from 'src/app/core/services/status.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMsg!: string;
  openPopUp: boolean;
  secret2fa: string;
  private subs: Subscription;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly Oauth2: OAuth2Service,
    private readonly route: ActivatedRoute,
    private readonly socketService: SocketService,
    private readonly googleAuth: GoogleAuthService,
    private readonly codeService: CodeService,
    private readonly status: StatusService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.subs = new Subscription();
    this.openPopUp = false;
    this.secret2fa = '';
  }

  ngOnInit(): void {
    // SUBSCRIBE FOR REDIRECT MESSAGE FROM SOCKET (OBSERVABLE)
    this.subs.add(
      this.socketService.onTextMessage().subscribe({
        next: (response) => {
          this.Oauth2.redirectUser(response as string);
        },
        error: () => {
          this.errorMsg = `42 Api error. Try again`;
        },
      })
    );
    // CHECK IF CODE IN URL QUERY (OBSERVABLE)
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        const code = params['code'];
        if (code) {
          this.onAuth42(code);
        }
      })
    );
  }

  // NO LEAKS
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // REDIRECT FROM SOCKET
  on42AuthClick() {
    this.socketService.sendMessageRequest();
  }

  //SEND CODE TO BACKEND FOR 42 API WORKFLOW
  private onAuth42(code: string) {
    this.Oauth2.codeForAccessToken(code)
      .then((response) => {
        this.loginFlow(response);
      })
      .catch(() => {
        this.errorMsg = `42 Api error. Try again`;
        this.router.navigate(['/login']);
      });
  }

  onSubmit() {
    if (this.isFieldEmpty('email')) {
      this.errorMsg = 'Insert Email';
    } else if (this.loginForm.get('email')?.hasError('email')) {
      this.errorMsg = 'Insert Valid Email';
    } else if (this.isFieldEmpty('password')) {
      this.errorMsg = 'Insert Password';
    } else {
      this.errorMsg = '';
      this.userService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .then((response) => {
          this.loginFlow(response);
          this.loginForm.reset();
        })
        .catch(() => {
          this.errorMsg = 'Invalid credentials';
          this.loginForm.reset();
        });
    }
  }

  // IF NOT USERNAME AWAIT CODE FROM CHILD AND GOOGLE 2FA
  private async loginFlow(response: any) {
    if (!response.username) {
      this.openPopUp = true;
      const code = await this.codeService.emitCode();
      await this.googleAuth.validate2fa(response.id, code).then((response) => {
        if (response.status === 401) {
          this.errorMsg = 'Invalid code';
          return;
        }
        this.initUser(response);
      });
    } else {
      this.initUser(response);
    }
  }

  // USER INFO => COOKIE
  private initUser(response: any) {
    this.auth.saveToken(response.accessToken);
    this.userService.setUserId(this.auth.decodeToken(response.accessToken));
    this.userService.setUser(response.username);
    this.status.setStatus(this.userService.getUserId(), true);
    this.userService.getUserInfo().then(async (resp) => {
      // IF NO PROFILE IMAGE SET DEFAULT
      if (resp.img === '') {
        const img =
          'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
        await this.userService.setUserAvatar(resp.id, img);
      }
    });
    this.router.navigate(['/trascendence/home/']);
  }

  private isFieldEmpty(field: string): boolean {
    return this.loginForm.get(field)?.hasError('required') || false;
  }
}
