import { Component } from '@angular/core';
import { LocalService } from '../local.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { MatTableModule } from '@angular/material/table';
import { DiseaseComponent } from '../disease/disease.component';
import { SavedDisComponent } from '../saved-dis/saved-dis.component';

@Component({
  selector: 'app-saved-diseases',
  standalone: true,
  imports: [CommonModule, MatTableModule, DiseaseComponent, SavedDisComponent],
  templateUrl: './saved-diseases.component.html',
  styleUrl: './saved-diseases.component.css'
})
export class SavedDiseasesComponent {

  constructor(private localStorage: LocalService, private dataService: DataService){}

  savedDiseases: string[][] = [];
  errorMessage="";

  ngOnInit(){
    //TODO: hibakezeles ha nincs elmentve
    let temp=this.localStorage.getData("elmentett")!;
    if(temp===null){
      this.errorMessage="Nem lett még elmentve!"
    }else{
      this.savedDiseases=temp.split("],").map(group => {
        return group.replace(/\[|\]/g, "").split(",");
      });
    }
  }

  openSaved(saved:string[]){
  }
}
