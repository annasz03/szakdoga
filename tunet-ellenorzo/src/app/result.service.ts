import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResultService {
  private result: any;

  setResult(data: any): void {
    this.result = data;
  }

  getResult(): any {
    return this.result;
  }
}
