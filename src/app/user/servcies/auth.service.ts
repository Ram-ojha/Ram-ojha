import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import{HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  aoiUrl= "https://api.publicapis.org/entries";
  get: any;
  constructor(
    private _router : Router,
    private _http:HttpClient
  ) { }

  getall(){
   return this._http.get(this.aoiUrl);
  }

  isLoggedIn(){
    if(localStorage.getItem("jwt_token")){
      return true;
    }
    else{
      return false;
    }
  }

  logout(){
    localStorage.removeItem("jwt_token");
    this._router.navigate(["/"]);
  }
}
