//  ---------------   public classes -----------
export class HealthModel implements IFamilyMembers {
  FamilyMemberCode!: number;
  FamilyMemberDesc!: string;
  PriorityCode!: number;
  MemberCategory!: number;
  // AgeCode: number;
  // AgeDesc: string;
}
//  ---------------   public interface -----------
export interface IHealthData {
  gender: IGender[];
  familymember: IFamilyMembers[];
  juniorage: IAges[];
  seniorage: IAges[];
}
export interface IGender {
  GenderCode: number;
  GenderDesc: string;
}

export interface IGenderForCKYC {
  GenderCode: string;
  GenderDesc: string;
}
export interface IFamilyMembers {
  FamilyMemberCode: number | any;
  FamilyMemberDesc: string;
  PriorityCode: number;
  MemberCategory: number;
}
export interface IAges {
  AgeCode: number;
  AgeDesc: string;
  FamilyMemberCode: number;
}

// ---------
export enum Relation {
  Self = 1,
  Spouse = 2,
  Father = 3,
  Mother = 4,
  Son = 5,
  Daughter = 6,
  GrandMother = 7,
  GrandFather = 8,
  MotherInLaw = 9,
  FatherInLaw = 10,
}

export interface IHealthInsPlanUrlsResponse {
  Age: string;
  APIBaseUrl: string;
  APIMethod: string;
  ApplicationNo: string;
  ApplicationNoOdp: string;
  GenderDesc: string;
  MobileNo: string;
  Partnerid: string;
  Pincode: string;
  ProductCode: string;
  PEDData: any;
  MaxIDVVAlue: string;
  MinIDVVAlue: string;
}
export interface IHealthInsPlanRequest {
  PartnerId: string;
  ProductCode: string;
  SumInsured: string;
  Tanure: string;
  ApplicationNo: string;
  ApplicationNoOdp: string;
  PEDData: any;
  stopLoader?: boolean;
}
export interface IPlansHealth {
  CompanyCode: string;
  CompanyLogo: string;
  Premium: string;
  ProductName: string;
  CompanyUrl: string;
  ProductCode: string;
  SumInsured: string;
  IDVVAlue: string;
  MaxIDVVAlue: string;
  MinIDVVAlue: string;
  PartnerId?: any;
  QuotationNo1?: any;
}

export interface IPlansMotor {
  CompanyCode: string;
  CompanyLogo: string;
  Premium: number;
  CoverageList: ICoverageList[];
  ProductName: string;
  CompanyUrl: string;
  ProductCode: string;
  SumInsured: string;
  IDVVAlue: string;
  MaxIDVVAlue: string;
  MinIDVVAlue: string;
  garageURL: string;
  imageName?: string;
  istppd?: boolean;
  DiscountAmt?: any;
}

export interface ICoverageList {
  CoverageID: number;
  CoverageCode: string;
  Limit1: string;
  ODPremium: string;
  TPPremium: string;
  Rate: string;
}

export interface IFamilyMemberDetails {
  RecordNo: number;
  FamilyMemberCode: number;
  FamilyMemberDesc: string;
  GenderTitle: string;
  FirstName: string;
  LastName: string;
  GenderCode: number;
  GenderDesc: string;
  DOB: string | Date;
  MarriedStatusCode: number;
  MarriedStatusDesc: string;
  OccupationCode: number;
  OccupationDesc: any;
  DesignationOrBusiness?: any;
  HeightInFeet: number;
  HeightInInch: number;
  Weight: number;
  identity: string;
  Age: number;
  CityCode: string;
  CityDesc: string;
  Pincode: string;
  StateCode: string;
  StateDesc: string;
  EmailId: string;
  MobileNo: string;
}
export interface IHealthPlanFeatureDialogData {
  preExistingConditions: string;
  hospitalRoomEligibility: string;
  specialFeatures: string;
}
export interface IRegUrlData {
  ApplicationNo: number;
  ApplicationNoOdp: number;
  RegistrationNo: number;
  RegistrationNoOdp: number;
  CompanyCode: number;
  CompanyCodeOdp: number;
  PartnerId: number;
  ProductCode: string;
  APIBaseUrl: string;
  APIMethod: string;
}

// export interface ITpaData {
//   TPACode: string;
//   TPADesc: string;
//   TPABranchCode: string;
//   TPABranchDesc: string;
// }
export interface ITpaData {
  TPACode: string;
  TPA_CODE: string;
  TPA_NAME: string;
  TPADesc: string;
  TPABranchCode: string;
  TPABranchDesc: string;
}
