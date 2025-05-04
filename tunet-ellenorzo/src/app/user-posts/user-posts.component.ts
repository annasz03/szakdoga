import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {  Firestore } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { IPost } from '../ipost';
import { CommonModule } from '@angular/common';
import { ForumPostComponent } from '../forum-post/forum-post.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-posts',
  standalone: true,
  imports: [CommonModule, ForumPostComponent],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.css'
})
export class UserPostsComponent {
  currentUserId: string = '';
  displayName: string = '';
  posts: IPost[] = [];
  filteredPosts: IPost[] = [];

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uidFromRoute = params.get('uid');
      if (uidFromRoute) {
        this.currentUserId = uidFromRoute;
        this.getPosts();
      }
    });

    this.authService.user$.subscribe(user => {
      if (user?.uid === this.currentUserId) {
        this.displayName = user.displayName || '';
      }
    });
  }

  getPosts() {
    this.http.post('http://localhost:3000/get-all-posts', {uid:this.currentUserId})
    .subscribe({
          next: () => console.log('adatok'),
    });
  }
}
