import { Component } from '@angular/core';
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

@Component({
  selector: 'app-edit-diseases-admin',
  standalone: true,
  imports: [CommonModule,I18NextModule, FormsModule, DiseaseComponent, ReactiveFormsModule, EditDiseaseComponent, MatPaginator],
  templateUrl: './edit-diseases-admin.component.html',
  styleUrls: ['./edit-diseases-admin.component.css']
})
export class EditDiseasesAdminComponent {
  currentPage = 0;
  pageSize = 5;
  lastVisible: any = null;
  totalDiseases = 0;
  loading = true;
  allDiseases: any[] = [];

  selectedDiseaseId: string | null = null;
  symptoms: string[] = [];
  painLocation: string[] = [];
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

  constructor(private firestore: Firestore, private langService: LangService, private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.langService.currentLang$.subscribe((lang) => {
      this.lang = lang;
      this.resetPagination();
      this.loadTotalCount(lang);
      this.loadDiseases(lang);
      this.loadSymptoms(lang);
      this.loadPainLocation(lang);
    });
    
    
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.diseaseFormHu = this.initForm('hu');
    this.diseaseFormEn = this.initForm('en');
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
  

  async loadSymptoms(lang: string) {
    this.http.post<string[]>('http://localhost:3000/api/get-all-symptoms', { lang })
    .subscribe({
      next: (symptoms) => {
        this.symptoms = symptoms;
      }
    });
  }

  async loadPainLocation(lang: string) {
    this.http.post<string[]>('http://localhost:3000/api/get-all-pain', { lang })
    .subscribe({
      next: (painList) => {
        this.painLocation = painList;
      }
    });
  }


  

  submitDisease(lang: string): void {
    const form = lang === 'hu' ? this.diseaseFormHu : this.diseaseFormEn;
    if (form.valid) {
      const diseaseData = form.value;
      const diseaseId = form.get('id')?.value;
      if (diseaseId) {
        this.saveDisease(diseaseData, lang, diseaseId);
        console.log(diseaseData);
      }
    }
  }

  saveDisease(diseaseData: any, lang: string, diseaseId: string): void {
    this.http.post('http://localhost:3000/api/save-disease', {diseaseData,lang,diseaseId})
      .subscribe({
        next: (response) => {
          console.log('saved:', response);
        }
      });
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

  deleteDisease(diseaseId: string): void {
    this.http.post('http://localhost:3000/delete-disease', { diseaseId })
      .subscribe({
        next: (response) => {
          this.loadDiseases('hu');
          this.loadDiseases('en');
        }
      });
  }
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
  
    this.http.post<{ diseases: any[], lastVisible: string, totalCount: number }>
      ('http://localhost:3000/api/load-diseases', requestData)
      .subscribe({
        next: (response) => {
          this.allDiseases = response.diseases;
          this.lastVisible = response.lastVisible ? { id: response.lastVisible } : null;
          this.totalDiseases = response.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
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
    this.http.post<{ totalCount: number }>('http://localhost:3000/api/disease-total-count', { lang })
      .subscribe({
        next: (response) => {
          this.totalDiseases = response.totalCount;
        }
      });
  }
  
}
