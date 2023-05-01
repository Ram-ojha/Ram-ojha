import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { map, startWith, take } from "rxjs/operators";
import {
  ApplicationVehicleData,
  errorLog,
  IApplicationVehicleData,
  IInsuranceSubType,
  IInsuranceType,
  IRtos,
} from "src/app/models/common.Model";
import { EYesNo, InsuranceCategories } from "src/app/models/insurance.enum";
import {
  convertToMydate,
  decrypt,
  encrypt,
} from "src/app/models/common-functions";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { PosHomeService } from "../services/pos-home.service";
import { yesNoList, PATTERN, MASKS, NCBList } from "src/app/models/common";
import { VehicleRtoComponent } from 'src/app/shared/components/vehicle-rtos/vehicle-rtos.component';
import { PolicyExpiredComponent } from 'src/app/shared/components/policy-expired/policy-expired.component';
import { CvModelVariantComponent } from 'src/app/shared/components/cv-model-variant/cv-model-variant.component';

import { Router } from '@angular/router';
import { Observable } from "rxjs";
import { ValidatorsService } from "src/app/pos-insurance/services/validators.service";
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-commercial',
  templateUrl: './commercial.component.html',
  styleUrls: ["../pos-home.component.css"],
})
export class CommercialComponent implements OnInit {

  @ViewChild("cvModel", { static: false })
  private cvModelCmp!: CvModelVariantComponent;
  @ViewChild("vehicleRtos", { static: false })
  private rtoCmp!: VehicleRtoComponent;
  @ViewChild("policyExpire", { static: false })
  private policyCmp!: PolicyExpiredComponent;
  public yesNoList = yesNoList;
  policySubTypeList: IInsuranceSubType[] = [];

  private _subscriptions: any[] = [];
  policySubType: IInsuranceSubType[] = [];
  showLoader!: boolean;
  yesno = EYesNo;
  insuranceType!: IInsuranceType | any;
  policyType: number = 7;
  renewCVForm: FormGroup;
  newCVForm: FormGroup;
  knowCVForm: FormGroup;

  knowBikeNumber: boolean = false;
  displayBikeModelPopup: any = false;
  displayRtoPopup: any = false;
  policyExpireDisplayValue: string = "";
  btnDisable = false;
  showExpiredPolicy = false;
  public openBy: string = "";
  public errMsg = "";
  displayPolicyType!: boolean;
  openByMe: any;
  vData = JSON.parse(sessionStorage.getItem("CVData")!);
  tw = new ApplicationVehicleData();
  minDate!: Date;
  maxDate!: Date;

  prvPolicyExDate = new FormControl(new Date(), [Validators.required]);
  prvPolicyRememberCode: number = 1;
  ncbInput = new FormControl("", [Validators.required]);
  isNcbEditable = true;
  popupActive = "date";
  date: string = convertToMydate(new Date());
  ncbExpDateErrMsg!: string;
  //#endregion
  todayDate = new Date();
  isMoreThan90!: boolean;
  display = "none";
  displayCarrierType = "none";
  ncbList = NCBList;
  plan = {
    isComprehensive: false,
    isTp: true,
    isOd: "",
    idvType: 0,
    previousNcb: "0",
    currentNcb: "0",
    zeroDp: false,
    paCover: false,
    isMultiYear: null,
    idvValue: 0,
    vehicleNo: "",
    rto: "",
    vehicleDesc: "",
    RegYear: "",
    engineSize: "",
    ClaimPrvPolicyDesc: "NO",
    PolicyExpiryDate: null,
    PrvPolicyExCode: 0,
    SubCateCode: 0,
    isOdOnly: false,
    SubCateDesc: "",
  };
  policyTypeList: any;
  carrierTypeList: any = [];
  displayVehicleOwnedBy = 'none'
  vehicleOwnedBy: any;
  rtosList: any;
  filteredRtoList!: Observable<IRtos[]>;

  private set setMinDays(days: number) {
    console.log(days);

    if (days == 0) {
      const dt = new Date();
      console.log("mindays0" + dt);

      this.minDate = new Date(+dt.getFullYear(), +dt.getMonth(), +dt.getDate());

      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewCVForm.value.isPreviousPolicyExp
      ) {
        const md = this.vData.PreviousPolicyExpiryDate.split("/");
        this.prvPolicyExDate.patchValue(
          new Date(md[1] + "/" + md[0] + "/" + md[2])
        );
      } else {
        this.prvPolicyExDate.patchValue(this.minDate);
      }
    }

