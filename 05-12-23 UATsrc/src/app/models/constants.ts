import { HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";

//#region
export const apiToken = environment.baseUrl;
export const apiHost = environment.apiUrl;
//#endregion

export const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  }),
};

//auth service
export const login = apiToken + "token";
export const setNewPassword = apiHost + "CommonLogin/CreateNewPass";
export const generateOTP = apiHost + "CommonLogin/OTPGeneration";
export const verifyOTP = apiHost + "CommonLogin/OTPVerification";
export const franchiseLogin = apiHost + "PosHome/GetFranchiseUserDeatials";

//urlSharing url
export const shareUrl = apiHost + "WhatsAppMsg/PostSharePaymentURL";

//errorLogapi
export const errorLogApi = `${apiHost}ErrorLog/GetErrorLog`

// pos home service
export const getInsuranceType = apiHost + "PosHome/GetInsuranceType";
export const getInsuranceSubType =
  apiHost + "PosHome/GetInsuranceSubType?InsuranceCateCode=";
export const getRtoList = apiHost + "PosHome/GetRto?InsuranceCateCode=";
export const whenDidPolicyExpireList =
  apiHost + "PosHome/GetPolicyExpiredList?InsuranceCateCode=";
export const getFuelYearList =
  apiHost + "PosHome/GetFuelYearList?InsuranceCateCode=";



export const GetPreviousInsurerCompany = apiHost + "VehicleData/GetPreviousInsurerCompany"



export const saveQuotation = apiHost + "VehicleData/SaveApplicationData";
export const saveQuoteAfterChangingYear = apiHost + "VehicleData/SaveApplicationData_VehicleRegistrationYr_Update"
export const getVehicleInfoByNumber =
  apiHost + "Bike/GetBikeDetails?BikeRegNo=";
export const getPreviousPolicyTypeList = (
  InsuranceCateCode: number,
  SubCateCode: number,
  VehicleRegistrationYrDesc: string
) =>
  apiHost +
  `PosHome/GetPreviousPolicyType?InsuranceCateCode=${InsuranceCateCode}&SubCateCode=${SubCateCode}&Year=${VehicleRegistrationYrDesc}`;

// pos bike service
export const getBikeManufacturer =
  apiHost + "Bike/GetManufacturar?InsuranceCateCode=";
export const getBikeModal = apiHost + "Bike/GetModel?BikeManufCode=";
export const getBikeVariant = apiHost + "Bike/GetVariant?BikeModelCode=";

//vehicle buyplan service
export const getVehicleProposalData = (CompanyCode: any) => {
  return apiHost + `VehicleData/GetVehicleProposalData?CompanyCode=${CompanyCode}`;
}
export const saveProposalFormDetails =
  apiHost + "VehicleData/SaveVehicleRegData";
export const saveUserSelectionsOnQuotationPage =
  apiHost + "VehicleData/SaveVehicleRegData";
export const getIdv = apiHost + "IFFCOTOKIO/GetIDVValue";
export const getDataAfterPaymentByKey =
  apiHost + "VehicleData/GetDataAfterPayment?key=";

export const PolicyPDFDocDownload = apiHost + "VehicleData/PolicyPDFDocDownload";


export const getSbiDataAfterPayment =
  apiHost + "SBIGeneral/GetVihclePolicyIssurance?key=";

export const DownloadPolicySBIG = apiHost + "SBIGeneral/DownloadPolicySBIG?PolicyNo="

export const getDistrict = (state: any) =>
  apiHost + `SBIGeneral/GetSBIDistrictForMotor?StateCode=${state}`;

export const getCity = (state: any, district: any) =>
  apiHost + `SBIGeneral/GetSBICityForMotor?StateCode=${state}&DistrictCode=${district}`;

export const getPincode = (district: any, state: any) =>
  apiHost + `VehicleData/GetPincodeListByDistrict?District=${district}&State=${state}`;

export const getPincodeSBI = (state: any, district: any, city: number) =>
  apiHost + `SBIGeneral/GetSBIPinCodeForMotor?StateCode=${state}&DistrictCode=${district}&CityCode=${city}`;


