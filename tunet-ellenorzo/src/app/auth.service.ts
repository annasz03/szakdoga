import { inject, Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Auth, updateProfile, user } from '@angular/fire/auth';
import { UserInterface } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth)
  user$ = user(this.firebaseAuth)
  currentUserSig = signal<UserInterface | null |undefined>(undefined)

  register(email: string, username: string, password: string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((response) => {
        return updateProfile(response.user, { displayName: username });
      })
      .catch((error) => {
        throw error;
      })
    );
  }
  
  login(email:string, password:string): Observable<void>{
    const promise = signInWithEmailAndPassword(this.firebaseAuth,email, password).then(()=> {});
    return from(promise);
  }

  logout(): Observable<void>{
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }
}
