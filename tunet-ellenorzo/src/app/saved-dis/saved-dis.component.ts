import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DiseaseComponent } from '../disease/disease.component';

@Component({
  selector: 'app-saved-dis',
  standalone: true,
  imports: [CommonModule, DiseaseComponent],
  templateUrl: './saved-dis.component.html',
  styleUrl: './saved-dis.component.css'
})
export class SavedDisComponent {

  @Input() saved: any;
  @Input() i=0;

  opened=false;

  constructor(){}

  ngOnInit(){
  }

  openSaved(){
    this.opened=!this.opened
  }

}
