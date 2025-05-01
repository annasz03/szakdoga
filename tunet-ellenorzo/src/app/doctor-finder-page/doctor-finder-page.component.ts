import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { IDoctorResponse } from '../doctorres.interface';
import { DoctorComponent } from '../doctor/doctor.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Firestore, addDoc, collection, doc, docData, getCountFromServer, getDocs, limit, orderBy, query, startAfter, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { AuthService } from '../auth.service';
import { Timestamp } from 'firebase/firestore';
import { Idoctor } from '../idoctor';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

type selectType = { key: string; value: string };

@Component({
  selector: 'app-doctor-finder-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorComponent, MatInputModule, MatFormFieldModule, I18NextModule, MatPaginatorModule, ],
  templateUrl: './doctor-finder-page.component.html',
  styleUrls: ['./doctor-finder-page.component.css']
})
export class DoctorFinderPageComponent {
  nameValue = '';
  selectedArea: string = "";
  selectedSpec: string = "";

  newDocName: string = '';
  newDocPhone: string = '';
  newDocCity: string = '';
  newDocAddress: string = '';
  newDocProfileUrl: string = '';
  newDocSpecialty: string = '';
  newDocNumber: string = '';

  specList: selectType[] = [];
  area: selectType[] = [];

  openDocReg = false;
  errorMsg = '';
  reqOpen = false;

  role: string = "";
  currentUser: any;
  docs_temp: Idoctor[] = [];

  doctors: IDoctorResponse[] = [];
  loading = true;
  totalItems: number = 0;
  pageSize = 10;
  doc_uid="";
  lastVisible: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private authService = inject(AuthService);

  constructor(private dataService: DataService, private firestore: Firestore) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async ngOnInit() {
    this.loading = true;

    getDocs(collection(this.firestore, 'areas')).then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data) {
          this.area.push({ key: doc.id, value: data['name'] });
        }
      });
    });

    getDocs(collection(this.firestore, 'doctor_spec')).then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data) {
          this.specList.push({ key: doc.id, value: data['name'] });
        }
      });
    });

    getDocs(collection(this.firestore, 'users')).then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data["username"] === this.currentUser.displayName) {
          this.role = data["role"];
        }
      });
    });


    this.loadTotalCount();
    this.loadDoctors();
    
  }

  loadTotalCount(){
    const areasRef = collection(this.firestore, 'doctors');
        getCountFromServer(areasRef).then(snapshot => {
          this.totalItems = snapshot.data().count;
          this.loading = false;
        });
  }

  loadDoctors(){
    const areasRef = collection(this.firestore, 'doctors');
    const areasQuery = query(areasRef, orderBy('name'), limit(this.pageSize));

    getDocs(areasQuery).then(snapshot => {
      this.doctors = [];
      snapshot.forEach(doc => {
        const docData = doc.data()
        this.doctors.push({
          id: doc.id,
          name: docData["name"],
          speciality: docData["specialty"],
          city: docData["city"],
          phone: docData["phone"],
          address: docData["address"]
        });
        
      });
      this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
    });
  }

  onPageChange(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.loadNextPage(startIndex, endIndex);
  }
  
  loadNextPage(startIndex: number, endIndex: number) {
    if (!this.lastVisible) return;

    const docref = collection(this.firestore, 'doctors');
    const docq = query(docref, orderBy('name'), startAfter(this.lastVisible), limit(this.pageSize));

    getDocs(docq).then(snapshot => {
      if (!snapshot.empty) {
        this.doctors = [];
        snapshot.forEach(doc => {
          this.doctors.push(doc.data() as IDoctorResponse);
        });
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
      }
    });
  }

  

  search() {
    this.loading = true;
  
    let docRef = collection(this.firestore, 'doctors');
    let q = query(docRef);
  
    if (this.nameValue.trim()) {
      q = query(q, where('name', '>=', this.nameValue), where('name', '<=', this.nameValue + '\uf8ff'));
    }
  
    if (this.selectedSpec) {
      q = query(q, where('specialty', '==', this.selectedSpec));
    }
  
    if (this.selectedArea) {
      q = query(q, where('city', '==', this.selectedArea));
    }
  
    getDocs(q).then(snapshot => {
      this.doctors = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        this.doctors.push({
          id: doc.id,
          name: d['name'],
          speciality: d['specialty'],
          city: d['city'],
          phone: d['phone'],
          address: d['address']
        });
      });
      this.loading = false;
    });
  }
  

  removeFilters() {
    this.nameValue = '';
    this.selectedArea = '';
    this.selectedSpec = '';
    this.loadDoctors();
  }
  

  reqDoc() {
    this.reqOpen = !this.reqOpen;
    const ref = collection(this.firestore, 'doctors_temp');

    getDocs(ref).then(snapshot => {
      this.docs_temp = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        this.docs_temp.push({
          id: doc.id,
          uid: data['uid'],
          name: data['name'],
          phone: data['phone'],
          city: data['city'],
          address: data['address'],
          specialty: data['specialty'],
          createdAt: data['createdAt'],
          profileUrl: data['profileUrl'] || '',
          number: data['number']
        });
      });
    });
  }

  registerDocProfile() {
    if (!this.isValidDocNumber(this.newDocNumber)) {
      this.errorMsg = "Nem valid orvosi nyilvántartási szám";
      return;
    }
  
    const newDoc = {
      uid: this.currentUser.uid,
      name: this.newDocName,
      phone: this.newDocPhone,
      city: this.newDocCity,
      address: this.newDocAddress,
      specialty: this.newDocSpecialty,
      number: this.newDocNumber
    };

    console.log(newDoc)


  
    const tempCollection = collection(this.firestore, 'doctors_temp');
    addDoc(tempCollection, newDoc).then(() => {
      this.errorMsg = '';
      this.openDocReg = false;
    }).catch(err => {
      this.errorMsg = "Hiba történt a regisztrációnál.";
      console.error(err);
    });
  }
  

  isValidDocNumber(value: string): boolean {
    return /^[0-9]{5,6}$/.test(value);
  }
}