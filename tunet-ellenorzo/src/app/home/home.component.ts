import { Component, inject, ViewChild } from '@angular/core';
import { Firestore, getDocs, query, orderBy, limit, startAfter, getCountFromServer } from '@angular/fire/firestore';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { I18NextModule } from 'angular-i18next';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [I18NextModule, MatPaginatorModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  areas: any[] = [];
  loading = true;
  totalItems: number = 0;
  pageSize = 10;
  lastVisible: any = null;

  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private firestore: Firestore) {}

  navigateToSymptomChecker() {
    this.router.navigateByUrl('/symptom-checker');
  }
}
