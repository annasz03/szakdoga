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
    this.requestPermission()
  }

  subscribeToPush(){
    this.swPush.messages.subscribe((res:any) => {
      console.log(res)
    })
  }

  async requestPermission(){
    const messaging = getMessaging()
    try{
      const permission = await Notification.requestPermission();
      if(permission==='granted'){
        console.log("Notification permission granted")
        const token = await getToken(messaging, {vapidKey: "BHOITvdfR1Rxq2avMamPKhsTfuDhqSCFm7I-oOA8OmoSWN6onoOHJ9MVEFP5kYtW_DEi1dq1mumdCXW9kiV6aSI"})
        console.log(token)
      }else {
        console.log("unable to get permission")
      }

    }catch(err){
      console.log(err)
    }
  }
}
