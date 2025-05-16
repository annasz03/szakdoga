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

  constructor(private resultService: ResultService,private authService: AuthService, private langService: LangService, private http:HttpClient) {}

  ngOnInit() {
    if(this.result===undefined){
      this.errorMessage="Nincs a megadott adatokhoz illeszkedő betegség az adabázisban."
    }else{
      const resultData = this.resultService.getResult();
      this.result = resultData.result;

      this.authService.user$.subscribe((user: any) => {
        this.currentUser = user;
      });

      this.langService.currentLang$.subscribe((lang: string) => {
        this.currentLang = lang;
      });
    }
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
    const doc = new jsPDF();
    const lang = this.currentLang === 'en' ? 'en' : 'hu';
    let title="";
    if(lang==="hu"){
      title = "Eredmények";
    }else{
      title= "Results"
    }
    
    doc.setFontSize(18);
    doc.setFont('Roboto-Regular');
    doc.text(title, 14, 20);
  
    let yPosition = 30;
    const marginBottom = 280;
  
    const diseaseKeys = this.result.map((item: any) => item.key);
    const queryParam = diseaseKeys.join(',');
  
    const response = await fetch(`https://szakdoga-dlg2.onrender.com/export-results?lang=${lang}&keys=${queryParam}`);
    const data = await response.json();
  
    for (const disease of data) {
      if (yPosition > marginBottom) {
        doc.addPage();
        yPosition = 20;
      }
  
      doc.setFontSize(14);
      if(lang==='hu'){
        doc.text(`Betegség neve: ${disease.name}`, 14, yPosition);
      }else {
        doc.text(`Disease: ${disease.name}`, 14, yPosition);
      }
      yPosition += 8;
  
      doc.setFontSize(12);
  
      if (disease.symptoms?.length) {
        if(lang==='hu'){
          doc.text(`Tünetek:`, 14, yPosition);
        }else {
          doc.text(`Symptoms:`, 14, yPosition);
        }
        yPosition += 6;
        doc.text(`  ${disease.symptoms.join(", ")}`, 16, yPosition);
        yPosition += 8;
      }
  
      if (disease.pain) {
        if(lang==='hu'){
          doc.text(`Fájdalom:`, 14, yPosition);
        }else {
          doc.text(`Pain:`, 14, yPosition);
        }
        yPosition += 6;
        doc.text(`  ${disease.pain}`, 20, yPosition);
        yPosition += 8;
      }
  
      if (disease.treatment) {
        if(lang==='hu'){
          doc.text(`Kezelés:`, 14, yPosition);
        }else { 
          doc.text(`Treatment:`, 14, yPosition);
        }
  
        yPosition += 6;
        doc.text(`  ${disease.treatment}`, 16, yPosition);
        yPosition += 8;
      }
  
      if (disease.prevention?.length) {
        if(lang==='hu'){
          doc.text(`Megelőzés:`, 14, yPosition);
        }else {
          doc.text(`Treatment:`, 14, yPosition);
        }
        
        yPosition += 6;
        doc.text(`  ${disease.prevention.join(", ")}`, 16, yPosition);
        yPosition += 8;
      }
  
      if (disease.riskFactors?.length) {
        if(lang==='hu'){
          doc.text(`Kockázati tényezők:`, 14, yPosition);
        }else {
          doc.text(`Risk factors:`, 14, yPosition);
        }
        yPosition += 6;
        doc.text(`  ${disease.riskFactors.join(", ")}`, 16, yPosition);
        yPosition += 8;
      }
  
      yPosition += 4;
    }
  
    doc.save('eredmenyek_betegsegek.pdf');
    
  }
  
  
}
