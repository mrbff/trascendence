import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { OAuth2Service } from 'src/app/core/auth/oauth2.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  errorMsg!: string;
  loginForm!: FormGroup;
  private codeSubscription: Subscription;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly Oauth2: OAuth2Service,
    private readonly route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.codeSubscription = new Subscription;
  }

  ngOnInit(): void {
    this.codeSubscription = this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.Oauth2.getAuthCode();
      }
    });
    if (this.auth.getToken() !== '') {
      this.router.navigate(['home']);
    }
  }

  ngOnDestroy(): void {
    this.codeSubscription.unsubscribe();
  }

  on42Auth() {
    this.Oauth2.redirectUser();
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
