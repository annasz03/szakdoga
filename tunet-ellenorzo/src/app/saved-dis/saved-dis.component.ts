import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DiseaseComponent } from '../disease/disease.component';
import { I18NextModule } from 'angular-i18next';

@Component({
  selector: 'app-saved-dis',
  standalone: true,
  imports: [CommonModule, DiseaseComponent, I18NextModule],
  templateUrl: './saved-dis.component.html',
  styleUrl: './saved-dis.component.css'
})
export class SavedDisComponent {

  @Input() saved: any;
  @Input() i=0;

  opened=false;

  openSaved(){
    this.opened=!this.opened
  }

}
