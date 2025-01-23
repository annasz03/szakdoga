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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';



@Component({
  selector: 'app-symptom-checker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,MatAutocompleteModule,MatInputModule,MatFormFieldModule, MatInputModule],
  templateUrl: './symptom-checker.component.html',
  styleUrls: ['./symptom-checker.component.css'],
})
export class SymptomCheckerComponent {
  fb = inject(FormBuilder);
  errorMessage='';

  filteredSymptoms: string[] = [];

  personalFromVisible = true;
  isPainful=false;

  symptomRes: SymptomInterface = {
    age: 0,
    gender: 'Nő',
    symptoms: [],
    pain: false,
    painLocation: [],
  };

  symptoms = [
    'orrfolyás',
    'torokfájás',
    'köhögés',
    'hőemelkedés',
    'tüsszögés',
    'véres vizelet',
    'gyakori vizelet',
    'fájdalmas ürítés',
  ];

  painLocation = [
    'fej',
    'arc',
    'nyak',
    'gerinc',
    'váll',
    'felkar',
    'alkar',
    'kéz',
    'ujj',
    'mellkas',
    'has',
    'comb',
    'láb',
    'medence'
  ];

  personalInformation = this.fb.group({
    age: [0, Validators.required],
    gender: ['', Validators.required],
  });

  symptomsForm = this.fb.group({
    symptoms: this.fb.array([], Validators.required),
    pain: ['no', Validators.required],
    painLocation: this.fb.array([], Validators.required),
  });

  constructor(private dataService: DataService,private resultService: ResultService, private http: HttpClient, private router:Router){
    this.addSymptom();
    this.addPain();
    this.filteredSymptoms = this.symptoms.slice();
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
      this.errorMessage="nem jo adatok"
    }else{
      this.personalFromVisible = !this.personalFromVisible;
    }
  }

  addSymptom() {
    this.symptomArray.push(this.fb.control('', Validators.required));
  }

  removeSymptom(index: number): void {
    this.symptomArray.removeAt(index);
    this.filteredSymptoms.splice(index, 1);
  }

  addPain() {
    this.painLocationArray.push(this.fb.control('', Validators.required));
    this.filteredSymptoms = [...this.symptoms];
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
  
    this.dataService.symptomCheckerReq(this.symptomRes).subscribe({
      next: (response) => {
        this.resultService.setResult(response);
        this.router.navigateByUrl('/symptom-checker-result');
      }, error: (err) => {
        this.errorMessage = err;
      }
    });
  }

  filterSymptoms(index: number): void {
    const inputValue = this.symptomArray.at(index).value.toLowerCase();
    this.filteredSymptoms = this.symptoms.filter((symptom) =>
      symptom.toLowerCase().includes(inputValue)
    );
  }
  
  
  
}
