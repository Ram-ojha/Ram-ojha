import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  SimpleChanges,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { IApplicationVehicleRegData } from "src/app/models/bike-insu.Model";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { VehicleBuyPlanService } from "../../services/vehicle-buyplan.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { decrypt, encrypt } from "src/app/models/common-functions";
import { IBreakInCase } from "../../bike-insurance/review-pay/review-pay.component";
import { Subscription, timer } from "rxjs";
import { map, take } from "rxjs/operators";
import { PATTERN } from "src/app/models/common";
import { Router } from "@angular/router";
import { apiToken, sharePaymentLink, sharePaymentLinkForCar } from "src/app/models/constants";
import { errorLog, ICkycResponse, IUrlSharing } from "src/app/models/common.Model";
import { ToastrService } from "ngx-toastr";
import { UrlShareModalComponent } from "src/app/shared/components/url-share-modal/url-share-modal.component";
import { CkycDetailsComponent } from "../../ckyc-details/ckyc-details.component";


declare var Razorpay: any;

@Component({
  selector: "car-review-pay",
  templateUrl: "./review-pay.component.html",
  styleUrls: ["./review-pay.component.css"],
})
export class ReviewPayComponent implements OnInit, AfterViewInit, OnDestroy {
  private _subscriptions: any[] = [];

  @ViewChild("shareUrlModal", { static: false })
  shareUrlModal!: UrlShareModalComponent;
  @ViewChild("CkycModal", { static: false })
  CkycModal!: CkycDetailsComponent;

  @Input() reviewData!: IApplicationVehicleRegData | any;
  @Input()
  isNewPolicy!: boolean;
  @Input() isPrvPolicyRemember: any;
  @Output() onClickEdit = new EventEmitter<number>();
  @Output("onPageVisible") captureScreenshot = new EventEmitter<any>();

  termAndCon = new FormControl(false, Validators.required);
  errMsg = "";
  result: any;
  showLoader: boolean = false;
  sessData!: any;
  // Break in case
  breakInCase!: FormGroup;
  breakInCaseData!: IBreakInCase;
  InspectionType!: string;
  OdMeter!: number;
  number!: number;
  additionaldata: any;
  ReturnKeyOfPayment!: string;
  ReturnKeyOfPaymentMsg!: string;
  public timerSub!: Subscription;
  public countDownValue: number = 0;
  iffcoTokioResponse: any;
  finalData: any;
  BreakinCompanyInspectionModal: string = "none";
  insuranceType: any;
  premiumDataPlans: any;
  postData: any;
  urlSharingModal!: IUrlSharing;

  ckycResponseData!: ICkycResponse;
  // Break in case end

