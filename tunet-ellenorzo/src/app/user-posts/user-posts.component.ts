import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {  Firestore } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { IPost } from '../ipost';
import { CommonModule } from '@angular/common';
import { ForumPostComponent } from '../forum-post/forum-post.component';
import { HttpClient } from '@angular/common/http';
import { LangService } from '../lang-service.service';
import { UserService } from '../user.service';
import { ForumService } from '../forum.service';

@Component({
  selector: 'app-user-posts',
  standalone: true,
  imports: [CommonModule, ForumPostComponent],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.css'
})
export class UserPostsComponent {
  forumService = inject(ForumService)

  currentUserId: string = '';
  displayName: string = '';
  posts: IPost[] = [];
  filteredPosts: IPost[] = [];
  errorMessage="";
  currLang:any;

  constructor(private route: ActivatedRoute,private firestore: Firestore,private authService: AuthService,private http: HttpClient, private langService:LangService) {
    this.route.paramMap.subscribe(params => {
      const uidFromRoute = params.get('uid');
      if (uidFromRoute) {
        this.currentUserId = uidFromRoute;
      }
    });

    this.authService.user$.subscribe(user => {
      if (user?.uid === this.currentUserId) {
        this.displayName = user.displayName || '';
        this.getPosts();
      }
    });

    this.langService.currentLang$.subscribe((lang) => {
      this.currLang=lang
    });
  }

getPosts() {
  this.forumService.getAllPosts(this.currentUserId).subscribe({
    next: (response) => {
      this.posts = response.filter(post => !!post?.uid);
      if (this.posts.length === 0) {
      }
    }
  });
  }

  handlePostDeleted(postid: string) {
    this.getPosts(); 
  } 
}
