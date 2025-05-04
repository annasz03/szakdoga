import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { Iuser } from '../iuser';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-profile-search-result',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './profile-search-result.component.html',
  styleUrl: './profile-search-result.component.css'
})
export class ProfileSearchResultComponent {
  name: string = "";
  profiles: Iuser[] = [];
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  loading = false;

  constructor(
    private dataService: DataService, 
    private http: HttpClient, 
    private router: Router
  ) {
    this.dataService.getProfileSearch.subscribe(response => {
      this.name = response;
      this.currentPage = 0;
      this.searchUsers();
    });
  }

  searchUsers() {
    this.loading = true;
    this.http.post<any>('http://localhost:3000/api/get-user-search', {
      search: this.name,
      page: this.currentPage + 1,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        this.profiles = response.users;
        this.totalItems = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.searchUsers();
  }

  goToUserProfile(uid: string) {
    this.router.navigate(['/profile', uid]);
  }
}