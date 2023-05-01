import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from "@angular/core";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ErrorHandleService } from "../../services/error-handler.service";
import { errorLog, IRtos } from "src/app/models/common.Model";
import { FormControl, FormGroup } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { decrypt } from "src/app/models/common-functions";

@Component({
  selector: "app-vehicle-rtos",
  templateUrl: "./vehicle-rtos.component.html",
  styleUrls: ["../../../pos-home/pos-home.component.css"],
})
export class VehicleRtoComponent implements OnInit, OnDestroy {
  //properties
  @Input() isVisible: boolean = false;
  @Output() closePopupClick = new EventEmitter<string>();
  @Input() insuranceCateCode!: number;

  // rtoForm= FormGroup;
  RTOCode = new FormControl();

  selectedValue: any = "";
  rtosList: IRtos[] = [];
  filteredRtoList!: Observable<IRtos[]>;
  InsuranceTypeName: string = "bike";
  private _subscriptions: any = []
  link: any;
  userName: any;
  posMobileNo: any;
  errorLogDetails!: errorLog
  constructor(
    private _posHomeService: PosHomeService,
    private _errorHandleService: ErrorHandleService
  ) { }

  ngOnInit() {
    this.link = window.location.hash.split('/');
    this.userName = decrypt(sessionStorage.getItem("User Name")!);
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    // this.rtoForm=new FormGroup({RTOCode : new FormControl('')})
    // if (this._posHomeService.RtosList && this._posHomeService.RtosList.length) {
    //   console.log("stored value");

    //   this.rtosList = this._posHomeService.RtosList;
    // } else {
    //   this.getRto();
    //   console.log("new request");
    // }
    let sesData = JSON.parse(sessionStorage.getItem("insuranceType")!);
    this.getRto(this.insuranceCateCode);
    this.edit();
  }

  edit() {
    const type = JSON.parse(sessionStorage.getItem("insuranceType")!);
    if (type.InsuranceCateCode) {
      if (type.InsuranceCateCode == 1) {
        this.InsuranceTypeName = "bike";
        this.RTOCode.patchValue("");
      }
      if (type.InsuranceCateCode == 2) {
        this.InsuranceTypeName = "car";
        this.RTOCode.patchValue("");
      }
      if (type.InsuranceCateCode == 10) {
        this.InsuranceTypeName = "CV";
        this.RTOCode.patchValue("");
      }
    }
    const vData = JSON.parse(sessionStorage.getItem("VehicleData")!);
    const cData = JSON.parse(sessionStorage.getItem("CarData")!);
    const cvData = JSON.parse(sessionStorage.getItem("CVData")!);
    if (vData && vData.edit == 1) {
      this.RTOCode.patchValue(vData.VehicleRTODesc);
    }
    if (cData && cData.edit == 1) {
      this.RTOCode.patchValue(cData.VehicleRTODesc);
    }
    if (cvData && cvData.edit == 1) {
      this.RTOCode.patchValue(cvData.VehicleRTODesc);
    }
  }
  private _filter(value: string): IRtos[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;

    return this.rtosList.filter((rtoData) =>
      rtoData.RTODisplayNameNew.toLowerCase().includes(filterBy)
    );
  }

  closePopup() {
    this.closePopupClick.emit(this.selectedValue);
  }

  public onSelect(selected: string) {
    this.RTOCode.patchValue(selected.split(",")[1]);
    this.selectedValue = selected;

    if (selected) {
      console.log(selected);
      this.closePopupClick.emit(selected);
    } else {
      this.closePopupClick.emit(this.selectedValue);
    }
  }
  //get rtos from server
  private getRto(InsuranceCateCode: number) {
    this._subscriptions.push(
      this._posHomeService.getRto(InsuranceCateCode).subscribe(
        (result) => {
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "PosHome"
            this.errorLogDetails.MethodName = "GetRto";
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          }
          if (result.successcode == "1") {
            this.rtosList = result.data;

            this.filteredRtoList = this.RTOCode.valueChanges.pipe(
              startWith(""),
              map((value) => this._filter(value))
            );
          }
        },
        (err: any) => {
          this._errorHandleService.handleError(err);
        }
      ))
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
