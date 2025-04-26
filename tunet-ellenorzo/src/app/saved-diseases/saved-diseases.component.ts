import { Component } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DiseaseComponent } from '../disease/disease.component';
import { SavedDisComponent } from '../saved-dis/saved-dis.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-saved-diseases',
  standalone: true,
  imports: [CommonModule, MatTableModule, DiseaseComponent, SavedDisComponent],
  templateUrl: './saved-diseases.component.html',
  styleUrls: ['./saved-diseases.component.css']
})
export class SavedDiseasesComponent {
  savedDiseases: string[][] = [];
  errorMessage: string = "";
  currentUser:any;

  constructor( private firestore: Firestore, private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
        this.currentUser = user;
        this.fetchSavedDiseasesFromFirestore();
    });
  }
  

  fetchSavedDiseasesFromFirestore() {
    const savedResultRef = collection(this.firestore, 'savedResults');
    const q = query(savedResultRef, where('uid', '==', this.currentUser.uid));
  
    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          this.errorMessage = "Nem lett még elmentve!";
          this.savedDiseases = [];
        } else {
          const newSavedDiseases: string[][] = [];
  
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const resultMap = data['resultMap'];
  
            if (Array.isArray(resultMap)) {
              newSavedDiseases.push(resultMap);
            } else if (typeof resultMap === 'object' && resultMap !== null) {
              Object.values(resultMap).forEach((item: any) => {
                if (typeof item === 'string') {
                  newSavedDiseases.push([item]);
                } else if (Array.isArray(item)) {
                  newSavedDiseases.push(item);
                }
              });
            }
          });
  
          this.savedDiseases = newSavedDiseases;
        }
      })
  }
  
  

  openSaved(saved: string[]) {
    console.log("Megnyitott mentett betegség:", saved);
  }
}
