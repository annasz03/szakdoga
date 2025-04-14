import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { IDoctorResponse } from '../doctorres.interface';
import { DoctorComponent } from '../doctor/doctor.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';

type selectType = { key: string; value: string };

@Component({
  selector: 'app-doctor-finder-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorComponent, MatInputModule, MatFormFieldModule, I18NextModule],
  templateUrl: './doctor-finder-page.component.html',
  styleUrls: ['./doctor-finder-page.component.css']
})
export class DoctorFinderPageComponent {
  nameValue = '';
  selectedArea: any;
  selectedSpec: any;

  specList: selectType[] = [];
  area: selectType[] = [];
  loading = true;

  doctors: IDoctorResponse[]=[];
  constructor(private dataService: DataService, private firestore: Firestore) {}

  ngOnInit() {
    this.loading = true;

    //area
    const ref = collection(this.firestore, 'areas');
    getDocs(ref).then(snapshot => {
      snapshot.forEach(doc => {
        const docData = doc.data();
        if (docData) {
          this.area.push({ key: doc.id, value: docData['name'] });
        }
      });
      this.loading = false;
    }).catch(error => {
      console.error("Hiba: ", error);
      this.loading = false;
    });

    //spec
    const ref2 = collection(this.firestore, 'doctor_spec');
    getDocs(ref2).then(snapshot => {
      snapshot.forEach(doc => {
        const docData = doc.data();
        if (docData) {
          this.specList.push({ key: doc.id, value: docData['name'] });
        }
      });
      this.loading = false;
    }).catch(error => {
      console.error("Hiba: ", error);
      this.loading = false;
    });

    //doctorok
    this.getAllDoctor();
  }

  search() {
    let filteredDoctors: IDoctorResponse[] = this.doctors;

    if ((this.nameValue === "" && this.selectedArea === undefined && this.selectedSpec === undefined) ||
      (this.nameValue === "" && this.selectedArea === "" && this.selectedSpec === "")) {
        this.getAllDoctor();
        filteredDoctors=this.doctors
    } else {
      if (this.nameValue !== "") {
        filteredDoctors = filteredDoctors.filter((doctor) =>
          doctor.name.toLowerCase().includes(this.nameValue.toLowerCase())
        );
      }
      if (this.selectedSpec !== "" && this.selectedSpec !== undefined) {
        filteredDoctors = filteredDoctors.filter((doctor) =>
          doctor.speciality.includes(this.selectedSpec)
        );
      }
      if (this.selectedArea !== "" && this.selectedArea !== undefined) {
        filteredDoctors = filteredDoctors.filter((doctor) =>
          doctor.cities.includes(this.selectedArea)
        );
      }
    }

    this.doctors = filteredDoctors;
  }

  getAllDoctor(){
    const ref = collection(this.firestore, 'doctors');
    getDocs(ref).then(snapshot => {
      snapshot.forEach(doc => {
        const docData = doc.data();
        if (docData) {
          this.doctors.push({
            name: docData['name'],
            gender: docData['gender'],
            speciality: docData['specs'],
            cities: docData['cities'],
            phone: docData['phone'],
            available: docData['available']
          });
        }
      });
      this.loading = false;
    }).catch(error => {
      console.error("Hiba: ", error);
      this.loading = false;
    });
  }

  removeFilters() {
    this.doctors=[];
    this.getAllDoctor();
  }
}
