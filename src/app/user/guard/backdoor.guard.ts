import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../servcies/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BackdoorGuard implements CanActivate {

  constructor(
    private _router : Router,
    private _auth : AuthService
  ){

  }

  canActivate(){
    if(this._auth.isLoggedIn()){
      return true;
    }
    else{
      this._router.navigate(['/login']);
      return false;
    }
  }
  
}
