import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

class MockAuthService {
  login(email: string, password: string) {
    return of({});
  }
}

class MockRouter {
  navigateByUrl(url: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        RouterTestingModule,
        TranslateModule.forRoot(), // A fordítást teszteléshez mockolni kell
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.login and navigate to /home on successful login', () => {
    spyOn(authService, 'login').and.callThrough();
    spyOn(router, 'navigateByUrl');

    component.form.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit(new Event('submit'));

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('should set errorMessage when login fails', () => {
    spyOn(authService, 'login').and.returnValue(throwError(() => new Error('Login failed')));
    
    component.form.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit(new Event('submit'));

    expect(component.errorMessage).toBe('Login failed');
  });

  it('should display form validation error message when form is invalid', () => {
    component.form.setValue({
      email: '',
      password: '',
    });
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.triggerEventHandler('click', null);

    fixture.detectChanges();
    
    const emailError = fixture.debugElement.query(By.css('.email-error'));
    const passwordError = fixture.debugElement.query(By.css('.password-error'));

    expect(emailError).toBeTruthy();
    expect(passwordError).toBeTruthy();
  });
});
