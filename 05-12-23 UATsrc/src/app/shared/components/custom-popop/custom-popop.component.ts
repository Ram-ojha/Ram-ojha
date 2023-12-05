import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ContactService } from "src/app/shared/services/contact.service";
import { PATTERN } from "src/app/models/common";
import { ToastrService } from "ngx-toastr";
import { errorLog } from "src/app/models/common.Model";
import { ErrorHandleService } from "../../services/error-handler.service";
import { Subscription } from "rxjs";

@Component({
  selector: "bima-custom-popop",
  templateUrl: "./custom-popop.component.html",
  styleUrls: ["./custom-popop.component.css"],
})
export class CustomPopopComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  @Output() closePopupClick = new EventEmitter<boolean>();

  contactForm: FormGroup;
  errMsg = "";
  isSubmit = false;
  private _subscriptions: any = [];
  link: any;
  userName: any;
  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog
  constructor(
    private _fb: FormBuilder,
    private _contactSer: ContactService,
    private _toast: ToastrService,
    private _errorHandleService: ErrorHandleService
  ) {
    this.contactForm = _fb.group({
      fullName: ["", [Validators.required, Validators.minLength(3)]],
      email: [
        "",
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(PATTERN.EMAIL),
        ],
      ],
      subject: ["", [Validators.required, Validators.minLength(3)]],
      message: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(300),
        ],
      ],
    });
  }

  onSubmit(): any {
    this.errMsg = "";
    if (this.contactForm.invalid) {
      this.errMsg = "Please fill all the details correctly";
      if (
        this.contactForm.get("email")!.invalid &&
        this.contactForm.get("fullName")!.valid
      ) {
        this.errMsg = "Please enter valid email id";
      }
      return false;
    }
    let frmValue = this.contactForm.value;
    this.isSubmit = true;
    this._subscriptions.push(
      this._contactSer
        .saveContact(
          frmValue.fullName,
          frmValue.email,
          frmValue.subject,
          frmValue.message
        )
        .subscribe(
          (result: any) => {
            this.isSubmit = false;
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = frmValue.email;
              this.errorLogDetails.ApplicationNo = "";
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "Contact"
              this.errorLogDetails.MethodName = 'SaveContactInfo'
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                console.log('errorLog---=>', res)
              })
            }
            if (result.successcode == "1") {
              this._toast.success(result.msg);
              this.onClickClose();
            } else {
              this._toast.warning(result.msg);
            }
          },
          (err) => {
            this.isSubmit = false;
            this._toast.error("Please try again later.");
          }
        ))
  }

  ngOnInit() {
    this.isSubmit = false;
  }

  onClickClose() {
    this.isSubmit = false;
    this.contactForm.reset();
    this.closePopupClick.emit(false);
  }

  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe()); // 🧙‍♂️🧙‍♂️
  }
}
