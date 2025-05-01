import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { LangService } from '../lang-service.service';

@Component({
  selector: 'app-edit-disease',
  templateUrl: './edit-disease.component.html'
})
export class EditDiseaseComponent implements OnInit {
  diseaseForm!: FormGroup;
  @Input() diseaseId="";
  currentLang=""

  //lang

  constructor(private fb: FormBuilder, private langService:LangService) {
    this.currentLang = this.langService.getLanguage();
  }

  ngOnInit() {
    this.diseaseForm = this.fb.group({
      name: ['', Validators.required],
      ageLabel: [''],
      age: this.fb.array([0, 999]),
      gender: ['Both'],
      symptoms: this.fb.array([]),
      associatedDiseases: this.fb.array([]),
      description: [''],
      causes: this.fb.array([]),
      prevention: this.fb.array([]),
      treatment: this.fb.array([]),
      riskFactors: this.fb.array([]),
      painful: [false],
      painLocation: this.fb.array([]),
    });
  }

  get symptoms() { return this.diseaseForm.get('symptoms') as FormArray; }
  get associatedDiseases() { return this.diseaseForm.get('associatedDiseases') as FormArray; }
  get causes() { return this.diseaseForm.get('causes') as FormArray; }
  get prevention() { return this.diseaseForm.get('prevention') as FormArray; }
  get treatment() { return this.diseaseForm.get('treatment') as FormArray; }
  get riskFactors() { return this.diseaseForm.get('riskFactors') as FormArray; }
  get painLocation() { return this.diseaseForm.get('painLocation') as FormArray; }
  
  addToArray(array: FormArray) {
    array.push(this.fb.control('', Validators.required));
  }

  removeFromArray(array: FormArray, index: number) {
    array.removeAt(index);
  }

  save() {
    console.log(this.diseaseForm.value);
  }
}
