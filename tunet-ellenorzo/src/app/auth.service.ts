import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, from, map, switchMap } from 'rxjs';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, sendEmailVerification}from '@angular/fire/auth';
import { Auth, GoogleAuthProvider, signInWithPopup, updateProfile, user } from '@angular/fire/auth';
import { UserInterface } from './user.interface';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);

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
    
}
