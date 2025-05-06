import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { LangService } from '../lang-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,MatFormFieldModule,MatInputModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule],
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

    currentLang:any;

    constructor(private langService:LangService){}

    ngOnInit(){
      this.langService.currentLang$.subscribe((lang: string) => {
        this.currentLang = lang;
      });
    }

    onSubmit(): void {
      const rawForm = this.form.getRawValue();
      this.authService.login(rawForm.email, rawForm.password)
      .subscribe({
        next: ()=> {
        this.router.navigateByUrl('/home')},
        error: (err) => {
          if(this.currentLang==='hu'){
            this.errorMessage = "Invalid e-mail cím vagy jelszó!";
          }else{
            this.errorMessage = "Invalid e-mail address or password!";
          }
        }
      })
    }
    
}
