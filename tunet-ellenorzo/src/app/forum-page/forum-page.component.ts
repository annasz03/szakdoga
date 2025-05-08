import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, query, where, Timestamp} from '@angular/fire/firestore';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { ForumPostComponent } from '../forum-post/forum-post.component';
import { IPost } from '../ipost';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { LangService } from '../lang-service.service';

@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ForumPostComponent, I18NextModule,MatPaginator, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatButtonModule,],
  templateUrl: './forum-page.component.html',
  styleUrl: './forum-page.component.css'
})
export class ForumPageComponent {

  illnesses: string[] = [];
  currentUser:any;
  body:any;
  date:any;
  currentPage = 0;

  tag:any;
  searchTag:any;
  searchText:any;

  posts:IPost[]=[];
  filteredPosts:IPost[]=[];

  totalItems = 0;
  pageSize = 5;
  lastVisible: any = null;
  firstVisible: any = null;
  loading = true;
  currentLang:any;


  private authService = inject(AuthService);

  constructor(private dataService: DataService, private firestore: Firestore, private http:HttpClient, private langService:LangService) {
    this.langService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;

      this.http.post<any>(`http://localhost:3000/api/get-all-disease-names`, { lang }).subscribe({
        next: (response) => {
          this.illnesses = response;
        }
      })
    });
  }
  
  ngOnInit(){
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
    this.loadPosts();
      }
    });
  }

  addPost() {
    const postData = {
      uid: this.currentUser.uid,
      body: this.body,
      tag: this.tag,
      username: this.currentUser.displayName
    };
  
    this.http.post('http://localhost:3000/add-post', postData)
      .subscribe({
        next: () => {
          this.body = '';
          this.tag = '';
          this.lastVisible = null;
          this.posts = [];
          this.loadPosts();
        }
      });
  }
  
  loadPosts() {
    this.posts = [];
    this.loading = true;
  
    const requestData = {
      pageSize: this.pageSize,
      pageIndex: this.currentPage 
    };
  
    this.http.post<{ posts: IPost[], totalCount: number }>(
      'http://localhost:3000/api/forum-load-posts',
      requestData
    ).subscribe({
      next: (response) => {
        console.log('Válasz:', response);
        this.posts = response.posts;
        this.totalItems = response.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Hiba a bejegyzések betöltésekor:', err);
        this.loading = false;
      }
    });
  }
  
  
  onPageChange(event: PageEvent) {
    if (this.pageSize !== event.pageSize) {
      this.currentPage = 0;
    } else {
      this.currentPage = event.pageIndex;
    }
    this.pageSize = event.pageSize;
    this.loadPosts();
  }
  
  
  
    
  
  
  

  search(){
    const filtered: IPost[] = [];

    if (this.searchTag !== "" && this.searchText !== "") {
        filtered.push(...this.posts.filter(post =>
            post.tag===this.searchTag && post.body.includes(this.searchText)
        ));
    } 
    if (this.searchTag !== "" && this.searchText === undefined) {
        filtered.push(...this.posts.filter(post =>
          post.tag===this.searchTag
        ));
    } 
    if (this.searchText !== "" && this.searchTag === undefined) {
        filtered.push(...this.posts.filter(post =>
            post.body.includes(this.searchText)
        ));
    }

    this.posts = filtered;
}

}
