import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {SwPush} from "@angular/service-worker"
import { getToken, getMessaging, Messaging } from '@angular/fire/messaging';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthPageComponent, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'tunet-ellenorzo';
  curr='';

  message:any;

  constructor( private router: Router, private swPush:SwPush) {
  }

  isAuthPage(curr: string): boolean {
    if(this.router.url === '/login' || this.router.url === '/register' || this.router.url === '/auth')
    {
      return false
    }
      return true;
  }

  ngOnInit(): void {
    this.subscribeToPush();
  }

  subscribeToPush(): void {
    this.swPush.messages.subscribe(
      (res: any) => {
        console.log(res, " Message to show in the notificaiton ");
      }
    );
  }
}
