import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Idisease } from './idisease';
import { Observable, tap } from 'rxjs';

export interface DiseaseNames {
  name_hu: string;
  name_en: string;
}

const backendUrl = 'http://localhost:3000/api/';
//const backendUrl = 'https://szakdoga-dlg2.onrender.com/api/';

@Injectable({
  providedIn: 'root'
})
export class DiseaseService {

  constructor(private http:HttpClient) { }

  getDiseaseData(lang:any, diseaseName:any){
    return this.http.get(backendUrl + `diseases/${lang}/${diseaseName}`);
  } 

  getAllSymptoms(lang:any){
    return this.http.post<string[]>(backendUrl + "get-all-symptoms", lang);
  }

  getAllPain(lang:any){
    return this.http.post<string[]>(backendUrl + "get-all-pain", lang);
  }

  getDiseaseDataHu(diseaseId:any){
    return this.http.post<Idisease>(backendUrl + "get-disease-data-hu", {diseaseId:diseaseId});
  }

  getDiseaseDataEn(diseaseId:any){
    return this.http.post<Idisease>(backendUrl + "get-disease-data-en", {diseaseId:diseaseId});
  }

  saveDisease(diseaseData:any, lang:any, diseaseId:any){
    return this.http.post(backendUrl + "save-disease", {diseaseData,lang,diseaseId});
  }

  deleteDisease(diseaseId:any){
    return this.http.post(backendUrl + "delete-disease", { diseaseId });
  }

  loadDiseases(requestData:any){
    return this.http.post<{ diseases: any[], lastVisible: string, totalCount: number }>(backendUrl + "load-diseases", requestData);
  }

  getDiseaseTotalCount(lang:any){
    return this.http.post<{ totalCount: number }>(backendUrl + "disease-total-count",  { lang });
  }

  private diseasesMap: {[key: string]: {name_hu: string, name_en: string}} = {};

   getAllDiseaseNames(): Observable<{ [key: string]: DiseaseNames }> {
    return this.http.get<{ [key: string]: DiseaseNames }>(backendUrl + 'get-all-disease-names').pipe(
        tap(map => this.diseasesMap = map)
      );
  }

  getDiseaseById(id: string): DiseaseNames | undefined {
    return this.diseasesMap[id];
  }
}
