import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDoctorResponse } from './doctorres.interface';
import { Ratings } from './ratings';
const backendUrl = 'http://localhost:3000/api/';
@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(private http:HttpClient) { }

  getSearchedDoctor(searchkey:any){
    return this.http.post<IDoctorResponse[]>(backendUrl + "get-searched-doctors", {searchkey:searchkey});
  }

  loadDoctors(requestData:any){
    return this.http.post<{ doctors: any[], lastVisible: string }>(backendUrl + "load-doctors", requestData);
  }

  loadDoctorUID(requestData:any){
    return this.http.post<{ doctors: any[], lastVisible: string }>(backendUrl + "load-doctors-uid", requestData);
  }

  loadDoctorsNext(id:any, pagesize:any){
    return this.http.post<{ doctors: IDoctorResponse[], lastVisible: string }>(backendUrl + "load-doctors-next", {
      lastVisibleDocId: id,
      pageSize: pagesize
    });
  }

  getRatings(id:any){
    return this.http.get<Ratings[]>(backendUrl + `ratings/${id}`);
  }

  deleteDoctorTemp(id:any){
    return this.http.delete(backendUrl + `doctors_temp/${id}`);
  }

  acceptDoctorTemp(doc:any, username:any){
    return this.http.post(backendUrl + "doctors_temp/accept", {
      doc: doc,
      currentUsername: username
    });
  }

  initData(user:any){
    return this.http.get(backendUrl + "init-data", {
        params: { username: user }
      });
  }

  searchDoctors(nameValue: string, selectedSpec: string, selectedArea: string) {
  return this.http.get(backendUrl + "search-doctors", {
    params: {
      name: nameValue ? nameValue.toLowerCase() : '',
      specialty: selectedSpec,
      city: selectedArea
    }
  });
}

  submitRating(id:any, selectedRating:any, comment:any, uid:any){
    return this.http.post(backendUrl + "submit-rating", {
      doctorId: id,
      rating:  selectedRating,
      comment:  comment,
      createdBy: uid || 'anonymous'
    });
  }

  getDoctorTemp(){
    return this.http.get<any[]>(backendUrl + "doctors-temp");
  }

  postDoctorTemp(newDoc:any){
    return this.http.post(backendUrl + "doctors-temp", newDoc);
  }
}
