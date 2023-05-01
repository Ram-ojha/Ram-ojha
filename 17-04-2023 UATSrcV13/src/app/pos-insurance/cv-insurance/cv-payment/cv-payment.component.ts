
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
import { errorLog } from "src/app/models/common.Model";
import { EGoDigitCKYCMismatchType } from "src/app/models/insurance.enum";

@Component({
  selector: "cv-payment",
  templateUrl: "./cv-payment.component.html",
  styleUrls: ["./cv-payment.component.css"],
})
export class CvPaymentComponent implements OnInit, OnDestroy {
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
  ckycSessionData!: string;

  goDigitMismatchType!: any;
  ckycData!: any;
  statusResponse: any
  isStatusSuccess: any = true;
  btnText: string = "";
  sbiCkycStatus: any;


  constructor(
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private _route: ActivatedRoute,
    private _router: Router,
    private loadingService: LoadingService,
    private toasterService: ToastrService
  ) { }

  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog;

  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    // this.ApplicationNo = Number(decrypt(sessionStorage.getItem("appNo")));
    // this.RegistrationNo = Number(decrypt(sessionStorage.getItem("regNo")));
    // this.policyData = JSON.parse(sessionStorage.getItem("popupData"));
    // if (sessionStorage.getItem("proposalNo")) {
    //   this.ProposalPolicyNumber = decrypt(sessionStorage.getItem("proposalNo"));
    // }
    this.popupData = JSON.parse(sessionStorage.getItem("popupData")!);
    this.finalData = JSON.parse(sessionStorage.getItem("finalData")!);
    this.ApplicationNo = this.finalData.ApplicationNo;
    this.RegistrationNo = this.finalData.RegistrationNo;
    // this.ProposalPolicyNumber = decrypt(sessionStorage.getItem("proposalNo"));
    console.log("Session policyData", this.policyData);
    console.log("Session finalData", this.finalData);
    this._subscriptions.push(
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
      this.errorMessage = "Error";
    } else {
      this.errorMessage = "Success";
    }

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
            let companyCode = this.policyData.InsuranceCompCode;

