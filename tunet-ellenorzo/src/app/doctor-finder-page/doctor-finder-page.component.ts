import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { IDoctorResponse } from '../doctorres.interface';
import { DoctorComponent } from '../doctor/doctor.component';
import { filter } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

type selectType = { key: number; value: string };

@Component({
  selector: 'app-doctor-finder-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorComponent, MatInputModule, MatFormFieldModule],
  templateUrl: './doctor-finder-page.component.html',
  styleUrl: './doctor-finder-page.component.css'
})
export class DoctorFinderPageComponent {
  nameValue = '';

  doctorsList:any;
  allDoctorsList:any;

  spec: selectType[]=[];
  area: selectType[]=[];

  selectedArea:any;
  selectedSpec:any;

  constructor(private dataService: DataService){} 

  ngOnInit(){
    this.dataService.getAllDoctor().subscribe((data: IDoctorResponse) => {
      this.allDoctorsList = data.result;
      this.doctorsList=this.allDoctorsList;
    });

    this.dataService.getAllArea().subscribe(data => {
      this.area=data.result;
    });

    this.dataService.getAllSpec().subscribe(data => {
      this.spec=data.result;
    });
  }
  
  search() {
    let filteredDoctors:IDoctorResponse['result'];
    
      filteredDoctors = this.allDoctorsList;
      
      //TODO:spec es area szurese
      if((this.nameValue==="" && this.selectedArea===undefined && this.selectedSpec===undefined) || (this.nameValue==="" && this.selectedArea==="" && this.selectedSpec==="")){
        this.dataService.getAllDoctor().subscribe((data: IDoctorResponse) => {
          filteredDoctors = data.result;
        });
      }else{
        console.log("van filter")
        //nev szerint
        if(this.nameValue!==""){
          filteredDoctors = filteredDoctors.filter((doctor) =>
            doctor.value.name.toLowerCase().includes(this.nameValue.toLowerCase())
          );
        }
        //spec szerint
        if(this.selectedSpec!=="" && this.selectedSpec!==undefined){
          filteredDoctors = filteredDoctors.filter((doctor) =>
            doctor.value.speciality.includes(this.selectedSpec)
          );
        }

        //area szerint
        console.log(filteredDoctors)
        if(this.selectedArea!=="" && this.selectedArea!==undefined){
          filteredDoctors = filteredDoctors.filter((doctor) =>
            doctor.value.cities.includes(this.selectedArea)
          );
        }
      }

      this.doctorsList=filteredDoctors;
  }

  removeFilters(){
    this.doctorsList=this.allDoctorsList;
  }
  
}
