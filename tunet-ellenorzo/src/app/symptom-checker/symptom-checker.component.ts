import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators, } from '@angular/forms';
import { SymptomInterface } from '../symptomCheckerData.interface';
import { DataService } from '../data.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ResultService } from '../result.service';
import { Router } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import {  Firestore, getDocs } from '@angular/fire/firestore';
import { LangService } from '../lang-service.service';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DiseaseService } from '../disease.service';



@Component({
  selector: 'app-symptom-checker',
  standalone: true,
  imports: [I18NextModule,CommonModule, FormsModule,MatInputModule, MatSelectModule,MatFormFieldModule, ReactiveFormsModule, HttpClientModule,MatAutocompleteModule,MatInputModule, MatIconModule,MatFormFieldModule, MatInputModule],
  templateUrl: './symptom-checker.component.html',
  styleUrls: ['./symptom-checker.component.css'],
})
export class SymptomCheckerComponent {
  diseaseService =inject(DiseaseService)

  fb = inject(FormBuilder);
  errorMessage='';

  filteredSymptoms: string[][] = [];

  personalFromVisible = true;
  isPainful=false;

  symptomRes: SymptomInterface = {
    age: 0,
    gender: 'Nő',
    symptoms: [],
    pain: false,
    painLocation: [],
  };

  symptoms: string[] = [];


  painLocation: string[] = [];

  personalInformation = this.fb.group({
    age: [0, Validators.required],
    gender: ['', Validators.required],
  });

  symptomsForm = this.fb.group({
    symptoms: this.fb.array([], Validators.required),
    pain: ['no', Validators.required],
    painLocation: this.fb.array([], Validators.required),
  });

  constructor(private langService: LangService,private dataService: DataService,private resultService: ResultService, private http: HttpClient, private router:Router, private firestore: Firestore){
    this.langService.currentLang$.subscribe((lang) => {
      this.loadSymptoms(lang);
      this.loadPainLocation(lang);
    });

    this.addSymptom();
    this.addPain();
  }
  

  loadPainLocation(lang: string) {
    this.diseaseService.getAllPain(lang).subscribe({
      next: (painList) => {
        this.painLocation = painList;
      }
    });
  }
  

  get symptomArray(): FormArray {
    return this.symptomsForm.get('symptoms') as FormArray;
  }

  get painLocationArray(): FormArray {
    return this.symptomsForm.get('painLocation') as FormArray;
  }

  onPainChange(event: Event): void {
    let selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue === 'yes') {
      this.isPainful=true
    } else if (selectedValue === 'no') {
      this.isPainful=false;
      this.painLocationArray.clear();
    }
  }

  formVisible() {
    if(this.personalInformation.invalid){
      this.errorMessage="Kérem megfelelően töltse ki a kért adatokat!"
    }else{
      this.errorMessage="";
      this.personalFromVisible = !this.personalFromVisible;
    }
  }

  addSymptom() {
    this.symptomArray.push(this.fb.control('', Validators.required));
  }

  addPain() {
    this.painLocationArray.push(this.fb.control('', Validators.required));
  }

  removePain(index: number): void {
    this.painLocationArray.removeAt(index);
  }

  symptomCheckerResult() {
    const { age, gender } = this.personalInformation.value;
    const { symptoms, pain, painLocation } = this.symptomsForm.value;
  
    this.symptomRes = {
      age: Number(age),
      gender: gender || 'Nő',
      symptoms: symptoms as string[] || [],
      pain: pain === 'yes',
      painLocation:painLocation as string[] || [],
    };
    if(this.symptomRes.symptoms.length===1 && this.symptomRes.symptoms[0]===''){
      this.errorMessage="Kérem megfelelően töltse ki a kért adatokat!"
    }else if(age!<0 || age!>150){
      this.errorMessage="Nem megfelelő az adott életkor!"
    } else {
      this.dataService.symptomCheckerReq(this.symptomRes).subscribe({
        next: (response) => {
          this.resultService.setResult(response);
          this.router.navigateByUrl('/symptom-checker-result');
        }
      });
    }
  }

  goToEditDiseases(){
    this.router.navigate(['/diseases-edit']);
  }

  loadSymptoms(lang: string) {
    this.diseaseService.getAllSymptoms(lang).subscribe({
      next: (symptomList) => {
        this.symptoms = symptomList;
        this.filteredSymptoms = this.symptomArray.controls.map(() => [...this.symptoms]);
      }
    });
  }
  showAllSymptoms(index: number) {
    this.filteredSymptoms[index] = [...this.symptoms];
  }

  filterSymptoms(index: number): void {
    const inputValue = this.symptomArray.at(index).value.toLowerCase();
    this.filteredSymptoms[index] = this.symptoms.filter(symptom =>
      symptom.toLowerCase().includes(inputValue)
    );
  }

  removeSymptom(index: number): void {
    this.symptomArray.removeAt(index);
    this.filteredSymptoms.splice(index, 1);
  }

}