            if (companyCode == "2" && this.policyData.PaymentInd === 1) {
              this.hitFutureGeneraliProposal();
            } else if (companyCode == "8" && this.policyData.PaymentInd === 1) {

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

            }
            else {
              this.isStatusSuccess = false
              this.btnText = "Download Policy";
            }

          }
          else {
            if (result.successcode == "0") {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = 'SBIGeneral';
              this.errorLogDetails.ControllerName = "SBIGeneral";
              this.errorLogDetails.MethodName = "GetVihclePolicyIssurance";
              this.errorLogDetails.ErrorCode = result.successcode;
              this.errorLogDetails.ErrorDesc = result.msg;
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  console.log(res);
                });
            }

            this.errorMessage = "Error";
          }
        })
      );
  }

  hitFutureGeneraliProposal() {
    const data = this.finalData;
    this._subscriptions.push(
      this._vehicleBuyPlanService
        .GetDownloadPolicyReqIFFCOTOKOI(this.urlParams, data)
        .subscribe(
          (result) => {
            debugger;
            console.log("Api Response", result);

            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = this.urlParams.split('/')[0]
              this.errorLogDetails.ControllerName = this.urlParams.split('/')[0];
              this.errorLogDetails.MethodName = this.urlParams.split('/')[1];
              this.errorLogDetails.ErrorCode = result.successcode;
              this.errorLogDetails.ErrorDesc = result.msg;
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
            this._errorHandleService.handleError(err);
          }
        )
    );
  }

  getPaymentDataEndPoint(): Observable<ApiResponse> | null {
    if (this.key === "error") return null;
    if (
      +this.popupData.CompanyCode === 7 &&
      this.urlParams !== "Transaction Failed"
    )
      return this._vehicleBuyPlanService.GetSbiDataAfterPayment(this.key);
    else return this._vehicleBuyPlanService.GetDataAfterPaymentByKey(this.key);
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
    const data: paymentRequestData = {
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
        .subscribe((result) => {
          console.log("Api Response", result);
          this.showLoader = false;
          if (result.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = data.APIMethod.split('/')[0]
            this.errorLogDetails.ControllerName = data.APIMethod.split('/')[0];
            this.errorLogDetails.MethodName = data.APIMethod.split('/')[1];
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
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

  getPdfFromApi(url: any) {
    this._subscriptions.push(
      this._vehicleBuyPlanService.getPolicyPdfURL(url).subscribe(
        (data) => {
          console.log(data.data);
          // return;
          if (data.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = url.split('/')[0]
            this.errorLogDetails.ControllerName = url.APIMethod.split('/')[0];
            this.errorLogDetails.MethodName = url.APIMethod.split('/')[1];
            this.errorLogDetails.ErrorCode = data.successcode;
            this.errorLogDetails.ErrorDesc = data.msg;
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });
          }
          if (data.successcode === "1") this.downloadPdf(data.data);
          else
            this.toasterService.error("Couldn't download Policy PDF", "", {
              timeOut: 5000,
            });
        },
        (err: any) => {
          // if (data.successcode == "0") {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.ApplicationNo;
          this.errorLogDetails.CompanyName = url.split('/')[0]
          this.errorLogDetails.ControllerName = url.APIMethod.split('/')[0];
          this.errorLogDetails.MethodName = url.APIMethod.split('/')[1];
          this.errorLogDetails.ErrorCode = err; //data.successcode;
          this.errorLogDetails.ErrorDesc = err; //data.msg;
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              console.log(res);
            });
          // }
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
        if (data.successcode == "0") {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.ApplicationNo;
          this.errorLogDetails.CompanyName = url.split('/')[0]
          this.errorLogDetails.ControllerName = url.split('/')[0]
          this.errorLogDetails.MethodName = url.split('/')[1]
          this.errorLogDetails.ErrorCode = data.successcode
          this.errorLogDetails.ErrorDesc = data.msg;
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              console.log(res);
            });
        }
        var downloadURL = window.URL.createObjectURL(data);
        var link = document.createElement("a");
        link.href = downloadURL;
        const fileName = this.ProposalPolicyNumber + ".pdf";
        link.download = fileName;

        link.click();
      }),
      (err: any) => {
        // if (data.successcode == "0") {
        this.errorLogDetails.UserCode = this.posMobileNo;
        this.errorLogDetails.ApplicationNo = this.ApplicationNo;
        this.errorLogDetails.CompanyName = url.split('/')[0]
        this.errorLogDetails.ControllerName = url.split('/')[0]
        this.errorLogDetails.MethodName = url.split('/')[1]
        this.errorLogDetails.ErrorCode = err;//data.successcode 
        this.errorLogDetails.ErrorDesc = err;//data.msg;
        this._errorHandleService
          .sendErrorLog(this.errorLogDetails)
          .subscribe((res: any) => {
            console.log(res);
          });
        // }
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

    this.showLoader = true;

    const data = this.finalData;
    let companyCode = this.popupData.CompanyCode;

    //Universal ,TATA,reliance
    if (companyCode == "6" || companyCode == "9" || companyCode == "11")
      this.downloadPdf(this.policyData.DownloadLinkURL);
    // Future
    else if (companyCode == "2" || companyCode == "13" || companyCode == '19')
      this.getPdfFromApi(this.policyData.DownloadLinkURL);
    //Others
    else {
      this._subscriptions.push(
        this._vehicleBuyPlanService
          .GetDownloadPolicyReqIFFCOTOKOI(this.urlParams, data)
          .subscribe((result) => {

            if (!result.data) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = this.urlParams.split('/')[0]
              this.errorLogDetails.ControllerName = this.urlParams.split('/')[0]
              this.errorLogDetails.MethodName = this.urlParams.split('/')[1]
              this.errorLogDetails.ErrorCode = data.successcode
              this.errorLogDetails.ErrorDesc = data.msg;
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  console.log(res);
                });
              this._errorHandleService._toastService.warning(
                "Something went wrong, Please try again later...",
                "Couldn't download policy"
              );
              this.showLoader = false;
              return;
            }
            console.log("Api Response", result);
            this.downloadPdf(result.data);
            // sessionStorage.removeItem("popupData");
            // sessionStorage.removeItem("appNo");
            // sessionStorage.removeItem("regNo");
            // sessionStorage.removeItem("proposalNo");
            // sessionStorage.removeItem("finalData");
            // sessionStorage.removeItem("CarData");
            // sessionStorage.removeItem("postData");
            // sessionStorage.removeItem("reviewData");
            // this._router.navigate([`/pos/car-insurance`]);
            this.showLoader = false;
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
