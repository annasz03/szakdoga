import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, query, where, Timestamp} from '@angular/fire/firestore';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { ForumPostComponent } from '../forum-post/forum-post.component';
import { IPost } from '../ipost';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';

@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ForumPostComponent, I18NextModule],
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

  private authService = inject(AuthService);

  constructor(private dataService: DataService, private firestore: Firestore) {}
  
  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    this.getPosts();
  }

  addPost(){
        const postCollection = collection(this.firestore, 'forum_post');

        this.date = Timestamp.now();

        const newDoc= {
          uid: this.currentUser.uid,
          body: this.body,
          date: this.date,
          tag: this.tag
        }

        addDoc(postCollection,newDoc).then((docref)=>{
          console.log('Sikeres hozzáadás');
            }).catch((error) => {
              console.error('Nem sikerült hozzáadni', error);
        })
  }

  getPosts(){
    const ref = collection(this.firestore, 'forum_post');
    getDocs(ref).then(snapshot => {
      let postsArray: IPost[] = [];
      snapshot.forEach(doc => {
        const docData = doc.data();
        if (docData) {
          postsArray.push({
            id: doc.id,
            uid: docData["uid"],
            body: docData["body"],
            date: docData["date"],
            tag: docData["tag"],
          });
        }
      });
  
      this.posts = postsArray.sort((a, b) => {
        return b.date.seconds - a.date.seconds;
      });
  
      this.filteredPosts = [...this.posts];
    }).catch(error => {
      console.error("Hiba: ", error);
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
