import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { VehicleBuyPlanService } from "../../services/vehicle-buyplan.service";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { decrypt, encrypt } from "src/app/models/common-functions";
import { IPlansMotor } from "src/app/models/health-insu.Model";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { apiToken, sharePaymentLink } from "src/app/models/constants";
import { Location } from "@angular/common";
import { UrlShareModalComponent } from "src/app/shared/components/url-share-modal/url-share-modal.component";
import { errorLog, ICkycResponse, IUrlSharing } from "src/app/models/common.Model";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { CkycSBIDocID } from "src/app/models/common";
import { CkycDetailsComponent } from "../../ckyc-details/ckyc-details.component";
import { Subscription } from "rxjs";
// import { debug } from "console";

export interface IBreakInCase {
  ApplicationNo: string;
  ApplicationNoOdp: string;
  RegistrationNo: string;
  RegistrationNoOdp: string;
  odometer: string;
  InpectionType: string;
  InpectionTypeDesc: string;
  MobileNo: string;
  PropData: any;
}
declare global {
  interface Window {
    Paytm: any;
  }
}

declare var Razorpay: any;
export const ckycEditData = ["mobileNo", 'PropGenderTitle', 'ownerName', 'ownerLastName', 'dob', 'emailId', 'postalAdd', 'addArea', 'state', 'district', 'city', 'pincode']


