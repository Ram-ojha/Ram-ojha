import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Global from "src/app/models/constants";
import { Observable, of } from "rxjs";
import { ApiResponse } from "src/app/models/api.model";
import {
  IHealthInsPlanUrlsResponse,
  IHealthInsPlanRequest,
  IFamilyMemberDetails,
  IPlansHealth,
  IRegUrlData,
} from "src/app/models/health-insu.Model";
import { convertToMydate } from "src/app/models/common-functions";
import { environment } from "src/environments/environment";

@Injectable()
export class HealthBuyPlanService {
  constructor(private _http: HttpClient) { }

  //#region  for health

  public getApplicationVehiclePlan(
    id: number,
    idOdp: number
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getHealthQuotationUrl(id, idOdp),
      Global.httpOptions
    );
  }

  getInsuranceCompanyPlan(
    data: IHealthInsPlanUrlsResponse,
    sumInsured: number,
    tanure: number
  ): Observable<ApiResponse> {
    const body: IHealthInsPlanRequest = {
      PartnerId: data.Partnerid,
      ProductCode: data.ProductCode,
      SumInsured: String(sumInsured),
      Tanure: String(tanure),
      ApplicationNo: data.ApplicationNo,
      ApplicationNoOdp: data.ApplicationNoOdp,
      PEDData: data.PEDData,
      stopLoader: true,
    };
    const endpoint = data.APIBaseUrl + data.APIMethod;
    return this._http.post<ApiResponse>(
      `${endpoint}`,
      body,
      Global.httpOptions
    );
  }

  public getHealthMasterData(
    id: number,
    idOdp: number,
    c_code: number,
    ProductCode: any = "0"
  ): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.getHealthMasterData(id, idOdp, c_code, ProductCode),
      Global.httpOptions
    );
  }

  public savehealthPraposal(
    ApplicationNo: number,
    ApplicationNoOdp: number,
    proposer: any,
    nominee: any,
    members: IFamilyMemberDetails[],
    QnA: any[],
    plan: IPlansHealth,
    regData: any,
    companyData: any,
    communicationAddressForm: any,
    ExtraLoading: number,
    proposer_insurer?: boolean | undefined,
    PlanType?: string
  ): Observable<ApiResponse> {

    console.log(communicationAddressForm);
    let DiscountRate = 0;
    if (companyData.HealthDiscountList != null) {
      for (var i = 0; i < companyData.HealthDiscountList.length; i++) {
        DiscountRate += companyData.HealthDiscountList[i].DiscountRate;
      }
    }
    let body = {
      ApplicationNo: ApplicationNo,
      ApplicationNoOdp: ApplicationNoOdp,
      PropGenderTitle: proposer.PropGenderTitle,
      PropFirstName: proposer.PropFirstName,
      PropLastName: proposer.PropLastName,
      PropDOB: convertToMydate(proposer.PropDOB),
      GenderCode: proposer.gender.GenderCode,
      GenderDesc: proposer.gender.GenderDesc,
      MarriedStatusCode: proposer.MarriedStatusCode,
      MarriedStatusDesc: proposer.MarriedStatusDesc,
      OccupationCode: proposer.OccupationCode,
      OccupationDesc: proposer.OccupationDesc,
      DesignationOrBusiness: proposer.DesignationOrBusiness,
      EmailId: proposer.EmailId,
      HeightInFeet: "", //proposer.HeightInFeet,
      HeightInInch: "", //proposer.HeightInInch,
      Weight: "", //proposer.Weight,
      MobileNo: proposer.MobileNo,
      PlanType: companyData.PartnerId,
      AddFlatNo: communicationAddressForm.AddFlatNo,
      AddArea:
        companyData.CompanyCode == "3"
          ? communicationAddressForm.AddArea.areaName
          : communicationAddressForm.AddArea,
      AddPincode: communicationAddressForm.AddPincode,
      AddCityCode:
        companyData.CompanyCode == "3"
          ? communicationAddressForm.city.city_id
          : communicationAddressForm.city,
      AddCityDesc:
        companyData.CompanyCode == "3"
          ? communicationAddressForm.city.city_name
          : communicationAddressForm.city,
      AddStateCode: communicationAddressForm.state,
      AddStateDesc: communicationAddressForm.state,

      AddAreaCode:
        companyData.CompanyCode == "3"
          ? communicationAddressForm.AddArea.areaID
          : communicationAddressForm.AddArea.Area, // added later
      AddAreaDesc:
        companyData.CompanyCode == "3"
          ? communicationAddressForm.AddArea.areaName
          : communicationAddressForm.AddArea.AreaDesc, // added later

      IdentityTypeCode: communicationAddressForm.identity.value,
      IdentityTypeDesc: communicationAddressForm.identity.viewValue,
      IdentityNo: communicationAddressForm.IdentityNo.replace(/ /g, ""),
      NomineeName: nominee.NomineeName,
      NomineeRelationCode: nominee.nominee.FamilyMemberCode,
      NomineeRelationDesc: nominee.nominee.FamilyMemberDesc,
      NomineeDOB: nominee.age != "" ? convertToMydate(nominee.age) : "",

      AppointeeName: nominee.AppointeeName,
      AppointeeRelationCode:
        nominee.AppointeeRelationCode.FamilyMemberCode != ""
          ? nominee.AppointeeRelationCode.FamilyMemberCode
          : "",
      AppointeeRelationDesc:
        nominee.AppointeeRelationCode.FamilyMemberCode != ""
          ? nominee.AppointeeRelationCode.FamilyMemberDesc
          : "",
      AppointeeDOB:
        nominee.AppointeeDOB != "" ? convertToMydate(nominee.AppointeeDOB) : "",
      AppointeeAddress:
        nominee.AppointeeAddress != "" ? nominee.AppointeeAddress : "",

      CompanyCode: plan.CompanyCode, //new
      ProductCode: plan.ProductCode,
      SumInsured: plan.SumInsured,
      PremiumPerYr: Math.round(companyData.Premium),

      PolicyTypeInd: members.length == 0 ? 0 : 1, // 0 for single 1 for multiple
      PolicyType: members.length == 0 ? "Individual" : "Floater",
      Tanure: companyData.Tanure,
      MemberList: members,
      MemberQueAnsList: QnA,
      RegistrationNo: regData.RegistrationNo,
      RegistrationNoOdp: regData.RegistrationNoOdp,
      ActualPremium: Math.round(companyData.ActualPremium),
      Discount: DiscountRate,
      DiscountAmount:
        companyData.HealthDiscountList != null
          ? Math.round(companyData.HealthDiscountList[0].TotalDiscountAmt)
          : 0,
      MedicalLoadingInd: ExtraLoading != 0 ? 1 : 0,
      PropAddFlatNo: proposer.AddFlatNo,
      PropAddArea:
        companyData.CompanyCode == "3"
          ? proposer.AddArea.areaName
          : proposer.AddArea,
      PropAddAreaCode:
        companyData.CompanyCode == "3" ? proposer.AddArea.areaID : "", // added later
      PropAddAreaDesc:
        companyData.CompanyCode == "3" ? proposer.AddArea.areaName : "", // added later
      PropAddPincode: proposer.AddPincode,
      PropAddCityCode:
        companyData.CompanyCode == "3" ? proposer.city.city_id : proposer.city,
      PropAddCityDesc:
        companyData.CompanyCode == "3"
          ? proposer.city.city_name
          : proposer.city,
      PropAddStateCode: +proposer.state || proposer.state,
      PropAddStateDesc: proposer.state,
      PropRelationCode: proposer.proposerRelationCode.FamilyMemberCode,
      PropRelationDesc: proposer.proposerRelationCode.FamilyMemberDesc,
      QuotationNo1: companyData.QuotationNo1,
      // Social values
      SocialStatus:
        communicationAddressForm.SocialStatusBpl ||
          communicationAddressForm.SocialStatusDisabled ||
          communicationAddressForm.SocialStatusInformal ||
          communicationAddressForm.SocialStatusUnorganized
          ? 1
          : 0,
      SocialStatusBpl: communicationAddressForm.SocialStatusBpl ? 1 : 0,
      SocialStatusDisabled: communicationAddressForm.SocialStatusDisabled
        ? 1
        : 0,
      SocialStatusInformal: communicationAddressForm.SocialStatusInformal
        ? 1
        : 0,
      SocialStatusUnorganized: communicationAddressForm.SocialStatusUnorganized
        ? 1
        : 0,
    };

    if (
      companyData.CompanyCode === "11" ||
      companyData.CompanyCode === "7" ||
      companyData.CompanyCode === "14"
    ) {
      //either reliance or sbi or hdfc-ergo
      // proposer

      if (!proposer_insurer) {
        body.PropAddStateCode = +communicationAddressForm.StateCode;
        body.PropAddStateDesc = communicationAddressForm.state;
        body.PropAddCityCode = +communicationAddressForm.CityCode;
        body.PropAddCityDesc = communicationAddressForm.city.toUpperCase();
        body.PropAddArea = communicationAddressForm.address;
      }
      if (proposer_insurer) {
        body.PropAddStateCode = +proposer.state;
        body.PropAddStateDesc = proposer.StateDesc;
        body.PropAddCityCode = +proposer.city.CityCode; // city value is object
        body.PropAddCityDesc = proposer.city.CityDesc; // city value is object
        body.PropAddArea = proposer.AddArea.AreaDesc;
      }
      body.PropAddAreaCode = isNaN(proposer.AddArea.Area)
        ? proposer.AddArea.Area
        : +proposer.AddArea.Area;
      body.PropAddAreaDesc = proposer.AddArea.AreaDesc;

      // member details
      body.AddStateCode = +communicationAddressForm.StateCode;

      body.AddArea = communicationAddressForm.address;
      body.AddAreaCode = isNaN(communicationAddressForm.AddArea.Area)
        ? communicationAddressForm.AddArea.Area
        : +communicationAddressForm.AddArea.Area;
      body.AddAreaDesc = communicationAddressForm.AddArea.AreaDesc;

      body.AddCityCode = +communicationAddressForm.CityCode;
      body.AddCityDesc = communicationAddressForm.CityDesc;
      if (companyData.CompanyCode == "14") body.PlanType = companyData.PartnerId;

    }
    if (companyData.CompanyCode === '18' ||
      companyData.CompanyCode === "10" || companyData.CompanyCode === '15' ||
      (companyData.CompanyCode === "12" && companyData.ProductCode == "NP")
    ) {
      // National
      let requestBody = { ...body, ...communicationAddressForm.tpa };
      body = requestBody;
    }

    console.log("body -->", JSON.stringify(body));
    return this._http.post<ApiResponse>(
      Global.savehealthPraposal,
      body,
      Global.httpOptions
    );
  }

  getHealthProposerNo(data: IRegUrlData): Observable<ApiResponse> {
    const endpoint = data.APIBaseUrl + data.APIMethod;
    return this._http.post<ApiResponse>(
      `${endpoint}`,
      data,
      Global.httpOptions
    );
  }
  GetReligarePolicyPdf(url: string, proposalNo: any, appNo: any, regNo: any): Observable<ApiResponse> {
    const data = {
      ApplicationNo: appNo,
      RegistrationNo: regNo,
      ProposalNumber: proposalNo,
    };
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }
  GetStarPolicyPdf(data: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.GetStarPolicyPdf(data),
      Global.httpOptions
    );
  }

  GetFuturePolicyPdf(url: any, data: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }

  GetUniversalSompoHealth(url: any, data: any) {
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }

  GetGoDigitHealth(url: any, data: any) {
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }

  GetTataAIGHealth(url: any, data: any) {
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }

  GetNationalInsuranceHealth(url: any, data: any) {
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }

  getReliance(url: any, data: any) {
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }

  getNivaBupa(url: any, data: any) {
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }
  GetAfterPaymentHealthPolicyStatus(RegNo: string) {
    return this._http.post<ApiResponse>(Global.GetAfterPaymentHealthPolicyStatus(RegNo), null)
  }

  getIffcoTokio(url: any, data: any) {
    return this._http.post<ApiResponse>(url, data, Global.httpOptions);
  }

  getAreaByCity(pincode: string, cityId: number) {
    return this._http.get(Global.getAreaByCity(pincode, cityId));
  }

  getAreaByStateCityPincode(
    stateCode: string,
    cityId: string,
    pincode: string
  ) {
    return this._http.get(
      Global.getAreaByStateCityPincode(stateCode, cityId, pincode)
    );
  }

  getAreaByStateCityPincodeHDFC(
    stateCode: string,
    cityId: string,
    pincode: string
  ) {
    return this._http.get(
      Global.getAreaByStateCityPincodeHDFC(stateCode, cityId, pincode)
    );
  }

  getAreaByStateCityPincodeForSBI(
    stateCode: string,
    cityId: string,
    pincode: string
  ) {
    return this._http.get(
      Global.getAreaByStateCityPincodeForSBI(stateCode, cityId, pincode)
    );
  }

  //TPA For Oriental Health

  getDetailsForTPAOriental(Qno: string) {

    return this._http.get(Global.getTPAMaster(Qno));
  }
  //#endregion
}
