import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Global from "src/app/models/constants";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { ApiResponse } from "src/app/models/api.model";
import { ICarBrands } from "src/app/models/car-insu.Model";

@Injectable()
export class PosCarService {
  private _carBrands: ICarBrands[] | undefined;

  constructor(private _http: HttpClient) {}

  public getCarBrand(InsuranceCateCode: number): Observable<ApiResponse> {
    return this._http
      .get<ApiResponse>(Global.getCarBrand + InsuranceCateCode)
      .pipe(tap((res: ApiResponse) => (this._carBrands = res.data)));
  }
  public get CarBrandList() {
    return this._carBrands;
  }

  public getCarModel(CarManufCode: number): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(Global.getCarModel + CarManufCode);
  }
  public getCarVarient(
    CarModelCode: number,
    FuelTypeCode: number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getCarVariant(CarModelCode, FuelTypeCode)
    );
  }
  // public saveQuates(vehicle: ApplicationVehicleData): Observable<ApiResponse> {
  //     return this._http.post<ApiResponse>(apiHost + 'ApplicationVehicleData/SaveApplicationData', vehicle, httpOptions);
  // }
}
