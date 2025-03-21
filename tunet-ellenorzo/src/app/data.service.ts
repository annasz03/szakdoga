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