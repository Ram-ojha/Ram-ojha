import { Injectable, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { errorLog, IPolicyPDFDocDownload } from 'src/app/models/common.Model';
import { ErrorHandleService } from 'src/app/shared/services/error-handler.service';
import { VehicleBuyPlanService } from './vehicle-buyplan.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService implements OnDestroy {
  errorLogDetails = {} as unknown as errorLog;;

  _subscriptions: any[] = [];
  // policyData: any;

  constructor(
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private toasterService: ToastrService,
    private _errorHandleService: ErrorHandleService,
  ) { }




  downloadPolicy(policyDetails: any, payloadForDownloadPolicy: IPolicyPDFDocDownload) {
    debugger
    if (policyDetails.DownloadLinkURL === null ||
      policyDetails.DownloadLinkURL === undefined ||
      policyDetails.DownloadLinkURL === "") {
      let data: IPolicyPDFDocDownload = payloadForDownloadPolicy;

      this._subscriptions.push(
        this._vehicleBuyPlanService
          .GetDownloadPolicyPdf(data)
          .subscribe((result: any) => {
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = policyDetails.PosCode ? policyDetails.PosCode : "0";
              this.errorLogDetails.ApplicationNo = data.ApplicationNo;
              this.errorLogDetails.CompanyName = data.CompanyCode;
              this.errorLogDetails.ControllerName = "VehicleData";
              this.errorLogDetails.MethodName = "PolicyPDFDocDownload"
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this.toasterService.error(result.msg)
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  console.log('errorlog-----=>', res);
                });
            } else {
              const fileName = policyDetails.PolicyNo + ".pdf";
              if (result.additionaldata == 0 || result.additionaldata === null) {
                this.toasterService.error(result.msg, "Pdf not download !. Please provide right additional data.");
              } else {
                if (result.additionaldata == 1) {
                  this.downloadBase64Pdf(result.data, fileName);
                } else {
                  this.downloadPdf(result.data, fileName);
                }
              }
            }
          })
      );

    } else {
      const fileName = policyDetails.PolicyNo + ".pdf";

      this.downloadPdf(policyDetails.DownloadLinkURL, fileName);

    }



  }

  downloadPdf(link: string, fileName: string, base64withoutInitials?: boolean) {

    let base64LinkSource = "data:application/pdf;base64," + `${link}`;

    const linkSource = base64withoutInitials ? base64LinkSource : link;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.target = "_blank";
    downloadLink.download = fileName;
    downloadLink.click();

  }

  downloadBase64Pdf(base64String: string, fileName: string, base64withoutInitials?: boolean) {
    debugger
    // const imageName = policyDetails.PolicyNo + ".pdf";
    const fileBlob = this.dataURItoBlob(base64String);

    var blob = new Blob([fileBlob], { type: 'application/pdf' });
    // var url = window.URL.createObjectURL(blob);
    // window.open(url);
    const reader = new FileReader();
    const downloadLink: any = document.createElement("a");
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      downloadLink.href = reader.result;
      downloadLink.target = "_blank";
      downloadLink.download = fileName;
      downloadLink.click();
    }


    // const imageFile = new File([imageBlob], imageName, { type: 'application/pdf' });
    // console.log(imageFile)
  }

  dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'application/pdf' });
    return blob;
  }


  ngOnDestroy(): void {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
