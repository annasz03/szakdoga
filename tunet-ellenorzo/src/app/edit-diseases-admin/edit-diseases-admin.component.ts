import { Component } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, setDoc } from '@angular/fire/firestore';
import { LangService } from '../lang-service.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DiseaseComponent } from '../disease/disease.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs';

@Component({
  selector: 'app-edit-diseases-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DiseaseComponent, ReactiveFormsModule],
  templateUrl: './edit-diseases-admin.component.html',
  styleUrls: ['./edit-diseases-admin.component.css']
})
export class EditDiseasesAdminComponent {

  allDiseases: { id: string }[] = [];

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

  constructor(private firestore: Firestore, private langService: LangService, private fb: FormBuilder) {
    this.langService.currentLang$.subscribe((lang) => {
      this.loadDiseases(lang);
      this.loadSymptoms(lang);
      this.loadPainLocation(lang);
      this.loadPrevention(lang);
      this.loadRiskFactors(lang);
      this.loadTreatment(lang);
    });
  }

  ngOnInit(): void {
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

  async loadDiseases(lang: string): Promise<void> {
    const ref = collection(this.firestore, 'diseases_' + lang);
    const snapshot = await getDocs(ref);
    this.allDiseases = snapshot.docs.map(doc => ({ id: doc.id }));
  }

  async loadSymptoms(lang: string) {
    const langDocRef = collection(this.firestore, 'symptoms');
    getDocs(langDocRef).then(snapshot => {
      const list: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data[lang]) {
          list.push(data[lang]);
        }
      });
      this.symptoms = list;
    });
  }

  async loadPainLocation(lang: string) {
    const ref = collection(this.firestore, 'pain');
    getDocs(ref).then(snapshot => {
      const list: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data[lang]) {
          list.push(data[lang]);
        }
      });
      this.painLocation = list;
    });
  }

  async loadPrevention(lang: string) {
    const ref = collection(this.firestore, 'prevention');
    getDocs(ref).then(snapshot => {
      const list: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data[lang]) {
          list.push(data[lang]);
        }
      });
      this.prevention = list;
    });
  }

  async loadRiskFactors(lang: string) {
    const ref = collection(this.firestore, 'riskFactors');
    getDocs(ref).then(snapshot => {
      const list: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data[lang]) {
          list.push(data[lang]);
        }
      });
      this.riskFactors = list;
    });
  }

  async loadTreatment(lang: string) {
    const ref = collection(this.firestore, 'treatment');
    getDocs(ref).then(snapshot => {
      const list: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data[lang]) {
          list.push(data[lang]);
        }
      });
      this.treatment = list;
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
    const diseaseRef = doc(this.firestore, 'diseases_' + lang, diseaseId);

    setDoc(diseaseRef, diseaseData)
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
    const diseaseRefHu = doc(this.firestore, `diseases_hu`, diseaseId);
    const diseaseRefEn = doc(this.firestore, `diseases_en`, diseaseId);

    Promise.all([deleteDoc(diseaseRefHu), deleteDoc(diseaseRefEn)])
      .then(() => {
        this.loadDiseases('hu');
        this.loadDiseases('en');
      })
  }

  async editDisease(diseaseId: string): Promise<void> {
    const lang = await this.langService.currentLang$.pipe(first()).toPromise();
    const ref = doc(this.firestore, `diseases_${lang}`, diseaseId);
    const snapshot = await getDocs(collection(this.firestore, `diseases_${lang}`));
    const diseaseDoc = snapshot.docs.find(d => d.id === diseaseId);
  
    if (diseaseDoc) {
      const diseaseData = diseaseDoc.data();
  
      const form = lang === 'hu' ? this.diseaseFormHu : this.diseaseFormEn;
      form.patchValue({
        id: diseaseId,
        name: diseaseData['name'] || '',
        ageMin: diseaseData['ageMin'] || 0,
        ageMax: diseaseData['ageMax'] || 99,
        ageLabel: diseaseData['ageLabel'] || '',
        gender: diseaseData['gender'] || 'Both',
        description: diseaseData['description'] || '',
        painful: diseaseData['painful'] || false
      });
  
      this.setFormArray(form.get('symptoms') as FormArray, diseaseData['symptoms'] || []);
      this.setFormArray(form.get('painLocation') as FormArray, diseaseData['painLocation'] || []);
      this.setFormArray(form.get('prevention') as FormArray, diseaseData['prevention'] || []);
      this.setFormArray(form.get('riskFactors') as FormArray, diseaseData['riskFactors'] || []);
      this.setFormArray(form.get('treatment') as FormArray, diseaseData['treatment'] || []);
    }
  }
  
  
  
  
  private setFormArray(array: FormArray, values: string[]): void {
    array.clear();
    values.forEach(value => {
      array.push(this.fb.control(value));
    });
  }
  
}
