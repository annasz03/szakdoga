import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, RouterModule],
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

  constructor(private firestore: Firestore) {}

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    username: ['', Validators.required],
    birth: ['', Validators.required],
    gender: ['male', Validators.required]
  });

  onSubmit(event: Event): void {
    if (this.formatCheck()) {
      const rawForm = this.form.getRawValue();
      
      this.authService.register(rawForm.email, rawForm.username, rawForm.password).subscribe({
        next: (userCredential) => {          
          const user = userCredential.user;
          const uid = user.uid;

          const userRef = doc(this.firestore, 'users', uid);
          setDoc(userRef, {
            uid: uid,
            email: rawForm.email,
            username: rawForm.username,
            birth: rawForm.birth,
            gender: rawForm.gender,
            documents: [],
          })

          this.router.navigateByUrl('/home');
        },
        error: (error) => {
          console.error("Hiba a regisztráció során:", error);
        }
      });
    }
  }

  formatCheck(): boolean {
    const rawForm = this.form.getRawValue();
    if (!rawForm.email.includes("@")) {
      this.errorMessage = "Nem megfelelő az e-mail cím!";
      return false;
    } else if (!this.isValidPassword(rawForm.password)) {
      this.errorMessage = "A jelszónak legalább 8 karakter hosszúnak kell lennie és tartalmaznia kell nagy betűt és speciális karaktert!";
      return false;
    } else if (rawForm.username.length === 0) {
      this.errorMessage = "Nem adott meg felhasználónevet!";
      return false;
    } else if (!this.isValidDate(rawForm.birth)) {
      this.errorMessage = "Érvénytelen születési év!";
      return false;
    }
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
