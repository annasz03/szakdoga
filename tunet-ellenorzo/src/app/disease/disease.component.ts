import { Component, inject, Input } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { LangService } from '../lang-service.service';
import { DiseaseService } from '../disease.service';

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './disease.component.html',
  styleUrls: ['./disease.component.css']
})
export class DiseaseComponent {
  diseaseService = inject(DiseaseService)

  @Input() diseaseName: any;
  @Input() i: any;
  res: any = {};
  dataSource: any[] = [];
  cols: string[] = ['label', 'data'];
  opened = false;
  lang:string = ""

  constructor(private langService:LangService) {
    this.langService.currentLang$.subscribe((lang) => {
      this.lang=lang
    });
  }

  ngOnInit() {
    this.diseaseService.getDiseaseData(this.lang, this.diseaseName).subscribe({
      next: (response) => {
        this.res = response;
        this.formatDataSource();
      }
    })
  }
  

  openDiseaseData() {
    this.opened = !this.opened;
  }

  formatDataSource() {
  const data = this.res;
  this.dataSource = [];

  for (const key in data) {
    if (
      key === 'id' ||
      key === 'age' ||
      data[key] === undefined ||
      data[key] === null ||
      (typeof data[key] === 'string' && data[key].trim() === '')
    ) {
      continue;
    }


    this.dataSource.push({
      key: key,
      value: data[key]
    });
  }

  this.dataSourceFormatting();
}


  dataSourceFormatting() {
    this.dataSource.forEach(item => {
      if (item.key === 'painful') {
        if(item.value === false){
          item.value='Nem'
        }else {
          item.value='Igen'
        }
      }

      if (item.key === 'painLocation' && item.value.length === 0) {
        item.value = '-';
      }

      if (item.key === 'age') {
        item.value = ''
      }
    });
  }

  getName(key: string): string {
    const labels: { [lang: string]: { [key: string]: string } } = {
      hu: {
        name: 'Név: ',
        ageLabel: 'Korosztály: ',
        gender: 'Nem: ',
        symptoms: 'Tünetek: ',
        associatedDiseases: 'Vele járó betegségek: ',
        description: 'Leírás: ',
        causes: 'Kiváltó okok: ',
        prevention: 'Megelőzés: ',
        treatment: 'Gyógymód: ',
        riskFactors: 'Kockázati faktorok: ',
        painful: 'Fájdalmas: ',
        painLocation: 'Fájdalom helye: ',
      },
      en: {
        name: 'Name: ',
        ageLabel: 'Age groups: ',
        gender: 'Gender: ',
        symptoms: 'Symptoms: ',
        associatedDiseases: 'Associated diseases: ',
        description: 'Description: ',
        causes: 'Causes: ',
        prevention: 'Prevention: ',
        treatment: 'Treatment: ',
        riskFactors: 'Risk factors: ',
        painful: 'Painful: ',
        painLocation: 'Pain location: ',
      }
    };
  
    return labels[this.lang]?.[key] || key;
  }
  
}
