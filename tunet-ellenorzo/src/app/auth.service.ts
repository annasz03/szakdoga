import { inject, Injectable, signal } from '@angular/core';
import { Observable, from } from 'rxjs';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, sendEmailVerification}from 'firebase/auth';
import { Auth, updateProfile, user } from '@angular/fire/auth';
import { UserInterface } from './user.interface';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);

  register(email: string, username: string, password: string): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.firebaseAuth, email, password)
        .then((response) => {
          const user = response.user;
          return updateProfile(user, { displayName: username })
            .then(() => {
              return sendEmailVerification(user).then(() => {
                console.log('E-mail elküldve!');
                return response;
              });
            });
        })
    );
  }
  

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
  

  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth));
  }
}
