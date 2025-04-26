import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './disease.component.html',
  styleUrls: ['./disease.component.css']
})
export class DiseaseComponent {

  @Input() diseaseName: any;
  @Input() i: any;
  res: any = {};
  dataSource: any[] = [];
  cols: string[] = ['label', 'data'];
  opened = false;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getDiseaseData(this.diseaseName).subscribe({
      next: (response) => {
        this.res = response;
        this.formatDataSource();
      }
    });
  }

  openDiseaseData() {
    this.opened = !this.opened;
  }

  formatDataSource() {
    const data = this.res;
    this.dataSource = [];

  
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this.dataSource.push({
          key: key,
          value: data[key]
        });
      }
    }
    this.dataSourceFormatting();
  }

  dataSourceFormatting() {
    this.dataSource.forEach(item => {
      if (item.key === 'painful') {
        item.value = item.value === false ? 'Nem' : 'Igen';
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
    const labels: { [key: string]: string } = {
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
    };
    return labels[key] || key;
  }
}
