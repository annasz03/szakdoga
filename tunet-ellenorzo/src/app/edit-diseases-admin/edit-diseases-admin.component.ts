import { Component, inject, ViewChild } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, setDoc } from '@angular/fire/firestore';
import { LangService } from '../lang-service.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DiseaseComponent } from '../disease/disease.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { first, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { EditDiseaseComponent } from '../edit-disease/edit-disease.component';
import { I18NextModule } from 'angular-i18next';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DiseaseService } from '../disease.service';

@Component({
  selector: 'app-edit-diseases-admin',
  standalone: true,
  imports: [CommonModule,I18NextModule, FormsModule, DiseaseComponent, ReactiveFormsModule, EditDiseaseComponent, MatPaginator],
  templateUrl: './edit-diseases-admin.component.html',
  styleUrls: ['./edit-diseases-admin.component.css']
})
export class EditDiseasesAdminComponent {
  diseaseService = inject(DiseaseService)
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  currentPage = 0;
  pageSize = 5;
  lastVisible: any = null;
  totalDiseases = 0;
  loading = true;
  allDiseases: any[] = [];

  ageLabelHu="Minden korosztály";
  ageLabelEn="All agegroups";

  selectedDiseaseId: string | null = null;
  symptomsH: string[] = [];
  symptomsE: string[] = [];
  painLocationH: string[] = [];
  painLocationE: string[] = [];
  prevention: string[] = [];
  riskFactors: string[] = [];
  treatment: string[] = [];

  diseaseFormHu!: FormGroup;
  diseaseFormEn!: FormGroup;

  arrayName = 'symptoms';
  painLocationName = 'painLocation';
  preventionName = 'prevention';
  riskFactorsName = 'riskFactors';
  treatmentName = 'treatment';
  lang:string="en"
  errorMessage="";

  constructor(private firestore: Firestore, private langService: LangService, private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.langService.currentLang$.subscribe((lang) => {
      this.lang = lang;
      this.resetPagination();
      this.loadTotalCount(lang);
      this.loadDiseases(lang);
      this.loadSymptoms();
      this.loadPainLocation();
    });
    
    
  }

  ngOnInit(): void {
    this.diseaseFormHu = this.initForm('hu');
    this.diseaseFormEn = this.initForm('en');
  }

  ngAfterViewInit() {
    if(this.lang==="hu"){
      this.paginator._intl.itemsPerPageLabel = 'oldalankkénti elemek száma';
    }else{
      this.paginator._intl.itemsPerPageLabel = 'items per page';
    }
  }

  submitDiseases() {
    // magyar
    const formHu = this.diseaseFormHu;
    const formEn = this.diseaseFormEn;

    if (formHu.valid) {
      if(formHu.value.id === formEn.value.id){
        const diseaseDataHu = formHu.value;
        const diseaseIdHu = formHu.get('id')?.value;
        if (diseaseIdHu) {
          this.saveDisease(diseaseDataHu, 'hu', diseaseIdHu);
        }
      }else{
        if (this.lang === 'hu') {
          alert("Nem egyeznek az azonosítók");
        } else {
          alert("The ID's do not match.");
        }
      }
    } else {
      if (this.lang === 'hu') {
        alert("Nem lett teljesen kitöltve az űrlap!");
      } else {
        alert("One of the forms is invalid!");
      }
    }
  
    // angol
    
    if (formEn.valid) {
      if(formHu.value.id === formEn.value.id){
        const diseaseDataEn = formEn.value;
        const diseaseIdEn = formEn.get('id')?.value;
        if (diseaseIdEn) {
          this.saveDisease(diseaseDataEn, 'en', diseaseIdEn);
        }
      }else {
        if (this.lang === 'hu') {
          alert("Nem egyeznek az azonosítók");
        } else {
          alert("The ID's do not match.");
        }
      }
      
    } else {
      if (this.lang === 'hu') {
        alert("Nem lettek teljesen kitöltve az űrlapok!");
      } else {
        alert("One of the forms is invalid!");
      }
    }

    this.loadDiseases(this.lang)
  }
  
  

  initForm(lang: string): FormGroup {
    return this.fb.group({
      id: [''],
      name: ['', Validators.required],
      ageMin: [0],
      ageMax: [999],
      ageLabel: [lang === 'hu' ? 'Minden korosztály' : 'All ages'],
      gender: ['Both'],
      symptoms: this.fb.array([this.fb.control('')]),
      description: [''],
      painful: [false],
      painLocation: this.fb.array([this.fb.control('')]),
      prevention: this.fb.array([this.fb.control('')]),
      riskFactors: this.fb.array([this.fb.control('')]),
      treatment: this.fb.array([this.fb.control('')]),
    });
  }

  onPainfulChange(event: Event, lang: string): void {
    const isPainful = (event.target as HTMLInputElement).checked;
    if (lang === 'hu') {
      if (!isPainful) {
        this.painLocationArrayHu.clear();
      }
    } else if (lang === 'en') {
      if (!isPainful) {
        this.painLocationArrayEn.clear();
      }
    }
  }
  

