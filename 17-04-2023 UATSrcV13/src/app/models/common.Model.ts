import { IFamilyMemberDetails } from "./health-insu.Model";
// ------------  public interfaces   --------------

//#region all common interfaces
export interface IYesNoInd {
  value: string;
  viewValue: string;
}
export interface IList {
  id: number;
  value: string;
}
export interface IInsuranceType {
  InsuranceCateCode: number;
  InsuranceCateDesc: string;
  IconString: string;
  RouteUrl: string;
  PriorityCode: number;
}
export interface IInsuranceSubType {
  SubCateCode: number;
  SubCateDesc: string;
}
export interface IRtos {
  RTOCode: number;
  RTODisplayName: string;
  RTODisplayNameNew: string;
  RTOGovCode: string;
}
export interface IPolicyExpired {
  BikeExpiryCode: number;
  BikeExpiryDesc: string;
}
export interface IRegistrationYear {
  RegistrationYearCode: number;
  RegistrationYearDesc: string;
}
export interface IFuel {
  FuelTypeCode: number;
  FuelTypeDesc: string;
}
export interface IState {
  StateCode: string;
  StateCodeGov: string;
  StateDesc: string;
  StateShortDesc: string;
}
export interface IDistrict {
  District_Name: string;
  District_code: number;
  State_code: string;
}
export interface ICity {
  CityCode: string;
  CityCodeGov: number;
  StateCode: string;
  CityDesc: string;
  StateDesc: any;
  city_name: string;
}

export interface ICitySBI {

  City_Name: string;
  City_code: number;
  District_Code: number
  State_code: string

}

export interface IPincode {
  PincodeArea: any;
  StateDesc: any;

  StateCode: string;
  CityCode: string;
  Pincode: string;
  Area_Name: string;
}

export interface IPincodeSBI {
  CITY_NAME: string;
  DISTRICT_NAME: string;
  Pincode: number;
  STATE_NAME: string;
  PincodeArea: string

}

export interface IInsuranceCompany {
  InsuranceCompanyCode: number;
  InsuranceCompanyDesc: string;
}
export interface IMortgageBank {
  MortgageLBankCode: number;
  MortgageLBankName: string;
}
export interface Occupation {
  OccupationCode: number;
  OccupationDesc: string;
  OccupationShortDesc: string;
}

export interface MinMaxIDVInterface {
  minIdv: string;
  maxIdv: string;
  apiMethod: string;
}
// export interface ICompanyQuestions {
//     QuestionID: number;
//     QuestionDesc: string;
//     ControlName: string;
//     IsParent: number;
//     ParentID: number;
//     IsRequired: number;
//     ValueType: string;
//     MaxLength: number;
//     OrderId: number;
// }
export interface IQuestionsTree {
  IsAdultChild: number;
  QuestionID: number;
  QuestionDesc: string;
  ControlName: string;
  IsParent: number;
  ParentID: number;
  IsRequired: number;
  ValueType: string;
  MaxLength: number;
  OrderId: number;
  Childrens: IQuestionsTree[];
  Members: IFamilyMemberDetails[]; //IFamilyMemberDetails
  CompanyLoadInd: boolean;
  CompanyLoadValue: any;
  CompanyStopInd: boolean;
  CompanyStopValue: any;
  LoadTypeInd: number;
  CompanyLoad: any;
  ReCallQuotation: any;
}

//#endregion
//  ----------   classes or models   --------------