@Component({
  selector: "bike-review-pay",
  templateUrl: "./review-pay.component.html",
  styleUrls: ["./review-pay.component.css"],
})
export class ReviewPayComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  //#region properties
  private _subscriptions: any[] = [];
  @ViewChild("shareUrlModal", { static: false })
  shareUrlModal!: UrlShareModalComponent;
  @ViewChild("CkycModal", { static: false })
  CkycModal!: CkycDetailsComponent;
  // @ViewChild("TataAigCkycModal", { static: false }) TataAigCkycModal: CkycDetailsComponent;

  @ViewChild("screen", { static: true }) screen: any;
  // @Input() paymentdata : any;
  @Input() reviewData: any;
  @Input() isNewPolicy = false;
  @Input() isPrvPolicyRemember: any;
  @Output() onClickEdit = new EventEmitter<number>();
  @Output("onPageVisible") captureScreenshot = new EventEmitter<any>();

  termAndCon = new FormControl(false, Validators.required);
  errMsg = "";
  //#endregion
  sessData: any;
  // VehicleData: ApplicationVehicleData;
  selectedIndex!: number;
  showLoader: boolean = false;
  premiumDataPlans!: IPlansMotor | any;
  result: any;
  finalData: any;
  BreakinCompanyInspectionModal: string = "none";
  data!: {
    policyNumber: any; PartnerId: any; ProductCode: string; ApplicationNo: any; ApplicationNoOdp: any; RegistrationNo: any; RegistrationNoOdp: any; IDVValue: string; MinIDVVAlue: any; MaxIDVVAlue: string; NCBValue: string; CompTPODValue: string; PolicyTenureValue: any; TotalODPremium: string; TotalTPPremium: string; DiscountAmt: any; //"0",
    DiscountLoading: any; //"0",
    GrossAmount: string; NetPremium: any; CoverageList: any[];
    Owner_Driver_PA_Cover_Other_Value: any;
    VehicleExShowroomPrice?: any;
    kyc?: {
      isKYCDone?: boolean;
      ckycReferenceDocId?: string;
      ckycReferenceNumber?: string;
      dateOfBirth?: string;
      photo?: string | ArrayBuffer;
      CKYCVerified?: string;
      DOCTypeName?: string; //ckyc doc name
      CKYCUniqueId?: string; //UNIQue id

    };
    CKYCNumber?: string;

    Ref_No_Unique_KYC?: string;
  };
  postData: any;
  insuranceType: any;
  urlSharingModal!: IUrlSharing;
  saveProposalResponse: any;
  ckycDetails: any
  // {
  //   isKYCDone: boolean,
  //   ckycReferenceDocId: string,
  //   ckycReferenceNumber: string,
  //   dateOfBirth: string,
  //   photo: string | ArrayBuffer
  // } | undefined;
  ckycData: any;
  ckyAdditionalData: any;
  ckycResponseData!: ICkycResponse;
  // Break in case
  // breakInCase: FormGroup;
  // breakInCaseData: IBreakInCase;
  // InspectionType : string;
  // OdMeter : number;
  // number : number;
  // additionaldata: any;
  // ReturnKeyOfPayment: string;
  // ReturnKeyOfPaymentMsg: string;
  // public timerSub: Subscription;
  // public countDownValue: number = 0;
  // Break in case end

  constructor(
    public _vehicleBuyPlanService: VehicleBuyPlanService,
    private formBuilder: FormBuilder,
    private _router: Router,
    private toasterService: ToastrService,
    private location: Location,
    private _errorHandleService: ErrorHandleService,
  ) { }

  posMobileNo: any;
  // userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;
  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);

    // this.sessData = JSON.parse(sessionStorage.getItem("Data"));
    this.insuranceType = JSON.parse(sessionStorage.getItem("insuranceType")!);
    // this.ckycData
    // this.VehicleData = JSON.parse(sessionStorage.getItem('VehicleData'));
    this.createProposalRequest();
    this.postData = JSON.parse(sessionStorage.getItem("postData")!);

    this.sessData = JSON.parse(sessionStorage.getItem("Data")!);
    this.premiumDataPlans = this.sessData.premiumDataPlans;
    // // this.VehicleData = JSON.parse(sessionStorage.getItem('VehicleData'));
    // this.premiumDataPlans = this.sessData.premiumDataPlans;
    // if (sessionStorage.getItem("postData")) {
    //   let sesRegData = JSON.parse(sessionStorage.getItem("postData"));
    //   this.reviewData = sesRegData;
    // }
    // previously commented
    // this.breakInCase  =  this.formBuilder.group({
    //     odometer: ['', Validators.required],
    //     InpectionType: ['', Validators.required],
    //     MobileNo: ['', [Validators.required,Validators.maxLength(10),Validators.pattern(PATTERN.MOBILENO)]]
    // });
  }

  //   onSubmitBreakInCaseStatus(){
  //
  //       this._vehicleBuyPlanService.BreakInInpectionCheckStatus(this.ReturnKeyOfPayment).subscribe((result) => {
  //           
  //           console.log({result});
  //           this.ReturnKeyOfPaymentMsg = result.msg
  //       });
  //   }

  //   onSubmitBreakInCase(){
  //       this.breakInCaseData = this.breakInCase.value;
  //       this.breakInCaseData.ApplicationNo = this.additionaldata.ApplicationNo;
  //       this.breakInCaseData.ApplicationNoOdp = this.additionaldata.ApplicationNoOdp;
  //       this.breakInCaseData.RegistrationNo = this.additionaldata.RegistrationNo;
  //       this.breakInCaseData.RegistrationNoOdp = this.additionaldata.RegistrationNoOdp;
  //       this.breakInCaseData.InpectionTypeDesc = this.breakInCase.value.InpectionType == 1?'Agent':'Self';
  //       console.log("this.breakInCaseData",this.breakInCaseData);
  //       this._vehicleBuyPlanService.BreakInInpection(this.breakInCaseData).subscribe((result) => {
  //           if (result.successcode == "1" && result.data != null) {
  //               console.log({result});
  //               
  //               if(result.data[0].ReturnKeyOfPayment!=null || ""){
  //                   this.ReturnKeyOfPayment = result.data[0].ReturnKeyOfPayment;
  //                   this.ReturnKeyOfPaymentMsg = result.msg;
  //                   this.startTimer();
  //               }
  //           }
  //       });
  //
  //       setTimeout(function () {
  //
  //        }, 500);
  // }

  // startTimer() {
  //   
  //     const startValue = 5 * 60;
  //     this.timerSub = timer(0, 1000).pipe(
  //       take(startValue + 1),
  //       map(value => startValue - value)
  //     ).subscribe(
  //       value => {
  //         this.countDownValue = value
  //         if (value == 0) {
  //         //   this.otpResponse = null;
  //         //   this.btnText = 'Resend OTP';
  //         //   this.isOtpSent = false;
  //         //   this.mobileNumber.enable();
  //         }
  //       },
  //       null,
  //       () => this.timerSub = null
  //     );
  // }

  ngOnChanges(changes: SimpleChanges) {

    console.log({ changes });
    this.ckycDetails = JSON.parse(sessionStorage.getItem("CKYCData")!);
    this.ckyAdditionalData = JSON.parse(sessionStorage.getItem("CKYCAdditionalData")!);

    this.sessData = JSON.parse(sessionStorage.getItem("Data")!);
    // this.VehicleData = JSON.parse(sessionStorage.getItem('VehicleData'));
    this.premiumDataPlans = this.sessData.premiumDataPlans;

    this.createProposalRequest();
  }

  ngAfterViewInit() {

    // this.captureScreenshot.emit();
  }

  createProposalRequest() {
    console.log("ReviewData", this.reviewData);
    console.log("SessData", this.sessData);
    console.log("jfdaskj", this.ckycDetails);


    let idvBasic: any = this.premiumDataPlans.CoverageList.find(
      (x: any) => x.CoverageCode === "IDV Basic"
    );
    let depWaiver: any = this.premiumDataPlans.CoverageList.find(
      (x: any) => x.CoverageID == 1
    );
    let paOwner: any = this.premiumDataPlans.CoverageList.find(
      (x: any) => x.CoverageID == 16
    );
    let NCB: any = this.premiumDataPlans.CoverageList.find(
      (x: any) => x.CoverageCode == "No Claim Bonus"
    );
    let TPPD: any = this.premiumDataPlans.CoverageList.find(
      (x: any) => x.CoverageID == 28
    )
    let GrossAmount = this.premiumDataPlans.Premium;

    let ODPremium = Number(idvBasic.ODPremium);
    let TTPremium = Number(idvBasic.TPPremium);

    if (this.premiumDataPlans["zeroDp"] && this.premiumDataPlans.CompanyCode != '15') {
      // let grossod = Number(idvBasic.ODPremium);
      // GrossAmount += grossod;
    }
    if (this.premiumDataPlans["pacover"]) {
      TTPremium = Number(idvBasic.TPPremium) + Number(paOwner.TPPremium);
    }
    if (this.premiumDataPlans.CompanyCode == "8") {
      this.data = {
        policyNumber: this.sessData.premiumDataPlans.policyNumber,
        PartnerId: this.reviewData["Data"].Partnerid,
        ProductCode: this.premiumDataPlans.ProductName,
        ApplicationNo: this.reviewData.ApplicationNo.toString(),
        ApplicationNoOdp: this.reviewData.ApplicationNoOdp.toString(),
        RegistrationNo: this.reviewData["Data"].RegistrationNo.toString(),
        RegistrationNoOdp: this.reviewData["Data"].RegistrationNoOdp.toString(),

        IDVValue: this.premiumDataPlans.IDVVAlue,
        MinIDVVAlue: this.sessData.premiumDataPlans.MinIDVVAlue,
        MaxIDVVAlue: this.premiumDataPlans.MaxIDVVAlue,

        NCBValue: "0",
        CompTPODValue: "2",
        PolicyTenureValue: this.sessData.tenure,

        Owner_Driver_PA_Cover_Other_Value: this.sessData.Owner_Driver_PA_Cover_Other_Value,

        TotalODPremium: ODPremium.toString(),
        TotalTPPremium: TTPremium.toString(),

        DiscountAmt: this.sessData.premiumDataPlans.DiscountAmt, //"0",
        DiscountLoading: this.sessData.premiumDataPlans.DiscountLoading, //"0",

        GrossAmount: GrossAmount.toString(),
        NetPremium:
          this.sessData.premiumDataPlans.AmountPayableIncludingGST.toString(),

        CoverageList: []


      };
    } else if (this.premiumDataPlans.CompanyCode == "7") { //Sbi proposal payload



      this.data = {
        policyNumber: this.sessData.premiumDataPlans.policyNumber,
        PartnerId: this.reviewData["Data"].Partnerid,
        ProductCode: this.premiumDataPlans.ProductName,
        ApplicationNo: this.reviewData.ApplicationNo.toString(),
        ApplicationNoOdp: this.reviewData.ApplicationNoOdp.toString(),
        RegistrationNo: this.reviewData["Data"].RegistrationNo.toString(),
        RegistrationNoOdp: this.reviewData["Data"].RegistrationNoOdp.toString(),

        IDVValue: this.premiumDataPlans.IDVVAlue,
        MinIDVVAlue: this.sessData.premiumDataPlans.MinIDVVAlue,
        MaxIDVVAlue: this.premiumDataPlans.MaxIDVVAlue,

        NCBValue: "0",
        CompTPODValue: "2",
        PolicyTenureValue: this.sessData.tenure,

        Owner_Driver_PA_Cover_Other_Value: this.sessData.Owner_Driver_PA_Cover_Other_Value,

        TotalODPremium: ODPremium.toString(),
        TotalTPPremium: TTPremium.toString(),

        DiscountAmt: this.sessData.premiumDataPlans.DiscountAmt, //"0",
        DiscountLoading: this.sessData.premiumDataPlans.DiscountLoading, //"0",

        GrossAmount: GrossAmount.toString(),
        NetPremium:
          this.sessData.premiumDataPlans.AmountPayableIncludingGST.toString(),

        CoverageList: [],


      };
    }
    else if (this.premiumDataPlans.CompanyCode == "6") { //Universal proposal payload
      debugger
      console.log(this.ckyAdditionalData)
      this.data = {
        policyNumber: this.sessData.premiumDataPlans.policyNumber,
        PartnerId: this.reviewData["Data"].Partnerid,
        ProductCode: this.premiumDataPlans.ProductName,
        ApplicationNo: this.reviewData.ApplicationNo.toString(),
        ApplicationNoOdp: this.reviewData.ApplicationNoOdp.toString(),
        RegistrationNo: this.reviewData["Data"].RegistrationNo.toString(),
        RegistrationNoOdp: this.reviewData["Data"].RegistrationNoOdp.toString(),
        VehicleExShowroomPrice: this.sessData.premiumDataPlans.VehicleExShowroomPrice ? this.sessData.premiumDataPlans.VehicleExShowroomPrice : "",
        IDVValue: this.premiumDataPlans.IDVVAlue,
        MinIDVVAlue: this.sessData.premiumDataPlans.MinIDVVAlue,
        MaxIDVVAlue: this.premiumDataPlans.MaxIDVVAlue,
        NCBValue: "0",
        CompTPODValue: "2",
        PolicyTenureValue: this.sessData.tenure,

        Owner_Driver_PA_Cover_Other_Value: this.sessData.Owner_Driver_PA_Cover_Other_Value,

        TotalODPremium: ODPremium.toString(),
        TotalTPPremium: TTPremium.toString(),

        DiscountAmt: this.sessData.premiumDataPlans.DiscountAmt, //"0",
        DiscountLoading: this.sessData.premiumDataPlans.DiscountLoading, //"0",

        GrossAmount: GrossAmount.toString(),
        NetPremium:
          this.sessData.premiumDataPlans.AmountPayableIncludingGST.toString(),

        CoverageList: [],
        Ref_No_Unique_KYC: this.ckycDetails!.UniqueId,
        CKYCNumber: this.ckycDetails!.CKYCNumber

      };
    }
    else if (this.premiumDataPlans.CompanyCode == "4") { //Iffco Tokio  proposal payload

      console.log(this.ckyAdditionalData)
      this.data = {
        policyNumber: this.sessData.premiumDataPlans.policyNumber,
        PartnerId: this.reviewData["Data"].Partnerid,
        ProductCode: this.premiumDataPlans.ProductName,
        ApplicationNo: this.reviewData.ApplicationNo.toString(),
        ApplicationNoOdp: this.reviewData.ApplicationNoOdp.toString(),
        RegistrationNo: this.reviewData["Data"].RegistrationNo.toString(),
        RegistrationNoOdp: this.reviewData["Data"].RegistrationNoOdp.toString(),

        IDVValue: this.premiumDataPlans.IDVVAlue,
        MinIDVVAlue: this.sessData.premiumDataPlans.MinIDVVAlue,
        MaxIDVVAlue: this.premiumDataPlans.MaxIDVVAlue,

        NCBValue: "0",
        CompTPODValue: "2",
        PolicyTenureValue: this.sessData.tenure,

        Owner_Driver_PA_Cover_Other_Value: this.sessData.Owner_Driver_PA_Cover_Other_Value,

        TotalODPremium: ODPremium.toString(),
        TotalTPPremium: TTPremium.toString(),

        DiscountAmt: this.sessData.premiumDataPlans.DiscountAmt, //"0",
        DiscountLoading: this.sessData.premiumDataPlans.DiscountLoading, //"0",

        GrossAmount: GrossAmount.toString(),
        NetPremium:
          this.sessData.premiumDataPlans.AmountPayableIncludingGST.toString(),

        CoverageList: [],

      };
    }
    else {
      this.data = {
        policyNumber: this.sessData.premiumDataPlans.policyNumber,
        PartnerId: this.reviewData["Data"].Partnerid,
        ProductCode: this.premiumDataPlans.ProductName,
        ApplicationNo: this.reviewData.ApplicationNo.toString(),
        ApplicationNoOdp: this.reviewData.ApplicationNoOdp.toString(),
        RegistrationNo: this.reviewData["Data"].RegistrationNo.toString(),
        RegistrationNoOdp: this.reviewData["Data"].RegistrationNoOdp.toString(),

        IDVValue: this.premiumDataPlans.IDVVAlue,
        MinIDVVAlue: this.sessData.premiumDataPlans.MinIDVVAlue,
        MaxIDVVAlue: this.premiumDataPlans.MaxIDVVAlue,

        NCBValue: "0",
        CompTPODValue: "2",
        PolicyTenureValue: this.sessData.tenure,

        Owner_Driver_PA_Cover_Other_Value: this.sessData.Owner_Driver_PA_Cover_Other_Value,

        TotalODPremium: ODPremium.toString(),
        TotalTPPremium: TTPremium.toString(),

        DiscountAmt: this.sessData.premiumDataPlans.DiscountAmt, //"0",
        DiscountLoading: this.sessData.premiumDataPlans.DiscountLoading, //"0",

        GrossAmount: GrossAmount.toString(),
        NetPremium:
          this.sessData.premiumDataPlans.AmountPayableIncludingGST.toString(),

        CoverageList: [],
        // CKYCNumber: this.ckycDetails ? this.ckycDetails.ckycNumber : null
      }
    }

    this.data.CoverageList.push(idvBasic);
    if (this.premiumDataPlans["pacover"] && paOwner) {
      this.data.CoverageList.push(paOwner);
    }
    if (this.premiumDataPlans["zeroDp"] && depWaiver) {
      this.data.CoverageList.push(depWaiver);
    }
    if (NCB != undefined) {
      this.data.CoverageList.push(NCB);
    }
    if (this.premiumDataPlans["istppd"] && TPPD) {
      this.data.CoverageList.push(TPPD);
    }
    // this.finalData.sesdata= ;

    this.finalData = JSON.stringify(this.data);
    // sessionStorage.setItem("finalData", this.finalData);
    sessionStorage.setItem("finalData", encrypt(this.finalData));
    // sessionStorage.setItem("paymentData",JSON.stringify(this.sessData));

    console.log("finalData ==> ", this.finalData);
    // this.saveProposalReq();
  }

  // handleBreakinCase(companyCode) {
  //   if (companyCode == "4") {
  //     //iffco tokio
  //     if (+this.reviewData.ComprehensiveThirdPartyCode === 1) {
  //       this.onSubmitProposal();
  //       return;
  //     }

  //   }

  //   if (companyCode == "8") {
  //     this.showLoader = true;
  //     this.onSubmitProposal();
  //   }
  // }

  isCkycValidForIffocoTokio: boolean = false;

  // iffcoTokioCkycData: any = null;
  isCkycValid(event: any) {
    if (this.premiumDataPlans.CompanyCode === '4') {

      console.log(event);
      this.isCkycValidForIffocoTokio = event;

      // this.iffcoTokioCkycData = event

    }

    if (this.premiumDataPlans.CompanyCode === '9') {

      console.log(event);
      this.ckycResponseData = event;

      // this.iffcoTokioCkycData = event

    }
    if (this.premiumDataPlans.CompanyCode === '12') {

      console.log(event);

      this.ckycResponseData = event;

      // this.iffcoTokioCkycData = event

    }

  }

  onSubmitPayForTataAig(tnc: boolean): any {
    if (!tnc) {
      this.errMsg = "Pease accept our term and policies after reading it.";
      return false;
    }
    if (this.ckycResponseData.PaymentUrl) {
      window.location.href = this.ckycResponseData.PaymentUrl;
    } else {
      this.toasterService.error("Unable to redirect to payment gateway.Please try again later.", "Unkown error.")
    }

  }

  onClickCkycTataAig() {


    if (this.premiumDataPlans.CompanyCode === '9') {
      this.CkycModal.showModal = true
    }

  }
  saveProposalReq() {
    this._subscriptions.push(
      this._vehicleBuyPlanService
        .saveProposalRequest(this.finalData)
        .subscribe((result: any) => {
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.reviewData.ApplicationNo;
            this.errorLogDetails.CompanyName = this.reviewData["Data"].APIMethod.split[0];
            this.errorLogDetails.ControllerName = 'VehicleData';
            this.errorLogDetails.MethodName = 'RegistrationVehicleSelectedPlan'
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log('errorlog-----=>', res);
              });
          }
        })
    );
  }
  onSubmitPay(tnc: boolean): any {
    const previousPolicyExpCode = this.reviewData["Data"].PrvPolicyExCode;
    const companyCode = this.premiumDataPlans.CompanyCode;

    if (!tnc) {
      this.errMsg = "Pease accept our term and policies after reading it.";
      return false;
    }


    // if (previousPolicyExpCode == 1) {
    //   this.handleBreakinCase(companyCode);
    // }

    this.onSubmitProposal();
  }

  onSubmitProposal() {

    this.showLoader = true;
    if (this.reviewData != null) {
      // 


      if (this.premiumDataPlans.CompanyCode == "7" && this.reviewData.IsPUC === false && !this.isNewPolicy) {
        this.toasterService.error("Can't issue policy due to invalid PUC.", '', { timeOut: 5000 });
      } else {
        this._subscriptions.push(
          this._vehicleBuyPlanService
            .vehicleProposalRequest(this.finalData, this.reviewData["Data"])
            .subscribe(
              (result) => {
                debugger
                console.log("Api Response", result);
                this.showLoader = false;
                if (result.successcode == "1") {
                  this.result = result.data;

                  this._subscriptions.push(
                    this._vehicleBuyPlanService
                      .saveProposalRequest(this.finalData)
                      .subscribe((result: any) => {

                        console.log(result)
                        if (result.successcode == "0" || result.successcode == null) {
                          this.errorLogDetails.UserCode = this.posMobileNo;
                          this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
                          this.errorLogDetails.CompanyName = this.reviewData["Data"].APIMethod.split[0];
                          this.errorLogDetails.ControllerName = 'VehicleData';
                          this.errorLogDetails.MethodName = 'RegistrationVehicleSelectedPlan'
                          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
                          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
                          this._errorHandleService
                            .sendErrorLog(this.errorLogDetails)
                            .subscribe((res: any) => {
                              console.log('errorlog-----=>', res);
                            });
                        } else {
                          this.saveProposalResponse = result;
                        }
                      })
                  );
                  // return;
                  // if(result['additionaldata'] != null && this.sessData.premiumDataPlans.CompanyCode =="4"){
                  //     if(result['additionaldata'][0] != null && result['additionaldata'][0].PrvPolicyExCode == 1) {
                  //         this.additionaldata = result['additionaldata'][0];
                  //
                  //         return false;
                  //     }
                  // }else{
                  //     this.requestPayment(result)
                  // }
                  // sessionStorage.setItem("Data",this.sessData);
                  sessionStorage.setItem(
                    "Data",
                    JSON.stringify(this.sessData)
                  );
                  sessionStorage.setItem(
                    "proposalNo",
                    encrypt(this.result.ProposalPolicyNumber)
                  );
                  sessionStorage.setItem(
                    "appNo",
                    encrypt(String(this.reviewData.ApplicationNo))
                  );
                  sessionStorage.setItem(
                    "regNo",
                    encrypt(String(this.reviewData["Data"].RegistrationNo))
                  );
                  sessionStorage.setItem(
                    "posMob",
                    encrypt(String(this.posMobileNo))
                  );
                  // Payment for future generali
                  if (this.sessData.premiumDataPlans.CompanyCode === "2") {
                    // const Parameter_pay = {
                    //   TransactionID: this.result.RegistrationNo,
                    //   // ProposalNumber: this.result.RegistrationNo,
                    //   PremiumAmount: this.result.PolicyPremiumAmount,
                    //   UserIdentifier: this.result.MobileNo,
                    //   PaymentOption: 3,
                    //   ResponseURL: this.result.ResponseURL,
                    //   // UserId: this.result.MobileNo,
                    //   FirstName: this.result.VechileOwnerName,
                    //   LastName: this.result.VechileOwnerName,
                    //   Mobile: this.result.MobileNo,
                    //   Email: this.result.EmailID,

                    //   ProposalNumber: this.result.ProposalPolicyNumber,
                    //   UserId: this.reviewData.ApplicationNo,
                    //   CheckSum: this.result.CheckSum,
                    // };
                    const Parameter_pay = {
                      TransactionID: this.result.TransactionID,
                      // ProposalNumber: this.result.RegistrationNo,
                      PaymentOption: this.result.PaymentOption,
                      ResponseURL: this.result.ResponseURL,
                      ProposalNumber: this.result.ProposalNumber,
                      PremiumAmount: this.result.PremiumAmount,
                      UserIdentifier: this.result.UserIdentifier,
                      // UserId: this.result.MobileNo,
                      UserId: this.result.UserId,
                      FirstName: this.result.FirstName,
                      LastName: this.result.LastName,
                      Vendor: this.result.Vendor,
                      Mobile: this.result.Mobile,
                      Email: this.result.Email,
                      CheckSum: this.result.CheckSum,
                    };
                    // return;
                    this.showLoader = true;
                    this.postForm(this.result.PaymentURL, Parameter_pay, "post");
                  }


                  // Payment for IFFCOTOKIO
                  if (this.sessData.premiumDataPlans.CompanyCode === "4") {
                    // this.showLoader = true;


                    this.newPostForm(result.msg, result.data);

                  }

                  // Payment for Universal
                  if (this.sessData.premiumDataPlans.CompanyCode === "6") {
                    this.showLoader = true;
                    window.location.href = this.result[0].PaymentURL;
                  }

                  // Payment for SBI
                  if (this.sessData.premiumDataPlans.CompanyCode === "7") {
                    console.log(result);
                    debugger;
                    // return;
                    this.paymentSBI(result);
                  }

                  // Payment for Godigit
                  if (this.premiumDataPlans.CompanyCode === "8") {
                    // return;

                    // check if the data is Array, if so then check policy status inside it
                    // 'pending documents' status decides the breaking case
                    if (Array.isArray(result.data) || result.msg === "success") {
                      if (
                        result.data[0].ProposalStatusMsg === "PENDING_DOCUMENTS"
                      ) {
                        this.BreakinCompanyInspectionModal = "block";
                        return;
                      }
                    }

                    // otherwise its implied that it is a payment url, so redirect user
                    window.location.href = result.data;
                  }

                  // Payment for TataAig
                  if (this.sessData.premiumDataPlans.CompanyCode === "9") {
                    // this.showLoader = true;
                    // window.location.href = result.data.PaymentURL;
                    sessionStorage.setItem('tataAigPropsal', JSON.stringify(this.result))
                    this.onClickCkycTataAig()
                  }

                  // Payment for National INsurance
                  if (this.sessData.premiumDataPlans.CompanyCode === "10") {
                    this.showLoader = true;
                    window.location.href = result.data[0].PaymentURL;
                  }

                  // Payment for Reliance
                  if (this.sessData.premiumDataPlans.CompanyCode === "11") {
                    window.location.href = result.data;
                  }

                  // Payment for New India
                  if (this.sessData.premiumDataPlans.CompanyCode === "12") {
                    console.log(result);
                    // return;
                    window.location.href = result.data[0].PaymentURL;
                  }

                  // Payment for Bajaj Allianz
                  if (this.sessData.premiumDataPlans.CompanyCode === "13") {
                    debugger
                    console.log(result);
                    // return;
                    window.location.href = result.data[0].PaymentURL;
                  }

                  //Payment for United India
                  if (this.sessData.premiumDataPlans.CompanyCode === '16') {
                    console.log(result);

                    this.paymentUnited(result);
                  }

                  //Payment for ShriRam 
                  if (this.sessData.premiumDataPlans.CompanyCode === '19') {
                    // const Parameter_pay = {
                    //   TransactionID: this.result.TransactionID,
                    //   // ProposalNumber: this.result.RegistrationNo,
                    //   PaymentOption: this.result.PaymentOption,
                    //   ResponseURL: this.result.ResponseURL,
                    //   ProposalNumber: this.result.ProposalNumber,
                    //   PremiumAmount: this.result.PremiumAmount,
                    //   UserIdentifier: this.result.UserIdentifier,
                    //   // UserId: this.result.MobileNo,
                    //   UserId: this.result.UserId,
                    //   FirstName: this.result.FirstName,
                    //   LastName: this.result.LastName,
                    //   Vendor: this.result.Vendor,
                    //   Mobile: this.result.Mobile,

                    //   Email: this.result.Email,
                    //   CheckSum: this.result.CheckSum,
                    // };

                    const Parameter_pay = {
                      DbFrom: result.data[0].DbFrom,
                      QuoteId: result.data[0].QuoteID,
                      amount: result.data[0].PoicyTotalAmount,
                      application: result.data[0].application,
                      createdBy: result.data[0].VechileOwnerName,
                      description: result.data[0].description,//"421010/31/22/P/00000- 2001691",
                      isForWeb: result.data[0].isForWeb,
                      paymentFrom: result.data[0].paymentFrom,
                      prodCode: result.data[0].ProductCode,
                      sourceUrl: result.data[0].APIMethod
                    }


                    this.showLoader = true;
                    this.postForm(result.data[0].APIBaseUrl, Parameter_pay, "post");
                  }

                } else {
                  // this.toasterService.error("Couldn't proceed further", "", {
                  //   timeOut: 5000,
                  // });
                  // if (result.successcode == "0") {
                  this.errorLogDetails.UserCode = this.posMobileNo;
                  this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
                  this.errorLogDetails.CompanyName = this.reviewData["Data"].APIMethod.split[0];
                  this.errorLogDetails.ControllerName = this.reviewData["Data"].APIMethod.split[0];
                  this.errorLogDetails.MethodName = this.reviewData["Data"].APIMethod.split[1]
                  this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
                  this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
                  this._errorHandleService
                    .sendErrorLog(this.errorLogDetails)
                    .subscribe((res: any) => {
                      console.log('errorlog-----=>', res);
                    });

                  this.toasterService.error(result.msg, "", {
                    timeOut: 5000,
                  });
                }
              },
              (error) => {
                this.showLoader = false;
                console.log("Error", error);
              }
            )
        );
      }




    }
  }
  //close BreakinCompanyInspectionModal
  closeModalDialog() {
    this.BreakinCompanyInspectionModal = "none";
  }
  // requestPayment(result){
  //     
  //     sessionStorage.setItem('proposalNo', encrypt(this.result.ProposalPolicyNumber));
  //     sessionStorage.setItem('appNo', encrypt(String(this.reviewData.ApplicationNo)));
  //     sessionStorage.setItem('regNo', encrypt(String(this.reviewData['Data'].RegistrationNo)));
  //     // Payment for future generali
  //     if (this.sessData.premiumDataPlans.CompanyCode === '2') {
  //         const Parameter_pay = {
  //             "TransactionID": this.result.RegistrationNo,
  //             "ProposalNumber": this.result.RegistrationNo,
  //             "PremiumAmount": this.result.PolicyPremiumAmount,
  //             "UserIdentifier": this.result.MobileNo,
  //             "PaymentOption": 3,
  //             "ResponseURL": this.result.ResponseURL,
  //             "UserId": this.result.MobileNo,
  //             "FirstName": this.result.VechileOwnerName,
  //             "LastName": this.result.VechileOwnerName,
  //             "Mobile": this.result.MobileNo,
  //             "Email": this.result.EmailID,
  //         };
  //         this.showLoader = true;
  //         this.postForm(this.result.PaymentURL, Parameter_pay, 'post');
  //     }
  //     // Payment for Universal
  //     if (this.sessData.premiumDataPlans.CompanyCode === '6') {
  //         this.showLoader = true;
  //         window.location.href = this.result[0].PaymentURL;
  //     }
  //     // Payment for IFFCOTOKIO
  //     if (this.sessData.premiumDataPlans.CompanyCode === '4') {
  //         this.showLoader = true;
  //         this.newPostForm(result.msg, result.data);
  //     }
  // }
  calculateGstPercentage(amount: any) {
    return Math.round(amount * 0.18);
  }
  onEditClick(tab: number) {
    this.onClickEdit.emit(tab);
  }

  private postForm(path: string, Parameter_pay: any, method: string) {

    method = method || "post";

    let form = document.createElement("form");
    // form.setAttribute("name", "form1");
    form.setAttribute("name", "PostForm");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    // form.setAttribute("id", "form1");
    form.setAttribute("id", "PostForm");
    for (let key in Parameter_pay) {
      if (Parameter_pay.hasOwnProperty(key)) {
        let hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", Parameter_pay[key]);

        form.appendChild(hiddenField);
      }
    }
    let a = document.body.appendChild(form);
    console.log(a);
    console.log({ form });
    // return;
    debugger;
    form.submit();
  }
  // XMLHttpRequest
  private newPostForm(path: string, formData: string) {
    let method = "post";
    let form = document.createElement("form");
    form.setAttribute("name", "XML_DATA");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.innerHTML = formData;
    document.body.appendChild(form);
    form.submit();
  }

  // payTMUnited(result){
  //   const requestObject = {
  //     "amount": "1.00",
  //     "orderId": "0071490615",
  //     "txnToken": "fe795335ed3049c78a57271075f2199e1526969112097",
  //     "mid": "ABCdj00008000000"
  // }


  // function ready(callback) {
  //     if (window.JSBridge) {
  //         callback && callback();
  //     } else {
  //         document.addEventListener('JSBridgeReady', callback, false);
  //     }
  // }

  // ready(function() {
  //     JSBridge.call('paytmPayment', requestObject,
  //         function(result) {
  //             console.log(JSON.stringify(result))
  //         });
  // });

  // }

  openDialog(): void {

    // const appNo = encrypt(JSON.stringify(dt.ApplicationNo));
    // const appODP = encrypt(JSON.stringify(dt.ApplicationNoOdp)); 
    // const regNo = encrypt(JSON.stringify(dt.RegistrationNo));
    // const regOdp = encrypt(JSON.stringify(dt.RegistrationNoOdp));

    if (this.sessData.premiumDataPlans.CompanyCode == "7" && this.reviewData.IsPUC === false && !this.isNewPolicy) {
      this.shareUrlModal.showModal = false;
      this.toasterService.error("Can't issue policy due to invalid PUC.", '', { timeOut: 5000 });
    } else {
      const dt = JSON.parse(sessionStorage.getItem("postData")!);
      const appNo = btoa(dt.Data.ApplicationNo);
      const appODP = btoa(dt.Data.ApplicationNoOdp);
      const regNo = btoa(dt.Data.RegistrationNo);
      const regOdp = btoa(dt.Data.RegistrationNoOdp);
      this.shareUrlModal.showModal = true
      this.captureScreen(appNo, appODP, regNo, regOdp);
      this._vehicleBuyPlanService.SetExpTime(appNo, appODP, regNo, regOdp).subscribe((res) => {
        console.log("fdsdsfdssdfs--", res);
        if (res.successcode == "0" || res.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
          this.errorLogDetails.CompanyName = this.reviewData["Data"].APIMethod.split[0];
          this.errorLogDetails.ControllerName = 'PaymentURLShare';
          this.errorLogDetails.MethodName = 'GetPaymentUrlShareData'
          this.errorLogDetails.ErrorCode = res.successcode ? res.successcode : "0";
          this.errorLogDetails.ErrorDesc = res.msg ? res.msg : "Something went wrong.";
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              console.log('errorlog-----=>', res);
            });
        }
      })
      this.saveProposalReq();
    }

  }


  onClickCkycModal(tnc: any): any {
    if (!tnc) {
      this.errMsg = "Pease accept our term and policies after reading it.";
      return false;
    }
    if (this.premiumDataPlans.CompanyCode === "4") {
      this.CkycModal.showModal = true;
    }

    if (this.premiumDataPlans.CompanyCode === '9') {
      this.CkycModal.showModal = true;
    }
    if (this.premiumDataPlans.CompanyCode === '12') {
      this.CkycModal.showModal = true;
    }

  }
  captureScreen(appNo: any, appODP: any, regNo: any, regOdp: any) {

    try {
      // const dt = JSON.parse(sessionStorage.getItem("UrlData"));
      // // const appNo = encrypt(JSON.stringify(dt.ApplicationNo));
      // // const appODP = encrypt(JSON.stringify(dt.ApplicationNoOdp)); 
      // // const regNo = encrypt(JSON.stringify(dt.RegistrationNo));
      // // const regOdp = encrypt(JSON.stringify(dt.RegistrationNoOdp));
      // const appNo = btoa(dt.ApplicationNo);
      // const appODP = btoa(dt.ApplicationNoOdp); 
      // const regNo = btoa(dt.RegistrationNo);
      // const regOdp = btoa(dt.RegistrationNoOdp);
      const urlLink = sharePaymentLink(appNo, appODP, regNo, regOdp)


      // const capturePromise = this.screenCaptureService.getImage(
      //   this.screen.nativeElement,
      //   true
      // );
      // let imgString = await capturePromise;
      // let convertedImageFile = this.convertBase64ToImage(imgString);

      // let convertedImageFile = imgString.replace("data:image/png;base64,", "");

      //  "Receiver_Name": "Bhagwan Singh",
      //   "Payment_Url": "http://uat.hamarabima.com/",
      //   "Amount": "1250",
      //   "Product_Description": "Motor",
      //   "Plan_Description": "2W 1+5 Years Bundel Policy",
      //   "Insurance_Company":"NATIONAL INSURANCE C",
      //   "POS_Name": "Mr. Satish Varma (919966332255)",
      //   "Hospital_Or_Garage_URL":"bajaj.com",
      //   "Receiver_Mobile_No": "919098995453"
      let userName = decrypt(sessionStorage.getItem("User Name")!);
      let posMobileNo = decrypt(sessionStorage.getItem("posMob")!);

      this.urlSharingModal = {
        Receiver_Name: `${this.postData.Salutation} ${this.postData.VechileOwnerName} ${this.postData.VehicleOwnerLastName}`,
        Payment_Url: urlLink,
        Amount: `${this.sessData.premiumDataPlans.AmountPayableIncludingGST}/-`,
        Product_Description: `${this.insuranceType.InsuranceCateDesc}`,
        Plan_Description: this.postData.ComprehensiveThirdPartyDesc,
        Insurance_Company: `${this.postData.InsuranceCompDesc}`,
        POS_Name: `${userName} (${posMobileNo})`,
        Hospital_Or_Garage_URL: this.sessData.premiumDataPlans.garageURL == "" || this.sessData.premiumDataPlans.garageURL == null || this.sessData.premiumDataPlans.garageURL == undefined ? "no_garage_url" : this.sessData.premiumDataPlans.garageURL,
        Receiver_Mobile_No: `${this.postData.MobileNo}`,
        Receiver_EmailID: `${this.postData.EmailID}`
        // image: convertedImageFile,
        // planDescription: `${motorDesc} ${regYear} ${policyType}`,
      };
    } catch (err) {
      console.log("error occured");
      console.log({ err });
    }

    // html2canvas

    // html2canvas(document.querySelector("#capture")).then((canvas) => {
    //   

    //   /// document.body.appendChild(canvas);
    //   this.capturedImage = canvas.toDataURL();
    //   console.log("canvas.toDataURL() -->" + this.capturedImage);
    //   // this will contain something like (note the ellipses for brevity), console.log cuts it off
    //   // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAa0AAAB3CAYAAACwhB/KAAAXr0lEQVR4Xu2dCdiNZf7HP/ZQkpQtaUxDjYYoTSYlURMhGlmKa..."

    //   canvas.toBlob(function (blob) {
    //     //  just pass blob to something expecting a blob
    //     // somfunc(blob);

    //     // Same as canvas.toDataURL(), just longer way to do it.
    //     var reader = new FileReader();
    //     
    //     reader.readAsDataURL(blob);
    //     reader.onloadend = function () {
    //       let base64data = reader.result;
    //       console.log("Base64--> " + base64data);
    //     };
    //   });
    // });
  }

  convertBase64ToImage(dataURI: string) {
    const splitDataURI = dataURI.split(",");
    const byteString =
      splitDataURI[0].indexOf("base64") >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(":")[1].split(";")[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }


  paymentUnited(result: any) {


    $("#ptm-button1").trigger("click");
    $('#ptm').prop('src', result.data[0].PaymentURL);
    // $('ptm').attr('src',result.data[0].PaymentURL );
    var config = {
      "root": "",
      "flow": "DEFAULT",
      "data": {
        "orderId": result.data[0].ProposalTraceNo, /* update order id */
        "token": result.data[0].Token, /* update token value */
        "tokenType": "TXN_TOKEN",
        "amount": result.data[0].PoicyTotalAmount + ".00" /* update amount */
      },

      "handler": {
        "notifyMerchant": function (eventName: any, data: any) {
          console.log("notifyMerchant handler function called");
          console.log("eventName => ", eventName);
          console.log("data => ", data);
        }
      }
    };

    if (window.Paytm && window.Paytm.CheckoutJS) {
      window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
        console.log('Before JS Checkout invoke');
        // after successfully update configuration invoke checkoutjs
        window.Paytm.CheckoutJS.invoke();
      }).catch(function onError(error: any) {
        console.log("Error => ", error);
      });
    }
  }
  // </script>
  // <script type="application/javascript" src="https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/uniicl63003933277866.js" onload="onScriptLoad();" crossorigin="anonymous"></script>
  // <script>
  // onScriptLoad();
  //   function onScriptLoad(){
  // window.Paytm.CheckoutJS.onLoad(function excecuteAfterCompleteLoad() {
  //     // initialze configuration using init method 
  //     window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
  //         // after successfully updating configuration, invoke JS Checkout
  //         window.Paytm.CheckoutJS.invoke();
  //     }).catch(function onError(error){
  //         console.log("error => ",error);
  //     });
  // });

  paymentSBI(result: any) {
    debugger;
    $("#rzp-button1").trigger("click");
    var options = {
      key: "rzp_test_YpeuqwvvTh0xzG", // Enter the Key ID generated from the Dashboard
      amount: Number(result.data[0].PoicyTotalAmount * 100), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "SBIGeneral",
      description: "M2W",
      image: "assets/img/company-logos/motor/" + result.data[0].CompanyLogo,
      order_id: result.data[0].ProposalOrderNo, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: function (response: any) {
        const payId = response.razorpay_payment_id;
        const orId = response.razorpay_order_id;
        const sig = response.razorpay_signature;
        console.log(
          apiToken +
          `VehiclePaymentResp/GetSBIGeneralITIGResponse?razorpay_payment_id=${payId}&razorpay_order_id=${orId}&razorpay_signature=${sig}`
        );
        window.location.href =
          apiToken +
          `VehiclePaymentResp/GetSBIGeneralITIGResponse?razorpay_payment_id=${payId}&razorpay_order_id=${orId}&razorpay_signature=${sig}`;
        // this._vehicleBuyPlanService.GetSbiResponseCheckForSuccess(response).subscribe(res=> console.log(res));
      },

      prefill: {
        name:
          result.data[0].VechileOwnerName + result.data[0].VehicleOwnerLastName,
        email: result.data[0].EmailID,
        contact: result.data[0].MobileNo,
      },

      notes: {
        address: "Razorpay Corporate Office",
        merchant_order_id: "",
        quote_number: result.data[0].QuoteID,
        sbig_partner_id: "RazorPay",
      },
      theme: {
        color: "#3399cc",
      },
    };
    var rzp1 = new Razorpay(options);
    rzp1.on("payment.failed", function (response: any) {

      console.log(response);
      const payId = response.error.metadata.payment_id;
      const orId = response.error.metadata.order_id;

      window.location.href =
        apiToken +
        `VehiclePaymentResp/GetSBIGeneraFailedlITIGResponse?razorpay_payment_id=${payId}&razorpay_order_id=${orId}`;
      // alert(response.error.code);
      // alert(response.error.description);
      // alert(response.error.source);
      // alert(response.error.step);
      // alert(response.error.reason);
      // alert(response.error.metadata.order_id);
      // alert(response.error.metadata.payment_id);
    });
    // document.getElementById("rzp-button1").onclick = function (e) {
    rzp1.open();
    // e.preventDefault();
    // };
  }
  ngOnDestroy() {
    if (this._subscriptions.length > 0) {

      this._subscriptions.forEach((sub: Subscription) => {
        if (sub) {
          sub.unsubscribe()
        }
      });
    }
  }
  copyToClipboard() {


    // const appNo = encrypt(this.data.ApplicationNo);
    // const appODP = encrypt(this.data.ApplicationNoOdp);
    // const regNo = encrypt(this.data.RegistrationNo);
    // const regOdp = encrypt(this.data.RegistrationNoOdp);

    const appNo = this.data.ApplicationNo;
    const appODP = this.data.ApplicationNoOdp;
    const regNo = this.data.RegistrationNo;
    const regOdp = this.data.RegistrationNoOdp;
    // const token = sessionStorage.getItem("token");
    const selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = sharePaymentLink(appNo, appODP, regNo, regOdp);
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    this.toasterService.success("Payment Url copied ! ");
    this._vehicleBuyPlanService.SetExpTime(appNo, appODP, regNo, regOdp).subscribe((res) => {
      console.log(res);
      if (res.successcode == "0" || res.successcode == null) {
        this.errorLogDetails.UserCode = this.posMobileNo;
        this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
        this.errorLogDetails.CompanyName = this.reviewData["Data"].APIMethod.split[0];
        this.errorLogDetails.ControllerName = 'PaymentURLShare';
        this.errorLogDetails.MethodName = 'GetPaymentUrlShareData'
        this.errorLogDetails.ErrorCode = res.successcode;
        this.errorLogDetails.ErrorDesc = res.msg;
        this._errorHandleService
          .sendErrorLog(this.errorLogDetails)
          .subscribe((res: any) => {
            console.log('errorlog-----=>', res);
          });
      }
    })

  }


  // isReadonly = (fieldName: string, data: any): boolean => { //for Sbi 

  //   switch (fieldName) {
  //     case 'mobileNo': {
  //       return (data!.CKYCMobileNumber !== null && data!.CKYCMobileNumber !== "" && data!.CKYCMobileNumber !== undefined)
  //     }
  //     case 'PropGenderTitle': {
  //       return (data!.CKYCNamePrefix !== null && data!.CKYCNamePrefix !== "" && data!.CKYCNamePrefix !== undefined)
  //     }
  //     case 'ownerName': {
  //       return (data!.CKYCFirstName !== null && data!.CKYCFirstName !== "" && data!.CKYCFirstName !== undefined)
  //     }
  //     case 'ownerLastName': {
  //       return (data!.CKYCLastName !== null && data!.CKYCLastName !== "" && data!.CKYCLastName !== undefined)
  //     }
  //     case 'dob': {
  //       return (data!.CKYCDOB !== null && data!.CKYCDOB !== "" && data!.CKYCDOB !== undefined)
  //     }
  //     case 'emailId': {
  //       return (data!.CKYCEmailAdd !== null && data!.CKYCEmailAdd !== "" && data!.CKYCEmailAdd !== undefined)
  //     }
  //     case 'postalAdd': {
  //       return (data!.CKYCCorAdd1 !== null && data!.CKYCCorAdd1 !== "" && data!.CKYCCorAdd1 !== undefined)
  //     }
  //     case 'addArea': {
  //       return (data!.CKYCCorAdd2 !== null && data!.CKYCCorAdd2 !== "" && data!.CKYCCorAdd2 !== undefined)
  //     }
  //     case 'state': {
  //       return (data!.CKYCCorAddState !== null && data!.CKYCCorAddState !== "" && data!.CKYCCorAddState !== undefined)
  //     }
  //     case 'district': {
  //       return (data!.CKYCCorAddDistrict !== null && data!.CKYCCorAddDistrict !== "" && data!.CKYCCorAddDistrict !== undefined)
  //     }
  //     case 'city': {
  //       return (data!.CKYCCorAddCity !== null && data!.CKYCCorAddCity !== "" && data!.CKYCCorAddCity !== undefined)
  //     }
  //     case 'pincode': {
  //       return (data!.CKYCCorAddPin !== null && data!.CKYCCorAddPin !== "" && data!.CKYCCorAddPin !== undefined)
  //     }
  //     default: {
  //       return true;
  //     }
  //   }

  // }
}

// s:371:"{"key":"rzp_test_TNM7NAj5tr8DiY","amount":200,"name":"SBIGeneral","description":"M2W","image":"https:\/\/ansappsuat.sbigen.in\/SBIGTP_Dev\/images\/logo.jpg","prefill":{"name":"vinash kumar","email":"avv@gmail.com","contact":"9165656556"},"notes":{"address":"xxxyy","merchant_order_id":"04112019113328124209","quote_number":"0000000001079544","sbig_partner_id":"RazorPay"},"theme":{"color":"#F37254"},"order_id":"order_Dc9i4YihAtYtF6"}";
