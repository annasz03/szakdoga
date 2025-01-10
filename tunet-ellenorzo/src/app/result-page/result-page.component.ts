import { Component } from '@angular/core';
import { ResultService } from '../result.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';
import { LocalService } from '../local.service';
import { DiseaseComponent } from '../disease/disease.component';


@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [CommonModule,MatTableModule, DiseaseComponent],
  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.css'
})
export class ResultPageComponent {
  result: any;

  constructor(private localStorage: LocalService, private resultService: ResultService, private dataService: DataService) {}

  ngOnInit() {
    this.result = this.resultService.getResult().result;
  }

  saveResult() {
    let tempNames = [];
    for (let index = 0; index < this.result.length; index++) {
      tempNames.push(this.result[index].key)      
    }

    let stringified = '['+tempNames+']';
    this.localStorage.saveData('elmentett', stringified);
  }
}
