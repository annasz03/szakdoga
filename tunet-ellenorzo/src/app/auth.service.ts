import { inject, Injectable, signal } from '@angular/core';
import { Observable, from } from 'rxjs';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';
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
      createUserWithEmailAndPassword(this.firebaseAuth, email, password).then((response) => {
        return updateProfile(response.user, { displayName: username }).then(() => response);
      })
    );
  }

  login(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password).then(() => {}));
  }

  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth));
  }
}
