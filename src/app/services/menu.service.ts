import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  apiUrl = environment.API_URL+"/api/menu";
  constructor(private _http : HttpClient) { }

  getAll(){
    return this._http.get<any>(this.apiUrl);
  }
  add(data:any){
    return this._http.post<any>(this.apiUrl, data);
  }
  delete(data:any){
    return this._http.delete<any>(this.apiUrl+"/"+data._id);
  }
  update(data:any){
    return this._http.put<any>(this.apiUrl+"/"+data._id, data);
  }
  get(id:any){
    return this._http.get<any>(this.apiUrl+"/"+id);
  }
  
  


}
