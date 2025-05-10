import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const backendUrl = 'https://szakdoga-dlg2.onrender.com/api/';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http:HttpClient) { }

  getAllDocuments(uid:any){
    return this.http.post<{ user: any }>(backendUrl + "get-all-documents", {uid:uid});
  }

  getAllSharedDocuments(uid:any, docid:any){
    return this.http.post(backendUrl + "get-all-shared-documents", {doctor_id:uid, uid:docid});
  }

  uploadDocument(formData:any){
    return this.http.post(backendUrl + "upload-document", formData);
  }

  sendToDoctor(newDoc:any){
    return this.http.post(backendUrl + "send-to-doctor", newDoc);
  }

  loadTotalCountUID(){
    return this.http.get<{ totalCount: number }>(backendUrl + "load-total-count-uid");
  }

  loadTotalCount(){
    return this.http.get<{ totalCount: number }>(backendUrl + "load-total-count");
  }

  deleteDocument(id:any){
    return this.http.delete(backendUrl + `delete-document/${id}`);
  }
}
