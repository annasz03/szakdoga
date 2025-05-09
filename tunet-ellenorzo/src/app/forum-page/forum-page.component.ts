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
import { ForumService } from '../forum.service';
import { DiseaseService } from '../disease.service';

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
  forumService = inject(ForumService)
  diseaseService = inject(DiseaseService)

  illnesses: Array<{id: string, name: string}> = [];
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
  this.diseaseService.getAllDiseaseNames().subscribe(response => {
    this.illnesses = Object.entries(response).map(([id, names]) => ({
      id: id,
      name: lang === 'hu' ? names.name_hu : names.name_en
    }));
  });
  console.log(this.illnesses)
});

    /*  this.http.post<any>(`http://localhost:3000/api/get-all-disease-names`, { lang }).subscribe({
        next: (response) => {
          this.illnesses = response;
        }
      })
    });*/
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
  
    this.forumService.addPost(postData).subscribe({
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
    this.forumService.getForumPosts({ pageSize: this.pageSize, pageIndex: this.currentPage })
      .subscribe(({ posts, totalCount }) => {
        this.posts = posts;
        this.filteredPosts = posts;
        this.totalItems = totalCount;
        this.loading = false;
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
  
  
  
    
  
  
  

  search() {
    this.filteredPosts = this.posts
      .filter(post => this.searchTag ? post.tag === this.searchTag : true)
      .filter(post => this.searchText
         ? post.body.toLowerCase().includes(this.searchText.toLowerCase())
         : true
      );
    this.totalItems = this.filteredPosts.length;
    this.currentPage = 0;
  }
}
