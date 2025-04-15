import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import * as gettextParser from 'gettext-parser';

export class GettextPoLoader implements TranslateLoader {
  constructor(private http: HttpClient, private prefix: string = '/assets/gettext/', private suffix: string = '.po') {}

  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`, { responseType: 'arraybuffer' }).pipe(
      map((buffer) => {
        const parsed: any = gettextParser.po.parse(Buffer.from(buffer));
        const translations: any = {};

        for (const key in parsed.translations['']) {
          if (key.length > 0) {
            translations[key] = parsed.translations[''][key].msgstr[0];
          }
        }

        return translations;
      })
    );
  }
}
