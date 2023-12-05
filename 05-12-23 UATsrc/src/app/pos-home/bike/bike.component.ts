import { errorLog, IInsuranceCompany, IList, IPreviousPolicyExpiryType, IRtos, IYesNoInd } from "./../../models/common.Model";
import { NCBList } from "./../../models/common";
import { IFilterVehiclePlan } from "./../../models/bike-insu.Model";
import { OnInit, Component, ViewChild, OnDestroy } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { yesNoList, PATTERN, MASKS } from "src/app/models/common";
import {
  IInsuranceSubType,
  IInsuranceType,
  IApplicationVehicleData,
  ApplicationVehicleData,
} from "src/app/models/common.Model";
import { convertToMydate, encrypt } from "src/app/models/common-functions";
import { EYesNo, InsuranceCategories } from "src/app/models/insurance.enum";
import { PosHomeService } from "../services/pos-home.service";
import { BikeInfoModel } from "src/app/models/bike-insu.Model";
import { BikeModelVariantComponent } from "src/app/shared/components/bike-model-variant/bike-model-variant.component";
import { VehicleRtoComponent } from "src/app/shared/components/vehicle-rtos/vehicle-rtos.component";
import { PolicyExpiredComponent } from "src/app/shared/components/policy-expired/policy-expired.component";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { map, startWith, take } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { ApiResponse } from "src/app/models/api.model";
import { forkJoin, Observable } from "rxjs";
import { MatAutocomplete } from "@angular/material/autocomplete";
import { ValidatorsService } from "src/app/pos-insurance/services/validators.service";
import * as moment from "moment";




