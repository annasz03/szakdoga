import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [CommonModule,MatTableModule],
  templateUrl: './disease.component.html',
  styleUrl: './disease.component.css'
})
export class DiseaseComponent {

  @Input() diseaseName: any;
  @Input() i:any;
  //betegseg adatai
  res:any = {};

  dataSource: any = {};
  cols: string[] = ['label', 'data'];
  opened=false;

  constructor(private dataService: DataService){}

  //jol kapja meg az adatot
  ngOnInit(){
    this.dataService.getDiseaseData(this.diseaseName).subscribe({
      next:(response) => {
        this.res=response.result[0]
        this.dataSource=this.res.value
      }
    })
  }

  openDiseaseData() {
    this.dataSourceFormatting();
    this.opened=!this.opened;
  }

  dataSourceFormatting() {
    const data = { ...this.dataSource };

    if (data.painful !== undefined) {
      data.painful = data.painful === false ? 'Nem' : 'Igen';
    }

    if (data.painLocation !== undefined && data.painLocation.length === 0) {
      data.painLocation = '-';
    }

    if (data.age !== undefined) {
      delete data.age;
    }

    this.dataSource = data;

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
    return labels[key];
  }

}
