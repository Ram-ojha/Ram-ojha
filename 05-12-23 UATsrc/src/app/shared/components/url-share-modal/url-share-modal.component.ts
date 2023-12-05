import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PATTERN } from 'src/app/models/common';
import { decrypt } from 'src/app/models/common-functions';
import { errorLog } from 'src/app/models/common.Model';
import { VehicleBuyPlanService } from 'src/app/pos-insurance/services/vehicle-buyplan.service';
import { ErrorHandleService } from '../../services/error-handler.service';

@Component({
  selector: 'app-url-share-modal',
  templateUrl: './url-share-modal.component.html',
  styleUrls: ['./url-share-modal.component.css']
})
export class UrlShareModalComponent implements OnInit, OnChanges {

  @Input("urlSharingModal") urlSharingModal!: any;
  @Input('finalData') finalData: any;
  @Input('reviewData') reviewData: any;
  shareUrlForm!: FormGroup;
  // @ViewChild("shareUrlModal", { static: false })
  // shareUrlModal: UrlShareModalComponent;
  showModal!: boolean;
  isChecked: boolean = false;
  btnDisable: boolean = false;



  constructor(
    private formBuilder: FormBuilder,
    private vbService: VehicleBuyPlanService,
    private _toastrService: ToastrService,
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _errorHandleService: ErrorHandleService
  ) { }

  posMobileNo: any;
  ApplicationNo: any;
  errorLogDetails = {} as unknown as errorLog;
  ngOnInit() {

    // 
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    // this.ApplicationNo =decrypt(sessionStorage.getItem('appNo'))
    console.log("usrl daha srr ---", this.urlSharingModal, this.showModal)
    this.shareUrlForm = this.formBuilder.group({
      name: [null, [Validators.required,
      Validators.minLength(3),
      Validators.maxLength(60)]],
      mobileNo: [null, [Validators.minLength(10), Validators.pattern(PATTERN.MOBILENO)]],
      emailId: ["", [
        Validators.pattern(PATTERN.EMAIL),
        Validators.maxLength(70)]
      ]
    });
    if (this.urlSharingModal != undefined) {
      this.shareUrlForm.patchValue({
        name: this.urlSharingModal["Receiver_Name"],
        mobileNo: this.urlSharingModal["Receiver_Mobile_No"],
        emailId: this.urlSharingModal["Receiver_EmailID"]
      })
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['urlSharingModal'].currentValue) {
      console.log({ changes });
      console.log(this.urlSharingModal, this.showModal);
      this.shareUrlForm.patchValue({
        name: this.urlSharingModal["Receiver_Name"],
        mobileNo: this.urlSharingModal["Receiver_Mobile_No"],
        emailId: this.urlSharingModal["Receiver_EmailID"]
      })
    }

  }

  closeModal() {

    // this.isChecked = false;
    // this.shareUrlForm.removeControl('emailId')
    this.showModal = !this.showModal;
  }

  // onCheckedChange(event) {
  //   if (event.checked) {
  //     // this.isChecked = true
  //     this.shareUrlForm.addControl('emailId', this.formBuilder.control('', [
  //       Validators.pattern(PATTERN.EMAIL),
  //       Validators.maxLength(70),
  //     ]))
  //     this.shareUrlForm.patchValue({
  //       emailId: this.urlSharingModal["Receiver_EmailID"]
  //     })
  //   } else {
  //     this.isChecked = false
  //     this.shareUrlForm.removeControl('emailId')
  //   }
  // }

  get checkValid() {
    let mobNo = this.shareUrlForm.get('mobileNo')!.value
    let email = this.shareUrlForm.get('emailId')!.value
    if ((mobNo == '' || mobNo == null || mobNo == undefined) && (email == '' || email == null || email == undefined)) {
      return true//this.shareUrlForm.setErrors(null)
    } else {
      return false//this.shareUrlForm.setErrors({ valid: false })
    }
  }

