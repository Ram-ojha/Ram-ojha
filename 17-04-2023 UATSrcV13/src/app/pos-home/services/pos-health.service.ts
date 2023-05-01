import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiResponse } from "src/app/models/api.model";
import { Observable } from "rxjs";
import * as Global from "src/app/models/constants";
import { tap } from "rxjs/operators";
import { IHealthData } from "src/app/models/health-insu.Model";

@Injectable()
export class PosHealthService {
  private _healthData: IHealthData | undefined;

  constructor(private _http: HttpClient) {}

  public gethealthData(): Observable<ApiResponse> {
    return this._http
      .get<ApiResponse>(Global.GetHealthInsuranceData)
      .pipe(tap((res: ApiResponse) => (this._healthData = res.data)));
  }
  public get healthDataList() {
    return this._healthData;
  }

  public saveHealthQuates(body: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.saveHealthApplicationData,
      body,
      Global.httpOptions
    );
  }
}
