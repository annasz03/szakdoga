import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export class PoTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix: string = '/assets/i18n/',
    private suffix: string = '.po'
  ) {}

  getTranslation(lang: string): Observable<Record<string, string>> {
    const path = `${this.prefix}${lang}${this.suffix}`;
    return this.http.get(path, { responseType: 'text' }).pipe(
      map(text => this.parsePo(text))
    );
  }

  private parsePo(po: string): Record<string, string> {
    const translations: Record<string, string> = {};
    // Egyszerű regex a msgid/msgstr párokra
    const pattern = /msgid\s+"([^"]+)"\s+msgstr\s+"([^"]*)"/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(po)) !== null) {
      translations[match[1]] = match[2];
    }
    return translations;
  }
}
