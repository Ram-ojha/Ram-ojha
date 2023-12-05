import { VehicleBuyPlanService } from "./../../services/vehicle-buyplan.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { decrypt } from "src/app/models/common-functions";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { ApiResponse } from "src/app/models/api.model";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { LoadingService } from "src/app/shared/services/loading.service";
import { ToastrService } from "ngx-toastr";
import { HttpHeaders } from "@angular/common/http";
import { errorLog, IPolicyPDFDocDownload } from "src/app/models/common.Model";
import { EGoDigitCKYCMismatchType } from "src/app/models/insurance.enum";
import { CommonService } from "../../services/common.service";

@Component({
  selector: "car-payment",
  templateUrl: "./car-payment.component.html",
  styleUrls: ["./car-payment.component.css"],
})
export class CarPaymentComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];
  showLoader = false;
  // policyData: any;
  // comp_code: string;
  // comp_data: string;
  // errorMessage: string;
  // download: boolean = true;
  policyData: any;
  finalData: any;
  popupData: any;
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
  ckycData!: any;
  statusResponse: any
  isStatusSuccess: any = true;


  goDigitMismatchType!: any;
  ckycSessionData!: string;
  sbiCkycStatus: any;
  btnText: string = "Download Policy";
  payloadForDownloadPolicy: IPolicyPDFDocDownload = {
    ApplicationNo: "",
    ApplicationNoOdp: "",
    RegistrationNo: "",
    RegistrationNoOdp: "",
    PolicyNo: "",
    ProposalPolicyNumber: "",
    ReturnKeyOfPayment: "",
    CompanyCode: "",
    ProposalProduct: "",
    ProposalOrderNo: "",
    ComprehensiveThirdPartyCode: "",
    SubCateCode: 0,
    InsuranceCateCode: 0,
    TransactionNo: ""
  };

  constructor(
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private _route: ActivatedRoute,
    private _router: Router,
    private loadingService: LoadingService,
    private toasterService: ToastrService,
    private commonService: CommonService
  ) { }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;
  ngOnInit() {
    // this.ApplicationNo = Number(decrypt(sessionStorage.getItem("appNo")));
    // this.RegistrationNo = Number(decrypt(sessionStorage.getItem("regNo")));
    // this.policyData = JSON.parse(sessionStorage.getItem("popupData"));
    // if (sessionStorage.getItem("proposalNo")) {
    //   this.ProposalPolicyNumber = decrypt(sessionStorage.getItem("proposalNo"));
    // }
    // this.posMobileNo = decrypt(sessionStorage.getItem("posMob"));

    this.popupData = JSON.parse(sessionStorage.getItem("popupData")!);
    this.finalData = JSON.parse(sessionStorage.getItem("finalData")!);
    if (this.finalData) {
      this.ApplicationNo = this.finalData.ApplicationNo;
      this.RegistrationNo = this.finalData.RegistrationNo;
    }
    // this.ProposalPolicyNumber = decrypt(sessionStorage.getItem("proposalNo"));
    console.log("Session policyData", this.policyData);
    console.log("Session finalData", this.finalData);
    this._subscriptions.push(
      this._route.paramMap.subscribe((p: any) => {
        this.key = p.get("key");
        // this.urlParams = p.get("urlParams");
        // const Odp: string = p.get('odp');
        // this.ApplicationNo = Number(decrypt(No));
        // this.ApplicationNoOdp = Number(decrypt(Odp));
      })
    );
    // this.urlParams = this.urlParams.replace(/-/g, "/");

    if (this.key == "error") {
      this.errorMessage = "Error";
    } else {
      this.errorMessage = "Success";
    }
    this.btnText = "Download Policy"
    this.getDataAfterPayment();
    this.removeInspectionData();
    // api/VehicleData/GetDataAfterPayment(decimal RegistrationNo = 0, decimal ApplicationNo = 0)
    // console.log("this.ApplicationNo",this.ApplicationNo)
    // console.log("this.ApplicationNoOdp",this.ApplicationNoOdp)
  }

  getDataAfterPayment() {
    this.getPaymentDataEndPoint() &&
      this._subscriptions.push(
        this.getPaymentDataEndPoint()!.subscribe((result) => {
          debugger
          console.log(result);
          if (result && result.data) {
            this.policyData = result.data[0];
            this.ProposalPolicyNumber = result.data[0].PolicyNo;
            this.errorMessage = this.policyData.PaymentStatus;
            this.ApplicationNo = this.policyData.ApplicationNo;
            this.RegistrationNo = this.policyData.RegistrationNo;
            this.createPayloadForDownloadPdf();
            let companyCode = this.policyData.InsuranceCompCode;

            // if (companyCode == "2" && this.policyData.PaymentInd === 1) {
            //   this.hitFutureGeneraliProposal();
            // } else 
            if (companyCode == "8" && this.policyData.PaymentInd === 1) {

              let d = {
                policyNumber: this.policyData.PolicyNo,
                kyc: this.ckycSessionData
              }
              this._subscriptions.push(
                this._vehicleBuyPlanService.getGoDigitCkycStatus(this.policyData.ApplicationNo, this.policyData.PolicyNo)
                  .subscribe((result: ApiResponse) => {
                    console.log(result)

                    if (result.successcode == "0") {
                      this.ckycData = result.data;
                      this.goDigitMismatchType = EGoDigitCKYCMismatchType[this.ckycData.mismatchType as keyof typeof EGoDigitCKYCMismatchType];//this.ckycData.mismatchType
                    } else {
                      this.ckycData = result.data;
                    }

                  }))

            } else if (companyCode == "7" && this.policyData.PaymentInd === 1) {
              this._subscriptions.push(
                this._vehicleBuyPlanService.postSBICheckCKYCStatusAfterPayment(this.policyData.ApplicationNo)
                  .subscribe((result: ApiResponse) => {
                    console.log(result)
                    this.sbiCkycStatus = result.data[0]
                    // if (result.successcode == "0") {
                    //   this.ckycData = result.data;
                    //   this.goDigitMismatchType = EGoDigitCKYCMismatchType[this.ckycData.mismatchType]//this.ckycData.mismatchType
                    // } else {
                    //   this.ckycData = result.data;
                    // }

                  }))

            } else {
              this.isStatusSuccess = false
              this.btnText = "Download Policy";
            }
          } else {

            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "PosHome";
            this.errorLogDetails.MethodName = "GetFuelYearList";
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });

            this.errorMessage = "Error"
          };
        })
      );
  }

  createPayloadForDownloadPdf() {
    debugger;
    this.payloadForDownloadPolicy.ApplicationNo = this.policyData.ApplicationNo
    this.payloadForDownloadPolicy.ApplicationNoOdp = this.policyData.ApplicationNoOdp
    this.payloadForDownloadPolicy.RegistrationNo = this.policyData.RegistrationNo;
    this.payloadForDownloadPolicy.RegistrationNoOdp = this.policyData.RegistrationNoOdp;
    this.payloadForDownloadPolicy.ReturnKeyOfPayment = this.policyData.ReturnKeyOfPayment;
    this.payloadForDownloadPolicy.CompanyCode = this.policyData.InsuranceCompCode;
    this.payloadForDownloadPolicy.ComprehensiveThirdPartyCode = this.policyData.ComprehensiveThirdPartyCode;
    this.payloadForDownloadPolicy.ProposalOrderNo = this.policyData.ProposalOrderNo;
    this.payloadForDownloadPolicy.ProposalPolicyNumber = this.policyData.ProposalPolicyNumber;
    this.payloadForDownloadPolicy.ProposalProduct = this.policyData.ProposalProduct;
    this.payloadForDownloadPolicy.PolicyNo = this.policyData.PolicyNo;
    this.payloadForDownloadPolicy.InsuranceCateCode = this.policyData.InsuranceCateCode;
    this.payloadForDownloadPolicy.SubCateCode = this.policyData.SubCateCode;
    this.payloadForDownloadPolicy.TransactionNo = this.policyData.TransactionNo;
  }


  hitFutureGeneraliProposal() {
    const data = this.finalData;
    this._subscriptions.push(
      this._vehicleBuyPlanService
        .GetDownloadPolicyReqIFFCOTOKOI(this.urlParams, data)
        .subscribe(
          (result) => {
            debugger
            this.statusResponse = result
            if (result.successcode == "0" || result.successcode == null) {
              this.isStatusSuccess = false
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "SBIGeneral";
              this.errorLogDetails.MethodName = "GetVihclePolicyIssurance";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  console.log(res);
                });

            } else {
              if (result && result.data) {
                this.policyData = result.data[0];
              }
            }
          },
          (err: any) => {
            this.isStatusSuccess = false
            this._errorHandleService.handleError(err);
          }
        )
    );
  }

  getPaymentDataEndPoint(): Observable<ApiResponse> | null {
    if (this.key === "error") return null;
    // if (
    //   +this.popupData.CompanyCode === 7 &&
    //   this.urlParams !== "Transaction Failed"
    // )
    //   return this._vehicleBuyPlanService.GetSbiDataAfterPayment(this.key);
    // else 
    return this._vehicleBuyPlanService.GetDataAfterPaymentByKey(this.key);
  }

  // getPaymentDataEndPoint(): Observable<ApiResponse> {
  //   if (+this.popupData.CompanyCode === 7)
  //     return this._vehicleBuyPlanService.GetSbiDataAfterPayment(this.key);
  //   if (!this.ApplicationNo || !this.RegistrationNo)
  //     return this._vehicleBuyPlanService.GetDataAfterPaymentByKey(this.key);
  //   else
  //     return this._vehicleBuyPlanService.GetDataAfterPayment(
  //       this.RegistrationNo,
  //       this.ApplicationNo
  //     );
  // }

  removeInspectionData() {
    ["InpectionRefNo", "InpectionStatus"].forEach((k) =>
      localStorage.removeItem(k)
    );
  }

  updatePayment() {
    this.showLoader = true;
    const data: any = {
      ApplicationNo: this.ApplicationNo,
      ApplicationNoOdp: this.ApplicationNoOdp,
      RegistrationNo: this.policyData.RegistrationNo,
      RegistrationNoOdp: this.policyData.RegistrationNoOdp,
      APIBaseUrl: this.policyData.APIBaseUrl,
      APIMethod: this.policyData.APIMethod,
    };
    this._subscriptions.push(
      this._vehicleBuyPlanService
        .GetUpdatePaymentReq(data)
        .subscribe((result: any) => {
          console.log("Api Response", result);
          this.showLoader = false;
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = data.APIMethod.split('/')[0];
            this.errorLogDetails.ControllerName = data.APIMethod.split('/')[0];
            this.errorLogDetails.MethodName = data.APIMethod.split('/')[1];
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });

          }
          this.ProposalPolicyNumber = result.data[0].PolicyNo;
          this.ProposalStatusMsg = result.data[0].ProposalStatusMsg;
          this.updatePayentData = result.data[0];
          console.log("this.updatePayentData", this.updatePayentData);
        })
    );
  }

  postPdfFromApi(url: string) {
    this._subscriptions.push(
      this._vehicleBuyPlanService.postPolicyPdfURL(url).subscribe(
        (data) => {
          console.log(data.data);
          // return;

          if (data.successcode === "1") {
            // this.downloadPdf(data.data, true);
            // this.downloadPdf(data.data);
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
            this.toasterService.error("Couldn't load Policy PDF", "", {
              timeOut: 5000,
            });
          }
        },
        (err: any) => {
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
          this._errorHandleService.handleError(err);
          return of(null);
        }

      )
    );
  }


  getPdfFromApi(url: any) {
    this._subscriptions.push(
      this._vehicleBuyPlanService.getPolicyPdfURL(url).subscribe(
        (data) => {
          console.log(data.data);
          // return;
          if (data.successcode === "1") {
            //  this.downloadPdf(data.data);
          }
          else {
            if (data.successcode == "0" || data.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "getPolicyPdf";
              this.errorLogDetails.MethodName = "Pdf Url"
              this.errorLogDetails.ErrorCode = data.successcode ? data.successcode : "0"
              this.errorLogDetails.ErrorDesc = data.msg ? data.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  console.log(res);
                });

            }
            this.toasterService.error("Couldn't download Policy PDF", "", {
              timeOut: 5000,
            });
          }
        },
        (err: any) => {
          this._errorHandleService.handleError(err);
          return of(null);
        }
      )
    );
  }

  getPdfFromApiForTATA(url: string) {
    this._subscriptions.push(
      this._vehicleBuyPlanService.getPolicyPdfAsBlob(url).subscribe((data) => {
        // this.blob = new Blob([data], {type: 'application/pdf'});

        var downloadURL = window.URL.createObjectURL(data);
        var link = document.createElement("a");
        link.href = downloadURL;
        const fileName = this.ProposalPolicyNumber + ".pdf";
        link.download = fileName;

        link.click();
      }),
      (err: any) => {
        this._errorHandleService.handleError(err);
        return of(null);
      }
    );
  }

  // getPdfURLEndPoint(companyCode: string, url: string) {
  //   if (companyCode === "2")
  //     //future
  //     return this._vehicleBuyPlanService.getPolicyPdf(url);
  //   if (companyCode === "9")
  //     return this._vehicleBuyPlanService.getPolicyPdfTATA(url);
  // }
  downloadPolicy() {
    this.commonService.downloadPolicy(this.policyData, this.payloadForDownloadPolicy);
  }

 

  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
