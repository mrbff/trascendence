import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { OAuth2Service } from 'src/app/core/auth/oauth2.service';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/core/services/socket.service';
import { GoogleAuthService } from 'src/app/core/auth/google-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMsg!: string;
  private subscription: Subscription;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly Oauth2: OAuth2Service,
    private readonly route: ActivatedRoute,
    private readonly socketService: SocketService,
    private readonly googleAuth: GoogleAuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    // SUBSCRIBE FOR REDIRECT MESSAGE FROM SOCKET (OBSERVABLE)
    this.subscription.add(
      this.socketService.onTextMessage().subscribe({
        next: (response) => {
          this.Oauth2.redirectUser(response as string);
        },
        error: (error) => {
          console.error(error);
        },
      })
    );
    // CHECK IF CODE IN URL QUERY
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        this.onAuth42(code);
      }
    });
    // STOP USER GET BACK TO LOGIN
    if (this.auth.getToken()) {
      this.router.navigate(['home']);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  on42AuthClick() {
    this.socketService.sendMessageRequest();
  }

  //SEND CODE TO BACKEND FOR 42 API WORKFLOW (PROMISE)
  private onAuth42(code: string) {
    this.Oauth2.codeForAccessToken(code)
      .then((response) => {
        this.initUser(response);
        this.router.navigate(['home']);
      })
      .catch(() => {
        this.errorMsg = `42 Api error. Try again`;
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
      this.onLogin(this.loginForm.value);
    }
  }

  private async onLogin(formValue: any) {
    this.userService
      .login(formValue.email, formValue.password)
      .then((response) => {
        this.initUser(response);
        this.loginForm.reset();
        this.router.navigate(['home']);
      })
      .catch(() => {
        this.errorMsg = 'Invalid credentials';
        this.loginForm.reset();
      });
  }

  private initUser(response: any) {
    if (response.id !== '') {
    }
    this.auth.saveToken(response.accessToken);
    this.userService.setUserId(this.auth.decodeToken(response.accessToken));
    this.userService.setUser(response.username);
  }

  private isFieldEmpty(field: string): boolean {
    return this.loginForm.get(field)?.hasError('required') || false;
  }
}