export const getPreviousInsurerByCompanyCode =
  apiHost + "VehicleData/GetPreviousInsurerByCompanyCode?CompanyCode=";
export const breakInInspectionIffcoTokio =
  apiHost + "IFFCOTOKIO/BreakInInpection";
export const checkIffcoTokioBreakinInspectionStatus =
  apiHost + "IFFCOTOKIO/BreakInInpectionCheckStatus?RefID=";
export const getAddonsListForPrivateCar =
  apiHost + "PosHome/GetAddonsForPrivateCar";

export const getAddonsListForCV =
  apiHost + "PosHome/GetAddonsForCommercialVehicles";

export const saveProposalRequest =
  apiHost + "VehicleData/RegistrationVehicleSelectedPlan";
export const getQuotationDetails = (appNo: number, odpNo: number) =>
  apiHost +
  `VehicleData/GetApplicationVehiclePlan?ApplicationNo=${appNo}&ApplicationNoOdp=${odpNo}`;
export const getDataOnProposalFormLoad = (id: number, idOdp: number) =>
  apiHost +
  `VehicleData/GetApplicationData?ApplicationNo=${id}&ApplicationNoOdp=${idOdp}`;
export const getBikeQuotationUrls = (id: number, idOdp: number) =>
  apiHost +
  `VehicleData/GetBikeQuotationUrl?ApplicationNo=${id}&ApplicationNoOdp=${idOdp}`;
export const getCarQuotationUrls = (id: number, idOdp: number) =>
  apiHost +
  `VehicleData/GetCarQuotationUrl?ApplicationNo=${id}&ApplicationNoOdp=${idOdp}`;
export const getDataAfterPayment = (RegistrationNo: any, ApplicationNo: any) =>
  apiHost +
  `VehicleData/GetDataAfterPayment?RegistrationNo=${RegistrationNo}&ApplicationNo=${ApplicationNo}`;
export const updateNCB = (
  ApplicationNo: any,
  CurrentNCB: any,
  PreviousNCB: any
) =>
  apiHost +
  `VehicleData/UpdateNCB?ApplicationNo=${ApplicationNo}&PreviousNCB=${PreviousNCB}&CurrentNCB=${CurrentNCB}`;
export const shareQuotes = apiHost + "WhatsAppMsg/PostQuotationOnWhatsApp";

export const SharePdf = apiHost + "WhatsAppMsg/PostPolicyPDFOnWhatsApp";

//pos-certificate-api service
export const GetPOSCertificate = apiHost + "PosHome/GetPOSCertificate";
export const DownloadPOSCertificate =
  apiHost + "PosHome/DownloadPOSCertificate";

//contact service
export const saveContact = apiHost + "Contact/SaveContactInfo";

// pos car service
export const getCarBrand = apiHost + "Car/GetCarBrand?InsuranceCateCode=";
export const getCarModel = apiHost + "Car/GetCarModel?CarBrandCode=";
export const getCarVariant = (CarModelCode: number, FuelTypeCode: number) =>
  apiHost +
  `Car/GetCarVarient?CarModelCode=${CarModelCode}&FuelTypeCode=${FuelTypeCode}`;

//pos reliance current address url
export const postCurrentAddress = apiHost + "VehicleData/CompanyWiseRegistrationVehicleAddress";

//pos service.ts
export const vehicleUrl = (bikeId: string) =>
  `https://www.regcheck.org.uk/api/reg.asmx/CheckIndia?RegistrationNumber=${bikeId}&username=oswal`;

//pos health service
export const GetHealthInsuranceData = apiHost + "Health/GetHealthInsuranceData";
export const saveHealthApplicationData = apiHost + "Health/SaveApplicationData";

// health buyplan service
export const getHealthQuotationUrl = (id: number, idOdp: number) =>
  apiHost +
  `Health/GetHealthQuotationUrl?ApplicationNo=${id}&ApplicationNoOdp=${idOdp}`;

export const getHealthMasterData = (
  id: number,
  idOdp: number,
  c_code: number,
  ProductCode: any
) =>
  apiHost +
  `Health/GetHealthRegData?ApplicationNo=${id}&ApplicationNoOdp=${idOdp}&CompanyCode=${c_code}&ProductCode=${ProductCode}`;