export class ScreenShotModel {
  public Base64String!: string;
  public Type!: string;
  public Step!: string;
  public Url!: string;
}
export class ApplicationVehicleData implements IApplicationVehicleData {
  public InsuranceCateCode!: number;
  public PosCode!: number;
  public RMCode!: number;
  //-----Application Vehicle data--
  public InsuranceCateDesc!: string;
  public SubCateCode!: number;
  public SubCateDesc!: string;
  public VehicleBrandCode!: number;
  public VehicleBrandDesc!: string;
  public VehicleModelCode!: number;
  public VehicleModelDesc!: string;
  public VehicleVarientCode!: number;
  public VehicleVarientDesc!: string;
  public VehicleRegistrationYrCode!: number;
  public VehicleRegistrationYrDesc!: string;
  public VehicleFuelCode!: number;
  public VehicleFuelDesc!: string;
  public VehicleRTOCode!: number;
  public VariantName!: string;
  public CubicCapacity!: number;
  public SeatingCapacity!: number;
  public VehicleRTODesc!: string;
  public PrvPolicyExCode!: number;
  public PrvPolicyExDesc!: string;
  public VehicleExpiryCode!: number;
  public VehicleExpiryDesc!: string;
  public ClaimPrvPolicyCode!: number;
  public ClaimPrvPolicyDesc!: string;
  public VehicleNoKnowCode!: number;
  public VehicleNoKnowDesc!: string;
  public edit!: number;
  public editURL!: number;
  public VehicleNo!: number;
  public EngineSize!: string;
  public VechileIdentificationNumber!: string;
  public EngineNumber!: string;
  public RegistrationDate!: Date;
  public Owner!: string;
  public Fitness!: string;
  public InsuranceDate!: string;
  public Location!: string;
  public ImageUrl!: string;
  public Description!: string;
  public PolicyTenure!: string;
  public PreviousPolicyExpiryDate?: string;
  public PreviousNCB!: string;
  public CurrentNCB!: string;
  public PreviousPolicyTypeCode?: number;
  public PreviousPolicyTypeDesc?: string;
  //Cv
  public CVehicleTypeCode!: number;
  public CVehicleDesc?: string;
  public VehicleTypeCarriageCode!: number;
  public VehicleTypeCarriageDesc!: string;
  public VehicleUseCode!: number;
  public VehicleUseDesc!: string;
  public OwnedByCode!: number;
  public OwnedByDesc!: string;
  public VehicleTypeId?: number;
  public CvVehicleType?: string;
  //added by pranay
  public PrvPolicyRememberCode!: number;
  public PrvPolicyRememberDesc!: string;
}
export interface IApplicationVehicleData {
  InsuranceCateCode: number;
  PosCode: number;
  RMCode: number;

  //-----Application Vehicle data--
  InsuranceCateDesc: string;
  SubCateCode: number;
  SubCateDesc: string;
  VehicleBrandCode: number;
  VehicleBrandDesc: string;
  VehicleModelCode: number;
  VehicleModelDesc: string;
  VehicleVarientCode: number;
  VehicleVarientDesc: string;
  VehicleRegistrationYrCode: number;
  VehicleRegistrationYrDesc: string;
  VehicleFuelCode: number;
  VehicleFuelDesc: string;
  VariantName: string;
  CubicCapacity: number;
  SeatingCapacity: number;
  VehicleRTOCode: number;
  VehicleRTODesc: string;
  PrvPolicyExCode: number;
  PrvPolicyExDesc: string;
  VehicleExpiryCode: number;
  VehicleExpiryDesc: string;
  ClaimPrvPolicyCode: number;
  ClaimPrvPolicyDesc: string;
  VehicleNoKnowCode: number;
  VehicleNoKnowDesc: string;
  VehicleNo: number;
  edit: number;
  editURL: number;
  EngineSize: string;
  VechileIdentificationNumber: string;
  EngineNumber: string;
  RegistrationDate: Date;
  Owner: string;
  Fitness: string;
  InsuranceDate: string;
  Location: string;
  ImageUrl: string;
  Description: string;
  PolicyTenure: string;
  // optional
  PreviousPolicyExpiryDate?: string;
  PreviousNCB: string;
  CurrentNCB: string;
  PreviousPolicyTypeCode?: number;
  PreviousPolicyTypeDesc?: string;
  //CV
  CVehicleTypeCode: number;
  CVehicleDesc?: string;
  VehicleTypeCarriageCode: number;
  VehicleTypeCarriageDesc: string;
  VehicleUseCode: number;
  VehicleUseDesc: string;
  OwnedByCode: number;
  OwnedByDesc: string;
  VehicleTypeId?: number;
  CvVehicleType?: string;

  PrvPolicyRememberCode: number;
  PrvPolicyRememberDesc: string;
}

