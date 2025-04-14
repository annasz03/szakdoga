import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, I18NextModule],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css'
})
export class DoctorComponent {

  @Input() doc:any;
  opened=false;

  openMoreData(){
    this.opened=!this.opened;
  }

}