export const savehealthPraposal = apiHost + "Health/SaveRegistrationHealthData";

export const GetStarPolicyPdf = (data: any) =>
  apiHost + `Star/CheckPolicyStatus?RegistrationNo=${data.RegistrationNo}&&ApplicationNo=${data.ApplicationNo}&&PurchaseToken=${data.PurchaseToken}`;

export const getAreaByCity = (pincode: string, cityId: number) =>
  apiHost + `Star/GetAreaCode?PinCode=${pincode}&CityCode=${cityId}`;

export const getAreaByStateCityPincode = (
  stateCode: string,
  cityId: string,
  pincode: string
) =>
  apiHost +
  `RelianceAda/GetPincodeWiseArea?StateCode=${stateCode}&CityCode=${cityId}&Pincode=${pincode}`;

export const getAreaByStateCityPincodeForSBI = (
  stateCode: string,
  cityId: string,
  pincode: string
) =>
  apiHost +
  `SBIGeneral/GetPincodeWiseArea?StateCode=${stateCode}&CityCode=${cityId}&Pincode=${pincode}`;

export const getAreaByStateCityPincodeHDFC = (
  stateCode: string,
  cityId: string,
  pincode: string
) =>
  apiHost +
  `HDFCERGO/GetPincodeWiseArea?StateCode=${stateCode}&CityCode=${cityId}&Pincode=${pincode}`;

export const getTPAMaster = (ProposalNo: any) =>
  apiHost + `Oriental/GetTPAMaster?ProposalNo=${ProposalNo}`



// pos policy servicing
export const getPolicyServicingDropdown =
  apiHost + "POSManageServices/GetPolicyServicingDDLList";
export const getPolicyCheckStatus =
  apiHost + "VehiclePolicyStatus/checkInpectionStatus?regNo=";
export const getPaymentDone =
  apiHost + "VehiclePolicyStatus/goForPaymentOrProposal?regNo=";
export const PolicyServicingUpdate =
  apiHost + "POSManageServices/PolicyServingAddreshUpdate";
export const PosProfile = apiHost + "POSManageServices/UserProfile";
export const policySearch =
  apiHost + "POSManageServices/POSPolicyDashboard?Ind=";

export const getAllPolicyServicing = (policydata: any) =>
  apiHost +
  `POSManageServices/GetPolicyServingGridList?CompanyCode=${policydata.CompanyName}&InsuranceCode=${policydata.InsuranceType}&PolicyNo=${policydata.PolicyNumber}`;

export const getPOSProfileDetails = apiHost + "PosHome/GetPOSProfile";

export const getPosExpiryPolicies = apiHost + "POSManageServices/GetPosExpiryPolicies"
//Commercial Vehicle 

export const getCVMake = (InsuranceCateCode: number, VehicleTypeId: number) =>
  apiHost + `CommercialVehicle/GetMake?InsuranceCateCode=${InsuranceCateCode}&VehicleTypeId=${VehicleTypeId}`;
export const getCVModal = (InsuranceCateCode: number, VehicleTypeId: number) =>
  apiHost + `CommercialVehicle/GetModel?MakeCode=${InsuranceCateCode}&VehicleTypeId=${VehicleTypeId}`;
export const getCVVariant = (ModelCode: number, FuelTypeCode: number, VehicleTypeId: number) =>
  apiHost + `CommercialVehicle/GetVarient?ModelCode=${ModelCode}&FuelTypeCode=${FuelTypeCode}&VehicleTypeId=${VehicleTypeId}`;
export const getCVVehicleType = apiHost + "CommercialVehicle/GetTypeVehicle";
export const getVehicleUse = apiHost + "CommercialVehicle/GetVehicleUse";


//OnReviewPageFetchData

export const GetAppData = apiHost + "VehcileRegistrationData/GetApplicationData";

//CKYc API LINK START

//ckyc for bajaj start

