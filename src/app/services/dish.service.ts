import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DishService {

  apiUrl = environment.API_URL+"/api/dish";
  constructor(private _http: HttpClient) { }

  getAll(){
    return this._http.get<any>(this.apiUrl);
  }

  save(obj:any){
    return this._http.post<any>(this.apiUrl, obj);
  }

  delete(obj:any){
    return this._http.delete<any>(this.apiUrl+"/"+obj._id);
  }

  update(obj:any){
    return this._http.put<any>(this.apiUrl+"/"+obj._id, obj);
  }
}
