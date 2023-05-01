import { Component, Input, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { NgxCaptureService } from "ngx-capture";
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { decrypt } from 'src/app/models/common-functions';
import { errorLog } from 'src/app/models/common.Model';
import { VehicleBuyPlanService } from 'src/app/pos-insurance/services/vehicle-buyplan.service';
import { ErrorHandleService } from '../../services/error-handler.service';
import { QuotesSharingModalComponent } from '../quotes-sharing-modal/quotes-sharing-modal.component';


@Component({
  selector: 'app-response-modal',
  templateUrl: './response-modal.component.html',
  styleUrls: ['./response-modal.component.css']
})

export class ResponseModalComponent implements OnInit, OnDestroy {
  @Input("responseDetails") responseDetails!: any;
  @ViewChild("shareQuotesModal", { static: false }) shareQuotesModal!: QuotesSharingModalComponent;
  @ViewChild("screen", { static: true }) screen: any;

  showResponse!: boolean;
  data: any;
  dataSource: any;
  ApplicationNo: any;
  resDetailsForSharing: any;

  _subscriptions: any = [];
  InsuranceCateCode: any;
  InsuranceCate!: string;

  constructor(private screenCaptureService: NgxCaptureService,
    private vbService: VehicleBuyPlanService,
    private _toastrService: ToastrService,
    private _errorHandleService: ErrorHandleService) {



  }

  displayedColumns: string[] = ['additionaldata', 'msg'];

  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog;
  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    //   console.log(this.responseDetails);
    //   if(this.responseDetails != undefined){
    //   this.dataSource = this.responseDetails
    //   this.ApplicationNo = this.responseDetails[0].data.ApplicationNo
    //   this.InsuranceCateCode = this.responseDetails[0].data.InsuranceCateCode
    //   this.captureScreen()
    // }
  }






  ngOnChanges(changes: SimpleChange) {

    // console.log({ changes });
    // Object.keys(changes).forEach((key: any) => {
    //   if (changes!.currentValue!['responseDetails'] != undefined) {
    //     // if(!changes['responseDetails'].isFirstChange()){
    //     console.log(this.responseDetails);
    //     this.dataSource = this.responseDetails
    //     this.ApplicationNo = this.responseDetails[0].data.ApplicationNo
    //     this.InsuranceCateCode = this.responseDetails[0].data.InsuranceCateCode
    //     // this.captureScreen()
    //   }
    // })
    if (this.responseDetails && this.responseDetails.length > 0) {

      this.dataSource = this.responseDetails
      this.ApplicationNo = this.responseDetails[0].data.ApplicationNo
      this.InsuranceCateCode = this.responseDetails[0].data.InsuranceCateCode
    }
  }

  closeModal() {
    this.showResponse = !this.showResponse;
  }

  capturedImage: any;
  capturePromise: any;

  screenShot(): Observable<any> {
    return this.capturePromise = this.screenCaptureService.getImage(
      this.screen.nativeElement,
      true
    )
  }

  captureScreen() {
    // // try {
    //    this.capturePromise = this.screenCaptureService.getImage(
    //     this.screen.nativeElement,
    //     true
    //   );
    // } catch (err) {
    //   console.log("error occured");
    //   console.log({ err });
    // }
    // let imgString = this.capturePromise;
    this.screenShot().subscribe((imgString: string) => {
      let convertedImageFile = imgString.replace("data:image/png;base64,", "");
      // let motorDesc = `${this.plan.RegYear} ${this.plan.engineSize ? this.plan.engineSize : ''} ${}`

      if (this.InsuranceCateCode == 2) {
        this.InsuranceCate = 'Car Insurance'
      }
      if (this.InsuranceCateCode == 1) {
        this.InsuranceCate = 'Bike Insurance'
      } if (this.InsuranceCateCode == 10) {
        this.InsuranceCate = 'CV Insurance'
      }
      this.resDetailsForSharing = {
        image: convertedImageFile,
        planDescription: `Application No.(${this.ApplicationNo}) of your ${this.InsuranceCate}`
      };


      let userName = decrypt(sessionStorage.getItem("User Name")!);
      let posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
      console.log(this.resDetailsForSharing)
      let requestForSharingQuotes = {
        Image_Url_JPG: this.resDetailsForSharing["image"],
        Receiver_Name: "Sir/Ma'am",
        Plan_Description: this.resDetailsForSharing["planDescription"],
        POS_Name: `${userName} ${posMobileNo}`,
        Receiver_Mobile_No: `919111989487`,
        ResponseFlagYN: 'Y'
      };
      this._subscriptions.push(
        this.vbService.shareQuotes(requestForSharingQuotes).subscribe((res) => {
          if (res.successcode === "1") {

            this._toastrService.success("Sent successfully!", "");
            console.log(res);
          } else {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "WhatsAppMsg"
            this.errorLogDetails.MethodName = 'PostQuotationOnWhatsApp'
            this.errorLogDetails.ErrorCode = res.successcode;
            this.errorLogDetails.ErrorDesc = res.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
            this._toastrService.error(
              "Couldn't share quotes,try again later!",
              ""
              // { positionClass: "toast-top", timeOut: 5000 }
            );
          }
        })
      )

    })
    // .catch(err => {
    //   console.log(err)
    // })
    // let convertedImageFile = this.convertBase64ToImage(imgString);




  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe()
    });
  }


}