@Component({
  selector: "bike",
  templateUrl: "./bike.component.html",
  styleUrls: ["../pos-home.component.css"],
})
export class BikeComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];

  //#region objects and lists
  @ViewChild("bikeModel", { static: false })
  private bikeModelCmp!: BikeModelVariantComponent;
  // @ViewChild("vehicleRtos", { static: false })
  // private rtoCmp: VehicleRtoComponent;
  @ViewChild("policyExpire", { static: false })
  private policyCmp!: PolicyExpiredComponent;


  @ViewChild("rtoOption", { static: false })
  autoRtoRewNewBike!: MatAutocomplete;

  public yesNoList: IYesNoInd[] = yesNoList;
  public PrvPolRemyesNoList: IYesNoInd[] = yesNoList;
  policySubTypeList: IInsuranceSubType[] = [];
  edit: number = 0;
  showLoader: boolean = false; //for showing loader
  knowBikeNumber: boolean = false;
  displayRtoPopup: any = false;
  displayBikeModelPopup: any = false;
  showExpiredPolicy = false;
  showpolicyType = false;
  policyType: number = 1;
  prvPolicyRememberCode: number = 1;
  prvPolicyRememberDesc: string = "Yes";

  prponcb: number = 1;
  insuranceType!: IInsuranceType | any;
  policyExpireDisplayValue: string = "";
  public openBy: string = "";
  public errMsg = "";
  ToKnowType!: boolean;
  renewBikeForm: FormGroup;
  newBikeForm: FormGroup;
  knowBikeNoForm: FormGroup;
  pattterB = "/(([A-Za-z]){2}([0-9]){2}([A-Za-z]){2}([0-9]){4})/g";
  // RegistrationDate = new Date();
  vehicleData: IApplicationVehicleData = new ApplicationVehicleData();
  btnDisable = false;
  //#endregion
  minDate!: Date;
  maxDate!: Date;
  isNcbEditable = true;
  popupActive = "date";
  todayDate = new Date();
  ncbInput = new FormControl("", [Validators.required]);
  prvPolicyExDate = new FormControl(new Date(), [Validators.required]);
  ncbList = NCBList;
  yesno = EYesNo;
  rtosList: IRtos[] = [];
  filteredRtoList!: Observable<IRtos[]>;
  // RTOCode = new FormControl();
  plan: IFilterVehiclePlan = {
    isTPPD: false,
    isComprehensive: false,
    isTp: true,
    isOd: "",
    idvType: 0,
    currentNcb: "0",
    previousNcb: "0",
    zeroDp: false,
    paCover: false,
    Owner_Driver_PA_Cover_Other_Value: null,
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
    SubCateDesc: ""
  };
  previousPolicyExpiryType!: IPreviousPolicyExpiryType[];
  previousPolicyCompanyList!: IInsuranceCompany[];


  openByMe: any;
  date: string = convertToMydate(new Date());
  vData = JSON.parse(sessionStorage.getItem("VehicleData")!);
  isMoreThan90!: boolean;
  display = "none";

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

    console.log(days);

    if (days == 0) {
      const dt = new Date();
      // console.log("mindays0" + dt);
      this.minDate = new Date(+dt.getFullYear(), +dt.getMonth(), +dt.getDate());
      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewBikeForm.value.isPreviousPolicyExp &&
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
        this.renewBikeForm.value.isPreviousPolicyExp &&
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

      // this.minDate = new Date(
      //   +t.getFullYear(),
      //   +t.getMonth(),
      //   +t.getDate() - days
      // );
      if (this.renewBikeForm.value.BikeExpiryCode === 0
        || this.renewBikeForm.value.BikeExpiryCode === "") {
        this.minDate = new Date(
          +t.getFullYear(),
          +t.getMonth(),
          +t.getDate()
        );
      } else if (this.renewBikeForm.value.BikeExpiryCode === 1) {
        this.minDate = new Date(
          +t.getFullYear(),
          +t.getMonth(),
          +t.getDate() - days
        );
      } else {
        // (this.renewCarForm.value.RegistrationYearDesc)
        this.minDate = new Date(
          +t.getFullYear() - (+t.getFullYear() - Number(this.renewBikeForm.value.RegistrationYearDesc)),
          0,
          1
        );
      }
      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewBikeForm.value.isPreviousPolicyExp &&
        this.vData.VehicleExpiryCode == this.renewBikeForm.value.BikeExpiryCode
        && this.vData.prvPolicyRememberCode == 0
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

      if (
        this.vData &&
        this.vData.PrvPolicyExCode ==
        this.renewBikeForm.value.isPreviousPolicyExp &&
        this.renewBikeForm.value.BikeExpiryCode == this.vData.VehicleExpiryCode
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
    private _errorHandleService: ErrorHandleService,
    private _toastrService: ToastrService,
    private _validatorService: ValidatorsService,
    fb: FormBuilder // public dialog: MatDialog
  ) {
    this.renewBikeForm = fb.group({
      BikeDisplayValue: ["", Validators.required],
      BikeBrandCode: ["", Validators.required],
      BikeModelCode: ["", Validators.required],
      BikeVariantCode: ["", Validators.required],
      RegistrationYearCode: ["", Validators.required],
      RegistrationYearDesc: "",
      RegistrationDate: ["", Validators.required],

      isPreviousPolicyExp: ["", Validators.required],
      BikeExpiryCode: [""],
      claimInPreviousYear: ["", Validators.required],
      RTOCode: ["", Validators.required],
      RTODisplayName: ["", Validators.required],
      BikeBrandDesc: "",
      BikeModelDesc: "",
      BikeVariantDesc: "",
      VehicleFuelCode: "",
      VehicleFuelDesc: "",
      CubicCapacity: "",
      SeatingCapacity: "",
    });
    this.newBikeForm = fb.group({
      BikeDisplayValue: ["", Validators.required],
      BikeBrandCode: ["", Validators.required],
      BikeModelCode: ["", Validators.required],
      BikeVariantCode: ["", Validators.required],

      RegistrationYearCode: ["", Validators.required],
      RegistrationYearDesc: "",
      RegistrationDate: [moment(new Date()), Validators.required],

      RTOCode: ["", Validators.required],
      RTODisplayName: ["", Validators.required],
      BikeBrandDesc: "",
      BikeModelDesc: "",
      BikeVariantDesc: "",
      VehicleFuelCode: "",
      VehicleFuelDesc: "",
      CubicCapacity: "",
      SeatingCapacity: "",
    });
    this.knowBikeNoForm = fb.group({
      bikeNo: [
        "",
        [
          Validators.required,
          Validators.maxLength(13),
          Validators.pattern(PATTERN.VEHICLENO),
        ],
      ],
      isPreviousPolicyExp: ["", Validators.required],
      BikeExpiryCode: [""],
      claimInPreviousYear: ["", Validators.required],
    });
  }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;

  ngOnInit(): void {
    this._subscriptions.push(
      this._posHomeService.insuranceTypeMenu
        .pipe(take(1))
        .subscribe((apiRes) => {
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
            (type) => type.InsuranceCateCode === InsuranceCategories.BIKE
          );
          //console.log(this.insuranceType);

          this.getSubType(this.insuranceType.InsuranceCateCode);
          this.EditData();
        })
    );
    this.getRto(this.insuranceType.InsuranceCateCode);
  }

  //by dilshad

  // By Jayam
  public mask = MASKS.VEHICLENO;
  // By Jayam end

  //#region private function to get data from server

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
            this.errorLogDetails.ControllerName = "PosHome/GetInsuranceSubType"
            this.errorLogDetails.MethodName = "GetInsuranceSubType";
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              //console.log(res)
            })
          }
          if (result.successcode == "1") {
            this.policySubTypeList = result.data;
            // for display prefiled data
            // if (localStorage.getItem('twoWheeler')) {
            //     this.fillData();
            // }
            // end
          }
        },
        (err: any) => {
          this.showLoader = false;
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "PosHome/GetInsuranceSubType"
          this.errorLogDetails.MethodName = "GetInsuranceSubType";
          this.errorLogDetails.ErrorCode = "0";
          this.errorLogDetails.ErrorDesc = "Something went wrong.Try again later.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            //console.log(res)
          })
          this._errorHandleService.handleError(err);
        }
      )
    );
  }
  // getVehicleInfoByNumber(): boolean {
  //     // if (this.knowBikeNoForm.get('bikeNo').valid) {
  //     const bikeNumber = this.knowBikeNoForm.get('bikeNo').value;
  //     let found = false;
  //     this._posHomeService.getVehicleInfoByNumber(bikeNumber).subscribe((result) => { //for our server
  //         if (result.successcode == '1') {

  //             const data = JSON.parse(result.data.vehicleJson);
  //             this.vehicleData.EngineSize = data.EngineSize.CurrentTextValue;
  //             this.vehicleData.VehicleIdentityNo = data.VechileIdentificationNumber;
  //             this.vehicleData.EngineNo = data.EngineNumber;
  //             this.vehicleData.RegistrationDate = data.RegistrationDate;
  //             this.vehicleData.OwnerName = data.Owner;
  //             this.vehicleData.VehicleFitness = data.Fitness;
  //             this.vehicleData.InsuranceDate = data.Insurance;
  //             //location_rto, img, FuelType, ModelDescription, MakeDescription, CarModel, CarMake
  //             //RegistrationYear
  //             found = true;
  //         }
  //     }, (err: any) => {
  //         this.showLoader = false;
  //         this._errorHandleService.handleError(err);
  //         found = false;
  //     });
  //     // }
  //     return found;
  // }

  private resetForm() {
    this.bikeModelCmp.reset();
    // this.rtoCmp.selectedValue = "";
    this.policyCmp.selectedValue = "";
    this.policyExpireDisplayValue = "";
    this.openBy = "";
    this.vehicleData = new ApplicationVehicleData();
    this.errMsg = "";
  }

  get rf() {
    return this.renewBikeForm
  }

  get nf() {
    return this.newBikeForm
  }

  //#endregion

  //#region  click and other events

  public onPolicyExpiredChange(event: number, openBy: string) {
    if (event == 1) {
      // this._errorHandleService._toastService.warning("Please Select No to proceed","Breaking case not integrated")
      // this.renewBikeForm.patchValue({isPreviousPolicyExp:''});
      this.showExpiredPolicy = true;
      this.openBy = openBy;
    } else {
      this.prvPolicyExDate.setValue("");
      this.policyCmp.selectedValue = "";
      this.policyExpireDisplayValue = "";
    }
  }
  public closePolicyExpiredPopup(event: string) {
    this.showExpiredPolicy = false;
    if (this.openBy == "renewBikeForm") {
      if (event) {
        this.renewBikeForm.controls["BikeExpiryCode"].setValue(
          +event.split(",")[0]
        );
      } else {
        this.renewBikeForm.patchValue({
          BikeExpiryCode: "",
          isPreviousPolicyExp: "",
        });
      }
    }
    if (this.openBy == "knowBikeNoForm") {
      if (event)
        this.knowBikeNoForm.controls["BikeExpiryCode"].setValue(
          +event.split(",")[0]
        );
      else {
        this.knowBikeNoForm.patchValue({
          BikeExpiryCode: "",
          isPreviousPolicyExp: "",
        });
      }
    }
    this.policyExpireDisplayValue = event.split(",")[1];
    this.openBy = "";
  }
  closePolicyExpiredTypePopup(data: any) {
    debugger;
    this.showpolicyType = false;
    if (data != "") {
      if (this.prvPolicyRememberCode == 1) {
        console.log(data);
        this.twoWheeler.PreviousPolicyTypeCode = data["policyExpiredType"]["PolicyTypeCode"];
        this.twoWheeler.PreviousPolicyTypeDesc = data["policyExpiredType"]["PolicyTypeDesc"];
        this.twoWheeler.PrvInsurerCode = data["previousPolicyExpiredCompany"]["InsuranceCompanyCode"];
        this.twoWheeler.PrvInsurerName = data["previousPolicyExpiredCompany"]["InsuranceCompanyDesc"];
        this.viewPolicy(this.twoWheeler);
      } else {


        this.twoWheeler.PreviousPolicyTypeCode = data["PolicyTypeCode"];
        this.twoWheeler.PreviousPolicyTypeDesc = data["PolicyTypeDesc"];
        this.viewPolicy(this.twoWheeler);
      }
    }
  }
  public onTypeChange(type: number) {
    this.bikeModelCmp.bikeForm.reset();
    this.bikeModelCmp.bikeFormData = {
      BikeBrandCode: 0,
      BikeBrandDesc: "",
      BikeModelCode: 0,
      BikeModelDesc: "",
      BikeVariantCode: 0,
      BikeVariantDesc: "",
      RegistrationYearCode: 0,
      RegistrationYearDesc: "",
      RegistrationDate: "",
      CubicCapacity: 0,
      SeatingCapacity: 0,
      VehicleFuelDesc: "",
      VehicleFuelCode: 0
    };
    if (type == 1) {
      this.knowBikeNumber = false;
      this.renewBikeForm.reset();
      // this.rtoCmp.RTOCode.patchValue("");
    }
    if (type == 2) {
      this.newBikeForm.reset();
      // this.rtoCmp.RTOCode.patchValue("");
    }
    this.getRto(1);
    sessionStorage.removeItem("VehicleData");
    this.resetForm();
  }
  public onClickKnowBikeNo() {
    this.knowBikeNumber = !this.knowBikeNumber;
    if (this.knowBikeNumber) {
      this.knowBikeNoForm.reset();
    } else {
      this.renewBikeForm.reset();
    }
    this.resetForm();
  }
  public onClickInput(openBy: string) {
    this.openBy = openBy;
    this.displayBikeModelPopup = true;
  }

  public havePrevPolicyDetailsChange(type: number) {
    debugger
    if (type == 1) {
      //this.knowBikeNumber = false;
      // this.prvPolicyRememberCode = 1;
      this.prvPolicyRememberDesc = "Yes";
      this.renewBikeForm.get('isPreviousPolicyExp')!.enable();
      // this.rtoCmp.RTOCode.patchValue("");
    }
    else if (type == 0) {
      //    this.prvPolicyRememberCode = 0;
      this.prvPolicyRememberDesc = "No";
      this.renewBikeForm.get('isPreviousPolicyExp')!.disable();

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
  public closeBikeModelVariantPopup(event?: BikeInfoModel | null | undefined) {
    debugger
    if (event) {
      ////console.log(event);
      debugger
      if (this.openBy == "renewBikeForm") {
        this.renewBikeForm.patchValue({
          BikeDisplayValue:
            event.BikeBrandDesc +
            ", " +
            event.BikeModelDesc +
            ", " +
            event.BikeVariantDesc +
            ", " +
            event.RegistrationYearDesc,
          BikeBrandCode: event.BikeBrandCode,
          BikeModelCode: event.BikeModelCode,
          BikeVariantCode: event.BikeVariantCode,
          RegistrationYearCode: event.RegistrationYearCode,
          RegistrationYearDesc: event.RegistrationYearDesc,
          RegistrationDate: event.RegistrationDate,

          BikeBrandDesc: event.BikeBrandDesc,
          BikeModelDesc: event.BikeModelDesc,
          BikeVariantDesc: event.BikeVariantDesc,
          VehicleFuelCode: event.VehicleFuelCode,
          VehicleFuelDesc: event.VehicleFuelDesc,
          CubicCapacity: event.CubicCapacity,
          SeatingCapacity: event.SeatingCapacity,
        });
        ////console.log(this.renewBikeForm.value.RegistrationYearDesc);
      }

      if (this.openBy == "newBikeForm") {
        this.newBikeForm.patchValue({
          BikeDisplayValue:
            event.BikeBrandDesc +
            ", " +
            event.BikeModelDesc +
            ", " +
            event.BikeVariantDesc +
            ", " +
            event.RegistrationYearDesc,
          BikeBrandCode: event.BikeBrandCode,
          BikeModelCode: event.BikeModelCode,
          BikeVariantCode: event.BikeVariantCode,
          RegistrationYearCode: event.RegistrationYearCode,
          RegistrationYearDesc: event.RegistrationYearDesc,
          RegistrationDate: event.RegistrationDate,

          BikeBrandDesc: event.BikeBrandDesc,
          BikeModelDesc: event.BikeModelDesc,
          BikeVariantDesc: event.BikeVariantDesc,
          VehicleFuelCode: event.VehicleFuelCode,
          VehicleFuelDesc: event.VehicleFuelDesc,
          CubicCapacity: event.CubicCapacity,
          SeatingCapacity: event.SeatingCapacity,
        });
      }
    }
    this.displayBikeModelPopup = false;
    this.openBy = "";
  }

  private _filter(value: string): IRtos[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;

    return this.rtosList.filter((rtoData) =>
      rtoData.RTODisplayNameNew.toLowerCase().includes(filterBy)
    );
  }
  public onSelectRtos(selected: string) {

    const rto = this.rtosList.find((x: IRtos) => x.RTODisplayName.toLowerCase() === selected.toLowerCase())
    if (rto) {
      if (this.policyType === 1) {

        this.renewBikeForm.get("RTOCode")!.patchValue(rto.RTOCode);
        console.log(selected)
      }
      else if (this.policyType === 2) {
        this.newBikeForm.get("RTOCode")!.patchValue(rto.RTOCode);
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
          debugger
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


            if (this.policyType == 2) {
              this.filteredRtoList = this.newBikeForm.controls["RTODisplayName"].valueChanges.pipe(
                startWith(""),
                map((value) => this._filter(value))
              );
            } else {
              this.filteredRtoList = this.renewBikeForm.controls["RTODisplayName"].valueChanges.pipe(
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
    if (this.policyType == 1) {
      this.rf.get("RTODisplayName")!.setValidators([Validators.required, ValidatorsService.rtoValidators(this.rtosList)])
      this.rf.get("RTODisplayName")!.updateValueAndValidity();
    }

    if (this.policyType == 2) {

      this.nf.get("RTODisplayName")!.setValidators([Validators.required, ValidatorsService.rtoValidators(this.rtosList)])
      this.nf.get("RTODisplayName")!.updateValueAndValidity();
    }

  }
  public closeRtosPopup(selected: string) {
    this.displayRtoPopup = false;

    if (selected) {
      if (this.openBy == "renewBikeForm") {
        this.renewBikeForm.patchValue({
          RTOCode: +selected.split(",")[0],
          RTODisplayName: selected.split(",")[1],
        });
      }
      if (this.openBy == "newBikeForm") {
        this.newBikeForm.patchValue({
          RTOCode: +selected.split(",")[0],
          RTODisplayName: selected.split(",")[1],
        });
      }
    }
    if (this.vData && !selected && this.vData.edit == 1) {
      this.renewBikeForm.patchValue({
        RTODisplayName: this.vData.VehicleRTODesc,
        RTOCode: this.vData.VehicleRTOCode,
      });
      this.newBikeForm.patchValue({
        RTODisplayName: this.vData.VehicleRTODesc,
        RTOCode: this.vData.VehicleRTOCode,
      });
    }
    this.vehicleData.VehicleRTODesc = selected.split(",")[1];
    this.openBy = "";
  }

  //#endregion

  //#region FINAL SUBMIT  click
  twoWheeler!: ApplicationVehicleData | any;
  onSubmitRenewBike(): any {
    //
    debugger
    console.log(this.renewBikeForm);
    console.log(this.autoRtoRewNewBike);


    this.errMsg = "";
    if (this.renewBikeForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    if (this.renewBikeForm.get("isPreviousPolicyExp")!.value == EYesNo.YES && this.prvPolicyRememberCode == 1) {
      if (!this.renewBikeForm.get("BikeExpiryCode")!.value) {
        this.onPolicyExpiredChange(1, "renewBikeForm");
        this.errMsg = "Please fill all details correctly.";
        return false;
      }
    }

    const frmValue = this.renewBikeForm.value;
    this.twoWheeler = this.vehicleData;

    // twoWheeler.PosCode = 0;
    // twoWheeler.RMCode = 0;
    this.twoWheeler.VehicleBrandCode = frmValue.BikeBrandCode;
    this.twoWheeler.VehicleBrandDesc = frmValue.BikeBrandDesc;
    this.twoWheeler.VehicleModelCode = frmValue.BikeModelCode;
    this.twoWheeler.VehicleModelDesc = frmValue.BikeModelDesc;
    this.twoWheeler.VehicleVarientCode = frmValue.BikeVariantCode;
    this.twoWheeler.VehicleVarientDesc = frmValue.BikeVariantDesc;
    this.twoWheeler.VehicleRegistrationYrCode = frmValue.RegistrationYearCode;
    this.twoWheeler.VehicleRegistrationYrDesc = frmValue.RegistrationYearDesc;
    this.twoWheeler.RegistrationDate = convertToMydate(frmValue.RegistrationDate);
    // Added by jayam
    this.twoWheeler.VehicleFuelCode = frmValue.VehicleFuelCode;
    this.twoWheeler.VehicleFuelDesc = frmValue.VehicleFuelDesc;
    this.twoWheeler.CubicCapacity = frmValue.CubicCapacity;
    this.twoWheeler.SeatingCapacity = frmValue.SeatingCapacity;
    // Added by jayam end

    this.twoWheeler.InsuranceCateCode = this.insuranceType.InsuranceCateCode;
    this.twoWheeler.InsuranceCateDesc = this.insuranceType.InsuranceCateDesc;
    this.twoWheeler.SubCateCode = this.policySubTypeList.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateCode;
    this.twoWheeler.SubCateDesc = this.policySubTypeList.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateDesc;

    this.twoWheeler.PrvPolicyExCode = this.prvPolicyRememberCode == 0 ? 1 : frmValue.isPreviousPolicyExp;
    this.twoWheeler.PrvPolicyExDesc =
      this.twoWheeler.PrvPolicyExCode == EYesNo.YES
        ? EYesNo[EYesNo.YES]
        : EYesNo[EYesNo.NO];
    if (this.twoWheeler.PrvPolicyExCode == 1 && this.prvPolicyRememberCode != 0) {

      this.twoWheeler.VehicleExpiryCode = frmValue.BikeExpiryCode;
      this.twoWheeler.VehicleExpiryDesc = this.policyExpireDisplayValue;
    } else if (this.twoWheeler.PrvPolicyExCode == 1 && this.prvPolicyRememberCode == 0) {
      //when user don't remember policy 
      this.twoWheeler.VehicleExpiryCode = 2;
      this.twoWheeler.VehicleExpiryDesc = "Expired more than 90 days";
    } else {
      this.twoWheeler.VehicleExpiryCode = 0;
      this.twoWheeler.VehicleExpiryDesc = "";
    }



    this.twoWheeler.ClaimPrvPolicyCode = frmValue.claimInPreviousYear;
    this.twoWheeler.ClaimPrvPolicyDesc =
      this.twoWheeler.ClaimPrvPolicyCode == EYesNo.YES
        ? EYesNo[EYesNo.YES]
        : EYesNo[EYesNo.NO];


    this.twoWheeler.PolicyTenure = "1";

    this.twoWheeler.VehicleNoKnowDesc = EYesNo[EYesNo.NO];
    this.twoWheeler.VehicleRTOCode = frmValue.RTOCode;
    this.twoWheeler.VehicleRTODesc = frmValue.RTODisplayName;
    this.twoWheeler.edit = 0;
    this.twoWheeler.PrvPolicyRememberCode = this.prvPolicyRememberCode;
    this.twoWheeler.PrvPolicyRememberDesc = this.prvPolicyRememberDesc;
    if (this.twoWheeler.SubCateCode == 1 && this.prvPolicyRememberCode == 1) {
      this.manageFilters(
        this.twoWheeler.PrvPolicyExCode,
        this.twoWheeler.ClaimPrvPolicyCode,
        this.twoWheeler.VehicleExpiryCode
      );
    } else if (this.twoWheeler.SubCateCode == 1 && this.prvPolicyRememberCode == 0) {
      // In case of user do'nt remember previous details 

      this.manageFilters(1,//this.twoWheeler.PrvPolicyExCode,
        this.twoWheeler.ClaimPrvPolicyCode,
        4
      );
      // this.onClickOkPrvPolicyModal()
    }

    // this.viewPolicy(this.twoWheeler);
  }

  onSubmitKnowBikeNo(): any {
    this.errMsg = "";
    if (this.knowBikeNoForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    if (this.knowBikeNoForm.get("isPreviousPolicyExp")!.value == EYesNo.YES) {
      if (!this.knowBikeNoForm.get("BikeExpiryCode")!.value) {
        this.onPolicyExpiredChange(1, "knowBikeNoForm");
        this.errMsg = "Please fill all details correctly.";
        return false;
      }
    }
    this.btnDisable = this.showLoader = true;
    let twoWheeler = new ApplicationVehicleData();

    this.knowBikeNoForm.patchValue({
      bikeNo: this.knowBikeNoForm.value.bikeNo.replace(/-/g, ""),
    });
    const frmValue = this.knowBikeNoForm.value;
    this.vehicleData.VehicleNo = frmValue.bikeNo;
    twoWheeler = this.vehicleData;
    // first check vehicle number exist
    this._subscriptions.push(
      this._posHomeService.getVehicleInfoByNumber(frmValue.bikeNo).subscribe(
        (result: any): any => {
          //for our server
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "Bike"
            this.errorLogDetails.MethodName = "GetBikeDetails";
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              //console.log('errorLog -----=>', res)
            })
          }
          this.btnDisable = this.showLoader = false;
          if (result.successcode == "1") {
            const data = JSON.parse(result.data.vehicleJson);
            twoWheeler.Description = data.Description;
            twoWheeler.EngineSize = data.EngineSize.CurrentTextValue;
            twoWheeler.VechileIdentificationNumber =
              data.VechileIdentificationNumber;
            twoWheeler.EngineNumber = data.EngineNumber;
            twoWheeler.RegistrationDate = convertToMydate(data.RegistrationDate);
            twoWheeler.Owner = data.Owner;
            twoWheeler.Fitness = data.Fitness;
            twoWheeler.InsuranceDate = data.Insurance;
            twoWheeler.Location = data.Location;
            twoWheeler.ImageUrl = data.ImageUrl;
            twoWheeler.VehicleRegistrationYrDesc = data.RegistrationYear;

            twoWheeler.VehicleNo = frmValue.bikeNo;
            twoWheeler.VehicleNoKnowCode = frmValue.bikeNo
              ? EYesNo.YES
              : EYesNo.NO;
            twoWheeler.VehicleNoKnowDesc = frmValue.bikeNo
              ? EYesNo[EYesNo.YES]
              : EYesNo[EYesNo.NO];

            twoWheeler.InsuranceCateCode = this.insuranceType.InsuranceCateCode;
            twoWheeler.InsuranceCateDesc = this.insuranceType.InsuranceCateDesc;
            twoWheeler.SubCateCode = this.policySubTypeList.filter(
              (item: IInsuranceSubType) => item.SubCateCode == this.policyType
            )[0].SubCateCode;
            twoWheeler.SubCateDesc = this.policySubTypeList.filter(
              (item: IInsuranceSubType) => item.SubCateCode == this.policyType
            )[0].SubCateDesc;

            twoWheeler.PrvPolicyExCode = frmValue.isPreviousPolicyExp;
            twoWheeler.PrvPolicyExDesc =
              twoWheeler.PrvPolicyExCode == EYesNo.YES
                ? EYesNo[EYesNo.YES]
                : EYesNo[EYesNo.NO];
            if (twoWheeler.PrvPolicyExCode == 1) {
              twoWheeler.VehicleExpiryCode = frmValue.BikeExpiryCode;
              twoWheeler.VehicleExpiryDesc = this.policyExpireDisplayValue;
            } else {
              twoWheeler.VehicleExpiryCode = 0;
              twoWheeler.VehicleExpiryDesc = "";
            }
            twoWheeler.ClaimPrvPolicyCode = frmValue.claimInPreviousYear;
            twoWheeler.ClaimPrvPolicyDesc =
              twoWheeler.ClaimPrvPolicyCode == EYesNo.YES
                ? EYesNo[EYesNo.YES]
                : EYesNo[EYesNo.NO];

            this.viewPolicy(twoWheeler);
            sessionStorage.removeItem("VehicleData");
          } else {
            this.onClickInput("renewBikeForm");

            this.knowBikeNumber = false;
            this.renewBikeForm.patchValue({
              isPreviousPolicyExp: this.knowBikeNoForm.get(
                "isPreviousPolicyExp"
              )!.value,
              claimInPreviousYear: this.knowBikeNoForm.get(
                "claimInPreviousYear"
              )!.value,
              BikeExpiryCode: this.knowBikeNoForm.get("BikeExpiryCode")!.value,
            });
            return false;
          }
        },
        (err: any) => {
          this.btnDisable = this.showLoader = false;
          if (err.successcode == "0" || err.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "Bike"
            this.errorLogDetails.MethodName = "GetBikeDetails";
            this.errorLogDetails.ErrorCode = "0";
            this.errorLogDetails.ErrorDesc = "Something went Wrong.Try again later.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              //console.log('errorLog -----=>', res)
            })
          }
          this._errorHandleService.handleError(err);
          return false;
        }
      )
    );
  }

  onSubmitNewBike(): any {
    debugger
    this.errMsg = "";
    if (this.newBikeForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    this.btnDisable = true;
    let twoWheeler = new ApplicationVehicleData();
    const frmValue = this.newBikeForm.value;

    twoWheeler = this.vehicleData;
    twoWheeler.VehicleBrandCode = frmValue.BikeBrandCode;
    twoWheeler.VehicleBrandDesc = frmValue.BikeBrandDesc;
    twoWheeler.VehicleModelCode = frmValue.BikeModelCode;
    twoWheeler.VehicleModelDesc = frmValue.BikeModelDesc;
    twoWheeler.VehicleVarientCode = frmValue.BikeVariantCode;
    twoWheeler.VehicleVarientDesc = frmValue.BikeVariantDesc;
    twoWheeler.VehicleRegistrationYrCode = frmValue.RegistrationYearCode;
    twoWheeler.VehicleRegistrationYrDesc = frmValue.RegistrationYearDesc;
    twoWheeler.RegistrationDate = convertToMydate(frmValue.RegistrationDate);

    twoWheeler.InsuranceCateCode = this.insuranceType.InsuranceCateCode;
    twoWheeler.InsuranceCateDesc = this.insuranceType.InsuranceCateDesc;
    // Added by jayam
    twoWheeler.VehicleFuelCode = frmValue.VehicleFuelCode;
    twoWheeler.VehicleFuelDesc = frmValue.VehicleFuelDesc;
    twoWheeler.CubicCapacity = +frmValue.CubicCapacity;
    twoWheeler.SeatingCapacity = +frmValue.SeatingCapacity;
    // Added by jayam end
    twoWheeler.edit = 0;
    twoWheeler.SubCateCode = this.policySubTypeList.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateCode;
    twoWheeler.SubCateDesc = this.policySubTypeList.filter(
      (item: IInsuranceSubType) => item.SubCateCode == this.policyType
    )[0].SubCateDesc;

    twoWheeler.VehicleNoKnowDesc = EYesNo[EYesNo.NO];
    twoWheeler.PrvPolicyExDesc = EYesNo[EYesNo.NO];
    twoWheeler.ClaimPrvPolicyDesc = EYesNo[EYesNo.NO];
    twoWheeler.VehicleRTOCode = frmValue.RTOCode;
    twoWheeler.VehicleRTODesc = frmValue.RTODisplayName;
    twoWheeler.PolicyTenure = "1";

    this.viewPolicy(twoWheeler);
  }

  private viewPolicy(vehicleData: IApplicationVehicleData) {
    // console.log("vehicleData ==> ", vehicleData)
    // return false;
    //localStorage.setItem('twoWheeler', JSON.stringify(vehicleData));
    // vehicleData.ClaimPrvPolicyCode

    sessionStorage.setItem("VehicleData", JSON.stringify(vehicleData));
    // return false;
    // if (vehicleData.SubCateCode == 1) {
    //     this.manageFilters(vehicleData.PrvPolicyExCode, vehicleData.ClaimPrvPolicyCode, vehicleData.VehicleExpiryCode);

    // const selectedNcb = this.ncbList.find(item => item.value == this.ncbInput.value);
    // const ncb = this.ncbList.find((item) => this.getSelected(item, (selectedNcb.id + 1).toString())).value;
    // //console.log("ncb", ncb);
    // //console.log("this.prvPolicyExDate.value", this.prvPolicyExDate.value);
    // }
    // return false;

    // /PosHome/GetPreviousPolicyType?InsuranceCateCode=1&SubCateCode=1

    this.showLoader = true;
    this._subscriptions.push(
      this._posHomeService.saveQuates(vehicleData).subscribe(
        (result) => {
          if (result.successcode == "1") {
            const ApplicationNo = encrypt(`${result.data[0].ApplicationNo}`);
            const ApplicationNoOdp = encrypt(
              `${result.data[0].ApplicationNoOdp}`
            );
            this._router.navigate([
              `/bike-insurance/best-plans/`,
              ApplicationNo,
              ApplicationNoOdp,
            ]);
          } else {
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = "";
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "VehicleData";
              this.errorLogDetails.MethodName = "SaveApplicationData";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.Try again later.";
              this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                //console.log('errorLog---=>', res)
              })
            }
            this._errorHandleService._toastService.warning(result.msg);
          }
        },
        (err: any) => {
          this.btnDisable = this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    );
  }
  //#endregion

  //#region  code for Previous policy expiry date and NCB

  //this function open a popup when (renew policy) and set all condition acc to prv policy data
  ncbExpDateErrMsg = "";
  private manageFilters(
    PrvPolicyExCode: number,
    claimInPrvPolicyCode: number,
    expInd: number
  ) {
    // prvPloicyExpCode=1: YES it expired, claimInPrvPolicyCode=1: Yes claimed
    if (PrvPolicyExCode == 1) {
      switch (expInd) {
        case 3:
        case 1: {
          // for expired within 90 days and // not sure when it expires
          this.setMinDays = 90;
          this.setMaxDays = 0;
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
        case 2: {
          // for expired more than 90 days
          this.ncbInput.setValue("0");
          this.isMoreThan90 = true;

          this.setMinDays = 365 * 19; // set date back to 19 years
          this.setMaxDays = 90;
          break;
        }
        case 4: { //this case generated for only if customer don't remember previous details.

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
    // $("#policyExpiryDateModal").modal("show");
    if (this.prvPolicyRememberCode != 0) {
      this.openModalDialog()
    }
    if (this.twoWheeler.VehicleExpiryCode == 1) this.prvPolicyExpDateforMoreThn90Days();
  }

  openModalDialog() {
    this.display = "block"; //Set block css
  }

  closeModalDialog() {
    this.display = "none"; //set none css after close dialog
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


  GetPolicyExpiryType() {

    this.showpolicyType = true;
    let PolicyExpiryTypeReq = this._posHomeService
      .getPolicyExpiryType(
        this.insuranceType.InsuranceCateCode,
        this.twoWheeler.SubCateCode,
        this.twoWheeler.VehicleRegistrationYrDesc ||
        this.vData.VehicleRegistrationYrDesc
      );
    let previousPolicyCompanyListReq = this._posHomeService.getPreviousPolicyCompanyList();

    this._subscriptions.push(
      forkJoin([PolicyExpiryTypeReq, previousPolicyCompanyListReq]).subscribe(
        ([policyExpiredListResult, previousPolicyCompanyListResult]) => {
          console.log("success===>", policyExpiredListResult, previousPolicyCompanyListResult);
          //Response for  policy expriy list

          if (policyExpiredListResult.successcode == "0" ||
            policyExpiredListResult.successcode === null ||
            policyExpiredListResult.data === null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = 'PosHome'
            this.errorLogDetails.MethodName = 'GetPreviousPolicyType'
            this.errorLogDetails.ErrorCode = policyExpiredListResult.successcode;
            this.errorLogDetails.ErrorDesc = policyExpiredListResult.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          } else {
            this.previousPolicyExpiryType = policyExpiredListResult.data;
          }


          //Response for previous policy company list
          if (previousPolicyCompanyListResult.successcode == "0" ||
            previousPolicyCompanyListResult.successcode === null ||
            previousPolicyCompanyListResult.data === null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = 'PosHome'
            this.errorLogDetails.MethodName = 'GetPreviousPolicyType'
            this.errorLogDetails.ErrorCode = previousPolicyCompanyListResult.successcode;
            this.errorLogDetails.ErrorDesc = previousPolicyCompanyListResult.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          } else {
            console.log(previousPolicyCompanyListResult);
            this.previousPolicyCompanyList = previousPolicyCompanyListResult.data;
            //this.previousPolicyExpiryType = policyExpiredListResult.data;
          }
        })
    );
  }
  onClickOkPrvPolicyModal(): any {
    debugger;
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
      if (this.isNcbEditable) {
        const selectedNcb = this.ncbList.find(
          (item) => item.value == this.ncbInput.value
        );
        // if (
        //   selectedNcb &&
        //   selectedNcb.id != this.ncbList[this.ncbList.length - 1].id
        // ) {
        //   const ncb = this.ncbList.find((item) =>
        //     this.getSelected(item, (selectedNcb.id + 1).toString())
        //   ).value;
        //   this.ncbInput.setValue(ncb);
        //   this.plan.ncb = ncb;
        // }
      }
      if (this.twoWheeler != null) {
        if (this.renewBikeForm.value.claimInPreviousYear == "0") {
          this.twoWheeler.PreviousNCB = this.ncbInput.value;

          if (+this.ncbInput.value != 50) {
            this.twoWheeler.CurrentNCB =
              this.ncbInput.value != 0
                ? String(
                  +this.ncbInput.value == 25 || +this.ncbInput.value == 35
                    ? +this.ncbInput.value + 10
                    : +this.ncbInput.value + 5
                )
                : "20";
          } else this.twoWheeler.CurrentNCB = this.ncbInput.value;
        }
        else {
          // this.twoWheeler.NCBValue = "0";
          this.twoWheeler.PreviousNCB = "0";

          if (+this.ncbInput.value != 50) {
            this.twoWheeler.CurrentNCB =
              this.ncbInput.value != 0
                ? String(
                  +this.ncbInput.value == 25 || +this.ncbInput.value == 35
                    ? +this.ncbInput.value + 10
                    : +this.ncbInput.value + 5
                )
                : "0";
          } else this.twoWheeler.CurrentNCB = this.ncbInput.value;
        }
        this.twoWheeler.PreviousPolicyExpiryDate = convertToMydate(
          this.prvPolicyExDate.value
        );
        // Show policyType popup


        this.showpolicyType = true;

        this.GetPolicyExpiryType();
        // this._subscriptions.push(
        //   this._posHomeService
        //     .getPolicyExpiryType(
        //       this.insuranceType.InsuranceCateCode,
        //       this.twoWheeler.SubCateCode,
        //       this.twoWheeler.VehicleRegistrationYrDesc ||
        //       this.vData.VehicleRegistrationYrDesc
        //     )
        //     .subscribe((result) => {
        //       //  //console.log("success===>",result)
        //       if (result.successcode == "0" || result.successcode == null) {
        //         this.errorLogDetails.UserCode = this.posMobileNo;
        //         this.errorLogDetails.ApplicationNo = "";
        //         this.errorLogDetails.CompanyName = "";
        //         this.errorLogDetails.ControllerName = 'PosHome'
        //         this.errorLogDetails.MethodName = 'GetPreviousPolicyType'
        //         this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
        //         this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
        //         this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
        //           //console.log('errorLog---=>', res)
        //         })
        //       }
        //       if (result.successcode == "1" && result.data != null) {


        //         this.previousPolicyExpiryType = result.data;
        //       }
        //       return false;
        //     })
        // );

        // Show policyType popup end
      } else {
        this.twoWheeler.PreviousPolicyExpiryDate = "0";
        // this.twoWheeler.NCBValue = "0";
        this.twoWheeler.PreviousNCB = "0";
        this.twoWheeler.CurrentNCB =
          +this.ncbInput.value != 0
            ? String(
              +this.ncbInput.value == 25
                ? +this.ncbInput.value + 10
                : +this.ncbInput.value + 5
            )
            : "20";
      }
      this.btnDisable = false;
      // $("#policyExpiryDateModal").modal("hide");
    }
  }
  private getSelected(row: IList, id: string) {
    return row.id.toString() == id;
  }
  //#endregion
  EditData() {
    debugger;
    if (this.vData && this.vData.edit == 1) {
      this.openByMe = this.vData.SubCateDesc;
      if (this.openByMe == "Renew Policy") {
        this.renewBikeForm.patchValue({
          BikeDisplayValue:
            this.vData.VehicleBrandDesc +
            ", " +
            this.vData.VehicleModelDesc +
            ", " +
            this.vData.VehicleVarientDesc +
            ", " +
            this.vData.VehicleRegistrationYrDesc,
          BikeBrandCode: this.vData.VehicleBrandCode,
          BikeModelCode: this.vData.VehicleModelCode,
          BikeVariantCode: this.vData.VehicleVarientCode,
          RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
          RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,

          BikeBrandDesc: this.vData.VehicleBrandDesc,
          BikeModelDesc: this.vData.VehicleModelDesc,
          BikeVariantDesc: this.vData.VehicleVarientDesc,

          isPreviousPolicyExp: this.vData.PrvPolicyExCode,
          BikeExpiryCode: this.vData.VehicleExpiryCode,
          RTODisplayName: this.vData.VehicleRTODesc,
          RTOCode: this.vData.VehicleRTOCode,
          claimInPreviousYear: this.vData.ClaimPrvPolicyCode,
          VehicleFuelCode: this.vData.VehicleFuelCode,
          VehicleFuelDesc: this.vData.VehicleFuelDesc,
          CubicCapacity: this.vData.CubicCapacity,
          SeatingCapacity: this.vData.SeatingCapacity,
        });

        let RegDate = this.vData.RegistrationDate.split("/");
        this.renewBikeForm.patchValue({
          RegistrationDate: moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2]))
        })// 

        this.policyExpireDisplayValue = this.vData.VehicleExpiryDesc;
        // this.prvPolicyExDate.patchValue(new Date(vData.PreviousPolicyExpiryDate));
        this.prvPolicyRememberCode = this.vData.PrvPolicyRememberCode
        this.prvPolicyRememberDesc = this.vData.PrvPolicyRememberDesc

        if (this.vData.PrvPolicyRememberCode != 0) {
          this.renewBikeForm.get('isPreviousPolicyExp')!.enable();
          const md = this.vData.PreviousPolicyExpiryDate.split("/");
          this.prvPolicyExDate.patchValue(md[0] + "/" + md[1] + "/" + md[2]);
          this.ncbInput.setValue(this.vData.NCBValue);
        } else {
          this.renewBikeForm.get('isPreviousPolicyExp')!.disable();
        }
      } else {
        if (this.openByMe == "New Bike") {
          this.newBikeForm.patchValue({
            BikeDisplayValue:
              this.vData.VehicleBrandDesc +
              ", " +
              this.vData.VehicleModelDesc +
              ", " +
              this.vData.VehicleVarientDesc +
              ", " +
              this.vData.VehicleRegistrationYrDesc,
            BikeBrandCode: this.vData.VehicleBrandCode,
            BikeModelCode: this.vData.VehicleModelCode,
            BikeVariantCode: this.vData.VehicleVarientCode,
            RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
            RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,
            RegsitrationDate: this.vData.RegistrationDate,

            BikeBrandDesc: this.vData.VehicleBrandDesc,
            BikeModelDesc: this.vData.VehicleModelDesc,
            BikeVariantDesc: this.vData.VehicleVarientDesc,
            RTODisplayName: this.vData.VehicleRTODesc,
            RTOCode: this.vData.VehicleRTOCode,
            VehicleFuelCode: this.vData.VehicleFuelCode,
            VehicleFuelDesc: this.vData.VehicleFuelDesc,
            CubicCapacity: this.vData.CubicCapacity,
            SeatingCapacity: this.vData.SeatingCapacity,
          });
          this.policyType = this.vData.SubCateCode;
        }
      }
    }
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
