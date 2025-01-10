import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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

  constructor(private dataService:DataService, private authService: AuthService,private sanitizer: DomSanitizer){}

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUrl(){
    return `http://localhost:3000/uploads/${this.fileName}`;
  }

  onImageClick(){
    if(this.inFocus){
      this.inFocus=false;
      this.height="100"
      this.width="100"
    }else{
      this.inFocus=true;
      this.height="200"
      this.width="200"
    }
  }

  delete(){
    this.dataService.deleteDoc(this.currentUser.uid, this.fileName).subscribe({
      next: (response) => {
        console.log(response);
      }
    })
    setTimeout(()=>{
      this.dataService.setRefresh=true;
    },100)
  }

  isImage(): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png'];
    const extension = this.fileName.split('.').pop()?.toLowerCase();
    return extension ? imageExtensions.includes(extension) : false;
  }

  isPdf(): boolean {
    return this.fileName.split('.').pop()?.toLowerCase() === 'pdf';
  }

  openPdf(): void {
    let url = this.getUrl();
    window.open(url, '_blank');
  }
}
