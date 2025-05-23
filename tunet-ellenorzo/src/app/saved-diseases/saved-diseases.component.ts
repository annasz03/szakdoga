import { Component, inject } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DiseaseComponent } from '../disease/disease.component';
import { SavedDisComponent } from '../saved-dis/saved-dis.component';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user.service';

@Component({
  selector: 'app-saved-diseases',
  standalone: true,
  imports: [CommonModule, MatTableModule, DiseaseComponent, SavedDisComponent],
  templateUrl: './saved-diseases.component.html',
  styleUrls: ['./saved-diseases.component.css']
})
export class SavedDiseasesComponent {
  userService = inject(UserService)

  savedDiseases: string[][] = [];
  errorMessage: string = "";
  currentUser:any;

  constructor( private authService: AuthService, private http:HttpClient) {
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
        this.currentUser = user;
        this.getSavedDiseases();
    });
  }
  
  getSavedDiseases() {
    this.userService.getSavedResult(this.currentUser.uid).subscribe({
      next: (response) => {
        this.savedDiseases = response.savedDiseases;
        console.log(this.savedDiseases)
      }
    });
  }
}