export const GetCKYCDocumentList = (compCode: any) => `${apiHost}VehicleData/GetCKYCDocumentList?CompanyCode=${compCode}`;
export const BajajValidateCKYC = `${apiHost}BajajAllianz/BajajValidateCKYC`;
export const BajajValidateCKYCDocUplode = `${apiHost}BajajAllianz/BajajValidateCKYCDocUplode`

export const UniversalValidateCKYC = `${apiHost}UniversalSompo/UniversalValidateCKYC`;

export const FutureGenValidateCKYC = `${apiHost}FutureGenerali/ValidateCkyc`;
export const OrientalCkyc = `${apiHost}Oriental/GetCKYCOriental`
export const OrientalCkycStatus = `${apiHost}Oriental/GetCKYCManualStatusOriental`
export const CkycDocumentUploadStatusFuture = (ProposalId: any) => `${apiHost}FutureGenerali/GetUploadedCkycDocumentStatus?ProposalId=${ProposalId}`

export const TataAigGenValidateCKYC = `${apiHost}TataAIG/TATAAIGValidateCKYCWPAN`;
export const TATAAIGValidateCKYCDocUplode = `${apiHost}TataAIG/TATAAIGValidateCKYCDocUplode`;
export const TATAAIGValidateCKYCWAnotherid = `${apiHost}TataAIG/TATAAIGValidateCKYCWAnotherid`;
export const TATAAIGSubmitOTP = `${apiHost}TataAIG/TATAAIGSubmitOTP`;
export const TATAAIGFetch = `${apiHost}TataAIG/TATAAIGFetch`;

export const GoDigitValidateCKYC = `${apiHost}GoDigit/GoDigitValidateCKYC`
export const GoDigitCKYCStatus = (ApplicationNo: any, PolicyNo: any) => `${apiHost}/GoDigit/ValidateCKYCSTATUS?ApplicationNo=${ApplicationNo}&PolicyNo=${PolicyNo}`

export const SBICheckCKYCStatusAfterPayment = (ApplicationNo: any) => `${apiHost}SBIGeneral/SBICheckCKYCStatusAfterPayment?ApplicationNo=${ApplicationNo}`
export const SBIValidateCKYC = `${apiHost}/SBIGeneral/SBIValidateCKYC`

export const RelianceValidateCKYC = `${apiHost}RelianceAda/ValidateCkyc`;
export const RelianceCheckCKYCStatus = (ApplicationNo: any, UniqueId: any, CompanyCode: any) => `${apiHost}VehicleData/CheckCkycStatus?ApplicationNo=${ApplicationNo}&UniqueId=${UniqueId}&CompanyCode=${CompanyCode}`;

export const GetCKYCUnitedIndia = `${apiHost}UnitedIndiaInsurance/GetCKYCUnitedIndia`;

export const ShreeRamValidateCkyc = `${apiHost}ShriRamGI/ShriRamGiCKYC`;

export const IffcoTokioValidateCkyc = `${apiHost}IFFCOTOKIO/IFFCOTOKIOFetchCKYC`;
export const IFFCOTOKIOCreateCKYC = `${apiHost}IFFCOTOKIO/IFFCOTOKIOCreateCKYC`
export const IFFCOTOKIOUploadCKYC = `${apiHost}IFFCOTOKIO/IFFCOTOKIODocumentUplodeCKYC`;

export const GetCKYCNewIndiaInfo = `${apiHost}NewIndiaInsurance/GetCKYCInformation`;
export const GetCKYCNewIndiaStatus = `${apiHost}NewIndiaInsurance/GetCKYCManualStatusNewIndia`



// Ckyc For Nivabupa 
export const ValidateCKYCForNivabupa = `${apiHost}NivaBupa/NBHI_KYC_Redirection`;
export const CkycStatusCheckNivabupa = (ApNO: any, PartnerRequestId: any) => `${apiHost}NivaBupa/NBHI_GET_KYC_DETAILS?applicationNo=${ApNO}&PartnerRequestId=${PartnerRequestId}`

export const ValidateCkycForHDFC = `${apiHost}HDFCERGO/ValidateCkyc`;

