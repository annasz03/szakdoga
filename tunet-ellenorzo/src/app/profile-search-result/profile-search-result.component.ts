import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { Iuser } from '../iuser';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-search-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-search-result.component.html',
  styleUrl: './profile-search-result.component.css'
})
export class ProfileSearchResultComponent {
  name:string = ""

  profiles: Iuser[]=[]
  constructor(private dataService: DataService, private http: HttpClient, private router: Router) {
    this.dataService.getProfileSearch.subscribe(response => {
      this.name = response;
      this.http.post<any>('http://localhost:3000/api/get-user-search', {
        search: this.name
      }).subscribe({
        next: (response) => {
          this.profiles = response.users;
        }
      });
      
    });
  }
  
  goToUserProfile(uid:string) {
    this.router.navigate(['/profile', uid]);
  }
}
