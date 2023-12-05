import { ApplicationVehicleRegData, IApplicationVehicleRegData } from "./../../models/bike-insu.Model";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as Global from "src/app/models/constants";
import { Observable } from "rxjs";
import { ApiResponse } from "src/app/models/api.model";
import { tap } from "rxjs/operators";
import {
  IVehiclePraposal,
  RegistrationVehicleData,
  ApplicationVehiclePlan,
} from "src/app/models/bike-insu.Model";
import { paymentRequestData } from "../cv-insurance/cv-payment/cv-payment.component";
import { IBreakInCase } from "../bike-insurance/review-pay/review-pay.component";
import { IPolicyPDFDocDownload } from "src/app/models/common.Model";

@Injectable()
export class VehicleBuyPlanService {
  private _vehiclePraposal: IVehiclePraposal | undefined;

  constructor(private _http: HttpClient) { }

  //#region  for bike buy plan
  public getPraposalMaster(CompanyCode: any): Observable<ApiResponse> {
    return this._http
      .get<ApiResponse>(Global.getVehicleProposalData(CompanyCode))
      .pipe(tap((res: ApiResponse) => (this._vehiclePraposal = res.data)));
  }
  public get PraposalMasterData() {
    return this._vehiclePraposal;
  }
  public savePraposal(
    data: IApplicationVehicleRegData
  ): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.saveProposalFormDetails,
      data,
      Global.httpOptions
    );
  }
  public saveSelectedPlan(
    data: ApplicationVehiclePlan
  ): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.saveUserSelectionsOnQuotationPage,
      data,
      Global.httpOptions
    );
  }
  public getApplicationVehiclePlan(
    id: number,
    idOdp: number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getQuotationDetails(id, idOdp),
      Global.httpOptions
    );
  }
  public getSavedPraposalData(
    id: number,
    idOdp: number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getDataOnProposalFormLoad(id, idOdp),
      Global.httpOptions
    );
  }
  public getBikeQuotationUrls(
    id: number,
    idOdp: number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getBikeQuotationUrls(id, idOdp),
      Global.httpOptions
    );
  }
  public getInsuranceCompanyPlan(data: any): Observable<ApiResponse> {
    const endpoint = data.APIBaseUrl + data.APIMethod;
    return this._http.post<ApiResponse>(
      `${endpoint}`,
      data,
      Global.httpOptions
    );
  }
  public getCarQuotationUrls(
    id: number,
    idOdp: number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getCarQuotationUrls(id, idOdp),
      Global.httpOptions
    );
  }
  // For bike idv value
  public GetIDVValue(data: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.getIdv,
      data,
      Global.httpOptions
    );
  }
  // For new bike registeration
  public vehicleProposalRequest(
    data: any,
    apiUrl: any
  ): Observable<ApiResponse> {
    var baseUrl = apiUrl.APIBaseUrl + apiUrl.APIMethod;
    return this._http.post<ApiResponse>(`${baseUrl}`, data, Global.httpOptions);
  }
  GetUpdatePaymentReq(apiUrl: paymentRequestData) {
    var baseUrl = apiUrl.APIBaseUrl + apiUrl.APIMethod;
    return this._http.post<ApiResponse>(
      `${baseUrl}`,
      apiUrl,
      Global.httpOptions
    );
  }


  GetDownloadPolicyPdf(data: IPolicyPDFDocDownload) {
    // var baseUrl = apiUrl.APIBaseUrl + apiUrl.APIMethod;
    console.log("Service", data);
    return this._http.post<ApiResponse>(Global.PolicyPDFDocDownload, data, Global.httpOptions);
  }


  GetDownloadPolicyReqIFFCOTOKOI(apiUrl: string, data: any) {
    // var baseUrl = apiUrl.APIBaseUrl + apiUrl.APIMethod;
    console.log("Service", data);
    return this._http.post<ApiResponse>(`${apiUrl}`, data, Global.httpOptions);
  }

  GetDownloadPolicyReqGoDigit(apiUrl: string, data: any) {
    // var baseUrl = apiUrl.APIBaseUrl + apiUrl.APIMethod;
    console.log("Service", data);
    return this._http.post<ApiResponse>(`${apiUrl}`, data, Global.httpOptions);
  }
  GetDataAfterPayment(RegistrationNo: any, ApplicationNo: any) {
    return this._http.get<ApiResponse>(
      Global.getDataAfterPayment(RegistrationNo, ApplicationNo)
    );
  }
  GetDataAfterPaymentByKey(key: string) {
    return this._http.get<ApiResponse>(Global.getDataAfterPaymentByKey + key);
  }

  GetSbiDataAfterPayment(key: string) {
    return this._http.get<ApiResponse>(Global.getSbiDataAfterPayment + key);
  }

  GetDownloadPolicySBIG(policyNo: string) {
    return this._http.get<ApiResponse>(Global.DownloadPolicySBIG + policyNo);
  }
  GetDistrict(State: string) {
    return this._http.get<ApiResponse>(Global.getDistrict(State));
    // return this._http.get<ApiResponse>(apiHost + `PosHome/GetPincodeList?CityName=${City}`);
    // https://hbwebsiteapi.azurewebsites.net/api/PosHome/GetPincodeList?CityName=Indore
    // https://hbwebsiteapi.azurewebsites.net/api/VehicleData/GetPincodeListByDistrict?District=Delhi
  }

  GetCity(State: string, District: number) {
    return this._http.get<ApiResponse>(Global.getCity(State, District));
    // return this._http.get<ApiResponse>(apiHost + `PosHome/GetPincodeList?CityName=${City}`);
    // https://hbwebsiteapi.azurewebsites.net/api/PosHome/GetPincodeList?CityName=Indore
    // https://hbwebsiteapi.azurewebsites.net/api/VehicleData/GetPincodeListByDistrict?District=Delhi
  }
  GetPincode(City: any, State: string) {
    return this._http.get<ApiResponse>(Global.getPincode(City, State));
    // return this._http.get<ApiResponse>(apiHost + `PosHome/GetPincodeList?CityName=${City}`);
    // https://hbwebsiteapi.azurewebsites.net/api/PosHome/GetPincodeList?CityName=Indore
    // https://hbwebsiteapi.azurewebsites.net/api/VehicleData/GetPincodeListByDistrict?District=Delhi
  }

  GetPincodeSBI(StateCode: string, DistrictCode: number, CityCode: number) {
    return this._http.get<ApiResponse>(Global.getPincodeSBI(StateCode, DistrictCode, CityCode));
    // return this._http.get<ApiResponse>(apiHost + `PosHome/GetPincodeList?CityName=${City}`);
    // https://hbwebsiteapi.azurewebsites.net/api/PosHome/GetPincodeList?CityName=Indore
    // https://hbwebsiteapi.azurewebsites.net/api/VehicleData/GetPincodeListByDistrict?District=Delhi
  }
  GetPreviousInsurerByCompanyCode(CompanyCode: string) {
    return this._http.get<ApiResponse>(
      Global.getPreviousInsurerByCompanyCode + CompanyCode
    );
  }
  // BreakInCase
  BreakInInpection(data: IBreakInCase) {
    console.log("Service", data);
    // api/IFFCOTOKIO/BreakInInpection
    return this._http.post<ApiResponse>(
      Global.breakInInspectionIffcoTokio,
      data,
      Global.httpOptions
    );
  }
  BreakInInpectionCheckStatus(RefID: string | number) {
    return this._http.get<ApiResponse>(
      Global.checkIffcoTokioBreakinInspectionStatus + RefID
    );
  }
  // Getting car addons
  GetAddonsForPrivateCar() {
    return this._http.get<ApiResponse>(Global.getAddonsListForPrivateCar);
  }

  //cv addons 
  getAddonsListForCV() {
    return this._http.get<ApiResponse>(Global.getAddonsListForCV);
  }
  //#endregion
  //getUpdatedNCB
  getUpdatedNCB(ApplicationNo: number, CurrentNCB: any, PreviousNCB: any) {
    return this._http.get<ApiResponse>(
      Global.updateNCB(ApplicationNo, CurrentNCB, PreviousNCB)
    );
  }

  public getPolicyPdfURL(url: string): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(url);
  }

  public postPolicyPdfURL(url: string): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(url, null);
  }

  public getPolicyPdfAsBlob(url: string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set("Accept", "application/pdf");
    return this._http.get(url, { headers: headers, responseType: "blob" });
    // return this._http.get<ApiResponse>(url);
  }

  public saveProposalRequest(requestObj: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.saveProposalRequest,
      requestObj,
      Global.httpOptions
    );
  }

  public shareQuotes(requestObj: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.shareQuotes,
      requestObj,
      Global.httpOptions
    );
  }

  public shareUrl(requestObj: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.shareUrl,
      requestObj,
      Global.httpOptions
    );
  }

  // public sharePdf(reqObj: any): Observable<ApiResponse> {
  //   return this._http.post<ApiResponse>(
  //     Global.SharePdf,
  //     reqObj,
  //     Global.httpOptions
  //   );
  // }

  public GetApplicationDetails(policyData: { ApplicationNo: any; ApplicationNoOdp: any; RegistrationNo: any; RegistrationNoOdp: any; }): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(Global.GetAppData, policyData)
  }

  public SetExpTime(ApplicationNo: string, ApplicationNoOdp: string, RegistrationNo: string, RegistrationNoOdp: string) {
    const sharedData = {
      ApplicationNo: ApplicationNo,
      ApplicationNoOdp: ApplicationNoOdp,
      RegistrationNo: RegistrationNo,
      RegistrationNoOdp: RegistrationNoOdp
    }
    return this._http.post<ApiResponse>(Global.getExpTimeofSharedUrl, sharedData);
  }
  public setTimeLimit(SharedData: any) {

    return this._http.post<ApiResponse>(Global.getExpTimeLimit, SharedData);
  }

  public OnPaymentClicked(PolicyDetails: any) {
    // const sharedData = {
    //   ApplicationNo: ApplicationNo,
    //   ApplicationNoOdp: ApplicationNoOdp,
    //   RegistrationNo: RegistrationNo,
    //   RegistrationNoOdp:RegistrationNoOdp
    // }
    return this._http.post<ApiResponse>(Global.onPaymentClick, PolicyDetails);

  }


  getGoDigitValidateCKYC(ValidateCKYC: any) {
    return this._http.post<any>(Global.GoDigitValidateCKYC, ValidateCKYC)
  }

  getUnitedIndiaValidateCKYC(ValidateCKYC: any) {
    return this._http.post<any>(Global.GetCKYCUnitedIndia, ValidateCKYC)
  }


  NivabupaValidateCKYC(ValidateCKYC: any) {
    return this._http.post<any>(Global.ValidateCKYCForNivabupa, ValidateCKYC)
  }

  NivabupaValidateCkucStatusCHeck(ApNO: any, PartnerRequestId: any) {
    return this._http.post<any>(Global.CkycStatusCheckNivabupa(ApNO, PartnerRequestId), null)
  }

  getHdfcValidateCkyc(ckycData: { ApplicationNo: any; CompanyCode: any; DocumentNo: any; CompanyName: string; DOB: string; DocShortDesc: any; DocDesc: any; Name: any; Gender: any; CKYCStepDesc: number; }) {
    return this._http.post<any>(Global.ValidateCkycForHDFC, ckycData)
  }

  public getGoDigitCkycStatus(ApplicationNo: any, PolicyNo: any) {
    // const sharedData = {
    //   ApplicationNo: ApplicationNo,
    //   ApplicationNoOdp: ApplicationNoOdp,
    //   RegistrationNo: RegistrationNo,
    //   RegistrationNoOdp:RegistrationNoOdp
    // }
    return this._http.post<ApiResponse>(Global.GoDigitCKYCStatus(ApplicationNo, PolicyNo), null);

  }


  public postSBICheckCKYCStatusAfterPayment(ApplicationNo: any) {
    // const sharedData = {
    //   ApplicationNo: ApplicationNo,
    //   ApplicationNoOdp: ApplicationNoOdp,
    //   RegistrationNo: RegistrationNo,
    //   RegistrationNoOdp:RegistrationNoOdp
    // }
    return this._http.post<ApiResponse>(Global.SBICheckCKYCStatusAfterPayment(ApplicationNo), null);

  }
  //CkycDocumentUploadStatus
  public getCkycDocUploadStatusFuture(proposalId: any) {
    return this._http.get<ApiResponse>(Global.CkycDocumentUploadStatusFuture(proposalId));
  }

}