export interface paymentRequestData {
  ApplicationNo: number;
  ApplicationNoOdp: number;
  RegistrationNo: number;
  RegistrationNoOdp: number;
  APIBaseUrl: string;
  APIMethod: string;
}






// downloadPolicy() {

//   this.showLoader = true;

//   const data = this.finalData;
//   let companyCode = this.policyData.CompanyCode;
//   let policyNo = this.policyData.PolicyNo
//   //Universal ,TATA,reliance
//   if (companyCode == "6" || companyCode == "9" || companyCode == "11") {
//     this.downloadPdf(this.policyData.DownloadLinkURL);
//   }
//   // Future
//   else if (companyCode == "2" || companyCode == "13") {

//     this.getPdfFromApi(this.policyData.DownloadLinkURL);

//   }
//   //IffcoTokio
//   else if (companyCode == '19' || companyCode == '4') {
//     window.open(this.policyData.DownloadLinkURL, "", "");
//   }
//   //National Insurance
//   else if (companyCode == '10') {
//     this.postPdfFromApi(this.policyData.DownloadLinkURL);
//   }

//   // Sbi Genral
//   else if (companyCode == "7") {
//     this._vehicleBuyPlanService.GetDownloadPolicySBIG(policyNo).subscribe((res: any) => {
//       console.log(res)
//       let policyPdfBase64 = res.data
//       this.downloadPdf(policyPdfBase64)
//     })
//   }//GoDigit
//   else if (companyCode == "8") {
//     this._vehicleBuyPlanService.GetDownloadPolicyReqGoDigit(this.urlParams, this.payloadForDownloadPolicy).subscribe((res: any) => {
//       console.log(res)
//       let policyPdfLink = res.data
//       // this._http.get(policyPdfLink).subscribe((res:any) => {
//       //   console.log(res)
//       // })
//       // this.getPdfFromApi(policyPdfLink);
//       if (this.policyData.DownloadLinkURL !== null) {

