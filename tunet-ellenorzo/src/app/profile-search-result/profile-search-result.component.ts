import { Component, inject, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { Iuser } from '../iuser';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LangService } from '../lang-service.service';
import { UserService } from '../user.service';
import { I18NextModule } from 'angular-i18next';

@Component({
  selector: 'app-profile-search-result',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule,I18NextModule],
  templateUrl: './profile-search-result.component.html',
  styleUrl: './profile-search-result.component.css',
})
export class ProfileSearchResultComponent extends MatPaginatorIntl {
  userService = inject(UserService)
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  name: string = "";
  profiles: Iuser[] = [];
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  loading = false;
  currentLang:any

  constructor(private dataService: DataService, private router: Router, private langService: LangService){
    super();
    this.dataService.getProfileSearch.subscribe(name => {
      this.name = name;
      this.currentPage = 0;
      this.searchUsers();
    });
    this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  ngAfterViewInit() {
    if(this.currentLang==="hu"){
      this.paginator._intl.itemsPerPageLabel = 'oldalankkénti elemek száma';
    }else{
      this.paginator._intl.itemsPerPageLabel = 'items per page';
    }
  }

  searchUsers() {
    this.loading = true;

    this.userService.getUserSearch(
      this.name,
      this.currentPage,
      this.pageSize).subscribe({
        next: ({ users, totalCount }) => {
          this.profiles   = users;
          this.totalItems = totalCount;
          this.loading    = false;
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