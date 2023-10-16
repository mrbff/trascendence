import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { OAuth2Service } from 'src/app/core/auth/oauth2.service';
import { SocketService } from '../../../socket.service';
import { Subscription } from 'rxjs';

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
    private socketService: SocketService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    // SUBSCRIBE FOR REDIRECT MESSAGE (OBSERVABLE)
    this.subscription.add(
      this.socketService.onTextMessage().subscribe({
        next: (response) => {
          console.log(response);
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

  //SEND CODE TO BACKEND FOR 42 API WORKFLOW (PROMISE)
  private onAuth42(code: string) {
    this.Oauth2.codeForAccessToken(code)
      .then((response) => {
        this.auth.saveToken(response.accessToken);
        this.userService.setUserId(this.auth.decodeToken(response.accessToken));
        this.userService.setUser(response.username);
        //this.userService.setUserAvatar(response.image.link);
        this.router.navigate(['home']);
      })
      .catch(() => {
        this.errorMsg = `42 Api error. Try again`;
      });
  }

  on42AuthClick() {
    this.socketService.sendMessageRequest();
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
        this.auth.saveToken(response.accessToken);
        this.userService.setUser(response.username);
        this.loginForm.reset();
        this.router.navigate(['home']);
      })
      .catch(() => {
        this.errorMsg = 'Invalid credentials';
        this.loginForm.reset();
      });
  }

  private isFieldEmpty(field: string): boolean {
    return this.loginForm.get(field)?.hasError('required') || false;
  }
}
