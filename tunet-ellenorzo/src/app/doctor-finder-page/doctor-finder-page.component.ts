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
import { HttpClient } from '@angular/common/http';

type selectType = { key: string; value: string };

@Component({
  selector: 'app-doctor-finder-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorComponent, MatInputModule, MatFormFieldModule, I18NextModule, MatPaginatorModule, I18NextModule ],
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

  constructor(private dataService: DataService, private firestore: Firestore, private http:HttpClient) {}

  async ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;

      this.http.get('http://localhost:3000/api/init-data', {
        params: { username: this.currentUser.displayName }
      }).subscribe((data: any) => {
        this.area = data.area;
        this.specList = data.specList;
        this.role = data.role;
      
        this.loadTotalCount();
        this.loadDoctors();
      });
    });
    
    
  }

  loadTotalCount() {
    this.http.get<{ totalCount: number }>('http://localhost:3000/api/load-total-count')
      .subscribe({
        next: (response) => {
          this.totalItems = response.totalCount;
          this.loading = false;
        }
      });
  }

  loadDoctors() {
    const requestData = {
      pageSize: this.pageSize,
      lastVisibleDocId: this.lastVisible?.id
    };
  
    this.http.post<{ doctors: any[], lastVisible: string }>('http://localhost:3000/api/load-doctors', requestData)
      .subscribe({
        next: (response) => {
          console.log(response)
          this.doctors = [...this.doctors, ...response.doctors];
          this.lastVisible = response.lastVisible ? { id: response.lastVisible } : null;
        }
      });
  }

  onPageChange(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.loadNextPage();
  }
  
  loadNextPage() {    
    this.http.post<{ doctors: IDoctorResponse[], lastVisible: string }>(
      'http://localhost:3000/api/load-doctors-next',
      {
        lastVisibleDocId: this.lastVisible.id,
        pageSize: this.pageSize
      }
    ).subscribe({
      next: response => {
        if (response.doctors.length > 0) {
          this.doctors = response.doctors;
          this.lastVisible = { id: response.lastVisible };
        }
      }
    });
  }

  

  search() {
    this.http.get('http://localhost:3000/api/search-doctors', {
      params: {
        name: this.nameValue,
        specialty: this.selectedSpec,
        city: this.selectedArea
      }
    }).subscribe((doctors: any) => {
      this.doctors = doctors;
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
    this.http.get<any[]>('http://localhost:3000/doctors-temp').subscribe(docs => {
      this.docs_temp = docs;
      this.reqOpen = !this.reqOpen;
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


  
    this.http.post('http://localhost:3000/api/doctors-temp', newDoc).subscribe({
      next: () => {
        this.errorMsg = '';
        this.openDocReg = false;
      }
    });
    
  }
  

  isValidDocNumber(value: string): boolean {
    return /^[0-9]{5,6}$/.test(value);
  }
}