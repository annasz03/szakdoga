import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore) { }

  async getAreas() {
    const areasRef = collection(this.firestore, 'areas');
    const snapshot = await getDocs(areasRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
