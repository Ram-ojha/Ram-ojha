import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Global from "../../models/constants";
import { Observable, Subject } from "rxjs";
import { tap, map, shareReplay } from "rxjs/operators";
import { ApiResponse } from "../../models/api.model";
import {
  IRtos,
  IRegistrationYear,
  IFuel,
  ApplicationVehicleData,
} from "../../models/common.Model";

@Injectable()
export class PosHomeService {
  private _navLinks: any[] | undefined;
  private _rtosList: IRtos[] | undefined;
  private _registrationYear: IRegistrationYear[] | undefined;
  private _fuels: IFuel[] | undefined;
  public listenTosideBar = new Subject<boolean>();
  //private _policyExpired: IPolicyExpired[] | undefined;
  constructor(private _http: HttpClient) { }

  // httpOption = {
  //     headers: new HttpHeaders().set('Authorization', this._authService.getToken())
  // }
  public insuranceTypeMenu = this.getInsuranceType().pipe(shareReplay(1));

  public getInsuranceType(): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(Global.getInsuranceType);
  }
  public get InsuranceTypeList() {
    return this._navLinks;
  }
  public getPolicyType(InsuranceCateCode: number): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getInsuranceSubType + InsuranceCateCode
    );
  }
  public getRto(InsuranceCateCode: string | number): Observable<ApiResponse> {
    return this._http
      .get<ApiResponse>(Global.getRtoList + InsuranceCateCode)
      .pipe(
        tap((res: ApiResponse) => {
          this._rtosList = res.data;
        })
      );
  }
  public get RtosList() {
    return this._rtosList;
  }
  public getPolicyExpiredList(
    InsuranceCateCode: number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.whenDidPolicyExpireList + InsuranceCateCode
    );
  }

  public getPreviousPolicyCompanyList(): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(Global.GetPreviousInsurerCompany
    )
  }

  public getPolicyExpiryType(
    InsuranceCateCode: number,
    SubCateCode: number,
    VehicleRegistrationYrDesc: string
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getPreviousPolicyTypeList(
        InsuranceCateCode,
        SubCateCode,
        VehicleRegistrationYrDesc
      )
    );
  }


  public getRegYearFuelList(
    InsuranceCateCode: number
  ): Observable<ApiResponse> {
    return this._http
      .get<ApiResponse>(Global.getFuelYearList + InsuranceCateCode)
      .pipe(
        tap((res: ApiResponse) => {
          (this._registrationYear = res.data.Table1),
            (this._fuels = res.data.Table);
        })
      );
  }

  public getCKYCDocList(compCode: any): Observable<ApiResponse> {
    return this._http
      .get<ApiResponse>(Global.GetCKYCDocumentList(compCode))
  }


  public postCKYCBajajDetails(ckycData: any): Observable<ApiResponse> {
    return this._http
      .post<ApiResponse>(Global.BajajValidateCKYC, ckycData)
  }

  public postCKYCUniversalDetails(ckycData: any): Observable<ApiResponse> {
    return this._http
      .post<ApiResponse>(Global.UniversalValidateCKYC, ckycData)
  }

  // BajajValidateCKYCDocUplode
  public postBajajValidateCKYCDocUplode(ckycData: any): Observable<ApiResponse> {
    return this._http
      .post<ApiResponse>(Global.BajajValidateCKYCDocUplode, ckycData)
  }
  //Futue Ckyc 
  public FutureGenCKYCDetails(ckycData: any) {
    return this._http.post<ApiResponse>(Global.FutureGenValidateCKYC, ckycData)
  }

  public OrientalCKYCGet(ckycData: any) {
    return this._http.post<ApiResponse>(Global.OrientalCkyc, ckycData)
  }
  public OrientalCKYCStatus(ckycData: any) {
    return this._http.post<ApiResponse>(Global.OrientalCkycStatus, ckycData)
  }
  //TataAgi Ckyc 
  public TataAigGenCKYCDetails(ckycData: any, apiType: string) {
    if (apiType === "fetch") {
      return this._http.post<ApiResponse>(Global.TataAigGenValidateCKYC, ckycData)
    }
    if (apiType === "form60") {
      return this._http.post<ApiResponse>(Global.TATAAIGValidateCKYCDocUplode, ckycData)
    }
    if (apiType === "anotherId") {
      return this._http.post<ApiResponse>(Global.TATAAIGValidateCKYCWAnotherid, ckycData)
    }
    if (apiType === "otp") {
      return this._http.post<ApiResponse>(Global.TATAAIGSubmitOTP, ckycData)
    }
    if (apiType === "status") {
      return this._http.post<ApiResponse>(Global.TATAAIGFetch, ckycData)

    }
    return;
  }
  //SBI Ckyc 
  public postCkycSBIStauts(ckycData: any) {
    return this._http.post<ApiResponse>(Global.SBIValidateCKYC, ckycData)
  }


  // Reliance Ckyc
  public RelianceCKYCDetails(ckycData: any, apiType: string): any {
    if (apiType === "fetch") {
      return this._http.post<ApiResponse>(Global.RelianceValidateCKYC, ckycData)
    }
    if (apiType === "status") {
      return this._http.get<ApiResponse>(Global.RelianceCheckCKYCStatus(ckycData.ApplicationNo, ckycData.UniqueId, ckycData.CompanyCode))
    }
  }

  //ShreeRam Ckyc
  public ShreeRamCKYCDetails(ckycData: any) {
    return this._http.post<ApiResponse>(Global.ShreeRamValidateCkyc, ckycData)
  }

  //IffcoTokio Ckyc
  public IffcoTokioCKYCDetails(ckycData: any, apiType: string) {
    if (apiType === "fetch") {
      return this._http.post<ApiResponse>(Global.IffcoTokioValidateCkyc, ckycData)
    }
    if (apiType === "create") {
      return this._http.post<ApiResponse>(Global.IFFCOTOKIOCreateCKYC, ckycData)
    }
    if (apiType === "upload") {
      return this._http.post<ApiResponse>(Global.IFFCOTOKIOUploadCKYC, ckycData)
    }
    return;
  }

  //New India Ckyc
  public NewIndiaCKYDetails(ckycData: any, apiType: string) {
    if (apiType === "validate") {
      return this._http.post<ApiResponse>(Global.GetCKYCNewIndiaInfo, ckycData)
    }
    if (apiType === "status") {
      return this._http.post<ApiResponse>(Global.GetCKYCNewIndiaStatus, ckycData)

    }
    return
  }


  public get RegYearList() {
    return this._registrationYear;
  }
  public get FuelList() {
    return this._fuels;
  }
  public saveQuates(vehicle: ApplicationVehicleData): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.saveQuotation,
      vehicle,
      Global.httpOptions
    );
  }
  public saveQuatesAfterDateChange(vehicle: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.saveQuoteAfterChangingYear,
      vehicle,
      Global.httpOptions
    );
  }
  public getVehicleInfoByNumber(
    vehicleNumber: string
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getVehicleInfoByNumber + vehicleNumber,
      Global.httpOptions
    );
  }

  //cv

  public GetVehicleUse(): Observable<ApiResponse> {

    return this._http.get<ApiResponse>(Global.getVehicleUse);
  }
}
