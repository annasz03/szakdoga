import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [I18NextModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToSymptomChecker(){
    this.router.navigateByUrl('/symptom-checker')
  }
}
