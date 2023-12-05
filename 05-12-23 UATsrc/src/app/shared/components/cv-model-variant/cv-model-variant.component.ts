import {
  OnInit,
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";

import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ErrorHandleService } from "../../services/error-handler.service";
import { IRegistrationYear, IFuel, errorLog } from "src/app/models/common.Model";

import { map, startWith } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";

import { PosCvServiceService } from "src/app/pos-home/services/pos-cv-service.service";
import { CVInfoModel, ICVBrands, ICVModels, ICVVariants, ICVVehicle } from "src/app/models/cv-insu.Model";
import { convertToMydate, decrypt } from "src/app/models/common-functions";
import * as moment from "moment";

@Component({
  selector: "app-cv-model-variant",
  templateUrl: "./cv-model-variant.component.html",
  styleUrls: ["../../../pos-home/pos-home.component.css"],
})
export class CvModelVariantComponent implements OnInit, OnDestroy {
  //#region
  //input output properties
  @Input() isVisible: boolean = false;
  @Input() insuranceCateCode: number = 0;
  @Input() openBy!: string;
  @Output() closePopupClick = new EventEmitter<CVInfoModel | any>();

  // used properties
  cvVehicleTypeList: ICVVehicle[] = [];
  cvBrandList: ICVBrands[] = [];
  cvModelList: ICVModels[] = [];
  cvVariantList: ICVVariants[] = [];
  regYearList: IRegistrationYear[] = [];
  cvFuelList: IFuel[] = [];

  showLoader: boolean = false; //for showing loader
  filteredOptions!: Observable<ICVBrands[]>;
  filteredCVModels!: Observable<ICVModels[]>;
  filteredCVVariants!: Observable<ICVVariants[]>;
  filteredCVRegYears!: Observable<IRegistrationYear[]>;
  filteredFuels!: Observable<IFuel[]>;

  // filteredOptionsModel: any[];
  date: string = convertToMydate(new Date());

  public selectedTab: number = 0;
  public selectedCVVehicleType: string = "";
  public selectedCVManuf: string = "";
  public selectedCVModel: string = "";
  public selectedCVVariant: string = "";
  public selectedRegYear: string = "";
  public selectedFuelType: string = "";
  public VehicleTypeId!: number;
  public cvForm: FormGroup;
  cvVehicleSelected!: boolean;
  cvBrandSelected!: boolean;
  cvModelSelected!: boolean;
  cvVarientSelected!: boolean;
  Sel!: boolean;
  //#endregion

