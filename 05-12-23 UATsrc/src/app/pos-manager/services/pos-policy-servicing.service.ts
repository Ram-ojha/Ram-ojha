import { tap } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Global from "src/app/models/constants";
import { Observable } from "rxjs";
import { ApiResponse } from "src/app/models/api.model";
import { DatePipe } from "@angular/common";

@Injectable()
export class PolicyServicingApiService {
  constructor(private _http: HttpClient, private datePipe: DatePipe) { }
  private _navLinks: any[] | undefined;

  //   public DownloadPOSCertificate(): Observable<ApiResponse> {
  //     return this._http.get<ApiResponse>(`${apiHost}PosHome/DownloadPOSCertificate`, httpOptions);
  //   }

  public getHealthMasterData(
    id: number,
    idOdp: number,
    c_code: number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      `${Global.apiHost}Health/GetHealthRegData?ApplicationNo=${id}&ApplicationNoOdp=${idOdp}&CompanyCode=${c_code}`,
      Global.httpOptions
    );
  }
  public getPolicyServicingDropdown(): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getPolicyServicingDropdown,
      Global.httpOptions
    );
  }
  public getAllPolicyServicing(policydata: any): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getAllPolicyServicing(policydata),
      Global.httpOptions
    );
  }

  public getPolicyCheckStatus(regNo: number): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.apiHost + regNo,
      Global.httpOptions
    );
  }

  public getPaymentDone(regNo: number): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getPaymentDone + regNo,
      Global.httpOptions
    );
  }

  public PolicyServicingUpdate(PosPolicyUpdate: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.PolicyServicingUpdate,
      PosPolicyUpdate,
      Global.httpOptions
    );
  }

  public PosProfile(): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(Global.PosProfile);
  }

  public policySearch(indication: Number): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.policySearch + indication,
      Global.httpOptions
    );
  }

  public getPolicyPdf(url: string): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(url);
  }

  public getPosProfileDetail() {
    return this._http.get<ApiResponse>(Global.getPOSProfileDetails);
  }


  public getPosExpiryPolicies(DateFromTo: any) {
    return this._http.post<ApiResponse>(Global.getPosExpiryPolicies, DateFromTo);
  }

}
