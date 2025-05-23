import { HttpClient } from "@angular/common/http";
import { Component, inject, Input } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, ReactiveFormsModule, FormControl } from "@angular/forms";
import { Idisease } from "../idisease";
import { LangService } from "../lang-service.service";
import { CommonModule } from "@angular/common";
import { I18NextModule } from "angular-i18next";
import { DiseaseService } from "../disease.service";

@Component({
  selector: 'app-edit-disease',
  templateUrl: './edit-disease.component.html',
  styleUrls: ['./edit-disease.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, I18NextModule]
})
export class EditDiseaseComponent {
  //vegul nem lett hasznalva
  diseaseService =inject(DiseaseService)
  @Input() diseaseId: any;

  diseaseFormHu!: FormGroup;
  diseaseFormEn!: FormGroup;

  symptoms: string[] = [];
  painLocation: string[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private langService: LangService) {
    this.langService.currentLang$.subscribe((lang) => {
      this.loadSymptoms(lang);
      this.loadPainLocation(lang);
    });
  }

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  initForms() {
    const formStructure = {
      name: [''],
      description: [''],
      gender: ['Both'],
      ageMin: [0],
      ageMax: [999],
      ageLabel: [''],
      associatedDiseases: this.fb.array([]),
      causes: this.fb.array([]),
      painLocation: this.fb.array([]),
      prevention: this.fb.array([]),
      riskFactors: this.fb.array([]),
      symptoms: this.fb.array([]),
      treatment: this.fb.array([]),
      painful: [false]
    };

    this.diseaseFormHu = this.fb.group({...formStructure});
    this.diseaseFormEn = this.fb.group({...formStructure});
  }

  loadData() {
    this.diseaseService.getDiseaseDataHu(this.diseaseId).subscribe(data => this.patchForm(this.diseaseFormHu, data));
    this.diseaseService.getDiseaseDataEn(this.diseaseId).subscribe(data => this.patchForm(this.diseaseFormEn, data));
  }

  patchForm(form: FormGroup, data: Idisease) {
    form.patchValue({
      ...data,
      ageMin: data.age[0],
      ageMax: data.age[1]
    });

    const arrays = [
      'associatedDiseases', 
      'causes', 
      'painLocation', 
      'prevention', 
      'riskFactors', 
      'symptoms', 
      'treatment'
    ];

    arrays.forEach(arrayName => 
      this.setArray(form, arrayName, data[arrayName as keyof Idisease] as string[])
    );
  }

  setArray(form: FormGroup, controlName: string, values: string[]) {
    const formArray = form.get(controlName) as FormArray;
    formArray.clear();
    values.forEach(value => formArray.push(this.fb.control(value)));
  }

  addControl(array: FormArray) {
    array.push(this.fb.control(''));
  }

  removeControl(array: FormArray, index: number) {
    array.removeAt(index);
  }

  get associatedDiseasesHu(): FormArray { return this.diseaseFormHu.get('associatedDiseases') as FormArray; }
  get causesHu(): FormArray { return this.diseaseFormHu.get('causes') as FormArray; }
  get preventionHu(): FormArray { return this.diseaseFormHu.get('prevention') as FormArray; }
  get riskFactorsHu(): FormArray { return this.diseaseFormHu.get('riskFactors') as FormArray; }
  get treatmentHu(): FormArray { return this.diseaseFormHu.get('treatment') as FormArray; }
  get symptomsHu(): FormArray { return this.diseaseFormHu.get('symptoms') as FormArray; }
  get painLocationHu(): FormArray { return this.diseaseFormHu.get('painLocation') as FormArray; }

  get associatedDiseasesEn(): FormArray { return this.diseaseFormEn.get('associatedDiseases') as FormArray; }
  get causesEn(): FormArray { return this.diseaseFormEn.get('causes') as FormArray; }
  get preventionEn(): FormArray { return this.diseaseFormEn.get('prevention') as FormArray; }
  get riskFactorsEn(): FormArray { return this.diseaseFormEn.get('riskFactors') as FormArray; }
  get treatmentEn(): FormArray { return this.diseaseFormEn.get('treatment') as FormArray; }
  get symptomsEn(): FormArray { return this.diseaseFormEn.get('symptoms') as FormArray; }
  get painLocationEn(): FormArray { return this.diseaseFormEn.get('painLocation') as FormArray; }

  onPainfulChange(event: any, lang: 'hu' | 'en') {
    const form = lang === 'hu' ? this.diseaseFormHu : this.diseaseFormEn;
    if (!event.target.checked) {
      (form.get('painLocation') as FormArray).clear();
    }
  }

  loadSymptoms(lang: string) {
    this.diseaseService.getAllSymptoms(lang).subscribe(symptoms => this.symptoms = symptoms);
  }

  loadPainLocation(lang: string) {
    this.diseaseService.getAllPain(lang).subscribe(painList => this.painLocation = painList);
  }

  onSubmit(lang: 'hu' | 'en') {
    const form = lang === 'hu' ? this.diseaseFormHu : this.diseaseFormEn;
    const formData = {
      ...form.value,
      age: [form.value.ageMin, form.value.ageMax]
    };
    
    delete formData.ageMin;
    delete formData.ageMax;

    this.http.post(`http://localhost:3000/api/update-disease-${lang}`, {
      diseaseId: this.diseaseId,
      data: formData
    }).subscribe({
      next: (res) => console.log('success', res),
      
    });
  }
}