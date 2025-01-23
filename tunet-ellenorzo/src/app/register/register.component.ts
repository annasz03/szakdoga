import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-register',
  standalone:true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,MatFormFieldModule, MatInputModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  fb = inject(FormBuilder)
  router = inject(Router)
  authService = inject(AuthService)

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    username: ['', Validators.required],
    birth: ['', Validators.required],
    gender: ['', Validators.required]
  });
  

  onSubmit(event:Event): void {
    const rawForm = this.form.getRawValue();
    this.authService.register(rawForm.email, rawForm.username,rawForm.password)
    .subscribe({
      next: ()=> {
      this.router.navigateByUrl('/home')},
      error: (err) => {
        this.errorMessage = err.code;
      }
    })
  }

}
