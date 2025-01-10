import { Injectable } from '@angular/core';
import { SymptomInterface } from './symptomCheckerData.interface';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  private refresh = new BehaviorSubject<boolean>(false);

    apiUrl = 'http://localhost:3000/';

    constructor(private http: HttpClient){}

    getDiseaseData(diseaseName:string): Observable<any> {
      return this.http.get<any>(this.apiUrl+'diseases/' + `${diseaseName}`);
    }

    symptomCheckerReq(symptomRes: SymptomInterface): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'result', symptomRes);
    }

    getAllDoctor(){
      return this.http.get<any>(this.apiUrl+'doctors');
    }

    getDoctor(id: number){
      return this.http.get<any>(this.apiUrl+`doctors/${id}`);
    }
    
    getAllArea(){
      return this.http.get<any>(this.apiUrl+'area');
    }

    getAllSpec(){
      return this.http.get<any>(this.apiUrl+'spec');
    }

    getAllDoc(uid:string){
      console.log("get all doc")
      return this.http.get<any>(this.apiUrl+'doc/'+ uid);
    }

    uploadDoc(uid:string, doc:any){
      return this.http.post<any>(this.apiUrl+'upload/'+ uid, doc);
    }

    deleteDoc(uid:string, fileName:any){
      return this.http.get<any>(this.apiUrl+'delete/'+uid+"/"+fileName);
    }




    get getRefresh() {
      return this.refresh.asObservable();
    }
    set setRefresh(ref: boolean) {
      this.refresh.next(ref);
    }

}