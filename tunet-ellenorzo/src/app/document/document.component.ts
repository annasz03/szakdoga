import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NotificationDialog } from '../notification-page/notification-page.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { addDoc, collection, Firestore, getCountFromServer, getDocs, limit, orderBy, query, startAfter, where } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { IDoctorResponse } from '../doctorres.interface';
import { MatPaginatorModule } from '@angular/material/paginator';
import { I18NextModule } from 'angular-i18next';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document.component.html',
  styleUrl: './document.component.css'
})
export class DocumentComponent {

  @Input() fileName="";
  @Input() text:string="";

  height="100";
  width="100";
  inFocus=false;

  currentUser:any;

  @Input() docType="";
  @Input() file="";
  
  private authService = inject(AuthService);
  constructor(private dialog: MatDialog,private dataService:DataService, private sanitizer: DomSanitizer){}

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUrl(){
    return `http://localhost:3000/uploads/${this.file}`;
  }

  delete(){
    this.dataService.deleteDoc(this.currentUser.uid, this.fileName).subscribe({
      next: (response) => {
      }
    })
    setTimeout(()=>{
      this.dataService.setRefresh=true;
    },100)
  }

  isImage(): boolean {
    return this.docType?.startsWith('image/');
  }
  
  isPdf(): boolean {
    return this.docType === 'application/pdf';
  }

  openPdf(): void {
    const url = this.getUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ShareDialog, {
      data: { document_id: this.fileName }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('closea');
    });
  }
  
}



@Component({
  selector: 'share-dialog',
  templateUrl: './send-to-doc-dialog.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule,MatPaginatorModule, I18NextModule, MatLabel, MatFormField]
})
export class ShareDialog {
  @Input() doctor_id: string ="";
  @Input() document_id: string ="";
  doctors:IDoctorResponse[]=[]
  private authService = inject(AuthService);
  currentUser:any;

  loading = true;
  totalItems: number = 0;
  pageSize = 10;
  doc_uid="";
  lastVisible: any = null;
  nameValue:any;

  constructor(private firestore: Firestore, public dialogRef: MatDialogRef<NotificationDialog>, private http:HttpClient, ){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(){
    this.http.get<{ user: any }>('http://localhost:3000/api/get-all-doctors').subscribe(response => {
      if (Array.isArray(response)) {
        this.doctors.push(...response);
      }
    });

    this.loadTotalCount();
    this.loadDoctors();

  }

  sendToDoctor(id:string | undefined){
    console.log(id)
    const documentsCollection = collection(this.firestore, 'shared_documents');
    
            const newDoc= {
              uid: this.currentUser.uid,
              doctor_id:id,
              document_id: this.document_id
            }
    
            addDoc(documentsCollection,newDoc).then((docref)=>{
              console.log('Sikeres hozzáadás');
                }).catch((error) => {
                  console.error('Nem sikerült', error);
            })
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
            address: docData["address"],
            uid: docData["uid"]
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

  closeDialog(): void {
    this.dialogRef.close();
  }

  search() {
    this.loading = true;
    let docRef = collection(this.firestore, 'doctors');
  
    let q;
    if (this.nameValue && this.nameValue.trim()) {
      const name = this.nameValue.trim();
      q = query(
        docRef,
        orderBy('name'),
        where('name', '>=', name),
        where('name', '<=', name + '\uf8ff')
      );
    } else {
      q = query(docRef, orderBy('name'), limit(this.pageSize));
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
  
}