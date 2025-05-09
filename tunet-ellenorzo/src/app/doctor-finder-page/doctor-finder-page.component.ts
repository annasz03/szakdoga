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
import { DocumentService } from '../document.service';
import { DoctorService } from '../doctor.service';

type selectType = { key: string; value: string };

@Component({
  selector: 'app-doctor-finder-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorComponent, MatInputModule, MatFormFieldModule, I18NextModule, MatPaginatorModule, I18NextModule ],
  templateUrl: './doctor-finder-page.component.html',
  styleUrls: ['./doctor-finder-page.component.css']
})
export class DoctorFinderPageComponent {
  documentService = inject(DocumentService)
  doctorService = inject(DoctorService)

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

      this.doctorService.initData(this.currentUser.displayName).subscribe((data: any) => {
        this.area = data.area;
        this.specList = data.specList;
        this.role = data.role;
      
        this.loadTotalCount();
        this.loadDoctors();
      });

      /*this.http.get('http://localhost:3000/api/init-data', {
        params: { username: this.currentUser.displayName }
      }).subscribe((data: any) => {
        this.area = data.area;
        this.specList = data.specList;
        this.role = data.role;
      
        this.loadTotalCount();
        this.loadDoctors();
      });*/
    });
    
    
  }

  loadTotalCount() {
    this.documentService.loadTotalCount().subscribe({
      next: (response) => {
        this.totalItems = response.totalCount;
        this.loading = false;
      }
    });

    /*this.http.get<{ totalCount: number }>('http://localhost:3000/api/load-total-count')
      .subscribe({
        next: (response) => {
          this.totalItems = response.totalCount;
          this.loading = false;
        }
      });*/
  }

  loadDoctors() {
  this.loading = true;
  const requestData = {
    pageSize: this.pageSize,
    lastVisibleDocId: this.lastVisible
  };

  this.doctorService.loadDoctors(requestData).subscribe({
    next: (response) => {
      this.doctors = response.doctors; 
      this.lastVisible = response.lastVisible;
      this.loading = false;
    }
  });
}

loadNextPage() {    
  this.loading = true;
  this.doctorService.loadDoctorsNext(
    this.lastVisible, 
    this.pageSize
  ).subscribe({
    next: response => {
      this.doctors = response.doctors;
      this.lastVisible = response.lastVisible;
      this.loading = false;
    }
  });
}

  currentPageIndex = 0;

onPageChange(event: PageEvent) {
  this.currentPageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
  
  if (event.pageIndex > event.previousPageIndex!) {
    this.loadNextPage();
  } else {
    this.loadDoctors();
  }
}
  

  

search() {
  this.doctors = [];
  this.lastVisible = null;
  
  this.doctorService.searchDoctors(
    this.nameValue.toLowerCase(),
    this.selectedSpec,
    this.selectedArea
  ).subscribe((response: any) => {
    this.doctors = response.data;
    this.totalItems = response.count;
  });
}
  

  removeFilters() {
    this.nameValue = '';
    this.selectedArea = '';
    this.selectedSpec = '';
    this.loadDoctors();
  }
  

  reqDoc() {
    this.doctorService.getDoctorTemp().subscribe(docs => {
      this.docs_temp = docs;
      this.reqOpen = !this.reqOpen;
    });

    /*this.http.get<any[]>('http://localhost:3000/doctors-temp').subscribe(docs => {
      this.docs_temp = docs;
      this.reqOpen = !this.reqOpen;
    });*/
    
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


    this.doctorService.postDoctorTemp(newDoc).subscribe({
      next: () => {
        this.errorMsg = '';
        this.openDocReg = false;
      }
    })
    
  }
  

  isValidDocNumber(value: string): boolean {
    return /^[0-9]{5,6}$/.test(value);
  }
}