  async loadSymptoms() {
    this.diseaseService.getAllSymptoms('hu').subscribe({
      next: (symptoms) => {
        this.symptomsH = symptoms;
      }
    });

    this.diseaseService.getAllSymptoms('en').subscribe({
      next: (symptoms) => {
        this.symptomsE = symptoms;
      }
    });

    /*this.http.post<string[]>('http://localhost:3000/api/get-all-symptoms', { lang: 'hu' })
    .subscribe({
      next: (symptoms) => {
        this.symptomsH = symptoms;
      }
    });
    
    this.http.post<string[]>('http://localhost:3000/api/get-all-symptoms', { lang: 'en' })
    .subscribe({
      next: (symptoms) => {
        this.symptomsE = symptoms;
      }});*/
  }

  async loadPainLocation() {
    this.diseaseService.getAllPain('hu').subscribe({
      next: (painList) => {
        this.painLocationH = painList;
      }
    });

    this.diseaseService.getAllPain('en').subscribe({
      next: (painList) => {
        this.painLocationE = painList;
      }
    });

    /*this.http.post<string[]>('http://localhost:3000/api/get-all-pain', { lang: 'hu' })
    .subscribe({
      next: (painList) => {
        this.painLocationH = painList;
      }
    });
    
    this.http.post<string[]>('http://localhost:3000/api/get-all-pain', { lang: 'en' })
    .subscribe({
      next: (painList) => {
        this.painLocationE = painList;
      }
    });*/
  }


  saveDisease(diseaseData: any, lang: string, diseaseId: string): void {
    this.diseaseService.saveDisease(diseaseData, lang, diseaseId).subscribe({
      next: (response) => {
        console.log('saved:', response);
      }
    });

    /*this.http.post('http://localhost:3000/api/save-disease', {diseaseData,lang,diseaseId})
      .subscribe({
        next: (response) => {
          console.log('saved:', response);
        }
      });*/
  }
  

  get symptomsArrayHu(): FormArray {
    return this.diseaseFormHu.get(this.arrayName) as FormArray;
  }

  get symptomsArrayEn(): FormArray {
    return this.diseaseFormEn.get(this.arrayName) as FormArray;
  }

  get painLocationArrayHu(): FormArray {
    return this.diseaseFormHu.get(this.painLocationName) as FormArray;
  }

  get painLocationArrayEn(): FormArray {
    return this.diseaseFormEn.get(this.painLocationName) as FormArray;
  }

  get preventionArrayHu(): FormArray {
    return this.diseaseFormHu.get(this.preventionName) as FormArray;
  }

  get preventionArrayEn(): FormArray {
    return this.diseaseFormEn.get(this.preventionName) as FormArray;
  }

  get riskFactorsArrayHu(): FormArray {
    return this.diseaseFormHu.get(this.riskFactorsName) as FormArray;
  }

  get riskFactorsArrayEn(): FormArray {
    return this.diseaseFormEn.get(this.riskFactorsName) as FormArray;
  }

  get treatmentArrayHu(): FormArray {
    return this.diseaseFormHu.get(this.treatmentName) as FormArray;
  }

  get treatmentArrayEn(): FormArray {
    return this.diseaseFormEn.get(this.treatmentName) as FormArray;
  }

  addControl(array: FormArray): void {
    array.push(this.fb.control(''));
  }

  removeControl(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  onDiseaseDeleted(deletedId: string) {
    this.loadDiseases('hu');
    this.loadDiseases('en');
  }


  /*deleteDisease(diseaseId: string): void {
    this.diseaseService.deleteDisease(diseaseId).subscribe({
      next: (response) => {
        this.loadDiseases('hu');
        this.loadDiseases('en');
      }
    });
  }*/

  async editDisease(diseaseId: string): Promise<void> {
    this.selectedDiseaseId = diseaseId;
  }

  private resetPagination() {
    this.currentPage = 0;
    this.lastVisible = null;
    this.allDiseases = [];
  }

  loadDiseases(lang: string) {
    this.loading = true;
    const requestData = {
      pageSize: this.pageSize,
      lastVisiblePostId: this.currentPage > 0 ? this.lastVisible?.id : null,
      lang: lang
    };
  
    this.diseaseService.loadDiseases(requestData).subscribe({
      next: (response) => {
        this.allDiseases = response.diseases;
        this.lastVisible = response.lastVisible ? { id: response.lastVisible } : null;
        this.totalDiseases = response.totalCount;
        this.loading = false;
      }})
  }

  onPageChange(event: PageEvent) {
    if (event.pageSize !== this.pageSize) {
      this.pageSize = event.pageSize;
      this.currentPage = 0;
      this.lastVisible = null;
    } else {
      this.currentPage = event.pageIndex;
    }
    this.loadDiseases(this.lang);
  }

  loadNextPage() {
    if (this.lastVisible) {
      this.loadDiseases(this.lang);
    }
  }

  loadTotalCount(lang: string) {
    this.diseaseService.getDiseaseTotalCount(lang).subscribe({
      next: (response) => {
        this.totalDiseases = response.totalCount;
      }
    });
  }
  
}
