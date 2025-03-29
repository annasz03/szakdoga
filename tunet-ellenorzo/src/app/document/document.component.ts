import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  constructor(private dataService:DataService, private sanitizer: DomSanitizer){}

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
  
}
