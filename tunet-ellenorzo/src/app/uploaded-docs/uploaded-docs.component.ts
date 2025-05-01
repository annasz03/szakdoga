import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { addDoc,  Firestore, getDocs, query, where, } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-uploaded-docs',
  standalone: true,
  imports: [CommonModule, DocumentComponent, FormsModule],
  templateUrl: './uploaded-docs.component.html',
  styleUrl: './uploaded-docs.component.css'
})
export class UploadedDocsComponent {
  selectedFile: File | null = null;
  imageUrl: string | null = null;
  comment: string = "";

  docType = "img";
  fileTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

  savedDocuments: any;
  errorMessage = "";
  currentUser: any;

  focusedDocument: string | null = null;
  documents:any;
  private authService= inject(AuthService)

  constructor(private dataService: DataService, private firestore: Firestore, private http:HttpClient) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    setTimeout(() => {
      this.getAllDocuments();

      this.dataService.getRefresh.subscribe({
        next: () => {
          this.getAllDocuments();
        }
      });
    }, 3000);
  }

  getAllDocuments() {
    this.http.post<{ user: any }>('http://localhost:3000/api/get-all-documents', {
      uid:this.currentUser.uid
    }).subscribe(response => {
      this.documents=response
  });
    
  }

  get filteredDocuments() {
    if (!this.documents) return [];
  
    return this.documents.filter((doc: any) => {
      if (this.docType === 'img') {
        return this.isImage(doc.type);
      } else if (this.docType === 'pdf') {
        return this.isPdf(doc.type);
      }
      return true;
    });
  }
  
  
  isImage(fileType: string): boolean {
    return fileType?.startsWith('image/');
  }
  
  isPdf(fileType: string): boolean {
    return fileType === 'application/pdf';
  }
  

  fileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadDoc() {
    if (this.selectedFile && this.fileTypes.includes(this.selectedFile.type)) {
      this.errorMessage = "";
  
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('comment', this.comment);
      formData.append('userId', this.currentUser.uid);
  
      this.http.post('http://localhost:3000/api/upload-document', formData).subscribe({
        next: (res) => {
          console.log('Dokumentum sikeresen feltöltve');
          this.getAllDocuments();
        },
        error: (err) => {
          console.error('Hiba dokumentum feltöltésekor', err);
        }
      });
    } else {
      this.errorMessage = "Nem megfelelő file formátum";
    }
  }

  pdf() {
    this.docType = "pdf";
  }

  img() {
    this.docType = "img";
  }
}