import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, from, map, switchMap } from 'rxjs';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, sendEmailVerification}from '@angular/fire/auth';
import { Auth, GoogleAuthProvider, signInWithPopup, updateProfile, user } from '@angular/fire/auth';
import { UserInterface } from './user.interface';
import { HttpClient } from '@angular/common/http';

//const backendUrl = 'https://szakdoga-dlg2.onrender.com/api/';
const backendUrl = 'https://localhost:3000/api/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);

  constructor(private http:HttpClient){}

  login(email: string, password: string): Observable<UserCredential> {
    return from(
      signInWithEmailAndPassword(this.firebaseAuth, email, password).then((response) => {
        const user = response.user;
  
        if (!user.emailVerified) {
          return signOut(this.firebaseAuth).then(() => {
            throw new Error("Az e-mail cím nincs megerősítve.");
          });
        }
        return response;
      })
    );
  }
  
    logout(): Observable<void>{
      const promise = signOut(this.firebaseAuth);
      return from(promise);
    }

    register(rawForm: any) {
      return this.http.post(backendUrl + "register", {
        email: rawForm.email,
        password: rawForm.password,
        username: rawForm.username,
        birth: rawForm.birth,
        gender: rawForm.gender
      });
    }
    
}
