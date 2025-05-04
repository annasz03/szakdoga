import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LangService {
  private currentLang = new BehaviorSubject<string>('');
  currentLang$ = this.currentLang.asObservable();

  setLanguage(lang: string) {
    this.currentLang.next(lang);
  }

  getLanguage(): string {
    return this.currentLang.getValue();
  }
}
