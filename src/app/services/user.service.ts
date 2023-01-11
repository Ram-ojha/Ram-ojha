import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiUrlSignup = environment.API_URL+"/api/user/signup";
  apiUrlAuth = environment.API_URL+"/api/user/auth";

  constructor(private _http : HttpClient) { }

  signup(obj:any){
    return this._http.post<any>(this.apiUrlSignup, obj);
  }
  do_login(obj:any){
    return this._http.post<any>(this.apiUrlAuth, obj);
  }

}
