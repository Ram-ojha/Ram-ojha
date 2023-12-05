export enum SeniorJunior {
  Senior = 1,
  Junior = 2,
}
export enum Gender {
  Male = 1,
  Female = 2,
  Other = 0,
}
export enum EYesNo {
  YES = 1,
  NO = 0,
}
export enum EIdentity {
  AADHAAR = "AADHAAR",
  PAN = "PAN",
  GSTIN = "GSTIN",
}

export enum EBajajDocListEnum {
  CKYC = "CKYC Number",
  Passport = "Passport",
  VoterID = "Voter ID",
  PAN = "PAN",
  DrivingLicense = "Driving License",
  UID = "UID",
  NREGA = "NREGA Job card",
  GSTIN = "GSTIN",
}

export enum EDocListEnum {
  CKYC = 1,
  PAN = 2,
  UID = 3,
  VoterID = 4,
  DrivingLicense = 5,
  NREGA = 6,
  GSTIN = 8,
  Passport = 9,
  NPRL = 10,
  CIN = 11,
  RC = 12,
  ITGI = 13,
  KYCId = 14



}

export enum EUniversalDocListEnum {
  CKYC = "CKYC_NO",
  Passport = "PASSPORT",
  VoterID = "VOTER_ID",
  PAN = "PAN",
  DrivingLicense = "DRIVING_LICENCE",
  UID = "AADHAAR",
}


export enum EGoDigitCKYCMismatchType {
  S = "Success",
  F = "Fail",
  P = "Name Mismatch",
  A = "Address Mismatch",
  B = "Name & Address Mismatch"
}

export enum ECkycSBIDocID {
  PAN = 1,
  Passport = 2,
  Ration_ID = 3,
  Voter_ID = 4,
  GOV_UID = 5,
  Driving_License = 6,
  Aadhar = 7,

}

export enum Indication {
  ALL = 1,
  HEALTH,
  BIKE,
  CAR,
  BIKE_PAYMENT_PENDING,
  CAR_PAYMENT_PENDING,
  CV,
  CV_PAYMENT_PENDING
}

export enum InsuranceCategories {
  BIKE = 1,
  CAR,
  HEALTH,
  CV = 10
}
