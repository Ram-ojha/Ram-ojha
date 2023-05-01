import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Global from "src/app/models/constants";
import { Observable } from "rxjs";
import { ApiResponse } from "src/app/models/api.model";
import { tap } from "rxjs/operators";
import { IBikeBrands } from "src/app/models/bike-insu.Model";

@Injectable()
export class PosBikeService {
  private _bikeManufacturers: IBikeBrands[] | undefined;

  constructor(private _http: HttpClient) {}
  // apiHost = this.configService.config.apiUrl;
  //#region  for bike first step

  public getBikeManufacturar(
    InsuranceCateCode: number
  ): Observable<ApiResponse> {
    return this._http
      .get<ApiResponse>(Global.getBikeManufacturer + InsuranceCateCode)
      .pipe(tap((res: ApiResponse) => (this._bikeManufacturers = res.data)));
  }
  public get BikeManufacturarList() {
    return this._bikeManufacturers;
  }
  public getBikeModel(BikeManufCode: number): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(Global.getBikeModal + BikeManufCode);
  }
  public getBikeVarient(BikeModelCode: number): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(Global.getBikeVariant + BikeModelCode);
  }
  //#endregion
}
