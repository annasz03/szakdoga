import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-documents',
  standalone: true,
  imports: [CommonModule],
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
    constructor(private dialog: MatDialog,private dataService:DataService, private sanitizer: DomSanitizer, private http:HttpClient){}
  
    ngOnInit(){
      this.authService.user$.subscribe(user => {
        this.currentUser = user;
      });

      //document meg shared document lekerese

      this.http.post<{ user: any }>('http://localhost:3000/api/get-all-documents', {
        uid:this.currentUser.uid
      }).subscribe(response => {
        this.documents=response
      });

      this.http.post<{ user: any }>('http://localhost:3000/api/get-all-shared-documents', {
        uid:this.currentUser.uid
      }).subscribe(response => {
        this.documents=response
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
