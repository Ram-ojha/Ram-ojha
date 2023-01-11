import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _router : Router
  ) { }

  isAdminLoggedIn(){
    if(localStorage.getItem("admin_token")){
      return true;
    }
    else{
      return false;
    }

  }

  adminLogout(){
    localStorage.removeItem("admin_token");
    this._router.navigate(["/"]);
  }
}
