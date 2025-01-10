import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  savedDiseases: string[] = [];

  constructor() { }

  public saveData(key: string, value: string) {
    this.savedDiseases.push(value)
    localStorage.setItem(key, String(this.savedDiseases));
  }

  public getData(key: string) {
    return localStorage.getItem(key)
  }

  public removeData(key: string) {
    localStorage.removeItem(key);
  }

  public clearData() {
    localStorage.clear();
  }
}