//         window.location.href = policyPdfLink;
//       } else {
//         this.toasterService.error("Policy Pdf not available.", "Not Found");
//       }
//     })
//   }
//   //Others
//   else {
//     this._subscriptions.push(
//       this._vehicleBuyPlanService
//         .GetDownloadPolicyReqIFFCOTOKOI(this.urlParams, data)
//         .subscribe((result) => {

//           if (!result.data || result.successcode == "0" || result.successcode == null) {

//             this.errorLogDetails.UserCode = this.posMobileNo;
//             this.errorLogDetails.ApplicationNo = this.ApplicationNo;
//             this.errorLogDetails.CompanyName = data.APIMethod.split[0];
//             this.errorLogDetails.ControllerName = data.APIMethod.split[0];
//             this.errorLogDetails.MethodName = data.APIMethod.split[1];
//             this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
//             this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
//             this._errorHandleService
//               .sendErrorLog(this.errorLogDetails)
//               .subscribe((res: any) => {
//                 console.log(res);
//               });


//             this._errorHandleService._toastService.warning(
//               "Something went wrong, Please try again later...",
//               "Couldn't download policy"
//             );
//             this.showLoader = false;
//             return;
//           }
//           console.log("Api Response", result);
//           this.downloadPdf(result.data);
//           // sessionStorage.removeItem("popupData");
//           // sessionStorage.removeItem("appNo");
//           // sessionStorage.removeItem("regNo");
//           // sessionStorage.removeItem("proposalNo");
//           // sessionStorage.removeItem("finalData");
//           // sessionStorage.removeItem("CarData");
//           // sessionStorage.removeItem("postData");
//           // sessionStorage.removeItem("reviewData");
//           // this._router.navigate([`/pos/car-insurance`]);
//           this.showLoader = false;
//         })
//     );
//   }
// }
