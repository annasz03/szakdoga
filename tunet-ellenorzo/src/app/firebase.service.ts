import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore,  } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore, private http:HttpClient) { }

  
}
