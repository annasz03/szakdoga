import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { addDoc,  Firestore, getDocs, query, where, } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { I18NextModule } from 'angular-i18next';
import { DoctorService } from '../doctor.service';
import { DocumentService } from '../document.service';
import { LangService } from '../lang-service.service';


@Component({
  selector: 'app-uploaded-docs',
  standalone: true,
  imports: [CommonModule, DocumentComponent, FormsModule, I18NextModule],
  templateUrl: './uploaded-docs.component.html',
  styleUrl: './uploaded-docs.component.css'
})
export class UploadedDocsComponent {
  documentService = inject(DocumentService)

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

  lang:any;

  constructor(private dataService: DataService, private langService: LangService) {
    this.langService.currentLang$.subscribe((lang) => {
      this.lang=lang
    });
  }

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
    this.documentService.getAllDocuments(this.currentUser.uid).subscribe(response => {
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
  
      this.documentService.uploadDocument(formData).subscribe({
        next: (res) => {
          this.getAllDocuments();
        }
      });
    } else {
      if(this.lang==='hu'){
        this.errorMessage = "Nem megfelelő file formátum";
      }else{
        this.errorMessage = "File format is not correct"
      }
    }
  }

  pdf() {
    this.docType = "pdf";
  }

  img() {
    this.docType = "img";
  }
}