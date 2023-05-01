import { VehicleBuyPlanService } from "../../services/vehicle-buyplan.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { decrypt, encrypt } from "src/app/models/common-functions";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IBreakInCase } from "../../bike-insurance/review-pay/review-pay.component";
import { PATTERN } from "src/app/models/common";
import { Subscription, timer } from "rxjs";
import { map, take } from "rxjs/operators";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { ToastrService } from "ngx-toastr";
import { errorLog } from "src/app/models/common.Model";

@Component({
  selector: "car-breakin-case",
  templateUrl: "./car-breakin-case.component.html",
  styleUrls: ["./car-breakin-case.component.css"],
})
export class carBreakinCaseComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];

  showLoader = false;

  breakInCase!: FormGroup;
  breakInCaseData!: IBreakInCase;

  ApplicationNo!: number;
  ApplicationNoOdp!: number;
  // RegistrationNo: number;
  // RegistrationNoOdp: number;
  ReturnKeyOfPayment!: number;
  ReturnKeyOfPaymentMsg!: string;
  public timerSub!: any;
  public countDownValue: number = 0;
  finalData: any;
  sessData: any;
  BreakInCase: boolean = true;
  reviewData: any;
  additionaldata: any;
  errorMessage!: string;

  //popup
  BreakInCasePopUp: string = 'none';
  breakInCaseStatusPopUp: string = 'none';
  InpectionRefNo!: number;

  constructor(
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _router: Router,
    private _errorHandleService: ErrorHandleService,
    private _toastService: ToastrService
  ) { }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;
  ngOnInit() {
    this._subscriptions.push(
      this._route.paramMap.subscribe((p: any) => {
        const No: string = p.get("a_id");
        const Odp: string = p.get("odp");
        this.ApplicationNo = Number(decrypt(No));
        this.ApplicationNoOdp = Number(decrypt(Odp));
      }))
    this.breakInCase = this.formBuilder.group({
      odometer: ["", Validators.required],
      InpectionType: [{ value: "1", disabled: true }, Validators.required],
      MobileNo: [
        { value: "9584678351", disabled: true },
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(PATTERN.MOBILENO),
        ],
      ],
    });
    console.log(this.ApplicationNo);
    console.log(this.ApplicationNoOdp);
    this.finalData = JSON.parse(sessionStorage.getItem("finalData")!);
    this.sessData = JSON.parse(sessionStorage.getItem("popupData")!);
    this.reviewData = JSON.parse(sessionStorage.getItem("reviewData")!);
    console.log(this.finalData);
    console.log(this.sessData);
    if (sessionStorage.getItem("CarData")) {
      sessionStorage.removeItem("CarData");
    }
    // this.onSubmitBreakInCase()
    let ad = JSON.parse(sessionStorage.getItem("additionaldata")!);

    if (
      sessionStorage.getItem("InpectionRefNo") &&
      sessionStorage.getItem("InpectionStatus") &&
      sessionStorage.getItem("additionaldata") &&
      ad.additionaldata[0].ApplicationNo === +this.ApplicationNo
    ) {
      this.additionaldata = JSON.parse(
        sessionStorage.getItem("additionaldata")!
      );
      this.ReturnKeyOfPayment = +sessionStorage.getItem("InpectionRefNo")!;
      this.ReturnKeyOfPaymentMsg = sessionStorage.getItem("InpectionStatus")!;
      this.startTimer();
      this.BreakInCase = false;
      setTimeout(() => {
        this.ReturnKeyOfPayment = +sessionStorage.getItem("InpectionRefNo")!;
        this.breakInCaseStatusPopUp = 'block';
      }, 500);
    }
  }

  onRejected() {
    ($("#BreakInCase") as any).modal("hide");
    this.breakInCaseStatusPopUp = 'none';
    this._router.navigate([`/pos/car-insurance`]);
  }

  onSubmitBreakInCaseStatus() {
    // $('#breakInCaseStatus').modal('hide');
    this.showLoader = true;
    this._subscriptions.push(
      this._vehicleBuyPlanService
        .BreakInInpectionCheckStatus(this.ReturnKeyOfPayment)
        .subscribe((result) => {
          this.showLoader = false;
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "IFFCOTOKIO"
            this.errorLogDetails.MethodName = 'BreakInInpectionCheckStatus';
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log(res)
            })
          }

          console.log({ result });
          this.ReturnKeyOfPaymentMsg = result.msg; //'accepted'//result.msg
        }))
  }
  onSubmitBreakInCase() {
    if (this.breakInCase.invalid) {
      this.errorMessage = "Please fill all required fields with valid formats!";
      return;
    }

    this.errorMessage = "";
    this.breakInCaseData = { ...this.breakInCase.value };
    this.breakInCaseData.MobileNo = this.breakInCase.controls["MobileNo"].value; // disabled controls aren't included in form value
    this.breakInCaseData.InpectionType =
      this.breakInCase.controls["InpectionType"].value; //disabled controls aren't included in form value
    this.breakInCaseData.ApplicationNo =
      this.finalData.ApplicationNo.toString();
    this.breakInCaseData.ApplicationNoOdp =
      this.finalData.ApplicationNoOdp.toString();
    this.breakInCaseData.RegistrationNo =
      this.finalData.RegistrationNo.toString();
    this.breakInCaseData.RegistrationNoOdp =
      this.finalData.RegistrationNoOdp.toString();
    this.breakInCaseData.PropData = this.finalData;
    this.breakInCaseData.InpectionTypeDesc =
      this.breakInCaseData.InpectionType == "1" ? "Agent" : "Self";


    this.showLoader = true;
    this._subscriptions.push(
      this._vehicleBuyPlanService
        .BreakInInpection(this.breakInCaseData)
        .subscribe((result) => {
          this.showLoader = false;
          if (result.successcode == "1" && result.data != null) {
            console.log({ result });

            this.additionaldata = result["additionaldata"];
            sessionStorage.setItem(
              "additionaldata",
              JSON.stringify(result["additionaldata"])
            );
            console.log("this.additionaldata", this.additionaldata);

            if (
              result.data[0].InpectionRefNo != null ||
              result.data[0].InpectionRefNo != ""
            ) {
              this.ReturnKeyOfPayment = result.data[0].InpectionRefNo;
              sessionStorage.setItem(
                "InpectionRefNo",
                result.data[0].InpectionRefNo
              );
              if (
                result.data[0].InpectionStatus == null ||
                result.data[0].InpectionStatus == ""
              ) {
                this.ReturnKeyOfPaymentMsg = "Request has created successfully";
                sessionStorage.setItem(
                  "InpectionStatus",
                  this.ReturnKeyOfPaymentMsg
                );
              } else {
                this.ReturnKeyOfPaymentMsg = result.data[0].InpectionStatus;
                sessionStorage.setItem(
                  "InpectionStatus",
                  result.data[0].InpectionStatus
                );
              }
              // this.ReturnKeyOfPaymentMsg = result.msg;
              this.startTimer();
              this.BreakInCase = false;
              setTimeout(() => {
                this.InpectionRefNo = +sessionStorage.getItem("InpectionRefNo")!;

                this.breakInCaseStatusPopUp = 'block';

              }, 500);
            }
          } else {
            // if(result.successcode == "0" ){
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "IFFCOTOKIO"
            this.errorLogDetails.MethodName = 'BreakInInpection';
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log(res)
            })

            this._errorHandleService._toastService.warning(result.msg);
          }
        }))
    // $('#BreakInCase').modal('hide');
  }

  startTimer() {
    const startValue = 1 * 60;
    this.timerSub = timer(0, 1000)
      .pipe(
        take(startValue + 1),
        map((value) => startValue - value)
      )
      .subscribe(
        (value) => {
          this.countDownValue = value;
          if (value == 0) {
            //   this.otpResponse = null;
            //   this.btnText = 'Resend OTP';
            //   this.isOtpSent = false;
            //   this.mobileNumber.enable();
          }
        },
        null,
        () => (this.timerSub = null)
      );
  }
  result: any;
  onSubmitProposal() {
    this.showLoader = true;
    if (this.reviewData != null) {
      // this._vehicleBuyPlanService.vehicleProposalRequest(this.finalData, this.reviewData['Data']).subscribe((result) => {
      //   this.showLoader = false;
      //   console.log("Api Response", result);
      //   if (result.successcode == "1") {
      // if (this.sessData.CompanyCode === "4") {
      //   this.iffcoTokioResponse = result;
      // }
      // this.result = result.data;
      let proposalNuber = encrypt(this.sessData.policyNumber);
      let ApplicationNo = encrypt(String(this.reviewData.ApplicationNo));
      let RegistrationNo = encrypt(
        String(this.reviewData["Data"].RegistrationNo)
      );
      sessionStorage.setItem("proposalNo", proposalNuber);
      sessionStorage.setItem("appNo", ApplicationNo);
      sessionStorage.setItem("regNo", RegistrationNo);


      // IFFCO TOKIO
      // if (this.iffcoTokioResponse != null) {
      if (this.sessData.CompanyCode === "4") {
        console.log("result.data", this.additionaldata.data);
        this.showLoader = true;
        this.newPostForm(this.additionaldata.msg, this.additionaldata.data);
      }
      // }
      // "FUTURE GENERALI"
      if (this.sessData.CompanyCode === "2") {
        const Parameter_pay = {
          TransactionID: this.result.RegistrationNo,
          ProposalNumber: this.sessData.policyNumber,
          PremiumAmount: this.result.PolicyPremiumAmount,
          UserIdentifier: this.result.MobileNo,
          PaymentOption: 3,
          ResponseURL: this.result.ResponseURL,
          UserId: this.result.MobileNo,
          FirstName: this.result.VechileOwnerName,
          LastName: this.result.VechileOwnerName,
          Mobile: this.result.MobileNo,
          Email: this.result.EmailID,
        };
        this.showLoader = true;
        this.postForm(this.result.PaymentURL, Parameter_pay, "post");
      }
      // Universal
      if (this.sessData.premiumDataPlans.CompanyCode === "6") {
        this.showLoader = true;
        window.location.href = this.result[0].PaymentURL;
      }
      //     } else {
      //       this._errorHandleService._toastService.warning(result.msg, result.successcode);
      //     }
      //   },
      //     (err: any) => {
      //       // this.showLoader = false;
      //       this._errorHandleService.handleError(err);
      //     }
      // );
    }
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

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
}