  constructor(
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private formBuilder: FormBuilder,
    private _router: Router,
    private toasterService: ToastrService,
  ) { }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;

  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    this.postData = JSON.parse(sessionStorage.getItem("postData")!);
    this.insuranceType = JSON.parse(sessionStorage.getItem("insuranceType")!);
    // this.reviewData = JSON.parse(sessionStorage.getItem("reviewData"));
    // this.breakInCase  =  this.formBuilder.group({
    //   odometer: ['', Validators.required],
    //   InpectionType: ['', Validators.required],
    //   MobileNo: ['', [Validators.required,Validators.maxLength(10),Validators.pattern(PATTERN.MOBILENO)]]
    // });
    // this.createProposalRequest();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log({ changes });
    this.sessData = JSON.parse(sessionStorage.getItem("popupData")!);
    this.createProposalRequest();
  }

  ngAfterViewInit() {
    // this.captureScreenshot.emit();
  }

  // onSubmitBreakInCaseStatus(){
  //     // $('#breakInCaseStatus').modal('hide');
  //     this._vehicleBuyPlanService.BreakInInpectionCheckStatus(this.ReturnKeyOfPayment).subscribe((result) => {
  //         
  //         console.log({result});
  //         this.ReturnKeyOfPaymentMsg = 'accepted'//result.msg
  //     });
  // }

  createProposalRequest() {
    let ODPremium = this.sessData.CoverageList[0].ODPremium;
    let TTPremium = this.sessData.CoverageList[0].TPPremium;

    const data: any = {
      policyNumber: this.sessData.policyNumber,
      PartnerId: this.reviewData["Data"].Partnerid,
      ProductCode: "0",
      ApplicationNo: this.reviewData.ApplicationNo,
      ApplicationNoOdp: this.reviewData.ApplicationNoOdp,
      RegistrationNo: this.reviewData["Data"].RegistrationNo,
      RegistrationNoOdp: this.reviewData["Data"].RegistrationNoOdp,

      IDVValue: this.sessData.IDVVAlue,
      MinIDVVAlue: this.sessData.MinIDVVAlue,
      MaxIDVVAlue: this.sessData.MaxIDVVAlue,

      NCBValue: "0",
      CompTPODValue: "2",
      PolicyTenure: this.sessData.tenure,
      Owner_Driver_PA_Cover_Other_Value: this.sessData.Owner_Driver_PA_Cover_Other_Value,
      TotalODPremium: ODPremium,
      TotalTPPremium: TTPremium,

      DiscountAmt: this.sessData.DiscountAmt,
      DiscountLoading: this.sessData.DiscountLoading,

      // GrossAmount: this.sessData.amountPayableIncludingGst,
      // NetPremium: this.sessData.NetPremium,
      GrossAmount:
        +this.sessData.amountPayableIncludingGst - +this.sessData.gst,
      NetPremium: this.sessData.amountPayableIncludingGst,

      CoverageList: [],
      VehicleExShowroomPrice: this.sessData.VehicleExShowroomPrice,
      // screenshot: this.reviewData["screenshot"],
    };
    // data.CoverageList.push(this.sessData.IDV);
    // if (this.sessData.pacover) {
    //   data.CoverageList.push(this.sessData.paOwner);
    // }

    // if (this.sessData.zeroDp) {
    //   data.CoverageList.push(this.sessData.depreciation);
    // }
    if (!this.sessData.isTp) {
      if (this.sessData.NCB != undefined) {
        data.CoverageList.push(this.sessData.NCB);
      }
    }
    this.sessData.selectedAddons.map((x: any) => data.CoverageList.push(x));
    // this.sessData.discountByAddons.map((x) => data.CoverageList.push(x));
    console.log("data.CoverageList", data.CoverageList);


    this.finalData = JSON.stringify(data);
    console.log("finalData", this.finalData);
    sessionStorage.setItem("finalData", this.finalData);
    sessionStorage.setItem("reviewData", JSON.stringify(this.reviewData));
  }

  // onSubmitBreakInCase(){
  //   this.breakInCaseData = this.breakInCase.value;
  //   this.breakInCaseData.ApplicationNo = this.reviewData.ApplicationNo.toString();
  //   this.breakInCaseData.ApplicationNoOdp = this.reviewData.ApplicationNoOdp.toString();
  //   this.breakInCaseData.RegistrationNo = this.reviewData['Data'].RegistrationNo.toString();
  //   this.breakInCaseData.RegistrationNoOdp = this.reviewData['Data'].RegistrationNoOdp.toString();
  //     // this.breakInCaseData.ApplicationNo = this.additionaldata.ApplicationNo;
  //     // this.breakInCaseData.ApplicationNoOdp = this.additionaldata.ApplicationNoOdp;
  //     // this.breakInCaseData.RegistrationNo = this.additionaldata.RegistrationNo;
  //     // this.breakInCaseData.RegistrationNoOdp = this.additionaldata.RegistrationNoOdp;
  //     this.breakInCaseData.InpectionTypeDesc = this.breakInCase.value.InpectionType == 1?'Agent':'Self';
  //     console.log("this.breakInCaseData",this.breakInCaseData);
  //     this._vehicleBuyPlanService.BreakInInpection(this.breakInCaseData).subscribe((result) => {
  //         if (result.successcode == "1" && result.data != null) {
  //             console.log({result});
  //             
  //             if(result.data[0].InpectionRefNo!=null || ""){
  //                 this.ReturnKeyOfPayment = result.data[0].InpectionRefNo;
  //                 this.ReturnKeyOfPaymentMsg = result.data[0].InpectionStatus;
  //                 // this.ReturnKeyOfPaymentMsg = result.msg;
  //                 this.startTimer();
  //             }
  //         }
  //     });
  //     $('#BreakInCase').modal('hide');
  //     setTimeout(function () {
  //         $('#breakInCaseStatus').modal('show');
  //     }, 500);
  // }

  // startTimer() {
  // 
  //   const startValue = 1 * 60;
  //   this.timerSub = timer(0, 1000).pipe(
  //     take(startValue + 1),
  //     map(value => startValue - value)
  //   ).subscribe(
  //     value => {
  //       this.countDownValue = value
  //       if (value == 0) {
  //       //   this.otpResponse = null;
  //       //   this.btnText = 'Resend OTP';
  //       //   this.isOtpSent = false;
  //       //   this.mobileNumber.enable();
  //       }
  //     },
  //     null,
  //     () => this.timerSub = null
  //   );
  // }

  onClickCkycModal(tnc: any): any {
    if (!tnc) {
      this.errMsg = "Pease accept our term and policies after reading it.";
      return false;
    }
    if (this.sessData.CompanyCode === "4") {

      this.CkycModal.showModal = true;
    }

    if (this.sessData.CompanyCode === '9') {
      this.CkycModal.showModal = true
    }
    if (this.sessData.CompanyCode === '12') {
      this.CkycModal.showModal = true
    }

  }

  isCkycValidForIffocoTokio: boolean = false;

  // iffcoTokioCkycData: any = null;
  isCkycValid(event: any) {
    if (this.sessData.CompanyCode === '4') {

      console.log(event);

      this.isCkycValidForIffocoTokio = event;

      // this.iffcoTokioCkycData = event

    }
    if (this.sessData.CompanyCode === '9') {

      console.log(event);

      this.ckycResponseData = event;

      // this.iffcoTokioCkycData = event

    }
    if (this.sessData.CompanyCode === '12') {
      this.ckycResponseData = event;
    }
  }

  onClickCkycTataAig() {


    if (this.sessData.CompanyCode === '9') {
      this.CkycModal.showModal = true
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


  onSubmitPay(tnc: boolean): any {
    const previousPolicyExpCode = this.reviewData["Data"].PrvPolicyExCode;
    const companyCode = this.sessData.CompanyCode;

    if (!tnc) {
      this.errMsg = "Pease accept our term and policies after reading it.";
      return false;
    }


    if (previousPolicyExpCode == 1) {
      this.handleBreakinCase(companyCode);
      // return;
    }

    this.onSubmitProposal();
  }

  onSubmitProposal() {
    // this.finalData = this.dummyFinalData;

    this.showLoader = true;
    // return;

    if (this.reviewData != null) {
      if (this.sessData.CompanyCode == "7" && this.reviewData.IsPUC === false && !this.isNewPolicy) {
        this.toasterService.error("Can't issue policy due to invalid PUC.", '', { timeOut: 5000 });

      } else {
        this._subscriptions.push(
          this._vehicleBuyPlanService
            .vehicleProposalRequest(this.finalData, this.reviewData["Data"])
            .subscribe(
              (result) => {
                this.showLoader = false;
                console.log("Api Response", result);
                if (result.successcode == "1") {
                  // if (this.sessData.CompanyCode === "4") {
                  //   this.iffcoTokioResponse = result;
                  // }
                  debugger;
                  this._subscriptions.push(
                    this._vehicleBuyPlanService
                      .saveProposalRequest(this.finalData)
                      .subscribe((result: any) => {
                        debugger
                        if (result.successcode == "0" || result.successcode == null) {
                          this.errorLogDetails.UserCode = this.posMobileNo;
                          this.errorLogDetails.ApplicationNo = this.reviewData.ApplicationNo;
                          this.errorLogDetails.CompanyName = this.reviewData["Data"].APIMethod.split[0];
                          this.errorLogDetails.ControllerName = "VehicleData";
                          this.errorLogDetails.MethodName = "RegistrationVehicleSelectedPlan";
                          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
                          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
                          this._errorHandleService
                            .sendErrorLog(this.errorLogDetails)
                            .subscribe((res: any) => {
                              console.log(res);
                            });

                        }
                      })
                  );


                  this.result = result.data;
                  let proposalNuber = encrypt(this.sessData.policyNumber);
                  let ApplicationNo = encrypt(
                    String(this.reviewData.ApplicationNo)
                  );
                  let RegistrationNo = encrypt(
                    String(this.reviewData["Data"].RegistrationNo)
                  );
                  sessionStorage.setItem("proposalNo", proposalNuber);
                  sessionStorage.setItem("appNo", ApplicationNo);
                  sessionStorage.setItem("regNo", RegistrationNo);
                  sessionStorage.setItem("posMob", encrypt(this.posMobileNo));



                  // Payment for IFFCO TOKIO
                  if (this.sessData.CompanyCode === "4") {
                    console.log("result.data", result.data);
                    this.showLoader = true;
                    this.newPostForm(result.msg, result.data);
                  }
                  //  Payment for FUTURE GENERALI
                  if (this.sessData.CompanyCode === "2") {

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
                  if (this.sessData.CompanyCode === "6") {
                    this.showLoader = true;
                    window.location.href = this.result[0].PaymentURL;
                  }
                  // Payment for Godigit
                  if (this.sessData.CompanyCode === "8") {
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

                    // otherwise its implied that it is a payment url, so redirect user
                    window.location.href = result.data;
                  }
                  // Payment for TataAig
                  if (this.sessData.CompanyCode === "9") {
                    // this.showLoader = true;
                    // window.location.href = result.data.PaymentURL;
                    sessionStorage.setItem('tataAigPropsal', JSON.stringify(this.result))
                    this.onClickCkycTataAig()
                  }

                  // Payment for National
                  if (this.sessData.CompanyCode === "10") {
                    // return;
                    this.showLoader = true;
                    window.location.href = result.data[0].PaymentURL;
                  }

                  // Payment for SBI
                  if (this.sessData.CompanyCode === "7") {
                    console.log(result);
                    // return;
                    debugger
                    this.paymentSBI(result);
                  }

                  // Payment for Reliance
                  if (this.sessData.CompanyCode === "11") {
                    window.location.href = result.data;
                  }

                  // Payment for New India
                  if (this.sessData.CompanyCode === "12") {
                    console.log(result);
                    // return;
                    window.location.href = result.data[0].PaymentURL;
                  }

                  // Payment for BAJAJ ALLIANZ
                  if (this.sessData.CompanyCode === "13") {
                    console.log(result);
                    if (result.data[0].PaymentURL) {

                      window.location.href = result.data[0].PaymentURL;
                    } else {
                      this.toasterService.warning(
                        "Not Getting Payment Url!",
                        "Payment Url Warning"
                      );
                    }
                  }
                  //Payment for United India
                  if (this.sessData.CompanyCode === '16') {
                    console.log(result);

                    this.paymentUnited(result);
                  }

                  //Payment for ShriRam 
                  if (this.sessData.CompanyCode === '19') {


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

                  this.errorLogDetails.UserCode = this.posMobileNo;
                  this.errorLogDetails.ApplicationNo = this.reviewData.ApplicationNo;
                  this.errorLogDetails.CompanyName = this.reviewData["Data"].APIMethod.split[0];
                  this.errorLogDetails.ControllerName = this.reviewData["Data"].APIMethod.split[0]
                  this.errorLogDetails.MethodName = this.reviewData["Data"].APIMethod.split[1]
                  this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
                  this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
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
        );

      }

    }
  }



  paymentUnited(result: any) {

    $("#ptm-button1").trigger("click");
    $('#ptm').prop('src', result.data[0].PaymentURL);
    // $("#ptm-button1").prop('disabled', true);

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
        "notifyMerchant": (eventName: any, data: any) => {
          console.log("notifyMerchant handler function called");
          console.log("eventName => ", eventName);
          console.log("data => ", data);
          if (eventName === "APP_CLOSED") {
            let paymentBtn = document.getElementById("payment-btn");
            paymentBtn?.setAttribute("disabled", "true");
            this.countDownTimer();
          }
        },
        "transactionStatus": function transactionStatus(paymentStatus: any) {
          console.log("paymentStatus => ", paymentStatus);
        }
      }
    };

    if (window.Paytm && window.Paytm.CheckoutJS) {
      window.Paytm.CheckoutJS.init(config).then(
        function onSuccess() {
          console.log('Before JS Checkout invoke');
          // after successfully update configuration invoke checkoutjs
          window.Paytm.CheckoutJS.invoke();
        },
        (error: any) => {
          // $("#ptm-button1").prop('disabled', false);
          console.log("Errordfsa => ", error);
          this.showMessage(error.message, "Paytm Error!")
        }
      ).catch((error: any) => {
        // $("#ptm-button1").prop('disabled', false);
        this.showMessage(error.message, "Paytm Error!")
        console.log("Error => ", error);
      });
    }
  }
  showMessage(message: string, title: string) {
    this.toasterService.error(message, title)
  }

  countDownTimer() {
    let seconds: number = 30;
    let textSec: any = "0";
    let statSec: number = 30;
    let timer: any;
    try {
      timer = setInterval(() => {
        try {
          seconds--;
          if (statSec != 0) statSec--;
          else statSec = 29;

          if (statSec < 10) {
            textSec = "0" + statSec;
          } else textSec = statSec;
          var hours = Math.floor(seconds / 3600);
          var minutes = Math.floor((seconds - (hours * 3600)) / 60);
          // var seconds = sec_num - (hours * 3600) - (minutes * 60);
          const prefixMin = minutes < 10 ? "0" : "";
          const prefixHour = hours < 10 ? "0" : "";

          document.getElementById("payment-btn")!.innerHTML = "Please wait " + `${textSec}s`;

          if (seconds == 0) {
            console.log("finished");
            document.getElementById("payment-btn")!.innerHTML = "&#8377;" + this.sessData.amountPayableIncludingGst + " Payment"
            document.getElementById("payment-btn")!.removeAttribute("disabled");
            clearInterval(timer);

          }
        } catch (error) {

          clearInterval(timer);
        }
      }, 1000);
    } catch (error) {
      clearInterval(timer);
    }
  }

  paymentSBI(result: any) {
    debugger
    console.log(result)
    $("#rzp-button1").trigger("click");
    var options = {
      key_id: "rzp_test_TNM7NAj5tr8DiY", // Enter the Key ID generated from the Dashboard
      amount: Number(result.data[0].PoicyTotalAmount * 100), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "SBIGeneral",
      description: "MCAR",
      image: "assets/img/company-logos/motor/" + result.data[0].CompanyLogo,
      order_id: result.data[0].ProposalOrderNo, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      key_secret: "ihcTD8qpM1ruxnS8L1OI8TFq",
      handler: function (response: any) {
        console.log(response)
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

  onEditClick(tab: number) {
    this.onClickEdit.emit(tab);
  }

  private postForm(path: string, Parameter_pay: any, method: string) {
    method = method || "post";

    let form = document.createElement("form");
    form.setAttribute("name", "form1");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("id", "form1");
    for (let key in Parameter_pay) {
      if (Parameter_pay.hasOwnProperty(key)) {
        let hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", Parameter_pay[key]);

        form.appendChild(hiddenField);
      }
    }
    document.body.appendChild(form);
    form.submit();
  }

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

  closeModalDialog() {
    this.BreakinCompanyInspectionModal = "none";
  }


  openDialog(): void {

    // const appNo = encrypt(JSON.stringify(dt.ApplicationNo));
    // const appODP = encrypt(JSON.stringify(dt.ApplicationNoOdp)); 
    // const regNo = encrypt(JSON.stringify(dt.RegistrationNo));
    // const regOdp = encrypt(JSON.stringify(dt.RegistrationNoOdp));

    if (this.sessData.CompanyCode == "7" && this.reviewData.IsPUC === false && !this.isNewPolicy) {
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
        Amount: `${this.sessData.amountPayableIncludingGst}/-`,
        Product_Description: `${this.insuranceType.InsuranceCateDesc}`,
        Plan_Description: this.postData.ComprehensiveThirdPartyDesc,
        Insurance_Company: `${this.postData.InsuranceCompDesc}`,
        POS_Name: `${userName} (${posMobileNo})`,
        Hospital_Or_Garage_URL: this.sessData.garageURL,
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
  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
