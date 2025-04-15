import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,MatFormFieldModule,MatInputModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']  
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;  
  
  fb = inject(FormBuilder)
  router = inject(Router)
  authService = inject(AuthService)

  form = this.fb.nonNullable.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });

    onSubmit(event:Event): void {
      const rawForm = this.form.getRawValue();
      this.authService.login(rawForm.email, rawForm.password)
      .subscribe({
        next: ()=> {
        this.router.navigateByUrl('/home')},
        error: (err) => {
          console.log("hiba: "+ err)
          this.errorMessage = err.message;
        }
      })
    }

    loginWithGoogle(): void {
      this.authService.loginWithGoogle().subscribe({
        next: () => this.router.navigateByUrl('/home'),
        error: (err) => this.errorMessage = err.message
      });
    }
    
}
