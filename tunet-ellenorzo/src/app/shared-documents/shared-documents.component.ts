import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Route } from '@angular/router';
import { DocumentComponent } from '../document/document.component';

@Component({
  selector: 'app-shared-documents',
  standalone: true,
  imports: [CommonModule, DocumentComponent],
  templateUrl: './shared-documents.component.html',
  styleUrl: './shared-documents.component.css'
})
export class SharedDocumentsComponent {
  @Input() fileName="";
    @Input() text:string="";
  
    height="100";
    width="100";
    inFocus=false;
  
    currentUser:any;
  
    @Input() docType="";
    @Input() file="";
    documents: any;
    
    private authService = inject(AuthService);
    constructor(private dialog: MatDialog,private dataService:DataService, private sanitizer: DomSanitizer, private http:HttpClient, private route:ActivatedRoute){}
  
    ngOnInit() {
      this.authService.user$.subscribe(user => {
        this.currentUser = user;

        const urlSegments = window.location.href.split('/');
        const doctorId = urlSegments[urlSegments.length - 1];
  
        this.http.post('http://localhost:3000/api/get-all-shared-documents', {
          doctor_id: this.currentUser.uid,
          uid: doctorId
        }).subscribe(response => {
          this.documents = response;
        });
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

}
