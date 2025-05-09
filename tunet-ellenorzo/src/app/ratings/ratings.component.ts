import { HttpClient } from '@angular/common/http';
import { Component, inject, Input } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, I18NextModule],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.css'
})
export class RatingsComponent {
  userService = inject(UserService)

  @Input() rating:any;
  username="";
  
  constructor(){}

  ngOnInit() {
    this.userService.getUsernameById(this.rating.createdBy).subscribe({
      next: (res) => {
        this.username = res.username;
      },
    });
  }
}