export interface InsuranceCompany {
  CompanyCode: number;
  CompanyName: string;
}
export interface IPreviousPolicyExpiryType {
  PolicyTypeCode: number;
  PolicyTypeDesc: string;
  PolicyTypeDescDetail: string;
}

export interface IPolicyAndPremiumStats {
  NoOfPolicies: number;
  TotalPremiumPerYr: number;
}

export class IPolicyRecord {
  name: string;
  mobileNo: number;
  regNo: string;
  insurer: string;
  premium: number;
  paymentDate: string;
  policyNo: string;
  vehicleNo?: string;
  DownloadLinkURL?: string;
  CommisionAmt?: Number;
  InpectionCheckStarus?: string;

  constructor(
    name: string,
    mobile: number,
    regNo: string,
    insurer: string,
    premium: number,
    paymentdate: string,
    policyNo: string,
    vehicleNo?: string | undefined,
    DownloadLinkURL?: string | undefined,
    CommisionAmt?: Number | undefined,
    InpectionCheckStarus?: string | undefined,


  ) {
    this.name = name;
    this.mobileNo = mobile;
    this.regNo = regNo;
    this.insurer = insurer;
    this.premium = premium;
    this.paymentDate = paymentdate;
    this.policyNo = policyNo;
    this.vehicleNo = vehicleNo;
    this.DownloadLinkURL = DownloadLinkURL;
    this.CommisionAmt = CommisionAmt;
    this.InpectionCheckStarus = InpectionCheckStarus;
  }
}
// export class IPolicyRecord {
//   constructor(
//     public name: string,
//     public mobileNo: number,
//     public regNo: string,
//     public insurer: string,
//     public premium: number,
//     public paymentDate: Date,
//     public policyNo: string
//   ) {}
// }

//added by pranay start
export interface errorLog {

  UserCode?: any;
  ApplicationNo?: any;
  CompanyName?: any;
  ControllerName?: any;
  MethodName?: any;
  ErrorCode?: any;
  ErrorDesc?: any;

}

export interface IUrlSharing {
  Receiver_Name: string;
  Payment_Url: string;
  Amount: string;
  Product_Description: string;
  Plan_Description: any;
  Insurance_Company: string;
  POS_Name: string;
  Hospital_Or_Garage_URL: any;
  Receiver_Mobile_No: string;
  Receiver_EmailID: string
}

export interface GetExpirePolicyInterface {
  EntryDate: string;
  InsuranceCateDesc: string;
  MobileNo: number;
  PolicyExpiryDate: Date;
  PolicyNo: string
  PreviousPolicyExpDate: Date;
  PreviousPolicyStartDate: Date;
  Salutation: string;
  SubCateDesc: string;
  TrnPolicyDate: Date;
  VechileOwnerName: string;
  VechileRegNo: string;
  VehicleBrandDesc: string;
  VehicleExpiryDesc: string;
  VehicleModelDesc: string;
  VehicleOwnerLastName: string;
  VehicleVarientDesc: string;
}



//CKYC Related Interface Start

export interface ICKYCDocListBajaj {
  DocShortDesc: string;
  DocDesc: string;
}
export interface ICKYCDocListGoDigit {
  DocShortDesc: string;
  DocDesc: string;
}

export interface ICKYCDocListUniversal {
  DocShortDesc: string;
  DocDesc: string;
  CompanyCode: any;
}

export interface ICKYCDocList {
  DocShortDesc: string;
  DocDesc: string;
  CompanyCode: any;
  ApplicableFor: string;
  DocTypeCodeOdp: number;
}

export interface ICKYCBajaj {

  ApplicationNo: number;
  RegistrationNo: string;
  Quotationno: string;
  CompanyCode: string;
  CompanyName: string
  CKYCStepInd: number;
  CKYCStepDesc: string
  CKYCNO: string;
  DOB: string;
  DocumentNo: string;
  DocShortDesc: string;
  DocDesc: string;
  FileBase64: string | ArrayBuffer;

  documentExtension: string;
}

export interface ICKYCUniversal {

