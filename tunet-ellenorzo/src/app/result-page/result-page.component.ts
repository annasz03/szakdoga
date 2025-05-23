import { Component, inject } from '@angular/core';
import { ResultService } from '../result.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';
import { LocalService } from '../local.service';
import { DiseaseComponent } from '../disease/disease.component';
import { AuthService } from '../auth.service';
import { jsPDF } from 'jspdf';
import { LangService } from '../lang-service.service';
import { HttpClient } from '@angular/common/http';
import { I18NextModule } from 'angular-i18next';
import { UserService } from '../user.service';

@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [CommonModule, MatTableModule, DiseaseComponent, I18NextModule],
  templateUrl: './result-page.component.html',
  styleUrls: ['./result-page.component.css']
})
export class ResultPageComponent {
  userService = inject(UserService)

  result:any | undefined=undefined;
  currentUser: any;
  currentLang: string=""
  successMessage="";
  errorMessage="";
  currLang:any;

  constructor(private resultService: ResultService,private authService: AuthService, private langService: LangService, private http:HttpClient) {
    this.langService.currentLang$.subscribe((lang) => {
      this.currLang=lang
    });
  }

  ngOnInit() {
    
      const resultData = this.resultService.getResult();
      this.result = resultData.result;
      if(this.result===undefined){
      if(this.currLang==='hu'){
        this.errorMessage="Nincs a megadott adatokhoz illeszkedő betegség az adabázisban."
      }else {
        this.errorMessage="There isn't any diseases matching these symptoms in the database."
      }
    }

      this.authService.user$.subscribe((user: any) => {
        this.currentUser = user;
      });

      this.langService.currentLang$.subscribe((lang: string) => {
        this.currentLang = lang;
      });
    
  }

  saveResult() {
    const body = {
      result: this.result,
      uid: this.currentUser.uid
    };
    this.userService.getSavedResults(body).subscribe({
      next: () => {
        if(this.currentLang==="en"){
          this.successMessage="Result saved successfully!"
        }else{
          this.successMessage="Eredmény sikeresen mentve!"
        }
      },
    });
  }


    async exportResult() {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        filters: ["ASCIIHexEncode"]
      });
      await this.loadFonts(doc);
      doc.setFont('Roboto-Regular', 'normal');
      const lang = this.currentLang === 'en' ? 'en' : 'hu';
      const title = lang === 'hu' ? "Eredmények" : "Results";
      const margin = { left: 14, right: 14, top: 20, bottom: 280 };
      let yPosition = margin.top;

      doc.setFontSize(18);
      const titleLines = doc.splitTextToSize(title, 180);
      doc.text(titleLines, margin.left, yPosition);
      yPosition += titleLines.length * 10;

      const diseaseKeys = this.result.map((item: any) => item.key);
      const queryParam = diseaseKeys.join(',');
      let symptomsMap: { [key: string]: string } = {};
      
      const response = await fetch(`https://szakdoga-dlg2.onrender.com/export-results?lang=${lang}&keys=${queryParam}`);
      if (lang === 'hu') {
      const resp = await fetch(`https://szakdoga-dlg2.onrender.com/get-all-symptoms-both`);
      const symptomsList: Array<{en: string, hu: string}> = await resp.json();
      symptomsMap = symptomsList.reduce((acc: { [key: string]: string }, curr) => {
        acc[curr.en] = curr.hu;
        return acc;
      }, {});
    }
      const data = await response.json();

      for (const disease of data) {
        if (yPosition > margin.bottom) {
          doc.addPage();
          yPosition = margin.top;
        }
        doc.setFontSize(14);
        const diseaseTitle = lang === 'hu' ? `Betegség neve: ${disease.name}` : `Disease: ${disease.name}`;
        const titleLines = doc.splitTextToSize(diseaseTitle, 180);
        doc.text(titleLines, margin.left, yPosition);
        yPosition += titleLines.length * 7;
    
          if (disease.symptoms?.length) {
        let symptomsText: string;
        if (lang === 'hu') {
          const translated = disease.symptoms.map((s: string) => {
          console.log(`Keresett kulcs: ${s}, Talált érték: ${symptomsMap[s]}`);
          return symptomsMap[s] || s;
        });
          symptomsText = translated.join(', ');
        } else {
          symptomsText = disease.symptoms.join(', ');
        }

        yPosition = this.addSection(
          doc,
          lang === 'hu' ? 'Tünetek:' : 'Symptoms:',
          symptomsText,
          yPosition,
          margin,
          lang
        );
      }
  
      if (disease.treatment) {
        yPosition = this.addSection(
          doc,
          lang === 'hu' ? 'Kezelés:' : 'Treatment:',
          disease.treatment,
          yPosition,
          margin,
          lang
        );
      }
  
      if (disease.prevention?.length) {
        yPosition = this.addSection(
          doc,
          lang === 'hu' ? 'Megelőzés:' : 'Prevention:',
          disease.prevention.join(", "),
          yPosition,
          margin,
          lang
        );
      }
  
      if (disease.riskFactors?.length) {
        yPosition = this.addSection(
          doc,
          lang === 'hu' ? 'Kockázati tényezők:' : 'Risk factors:',
          disease.riskFactors.join(", "),
          yPosition,
          margin,
          lang
        );
      }

      yPosition += 10;
    }
  
    doc.save(lang === 'hu' ? 'eredmenyek.pdf' : 'results.pdf');
  }

  private async loadFonts(doc: jsPDF) {
      const robotoRegular = await fetch('/assets/fonts/Roboto-Regular.ttf')
        .then(res => res.arrayBuffer());
      
      doc.addFileToVFS('Roboto-Regular.ttf', this.arrayBufferToBase64(robotoRegular));
      doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');
      
  }

  private arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private addSection(
    doc: jsPDF,
    label: string,
    content: string,
    yPos: number,
    margin: { left: number; right: number },
    lang: string
  ): number {
    doc.setFontSize(12);
    
    const labelLines = doc.splitTextToSize(label, 180);
    doc.text(labelLines, margin.left, yPos);
    yPos += labelLines.length * 6;
  
    doc.setFontSize(11);
    const contentLines = doc.splitTextToSize(content, 180);
    doc.text(contentLines, margin.left + 4, yPos);
    yPos += contentLines.length * 6 + 8;

    return yPos;
  }
  
  
}
