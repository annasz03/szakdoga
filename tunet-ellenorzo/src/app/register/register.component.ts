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
    if(this.formatCheck()){
      const rawForm = this.form.getRawValue();
      this.authService.register(rawForm.email, rawForm.username,rawForm.password)
      .subscribe({
        next: ()=> {
        this.router.navigateByUrl('/home')},
      })
    }
  }

  
  formatCheck():boolean{
    const rawForm = this.form.getRawValue();
    if(!rawForm.email.includes("@")){
      this.errorMessage="Nem megfelelő az e-mail cím!";
      return false;
    }else if(!this.isValidPassword(rawForm.password)){
      this.errorMessage="A jelszónak legalább 8 karakter hosszúnak kell lennie és tartalmaznia kell nagy betűt és speciális karaktert!"
      return false;
    }else if(rawForm.username.length===0){
      this.errorMessage="Nem adott meg felhasználónevet!"
      return false;
    }else if(rawForm.birth){
      //TODO: évcheck
      console.log(rawForm.birth)
    }

    return true;
  }

  isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(password);
  }

}
