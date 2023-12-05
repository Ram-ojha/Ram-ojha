import { OnInit, Component, Input, Output, EventEmitter, DoCheck, AfterViewInit, AfterViewChecked, AfterContentInit, AfterContentChecked, OnChanges, SimpleChanges } from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { PosBikeService } from "src/app/pos-home/services/pos-bike.service";
import {
  BikeInfoModel,
  IBikeBrands,
  IBikeModels,
  IBikeVariants,
} from "src/app/models/bike-insu.Model";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ErrorHandleService } from "../../services/error-handler.service";
import { errorLog, IRegistrationYear } from "src/app/models/common.Model";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { convertToMydate, decrypt } from "src/app/models/common-functions";
import * as moment from "moment";

@Component({
  selector: "app-bike-model-variant",
  templateUrl: "./bike-model-variant.component.html",
  styleUrls: ["../../../pos-home/pos-home.component.css"],
})
export class BikeModelVariantComponent implements OnInit, OnChanges {
  //#region
  //input output properties
  @Input() isVisible: boolean = false;
  @Input() insuranceCateCode: number = 0;
  @Input() openBy!: string;
  @Output() closePopupClick = new EventEmitter<BikeInfoModel | any>();

  date: string = convertToMydate(new Date());
  // used properties
  bikeManufacturarList: IBikeBrands[] = [];
  bikeModelList: IBikeModels[] = [];
  bikeVariantList: IBikeVariants[] = [];
  regYearList: IRegistrationYear[] = [];

  showLoader: boolean = false; //for showing loader

  filteredBikeBrands!: Observable<IBikeBrands[]>;
  filteredBikeModels!: Observable<IBikeModels[]>;
  filteredBikeVariant!: Observable<IBikeVariants[]>;
  filteredRegYears!: Observable<IRegistrationYear[]>;

  public selectedTab: number = 0;
  // public selectedBikeManuf: string = '';
  // public selectedBikeModel: string = '';
  // public selectedBikeVariant: string = '';
  // public selectedRegYear: string = ''; 

