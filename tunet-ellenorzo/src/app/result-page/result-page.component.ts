import { Component } from '@angular/core';
import { ResultService } from '../result.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';
import { LocalService } from '../local.service';
import { DiseaseComponent } from '../disease/disease.component';
import { collection, doc, getFirestore, setDoc, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../auth.service';
import { jsPDF } from 'jspdf';
import { LangService } from '../lang-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [CommonModule, MatTableModule, DiseaseComponent],
  templateUrl: './result-page.component.html',
  styleUrls: ['./result-page.component.css']
})
export class ResultPageComponent {
  result: any;
  currentUser: any;
  currentLang: string=""

  constructor(private resultService: ResultService,private authService: AuthService, private langService: LangService, private http:HttpClient) {}

  ngOnInit() {
    const resultData = this.resultService.getResult();

    if (resultData && resultData.result) {
      this.result = resultData.result;
    } else {
      this.result = [];
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
    
    this.http.post('http://localhost:3000/saved-results', body).subscribe({
      next: () => console.log('success'),
    });
  }

  async exportResult() {
    const doc = new jsPDF();
    const title = "Eredmények és Betegségek Adatai";
    doc.setFontSize(18);
    doc.text(title, 14, 20);
  
    let yPosition = 30;
  
    const diseaseKeys = this.result.map((item: any) => item.key);
    const queryParam = diseaseKeys.join(',');
  
    const lang = this.currentLang === 'en' ? 'en' : 'hu';
  
    const response = await fetch(`http://localhost:3000/export-results?lang=${lang}&keys=${queryParam}`);
    const data = await response.json();
  
    for (const disease of data) {
      doc.setFontSize(12);
      doc.text(`Betegség: ${disease.id}`, 14, yPosition);
      yPosition += 10;
  
      if (disease.symptoms?.length) {
        doc.text(`Tünetek: ${disease.symptoms.join(", ")}`, 14, yPosition);
        yPosition += 10;
      }
  
      if (disease.pain) {
        doc.text(`Fájdalom: ${disease.pain}`, 14, yPosition);
        yPosition += 10;
      }
  
      if (disease.treatment) {
        doc.text(`Kezelés: ${disease.treatment}`, 14, yPosition);
        yPosition += 10;
      }
  
      if (disease.prevention?.length) {
        doc.text(`Megelőzés: ${disease.prevention.join(", ")}`, 14, yPosition);
        yPosition += 10;
      }
  
      if (disease.riskFactors?.length) {
        doc.text(`Kockázati tényezők: ${disease.riskFactors.join(", ")}`, 14, yPosition);
        yPosition += 10;
      }
  
      yPosition += 10;
    }
  
    doc.save('eredmenyek_betegsegek.pdf');
  }
  
}
