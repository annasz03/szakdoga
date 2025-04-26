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

  constructor(private resultService: ResultService,private authService: AuthService, private langService: LangService) {}

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
    let tempNames = [];
    for (let index = 0; index < this.result.length; index++) {
      tempNames.push(this.result[index].key);
    }

    const db = getFirestore();
    const resultRef = collection(db, 'savedResults');

    const newDocRef = doc(resultRef);
    setDoc(newDocRef, {
      resultMap: Object.fromEntries(tempNames.map((name, index) => [index + 1, name])),
      timestamp: new Date(),
      uid: this.currentUser.uid
    })
  }

  async exportResult() {
    //nem jol mukodik a tagolas es a öüó javitani kell
    const doc = new jsPDF();
    const title = "Eredmények és Betegségek Adatai";
  
    doc.setFontSize(18);
    doc.text(title, 14, 20);
  
    let yPosition = 30;
  
    const db = getFirestore();
    const diseasesCollection = this.currentLang === 'hu' ? 'diseases_hu' : 'diseases_en';
    const diseasesRef = collection(db, diseasesCollection);
    const querySnapshot = await getDocs(diseasesRef);
  
    querySnapshot.forEach((docSnapshot: any) => {
      const disease = docSnapshot.data();
      const diseaseName = docSnapshot.id;
  
      console.log("disease name:", diseaseName);
  
      if (this.result.some((resultItem: any) => resultItem.key === diseaseName)) {
        const rowText = `Betegség: ${diseaseName}`;
        doc.setFontSize(12);
        doc.text(rowText, 14, yPosition);
        yPosition += 10;
  
        if (disease.symptoms && disease.symptoms.length > 0) {
          const symptoms = `Tünetek: ${disease.symptoms.join(", ")}`;
          doc.text(symptoms, 14, yPosition);
          yPosition += 10;
        }
  
        if (disease.pain) {
          const pain = `Fájdalom: ${disease.pain}`;
          doc.text(pain, 14, yPosition);
          yPosition += 10;
        }
  
        if (disease.treatment) {
          const treatment = `Kezelés: ${disease.treatment}`;
          doc.text(treatment, 14, yPosition);
          yPosition += 10;
        }
  
        if (disease.prevention) {
          const prevention = `Megelőzés: ${disease.prevention.join(", ")}`;
          doc.text(prevention, 14, yPosition);
          yPosition += 10;
        }
  
        if (disease.riskFactors) {
          const riskFactors = `Kockázati tényezők: ${disease.riskFactors.join(", ")}`;
          doc.text(riskFactors, 14, yPosition);
          yPosition += 10;
        }
  
        yPosition += 10;
      }
    });
    doc.save('eredmenyek_betegsegek.pdf');
  }
  
}