  vData = JSON.parse(sessionStorage.getItem("CVData")!);
  private _subscriptions: any = [];
  RecordNo: any;
  constructor(
    private _posCVService: PosCvServiceService,
    private _posHomeService: PosHomeService,
    fb: FormBuilder,
    private _errorHandleService: ErrorHandleService
  ) {
    this.cvForm = fb.group({
      RecordNoforCvVehicleType: [""],
      CvVehicleType: ["", Validators.required],
      VehicleTypeCarriageCode: [""],
      CvBrandCode: ["", Validators.required],
      CvModelCode: ["", Validators.required],
      CvVariantCode: ["", Validators.required],
      RegistrationYearCode: ["", Validators.required],
      RegistrationYearDesc: [""],
      RegistrationDate: [new Date(), Validators.required],

      FuelCode: ["", Validators.required],
      VehicleTypeId: [""],
      // CvVehicleDesc : [""],
      VehicleTypeCarriageDesc: [""],
      CvBrandDesc: [""],
      CvModelDesc: [""],
      CvVariantDesc: [""],
      VariantName: [""],
      SeatingCapacity: [""],
      FuelDesc: ["", Validators.required],
    });
  }
  onEditCar() {
    console.log(this.vData);

    if (this.vData && this.vData.edit == 1) {
      this.cvForm.patchValue({
        CvBrandCode: this.vData.VehicleBrandCode,
        CvModelCode: this.vData.VehicleModelCode,
        CvVariantCode: this.vData.VehicleVarientCode,
        RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
        FuelCode: this.vData.VehicleFuelCode,
        VehicleTypeId: this.vData.VehicleTypeId,
        CvBrandDesc: this.vData.VehicleBrandDesc,
        CvModelDesc: this.vData.VehicleModelDesc,
        CvVariantDesc: this.vData.VehicleVarientDesc,
        RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,
        FuelDesc: this.vData.VehicleFuelDesc,
        RecordNoforCvVehicleType: this.vData.CVehicleTypeCode,
        VehicleTypeCarriageDesc: this.vData.VehicleTypeCarriageDesc,
        VehicleTypeCarriageCode: this.vData.VehicleTypeCarriageDesc,
        CvVehicleType: this.vData.CvVehicleType
      });
      let RegDate = this.vData.RegistrationDate.split("/");
      this.cvForm.patchValue({
        RegistrationDate: moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2]))
      })// moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2]))

    }
  }

  link: any;
  userName: any;
  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog;
  ngOnInit(): void {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);

    // if (
    //   this._posCVService.CarBrandList &&
    //   this._posCVService.CarBrandList.length
    // ) {
    //   this.carBrandList = this._posCVService.CarBrandList;
    // } else this.getBrand(this.insuranceCateCode);
    this.getVehicleType();
    // this.getBrand(this.insuranceCateCode);
    this.onEditCar();
    // if (this._posHomeService.FuelList && this._posHomeService.FuelList.length) {
    //   this.regYearList = this._posHomeService.RegYearList;
    //   this.carFuelList = this._posHomeService.FuelList;
    // } else {
    //   this.getRegistrationYear(this.insuranceCateCode);
    // }
    // this.carFuelList = this._posHomeService.FuelList;
    // this.getRegistrationYear(this.insuranceCateCode);
    // this.getFuel();
  }

  // ngAfterContentChecked() {

  // }

  // public getCarName(carValue) {
  //   console.log(carValue);
  // let carName = this.carBrandList
  //   ? this.carBrandList.find((car) => {
  //       return car.CvBrandCode == carValue;
  //     })
  //   : null;
  // if (carName) {
  //   return carName.CarBrandDesc;
  // } else return carValue;

  // console.log(carName);
  // }

  private _filterBrands(value: string): ICVBrands[] {
    // let filterValue = typeof value === "string" ? value.toLowerCase() : "";
    // console.log(filterValue);

    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.cvBrandList.filter((cv) =>
      // car.CarBrandDesc.toLowerCase().includes(filterValue)
      cv.MakeDesc.toLowerCase().includes(filterBy)
    );
  }
  private _filterModels(value: string): ICVModels[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;

    return this.cvModelList.filter((cv) =>
      cv.ModelDesc.toLowerCase().includes(filterBy)
    );
  }
  private _filterVariants(value: string): ICVVariants[] {
    // if (!this.carVariantList || this.carVariantList.length === 0) return [];
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;

    return this.cvVariantList.filter((cv) =>
      cv.VariantDesc.toLowerCase().includes(filterBy)
    );
  }
  private _filterRegYear(value: string): IRegistrationYear[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.regYearList.filter((cv) =>
      cv.RegistrationYearDesc.toLowerCase().includes(filterBy)
    );
  }
  private _filterFuels(value: string): IFuel[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.cvFuelList.filter((cv) =>
      cv.FuelTypeDesc.toLowerCase().includes(filterBy)
    );
  }

  get af() {
    return this.cvForm;
  }
  setMakeValidator() {

    this.af
      .get("CvBrandDesc")!
      .setValidators([Validators.required, RequireMatch(this.cvBrandList)]);
    this.af.get("CvBrandDesc")!.updateValueAndValidity();
  }

  setModelValidator() {
    this.af
      .get("CvModelDesc")!
      .setValidators([Validators.required, RequireMatchModel(this.cvModelList)]);
    this.af.get("CvModelDesc")!.updateValueAndValidity();
  }

  setVariantValidator() {
    this.af
      .get("CvVariantDesc")!
      .setValidators([Validators.required, RequireMatchVariant(this.cvVariantList)]);
    this.af.get("CvVariantDesc")!.updateValueAndValidity();
  }

  setFuelValidator() {
    this.af
      .get("FuelDesc")!
      .setValidators([Validators.required, RequireMatchFuel(this.cvFuelList)]);
    this.af.get("FuelDesc")!.updateValueAndValidity();
  }

  setRegYearsValidator() {
    if (this.openBy != "newCVForm") {
      this.af
        .get("RegistrationYearDesc")!
        .setValidators([Validators.required]);
      this.af.get("RegistrationYearDesc")!.updateValueAndValidity();
    }

  }

  private getVehicleType() {
    this._subscriptions.push(
      this._posCVService.getCvVehicleType().subscribe(
        (res) => {
          console.log(res);
          if (res.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "CommercialVehicle"
            this.errorLogDetails.MethodName = 'GetTypeVehicle'
            this.errorLogDetails.ErrorCode = res.successcode;
            this.errorLogDetails.ErrorDesc = res.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          }
          if (res.successcode == "1") {
            console.log(res.data);
            this.cvVehicleTypeList = res.data;
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    )
  }
  private getBrand(insuranceCateCode: number, VehicleTypeId: number) {

    //  VehicleTypeId = VehicleTypeId == undefined ? this.vData.VehicleTypeId : VehicleTypeId;
    VehicleTypeId = VehicleTypeId == undefined ? this.vData.VehicleTypeId : VehicleTypeId;

    this.showLoader = true;
    this._subscriptions.push(
      this._posCVService.getCVMake(insuranceCateCode, VehicleTypeId).subscribe(
        (result) => {
          this.showLoader = false;
          this.filteredOptions = this.cvForm.controls[
            "CvBrandDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterBrands(value))
          );
          if (result.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "CommercialVehicle"
            this.errorLogDetails.MethodName = 'GetMake?InsuranceCateCode'
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          }
          if (result.successcode == "1") {
            console.log(result.data);
            this.cvBrandList = result.data;
            this.setMakeValidator()
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      ))
  }
  private getModel(MakeCode: number, VehicleTypeId: number) {
    this.showLoader = true;
    this._subscriptions.push(
      this._posCVService.getCVModel(MakeCode, VehicleTypeId).subscribe(
        (result) => {
          this.showLoader = false;
          this.filteredCVModels = this.cvForm.controls[
            "CvModelDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterModels(value))
          );

          if (result.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "CommercialVehicle"
            this.errorLogDetails.MethodName = 'GetModel?MakeCode='
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          }
          if (result.successcode == "1") {
            this.cvModelList = result.data;
            this.setModelValidator()
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      ))
  }
  private getVariant(ModelCode: number, FuelTypeCode: number, VehicleTypeId: number) {

    this.showLoader = true;
    this.cvVariantList = [];
    this._subscriptions.push(
      this._posCVService.getCVVarient(ModelCode, FuelTypeCode, VehicleTypeId).subscribe(
        (result) => {
          this.showLoader = false;

          if (result.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "CommercialVehicle"
            this.errorLogDetails.MethodName = '/GetVarient?ModelCode='
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          }
          if (result.successcode == "1") {
            this.cvVariantList = result.data;
            this.setVariantValidator()
            this.getRegistrationYear(this.insuranceCateCode);
          }
          this.filteredCVVariants = this.cvForm.controls[
            "CvVariantDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterVariants(value))
          );
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      ))
  }
  private getRegistrationYear(insuranceCateCode: number) {
    this.showLoader = true;
    this._subscriptions.push(
      this._posHomeService.getRegYearFuelList(insuranceCateCode).subscribe(
        (result) => {
          this.showLoader = false;
          this.filteredCVRegYears = this.cvForm.controls[
            "RegistrationYearDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterRegYear(value))
          );
          this.filteredFuels = this.cvForm.controls[
            "FuelDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterFuels(value))
          );
          if (result.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "PosHome"
            this.errorLogDetails.MethodName = 'GetFuelYearList'
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              console.log('errorLog---=>', res)
            })
          }
          if (result.successcode == "1") {
            this.regYearList = result.data.Table1;
            this.cvFuelList = result.data.Table;
            this.setFuelValidator();
            this.setRegYearsValidator();
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      ))
  }
  //#endregion
  //#region  public functions
  public reset() {
    this.cvForm.reset();
    this.selectedTab = 0;
    this.selectedCVManuf = "";
    this.selectedCVModel = "";
    this.selectedCVVariant = "";
    this.selectedFuelType = "";
    this.openBy = "";
    this.cvModelList = [];
    this.cvVariantList = [];
  }
  public onSelectCVvehicleType(selected: any) {
    debugger
    this.cvVehicleSelected = true;
    let values = selected.split(",");
    this.selectedCVVehicleType = values[2];
    this.selectedCVModel =
      this.selectedCVVariant =
      this.selectedRegYear =
      this.selectedFuelType = "";
    this.VehicleTypeId = values[4]
    this.RecordNo = values[0]
    console.log("-------->", values);

    if (selected) {
      this.getBrand(this.insuranceCateCode, this.VehicleTypeId);
      this.cvForm.patchValue({
        RecordNoforCvVehicleType: values[0],
        CvVehicleType: values[1],
        VehicleTypeCarriageCode: values[2],
        // CvVehicleDesc : values[2] + values[3],
        VehicleTypeId: values[4],
        VehicleTypeCarriageDesc: values[3],
        CvBrandCode: "",
        CvModelCode: "",
        CvVariantCode: "",
        RegistrationYearCode: "",
        CvModelDesc: "",
        CvBrandDesc: "",
        FuelDesc: "",
        FuelCode: "",
        CvVariantDesc: "",
        RegistrationYearDesc: "",
        CubicCapacity: ""
      });
      this.selectedTab = 1;
    }
  }
  public onSelectCVBrand(selected: string) {
    this.cvBrandSelected = true;
    // this.selectedCarManuf = selected;
    let values = selected.split(",");
    this.selectedCVManuf = values[1]; ////
    this.selectedCVModel =
      this.selectedCVVariant =
      this.selectedRegYear =
      this.selectedFuelType =
      "";
    if (selected) {
      this.getModel(+values[0], this.RecordNo);
      this.getRegistrationYear(this.insuranceCateCode);
      // this.CvBrandCode = +values[0];
      this.cvForm.patchValue({
        CvBrandCode: +values[0],
        CvModelCode: "",
        CvVariantCode: "",
        RegistrationYearCode: "",
        CvModelDesc: "",
        CvBrandDesc: values[1],
        FuelDesc: "",
        FuelCode: "",
        CvVariantDesc: "",
        RegistrationYearDesc: "",
        CubicCapacity: "",
        RegistrationDate: moment(new Date())

      });
      this.selectedTab = 2;
    }
  }
  public onSelectCVModel(selected: string) {
    this.cvModelSelected = true;
    let values = selected.split(",");
    this.selectedCVModel = values[1]; ////
    this.selectedCVVariant = this.selectedRegYear = "";
    this.getRegistrationYear(this.insuranceCateCode);
    if (selected != null) {
      if (this.selectedFuelType && this.cvForm.get("FuelDesc") && this.cvForm.get("FuelDesc")!.errors === null) {
        this.getVariant(+values[0], +this.cvForm.get("FuelCode")!.value, this.VehicleTypeId);
        this.selectedTab = 3;
      }
      this.cvForm.patchValue({
        CvModelCode: +values[0],
        CvVariantCode: "",
        RegistrationYearCode: "",
        CvModelDesc: values[1],
      });
    }
    if (!this.selectedFuelType) {
      this.Sel = true;
    }
    // this.selectedTab = 2;
  }
  public onSelectCVVariant(selected: string): void {

    this.cvVarientSelected = true;
    this.selectedRegYear = "";
    let values = selected.split(",");
    this.selectedCVVariant = values[1];
    if (selected) {
      debugger
      if (this.openBy == "newCVForm") {
        this.getRegistrationYear(this.insuranceCateCode);
        if (this.regYearList.length > 0) {
          const currentYear = this.regYearList.find(
            (item) =>
              item.RegistrationYearDesc ==
              new Date().getUTCFullYear().toString()
          );
          this.cvForm.patchValue({
            CvVariantCode: +values[0],
            RegistrationYearCode: currentYear
              ? currentYear.RegistrationYearCode
              : 0,
            RegistrationYearDesc: currentYear
              ? currentYear.RegistrationYearDesc
              : "",
            // RegistrationYearDesc: "New",
            CvVariantDesc: values[1],
            CubicCapacity: values[2],
            // SeatingCapacity: values[3],
            VariantName: values[3],
            RegistrationDate: moment(new Date())

          });
          this.selectedRegYear = currentYear
            ? currentYear.RegistrationYearDesc
            : "";
        }
        // this.getRegistrationYear(this.insuranceCateCode);
        // this.selectedRegYear = currentYear
        //   ? currentYear.RegistrationYearCode +
        //     "," +
        //     currentYear.RegistrationYearDesc
        //   : "0," + new Date().getUTCFullYear().toString();
        this.closePopup();
      } else {
        this.cvForm.patchValue({
          CvVariantCode: +values[0],
          // RegistrationYearCode: 0,

          CvVariantDesc: values[1],
          CubicCapacity: values[2],
          // SeatingCapacity: values[3],
          VariantName: values[3],
          RegistrationDate: ""

        });
        // this.getRegistrationYear(this.insuranceCateCode);
        this.selectedTab = 4;
      }
    }
  }
  // public onSelectRegYear(selected: string): void {
  //   // this.selectedRegYear = selected;

  //   let codeYearArray = selected.split(","); // eg: 14,2019
  //   this.selectedRegYear = codeYearArray[1]; ////////////
  //   this.cvForm.patchValue({
  //     RegistrationYearCode: +codeYearArray[0],
  //     FuelCode: this.selectedFuelType ? this.cvForm.get("FuelCode")!.value : 0,
  //     RegistrationYearDesc: codeYearArray[1],
  //   });
  //   this.closePopup();
  // }

  public onSelectRegYear(): void {

    let selected = convertToMydate(this.cvForm.controls["RegistrationDate"]!.value);

    this.cvForm.patchValue({
      RegistrationYearCode: +(selected.split("/")[2].toString().slice(2, 4)),
      RegistrationYearDesc: selected.split("/")[2]
    });
  }

  public onSelectCVFuel(selected: any) {
    // this.selectedFuelType = event.value;
    if (selected != null) {
      //if (this.selectedFuelType != null) {
      let value = selected.split(",");
      if (this.selectedCVModel) {
        this.getVariant(+this.cvForm.get("CvModelCode")!.value, +value[0], this.VehicleTypeId);
        // this.getVariant(+this.selectedCarModel.split(",")[0]);
        this.Sel = false;
        this.selectedTab = 3;
      }
      this.selectedFuelType = selected.split(",")[1];
      this.cvForm.patchValue({
        FuelCode: +selected.split(",")[0],
        CvVariantCode: "",
        RegistrationYearCode: "",
        FuelDesc: this.selectedFuelType,
      });
    }
  }
  closePopup() {
    debugger;
    this.selectedTab = 0;
    if (this.cvForm.valid) {
      const cvForm = this.cvForm.value;
      const cvInfo = new CVInfoModel(
        cvForm.CvBrandCode,
        cvForm.CvModelCode,
        cvForm.CvVariantCode,
        cvForm.FuelCode
      );
      // RecordNoforCvVehicleType : number; 
      // CvVehicleType : string ;
      // VehicleTypeCarriageCode : number;
      // CvVehicleDesc : string ;
      // VehicleTypeCarriageDesc :string ;

      (cvInfo.RecordNoforCvVehicleType = cvForm.RecordNoforCvVehicleType),
        (cvInfo.CvVehicleType = cvForm.CvVehicleType),
        (cvInfo.VehicleTypeCarriageCode = cvForm.VehicleTypeCarriageCode),
        // (cvInfo.CvVehicleDesc = cvForm.CvVehicleDesc),
        (cvInfo.VehicleTypeCarriageDesc = cvForm.VehicleTypeCarriageDesc),
        (cvInfo.CvBrandDesc = cvForm.CvBrandDesc),
        (cvInfo.CvModelDesc = cvForm.CvModelDesc),
        (cvInfo.CvVariantDesc = cvForm.CvVariantDesc),
        (cvInfo.FuelTypeDesc = cvForm.FuelDesc),
        (cvInfo.RegistrationYearCode = cvForm.RegistrationYearCode),
        (cvInfo.RegistrationYearDesc = cvForm.RegistrationYearDesc),
        (cvInfo.RegistrationDate = cvForm.RegistrationDate),

        (cvInfo.CubicCapacity = cvForm.CubicCapacity),
        (cvInfo.VehicleTypeId = cvForm.VehicleTypeId),
        // (cvInfo.SeatingCapacity = cvForm.SeatingCapacity),
        (cvInfo.VariantName = cvForm.VariantName),
        console.log(cvInfo);
      this.closePopupClick.emit(cvInfo);
    } else this.closePopupClick.emit(null);
  }
  //#endregion
  selectedTabChange(e: any) {
    console.log(this.selectedTab);
    // const vData = JSON.parse(sessionStorage.getItem("CarData"));
    if (this.vData && this.vData.edit == 1) {
      if (this.selectedTab == 0) {
        this.getVehicleType();
      }
      if (this.selectedTab == 1) {
        this.getBrand(this.insuranceCateCode, this.VehicleTypeId);
      }
      if (this.selectedTab == 2) {
        this.getModel(this.cvForm.value.CvBrandCode, this.VehicleTypeId);
      }
      if (this.selectedTab == 3) {
        this.getVariant(
          this.cvForm.value.CvModelCode,
          this.cvForm.value.FuelCode,
          this.VehicleTypeId
        );
      }
      if (this.selectedTab == 4) {
        this.getRegistrationYear(this.insuranceCateCode);
      }
    }
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}

export function RequireMatch(Make: ICVBrands[]) {
  return (control: AbstractControl) => {
    debugger

    const typed: any = control.value;
    let stateFound = Make.find((mk) => mk.MakeDesc === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}


export function RequireMatchModel(Model: ICVModels[]) {
  return (control: AbstractControl) => {
    const typed: any = control.value ? control.value.toLowerCase() : "";
    let stateFound = Model.find((mk: ICVModels) => mk.ModelDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchVariant(Model: ICVVariants[]) {
  return (control: AbstractControl) => {
    const typed: any = control.value ? control.value.toLowerCase() : '';
    let stateFound = Model.find((mk: ICVVariants) => mk.VariantDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}


export function RequireMatchRegYears(Years: IRegistrationYear[], SubCateDesc: string) {
  return (control: AbstractControl) => {
    // debugger
    // if (SubCateDesc == "newCVForm" || SubCateDesc == "") {
    //   return null;
    // }
    const typed: any = control.value ? control.value.toLowerCase() : '';
    let stateFound = Years.find((mk: IRegistrationYear) => mk.RegistrationYearDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchFuel(Years: IFuel[]) {
  return (control: AbstractControl) => {
    const typed: any = control.value ? control.value.toLowerCase() : '';
    let stateFound = Years.find((mk: IFuel) => mk.FuelTypeDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}