  public bikeForm: FormGroup;
  //#endregion
  vData = JSON.parse(sessionStorage.getItem("VehicleData")!);
  bikeFormData: BikeInfoModel = {
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
  vehicleMask = {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    // mask: [
    //   "-",
    //   /[A-Z,a-z]/,
    //   /[A-Z,a-z]/,
    //   "-",
    //   /[0-9]/,
    //   /[0-9]/,
    //   /[0-9]/,
    //   /[0-9]/,
    // ],
    mask: this.vehicleRegNoMask,
  };

  vehicleRegNoMask(rawValue: string) {
    const split = rawValue.split("");
    // const d = split[2];
    const d = split[1];

    const IsString = isNaN(+d);
    if (d == "-" || !IsString) {
      return [
        // "-",
        /[A-Z,a-z]/,
        "-",
        /[0-9]/,
        /[0-9]/,
        /[0-9]/,
        /[0-9]/,
      ];
    } else {
      return [
        // "-",
        /[A-Z,a-z]/,
        /[A-Z,a-z]/,
        "-",
        /[0-9]/,
        /[0-9]/,
        /[0-9]/,
        /[0-9]/,
      ];
    }
  }
  constructor(
    private _posBikeService: PosBikeService,
    private _posHomeService: PosHomeService,
    fb: FormBuilder,
    private _errorHandleService: ErrorHandleService
  ) {
    this.bikeForm = fb.group({
      BikeBrandCode: ["", Validators.required],
      BikeModelCode: ["", Validators.required],
      BikeVariantCode: ["", Validators.required],
      RegistrationYearCode: ["", Validators.required],
      RegistrationYearDesc: [""],
      RegistrationDate: [new Date(), Validators.required],
      BikeBrandDesc: [""],
      BikeModelDesc: [""],
      BikeVariantDesc: [""],
      VehicleFuelDesc: [""],
      VehicleFuelCode: [""],
      CubicCapacity: [""],
      SeatingCapacity: [""],
    });
  }

  ngOnChanges(simpleChange: SimpleChanges): void {
    debugger
    console.log(this.isVisible);

    if (this.bikeFormData) {
      this.bikeForm.patchValue({
        BikeBrandCode: this.bikeFormData.BikeBrandCode,
        BikeModelCode: this.bikeFormData.BikeModelCode,
        BikeVariantCode: this.bikeFormData.BikeVariantCode,
        RegistrationYearCode: this.bikeFormData.RegistrationYearCode,
        RegistrationYearDesc: this.bikeFormData.RegistrationYearDesc,

        BikeBrandDesc: this.bikeFormData.BikeBrandDesc,
        BikeModelDesc: this.bikeFormData.BikeModelDesc,
        BikeVariantDesc: this.bikeFormData.BikeVariantDesc,

        VehicleFuelDesc: this.bikeFormData.VehicleFuelDesc,
        VehicleFuelCode: this.bikeFormData.VehicleFuelCode,
        CubicCapacity: this.bikeFormData.CubicCapacity,
        SeatingCapacity: this.bikeFormData.SeatingCapacity,
      })
      let RegDate
      if (this.bikeFormData.RegistrationDate == "" ||
        this.bikeFormData.RegistrationDate === null ||
        this.bikeFormData.RegistrationDate === undefined) {
        RegDate = convertToMydate(new Date());
      } else {
        RegDate = this.bikeFormData.RegistrationDate.toString().split("/");
      }
      this.bikeForm.patchValue({
        RegistrationDate: moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2]))
      })
    }

  }
  editVehicleData() {
    debugger;
    // const vData = JSON.parse(sessionStorage.getItem("VehicleData"));
    if (this.vData && this.vData.edit == 1) {
      // this.openBy = vData.SubCateDesc;
      // if (this.openBy == "Renew Policy") {
      this.bikeForm.patchValue({
        BikeBrandCode: this.vData.VehicleBrandCode,
        BikeModelCode: this.vData.VehicleModelCode,
        BikeVariantCode: this.vData.VehicleVarientCode,
        RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
        RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,

        BikeBrandDesc: this.vData.VehicleBrandDesc,
        BikeModelDesc: this.vData.VehicleModelDesc,
        BikeVariantDesc: this.vData.VehicleVarientDesc,

        // VehicleFuelDesc: this.vData.VehicleFuelDesc,
        // VehicleFuelCode: this.vData.VehicleFuelCode,
        // CubicCapacity: this.vData.CubicCapacity,
        // SeatingCapacity: this.vData.SeatingCapacity,
      });
      let RegDate = this.vData.RegistrationDate;//.split("/");
      this.bikeForm.patchValue({
        RegistrationDate: RegDate
      })// moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2]))
      this.bikeFormData = this.bikeForm.value

      // this.getRegistrationYear(vData.RegistrationYearCode);
      // this.getVariant(vData.BikeVariantCode)
    }
    // else {
    //   if (this.openBy == "New Bike") {
    //     this.bikeForm.patchValue({
    //       BikeBrandCode: vData.VehicleBrandCode,
    //       BikeModelCode: vData.VehicleModelCode,
    //       BikeVariantCode: vData.VehicleVarientCode,
    //       RegistrationYearCode: vData.VehicleRegistrationYrCode,
    //       BikeBrandDesc: vData.VehicleBrandDesc,
    //       BikeModelDesc: vData.VehicleModelDesc,
    //       BikeVariantDesc: vData.VehicleVarientDesc,
    //       RegistrationYearDesc: vData.VehicleRegistrationYrDesc,
    //     });

    // }
  }


  link: any;
  userName: any;
  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog
  ngOnInit(): void {
    this.userName = decrypt(sessionStorage.getItem("User Name")!);
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    // if (
    //   this._posBikeService.BikeManufacturarList &&
    //   this._posBikeService.BikeManufacturarList.length
    // )
    //   this.bikeManufacturarList = this._posBikeService.BikeManufacturarList;
    // else this.getManufacturar(this.insuranceCateCode);
    this.getManufacturar(this.insuranceCateCode);

    // if (
    //   this._posHomeService.RegYearList &&
    //   this._posHomeService.RegYearList.length
    // )
    //   this.regYearList = this._posHomeService.RegYearList;
    // else this.getRegistrationYear(this.insuranceCateCode);
    // this.getRegistrationYear(this.insuranceCateCode);
    this.editVehicleData();
  }

  private _filterBrands(value: string): IBikeBrands[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.bikeManufacturarList.filter((bikeManufacturarData) =>
      bikeManufacturarData.BikeBrandDesc.toLowerCase().includes(filterBy)
    );
  }

  private _filterModels(value: string): IBikeModels[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.bikeModelList.filter((bikeModelData) =>
      bikeModelData.BikeModelDesc.toLowerCase().includes(filterBy)
    );
  }

  private _filterVariants(value: string): IBikeVariants[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.bikeVariantList.filter((bikeModelData) =>
      bikeModelData.BikeVariantDesc.toLowerCase().includes(filterBy)
    );
  }

  private _filterRegYears(value: string): IRegistrationYear[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.regYearList.filter((RegYearData) =>
      RegYearData.RegistrationYearDesc.toLowerCase().includes(filterBy)
    );
  }
  get af() {
    return this.bikeForm;
  }
  setMakeValidator() {
    this.af
      .get("BikeBrandDesc")!
      .setValidators([Validators.required, RequireMatch(this.bikeManufacturarList)]);
    this.af.get("BikeBrandDesc")!.updateValueAndValidity();
  }

  setModelValidator() {
    this.af
      .get("BikeModelDesc")!
      .setValidators([Validators.required, RequireMatchModel(this.bikeModelList)]);
    this.af.get("BikeModelDesc")!.updateValueAndValidity();
  }

  setVariantValidator() {
    this.af
      .get("BikeVariantDesc")!
      .setValidators([Validators.required, RequireMatchVariant(this.bikeVariantList)]);
    this.af.get("BikeVariantDesc")!.updateValueAndValidity();
  }

  setRegYearsValidator() {
    this.af
      .get("RegistrationYearDesc")!
      .setValidators([Validators.required]);
    this.af.get("RegistrationYearDesc")!.updateValueAndValidity();
  }
  //#region  private functions

  private getManufacturar(insuranceCateCode: number) {
    this.showLoader = true;
    this._posBikeService.getBikeManufacturar(insuranceCateCode).subscribe(
      (result) => {
        this.showLoader = false;
        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = 'Bike'
          this.errorLogDetails.MethodName = 'GetManufacturar'
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            console.log('errorLog---=>', res)
          })
        }
        this.filteredBikeBrands = this.bikeForm.controls[
          "BikeBrandDesc"
        ].valueChanges.pipe(
          startWith(""),
          map((value) => this._filterBrands(value))
        );

        if (result.successcode == "1") {
          this.bikeManufacturarList = result.data;
          this.setMakeValidator();
        }
      },
      (err: any) => {
        this.showLoader = false;
        this._errorHandleService.handleError(err);
      }
    );
  }

  private getModel(BikeBrandCode: number) {
    console.log(BikeBrandCode);

    this.showLoader = true;
    this._posBikeService.getBikeModel(BikeBrandCode).subscribe(
      (result) => {
        this.showLoader = false;
        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "Bike";
          this.errorLogDetails.MethodName = 'GetModel';
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            console.log('errorLog---=>', res)
          })
        }
        this.filteredBikeModels = this.bikeForm.controls[
          "BikeModelDesc"
        ].valueChanges.pipe(
          startWith(""),
          map((value) => this._filterModels(value))
        );

        if (result.successcode == "1") {
          this.bikeModelList = result.data;
          this.setModelValidator();
        }
      },
      (err: any) => {
        this.showLoader = false;
        this._errorHandleService.handleError(err);
      }
    );
  }
  private getVariant(BikeModelCode: number) {
    console.log(BikeModelCode);
    this.showLoader = true;
    this._posBikeService.getBikeVarient(BikeModelCode).subscribe(
      (result) => {
        this.showLoader = false;
        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "Bike";
          this.errorLogDetails.MethodName = 'GetVariant';
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            console.log('errorLog---=>', res)
          })
        }
        this.filteredBikeVariant = this.bikeForm.controls[
          "BikeVariantDesc"
        ].valueChanges.pipe(
          startWith(""),
          map((value) => this._filterVariants(value))
        );

        if (result.successcode == "1") {
          this.bikeVariantList = result.data;
          this.setVariantValidator();
          this.getRegDate();
          // this.getRegistrationYear(this.insuranceCateCode);
        }
      },
      (err: any) => {
        this.showLoader = false;
        this._errorHandleService.handleError(err);
      }
    );
  }
  getRegDate() {
    debugger
    this.bikeForm.patchValue({
      RegistrationDate: moment(new Date())
    })
  }
  private getRegistrationYear(insuranceCateCode: number) {
    debugger
    this.showLoader = true;
    this._posHomeService.getRegYearFuelList(insuranceCateCode).subscribe(
      (result) => {
        this.filteredRegYears = this.bikeForm.controls[
          "RegistrationYearDesc"
        ].valueChanges.pipe(
          startWith(""),
          map((value) => this._filterRegYears(value))
        );

        this.showLoader = false;
        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "PosHome";
          this.errorLogDetails.MethodName = 'GetFuelYearList';
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            console.log('errorLog---=>', res)
          })
        }
        if (result.successcode == "1") {
          this.regYearList = result.data.Table1;

          this.setRegYearsValidator()
        }
      },
      (err: any) => {
        this.showLoader = false;
        this._errorHandleService.handleError(err);
      }
    );
  }
  // private selectedIndexChange(tab: number) {
  //     this.selectedTab = tab;
  // }

  //#endregion

  //#region  public functions
  public reset() {
    this.bikeForm.reset();
    this.selectedTab = 0;
    this.openBy = "";
    this.bikeModelList = [];
    this.bikeVariantList = [];
  }
  public onSelectBikeManufacturar(selected: string) {
    let values = selected.split(",");
    if (selected != null) {
      this.getModel(+values[0]);
      this.getRegistrationYear(this.insuranceCateCode);
      this.bikeForm.patchValue({
        BikeBrandCode: +values[0],
        BikeModelCode: "",
        BikeVariantCode: "",
        RegistrationYearCode: "",

        BikeBrandDesc: selected.split(",")[1],
        BikeModelDesc: "",
        BikeVariantDesc: "",
        RegistrationYearDesc: "",
      });

      this.selectedTab = 1;
    }
  }

  public onSelectBikeModel(selected: string) {
    let values = selected.split(",");
    if (selected != null) {
      this.getVariant(+values[0]);
      this.bikeForm.patchValue({
        BikeModelCode: +values[0],
        BikeVariantCode: "",
        RegistrationYearCode: "",
        BikeModelDesc: values[1],
        BikeVariantDesc: "",
        RegistrationYearDesc: "",
      });
      this.selectedTab = 2;
    }
  }

  public onSelectBikeVariant(selected: string) {
    debugger
    let values = selected.split(",");

    if (selected != null) {
      if (this.openBy == "newBikeForm") {
        if (this.regYearList.length > 0) {
          const currentYear = this.regYearList.find(
            (item) =>
              item.RegistrationYearDesc ==
              new Date().getUTCFullYear().toString()
          );
          this.bikeForm.patchValue({
            BikeVariantCode: +values[0],
            BikeVariantDesc: values[1],
            RegistrationYearCode: currentYear
              ? currentYear.RegistrationYearCode
              : 0,
            CubicCapacity: values[2],
            SeatingCapacity: values[3],
            VehicleFuelDesc: values[4],
            VehicleFuelCode: values[5],
            // RegistrationYearDesc: currentYear
            //   ? currentYear.RegistrationYearCode +
            //     "," +
            //     currentYear.RegistrationYearDesc
            //   : "0," + new Date().getUTCFullYear().toString(),
            // RegistrationYearDesc: currentYear ? currentYear.RegistrationYearDesc : "",
            RegistrationYearDesc: "New",
            RegistrationDate: moment(new Date())
          });
        }
        this.closePopup();
      } else {
        this.bikeForm.patchValue({
          BikeVariantCode: +values[0],
          RegistrationYearCode: "",

          CubicCapacity: values[2],
          SeatingCapacity: values[3],
          VehicleFuelDesc: values[4],
          VehicleFuelCode: values[5],
          BikeVariantDesc: values[1],
          RegistrationYearDesc: "",
          RegistrationDate: ""
        });
        this.getRegistrationYear(this.insuranceCateCode);
        this.selectedTab = 3;
      }
    }
  }

  // public onSelectRegYear(selected: string): void {
  //   // let currentYear = String(new Date().getFullYear());

  //   // if (vData) {
  //   //   this.bikeForm.patchValue({
  //   //     RegistrationYearCode: vData.VehicleRegistrationYrCode,
  //   //     RegistrationYearDesc: vData.VehicleRegistrationYrDesc,
  //   //   });
  //   // } else {

  //   this.bikeForm.patchValue({
  //     RegistrationYearCode: +selected.split(",")[0],
  //     RegistrationYearDesc: selected.split(",")[1],
  //   });

  //   this.closePopup();
  // }

  public onSelectRegYear(): void {
    debugger
    let selected = convertToMydate(this.bikeForm.controls["RegistrationDate"]!.value);

    this.bikeForm.patchValue({
      RegistrationYearCode: +(selected.split("/")[2].toString().slice(2, 4)),
      RegistrationYearDesc: selected.split("/")[2],
    });
  }


  selectedTabChange(e: any) {
    debugger

    // const vData = JSON.parse(sessionStorage.getItem("VehicleData"));
    if (this.vData && this.vData.edit == 1) {
      if (this.selectedTab == 0) {
        this.getManufacturar(this.insuranceCateCode);
      }
      if (this.selectedTab == 1) {
        this.getModel(this.bikeForm.value.BikeBrandCode);
      }
      if (this.selectedTab == 2) {
        this.getVariant(this.bikeForm.value.BikeModelCode);
      }
      if (this.selectedTab == 3) {
        let RegDate = this.vData.RegistrationDate.split("/");
        // console.log(RegDate, moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2])));

        this.bikeForm.patchValue({
          RegistrationDate: moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2])),
          RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
          RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc
        })
        console.log(this.bikeForm, this.vData.VehicleRegistrationYrCode);
        // this.getRegistrationYear(this.insuranceCateCode);
      }
    }
  }
  closePopup() {
    debugger
    this.selectedTab = 0;
    debugger
    if (this.bikeForm.valid) {
      const bikeForm = this.bikeForm && this.bikeForm.value;
      const bikeInfo = new BikeInfoModel(
        bikeForm.BikeBrandCode,
        bikeForm.BikeModelCode,
        bikeForm.BikeVariantCode
      );
      bikeInfo.BikeBrandDesc = bikeForm.BikeBrandDesc;
      bikeInfo.BikeModelDesc = bikeForm.BikeModelDesc;
      bikeInfo.BikeVariantDesc = bikeForm.BikeVariantDesc;
      bikeInfo.RegistrationYearCode = bikeForm.RegistrationYearCode;
      bikeInfo.RegistrationYearDesc = bikeForm.RegistrationYearDesc;
      bikeInfo.RegistrationDate = bikeForm.RegistrationDate;
      bikeInfo.CubicCapacity = bikeForm.CubicCapacity;
      bikeInfo.SeatingCapacity = bikeForm.SeatingCapacity;
      bikeInfo.VehicleFuelDesc = bikeForm.VehicleFuelDesc;
      bikeInfo.VehicleFuelCode = bikeForm.VehicleFuelCode;

      //   bikeInfo.BikeBrandDesc = bikeForm.BikeBrandDesc.split(",")[1];
      //   bikeInfo.BikeModelDesc = bikeForm.BikeModelDesc.split(",")[1];
      //   bikeInfo.BikeVariantDesc = bikeForm.BikeVariantDesc.split(",")[1];
      //   bikeInfo.RegistrationYearCode = bikeForm.RegistrationYearCode;
      //   bikeInfo.RegistrationYearDesc = bikeForm.RegistrationYearDesc.split(
      //     ","
      //   

      this.bikeFormData = bikeInfo
      this.closePopupClick.emit(bikeInfo);
    } else {

      this.bikeForm.reset()
      this.closePopupClick.emit(null);
    }

  }
  //#endregion
}

export function RequireMatch(Make: IBikeBrands[]) {
  return (control: AbstractControl) => {
    const typed: any = control.value;
    let stateFound = Make.find((mk) => mk.BikeBrandDesc === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchModel(Model: IBikeModels[]) {
  return (control: AbstractControl) => {
    const typed: any = control.value ? control.value.toLowerCase() : "";
    let stateFound = Model.find((mk: IBikeModels) => mk.BikeModelDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchVariant(Model: IBikeVariants[]) {
  return (control: AbstractControl) => {
    const typed: any = control.value ? control.value.toLowerCase() : '';
    let stateFound = Model.find((mk: IBikeVariants) => mk.BikeVariantDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}


export function RequireMatchRegYears(Years: IRegistrationYear[], SubCateDesc: string) {
  console.log(SubCateDesc);

  return (control: AbstractControl) => {
    if (SubCateDesc === "newBikeForm") {
      return null;
    }
    const typed: any = control.value ? control.value.toLowerCase() : '';
    let stateFound = Years.find((mk: IRegistrationYear) => mk.RegistrationYearDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}
