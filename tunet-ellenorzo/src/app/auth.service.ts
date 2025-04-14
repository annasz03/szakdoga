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
    return from(this.loginInternal(email, password));
  }
  
  private async loginInternal(email: string, password: string): Promise<UserCredential> {
    console.log("Bejelentkezés elindult");
    const response = await signInWithEmailAndPassword(this.firebaseAuth, email, password);
    console.log("Bejelentkezés válasz:", response);
  
    const user = response.user;
    console.log("Felhasználó emailVerified:", user.emailVerified); // debug
  
    if (!user.emailVerified) {
      console.log("Email nincs megerősítve, kijelentkezés");
      await signOut(this.firebaseAuth);
      throw new Error("Az e-mail cím nincs megerősítve.");
    }
  
    return response;
  }
  
  
  
  
  
  

  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth));
  }
}
