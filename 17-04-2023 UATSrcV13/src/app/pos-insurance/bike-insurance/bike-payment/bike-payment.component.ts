import { VehicleBuyPlanService } from "./../../services/vehicle-buyplan.service";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { decrypt } from "src/app/models/common-functions";
import { ActivatedRoute } from "@angular/router";
import { Observable, of } from "rxjs";
import { ApiResponse } from "src/app/models/api.model";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { catchError, concatMapTo, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { QuotesSharingModalComponent } from "src/app/shared/components/quotes-sharing-modal/quotes-sharing-modal.component";
import { apiHost } from "src/app/models/constants";
import { errorLog } from "src/app/models/common.Model";
import { EGoDigitCKYCMismatchType } from "src/app/models/insurance.enum";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "bike-payment",
  templateUrl: "./bike-payment.component.html",
  styleUrls: ["./bike-payment.component.css"],
})
export class BikePaymentComponent implements OnInit, OnDestroy {
  @ViewChild("shareQuotesModal", { static: false })
  shareQuotesModal!: QuotesSharingModalComponent;

  private _subscription: any = [];
  showLoader = false;
  pdfBase64Link!: string;
  // policyData: any;
  // comp_code: string;
  // comp_data: string;
  // errorMessage: string;
  // download: boolean = true;
  policyData: any;
  PreviousData: any;
  finalData: any;
  vehicleData: any;
  any: any;
  ApplicationNo!: number;
  RegistrationNo!: number;
  ApplicationNoOdp!: number;
  updatePayentData: any;
  paymentRequestData!: paymentRequestData;
  ProposalPolicyNumber!: string;
  ProposalStatusMsg!: string;
  key!: string;
  urlParams!: string;
  errorMessage!: string;
  btnText!: string;
  downloadLinkURL: any;
  quotesDetailsForSharing: any;

  errorLog!: errorLog;
  ckycData: any;

  goDigitMismatchType: any;
  ckycSessionData!: string;
  sbiCkycStatus: any;


  constructor(
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _route: ActivatedRoute,
    private _errorHandleService: ErrorHandleService,
    private toasterService: ToastrService,
    private _http: HttpClient
  ) { }
  posMobileNo: any;
  // userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;
  ngOnInit() {
    if (sessionStorage.getItem("posMob")) {
      this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    }
    this.ckycSessionData = JSON.parse(sessionStorage.getItem("CKYCData")!)
    this.showLoader = true;
    // this.PreviousData = JSON.parse(sessionStorage.getItem("Data"));
    this.PreviousData = JSON.parse(sessionStorage.getItem("Data")!);
    this.ApplicationNo = sessionStorage.getItem("appNo") ? Number(decrypt(sessionStorage.getItem("appNo")!)) : 0;
    this.RegistrationNo = sessionStorage.getItem("regNo") ? Number(decrypt(sessionStorage.getItem("regNo")!)) : 0;
    this.ProposalPolicyNumber = sessionStorage.getItem("proposalNo") ? decrypt(sessionStorage.getItem("proposalNo")!) : "";
    this.finalData = sessionStorage.getItem("finalData") ? JSON.parse(decrypt(sessionStorage.getItem("finalData")!)) : "";
    // this.vehicleData = JSON.parse(sessionStorage.getItem("VehicleData")!);

    console.log("Session policyData", this.policyData);
    console.log("Session finalData", this.finalData);

    this._subscription.push(
      this._route.paramMap.subscribe((p: any) => {
        this.key = p.get("key");
        this.urlParams = p.get("urlParams");
        // const Odp: string = p.get('odp');
        // this.ApplicationNo = Number(decrypt(No));
        // this.ApplicationNoOdp = Number(decrypt(Odp));
      })
    );

    this.urlParams = this.urlParams.replace(/-/g, "/");

    if (this.urlParams === "Transaction Failed" || this.key == "error") {
      this.showLoader = false;
      this.errorMessage = "Error";
    }

    this.getDataAfterPayment();
  }

