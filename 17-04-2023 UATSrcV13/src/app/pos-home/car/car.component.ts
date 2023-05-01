import { OnInit, Component, ViewChild, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { yesNoList, MASKS, NCBList } from "src/app/models/common";
import { EYesNo, InsuranceCategories } from "src/app/models/insurance.enum";
import {
  IInsuranceSubType,
  IInsuranceType,
  IApplicationVehicleData,
  ApplicationVehicleData,
  IList,
  errorLog,
  IYesNoInd,
  IPreviousPolicyExpiryType,
  IRtos,
} from "src/app/models/common.Model";
import { encrypt, convertToMydate, decrypt } from "src/app/models/common-functions";
import { PosHomeService } from "../services/pos-home.service";
import { VehicleRtoComponent } from "src/app/shared/components/vehicle-rtos/vehicle-rtos.component";
import { PolicyExpiredComponent } from "src/app/shared/components/policy-expired/policy-expired.component";
import { CarInfoModel } from "src/app/models/car-insu.Model";
import { CarModelVariantComponent } from "src/app/shared/components/car-model-variant/car-model-variant.component";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { IFilterVehiclePlan } from "src/app/models/bike-insu.Model";
import { PolicyType } from "src/app/models/car-insu.Model";
import { map, startWith, take } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { ValidatorsService } from "src/app/pos-insurance/services/validators.service";

@Component({
  selector: "car",
  templateUrl: "./car.component.html",
  styleUrls: ["../pos-home.component.css"],
})
export class CarComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];
  //#region objects and lists
  // for accessing other component
  @ViewChild("carModel", { static: false })
  private carModelCmp!: CarModelVariantComponent;
  @ViewChild("vehicleRtos", { static: false })
  private rtoCmp!: VehicleRtoComponent;
  @ViewChild("policyExpire", { static: false })
  private policyCmp!: PolicyExpiredComponent;

  //all list objects
  yesNoList = yesNoList;
  yesno = EYesNo;
  policySubType: IInsuranceSubType[] = [];
  public PrvPolRemyesNoList: IYesNoInd[] = yesNoList;
  // conditional properties
  showLoader: boolean = false; //for showing loader
  knowCarNumber: boolean = false;
  displayRtoPopup: any = false;
  displayCarModelPopup: any = false;
  showExpiredPolicy = false;
  minDate!: Date;
  maxDate!: Date;
  policyType: number = 3;
  prvPolicyRememberDesc: string = "Yes";
  popupActive = "date";
  ncbList = NCBList;
  prvPolicyExDate = new FormControl(new Date(), [Validators.required]);
  prvPolicyRememberCode: number = 1;
  ncbInput = new FormControl("", [Validators.required]);
  isNcbEditable = true;
  previousPolicyExpiryType!: IPreviousPolicyExpiryType[]; // by sourabh
  plan: IFilterVehiclePlan = {
    isTPPD: false,
    isComprehensive: false,
    isTp: true,
    isOd: "",
    idvType: 0,
    previousNcb: "0",
    currentNcb: "0",
    zeroDp: false,
    paCover: false,
    tppdCover: false,
    isMultiYear: { id: 0, value: "" },
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
    Owner_Driver_PA_Cover_Other_Value: null
  };
  vData = JSON.parse(sessionStorage.getItem("CarData")!);
  tw = new ApplicationVehicleData();

  //values properties
  insuranceType!: IInsuranceType | any;
  policyExpireDisplayValue: string = "";
  public openBy: string = "";
  public errMsg = "";

  //reactive form objects
  renewCarForm: FormGroup;
  newCarForm: FormGroup;
  knowCarNoForm: FormGroup;

  btnDisable = false;
  ncbExpDateErrMsg!: string;
  displayPolicyType!: boolean;
  openByMe: any;
  date: string = convertToMydate(new Date());
  //#endregion
  todayDate = new Date();
  isMoreThan90!: boolean;
  display = "none";
  rtosList: any;
  filteredRtoList!: Observable<IRtos[]>;
  // private set setMinDays(days: number) {
  //   if (days != 0) {
  //     const dt = new Date();
  //     this.minDate = new Date(
  //       +dt.getFullYear(),
  //       +dt.getMonth(),
  //       +dt.getDate() - days
  //     );
  //   }
  // }
  // private set setMaxDays(days: number) {
  //   if (days != 0) {
  //     const dt = new Date();
  //     this.maxDate = new Date(
  //       +dt.getFullYear(),
  //       +dt.getMonth(),
  //       +dt.getDate() + days
  //     );
  //   }
  // }
  prvPolicyExpDateforMoreThn90Days() {


    this.prvPolicyExDate.patchValue(
      new Date(
        +this.todayDate.getFullYear(),
        +this.todayDate.getMonth(),
        (+this.todayDate.getDate())
      )
    )
    console.log(this.prvPolicyExDate)
  }
  private set setMinDays(days: number) {
    //console.log(days);

    if (days == 0) {
      const dt = new Date();
      //console.log("mindays0" + dt);

      this.minDate = new Date(+dt.getFullYear(), +dt.getMonth(), +dt.getDate());

      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewCarForm.value.isPreviousPolicyExp
        &&
        this.vData.prvPolicyRememberCode == 0
      ) {
        const md = this.vData.PreviousPolicyExpiryDate.split("/");
        this.prvPolicyExDate.patchValue(
          new Date(md[1] + "/" + md[0] + "/" + md[2])
        );
      } else {
        this.prvPolicyExDate.patchValue(this.minDate);
      }
    }
    // 
    else if (days == 365) {
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
        this.renewCarForm.value.isPreviousPolicyExp
        &&
        this.vData.prvPolicyRememberCode == 0
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
      // t.setMonth(0)
      console.log("mindays" + t.getDate());

      if (this.renewCarForm.value.CarExpiryCode === 0 || this.renewCarForm.value.CarExpiryCode === "") {
        this.minDate = new Date(
          +t.getFullYear(),
          +t.getMonth(),
          +t.getDate()
        );
      } else if (this.renewCarForm.value.CarExpiryCode === 5) {
        this.minDate = new Date(
          +t.getFullYear(),
          +t.getMonth(),
          +t.getDate() - days
        );
      } else {
        // (this.renewCarForm.value.RegistrationYearDesc)
        this.minDate = new Date(
          +t.getFullYear() - (+t.getFullYear() - Number(this.renewCarForm.value.RegistrationYearDesc)),
          0,
          1
        );
      }

      console.log(this.minDate, Number(this.renewCarForm.value.RegistrationYearDesc.split(0)[1]));

      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewCarForm.value.isPreviousPolicyExp &&
        this.vData.VehicleExpiryCode == this.renewCarForm.value.CarExpiryCode
        &&
        this.vData.prvPolicyRememberCode == 0
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
    //console.log(days);

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

      const v = this.renewCarForm.value;
      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewCarForm.value.isPreviousPolicyExp &&
        this.renewCarForm.value.CarExpiryCode == this.vData.VehicleExpiryCode
        && this.vData.prvPolicyRememberCode == 0
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
      //console.log("maxdays" + t);

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
    private _errorHandleService: ErrorHandleService,
    fb: FormBuilder,
    private _toastrService: ToastrService
  ) {
    this.renewCarForm = fb.group({
      CarDisplayValue: ["", Validators.required],
      CarBrandCode: ["", Validators.required],
      CarModelCode: ["", Validators.required],
      CarVariantCode: ["", Validators.required],
      RegistrationYearCode: ["", Validators.required],
      isPreviousPolicyExp: ["", Validators.required],
      claimInPreviousYear: ["", Validators.required],
      CarExpiryCode: [""],
      RTOCode: ["", Validators.required],
      RTODisplayName: ["", Validators.required],
      FuelCode: [""],

      CarBrandDesc: "",
      CarModelDesc: "",
      CarVariantDesc: "",
      RegistrationYearDesc: "",
      FuelDesc: [""],
      CubicCapacity: "",
      SeatingCapacity: "",
      VariantName: "",
    });
    this.newCarForm = fb.group({
      CarDisplayValue: ["", Validators.required],
      CarBrandCode: ["", Validators.required],
      CarModelCode: ["", Validators.required],
      CarVariantCode: ["", Validators.required],
      RegistrationYearCode: ["", Validators.required],
      RTOCode: ["", Validators.required],
      RTODisplayName: ["", Validators.required],
      FuelCode: ["", Validators.required],

      CarBrandDesc: "",
      CarModelDesc: "",
      CarVariantDesc: "",
      RegistrationYearDesc: "",
      FuelDesc: [""],
      RTOName: "",
      CubicCapacity: "",
      SeatingCapacity: "",
      VariantName: "",
    });
    this.knowCarNoForm = fb.group({
      carNo: ["", Validators.required],
      isPreviousPolicyExp: ["", Validators.required],
      CarExpiryCode: [""],
      claimInPreviousYear: ["", Validators.required],
    });
  }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;
  ngOnInit(): void {
    this.link = window.location.hash.split('/');
    this.userName = decrypt(sessionStorage.getItem("User Name")!);
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    // this.insuranceType = JSON.parse(
    //   sessionStorage.getItem("insuranceType")
    // ) as IInsuranceType;
    // if (
    //   (!this.insuranceType && isNaN(this.insuranceType.InsuranceCateCode)) ||
    //   this.insuranceType.InsuranceCateCode < 1
    // ) {
    //   this._router.navigate(["/pos"]);
    // }
    this._subscriptions.push(this._posHomeService.insuranceTypeMenu.pipe(take(1)).subscribe((apiRes) => {

      if (apiRes.successcode == "0" || apiRes.successcode == null) {
        this.errorLogDetails.UserCode = this.posMobileNo;
        this.errorLogDetails.ApplicationNo = "";
        this.errorLogDetails.CompanyName = "";
        this.errorLogDetails.ControllerName = "PosHome"
        this.errorLogDetails.MethodName = 'GetInsuranceType';
        this.errorLogDetails.ErrorCode = apiRes.successcode ? apiRes.successcode : "0";
        this.errorLogDetails.ErrorDesc = apiRes.msg ? apiRes.msg : "Something went wrong.";
        this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
          //console.log(res)
        })
      }
      let insuranceMenu: IInsuranceType[] = apiRes.data;
      this.insuranceType = insuranceMenu.find(
        (type) => type.InsuranceCateCode === InsuranceCategories.CAR
      );
      //console.log(this.insuranceType);
      this.getSubType(this.insuranceType.InsuranceCateCode);
      this.editCarData();
    }))
    this.getRto(this.insuranceType.InsuranceCateCode);
  }

  public mask = MASKS.VEHICLENO;

  //#region privte methods to connect with server
  private getSubType(insuranceCateCode: number) {
    this.showLoader = true;
    this._subscriptions.push(
      this._posHomeService.getPolicyType(insuranceCateCode).subscribe(
        (result) => {
          this.showLoader = false;
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "PosHome";
            this.errorLogDetails.MethodName = 'GetInsuranceSubType';
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              //console.log(res)
            })
          }
          if (result.successcode == "1") {
            this.policySubType = result.data;
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    )

  }
  private resetForm() {
    this.policyExpireDisplayValue = "";
    this.carModelCmp.reset();
    this.rtoCmp.selectedValue = "";
    this.policyCmp.selectedValue = "";
    this.openBy = "";
    this.errMsg = "";
  }
  //#endregion

  //#region click and other events

  public onPolicyExpiredChange(event: number, openBy: string) {
    if (event == 1) {
      // this._errorHandleService._toastService.warning("Please Select No to proceed","Breaking case not integrated")
      // this.renewCarForm.patchValue({isPreviousPolicyExp:''});
      this.showExpiredPolicy = true;
      this.openBy = openBy;
    } else {
      this.policyExpireDisplayValue = "";
      this.policyCmp.selectedValue = "";
    }
  }
  public closePolicyExpiredPopup(event: string) {
    this.showExpiredPolicy = false;
    if (this.openBy == "renewCarForm") {
      if (event)
        this.renewCarForm.controls["CarExpiryCode"].setValue(+event.split(",")[0]);
      else {
        this.renewCarForm.patchValue({
          CarExpiryCode: "",
          isPreviousPolicyExp: "",
        });
      }
    }
    if (this.openBy == "knowCarNoForm") {
      if (event)
        this.knowCarNoForm.controls["CarExpiryCode"].setValue(
          +event.split(",")[0]
        );
      else {
        this.knowCarNoForm.patchValue({
          CarExpiryCode: "",
          isPreviousPolicyExp: "",
        });
      }
    }
    this.policyExpireDisplayValue = event.split(",")[1];
    this.openBy = "";
  }
  public onTypeChange(type: number) {
    this.carModelCmp.reset();
    this.carModelCmp.carFormData = {
      CarBrandCode: 0,
      CarBrandDesc: "",
      CarModelCode: 0,
      CarModelDesc: "",
      CarVariantCode: 0,
      CarVariantDesc: "",
      RegistrationYearCode: 0,
      RegistrationYearDesc: "",
      FuelCode: 0,
      FuelTypeDesc: "",
      CubicCapacity: 0,
      SeatingCapacity: 0,
      VariantName: ""
    };
    if (type == 3) {
      this.knowCarNumber = false;
      this.renewCarForm.reset();
      this.rtoCmp.RTOCode.patchValue("");
    }
    if (type == 4) {
      this.newCarForm.reset();
      this.rtoCmp.RTOCode.patchValue("");
    }
    this.getRto(this.insuranceType.InsuranceCateCode);
    sessionStorage.removeItem("CarData");
    this.resetForm();
  }

  public havePrevPolicyDetailsChange(type: number) {
    debugger
    if (type == 1) {
      //this.knowBikeNumber = false
      // this.prvPolicyRememberCode = 1;;
      this.prvPolicyRememberDesc = "Yes";
      this.renewCarForm.get('isPreviousPolicyExp')!.enable();
      // this.rtoCmp.RTOCode.patchValue("");
    }
    else if (type == 0) {
      //    this.prvPolicyRememberCode = 0;
      this.prvPolicyRememberDesc = "No";
      this.renewCarForm.get('isPreviousPolicyExp')!.disable();

    } else {
      this._toastrService.error(
        "Please select yes or no for, Do you remember previous policy details? ",
        ""
        // { positionClass: "toast-top", timeOut: 5000 }
      );
    }
    console.log(this.prvPolicyRememberCode, this.prvPolicyRememberDesc)
    sessionStorage.removeItem("VehicleData");
    this.resetForm();
  }


  public onClickKnowCarNo() {
    this.knowCarNumber = !this.knowCarNumber;
    if (this.knowCarNumber) {
      this.knowCarNoForm.reset();
    } else {
      this.renewCarForm.reset();
    }
    this.resetForm();
  }
  public onClickCar(openBy: string) {
    this.openBy = openBy;
    this.displayCarModelPopup = true;
  }
  public closeCarModelVariantPopup(event: CarInfoModel) {
    if (event) {
      if (this.openBy == "renewCarForm") {
        this.renewCarForm.patchValue({
          CarDisplayValue:
            event.CarBrandDesc +
            ", " +
            event.CarModelDesc +
            ", " +
            event.CarVariantDesc +
            ", " +
            event.RegistrationYearDesc,
          CarBrandCode: event.CarBrandCode,
          CarModelCode: event.CarModelCode,
          CarVariantCode: event.CarVariantCode,
          RegistrationYearCode: event.RegistrationYearCode,
          FuelCode: event.FuelCode,

          CarBrandDesc: event.CarBrandDesc,
          CarModelDesc: event.CarModelDesc,
          CarVariantDesc: event.CarVariantDesc,
          RegistrationYearDesc: event.RegistrationYearDesc,
          FuelDesc: event.FuelTypeDesc,
          CubicCapacity: event.CubicCapacity,
          SeatingCapacity: event.SeatingCapacity,
          VariantName: event.VariantName,
        });
      }
      if (this.openBy == "newCarForm") {
        this.newCarForm.patchValue({
          CarDisplayValue:
            event.CarBrandDesc +
            ", " +
            event.CarModelDesc +
            ", " +
            event.CarVariantDesc +
            ", " +
            event.RegistrationYearDesc,
          CarBrandCode: event.CarBrandCode,
          CarModelCode: event.CarModelCode,
          CarVariantCode: event.CarVariantCode,
          RegistrationYearCode: event.RegistrationYearCode,
          FuelCode: event.FuelCode,

          CarBrandDesc: event.CarBrandDesc,
          CarModelDesc: event.CarModelDesc,
          CarVariantDesc: event.CarVariantDesc,
          RegistrationYearDesc: event.RegistrationYearDesc,
          FuelDesc: event.FuelTypeDesc,
          CubicCapacity: event.CubicCapacity,
          SeatingCapacity: event.SeatingCapacity,
          VariantName: event.VariantName,
        });
      }
    }
    this.displayCarModelPopup = false;
    this.openBy = "";
  }

  get rf() {
    return this.renewCarForm
  }

  get nf() {
    return this.newCarForm
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
      if (this.policyType == 3) {
        this.renewCarForm.get("RTOCode")!.patchValue(rto.RTOCode);
        console.log(selected)
      }
      else if (this.policyType == 4) {
        this.newCarForm.get("RTOCode")!.patchValue(rto.RTOCode);
        console.log(selected)
      } else {
        console.log(rto)
      }
    }
  }
  private getRto(InsuranceCateCode: any) {
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
            if (this.policyType == 4) {
              this.filteredRtoList = this.newCarForm.controls["RTODisplayName"].valueChanges.pipe(
                startWith(""),
                map((value) => this._filter(value))
              );
            }
            else {
              debugger
              this.filteredRtoList = this.renewCarForm.controls["RTODisplayName"].valueChanges.pipe(
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
    if (this.policyType == 3) {
      this.rf.get("RTODisplayName")!.setValidators([Validators.required, ValidatorsService.rtoValidators(this.rtosList)])
      this.rf.get("RTODisplayName")!.updateValueAndValidity();
    }

    if (this.policyType == 4) {

      this.nf.get("RTODisplayName")!.setValidators([Validators.required, ValidatorsService.rtoValidators(this.rtosList)])
      this.nf.get("RTODisplayName")!.updateValueAndValidity();
    }

  }
  public closeRtosPopup(selected: string) {
    this.displayRtoPopup = false;
    if (selected) {
      if (this.openBy == "renewCarForm") {
        this.renewCarForm.patchValue({
          RTOCode: +selected.split(",")[0],
          RTODisplayName: selected.split(",")[1],
        });
      }
      if (this.openBy == "newCarForm") {
        this.newCarForm.patchValue({
          RTOCode: +selected.split(",")[0],
          RTODisplayName: selected.split(",")[1],
        });
      }
    }
    if (this.vData && !selected && this.vData.edit == 1) {
      this.renewCarForm.patchValue({
        RTODisplayName: this.vData.VehicleRTODesc,
        RTOCode: this.vData.VehicleRTOCode,
      });
      this.newCarForm.patchValue({
        RTODisplayName: this.vData.VehicleRTODesc,
        RTOCode: this.vData.VehicleRTOCode,
      });
    }
    this.tw.VehicleRTODesc = selected.split(",")[1];
    this.openBy = "";
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

  private getSelected(row: IList, id: string) {
    return row.id.toString() == id;
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
        if (this.renewCarForm.value.claimInPreviousYear == "0") {
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

        // if (this.renewCarForm.value.claimInPreviousYear == "0") {
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
      this._subscriptions.push(
        this._posHomeService
          .getPolicyExpiryType(
            this.insuranceType.InsuranceCateCode,
            this.tw.SubCateCode,
            this.tw.VehicleRegistrationYrDesc
          )
          .subscribe((data) => {
            if (data.successcode == "0" || data.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = "";
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "PosHome";
              this.errorLogDetails.MethodName = 'GetPreviousPolicyType';
              this.errorLogDetails.ErrorCode = data.successcode ? data.successcode : "0";
              this.errorLogDetails.ErrorDesc = data.msg ? data.msg : 'Something went wrong.';
              this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                //console.log(res)
              })
            }

            if (data.successcode == "1" && data.data) {
              this.previousPolicyExpiryType = data.data;
              //console.log(this.policyTypeList);
            }
          })
      )

    }
  }

  // by sourabh

  openModalDialog() {
    this.display = "block"; //Set block css
  }

  closeModalDialog() {
    this.display = "none"; //set none css after close dialog
  }
  onClickPreviousPolicyType(policy: any) {
    this.displayPolicyType = false;
    // if (policy && policy != "") {
    //   this.tw.PreviousPolicyTypeCode = policy.PolicyTypeCode;
    //   this.tw.PreviousPolicyTypeDesc = policy.PolicyTypeDesc;
    //   this.viewPolicy(this.tw);
    // }
    if (policy != "") {
      if (this.prvPolicyRememberCode == 1) {

        this.tw.PreviousPolicyTypeCode = policy["PolicyTypeCode"];
        this.tw.PreviousPolicyTypeDesc = policy["PolicyTypeDesc"];
        this.viewPolicy(this.tw);
      } else {
        this.tw.PreviousPolicyTypeCode = policy["PolicyTypeCode"];
        this.tw.PreviousPolicyTypeDesc = policy["PolicyTypeDesc"];
        this.viewPolicy(this.tw);
      }
    }
  }
  // by sourabh end

  private manageFilters(
    prvPloicyExpCode: number,
    claimInPrvPolicyCode: number,
    expInd: number
  ) {
    debugger
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
        } case 4: { //this case generated for only if customer don't remember previous details.

          // If user don't remember previous policy details 
          //So we make breakin case by default.
          this.ncbInput.setValue("0");
          this.isMoreThan90 = true;

          this.setMinDays = 365 * 19; // set date back to 19 years
          this.setMaxDays = 90;
          this.GetPolicyExpiryType()
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
    //     if(this.renewCarForm.value.claimInPreviousYear=="0"){
    //         this.tw.NCBValue= "25";
    //     }
    //     else{
    //         //console.log(this.plan.PolicyExpiryDate);
    //         this.tw.PreviousPolicyExpiryDate= convertToMydate(this.prvPolicyExDate.value);
    //         //console.log(this.tw.PreviousPolicyExpiryDate);

    //         this.tw.NCBValue= this.plan.ncb;
    //     }
    // }

    if (this.prvPolicyRememberCode != 0) {
      this.openModalDialog()
    }
    if (this.tw.VehicleExpiryCode == 1) this.prvPolicyExpDateforMoreThn90Days();

  }

  GetPolicyExpiryType() {

    this.displayPolicyType = true;
    this._subscriptions.push(
      this._posHomeService
        .getPolicyExpiryType(
          this.insuranceType.InsuranceCateCode,
          this.tw.SubCateCode,
          this.tw.VehicleRegistrationYrDesc ||
          this.vData.VehicleRegistrationYrDesc
        )
        .subscribe((result) => {
          console.log("success===>", result)
          if (result.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = 'PosHome'
            this.errorLogDetails.MethodName = 'GetPreviousPolicyType'
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          }
          if (result.successcode == "1" && result.data != null) {

            this.previousPolicyExpiryType = result.data;
          }
          return false;
        })
    );
  }

  onSubmitRenewCar(): any {
    debugger
    this.errMsg = "";
    if (this.renewCarForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    if (this.renewCarForm.get("isPreviousPolicyExp")!.value == EYesNo.YES && this.prvPolicyRememberCode == 1) {
      if (!this.renewCarForm.get("CarExpiryCode")!.value) {
        this.onPolicyExpiredChange(1, "renewCarForm");

        this.errMsg = "Please fill all details correctly.";
        return false;
      }
    }

    const frmValue = this.renewCarForm.value;

    this.tw.InsuranceCateCode = this.insuranceType.InsuranceCateCode;
    this.tw.InsuranceCateDesc = this.insuranceType.InsuranceCateDesc;
    this.tw.SubCateCode = this.policySubType.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateCode;
    this.tw.SubCateDesc = this.policySubType.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateDesc;

    this.tw.VehicleBrandCode = frmValue.CarBrandCode;
    this.tw.VehicleBrandDesc = frmValue.CarBrandDesc;
    this.tw.VehicleModelCode = frmValue.CarModelCode;
    this.tw.VehicleModelDesc = frmValue.CarModelDesc;
    this.tw.VehicleVarientCode = frmValue.CarVariantCode;
    this.tw.VehicleVarientDesc = frmValue.CarVariantDesc;
    this.tw.VehicleRegistrationYrCode = frmValue.RegistrationYearCode;
    this.tw.VehicleRegistrationYrDesc = frmValue.RegistrationYearDesc;
    this.tw.VehicleFuelCode = frmValue.FuelCode;
    this.tw.VehicleFuelDesc = frmValue.FuelDesc;
    // Code by jayam
    this.tw.CubicCapacity = frmValue.CubicCapacity;
    this.tw.SeatingCapacity = frmValue.SeatingCapacity;
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
    if (this.tw.PrvPolicyExCode == 1 && this.prvPolicyRememberCode != 0) {
      this.tw.VehicleExpiryCode = frmValue.CarExpiryCode;
      this.tw.VehicleExpiryDesc = this.policyExpireDisplayValue;
    } else if (this.tw.PrvPolicyExCode == 1 && this.prvPolicyRememberCode == 0) {
      //when user don't remember policy 
      this.tw.VehicleExpiryCode = 2;
      this.tw.VehicleExpiryDesc = "Expired more than 90 days";
    }
    else {
      this.tw.VehicleExpiryCode = 0;
      this.tw.VehicleExpiryDesc = "";
    }
    this.tw.ClaimPrvPolicyCode = frmValue.claimInPreviousYear;
    this.tw.ClaimPrvPolicyDesc =
      this.tw.ClaimPrvPolicyCode == EYesNo.YES
        ? EYesNo[EYesNo.YES]
        : EYesNo[EYesNo.NO];

    this.tw.VehicleNoKnowDesc = EYesNo[EYesNo.NO];

    // this.manageFilters(
    //   this.tw.PrvPolicyExCode,
    //   this.tw.ClaimPrvPolicyCode,
    //   this.tw.VehicleExpiryCode
    // );
    this.tw.PrvPolicyRememberCode = this.prvPolicyRememberCode;
    this.tw.PrvPolicyRememberDesc = this.prvPolicyRememberDesc;
    if (this.tw.SubCateCode == 3 && this.prvPolicyRememberCode == 1) {
      this.manageFilters(
        this.tw.PrvPolicyExCode,
        this.tw.ClaimPrvPolicyCode,
        this.tw.VehicleExpiryCode
      );
    } else if (this.tw.SubCateCode == 3 && this.prvPolicyRememberCode == 0) {
      // In case of user do'nt remember previous details 

      this.manageFilters(1,//this.twoWheeler.PrvPolicyExCode,
        this.tw.ClaimPrvPolicyCode,
        4
      );
    }
    // localStorage.setItem('this.tw', JSON.stringify(''));

    // this.viewPolicy(this.tw);
  }
  onSubmitKnowCarNo(): any {
    this.errMsg = "";
    if (this.knowCarNoForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    if (this.knowCarNoForm.get("isPreviousPolicyExp")!.value == EYesNo.YES) {
      if (!this.knowCarNoForm.get("CarExpiryCode")!.value) {
        this.onPolicyExpiredChange(1, "knowCarNoForm");
        this.errMsg = "Please fill all details correctly.";
        return false;
      }
    }

    this.knowCarNoForm.patchValue({
      carNo: this.knowCarNoForm.value.carNo.replace(/-/g, ""),
    });
    const frmValue = this.knowCarNoForm.value;
    let tw = new ApplicationVehicleData();
    tw.VehicleNo = frmValue.carNo;
    //console.log(tw.VehicleNo + " , " + frmValue.carNo);
    // first check vehicle number exist
    this.btnDisable = this.showLoader = true;
    this._subscriptions.push(
      this._posHomeService.getVehicleInfoByNumber(frmValue.carNo).subscribe(
        (result: any): any => {
          //for our server
          this.btnDisable = this.showLoader = false;
          if (result.successcode == "1") {
            const data = JSON.parse(result.data.vehicleJson);
            tw.Description = data.Description;
            tw.EngineSize = data.EngineSize.CurrentTextValue;
            tw.VechileIdentificationNumber = data.VechileIdentificationNumber;
            tw.EngineNumber = data.EngineNumber;
            tw.RegistrationDate = new Date(data.RegistrationDate);
            tw.Owner = data.Owner;
            tw.Fitness = data.Fitness;
            tw.InsuranceDate = data.Insurance;
            tw.Location = data.Location;
            tw.ImageUrl = data.ImageUrl;
            tw.VehicleRegistrationYrDesc = data.RegistrationYear;

            tw.VehicleNoKnowCode = this.knowCarNumber ? EYesNo.YES : EYesNo.NO;
            tw.VehicleNoKnowDesc = this.knowCarNumber
              ? EYesNo[EYesNo.YES]
              : EYesNo[EYesNo.NO];

            tw.InsuranceCateCode = this.insuranceType.InsuranceCateCode;
            tw.InsuranceCateDesc = this.insuranceType.InsuranceCateDesc;
            tw.SubCateCode = this.policySubType.filter(
              (item: IInsuranceSubType) => item.SubCateCode == this.policyType
            )[0].SubCateCode;
            tw.SubCateDesc = this.policySubType.filter(
              (item: IInsuranceSubType) => item.SubCateCode == this.policyType
            )[0].SubCateDesc;

            tw.PrvPolicyExCode = frmValue.isPreviousPolicyExp;
            tw.PrvPolicyExDesc =
              tw.PrvPolicyExCode == EYesNo.YES
                ? EYesNo[EYesNo.YES]
                : EYesNo[EYesNo.NO];
            if (tw.PrvPolicyExCode == 1) {
              tw.VehicleExpiryCode = frmValue.CarExpiryCode;
              tw.VehicleExpiryDesc = this.policyExpireDisplayValue;
            } else {
              tw.VehicleExpiryCode = 0;
              tw.VehicleExpiryDesc = "";
            }

            tw.ClaimPrvPolicyCode = frmValue.claimInPreviousYear;
            tw.ClaimPrvPolicyDesc =
              tw.ClaimPrvPolicyCode == EYesNo.YES
                ? EYesNo[EYesNo.YES]
                : EYesNo[EYesNo.NO];

            // this.viewPolicy(tw);
          } else {
            this.onClickCar("renewCarForm");
            this.knowCarNumber = false;
            this.renewCarForm.patchValue({
              isPreviousPolicyExp: this.knowCarNoForm.get("isPreviousPolicyExp")!
                .value,
              claimInPreviousYear: this.knowCarNoForm.get("claimInPreviousYear")!
                .value,
              CarExpiryCode: this.knowCarNoForm.get("CarExpiryCode")!.value,
            });
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = "";
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "Bike";
              this.errorLogDetails.MethodName = 'GetBikeDetails';
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                //console.log(res)
              })
            }
            return false;
          }
        },
        (err: any) => {
          this.btnDisable = this.showLoader = false;
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "Bike";
          this.errorLogDetails.MethodName = 'GetBikeDetails';
          this.errorLogDetails.ErrorCode = "0";
          this.errorLogDetails.ErrorDesc = "Something went wrong."
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            //console.log(res)
          })
          this._errorHandleService.handleError(err);
          return false;
        }
      )
    )

  }
  onSubmitNewCar(): any {
    ////console.log(this.newCarForm.value)
    //
    this.errMsg = "";
    if (this.newCarForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    // let tw = new ApplicationVehicleData();

    const frmValue = this.newCarForm.value;
    let tw = new ApplicationVehicleData();

    tw.VehicleBrandCode = frmValue.CarBrandCode;
    tw.VehicleBrandDesc = frmValue.CarBrandDesc;
    tw.VehicleModelCode = frmValue.CarModelCode;
    tw.VehicleModelDesc = frmValue.CarModelDesc;
    tw.VehicleVarientCode = frmValue.CarVariantCode;
    tw.VehicleVarientDesc = frmValue.CarVariantDesc;
    tw.VehicleRegistrationYrCode = frmValue.RegistrationYearCode;
    tw.VehicleRegistrationYrDesc = frmValue.RegistrationYearDesc;
    tw.VehicleFuelCode = frmValue.FuelCode;
    tw.VehicleFuelDesc = frmValue.FuelDesc;
    // Code by jayam
    tw.CubicCapacity = frmValue.CubicCapacity;
    tw.SeatingCapacity = frmValue.SeatingCapacity;
    tw.VariantName = frmValue.VariantName;
    // Code by jayam end
    tw.VehicleRTOCode = frmValue.RTOCode;
    tw.VehicleRTODesc = frmValue.RTODisplayName;
    tw.edit = 0;
    tw.InsuranceCateCode = this.insuranceType.InsuranceCateCode;
    tw.InsuranceCateDesc = this.insuranceType.InsuranceCateDesc;
    tw.SubCateCode = this.policySubType.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateCode;
    tw.SubCateDesc = this.policySubType.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateDesc;

    tw.PrvPolicyExDesc = EYesNo[EYesNo.NO];
    tw.ClaimPrvPolicyDesc = EYesNo[EYesNo.NO];
    tw.VehicleNoKnowDesc = EYesNo[EYesNo.NO];

    // localStorage.setItem('tw2', JSON.stringify(tw));
    this.viewPolicy(tw);
  }
  private viewPolicy(vehicleData: IApplicationVehicleData) {
    //console.log("vehicleData", vehicleData);
    const remeberPolicyObj = { PrvPolicyRememberCode: this.tw.PrvPolicyRememberCode, PrvPolicyRememberDesc: this.tw.PrvPolicyRememberDesc }
    sessionStorage.setItem("rememberPreviousPolicy", JSON.stringify(remeberPolicyObj));
    sessionStorage.setItem("CarData", JSON.stringify(vehicleData));
    // this.btnDisable = this.showLoader = true;
    this._subscriptions.push(
      this._posHomeService.saveQuates(vehicleData).subscribe(
        (result) => {
          this.showLoader = false;
          if (result.successcode == "1") {
            const ApplicationNo = encrypt(`${result.data[0].ApplicationNo}`);
            const ApplicationNoOdp = encrypt(
              `${result.data[0].ApplicationNoOdp}`
            );
            this._router.navigate([
              `/car-insurance/best-plans/`,
              ApplicationNo,
              ApplicationNoOdp,
            ]);
            // this._router.navigate(['/car-insurance/best-plans'], { queryParams: { 'ApplicationNo': result.data[0].ApplicationNo, 'ApplicationNoOdp': result.data[0].ApplicationNoOdp } });
          } else {
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = "";
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "Bike";
              this.errorLogDetails.MethodName = 'GetBikeDetails';
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                //console.log(res)
              })
            }
            this._errorHandleService._toastService.warning(result.msg);
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    )


    // if (!this.knowCarNumber) {
    //     this._router.navigate(['/car/' + 'test1234']);
    // } else {
    //     const carNo = this.knowCarNoForm.controls['carNo'].value;
    //     if (carNo) {
    //         this._router.navigate(['/car/' + carNo.trim()]);
    //     }
    // }
  }
  //#endregion

  editCarData() {
    //
    //console.log(this.policyType);

    if (this.vData && this.vData.edit == 1) {
      this.openByMe = this.vData.SubCateDesc;
      //console.log(this.openBy);

      if (this.openByMe == "Renew Policy") {
        this.renewCarForm.patchValue({
          CarDisplayValue:
            this.vData.VehicleBrandDesc +
            ", " +
            this.vData.VehicleModelDesc +
            ", " +
            this.vData.VehicleVarientDesc +
            ", " +
            this.vData.VehicleRegistrationYrDesc,
          CarBrandCode: this.vData.VehicleBrandCode,
          CarModelCode: this.vData.VehicleModelCode,
          CarVariantCode: this.vData.VehicleVarientCode,
          RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
          FuelCode: this.vData.VehicleFuelCode,
          CarExpiryCode: this.vData.VehicleExpiryCode,
          CubicCapacity: this.vData.CubicCapacity,
          SeatingCapacity: this.vData.SeatingCapacity,
          CarBrandDesc: this.vData.VehicleBrandDesc,
          CarModelDesc: this.vData.VehicleModelDesc,
          CarVariantDesc: this.vData.VehicleVarientDesc,
          RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,
          FuelDesc: this.vData.VehicleFuelDesc,
          isPreviousPolicyExp: this.vData.PrvPolicyExCode,
          VariantName: this.vData.VariantName,
          RTODisplayName: this.vData.VehicleRTODesc,
          RTOCode: this.vData.VehicleRTOCode,
          claimInPreviousYear: this.vData.ClaimPrvPolicyCode,
        });

        this.policyExpireDisplayValue = this.vData.VehicleExpiryDesc;

        this.prvPolicyExDate.setValue(
          new Date(this.vData.PreviousPolicyExpiryDate)
        );
        //   this.prvPolicyExDate.value =vData.PreviousPolicyExpiryDate);
        //console.log(this.prvPolicyExDate);
        this.ncbInput.setValue(this.vData.NCBValue);
        this.prvPolicyRememberCode = this.vData.PrvPolicyRememberCode
        this.prvPolicyRememberDesc = this.vData.PrvPolicyRememberDesc
        if (this.vData.PrvPolicyRememberCode != 0) {
          this.renewCarForm.get('isPreviousPolicyExp')!.enable();
          const md = this.vData.PreviousPolicyExpiryDate.split("/");
          this.prvPolicyExDate.patchValue(md[0] + "/" + md[1] + "/" + md[2]);
          this.ncbInput.setValue(this.vData.NCBValue);
        } else {
          this.renewCarForm.get('isPreviousPolicyExp')!.disable();
        }
      } else {
        //console.log(this.openBy);

        if (this.openByMe == "New Car") {
          this.newCarForm.patchValue({
            CarDisplayValue:
              this.vData.VehicleBrandDesc +
              ", " +
              this.vData.VehicleModelDesc +
              ", " +
              this.vData.VehicleVarientDesc +
              ", " +
              this.vData.VehicleRegistrationYrDesc,
            CarBrandCode: this.vData.VehicleBrandCode,
            CarModelCode: this.vData.VehicleModelCode,
            CarVariantCode: this.vData.VehicleVarientCode,
            RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
            CarBrandDesc: this.vData.VehicleBrandDesc,
            CarModelDesc: this.vData.VehicleModelDesc,
            CarVariantDesc: this.vData.VehicleVarientDesc,
            RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,
            FuelDesc: this.vData.VehicleFuelDesc,
            FuelCode: this.vData.VehicleFuelCode,
            CubicCapacity: this.vData.CubicCapacity,
            SeatingCapacity: this.vData.SeatingCapacity,
            RTODisplayName: this.vData.VehicleRTODesc,
            RTOCode: this.vData.VehicleRTOCode,
            VariantName: this.vData.VariantName,
          });
          this.policyType = this.vData.SubCateCode;
        }
      }
    }
  }
  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
}
