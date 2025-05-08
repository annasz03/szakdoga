import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, inject, Input, Output } from '@angular/core';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NotificationDialog } from '../notification-page/notification-page.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  @Output() documentDeleted = new EventEmitter<void>();


  @Input() fileName="";
  @Input() text:string="";
  @Input() id = "";

  height="100";
  width="100";
  inFocus=false;

  currentUser:any;

  @Input() docType="";
  @Input() file="";
  
  private authService = inject(AuthService);
  constructor(private dialog: MatDialog,private dataService:DataService, private http : HttpClient){}

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUrl(){
    return `http://localhost:3000/uploads/${this.file}`;
  }

  delete(){
    this.http.delete(`http://localhost:3000/api/delete-document/${this.id}`).subscribe({
      next: (response) => {
        //lefrissiteni
        this.documentDeleted.emit();
      }
    });
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
      width: '45vw', 
      data: { document_id: this.id }
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
  imports: [CommonModule, FormsModule,MatPaginatorModule, I18NextModule, MatLabel, MatFormField],
  styleUrl: './document.component.css'
})
export class ShareDialog {
  @Input() doctor_id: string ="";
  doctors:IDoctorResponse[]=[]
  private authService = inject(AuthService);
  currentUser:any;

  loading = true;
  totalItems: number = 0;
  pageSize = 10;
  doc_uid="";
  lastVisible: any = null;
  nameValue:any;

  constructor(
    public dialogRef: MatDialogRef<NotificationDialog>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { document_id: string }
  ) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }
  

  ngOnInit(){
    this.loadTotalCount();
    this.loadDoctors();
  }

  sendToDoctor(id: string | undefined): void {  
    const newDoc = {
      uid: this.currentUser?.uid,
      doctor_id: id,
      document_id: this.data.document_id
    };
  
    this.http.post('http://localhost:3000/api/send-to-doctor', newDoc)
      .subscribe({
        next: (response) => {
          console.log(response);
        }
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
    

  closeDialog(): void {
    this.dialogRef.close();
  }

  search() {
    this.http.post<IDoctorResponse[]>('http://localhost:3000/api/get-searched-doctors', {
      searchkey: this.nameValue
    }).subscribe({
      next: (response) => {
        this.doctors = response;
      }
    });
  }
  
   
  
}