  getDataAfterPayment() {

    this.getPaymentDataEndPoint() &&
      this._subscription.push(
        this.getPaymentDataEndPoint()!.subscribe((result: any) => {
          console.log(result);
          debugger;
          if (result.data) {
            this.policyData = result.data[0];
            this.downloadLinkURL = this.policyData.DownloadLinkURL;
            this.errorMessage = this.policyData.PaymentStatus;
            this.PreviousData = result.data[0];
            console.log(this.PreviousData);

            let companyCode = this.policyData.CompanyCode;

            // share pdf

            // this.sharePdfFunction();

            // hit future generali proposal only when payment indication is 1
            // PaymentInd 0 and 2 denotes 'unknown failure' and 'user aborted' respectively
            // Before proposal also check if policyNo is there or not, if policyNo exists proposal had been hit already

            if (
              companyCode == "2" &&
              this.policyData.PaymentInd === 1 &&
              (!this.policyData.PolicyNo || this.policyData.PolicyNo !== "")
            ) {
              // if (companyCode == "2" && this.policyData.PaymentInd === 1) {
              this.hitFutureGeneraliProposal();
            } else if (companyCode == "8") {

              // let d = {
              //   policyNumber: this.policyData.PolicyNo,
              //   kyc: this.ckycSessionData
              // }
              this._subscription.push(
                this._vehicleBuyPlanService.getGoDigitCkycStatus(this.policyData.ApplicationNo, this.policyData.PolicyNo)
                  .subscribe((result: ApiResponse) => {
                    console.log(result)
                    if (result.successcode == "0") {
                      this.ckycData = result.data;
                      this.goDigitMismatchType = EGoDigitCKYCMismatchType[this.ckycData.mismatchType as keyof typeof EGoDigitCKYCMismatchType]//this.ckycData.mismatchType
                    } else {
                      this.ckycData = result.data;
                    }

                  }))

            } else if (companyCode == "7") {
              this._subscription.push(
                this._vehicleBuyPlanService.postSBICheckCKYCStatusAfterPayment(this.ApplicationNo)
                  .subscribe((result: ApiResponse) => {
                    console.log(result)
                    this.sbiCkycStatus = result.data[0]

                  }))

            } else {
              this.btnText = "Download Policy";
            }
          } else {
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "VehicleData"
              this.errorLogDetails.MethodName = "GetDataAfterPayment?key=";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                console.log(res)
              })


            }
            this.errorMessage = "Error"
          };
        },
          (err: any) => {
            this._errorHandleService.handleError(err);
          }
        )
      );
  }

  sharePdfFunction() {

    // const expression =
    //   /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

    // const regExpForHttpUrl = new RegExp(expression);

    let urlContainsHttpOrHttps =
      this.downloadLinkURL.startsWith("http") ||
      this.downloadLinkURL.startsWith("https");
    if (
      // this.downloadLinkURL.match(regExpForHttpUrl) &&
      urlContainsHttpOrHttps &&
      this.downloadLinkURL.includes(apiHost)
    )
      this.getPdfFromApi(this.downloadLinkURL);
    else if (urlContainsHttpOrHttps) {
      this.pdfBase64Link = this.downloadLinkURL;
      // this.sharePdf("Y");
    } else {
      this.pdfBase64Link = this.downloadLinkURL;
      // this.sharePdf("N");
    }
  }

  hitFutureGeneraliProposal() {

    debugger;
    this.btnText = "Generate policy";
    const data = this.finalData;
    this._subscription.push(
      this._vehicleBuyPlanService
        .GetDownloadPolicyReqIFFCOTOKOI(this.urlParams, data)
        .subscribe(
          (result) => {
            debugger
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "DownloadPolicy"
              this.errorLogDetails.MethodName = "ReqIffcotokoi?key=";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                console.log(res)
              })

              this.toasterService.error(result.msg, "", {
                timeOut: 5000,
              });

            } else {
              console.log("Api Response", result);
              //this.getDataAfterPayment();
              if (result && result.data) {
                this.policyData = result.data[0];
              }
            }

          },
          (err: any) => {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "DownloadPolicy"
            this.errorLogDetails.MethodName = "ReqIffcotokoi?key=";
            this.errorLogDetails.ErrorCode = "0";
            this.errorLogDetails.ErrorDesc = "Something went wrong.Try agian later.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log(res)
            })
            this._errorHandleService.handleError(err);

          }
        )
    );
  }

  // hitFutureGeneraliProposal() {
  //   this.btnText = "Generate policy";
  //   const data = this.finalData;
  //   this._vehicleBuyPlanService
  //     .GetDownloadPolicyReqIFFCOTOKOI(this.urlParams, data).pipe(
  //       switchMap(res=>this.getPaymentDataEndPoint()),
  //       catchError( (err: any) => {
  //         this._errorHandleService.handleError(err);
  //         return of(null)
  //       })
  //     )
  //     .subscribe();
  // }

  getPaymentDataEndPoint(): Observable<ApiResponse> | null {

    if (this.key === "error") return null;
    // if (
    //   +this.PreviousData.premiumDataPlans.CompanyCode === 7 &&
    //   this.urlParams !== "Transaction Failed"
    // ) {
    //   return this._vehicleBuyPlanService.GetSbiDataAfterPayment(this.key);
    // }
    // else {
    return this._vehicleBuyPlanService.GetDataAfterPaymentByKey(this.key);
    // }
  }
  // getPaymentDataEndPoint(): Observable<ApiResponse> {
  //   if (!this.ApplicationNo || !this.RegistrationNo)
  //     return this._vehicleBuyPlanService.GetDataAfterPaymentByKey(this.key);
  //   else
  //     return this._vehicleBuyPlanService.GetDataAfterPayment(
  //       this.RegistrationNo,
  //       this.ApplicationNo
  //     );
  // }

  updatePayment() {
    this.showLoader = true;
    const data: paymentRequestData | any = {
      ApplicationNo: this.ApplicationNo,
      ApplicationNoOdp: this.ApplicationNoOdp,
      RegistrationNo: this.policyData.RegistrationNo,
      RegistrationNoOdp: this.policyData.RegistrationNoOdp,
      APIBaseUrl: this.policyData.APIBaseUrl,
      APIMethod: this.policyData.APIMethod,
    };
    this._subscription.push(
      this._vehicleBuyPlanService
        .GetUpdatePaymentReq(data)
        .subscribe((result) => {
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = data.APIMethod.split[0]
            this.errorLogDetails.MethodName = data.APIMethod.split[0];
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log("errrorLog-----=>", res)
            })
          }
          console.log("Api Response", result);
          this.showLoader = false;
          this.ProposalPolicyNumber = result.data[0].ProposalPolicyNumber;
          this.ProposalStatusMsg = result.data[0].ProposalStatusMsg;
          this.updatePayentData = result.data[0];
          console.log("this.updatePayentData", this.updatePayentData);
        })
    );
  }

  getPdfFromApi(url: string) {
    debugger;
    this._subscription.push(
      this._vehicleBuyPlanService.getPolicyPdfURL(url).subscribe(
        (data) => {
          console.log(data.data);
          // return;
          debugger;

          if (data.successcode === "1") {
            // this.downloadPdf(data.data);
            debugger;

            this.downloadButtonClicked && this.downloadPdf(data.data);
            this.pdfBase64Link = data.data;
            // !this.downloadButtonClicked && this.sharePdf("N");
          }
          else {
            // if(result.successcode =='0'){
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "getPdfFromApi"
            this.errorLogDetails.MethodName = "getPdf";
            this.errorLogDetails.ErrorCode = data.successcode ? data.successcode : "0";
            this.errorLogDetails.ErrorDesc = data.msg ? data.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log("errrorLog-----=>", res)
            })
            // }
            this.toasterService.error(data.msg ? data.msg : "Could not load pdf file", "", {
              timeOut: 5000,
            });
          }
        },
        (err: HttpErrorResponse) => {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.ApplicationNo;
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "getPdfFromApi"
          this.errorLogDetails.MethodName = "getPdf";
          this.errorLogDetails.ErrorCode = "0";
          this.errorLogDetails.ErrorDesc = "Something went wrong.Try again later.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            console.log("errrorLog-----=>", res)
          })
          console.log(err.message, err.statusText);

          this._errorHandleService.handleError(err);
          return of(null);
        }
      )
    );
  }

  getPdfFromApiForTATA(url: string) {
    this._subscription.push(
      this._vehicleBuyPlanService.getPolicyPdfAsBlob(url).subscribe(
        (data) => {
          if (data.successcode == "0" || data.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = "TATA";
            this.errorLogDetails.ControllerName = "getPdfApiforTATA"
            this.errorLogDetails.MethodName = "TATA PDF";
            this.errorLogDetails.ErrorCode = data.successcode ? data.successcode : "0";
            this.errorLogDetails.ErrorDesc = data.msg ? data.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log("errrorLog-----=>", res)
            })
          }
          // this.blob = new Blob([data], {type: 'application/pdf'});

          var downloadURL = window.URL.createObjectURL(data);
          var link = document.createElement("a");
          link.href = downloadURL;
          const fileName = this.ProposalPolicyNumber + ".pdf";
          link.download = fileName;

          link.click();
        },
        (err: any) => {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.ApplicationNo;
          this.errorLogDetails.CompanyName = "TATA";
          this.errorLogDetails.ControllerName = "getPdfApiforTATA"
          this.errorLogDetails.MethodName = "TATA PDF";
          this.errorLogDetails.ErrorCode = "0";
          this.errorLogDetails.ErrorDesc = "Something went wrong.Try again later.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            console.log("errrorLog-----=>", res)
          })
          this._errorHandleService.handleError(err);
          return of(null);
        }
      )
    );
  }

  downloadButtonClicked!: boolean;
  downloadPolicy() {
    debugger;
    this.downloadButtonClicked = true;
    // if (this.PreviousData.premiumDataPlans.CompanyCode != "2") {

    this.showLoader = true;
    let data = this.finalData;
    let companyCode = this.policyData.CompanyCode;
    let policyNo = this.policyData.PolicyNo
    console.log(this.policyData.PolicyNo)
    //Universal, TATA, reliance
    if (companyCode == "6" || companyCode == "9" || companyCode == "11") {
      this.downloadPdf(this.policyData.DownloadLinkURL);
    }
    //Future,bajaj,ShriRam
    else if (companyCode == "2" || companyCode == "13" || companyCode == '19' || companyCode == '4') {
      if (companyCode == '19' || companyCode == '4')
        window.open(this.policyData.DownloadLinkURL, "", "");
      else
        this.getPdfFromApi(this.policyData.DownloadLinkURL);
    }    //New India
    else if (companyCode == "12") {
      let pdfLinkUrl = this.downloadLinkURL.split(",")
      for (let i = 0; i < pdfLinkUrl.length; i++) {
        this.downloadPdf(pdfLinkUrl[i])
      }
    }
    // Sbi Genral
    else if (companyCode == "7") {
      this._vehicleBuyPlanService.GetDownloadPolicySBIG(policyNo).subscribe((res: any) => {
        console.log(res)
        let policyPdfBase64 = res.data
        this.downloadPdf(policyPdfBase64)
      })
    }
    //GoDigit
    else if (companyCode == "8") {
      this._vehicleBuyPlanService.GetDownloadPolicyReqGoDigit(this.urlParams, data).subscribe((res: any) => {
        console.log(res)
        let policyPdfLink = res.data
        // this._http.get(policyPdfLink).subscribe((res) => {
        //   console.log(res)
        // })
        // this.getPdfFromApi(policyPdfLink);
        window.location.href = policyPdfLink
      })
    }
    //Others
    else {
      this._subscription.push(
        this._vehicleBuyPlanService
          .GetDownloadPolicyReqIFFCOTOKOI(this.urlParams, data)
          .subscribe((result) => {
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = "IFFCOTOKOI";
              this.errorLogDetails.ControllerName = 'GetDownloadPolicy';
              this.errorLogDetails.MethodName = 'ReqIFFCOTOKOI'
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  console.log('errorlog-----=>', res);
                });

            }
            this.showLoader = false;

            console.log("Api Response", result);
            if (result.additionaldata) {
              if (result.additionaldata.data[0].schedulePathHC) {
                this.downloadPdf(result.additionaldata.data[0].schedulePathHC);
              }
              if (result.additionaldata.data[0].schedulePath) {
                this.downloadPdf(result.additionaldata.data[0].schedulePath);
              }
            } else result.data && this.downloadPdf(result.data);
          })
      );
    }
  }

  downloadPdf(link: string, base64withoutInitials?: boolean) {

    let base64LinkSource = "data:application/pdf;base64," + `${link}`;

    const linkSource = base64withoutInitials ? base64LinkSource : link;
    const downloadLink = document.createElement("a");
    const fileName = this.policyData.PolicyNo + ".pdf";

    downloadLink.href = linkSource;
    downloadLink.target = "_blank";
    downloadLink.download = fileName;
    downloadLink.click();
  }

  ngOnDestroy() {
    this._subscription.forEach((sub: { unsubscribe: () => any; }) => sub.unsubscribe());
  }

  // sharePdf(pdfIsUrl: string): void {
  //   
  //   let vData = JSON.parse(sessionStorage.getItem("VehicleData"));

  //   let motorDesc = this.PreviousData.vehicleDesc;
  //   let regYear = this.vehicleData.VehicleRegistrationYrDesc;
  //   let policyType = vData["PreviousPolicyTypeDesc"]
  //     ? vData["PreviousPolicyTypeDesc"]
  //     : vData["SubCateDesc"];
  //   let userName = decrypt(sessionStorage.getItem("User Name"));
  //   let base64Url =
  //     pdfIsUrl === "N" ? this.pdfBase64Link.split(",")[1] : this.pdfBase64Link;

  //   let requestForSharingPdf = {
  //     Image_Url_JPG: base64Url,
  //     Plan_Description: `${motorDesc} ${regYear} ${policyType}`,
  //     POS_Name: userName,
  //     Insurance_Company: this.policyData["InsuranceCompDesc"],
  //     Hospital_Or_Garage_URL: this.PreviousData.premiumDataPlans.garageURL
  //       ? this.PreviousData.premiumDataPlans.garageURL
  //       : " ",
  //     PDF_URL_YN: pdfIsUrl,
  //     Receiver_Name: `${this.policyData.VechileOwnerName} ${this.policyData.VehicleOwnerLastName}`,
  //     Receiver_Mobile_No: `91${this.policyData["MobileNo"]}`,
  //     // Receiver_Mobile_No: `919630458495`,
  //   };

  //   console.log({ requestForSharingPdf });

  //   // this._vehicleBuyPlanService
  //   //   .sharePdf(requestForSharingPdf)
  //   //   .subscribe((res) => {
  //   //     if (res.successcode === "1") console.log("sent successfully");
  //   //     else console.log("pdf sharing failed");
  //   //   });
  // }
}

export interface paymentRequestData {
  ApplicationNo: number;
  ApplicationNoOdp: number;
  RegistrationNo: number;
  RegistrationNoOdp: number;
  APIBaseUrl: string;
  APIMethod: string;
}
