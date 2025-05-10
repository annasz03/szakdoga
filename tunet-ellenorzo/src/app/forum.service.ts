import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPost } from './ipost';
import { IComment } from './icomment';
const backendUrl = 'https://szakdoga-dlg2.onrender.com/api/';
//const backendUrl = 'http://localhost:3000/api/';
@Injectable({
  providedIn: 'root'
})
export class ForumService {

  constructor(private http:HttpClient) { }

  getAllPosts(uid:any){
    return this.http.post<IPost[]>(backendUrl + "get-all-posts", {uid:uid});
  }

  getComments(postid:any){
    return this.http.post<{ comments: IComment[] }>(backendUrl + "load-comments", {postid:postid});
  }

  addComments(commentData:any){
    return this.http.post(backendUrl + "add-comment", commentData);
  }

  likePost(likeData:any){
    return this.http.post(backendUrl + "like-post", likeData);
  }

  updateCommentCount(postData:any){
    return this.http.post(backendUrl + "update-comment-count", postData);
  }

  addPost(postData:any){
    return this.http.post(backendUrl + "add-post", postData);
  }

  getForumPosts(requestData:any){
    return this.http.post<{ posts: IPost[], totalCount: number }>(backendUrl + "forum-load-posts", requestData);
  }

  deletePost(postid:any){
    return this.http.delete(backendUrl + `delete-post/${postid}`);
  }

  deleteComment(postid:any, commentid:any){
    return this.http.delete(backendUrl + `delete-comment/${postid}/${commentid}`);
  }
}