    if (days == 365) {
      const dt = new Date();
      this.todayDate = new Date(
        +dt.getFullYear(),
        +dt.getMonth(),
        +dt.getDate() - 90
      );
      this.minDate = new Date(
        +this.todayDate.getFullYear(),
        +this.todayDate.getMonth(),
        +this.todayDate.getDate() - days
      );

      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewCVForm.value.isPreviousPolicyExp
      ) {
        const md = this.vData.PreviousPolicyExpiryDate.split("/");
        this.prvPolicyExDate.patchValue(
          new Date(md[1] + "/" + md[0] + "/" + md[2])
        );
      } else {
        this.prvPolicyExDate.patchValue(this.minDate);
      }
    } else {
      const t = new Date();
      console.log("mindays" + t);
      this.minDate = new Date(
        +t.getFullYear(),
        +t.getMonth(),
        +t.getDate() - days
      );

      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewCVForm.value.isPreviousPolicyExp &&
        this.vData.VehicleExpiryCode == this.renewCVForm.value.CarExpiryCode
      ) {
        const md = this.vData.PreviousPolicyExpiryDate.split("/");
        this.prvPolicyExDate.patchValue(
          new Date(md[1] + "/" + md[0] + "/" + md[2])
        );
      } else {
        this.prvPolicyExDate.patchValue(this.minDate);
      }
    }
  }
  private set setMaxDays(days: number) {
    console.log(days);

    if (days == 0) {
      const dt = new Date();
      this.maxDate = new Date(+dt.getFullYear(), +dt.getMonth(), +dt.getDate());
    }

    if (days == 90) {
      const md = new Date();
      this.maxDate = new Date(
        +md.getFullYear(),
        +md.getMonth(),
        +md.getDate() - days
      );

      const v = this.renewCVForm.value;
      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewCVForm.value.isPreviousPolicyExp &&
        this.renewCVForm.value.CarExpiryCode == this.vData.VehicleExpiryCode
      ) {
        const md = this.vData.PreviousPolicyExpiryDate.split("/");
        this.prvPolicyExDate.patchValue(
          new Date(md[1] + "/" + md[0] + "/" + md[2])
        );
      } else {
        this.prvPolicyExDate.patchValue(this.maxDate);
        this.todayDate = this.maxDate;
      }
    } else {
      const t = new Date();
      console.log("maxdays" + t);

      this.maxDate = new Date(
        +t.getFullYear(),
        +t.getMonth(),
        +t.getDate() + days
      );
    }
  }
  constructor(
    private _router: Router,
    private _posHomeService: PosHomeService,
    fb: FormBuilder,
    private _errorHandleService: ErrorHandleService
  ) {
    this.renewCVForm = fb.group({
      CvDisplayValue: ["", Validators.required],
      RecordNoforCvVehicleType: ['', Validators.required],
      CvVehicleType: ['', Validators.required],
      VehicleTypeCarriageCode: ['', Validators.required],
      VehicleTypeCarriageDesc: ['', Validators.required],
      CvBrandCode: ["", Validators.required],
      CvModelCode: ["", Validators.required],
      CvVariantCode: ["", Validators.required],
      RegistrationYearCode: ["", Validators.required],
      isPreviousPolicyExp: ["", Validators.required],
      claimInPreviousYear: ["", Validators.required],
      CarExpiryCode: [""],
      RTOCode: ["", Validators.required],
      RTODisplayName: ["", Validators.required],
      FuelCode: [""],

      CvBrandDesc: "",
      CvModelDesc: "",
      CvVariantDesc: "",
      RegistrationYearDesc: "",
      FuelDesc: [""],
      CubicCapacity: "",
      VehicleTypeId: [""],
      VariantName: "",
    });
    // SeatingCapacity: "",
    this.newCVForm = fb.group({
      CvDisplayValue: ["", Validators.required],
      RecordNoforCvVehicleType: ['', Validators.required],
      CvVehicleType: ['', Validators.required],
      VehicleTypeCarriageCode: ['', Validators.required],
      VehicleTypeCarriageDesc: ['', Validators.required],
      CvBrandCode: ["", Validators.required],
      CvModelCode: ["", Validators.required],
      CvVariantCode: ["", Validators.required],
      RegistrationYearCode: ["", Validators.required],
      RTOCode: ["", Validators.required],
      RTODisplayName: ["", Validators.required],
      FuelCode: ["", Validators.required],

      CvBrandDesc: "",
      CvModelDesc: "",
      CvVariantDesc: "",
      RegistrationYearDesc: "",
      FuelDesc: [""],
      RTOName: "",
      VariantName: "",
      SeatingCapacity: "",
      VehicleTypeId: [""],
    });
    this.knowCVForm = fb.group({
      bikeNo: [
        "",
        [
          Validators.required,
          Validators.maxLength(13),
          Validators.pattern(PATTERN.VEHICLENO),
        ],
      ],
      isPreviousPolicyExp: ["", Validators.required],
      CarExpiryCode: [""],
      claimInPreviousYear: ["", Validators.required],
    });
  }

  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog;
  ngOnInit() {

    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    this._subscriptions.push(
      this._posHomeService.insuranceTypeMenu
        .pipe(take(1))
        .subscribe((apiRes) => {
          if (apiRes.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "PosHome";
            this.errorLogDetails.MethodName = "GetInsuranceType";
            this.errorLogDetails.ErrorCode = apiRes.successcode;
            this.errorLogDetails.ErrorDesc = apiRes.msg;
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });
          }
          let insuranceMenu: IInsuranceType[] = apiRes.data;
          this.insuranceType = insuranceMenu.find(
            (type) => type.InsuranceCateCode === InsuranceCategories.CV
          );
          console.log(this.insuranceType);
          this.getSubType(this.insuranceType.InsuranceCateCode);
        })
    );

    this.getRto(this.insuranceType.InsuranceCateCode);
    this.editCarData();
  }

  private getSubType(insuranceCateCode: number) {
    this.showLoader = true;

    this._subscriptions.push(
      this._posHomeService.getPolicyType(insuranceCateCode).subscribe(
        (result) => {
          this.showLoader = false;

          if (result.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "PosHome";
            this.errorLogDetails.MethodName = "GetInsuranceSubType";
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });
          }

          if (result.successcode == "1") {
            // if (result.successcode == "1") {
            this.policySubType = result.data;
            // }
            // },
            this.policySubTypeList = result.data;
            console.log(result.data);
            // for display prefiled data
            // if (localStorage.getItem('twoWheeler')) {
            //     this.fillData();
            // }
            // end
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    );
  }

  get rf() {
    return this.renewCVForm
  }

  get nf() {
    return this.newCVForm
  }

  private _filter(value: string): IRtos[] {
    debugger
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;

    return this.rtosList.filter((rtoData: IRtos) =>
      rtoData.RTODisplayNameNew.toLowerCase().includes(filterBy)
    );
  }
  public onSelectRtos(selected: string) {

    const rto = this.rtosList.find((x: IRtos) => x.RTODisplayName.toLowerCase() === selected.toLowerCase())
    if (rto) {
      if (this.policyType == 7) {
        this.renewCVForm.get("RTOCode")!.patchValue(rto.RTOCode);
        console.log(selected)
      }
      else if (this.policyType == 8) {
        this.newCVForm.get("RTOCode")!.patchValue(rto.RTOCode);
        console.log(selected)
      } else {
        console.log(rto)
      }
    }
  }
  private getRto(InsuranceCateCode: string | number) {
    debugger
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
            debugger
            this.rtosList = result.data;
            if (this.policyType == 8) {
              this.filteredRtoList = this.newCVForm.controls["RTODisplayName"].valueChanges.pipe(
                startWith(""),
                map((value) => this._filter(value))
              );
            }
            else {
              debugger
              this.filteredRtoList = this.renewCVForm.controls["RTODisplayName"].valueChanges.pipe(
                startWith(""),
                map((value) => this._filter(value))
              );
            }
            this.setRtoValidation()
          }
        },
        (err: any) => {
          this._errorHandleService.handleError(err);
        }
      ))
  }

  setRtoValidation() {
    if (this.policyType == 7) {
      this.rf.get("RTODisplayName")!.setValidators([Validators.required, ValidatorsService.rtoValidators(this.rtosList)])
      this.rf.get("RTODisplayName")!.updateValueAndValidity();
    }

    if (this.policyType == 8) {

      this.nf.get("RTODisplayName")!.setValidators([Validators.required, ValidatorsService.rtoValidators(this.rtosList)])
      this.nf.get("RTODisplayName")!.updateValueAndValidity();
    }

  }

  public closeRtosPopup(selected: string) {
    this.displayRtoPopup = false;

    if (selected) {
      if (this.openBy == "renewCVForm") {
        this.renewCVForm.patchValue({
          RTOCode: +selected.split(",")[0],
          RTODisplayName: selected.split(",")[1],
        });
      }
      if (this.openBy == "newCVForm") {
        this.newCVForm.patchValue({
          RTOCode: +selected.split(",")[0],
          RTODisplayName: selected.split(",")[1],
        });
      }
    }
    if (this.vData && !selected && this.vData.edit == 1) {
      this.renewCVForm.patchValue({
        RTODisplayName: this.vData.VehicleRTODesc,
        RTOCode: this.vData.VehicleRTOCode,
      });
      this.newCVForm.patchValue({
        RTODisplayName: this.vData.VehicleRTODesc,
        RTOCode: this.vData.VehicleRTOCode,
      });
    }
    this.tw.VehicleRTODesc = selected.split(",")[1];
    this.openBy = "";
  }
  public closePolicyExpiredPopup(event: string) {

    console.log(this.yesNoList);
    this.showExpiredPolicy = false;
    if (this.openBy == "renewCVForm") {
      if (event) {
        this.renewCVForm.controls["CarExpiryCode"].setValue(
          +event.split(",")[0]
        );
      } else {
        this.renewCVForm.patchValue({
          CarExpiryCode: "",
          isPreviousPolicyExp: "",
        });
      }
    }
    if (this.openBy == "knowCVForm") {
      if (event)
        this.knowCVForm.controls["CarExpiryCode"].setValue(
          +event.split(",")[0]
        );
      else {
        this.knowCVForm.patchValue({
          CarExpiryCode: "",
          isPreviousPolicyExp: "",
        });
      }
    }
    this.policyExpireDisplayValue = event.split(",")[1];
    this.openBy = "";
  }
  public closeBikeModelVariantPopup(event: any) {

    console.log(event)
    if (event) {
      if (this.openBy == "renewCVForm") {
        this.renewCVForm.patchValue({
          CvDisplayValue:
            event.CvVehicleType +
            ", " +
            event.CvBrandDesc +
            ", " +
            event.CvModelDesc +
            ", " +
            event.CvVariantDesc +
            ", " +
            event.RegistrationYearDesc,

          CvBrandCode: event.CvBrandCode,
          CvModelCode: event.CvModelCode,
          CvVariantCode: event.CvVariantCode,
          RegistrationYearCode: event.RegistrationYearCode,
          FuelCode: event.FuelCode,
          RecordNoforCvVehicleType: event.RecordNoforCvVehicleType,
          CvVehicleType: event.CvVehicleType,
          VehicleTypeCarriageCode: event.VehicleTypeCarriageCode,
          VehicleTypeCarriageDesc: event.VehicleTypeCarriageDesc,
          CvBrandDesc: event.CvBrandDesc,
          CvModelDesc: event.CvModelDesc,
          CvVariantDesc: event.CvVariantDesc,
          RegistrationYearDesc: event.RegistrationYearDesc,
          FuelDesc: event.FuelTypeDesc,
          // CubicCapacity: event.CubicCapacity,
          // SeatingCapacity: event.SeatingCapacity,
          VariantName: event.VariantName,
          VehicleTypeId: event.VehicleTypeId
        });
      }
      if (this.openBy == "newCVForm") {

        this.newCVForm.patchValue({
          CvDisplayValue:
            event.CvVehicleType +
            "," +
            event.CvBrandDesc +
            ", " +
            event.CvModelDesc +
            ", " +
            event.CvVariantDesc +
            ", " +
            event.RegistrationYearDesc,
          CvBrandCode: event.CvBrandCode,
          CvModelCode: event.CvModelCode,
          CvVariantCode: event.CvVariantCode,
          RegistrationYearCode: event.RegistrationYearCode,
          FuelCode: event.FuelCode,
          RecordNoforCvVehicleType: event.RecordNoforCvVehicleType,
          CvVehicleType: event.CvVehicleType,
          VehicleTypeCarriageCode: event.VehicleTypeCarriageCode,
          VehicleTypeCarriageDesc: event.VehicleTypeCarriageDesc,
          CvBrandDesc: event.CvBrandDesc,
          CvModelDesc: event.CvModelDesc,
          CvVariantDesc: event.CvVariantDesc,
          RegistrationYearDesc: event.RegistrationYearDesc,
          FuelDesc: event.FuelTypeDesc,
          // CubicCapacity: event.CubicCapacity,
          // SeatingCapacity: event.SeatingCapacity,
          VariantName: event.VariantName,
          VehicleTypeId: event.VehicleTypeId
        });
      }
    }
    this.displayBikeModelPopup = false;
    this.openBy = "";

  }
  public onPolicyExpiredChange(event: number, openBy: string) {
    console.log(event);

    if (event == 1) {
      // this._errorHandleService._toastService.warning("Please Select No to proceed","Breaking case not integrated")
      // this.renewCVForm.patchValue({isPreviousPolicyExp:''});
      this.showExpiredPolicy = true;
      this.openBy = openBy;
    } else {
      // this.prvPolicyExDate.setValue("");
      this.policyCmp.selectedValue = "";
      this.policyExpireDisplayValue = "";
    }
  }
  public onClickKnowBikeNo() {
    this.knowBikeNumber = !this.knowBikeNumber;
    if (this.knowBikeNumber) {
      this.knowCVForm.reset();
    } else {
      this.renewCVForm.reset();
    }
    this.resetForm();
  }
  public onTypeChange(type: number) {
    if (type == 7) {
      // this.knowCVNumber = false;
      this.renewCVForm.reset();
      this.rtoCmp.RTOCode.patchValue("");
    }
    if (type == 8) {
      this.newCVForm.reset();
      this.rtoCmp.RTOCode.patchValue("");
    }
    this.getRto(this.insuranceType.InsuranceCateCode);
    sessionStorage.removeItem("CVData");
    this.resetForm();
  }
  private resetForm() {
    this.policyExpireDisplayValue = "";
    this.cvModelCmp.reset();
    this.rtoCmp.selectedValue = "";
    this.policyCmp.selectedValue = "";
    this.openBy = "";
    this.errMsg = "";
  }
  public onClickInput(openBy: string) {
    this.openBy = openBy;
    this.displayBikeModelPopup = true;
  }
  onSubmitRenewCV(): any {
    this.errMsg = "";

    if (this.renewCVForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    if (this.renewCVForm.get("isPreviousPolicyExp")!.value == EYesNo.YES) {
      if (!this.renewCVForm.get("CarExpiryCode")!.value) {
        this.onPolicyExpiredChange(1, "renewCVForm");

        this.errMsg = "Please fill all details correctly.";
        return false;
      }
    }

    const frmValue = this.renewCVForm.value;

    this.tw.InsuranceCateCode = this.insuranceType.InsuranceCateCode;
    this.tw.InsuranceCateDesc = this.insuranceType.InsuranceCateDesc;
    this.tw.SubCateCode = this.policySubType.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateCode;
    this.tw.SubCateDesc = this.policySubType.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateDesc;
    // this.tw.SubCateCode = 3;
    // this.tw.SubCateDesc = "Renew Policy";
    this.tw.CVehicleTypeCode = frmValue.RecordNoforCvVehicleType;
    this.tw.CVehicleDesc = frmValue.CvVehicleType;
    this.tw.CvVehicleType = frmValue.CvVehicleType;
    this.tw.VehicleTypeCarriageCode = frmValue.VehicleTypeCarriageCode;
    this.tw.VehicleTypeCarriageDesc = frmValue.VehicleTypeCarriageDesc;
    this.tw.VehicleTypeId = frmValue.VehicleTypeId;
    this.tw.VehicleBrandCode = frmValue.CvBrandCode;
    this.tw.VehicleBrandDesc = frmValue.CvBrandDesc;
    this.tw.VehicleModelCode = frmValue.CvModelCode;
    this.tw.VehicleModelDesc = frmValue.CvModelDesc;
    this.tw.VehicleVarientCode = frmValue.CvVariantCode;
    this.tw.VehicleVarientDesc = frmValue.CvVariantDesc;
    this.tw.VehicleRegistrationYrCode = frmValue.RegistrationYearCode;
    this.tw.VehicleRegistrationYrDesc = frmValue.RegistrationYearDesc;
    this.tw.VehicleFuelCode = frmValue.FuelCode;
    this.tw.VehicleFuelDesc = frmValue.FuelDesc;

    // Code by jayam
    this.tw.CubicCapacity = frmValue.CubicCapacity;
    this.tw.SeatingCapacity = frmValue.SeatingCapacity ? frmValue.SeatingCapacity : 0;
    this.tw.VariantName = frmValue.VariantName;
    // Code by jayam end
    this.tw.VehicleRTOCode = frmValue.RTOCode;
    this.tw.VehicleRTODesc = frmValue.RTODisplayName;
    this.tw.edit = 0;
    this.tw.PrvPolicyExCode = frmValue.isPreviousPolicyExp;
    this.tw.PrvPolicyExDesc =
      this.tw.PrvPolicyExCode == EYesNo.YES
        ? EYesNo[EYesNo.YES]
        : EYesNo[EYesNo.NO];
    if (this.tw.PrvPolicyExCode == 1) {
      this.tw.VehicleExpiryCode = frmValue.CarExpiryCode;
      this.tw.VehicleExpiryDesc = this.policyExpireDisplayValue;
    } else {
      this.tw.VehicleExpiryCode = 0;
      this.tw.VehicleExpiryDesc = "";
    }
    this.tw.ClaimPrvPolicyCode = frmValue.claimInPreviousYear;
    this.tw.ClaimPrvPolicyDesc =
      this.tw.ClaimPrvPolicyCode == EYesNo.YES
        ? EYesNo[EYesNo.YES]
        : EYesNo[EYesNo.NO];

    this.tw.VehicleNoKnowDesc = EYesNo[EYesNo.NO];
    // sessionStorage.setItem("CVData", JSON.stringify(this.tw));
    this.manageFilters(
      this.tw.PrvPolicyExCode,
      this.tw.ClaimPrvPolicyCode,
      this.tw.VehicleExpiryCode
    );

  }
  private manageFilters(
    prvPloicyExpCode: number,
    claimInPrvPolicyCode: number,
    expInd: number
  ) {

    // prvPloicyExpCode=1: YES it expired, claimInPrvPolicyCode=1: Yes claimed
    if (prvPloicyExpCode == 1) {
      switch (expInd) {
        case 7:
        case 5: {
          // for expired within 90 days and // not sure when it expires
          // this.setMinDays = 90;
          // this.setMaxDays = 2;
          this.setMinDays = 90;
          this.setMaxDays = -1;
          this.isMoreThan90 = false;
          if (claimInPrvPolicyCode == 1) {
            this.ncbInput.setValue("0");
            this.isNcbEditable = false;
          } else {
            this.ncbInput.setValue("0");
            this.isNcbEditable = true;
          }
          break;
        }
        case 6: {
          // for expired more than 90 days
          this.ncbInput.setValue("0");
          // this.isNcbEditable = false;
          this.isMoreThan90 = true;
          // this.setMinDays = 0;
          // this.setMaxDays = -90;
          this.setMinDays = 365 * 19; // set date back to 19 years
          this.setMaxDays = 90;
          break;
        }
        default: {
          break;
        }
      }
    } else {
      // this.setMinDays = 0;
      // this.setMaxDays = 0;
      this.setMinDays = 0;
      this.setMaxDays = 45;
      this.isMoreThan90 = false;
      if (claimInPrvPolicyCode == 1) {
        this.ncbInput.setValue("0");
        this.isNcbEditable = false;
      } else {
        this.ncbInput.setValue("0");
        this.isNcbEditable = true;
      }
    }

    // if(this.tw !=null){
    //     if(this.renewcvForm.value.claimInPreviousYear=="0"){
    //         this.tw.NCBValue= "25";
    //     }
    //     else{
    //         //console.log(this.plan.PolicyExpiryDate);
    //         this.tw.PreviousPolicyExpiryDate= convertToMydate(this.prvPolicyExDate.value);
    //         //console.log(this.tw.PreviousPolicyExpiryDate);

    //         this.tw.NCBValue= this.plan.ncb;
    //     }
    // }

    this.openModalDialog();
  }
  onClickOkPrvPolicyModal(): any {
    //
    this.ncbExpDateErrMsg = "";
    if (this.prvPolicyExDate.invalid) {
      this.ncbExpDateErrMsg = "Please select valid date";
      return false;
    } else if (this.isNcbEditable && this.popupActive != "ncb") {
      this.popupActive = "ncb";
    } else if (this.popupActive == "ncb" && this.ncbInput.invalid) {
      this.ncbExpDateErrMsg = "Please select your previous NCB";
      return false;
    } else {
      this.plan.PolicyExpiryDate = this.prvPolicyExDate.value;
      // if (this.isNcbEditable) {
      // const selectedNcb = this.ncbList.find(
      //     (item) => item.value == this.ncbInput.value
      // );
      // if (
      //     selectedNcb &&
      //     selectedNcb.id != this.ncbList[this.ncbList.length - 1].id
      // ) {
      //     const ncb = this.ncbList.find((item) =>
      //         this.getSelected(item, (selectedNcb.id + 1).toString())
      //     ).value;
      //     this.ncbInput.setValue(ncb);
      //     this.plan.ncb = ncb;
      // }
      //console.log(this.tw);
      // }

      if (this.tw != null) {
        if (this.renewCVForm.value.claimInPreviousYear == "0") {
          this.tw.PreviousNCB = this.ncbInput.value;
          if (+this.ncbInput.value != 50) {
            this.tw.CurrentNCB =
              +this.ncbInput.value != 0
                ? String(
                  +this.ncbInput.value == 25 || +this.ncbInput.value == 35
                    ? +this.ncbInput.value + 10
                    : +this.ncbInput.value + 5
                )
                : "20";
          } else this.tw.CurrentNCB = this.ncbInput.value;
        } else {
          this.tw.PreviousNCB = "0";

          if (+this.ncbInput.value != 50) {
            this.tw.CurrentNCB =
              +this.ncbInput.value != 0
                ? String(
                  +this.ncbInput.value == 25 || +this.ncbInput.value == 35
                    ? +this.ncbInput.value + 10
                    : +this.ncbInput.value + 5
                )
                : "20";
          } else this.tw.CurrentNCB = this.ncbInput.value;
        }

        // if (this.renewcvForm.value.claimInPreviousYear == "0") {
        //     this.tw.NCBValue = "25";
        // } else {
        //     this.tw.NCBValue = this.ncbInput.value;
        // }
        this.tw.PreviousPolicyExpiryDate = convertToMydate(
          this.prvPolicyExDate.value
        );
      }
      this.closeModalDialog();


      this.displayPolicyType = true;
      // this._subscriptions.push(
      // this._posHomeService
      //   .getPolicyExpiryType(
      //     this.insuranceType.InsuranceCateCode,
      //     this.tw.SubCateCode,
      //     this.tw.VehicleRegistrationYrDesc
      //   )
      //   .subscribe((data) => {
      //     if (data.successcode == "1" && data.data) {
      //       this.policyTypeList = data.data;
      //       console.log(this.policyTypeList);
      //     }
      //   })
      this._subscriptions.push(
        this._posHomeService
          .getPolicyExpiryType(
            this.insuranceType.InsuranceCateCode,
            this.tw.SubCateCode,
            this.tw.VehicleRegistrationYrDesc
          )
          .subscribe((data) => {
            if (data.successcode == "0") {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = "";
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "PosHome";
              this.errorLogDetails.MethodName = "GetPreviousPolicyType";
              this.errorLogDetails.ErrorCode = data.successcode;
              this.errorLogDetails.ErrorDesc = data.msg;
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  console.log(res);
                });
            }

            if (data.successcode == "1" && data.data) {
              this.policyTypeList = data.data;
              console.log(this.policyTypeList);
            }
          })
      );
    }
  }

  onClickPreviousPolicyTab(type: string): any {
    this.ncbExpDateErrMsg = "";
    if (this.popupActive == "date" && this.prvPolicyExDate.invalid) {
      this.ncbExpDateErrMsg = "Please select valid date";
      return false;
    } else if (this.isNcbEditable == false && this.popupActive == "ncb")
      return false;

    this.popupActive = type;
  }
  onClickPreviousPolicyType(policy: any) {
    this.displayPolicyType = false;
    if (policy && policy != "") {
      this.tw.PreviousPolicyTypeCode = policy.PolicyTypeCode;
      this.tw.PreviousPolicyTypeDesc = policy.PolicyTypeDesc;
      this.CallApiForCarrierType();

      if (this.tw.VehicleTypeCarriageCode == 1) this.displayCarrierType = "block";
      // sessionStorage.setItem("CVData", JSON.stringify(this.tw));
      else this.displayVehicleOwnedBy = 'block';
      // this.viewPolicy(this.tw);
    }
    // this.displayCarrierType = 'block'

  }

  CallApiForCarrierType() {
    this._subscriptions.push(
      this._posHomeService.GetVehicleUse().subscribe((result) => {
        if (result.successcode == "0") {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "CommercialVehicle";
          this.errorLogDetails.MethodName = "GetVehicleUse";
          this.errorLogDetails.ErrorCode = result.successcode;
          this.errorLogDetails.ErrorDesc = result.msg;
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              console.log(res);
            });
        }
        this.carrierTypeList = result.data.Table;
        this.vehicleOwnedBy = result.data.Table1;
        console.log(this.carrierTypeList);
      })
    )
    // this.displayCarrierType ="block";
  }

  onChooseVehicleCarrierType(CarrierType: any) {
    console.log(CarrierType);

    if (CarrierType && CarrierType != "") {
      this.tw.VehicleUseCode = CarrierType.VehicleUseCode;
      this.tw.VehicleUseDesc = CarrierType.VehicleUseDesc;
    }
    this.displayCarrierType = "none";
    this.displayVehicleOwnedBy = 'block';

  }
  onChooseVehicleOwnedBy(ownedBy: any) {
    console.log(ownedBy);

    if (ownedBy && ownedBy != "") {
      this.tw.OwnedByCode = ownedBy.OwnedByCode;
      this.tw.OwnedByDesc = ownedBy.OwnedByDesc;
    }
    this.displayVehicleOwnedBy = 'none';
    this.viewPolicy(this.tw);
  }
  private viewPolicy(vehicleData: IApplicationVehicleData) {
    //console.log("vehicleData", vehicleData);

    sessionStorage.setItem("CVData", JSON.stringify(vehicleData));
    // this.btnDisable = this.showLoader = true;
    this._subscriptions.push(
      this._posHomeService.saveQuates(vehicleData).subscribe(
        (result) => {
          this.showLoader = false;
          if (result.successcode == "1") {
            console.log(result.data);
            const ApplicationNo = encrypt(`${result.data[0].ApplicationNo}`);
            const ApplicationNoOdp = encrypt(
              `${result.data[0].ApplicationNoOdp}`
            );
            this._router.navigate([
              `/cv-insurance/best-plans/`,
              ApplicationNo,
              ApplicationNoOdp,
            ]);
            // this._router.navigate(['/cv-insurance/best-plans'], { queryParams: { 'ApplicationNo': result.data[0].ApplicationNo, 'ApplicationNoOdp': result.data[0].ApplicationNoOdp } });
          } else {
            // if(result.successcode == "0" ){
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "VehicleData";
            this.errorLogDetails.MethodName = "SaveApplicationData";
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });
            // }
            this._errorHandleService._toastService.warning(result.msg);
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    )
  }
  openModalDialog() {
    this.display = "block"; //Set block css

  }
  closeModalDialog() {
    this.display = "none"; //set none css after close dialog
    this.displayCarrierType = "none";
    this.displayVehicleOwnedBy = "none"
  }

  onSubmitNewCV(): any {

    this.errMsg = "";
    if (this.newCVForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    // let tw = new ApplicationVehicleData();

    const frmValue = this.newCVForm.value;
    // let tw = new ApplicationVehicleData();
    //Cv 
    this.tw.CVehicleTypeCode = frmValue.RecordNoforCvVehicleType;
    this.tw.CVehicleDesc = frmValue.CvVehicleType;
    // this.tw.CVehicleDesc = frmValue.CvVehicleType;
    this.tw.VehicleTypeCarriageCode = frmValue.VehicleTypeCarriageCode;
    this.tw.VehicleTypeCarriageDesc = frmValue.VehicleTypeCarriageDesc;

    //Cv
    this.tw.VehicleBrandCode = frmValue.CvBrandCode;
    this.tw.VehicleBrandDesc = frmValue.CvBrandDesc;
    this.tw.VehicleModelCode = frmValue.CvModelCode;
    this.tw.VehicleModelDesc = frmValue.CvModelDesc;
    this.tw.VehicleVarientCode = frmValue.CvVariantCode;
    this.tw.VehicleVarientDesc = frmValue.CvVariantDesc;
    this.tw.VehicleRegistrationYrCode = frmValue.RegistrationYearCode;
    this.tw.VehicleRegistrationYrDesc = frmValue.RegistrationYearDesc;
    this.tw.VehicleFuelCode = frmValue.FuelCode;
    this.tw.VehicleFuelDesc = frmValue.FuelDesc;
    this.tw.VehicleTypeId = frmValue.VehicleTypeId;

    this.tw.CubicCapacity = frmValue.CubicCapacity;
    this.tw.SeatingCapacity = frmValue.SeatingCapacity;
    this.tw.VariantName = frmValue.VariantName;
    this.tw.CvVehicleType = frmValue.CvVehicleType;
    this.tw.VehicleRTOCode = frmValue.RTOCode;
    this.tw.VehicleRTODesc = frmValue.RTODisplayName;
    this.tw.edit = 0;
    this.tw.InsuranceCateCode = this.insuranceType.InsuranceCateCode;
    this.tw.InsuranceCateDesc = this.insuranceType.InsuranceCateDesc;
    this.tw.SubCateCode = this.policySubType.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateCode;
    this.tw.SubCateDesc = this.policySubType.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateDesc;

    this.tw.PrvPolicyExDesc = EYesNo[EYesNo.NO];
    this.tw.ClaimPrvPolicyDesc = EYesNo[EYesNo.NO];
    this.tw.VehicleNoKnowDesc = EYesNo[EYesNo.NO];

    // localStorage.setItem('tw2', JSON.stringify(tw));
    // this.viewPolicy(tw);
    this.CallApiForCarrierType();
    if (this.tw.VehicleTypeCarriageCode == 1) this.displayCarrierType = "block";
    // sessionStorage.setItem("CVData", JSON.stringify(this.tw));
    else this.displayVehicleOwnedBy = 'block';
    // this.CallApiForCarrierType();
  }
  onSubmitKnowBikeNo() {

  }

  editCarData() {

    //console.log(this.policyType);

    if (this.vData && this.vData.edit == 1) {
      this.openByMe = this.vData.SubCateDesc;
      //console.log(this.openBy);

      if (this.openByMe == "Renew Policy") {
        this.renewCVForm.patchValue({
          CvDisplayValue:
            this.vData.CVehicleDesc +
            "," +
            this.vData.VehicleBrandDesc +
            ", " +
            this.vData.VehicleModelDesc +
            ", " +
            this.vData.VehicleVarientDesc +
            ", " +
            this.vData.VehicleRegistrationYrDesc,

          RecordNoforCvVehicleType: this.vData.CVehicleTypeCode,
          CvVehicleType: this.vData.CVehicleDesc,
          VehicleTypeCarriageCode: this.vData.VehicleTypeCarriageCode,
          VehicleTypeCarriageDesc: this.vData.VehicleTypeCarriageDesc,
          VehicleUseCode: this.vData.VehicleUseCode,
          VehicleUseDesc: this.vData.VehicleUseDesc,

          CvBrandCode: this.vData.VehicleBrandCode,
          CvModelCode: this.vData.VehicleModelCode,
          CvVariantCode: this.vData.VehicleVarientCode,
          RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
          FuelCode: this.vData.VehicleFuelCode,
          CarExpiryCode: this.vData.VehicleExpiryCode,

          CvBrandDesc: this.vData.VehicleBrandDesc,
          CvModelDesc: this.vData.VehicleModelDesc,
          CvVariantDesc: this.vData.VehicleVarientDesc,
          RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,
          FuelDesc: this.vData.VehicleFuelDesc,
          isPreviousPolicyExp: this.vData.PrvPolicyExCode,

          RTODisplayName: this.vData.VehicleRTODesc,
          RTOCode: this.vData.VehicleRTOCode,
          claimInPreviousYear: this.vData.ClaimPrvPolicyCode,
        });

        this.policyExpireDisplayValue = this.vData.VehicleExpiryDesc;

        this.prvPolicyExDate.setValue(
          new Date(this.vData.PreviousPolicyExpiryDate)
        );
        //this.prvPolicyExDate.value =vData.PreviousPolicyExpiryDate);
        //console.log(this.prvPolicyExDate);
        this.ncbInput.setValue(this.vData.NCBValue);
      } else {
        //console.log(this.openBy);

        if (this.openByMe == "New") {
          this.newCVForm.patchValue({
            CvDisplayValue:
              this.vData.CVehicleDesc +
              "," +
              this.vData.VehicleBrandDesc +
              ", " +
              this.vData.VehicleModelDesc +
              ", " +
              this.vData.VehicleVarientDesc +
              ", " +
              this.vData.VehicleRegistrationYrDesc,
            RecordNoforCvVehicleType: this.vData.CVehicleTypeCode,
            CvVehicleType: this.vData.CVehicleDesc,
            VehicleTypeCarriageCode: this.vData.VehicleTypeCarriageCode,
            VehicleTypeCarriageDesc: this.vData.VehicleTypeCarriageDesc,
            VehicleUseCode: this.vData.VehicleUseCode,
            VehicleUseDesc: this.vData.VehicleUseDesc,
            CvBrandCode: this.vData.VehicleBrandCode,
            CvModelCode: this.vData.VehicleModelCode,
            CvVariantCode: this.vData.VehicleVarientCode,
            RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
            CvBrandDesc: this.vData.VehicleBrandDesc,
            CvModelDesc: this.vData.VehicleModelDesc,
            CvVariantDesc: this.vData.VehicleVarientDesc,
            RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,
            FuelDesc: this.vData.VehicleFuelDesc,
            FuelCode: this.vData.VehicleFuelCode,

            RTODisplayName: this.vData.VehicleRTODesc,
            RTOCode: this.vData.VehicleRTOCode,
          });
          this.policyType = this.vData.SubCateCode;
        }
      }
    }
  }
}
