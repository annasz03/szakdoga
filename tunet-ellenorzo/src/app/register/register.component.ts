import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Firestore, addDoc, collection, doc, setDoc } from '@angular/fire/firestore';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LangService } from '../lang-service.service';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,MatRadioModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, RouterModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  dialog = inject(MatDialog);
  lang:any;

  constructor(private langService:LangService,) {
    this.langService.currentLang$.subscribe((lang) => {
      this.lang=lang
    });
  }
  

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    username: ['', Validators.required],
    birth: ['', Validators.required],
    gender: ['male', Validators.required]
  });

  onSubmit(event: Event): void {
      if (this.form.invalid || !this.formatCheck()) {
        this.errorMessage = this.errorMessage || (this.lang === 'en' ? 'Please fill all fields!' : 'Kérjük, töltsön ki minden mezőt!');
        return;
      }

    const rawForm = this.form.getRawValue();

    this.authService.register(rawForm).subscribe({
      next: (response: any) => {
        this.dialog.open(ValidateDialog);
        this.router.navigate(['/login']);
      }
    });
  }
    

    formatCheck(): boolean {
      const rawForm = this.form.getRawValue();
      if (!rawForm.email.includes('@')) {
        if (this.lang === 'en') {
          this.errorMessage = 'Incorrect email format!';
        } else {
          this.errorMessage = 'Nem megfelelő az e-mail cím!';
        }
        return false;
      }
      if (!this.isValidPassword(rawForm.password)) {
        if (this.lang === 'en') {
          this.errorMessage =
            'Password must be at least 8 characters long and contain an uppercase letter and a special character!';
        } else {
          this.errorMessage =
            'A jelszónak legalább 8 karakter hosszúnak kell lennie és tartalmaznia kell nagy betűt és speciális karaktert!';
        }
        return false;
      }
      if (rawForm.username.trim().length === 0) {
        if (this.lang === 'en') {
          this.errorMessage = 'Username is required!';
        } else {
          this.errorMessage = 'Nem adott meg felhasználónevet!';
        }
        return false;
      }
      if (!this.isValidDate(rawForm.birth)) {
        if (this.lang === 'en') {
          this.errorMessage = 'Invalid birth date!';
        } else {
          this.errorMessage = 'Érvénytelen születési év!';
        }
        return false;
      }
      this.errorMessage = '';
      return true;
    }
    

  isValidDate(date: string) {
    const year = parseInt(date.substring(0, 4), 10);
    return year > 1900 && year < 2025;
  }

  isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(password);
  }
}


@Component({
  selector: 'app-validate-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, TranslateModule],
  templateUrl: './validate-dialog.component.html',
  styleUrl: './register.component.css',
})
export class ValidateDialog {
  dialogRef = inject(MatDialogRef<ValidateDialog>);
  
  close() {
    this.dialogRef.close();
  }
}