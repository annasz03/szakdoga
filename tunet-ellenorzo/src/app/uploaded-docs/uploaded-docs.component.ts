import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DocumentComponent } from '../document/document.component';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';

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
  comment:string="";
  //TODO: PDF preview
  //TODO: kep es pdf ket kulon ablakban jelenjen meg
  fileTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

  savedDocuments:any;

  errorMessage="";
  currentUser:any;

  constructor(private dataService:DataService, private authService: AuthService){}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    setTimeout(()=>{
      this.getAllDocuments();

      this.dataService.getRefresh.subscribe({
        next: () => {
          this.getAllDocuments();
        }
      })
    },100)
  }

  getAllDocuments(){
    this.dataService.getAllDoc(this.currentUser.uid).subscribe({
      next: (result) => {
        this.savedDocuments=result.result;
        console.log(this.savedDocuments)
      }
    })
  }

  fileSelect(event: any) {
    this.selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => this.imageUrl = e.target.result;
    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadDoc() {
    if (this.selectedFile && this.fileTypes.includes(this.selectedFile!.type)) {
      this.errorMessage="";
      
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);
      formData.append('text', this.comment);
      this.dataService.uploadDoc(this.currentUser.uid,formData).subscribe(
        (response: any) => {
          console.log(response)
        }
      );
    }else {
      this.errorMessage="Nem megfelelő file formátum";
    }
    setTimeout(()=>{
      this.getAllDocuments();
    },100)
  }
}
