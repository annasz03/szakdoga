import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Iuser } from './iuser';
const backendUrl = 'https://szakdoga-dlg2.onrender.com/api/';
//const backendUrl = 'http://localhost:3000/api/';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }

  getUserData(uid: any){
    return this.http.post<{ user: any }>(backendUrl + "get-user", {uid:uid});
  }

  getProfilePicture(uid: any){
    return this.http.post<{ user: { profilepic: string } }>(backendUrl + "get-user-profile-picture", {uid:uid});
  }

  getUserSearch(search: string, page: number, pageSize: number) {
  return this.http.post<{
    users: Iuser[];
    totalCount: number;
  }>(backendUrl + "get-user-search", {
    search,
    page,
    pageSize
  });
}

  getUsernameById(uid:any){
    return this.http.post<{ username: string }>(backendUrl + "get-username-by-id", {uid:uid});
  }

  getSavedResult(uid:any){
    return this.http.post<{ savedDiseases: string[][] }>(backendUrl + "get-user-saved-results", {uid:uid});
  }

  updateUser(updateData:any){
    return this.http.post<{ user: any }>(backendUrl + "update-user", updateData);
  }

  deleteProfile(uid:any){
    return this.http.post(backendUrl + "delete-user", {uid:uid});
  }

  deleteProfileDoctor(uid:any){
    return this.http.post(backendUrl + "delete-doctor-profile", {uid:uid});
  }

  getUserDataByUsername(displayName:any){
    return this.http.post<{ userId: string, role: string }>(backendUrl + "get-user-data-by-username", {displayName:displayName});
  }

  getDisplayName(uid:any){
    return this.http.post<{ displayName: string }>(backendUrl + "get-profile", {uid:uid});
  }

  getSavedResults(body:any){
    return this.http.post(backendUrl + "saved-results", body);
  }


  uploadProfilePicture(formData:any){
    return this.http.post(backendUrl + "upload-profilepic", formData);
  }
}
