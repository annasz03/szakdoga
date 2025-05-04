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
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ForumPostComponent, I18NextModule,MatPaginator],
  templateUrl: './forum-page.component.html',
  styleUrl: './forum-page.component.css'
})
export class ForumPageComponent {

  illnesses: string[] = ["prosztatarák", "megfázás"];
  currentUser:any;
  body:any;
  date:any;
  tag:any;
  searchTag:any;
  searchText:any;

  posts:IPost[]=[];
  filteredPosts:IPost[]=[];

  totalItems = 0;
  pageSize = 5;
  lastVisible: any = null;
  loading = true;


  private authService = inject(AuthService);

  constructor(private dataService: DataService, private firestore: Firestore, private http:HttpClient) {}
  
  ngOnInit(){
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });

    this.loadTotalCount();
    this.loadPosts();
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
        next: (response) => {
          console.log('Sikeres hozzáadás', response);
        }
      });
  }
  

  loadPosts() {
    const requestData = {
      pageSize: this.pageSize,
      lastVisiblePostId: this.lastVisible?.id
    };
  
    this.http.post<{ posts: IPost[], lastVisible: string }>('http://localhost:3000/api/forum-load-posts', requestData)
      .subscribe({
        next: (response) => {
          this.posts = [...this.posts, ...response.posts];
          this.lastVisible = response.lastVisible ? { id: response.lastVisible } : null;
          this.loading = false;
        }
      });
  }
  
  
  loadTotalCount() {
    this.http.get<{ totalCount: number }>('http://localhost:3000/api/forum-total-count')
      .subscribe({
        next: (response) => {
          this.totalItems = response.totalCount;
        }
      });
  }
  onPageChange(event: any) {
    this.loadNextPage();
  }

  loadNextPage() {
    this.http.post<{ posts: IPost[], lastVisible: string }>(
      'http://localhost:3000/api/load-forum-posts-next',
      {
        lastVisiblePostId: this.lastVisible?.id,
        pageSize: this.pageSize
      }
    ).subscribe({
      next: response => {
        if (response.posts.length > 0) {
          this.posts = response.posts;
  
          this.lastVisible = response.lastVisible ? { id: response.lastVisible } : null;
        }
      }
    });
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
