import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css'
})
export class DoctorComponent {

  @Input() doc:any;
  opened=false;

  constructor(){}

  ngOnInit(){
  }

  openMoreData(){
    this.opened=!this.opened;
  }

}
