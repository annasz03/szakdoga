import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, Firestore, getDocs, query, where, } from '@angular/fire/firestore';


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

  constructor(private dataService: DataService, private authService: AuthService, private firestore: Firestore) {}

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
    }, 100);
  }

  getAllDocuments() {
    const documentsCollection = collection(this.firestore, 'documents');
    const q = query(documentsCollection, where('userId', '==', this.currentUser.uid));

    getDocs(q).then((querySnapshot) => {
      this.documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Dokumentumok betöltve:', this.documents);
    }).catch(error => {
      console.error('Hiba: ', error);
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
    if (this.selectedFile && this.fileTypes.includes(this.selectedFile!.type)) {
      this.errorMessage = "";

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const documentsCollection = collection(this.firestore, 'documents');

        const newDoc= {
          file: base64Data,
          type: this.selectedFile!.type,
          comment: this.comment,
          userId: this.currentUser.uid
        }

        addDoc(documentsCollection,newDoc).then((docref)=>{
          console.log('Sikeres hozzáadás');
            }).catch((error) => {
              console.error('Nem sikerült', error);
        })
      };
      reader.readAsDataURL(this.selectedFile!);
      } else {
        this.errorMessage = "Nem megfelelő file formátum";
      }
    setTimeout(() => {
      this.getAllDocuments();
    }, 100);
  }

  pdf() {
    this.docType = "pdf";
  }

  img() {
    this.docType = "img";
  }
}