export const GetAfterPaymentHealthPolicyStatus = (RegNo: string) => `${apiHost}NivaBupa/GetAfterPaymentHealthPolicyStatus?RegistrationNo=${RegNo}`
//ckyc for bajaj end 




//CKYc API LINK END





//SharePaymentLink
export const sharePaymentLink = (
  ApplicationNo: any,
  ApplicationNoOdp: any,
  RegistrationNo: any,
  RegistrationNoOdp: any,
) => // apiHost + `bike-insurance/pay/${ApplicationNo}/${ApplicationNoOdp}/${RegistrationNo}/${RegistrationNoOdp}`;
  window.location.href.split('#')[0] + `#/pay?a_id=${ApplicationNo}&odp=${ApplicationNoOdp}&regNo=${RegistrationNo}&regNoOdp=${RegistrationNoOdp}`;
//SharePaymentLink
//SharePaymentLink
export const sharePaymentLinkForCar = (
  ApplicationNo: any,
  ApplicationNoOdp: any,
  RegistrationNo: any,
  RegistrationNoOdp: any,
) => // apiHost + `bike-insurance/pay/${ApplicationNo}/${ApplicationNoOdp}/${RegistrationNo}/${RegistrationNoOdp}`;
  window.location.href.split('#')[0] + `#/cpay?a_id=${ApplicationNo}&odp=${ApplicationNoOdp}&regNo=${RegistrationNo}&regNoOdp=${RegistrationNoOdp}`;
//SharePaymentLink



// export const sharePaymentLink = (
//   ApplicationNo: any,
//   ApplicationNoOdp: any,
//   RegistrationNo: any,
//   RegistrationNoOdp: any,d

// ) =>
//   // apiHost + `bike-insurance/pay/${ApplicationNo}/${ApplicationNoOdp}/${RegistrationNo}/${RegistrationNoOdp}`;
//  window.location.href.split('#')[0] + `#/pay/${ApplicationNo}/${ApplicationNoOdp}/${RegistrationNo}/${RegistrationNoOdp}`;
//setExpTime

export const getExpTimeofSharedUrl = apiHost + "PaymentURLShare/GetPaymentUrlShareData"
export const getExpTimeLimit = apiHost + "PaymentURLShare/GetPaymentUrlShareSetExpTime"
export const onPaymentClick = apiHost + "PaymentURLShare/OnPaymentClick";


// baseUrl: "http://hamarabima.com/ApiHamaraBimaSource1/",


// baseUrl: "http://hamarabima.com/ApiHamaraBimaSource1/",
// apiUrl: "http://hamarabima.com/ApiHamaraBimaSource1/api/",

// baseUrl: "http://103.21.54.52/ApiHamaraBimaSource1/",
// apiUrl: "http://103.21.54.52/ApiHamaraBimaSource1/api/",

// baseUrl: "http://115.124.113.64/apihamarabimasource1/",
// apiUrl: "http://115.124.113.64/apihamarabimasource1/api/",

//baseUrl: "http://115.124.113.64/apiHamaraBimaSource1/",
//apiUrl: "http://115.124.113.64/apiHamaraBimaSource1/api/",

// baseUrl: "http://hamarabima.com/ApiHamaraBimaSource1/",
// apiUrl: "http://hamarabima.com/ApiHamaraBimaSource1/api/",

// baseUrl: "http://115.124.113.64/apihamarabimasource1/", "http://occweb05/ApiHamaraBimaSource1/",
// apiUrl: "http://115.124.113.64/apihamarabimasource1/api/", "http://occweb05/ApiHamaraBimaSource1/api/",

// Constants

// for development with local host   -----------
// export const apiToken = 'http://localhost:51600/';
// export const apiHost = 'http://localhost:51600/api/';

// // for development and deployment with testing server  --------
// export const apiToken = 'http://115.124.113.64/apihamarabimasource1/';
// export const apiHost = 'http://115.124.113.64/apihamarabimasource1/api/';

// // for live server  --------
// export const apiToken = 'http://hamarabima.com/apihamarabimasource1/';
// export const apiHost = 'http://hamarabima.com/apihamarabimasource1/api/';

// export const httpOptions = {
//     headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

