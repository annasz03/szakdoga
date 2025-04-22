import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { IDoctorResponse } from '../doctorres.interface';
import { DoctorComponent } from '../doctor/doctor.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Firestore, addDoc, collection, doc, getDocs } from '@angular/fire/firestore';
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
  imports: [CommonModule, FormsModule, DoctorComponent, MatInputModule, MatFormFieldModule, I18NextModule, MatPaginatorModule],
  templateUrl: './doctor-finder-page.component.html',
  styleUrls: ['./doctor-finder-page.component.css']
})
export class DoctorFinderPageComponent {
  nameValue = '';
  selectedArea: any;
  selectedSpec: any;

  newDocName: string = '';
  newDocPhone: string = '';
  newDocCity: string = '';
  newDocAddress: string = '';
  newDocProfileUrl: string = '';
  newDocSpecialty: string = '';
  newDocNumber:string='';

  specList: selectType[] = [];
  area: selectType[] = [];
  loading = true;

  openDocReg=false;

  errorMsg='';
  reqOpen=false;

  role:string ="";

  docs_temp: Idoctor[] = [];

  paginatedDoctors: IDoctorResponse[] = [];
  pageSize = 10;
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  private authService = inject(AuthService);
    currentUser:any;
  doctors: IDoctorResponse[]=[];
  constructor(private dataService: DataService, private firestore: Firestore) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;})
  }

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

    const ref3 = collection(this.firestore, 'users');
      getDocs(ref3).then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data();
          if (docData["username"] === this.currentUser.displayName) {
            this.role = docData["role"];
          }
        });
      });

    //doctorok
    this.getAllDoctor();
  }

  reqDoc() {
    this.reqOpen = !this.reqOpen;
    const ref = collection(this.firestore, 'doctors_temp');
  
    getDocs(ref).then(snapshot => {
      this.docs_temp = [];
  
      snapshot.forEach(doc => {
        const docData = doc.data();
        this.docs_temp.push({
          id:doc.id,
          uid: docData['uid'],
          name: docData['name'],
          phone: docData['phone'],
          city: docData['city'],
          address: docData['address'],
          specialty: docData['specialty'],
          createdAt: docData['createdAt'],
          profileUrl: docData['profileUrl'] || '',
          number: docData['number']
        });
      });
    })
  }
  

  registerDocProfile(){
    this.openDocReg=true;

    //egyéb inputok ellenőrzése
    if(this.isValidDocNumber(this.newDocNumber)){
      const docTempCollection = collection(this.firestore, 'doctors_temp');
      
      
              const newDoc= {
                uid: this.currentUser.uid,
                name: this.newDocName,
                phone: this.newDocPhone,
                city: this.newDocCity,
                address: this.newDocAddress,
                specialty: this.newDocSpecialty,
                number: this.newDocNumber,
              }
      
              addDoc(docTempCollection,newDoc).then((docref)=>{
                console.log('Sikeres hozzáadás');
                  }).catch((error) => {
                    console.error('Nem sikerült hozzáadni', error);
              })
    }else{
      this.errorMsg="Nem valid orvosi nyilvántartási szám"
    }
  }

  isValidDocNumber = (value: string): boolean => {
    return /^[0-9]{5,6}$/.test(value);
  };
  

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

  ngAfterViewInit() {
    this.updatePaginatedDoctors();
  }

  onPageChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.paginatedDoctors = this.doctors.slice(startIndex, endIndex);
  }

  updatePaginatedDoctors() {
    this.paginatedDoctors = this.doctors.slice(0, this.pageSize);
  }
}
