import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse } from 'src/app/models/api.model';
import { ICarBrands } from 'src/app/models/car-insu.Model';
import * as Global from "src/app/models/constants";

@Injectable({
  providedIn: 'root'
})
export class PosCvServiceService {
private _cvBrands: ICarBrands[] | undefined;
  constructor(private _http: HttpClient) { }
 
  public getCvVehicleType():Observable<ApiResponse> {
return  this._http.get<ApiResponse>(Global.getCVVehicleType)
  }

  public getCVMake(InsuranceCateCode: number,VehicleTypeId:number): Observable<ApiResponse> {
    return this._http
      .get<ApiResponse>(Global.getCVMake(InsuranceCateCode,VehicleTypeId))
      .pipe(tap((res: ApiResponse) => (this._cvBrands = res.data)));
  }
  public get CvBrandList() {
    return this._cvBrands;
  }

  public getCVModel(MakeCode: number,VehicleTypeId:number): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(Global.getCVModal(MakeCode,VehicleTypeId));
  }
  public getCVVarient(
    ModelCode: number,
    FuelTypeCode: number,
    VehicleTypeId:number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getCVVariant(ModelCode, FuelTypeCode,VehicleTypeId)
    );
  }
}