  ApplicationNo: number;
  RegistrationNo: string;
  Quotationno: string;
  CompanyCode: string;
  CompanyName: string
  // CKYCNO: string;
  DOB: string;
  DocumentNo: string;
  DocShortDesc: string;
  DocDesc: string;
  CKYCStepInd: string;
  CKYCStepDesc: string;
  documentExtension: string;
  FileBase64: string;
  Name: string; //if aadhar number just type in code to fill user name and gender
  Gender: string;

}
export interface ICKYCGoDigit {


  ApplicationNo: number;
  CompanyCode: number;
  CompanyName: number;
  DOB: any;
  DocType: number;
  DocumentNo: number;
}

export interface ICKYCFutureGen {

  ApplicationNo: Number,
  CompanyCode: number,
  CompanyName: string,
  DOB: string
  DocumentNo: string,
  DocShortDesc: string,
  DocDesc: string,
  Name: string,
  Gender: string,
  CustomerType: string


}

export interface ICKYCSBI {

  ApplicationNo: number;
  RegistrationNo: string;
  Quotationno: string;
  CompanyCode: string;
  CompanyName: string
  CKYCStepInd: number;
  CKYCStepDesc: string
  CKYCNO: string;
  DOB: string;
  DocumentNo: string;
  DocShortDesc: string;
  DocDesc: string;
  FileBase64: string | ArrayBuffer;
  Name: string;
  Gender: string;
  documentExtension: string;
  CustomerType: string;
  Pincode: number;
  MobileNo: number;
}

//
export interface ICKYCTataAig {

  ApplicationNo: number;
  RegistrationNo: string;
  Quotationno: string;
  CompanyCode: string;
  CompanyName: string
  CKYCStepInd: number;
  CKYCStepDesc: string
  CKYCNO?: string;
  DOB: string;
  DocumentNo: string;
  DocShortDesc: string;
  DocDesc: string;
  FileBase64: string | ArrayBuffer;
  Name: string;
  Gender: string;
  documentExtension: string;
  req_id?: string;
  DocType?: string;
  client_id?: string;
  OTP?: string
}


export interface ICKYCReliance {
  ApplicationNo: number,
  RegistrationNo: string,
  Quotationno: string,
  CompanyCode: string,
  CompanyName: string,
  CKYCStepInd: string,
  CKYCStepDesc: string,
  DOB: string,
  DocumentNo: string,
  DocShortDesc: string,
  DocDesc: string,
  documentExtension: string,
  FileBase64: string | ArrayBuffer,
  Name: string,
  Gender: string
}


export interface ICKYCShreeRam {
  ckycNumber?: any;
  ApplicationNo: number,
  DocType?: string,
  DocumentNo?: string,
  DocName?: string,
  POIDocUploadBase64?: string | ArrayBuffer,
  POADocUploadBase64?: string | ArrayBuffer,
  ProfilePicBase64?: string | ArrayBuffer,
  FatherName?: string,
  POA_TypeCode?: string,
  POA_TypeDesc?: string,
  POA_TypeNo?: string,
  CompanyCode: string,
  CompanyName: string,
}

export interface ICKYCNewIndia {
  ApplicationNo: number,
  RegistrationNo: number,
  CompanyCode: string,
  CompanyName: string,
  DOB: string,
  DocType: string,
  DocumentNo: string
  req_id?: string;
}

export interface ICkycResponse {
  UniqueId: string;
  ReferenceId: string;
  CKYCStatus: string;
  KYCStatus: string;
  CKYCRemark: string;
  CKYCNumber: number;
  Title: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  CkycType: string;
  DocType: string;
  DocNumber: string;
  MobileNumber: string;
  EmailAdd: string;
  PerAddSameasCorAdd: string;
  PerAddress: CkycAddresDetails;
  CorAddress: CkycAddresDetails;
  ManualCkycUrl: string;
  FullName: string;
  PaymentUrl: string

}

export interface CkycAddresDetails {
  Add1: string;
  Add2: string;
  AddCity: string;
  AddDistrict: string;
  AddState: string;
  AddPin: number;
}

//CKYC Related Interface End
