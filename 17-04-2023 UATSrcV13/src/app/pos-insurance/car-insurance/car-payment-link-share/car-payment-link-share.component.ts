
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
} from "@angular/core";
import { VehicleBuyPlanService } from "src/app/pos-insurance/services/vehicle-buyplan.service";
import {
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";
import { decrypt, encrypt } from "src/app/models/common-functions";
import { IPlansMotor } from "src/app/models/health-insu.Model";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { apiToken } from "src/app/models/constants";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { errorLog } from "src/app/models/common.Model";

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

declare var Razorpay: any;


@Component({
  selector: 'app-car-payment-link-share',
  templateUrl: './car-payment-link-share.component.html',
  styleUrls: ['./car-payment-link-share.component.css']
})
export class CarPaymentLinkShareComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  //#region properties
  private _subscriptions: any[] = [];
  reviewData: any;
  isNewPolicy = false;
  image: any;
  @Output() onClickEdit = new EventEmitter<number>();
  @Output("onPageVisible") captureScreenshot = new EventEmitter<any>();
  ApplicationNo: any;

  ApplicationNoOdp: any;
  RegistrationNo: any;
  RegistrationNoOdp: any;
  termAndCon = new FormControl(false, Validators.required);
  errMsg = "";
  //#endregion
  sessData: any;
  VehicleData: any;
  selectedIndex!: number;
  showLoader: boolean = false;
  premiumDataPlans!: IPlansMotor;
  result: any;
  finalData: any;
  BreakinCompanyInspectionModal: string = "none";
  policyData: any;
  AmountPayableIncludingGST: any;
  token: any;
  timer: any;
  display!: string;
  changetored: boolean = false;
  displayNone: boolean = false;
  msg!: string;
  showPopUp: string = "none";
  checkWhetherPaymentCLicked: boolean = false;
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
    private route: ActivatedRoute,
    private _errorHandleService: ErrorHandleService,
  ) {


    this.route.queryParams.subscribe((p: any) => {
      console.log(p)
      // this.ApplicationNo = Number(p.get("a_id"));
      // this.ApplicationNoOdp = Number(p.get("odp"));ks
      // this.RegistrationNo = Number(p.get("regNo"));
      // this.RegistrationNoOdp = Number(p.get("regNoOdp"));
      this.ApplicationNo = Number(JSON.parse(atob(p.a_id)));
      this.ApplicationNoOdp = Number(JSON.parse(atob(p.odp)));
      this.RegistrationNo = Number(JSON.parse(atob(p.regNo)));
      this.RegistrationNoOdp = Number(JSON.parse(atob(p.regNoOdp)));
      // this.token = p.get("token");
    })
    // this.route.paramMap.subscribe((p) => {
    //   this.ApplicationNo = Number(p.get("a_id"));
    //   this.ApplicationNoOdp = Number(p.get("odp"));
    //   this.RegistrationNo = Number(p.get("regNo"));
    //   this.RegistrationNoOdp = Number(p.get("regNoOdp"));
    //   // this.token = p.get("token");

    // })

  }
  posMobileNo: any = 9119283982;
  // userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;
  ngOnInit() {




    this.callApiToSetExpTime();
    // this.callApiToGetPolicyDetails();

    // this.sessData = JSON.parse(sessionStorage.getItem("Data"));
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
    // this.posMobileNo = decrypt(sessionStorage.getItem("posMob"));

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
  callApiToSetExpTime() {

    const PolicyDetails = {
      ApplicationNo: this.ApplicationNo,
      ApplicationNoOdp: this.ApplicationNoOdp,
      RegistrationNo: this.RegistrationNo,
      RegistrationNoOdp: this.RegistrationNoOdp
    }
    this._vehicleBuyPlanService.setTimeLimit(PolicyDetails).subscribe((res) => {
      console.log(res);

      const timDiff = Math.abs(Number(res.data[0]['DateTimeDiff']));
      console.log("timDiff===" + timDiff)
      this.timer = timDiff;
      this.countDowntimer(this.timer);
      if (res.successcode == "0") {
        this.errorLogDetails.UserCode = this.posMobileNo;
        this.errorLogDetails.ApplicationNo = this.ApplicationNo;
        this.errorLogDetails.CompanyName = 'ApiMethod';
        this.errorLogDetails.ControllerName = 'PaymentURLShare';
        this.errorLogDetails.MethodName = 'GetPaymentUrlShareSetExpTime'
        this.errorLogDetails.ErrorCode = res.successcode;
        this.errorLogDetails.ErrorDesc = res.msg;
        this._errorHandleService
          .sendErrorLog(this.errorLogDetails)
          .subscribe((res: any) => {
            console.log('errorlog-----=>', res);
          });
        this.toasterService.warning(
          res.msg,
          res.successcode
        );
      }
      if (res.successcode == '1') this.callApiToGetPolicyDetails();
      //     this.timer = setInterval(() => {
      //   this.func(expTime);
      // }, 1000);
    })

  }

  countDowntimer(minute: any) {
    // let minute = 1;
    let seconds: number = minute * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const prefix = minute < 10 ? "0" : "";

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = "0" + statSec;
      } else textSec = statSec;
      var hours = Math.floor(seconds / 3600);
      var minutes = Math.floor((seconds - (hours * 3600)) / 60);
      // var seconds = sec_num - (hours * 3600) - (minutes * 60);
      const prefixMin = minutes < 10 ? "0" : "";
      const prefixHour = hours < 10 ? "0" : "";
      this.display = `${prefixHour}${hours}h : ${prefixMin}${minutes}m : ${textSec}s`;
      if (seconds == 30) {
        this.changetored = true;
      }
      if (seconds == 0) {
        console.log("finished");
        this.displayNone = true;
        clearInterval(timer);
      }
    }, 1000);
  }

  //   func(t) {
  //     console.log(t);
  //     var d = new Date(); //get current time
  //     var seconds = d.getMinutes() * 60 + d.getSeconds(); //convet current mm:ss to seconds for easier caculation, we don't care hours.
  //     var fiveMin = 60 * t; //five minutes is 300 seconds!
  //     var timeleft = fiveMin - seconds % fiveMin; // let's say now is 01:30, then current seconds is 60+30 = 90. And 90%300 = 90, finally 300-90 = 210. That's the time left!
  //     return  this.timer = Math.round(timeleft / 60) + ':' + timeleft % 60; //formart seconds back into mm:ss
  //     // document.getElementById('test').innerHTML = result;
  //     //  console.log(result);

  // }
  callApiToGetPolicyDetails() {
    //  sessionStorage.setItem('token',this.token)

    const PolicyDetails = {
      ApplicationNo: this.ApplicationNo,
      ApplicationNoOdp: this.ApplicationNoOdp,
      RegistrationNo: this.RegistrationNo,
      RegistrationNoOdp: this.RegistrationNoOdp
    }
    console.log(PolicyDetails);
    this._vehicleBuyPlanService.GetApplicationDetails(PolicyDetails).subscribe((data) => {
      console.log(data);

      if (data.successcode == "0") {
        this.errorLogDetails.UserCode = this.posMobileNo;
        this.errorLogDetails.ApplicationNo = this.ApplicationNo;
        this.errorLogDetails.CompanyName = 'ApiMethod';
        this.errorLogDetails.ControllerName = 'VehcileRegistrationData';
        this.errorLogDetails.MethodName = 'GetApplicationData'
        this.errorLogDetails.ErrorCode = data.successcode;
        this.errorLogDetails.ErrorDesc = data.msg;
        this._errorHandleService
          .sendErrorLog(this.errorLogDetails)
          .subscribe((res: any) => {
            console.log('errorlog-----=>', res);
          });
        this.toasterService.warning(
          data.msg,
          data.successcode
        );
        this.openModalDialog();
        this.msg = data.msg;
      }
      this.sessData = data.data[0]
      this.reviewData = data.data[0];
      this.createProposalRequest();
      if (this.reviewData.SubCateCode == 1 || this.reviewData.SubCateCode == 3) this.isNewPolicy == true
    })

  }
  ngOnChanges(changes: SimpleChanges) {
    // 
    // console.log({ changes });
    // this.policyData = JSON.parse(sessionStorage.getItem("postData"));
    // this.sessData = JSON.parse(sessionStorage.getItem("Data"));
    // // this.VehicleData = JSON.parse(sessionStorage.getItem('VehicleData'));
    // this.premiumDataPlans = this.sessData.premiumDataPlans;
    // this.callApiToGetPolicyDetails()
    // this.createProposalRequest();
  }

  ngAfterViewInit() {

    // this.captureScreenshot.emit();
  }


  handleBreakinCase(companyCode: any) {

    if (companyCode == "4") {
      //iffco tokio

      if (+this.reviewData.ComprehensiveThirdPartyCode === 1) {
        this.onSubmitProposal();
        return;
      }
      this._router.navigate([
        `/car-insurance/car-breakin-case`,
        encrypt(`${this.reviewData.ApplicationNo}`),
        encrypt(`${this.reviewData.ApplicationNoOdp}`),
      ]);

      return;
    }

    if (companyCode == "8") {
      this.showLoader = true;
      this.onSubmitProposal();
    }
  }

  createProposalRequest() {

    // console.log("ReviewData", this.reviewData);
    // console.log("SessData", this.sessData);

    // // for (let i = 0; i <= this.reviewData.CoverageList.length; i++){

    // // }
    let idvBasic = this.reviewData.PlanRequest.CoverageList.find(
      (x: any) => x.CoverageCode === "IDV Basic"
    );
    let depWaiver = this.reviewData.PlanRequest.CoverageList.find(
      (x: any) => x.CoverageID == 1
    );
    let paOwner = this.reviewData.PlanRequest.CoverageList.find(
      (x: any) => x.CoverageID == 16
    );
    let NCB = this.reviewData.PlanRequest.CoverageList.find(
      (x: any) => x.CoverageCode == "No Claim Bonus"
    );
    let TPPD = this.reviewData.PlanRequest.CoverageList.find(
      (x: any) => x.CoverageID == 28
    )
    // let GrossAmount = this.reviewData.PolicyPremiumAmount;

    // let ODPremium = Number(idvBasic.ODPremium);
    // let TTPremium = Number(idvBasic.TPPremium);
    // if (this.reviewData["zeroDp"]) {
    //   let grossod = Number(idvBasic.ODPremium);
    //   GrossAmount += grossod;
    // }
    // if (this.reviewData["pacover"]) {
    //   TTPremium = Number(idvBasic.TPPremium) + Number(paOwner.TPPremium);
    // }
    // this.AmountPayableIncludingGST = Math.round(GrossAmount + (0.18 * GrossAmount));
    // console.log(this.AmountPayableIncludingGST)
    // const data = {
    //   policyNumber: this.reviewData.PlanRequest.policyNumber,
    //   PartnerId: this.reviewData.Partnerid,
    //   ProductCode: this.reviewData.PlanRequest.ProductCode,
    //   ApplicationNo: this.reviewData.ApplicationNo.toString(),
    //   ApplicationNoOdp: this.reviewData.ApplicationNoOdp.toString(),
    //   RegistrationNo: this.reviewData.PlanRequest.RegistrationNo.toString(),
    //   RegistrationNoOdp: this.reviewData.PlanRequest.RegistrationNoOdp.toString(),

    //   IDVValue: this.reviewData.PlanRequest.IDVValue,
    //   MinIDVVAlue: 0 ,
    //   MaxIDVVAlue: 0 ,

    //   NCBValue: "0",
    //   CompTPODValue: "2",
    //   PolicyTenureValue: this.reviewData.PolicyTenure,

    //   TotalODPremium: ODPremium.toString(),
    //   TotalTPPremium: TTPremium.toString(),

    //   DiscountAmt: this.reviewData.DiscountAmount, //"0",
    //   DiscountLoading: this.reviewData.DiscountLoading, //"0",

    //   GrossAmount: GrossAmount.toString(),
    //   NetPremium:
    //     this.AmountPayableIncludingGST.toString(),
    //   CompanyCode: this.reviewData.CompanyCode,

    //   CoverageList: [],
    //   // sessData  : this.sessData
    //   // screenshot: this.reviewData["screenshot"],
    // };


    let ODPremium = this.sessData.PlanRequest.CoverageList[0].ODPremium;
    let TTPremium = this.sessData.PlanRequest.CoverageList[0].TPPremium;

    const data = {
      policyNumber: this.sessData.policyNumber,
      PartnerId: this.sessData.PlanRequest.Partnerid,
      ProductCode: "0",
      ApplicationNo: this.reviewData.ApplicationNo,
      ApplicationNoOdp: this.reviewData.ApplicationNoOdp,
      RegistrationNo: this.reviewData.RegistrationNo,
      RegistrationNoOdp: this.reviewData.RegistrationNoOdp,

      IDVValue: this.sessData.PlanRequest.IDVValue,
      MinIDVVAlue: this.sessData.PlanRequest.MinIDVVAlue,
      MaxIDVVAlue: this.sessData.PlanRequest.MaxIDVVAlue,

      NCBValue: "0",
      CompTPODValue: "2",
      PolicyTenure: this.sessData.PolicyTenure,

      TotalODPremium: ODPremium,
      TotalTPPremium: TTPremium,

      DiscountAmt: this.sessData.PlanRequest.DiscountAmt,
      DiscountLoading: this.sessData.PlanRequest.DiscountLoading,

      GrossAmount: this.sessData.PlanRequest.GrossAmount,
      NetPremium: this.sessData.PlanRequest.NetPremium,
      // GrossAmount:
      //   +this.sessData.amountPayableIncludingGst - +this.sessData.gst,
      // NetPremium: this.sessData.amountPayableIncludingGst,

      CoverageList: this.sessData.PlanRequest.CoverageList,
      VehicleExShowroomPrice: this.sessData.PlanRequest.VehicleExShowroomPrice,
      // screenshot: this.reviewData["screenshot"],
    };
    // console.log(this.sessData)
    // data.CoverageList.push(idvBasic);
    // if (this.reviewData.PlanRequest.CoverageList["pacover"] && paOwner) {
    //   data.CoverageList.push(paOwner);
    // }

    // if (this.sessData.zeroDp) {
    //   data.CoverageList.push(this.sessData.depreciation);
    // }
    // if (!this.sessData.isTp) {
    //   if (this.sessData.NCB != undefined) {
    //     data.CoverageList.push(this.sessData.NCB);
    //   }
    // }

    //  data.CoverageList.push(idvBasic);
    // if (this.reviewData.PlanRequest.CoverageList["pacover"] && paOwner) {
    //   data.CoverageList.push(paOwner);
    // }
    // if (this.reviewData.PlanRequest.CoverageList["zeroDp"] && depWaiver) {
    //   data.CoverageList.push(depWaiver);
    // }
    // if (NCB != undefined) {
    //   data.CoverageList.push(NCB);
    // }
    // data[0].PlanRequest.CoverageList
    // this.sessData.selectedAddons.map((x) => data.CoverageList.push(x));
    // this.sessData.discountByAddons.map((x) => data.CoverageList.push(x));
    // console.log("data.CoverageList", data.CoverageList);


    // this.finalData = JSON.stringify(data);
    // console.log("finalData", this.finalData);
    // sessionStorage.setItem("finalData", this.finalData);
    // sessionStorage.setItem("reviewData", JSON.stringify(this.reviewData));

    this.finalData = JSON.stringify(data);
    // sessionStorage.setItem("finalData", this.finalData);
    // sessionStorage.setItem("Data",this.finalData)
    sessionStorage.setItem("finalData", encrypt(this.finalData));
    console.log("finalData ==> ", this.finalData);
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

  onSubmitPay(tnc: boolean): any {
    const previousPolicyExpCode = this.reviewData.PrvPolicyExCode;
    const companyCode = this.reviewData.CompanyCode;

    if (!tnc) {
      this.errMsg = "Pease accept our term and policies after reading it.";
      return false;
    }


    if (previousPolicyExpCode == 1) {
      this.handleBreakinCase(companyCode);
    }
    if (this.displayNone) this.callApiToGetPolicyDetails();
    else this.onSubmitProposal();
  }

  onSubmitProposal() {
    // this.finalData = this.dummyFinalData;

    const PolicyDetails = {
      ApplicationNo: this.ApplicationNo,
      ApplicationNoOdp: this.ApplicationNoOdp,
      RegistrationNo: this.RegistrationNo,
      RegistrationNoOdp: this.RegistrationNoOdp
    }
    this.showLoader = true;
    // return;
    if (this.reviewData != null) {
      this._subscriptions.push(
        this._vehicleBuyPlanService.OnPaymentClicked(PolicyDetails).subscribe((ResponseData) => {
          if (ResponseData.successcode == '1') {
            this._vehicleBuyPlanService
              .vehicleProposalRequest(this.finalData, this.reviewData)
              .subscribe(
                (result) => {
                  this.showLoader = false;
                  console.log("Api Response", result);
                  if (result.successcode == "1") {
                    // if (this.sessData.CompanyCode === "4") {
                    //   this.iffcoTokioResponse = result;
                    // }
                    // this._subscriptions.push(
                    //   this._vehicleBuyPlanService
                    //     .saveProposalRequest(this.finalData)
                    //     .subscribe((result:any)=>{
                    //       if(result.successcode == "0" || result.successcode == null){
                    //         this.errorLogDetails.UserCode = this.posMobileNo;
                    //         this.errorLogDetails.ApplicationNo = this.reviewData.ApplicationNo;
                    //         this.errorLogDetails.CompanyName = this.reviewData["Data"].APIMethod.split('/')[0];
                    //         this.errorLogDetails.ControllerName = "VehicleData";
                    //         this.errorLogDetails.MethodName = "RegistrationVehicleSelectedPlan";
                    //         this.errorLogDetails.ErrorCode = result.successcode?result.successcode:"0";
                    //         this.errorLogDetails.ErrorDesc = result.msg?result.msg:"Something went wrong.Try again later.";
                    //         this._errorHandleService
                    //           .sendErrorLog(this.errorLogDetails)
                    //           .subscribe((res: any) => {
                    //             console.log(res);
                    //           });

                    //       }
                    //     })
                    // );


                    this.result = result.data;
                    let proposalNuber = encrypt(this.sessData.policyNumber);
                    let ApplicationNo = encrypt(
                      String(this.reviewData.ApplicationNo)
                    );
                    let RegistrationNo = encrypt(
                      String(this.reviewData.RegistrationNo)
                    );
                    sessionStorage.setItem("proposalNo", proposalNuber);
                    sessionStorage.setItem("appNo", ApplicationNo);
                    sessionStorage.setItem("regNo", RegistrationNo);


                    // Payment for IFFCO TOKIO
                    if (this.sessData.CompanyCode == "4") {
                      console.log("result.data", result.data);
                      this.showLoader = true;
                      this.newPostForm(result.msg, result.data);
                    }
                    //  Payment for FUTURE GENERALI
                    if (this.sessData.CompanyCode == "2") {

                      //   const Parameter_pay = {
                      //     TransactionID: this.result.RegistrationNo,
                      //     // ProposalNumber: this.sessData.policyNumber,
                      //     PremiumAmount: this.result.PolicyPremiumAmount,
                      //     UserIdentifier: this.result.MobileNo,
                      //     PaymentOption: 3,
                      //     ResponseURL: this.result.ResponseURL,
                      //     // UserId: this.result.MobileNo,
                      //     FirstName: this.result.VechileOwnerName,
                      //     LastName: this.result.VechileOwnerName,
                      //     Mobile: this.result.MobileNo,
                      //     Email: this.result.EmailID,

                      //     ProposalNumber: this.result.ProposalPolicyNumber,
                      //     UserId: this.reviewData.ApplicationNo,
                      //     CheckSum: this.result.CheckSum,
                      //   };
                      //   this.showLoader = true;
                      //   this.postForm(this.result.PaymentURL, Parameter_pay, "post");
                      // }
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
                      this.showLoader = true;
                      this.postForm(this.result.PaymentURL, Parameter_pay, "post");
                    }
                    // Payment for Universal
                    if (this.sessData.CompanyCode == "6") {
                      this.showLoader = true;
                      window.location.href = this.result[0].PaymentURL;
                    }
                    // Payment for Godigit
                    if (this.sessData.CompanyCode == "8") {
                      // return;

                      // check if the data is Array, if so then check policy status inside it
                      // 'pending documents' status decides the breaking case
                      if (Array.isArray(result.data) || result.msg === "success") {
                        if (
                          result.data[0].ProposalStatusMsg === "PENDING_DOCUMENTS"
                        ) {
                          // $("#BreakinCompanyInspectionModal").modal("show");
                          this.BreakinCompanyInspectionModal = "block";
                          return;
                        }
                      }
                      console.log(result.data);

                      // otherwise its implied that it is a payment url, so redirect user
                      window.location.href = result.data;
                    }
                    // Payment for TataAig
                    if (this.sessData.CompanyCode == "9") {
                      this.showLoader = true;
                      window.location.href = result.data.PaymentURL;
                    }

                    // Payment for National
                    if (this.sessData.CompanyCode == "10") {
                      // return;
                      this.showLoader = true;
                      window.location.href = result.data[0].PaymentURL;
                    }

                    // Payment for SBI
                    if (this.sessData.CompanyCode == "7") {
                      console.log(result);
                      // return;
                      this.paymentSBI(result);
                    }

                    // Payment for New India
                    if (this.sessData.CompanyCode == "12") {
                      console.log(result);
                      // return;
                      window.location.href = result.data[0].PaymentURL;
                    }

                    // Payment for BAJAJ ALLIANZ
                    if (this.sessData.CompanyCode == "13") {
                      console.log(result);
                      // return;
                      window.location.href = result.data[0].PaymentURL;
                    }
                  } else {


                    console.log(this.reviewData)
                    this.errorLogDetails.UserCode = this.posMobileNo;
                    this.errorLogDetails.ApplicationNo = this.reviewData.ApplicationNo;
                    this.errorLogDetails.CompanyName = this.reviewData.APIMethod.split('/')[0];
                    this.errorLogDetails.ControllerName = this.reviewData.APIMethod.split('/')[0]
                    this.errorLogDetails.MethodName = this.reviewData.APIMethod.split('/')[1]
                    this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
                    this.errorLogDetails.ErrorDesc = result.msg ? result.msg : 'Something went wrong.'
                    this._errorHandleService
                      .sendErrorLog(this.errorLogDetails)
                      .subscribe((res: any) => {
                        console.log("error----=>", res);
                      });
                    this._errorHandleService._toastService.warning(
                      result.msg,
                      result.successcode
                    );
                  }
                },
                (err: any) => {
                  this.showLoader = false;
                  this._errorHandleService.handleError(err);
                }
              )
          } else {
            alert("jasf;ldlk")
            // if (ResponseData.successcode == "0" && ResponseData.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = 'ApiMethod';
            this.errorLogDetails.ControllerName = 'PaymentURLShare';
            this.errorLogDetails.MethodName = 'OnPaymentClick'
            this.errorLogDetails.ErrorCode = ResponseData.successcode ? ResponseData.successcode : '0';
            this.errorLogDetails.ErrorDesc = ResponseData.msg ? ResponseData.msg : 'Something went wrong.Please try again later.';
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log('errorlog-----=>', res);
              });
            this.toasterService.warning(
              ResponseData.msg,
              ResponseData.successcode
            );
            // }
          }
        }
        )
      )

    }
  }

  paymentSBI(result: any) {

    $("#rzp-button1").trigger("click");
    var options = {
      key: "rzp_test_TNM7NAj5tr8DiY", // Enter the Key ID generated from the Dashboard
      amount: Number(result.data[0].PoicyTotalAmount * 100), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "SBIGeneral",
      description: "M2W",
      image: result.data[0].CompanyLogo,
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
  //close BreakinCompanyInspectionModal
  closeModalDialog() {
    this.BreakinCompanyInspectionModal = "none";
    this.showPopUp = "none";
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


  openModalDialog() {
    this.showPopUp = "block"; //Set block css
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

// s:371:"{"key":"rzp_test_TNM7NAj5tr8DiY","amount":200,"name":"SBIGeneral","description":"M2W","image":"https:\/\/ansappsuat.sbigen.in\/SBIGTP_Dev\/images\/logo.jpg","prefill":{"name":"vinash kumar","email":"avv@gmail.com","contact":"9165656556"},"notes":{"address":"xxxyy","merchant_order_id":"04112019113328124209","quote_number":"0000000001079544","sbig_partner_id":"RazorPay"},"theme":{"color":"#F37254"},"order_id":"order_Dc9i4YihAtYtF6"}";

