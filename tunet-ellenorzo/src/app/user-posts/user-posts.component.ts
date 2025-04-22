import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { collection, getDocs, Firestore } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { IPost } from '../ipost';
import { CommonModule } from '@angular/common';
import { ForumPostComponent } from '../forum-post/forum-post.component';

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
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uidFromRoute = params.get('uid');
      console.log(uidFromRoute)
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
    const ref = collection(this.firestore, 'forum_post');
    getDocs(ref).then(snapshot => {
      const postsArray: IPost[] = [];
      snapshot.forEach(doc => {
        const docData = doc.data();
        if (docData && docData["uid"] === this.currentUserId) {
          postsArray.push({
            id: doc.id,
            uid: docData["uid"],
            body: docData["body"],
            date: docData["date"],
            tag: docData["tag"],
            like: docData["like"],
            comment: docData["comment"],
            username: docData["username"],
            likedBy:docData["likedBy"]
          });
        }
      });

      this.posts = postsArray.sort((a, b) => b.date.seconds - a.date.seconds);
      this.filteredPosts = [...this.posts];
      console.log(this.filteredPosts)
    }).catch(error => {
      console.error("Hiba: ", error);
    });
  }
}