  onSubmit() {

    if (this.shareUrlForm.invalid) return;

    // let userName = decrypt(sessionStorage.getItem("User Name"));
    // let posMobileNo = decrypt(sessionStorage.getItem("posMob"));

    if (!this.urlSharingModal) return;

    let requestForSharingQuotes = {
      Receiver_Name: this.shareUrlForm.get("name")!.value,//`${this.postData.Salutation} ${this.postData.VechileOwnerName} ${this.postData.VehicleOwnerLastName}`,
      Payment_Url: this.urlSharingModal["Payment_Url"],//urlLink,
      Amount: this.urlSharingModal["Amount"],//`${this.sessData.premiumDataPlans.AmountPayableIncludingGST}/-`,
      Product_Description: this.urlSharingModal["Product_Description"],
      Plan_Description: this.urlSharingModal["Plan_Description"],
      Insurance_Company: this.urlSharingModal["Insurance_Company"],
      POS_Name: this.urlSharingModal["POS_Name"],
      Hospital_Or_Garage_URL: this.urlSharingModal["Hospital_Or_Garage_URL"],
      Receiver_Mobile_No: this.shareUrlForm.get("mobileNo")!.value ? `91${this.shareUrlForm.get("mobileNo")!.value}` : "",
      Receiver_EmailId: this.shareUrlForm.get("emailId")!.value ? this.shareUrlForm.get("emailId")!.value : ""

    };


    console.log({ requestForSharingQuotes });
    // return;

    // through formdata
    // const formData = new FormData();
    // formData.append("file", this.urlSharingModal["image"]);
    // formData.append("Receiver_Name", this.shareUrlForm.get("name").value);
    // formData.append(
    //   "Plan_Description",
    //   this.urlSharingModal["planDescription"]
    // );
    // formData.append("POS_Name", userName);
    // formData.append(
    //   "Receiver_Mobile_No",
    //   this.shareUrlForm.get("mobileNo").value
    // );

    const dt = JSON.parse(sessionStorage.getItem("postData")!);
    console.log(dt.Data)
    // const appNo = encrypt(JSON.stringify(dt.ApplicationNo));
    // const appODP = encrypt(JSON.stringify(dt.ApplicationNoOdp)); 
    // const regNo = encrypt(JSON.stringify(dt.RegistrationNo));
    // const regOdp = encrypt(JSON.stringify(dt.RegistrationNoOdp));
    const appNo = dt.Data.ApplicationNo;
    const appODP = dt.Data.ApplicationNoOdp;
    const regOdp = dt.Data.RegistrationNoOdp;
    const regNo = dt.Data.RegistrationNo;
    this.btnDisable = true
    this.vbService.shareUrl(requestForSharingQuotes).subscribe((res) => {

      console.log("res ---", res)
      this.btnDisable = false;
      if (res.successcode === "1") {
        this.showModal = !this.showModal;
        // this.isChecked = false;
        // this.shareUrlForm.removeControl('emailId')
        this.shareUrlForm.reset();
        Object.keys(this.shareUrlForm.controls).forEach((key) => {
          this.shareUrlForm.get(key)!.setErrors(null);
        });
        this._toastrService.success(res.msg ? res.msg : "Sent successfully!", "");
        this.vbService.SetExpTime(appNo, appODP, regNo, regOdp).subscribe((res) => {
          console.log(res);
          if (res.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = appNo;
            this.errorLogDetails.CompanyName = this.urlSharingModal["Insurance_Company"];
            this.errorLogDetails.ControllerName = "PaymentURLShare"
            this.errorLogDetails.MethodName = 'GetPaymentUrlShareData'
            this.errorLogDetails.ErrorCode = res.successcode;
            this.errorLogDetails.ErrorDesc = res.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          }
        })
        console.log(res);
      } else {
        this.errorLogDetails.UserCode = this.posMobileNo;
        this.errorLogDetails.ApplicationNo = appNo;
        this.errorLogDetails.CompanyName = this.urlSharingModal["Insurance_Company"];;
        this.errorLogDetails.ControllerName = "WhatsAppMsg"
        this.errorLogDetails.MethodName = 'PostSharePaymentURL'
        this.errorLogDetails.ErrorCode = res.successcode;
        this.errorLogDetails.ErrorDesc = res.msg;
        this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
          console.log('errorLog---=>', res)
        })
        this._toastrService.error(
          res.msg ? res.msg :
            "Couldn't share Url,try again later!",
          "");
      }
    });
  }

}
