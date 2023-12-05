import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { PATTERN } from "src/app/models/common";
import { decrypt } from "src/app/models/common-functions";
import { errorLog } from "src/app/models/common.Model";
import { VehicleBuyPlanService } from "src/app/pos-insurance/services/vehicle-buyplan.service";
import { ErrorHandleService } from "../../services/error-handler.service";
import { LoginComponent } from "src/app/login/login.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-quotes-sharing-modal",
  templateUrl: "./quotes-sharing-modal.component.html",
  styleUrls: ["./quotes-sharing-modal.component.css"],
})
export class QuotesSharingModalComponent implements OnInit, OnChanges, OnDestroy {
  private _subscriptions: any[] = [];

  @Input("quotesDetailsForSharing") quotesDetailsForSharing!: any;
  shareQuotesForm!: FormGroup;
  showModal!: boolean;
  btnDisable: boolean = true;
  @ViewChild('shareForm', { static: true }) shareForm!: NgForm;

  constructor(
    private formBuilder: FormBuilder,
    private vbService: VehicleBuyPlanService,
    private _toastrService: ToastrService,
    private _errorHandleService: ErrorHandleService
  ) { }

  posMobileNo: any;
  ApplicationNo: any;
  errorLogDetails = {} as unknown as errorLog;
  ngOnInit() {


    this.shareQuotesForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(70)]],
      mobileNo: [null, [Validators.required, Validators.minLength(10), Validators.pattern(PATTERN.MOBILENO)]],
    });
    if (sessionStorage.getItem("posMob")) {

      this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    }
    // this.ApplicationNo =decrypt(sessionStorage.getItem('appNo'))
    console.log("share quotes ---=>", this.shareQuotesForm)
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log({ changes });
    // console.log(this.quotesDetailsForSharing);
  }

  closeModal() {
    this.shareForm.resetForm();
    this.showModal = !this.showModal;
  }

  onSubmit() {
    if (this.shareQuotesForm.invalid) return;

    let userName = decrypt(sessionStorage.getItem("User Name")!);
    let posMobileNo = decrypt(sessionStorage.getItem("posMob")!);

    if (!this.quotesDetailsForSharing) return;
    let requestForSharingQuotes = {
      Image_Url_JPG: this.quotesDetailsForSharing["image"],
      Receiver_Name: this.shareQuotesForm.get("name")!.value,
      Plan_Description: this.quotesDetailsForSharing["planDescription"],
      POS_Name: `${userName} ${posMobileNo}`,
      Receiver_Mobile_No: `91${this.shareQuotesForm.get("mobileNo")!.value}`,
    };

    console.log({ requestForSharingQuotes });
    // return;

    // through formdata
    // const formData = new FormData();
    // formData.append("file", this.quotesDetailsForSharing["image"]);
    // formData.append("Receiver_Name", this.shareQuotesForm.get("name").value);
    // formData.append(
    //   "Plan_Description",
    //   this.quotesDetailsForSharing["planDescription"]
    // );
    // formData.append("POS_Name", userName);
    // formData.append(
    //   "Receiver_Mobile_No",
    //   this.shareQuotesForm.get("mobileNo").value
    // );
    this.btnDisable = false;
    this._subscriptions.push(this.vbService.shareQuotes(requestForSharingQuotes).subscribe((res) => {
      this.btnDisable = true;
      debugger
      if (res.successcode === "1") {
        this.closeModal();
        this._toastrService.success(res.msg, "Sent successfully!");
      } else {
        this.errorLogDetails.UserCode = this.posMobileNo;
        this.errorLogDetails.ApplicationNo = this.quotesDetailsForSharing["ApplicationNo"];
        this.errorLogDetails.CompanyName = "";
        this.errorLogDetails.ControllerName = "WhatsAppMsg"
        this.errorLogDetails.MethodName = 'PostQuotationOnWhatsApp'
        this.errorLogDetails.ErrorCode = res.successcode ? res.successcode : "0";
        this.errorLogDetails.ErrorDesc = res.msg ? res.msg : "Something went wrong.";
        this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
          console.log('errorLog---=>', res)
        })
        this._toastrService.error(
          "Couldn't share Quotes please enter WhatsApp number!",
          ""
          // { positionClass: "toast-top", timeOut: 5000 }
        );
      }
    }))

  }

  ngOnDestroy(): void {
    this._subscriptions.push((sub: Subscription) => sub.unsubscribe())
  }
}
