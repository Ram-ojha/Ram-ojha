import {
  OnInit,
  Component,
  Input,
  Output,
  EventEmitter,
  AfterContentChecked,
  OnDestroy,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { PosCarService } from "src/app/pos-home/services/pos-car.service";
import {
  CarInfoModel,
  ICarBrands,
  ICarModels,
  ICarVariants,
} from "src/app/models/car-insu.Model";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ErrorHandleService } from "../../services/error-handler.service";
import { IRegistrationYear, IFuel, errorLog } from "src/app/models/common.Model";
import { ToastrService } from "ngx-toastr";
import { map, startWith } from "rxjs/operators";
import { Observable, of, Subscription } from "rxjs";
import { typeofExpr } from "@angular/compiler/src/output/output_ast";
import { ValueConverter } from "@angular/compiler/src/render3/view/template";
import { LoginComponent } from "src/app/login/login.component";
import { convertToMydate, decrypt } from "src/app/models/common-functions";
import * as moment from "moment";

@Component({
  selector: "app-car-model-variant",
  templateUrl: "./car-model-variant.component.html",
  styleUrls: ["../../../pos-home/pos-home.component.css"],
})
export class CarModelVariantComponent implements OnChanges, OnInit, OnDestroy {
  //#region
  //input output properties
  @Input() isVisible: boolean = false;
  @Input() insuranceCateCode: number = 0;
  @Input() openBy!: string;
  @Output() closePopupClick = new EventEmitter<CarInfoModel | any>();

  // used properties
  carBrandList: ICarBrands[] = [];
  carModelList: ICarModels[] = [];
  carVariantList: ICarVariants[] = [];
  regYearList: IRegistrationYear[] = [];
  carFuelList: IFuel[] = [];

  showLoader: boolean = false; //for showing loader
  filteredOptions!: Observable<ICarBrands[]>;
  filteredCarModels!: Observable<ICarModels[]>;
  filteredCarVariants!: Observable<ICarVariants[]>;
  filteredCarRegYears!: Observable<IRegistrationYear[]>;
  filteredFuels!: Observable<IFuel[]>;

  // filteredOptionsModel: any[];
  date: string = convertToMydate(new Date());

  public selectedTab: number = 0;
  public selectedCarManuf: string = "";
  public selectedCarModel: string = "";
  public selectedCarVariant: string = "";
  public selectedRegYear: string = "";
  public selectedFuelType: string = "";

  public carForm: FormGroup;
  carBrandSelected!: boolean;
  carModelSelected!: boolean;
  carVarientSelected!: boolean;
  Sel!: boolean;
  //#endregion
  vData = JSON.parse(sessionStorage.getItem("CarData")!);
  private _subscriptions: any = [];
  carFormData: CarInfoModel = {
    CarBrandCode: 0,
    CarBrandDesc: "",
    CarModelCode: 0,
    CarModelDesc: "",
    CarVariantCode: 0,
    CarVariantDesc: "",
    RegistrationYearCode: 0,
    RegistrationYearDesc: "",
    RegistrationDate: "",

    FuelCode: 0,
    FuelTypeDesc: "",
    CubicCapacity: 0,
    SeatingCapacity: 0,
    VariantName: ""
  };
  constructor(
    private _posCarService: PosCarService,
    private _posHomeService: PosHomeService,
    fb: FormBuilder,
    private _errorHandleService: ErrorHandleService
  ) {
    this.carForm = fb.group({
      CarBrandCode: ["", Validators.required],
      CarModelCode: ["", Validators.required],
      CarVariantCode: ["", Validators.required],
      RegistrationYearCode: ["", Validators.required],
      RegistrationYearDesc: [""],
      RegistrationDate: [new Date(), Validators.required],

      FuelCode: ["", Validators.required],

      CarBrandDesc: [""],
      CarModelDesc: [""],
      CarVariantDesc: [""],
      CubicCapacity: [""],
      VariantName: [""],
      SeatingCapacity: [""],
      FuelDesc: ["", Validators.required],
    });
  }
  onEditCar() {
    //console.log(this.vData);

    if (this.vData && this.vData.edit == 1) {
      debugger
      this.selectedFuelType = this.vData.VehicleFuelCode
      this.carForm.patchValue({
        CarBrandCode: this.vData.VehicleBrandCode,
        CarModelCode: this.vData.VehicleModelCode,
        CarVariantCode: this.vData.VehicleVarientCode,
        RegistrationYearCode: this.vData.VehicleRegistrationYrCode,
        FuelCode: this.vData.VehicleFuelCode,

        CubicCapacity: "",

        CarBrandDesc: this.vData.VehicleBrandDesc,
        CarModelDesc: this.vData.VehicleModelDesc,
        CarVariantDesc: this.vData.VehicleVarientDesc,
        RegistrationYearDesc: this.vData.VehicleRegistrationYrDesc,
        FuelDesc: this.vData.VehicleFuelDesc,

      });

      let RegDate = this.vData.RegistrationDate;//.split("/");
      this.carForm.patchValue({
        RegistrationDate: RegDate
      })// moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2]))

      this.carFormData = this.carForm.value
      this.carFormData.FuelTypeDesc = this.carForm.value.FuelDesc
    }
  }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;
  ngOnInit(): void {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);

    // if (
    //   this._posCarService.CarBrandList &&
    //   this._posCarService.CarBrandList.length
    // ) {
    //   this.carBrandList = this._posCarService.CarBrandList;
    // } else this.getBrand(this.insuranceCateCode);
    this.getBrand(this.insuranceCateCode);
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


  ngOnChanges(simpleChange: SimpleChanges): void {
    if (this.carFormData) {
      this.carForm.patchValue({
        CarBrandCode: this.carFormData.CarBrandCode,
        CarModelCode: this.carFormData.CarModelCode,
        CarVariantCode: this.carFormData.CarVariantCode,
        RegistrationYearCode: this.carFormData.RegistrationYearCode,

        CarBrandDesc: this.carFormData.CarBrandDesc,
        CarModelDesc: this.carFormData.CarModelDesc,
        CarVariantDesc: this.carFormData.CarVariantDesc,
        RegistrationYearDesc: this.carFormData.RegistrationYearDesc,
        FuelDesc: this.carFormData.FuelTypeDesc,
        FuelCode: this.carFormData.FuelCode,
        CubicCapacity: this.carFormData.CubicCapacity,
        SeatingCapacity: this.carFormData.SeatingCapacity,
        VariantName: this.carFormData.VariantName
      })

      let RegDate
      if (this.carFormData.RegistrationDate == "" ||
        this.carFormData.RegistrationDate === null ||
        this.carFormData.RegistrationDate === undefined) {
        RegDate = convertToMydate(new Date());
      } else {
        RegDate = this.carFormData.RegistrationDate.toString().split("/");
      }
      this.carForm.patchValue({
        RegistrationDate: moment(new Date(RegDate[1] + "/" + RegDate[0] + "/" + RegDate[2]))
      })

    }

  }
  handleImageError(event: any, carBrand: any) {
    carBrand!.style!.display = "none"
    // event.target.style.display = 'none'; // hide the <img> tag
  }

  // ngAfterContentChecked() {

  // }

  // public getCarName(carValue) {
  //   console.log(carValue);
  // let carName = this.carBrandList
  //   ? this.carBrandList.find((car) => {
  //       return car.CarBrandCode == carValue;
  //     })
  //   : null;
  // if (carName) {
  //   return carName.CarBrandDesc;
  // } else return carValue;

  // console.log(carName);
  // }

  private _filterBrands(value: string): ICarBrands[] {
    // let filterValue = typeof value === "string" ? value.toLowerCase() : "";
    // console.log(filterValue);

    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.carBrandList.filter((car) =>
      // car.CarBrandDesc.toLowerCase().includes(filterValue)
      car.CarBrandDesc.toLowerCase().includes(filterBy)
    );
  }
  private _filterModels(value: string): ICarModels[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.carModelList.filter((car) =>
      car.CarModelDesc.toLowerCase().includes(filterBy)
    );
  }
  private _filterVariants(value: string): ICarVariants[] {
    // if (!this.carVariantList || this.carVariantList.length === 0) return [];
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.carVariantList.filter((car) =>
      car.CarVariantDesc.toLowerCase().includes(filterBy)
    );
  }
  private _filterRegYear(value: string): IRegistrationYear[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.regYearList.filter((car) =>
      car.RegistrationYearDesc.toLowerCase().includes(filterBy)
    );
  }
  private _filterFuels(value: string): IFuel[] {
    const filterBy =
      value && typeof value === "string" ? value.toLowerCase() : value;
    return this.carFuelList.filter((car) =>
      car.FuelTypeDesc.toLowerCase().includes(filterBy)
    );
  }

  get af() {
    return this.carForm;
  }
  setMakeValidator() {

    this.af
      .get("CarBrandDesc")!
      .setValidators([Validators.required, RequireMatch(this.carBrandList)]);
    this.af.get("CarBrandDesc")!.updateValueAndValidity();
  }

  setModelValidator() {
    this.af
      .get("CarModelDesc")!
      .setValidators([Validators.required, RequireMatchModel(this.carModelList)]);
    this.af.get("CarModelDesc")!.updateValueAndValidity();
  }

  setVariantValidator() {
    this.af
      .get("CarVariantDesc")!
      .setValidators([Validators.required, RequireMatchVariant(this.carVariantList)]);
    this.af.get("CarVariantDesc")!.updateValueAndValidity();
  }

  setFuelValidator() {
    this.af
      .get("FuelDesc")!
      .setValidators([Validators.required, RequireMatchFuel(this.carFuelList)]);
    this.af.get("FuelDesc")!.updateValueAndValidity();
  }

  setRegYearsValidator() {
    this.af
      .get("RegistrationYearDesc")!
      .setValidators([Validators.required]);
    this.af.get("RegistrationYearDesc")!.updateValueAndValidity();
  }

  // _filter() {
  //   if (this.selectedTab == 0) {
  //     this.filteredOptions = this.carBrandList.filter((car) => {
  //       return car.CarBrandDesc.toLowerCase().includes(this.selectedCarManuf);
  //     });
  //   }
  //   if (this.selectedTab == 1) {
  //     this.filteredOptions = this.carModelList.filter((carModelData) => {
  //       return carModelData.CarModelDesc.toLowerCase().includes(
  //         this.selectedCarModel
  //       );
  //     });
  //   }
  //   if (this.selectedTab == 2) {
  //     this.filteredOptions = this.carVariantList.filter((carVarianData) => {
  //       return carVarianData.CarVariantDesc.toLowerCase().includes(
  //         this.selectedCarVariant
  //       );
  //     });
  //   }
  //   if (this.selectedTab == 3) {
  //     this.filteredOptions = this.regYearList.filter((carRegYearData) => {
  //       return carRegYearData.RegistrationYearDesc.toLowerCase().includes(
  //         this.selectedRegYear
  //       );
  //     });
  //   }
  // }

  //#region  private functions

  private getBrand(insuranceCateCode: number) {
    this.showLoader = true;
    this._subscriptions.push(
      this._posCarService.getCarBrand(insuranceCateCode).subscribe(
        (result) => {
          this.showLoader = false;

          this.filteredOptions = this.carForm.controls[
            "CarBrandDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterBrands(value))
          );
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "Car"
            this.errorLogDetails.MethodName = 'GetCarBrand';
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              //console.log(res)
            })
          }
          if (result.successcode == "1") {
            this.carBrandList = result.data;
            this.setMakeValidator()
          }
        },
        (err: any) => {
          this.showLoader = false;
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "Car"
          this.errorLogDetails.MethodName = 'GetCarBrand';
          this.errorLogDetails.ErrorCode = '0';
          this.errorLogDetails.ErrorDesc = "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            //console.log(res)
          })
          this._errorHandleService.handleError(err);
        }
      ))
  }

  private getModel(CarBrandCode: number) {
    this.showLoader = true;
    this._subscriptions.push(
      this._posCarService.getCarModel(CarBrandCode).subscribe(
        (result) => {
          this.showLoader = false;

          this.filteredCarModels = this.carForm.controls[
            "CarModelDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterModels(value))
          );
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "Car"
            this.errorLogDetails.MethodName = 'GetCarModel';
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              //console.log(res)
            })
          }
          if (result.successcode == "1") {
            this.carModelList = result.data;
            this.setModelValidator()
          }
        },
        (err: any) => {
          this.showLoader = false;
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "Car"
          this.errorLogDetails.MethodName = 'GetCarModel';
          this.errorLogDetails.ErrorCode = '0';
          this.errorLogDetails.ErrorDesc = "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            //console.log(res)
          })
          this._errorHandleService.handleError(err);
        }
      ))
  }
  private getVariant(CarModelCode: number, FuelTypeCode: number) {
    this.showLoader = true;
    this.carVariantList = [];
    this._subscriptions.push(
      this._posCarService.getCarVarient(CarModelCode, FuelTypeCode).subscribe(
        (result) => {
          this.showLoader = false;
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "Car"
            this.errorLogDetails.MethodName = '`GetCarVarient';
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              //console.log(res)
            })
          }
          if (result.successcode == "1") {
            this.carVariantList = result.data;
            this.setVariantValidator()
            this.getRegistrationYear(this.insuranceCateCode);
          }

          this.filteredCarVariants = this.carForm.controls[
            "CarVariantDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterVariants(value))
          );
        },
        (err: any) => {
          this.showLoader = false;
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "Car"
          this.errorLogDetails.MethodName = 'GetCarVarient';
          this.errorLogDetails.ErrorCode = '0';
          this.errorLogDetails.ErrorDesc = "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            //console.log(res)
          })
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

          this.filteredCarRegYears = this.carForm.controls[
            "RegistrationYearDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterRegYear(value))
          );

          this.filteredFuels = this.carForm.controls[
            "FuelDesc"
          ].valueChanges.pipe(
            startWith(""),
            map((value) => this._filterFuels(value))
          );

          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = "";
            this.errorLogDetails.CompanyName = "";
            this.errorLogDetails.ControllerName = "PosHome"
            this.errorLogDetails.MethodName = 'GetFuelYearList';
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
              //console.log(res)
            })
          }

          if (result.successcode == "1") {
            this.regYearList = result.data.Table1;
            this.carFuelList = result.data.Table;
            this.setFuelValidator();
            this.setRegYearsValidator();
          }
        },
        (err: any) => {
          this.showLoader = false;
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "PosHome"
          this.errorLogDetails.MethodName = 'GetFuelYearList';
          this.errorLogDetails.ErrorCode = '0';
          this.errorLogDetails.ErrorDesc = "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            //console.log(res)
          })
          this._errorHandleService.handleError(err);
        }
      ))
  }

  //#endregion

  //#region  public functions
  public reset() {
    this.carForm.reset();
    this.selectedTab = 0;
    this.selectedCarManuf = "";
    this.selectedCarModel = "";
    this.selectedCarVariant = "";
    this.selectedFuelType = "";
    this.openBy = "";
    this.carModelList = [];
    this.carVariantList = [];
  }
  public onSelectCarBrand(selected: string) {
    this.carBrandSelected = true;
    // this.selectedCarManuf = selected;
    let values = selected.split(",");
    this.selectedCarManuf = values[1]; ////

    this.selectedCarModel =
      this.selectedCarVariant =
      this.selectedRegYear =
      this.selectedFuelType =
      "";
    if (selected) {
      this.getModel(+values[0]);
      this.getRegistrationYear(this.insuranceCateCode);
      // this.carBrandCode = +values[0];
      this.carForm.patchValue({
        CarBrandCode: +values[0],
        CarModelCode: "",
        CarVariantCode: "",
        RegistrationYearCode: "",
        CarModelDesc: "",
        CarBrandDesc: values[1],
        FuelDesc: "",
        FuelCode: "",
        CarVariantDesc: "",
        RegistrationYearDesc: "",
        RegistrationDate: moment(new Date())

      });

      this.selectedTab = 1;
    }
  }
  public onSelectCarModel(selected: string) {
    debugger
    this.carModelSelected = true;
    let values = selected.split(",");
    this.selectedCarModel = values[1]; ////
    this.selectedCarVariant = this.selectedRegYear = "";
    this.getRegistrationYear(this.insuranceCateCode);
    if (selected != null) {
      if (this.selectedFuelType && this.carForm.get("FuelDesc") && this.carForm.get("FuelDesc")!.errors === null) {
        this.getVariant(+values[0], +this.carForm.get("FuelCode")!.value);
        this.selectedTab = 2;
      }

      this.carForm.patchValue({
        CarModelCode: +values[0],
        CarVariantCode: "",
        RegistrationYearCode: "",

        CarModelDesc: values[1],
      });
    }
    if (!this.selectedFuelType) {
      this.Sel = true;
    }

    // this.selectedTab = 2;
  }
  public onSelectCarVariant(selected: string): void {
    debugger
    this.carVarientSelected = true;
    this.selectedRegYear = "";
    let values = selected.split(",");
    this.selectedCarVariant = values[1];
    if (selected) {
      if (this.openBy == "newCarForm") {
        this.getRegistrationYear(this.insuranceCateCode);
        if (this.regYearList.length > 0) {
          const currentYear = this.regYearList.find(
            (item) =>
              item.RegistrationYearDesc ==
              new Date().getUTCFullYear().toString()
          );

          this.carForm.patchValue({
            CarVariantCode: +values[0],
            RegistrationYearCode: currentYear
              ? currentYear.RegistrationYearCode
              : 0,

            // RegistrationYearDesc: currentYear
            // ? currentYear.RegistrationYearDesc
            // : "",
            RegistrationYearDesc: "New",
            CarVariantDesc: values[1],
            CubicCapacity: values[2],
            SeatingCapacity: values[3],
            VariantName: values[4],
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
        this.carForm.patchValue({
          CarVariantCode: +values[0],
          // RegistrationYearCode: 0,

          CarVariantDesc: values[1],
          CubicCapacity: values[2],
          SeatingCapacity: values[3],
          VariantName: values[4],
          RegistrationDate: ""
        });
        // this.getRegistrationYear(this.insuranceCateCode);

        this.selectedTab = 3;
      }
    }
  }
  // public onSelectRegYear(selected: string): void {
  //   // this.selectedRegYear = selected;
  //   let codeYearArray = selected.split(","); // eg: 14,2019
  //   this.selectedRegYear = codeYearArray[1]; ////////////

  //   this.carForm.patchValue({
  //     RegistrationYearCode: +codeYearArray[0],
  //     FuelCode: this.selectedFuelType ? this.carForm.get("FuelCode")!.value : 0,

  //     RegistrationYearDesc: codeYearArray[1],
  //   });

  //   this.closePopup();
  // }

  public onSelectRegYear(): void {

    let selected = convertToMydate(this.carForm.controls["RegistrationDate"]!.value);

    this.carForm.patchValue({
      RegistrationYearCode: +(selected.split("/")[2].toString().slice(2, 4)),
      RegistrationYearDesc: selected.split("/")[2]
    });
  }
  public onSelectCarFuel(selected: any) {
    // this.selectedFuelType = event.value;

    if (selected != null) {
      //if (this.selectedFuelType != null) {
      let value = selected.split(",");
      if (this.selectedCarModel) {
        this.getVariant(+this.carForm.get("CarModelCode")!.value, +value[0]);
        // this.getVariant(+this.selectedCarModel.split(",")[0]);
        this.Sel = false;
        this.selectedTab = 2;
      }
      this.selectedFuelType = selected.split(",")[1];

      this.carForm.patchValue({
        FuelCode: +selected.split(",")[0],
        CarVariantCode: "",
        RegistrationYearCode: "",

        FuelDesc: this.selectedFuelType,
      });
    }
  }
  closePopup() {
    this.selectedTab = 0;
    debugger
    if (this.carForm.valid) {
      const carForm = this.carForm.value;

      const carInfo = new CarInfoModel(
        carForm.CarBrandCode,
        carForm.CarModelCode,
        carForm.CarVariantCode,
        carForm.FuelCode
      );

      // carInfo.CarBrandDesc = this.selectedCarManuf.split(",")[1];
      // carInfo.CarModelDesc = this.selectedCarModel.split(",")[1];
      // carInfo.CarVariantDesc = this.selectedCarVariant.split(",")[1];
      // carInfo.FuelTypeDesc = this.selectedFuelType.split(",")[1];
      // carInfo.RegistrationYearCode = carForm.RegistrationYearCode;
      // carInfo.RegistrationYearDesc = this.selectedRegYear.split(",")[1];
      /////////////////////////////
      carInfo.CarBrandDesc = carForm.CarBrandDesc,
        carInfo.CarModelDesc = carForm.CarModelDesc,
        carInfo.CarVariantDesc = carForm.CarVariantDesc,
        carInfo.FuelTypeDesc = carForm.FuelDesc,
        carInfo.RegistrationYearCode = carForm.RegistrationYearCode,
        carInfo.RegistrationYearDesc = carForm.RegistrationYearDesc,
        carInfo.RegistrationDate = carForm.RegistrationDate;

      carInfo.CubicCapacity = carForm.CubicCapacity,
        carInfo.SeatingCapacity = carForm.SeatingCapacity,
        carInfo.VariantName = carForm.VariantName,
        // console.log(carInfo);
        /////////////////////////////
        // carInfo.CarBrandDesc = this.selectedCarManuf;
        // carInfo.CarModelDesc = this.selectedCarModel;
        // carInfo.CarVariantDesc = this.selectedCarVariant;
        // carInfo.FuelTypeDesc = this.selectedFuelType;
        // carInfo.RegistrationYearCode = this.registrationYearCode;
        // carInfo.RegistrationYearDesc = this.selectedRegYear;
        // console.log(carInfo);

        // if (this.openBy != 'newCarForm') {
        //     if (this.carForm.get('RegistrationYearCode').value)
        // }
        this.carFormData = carInfo
      console.log(this.carFormData);

      this.closePopupClick.emit(carInfo);
    } else this.closePopupClick.emit(null);
  }
  //#endregion
  selectedTabChange(e: any) {
    //console.log(this.selectedTab);
    // const vData = JSON.parse(sessionStorage.getItem("CarData"));
    if (this.vData && this.vData.edit == 1) {
      if (this.selectedTab == 0) {
        this.getBrand(this.insuranceCateCode);
      }
      if (this.selectedTab == 1) {
        this.getModel(this.carForm.value.CarBrandCode);
      }
      if (this.selectedTab == 2) {
        this.getVariant(
          this.carForm.value.CarModelCode,
          this.carForm.value.FuelCode
        );
      }
      if (this.selectedTab == 3) {
        this.getRegistrationYear(this.insuranceCateCode);
      }
    }
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}


export function RequireMatch(Make: ICarBrands[]) {
  return (control: AbstractControl) => {
    debugger

    const typed: any = control.value;
    let stateFound = Make.find((mk) => mk.CarBrandDesc === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}


export function RequireMatchModel(Model: ICarModels[]) {
  return (control: AbstractControl) => {
    const typed: any = control.value ? control.value.toLowerCase() : "";
    let stateFound = Model.find((mk: ICarModels) => mk.CarModelDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchVariant(Model: ICarVariants[]) {
  return (control: AbstractControl) => {
    const typed: any = control.value ? control.value.toLowerCase() : '';
    let stateFound = Model.find((mk: ICarVariants) => mk.CarVariantDesc.toLowerCase() === typed);

    if (typed && !stateFound) return { requireMatch: true };
    else return null;
  };
}


export function RequireMatchRegYears(Years: IRegistrationYear[], SubCateDesc: string) {
  return (control: AbstractControl) => {

    if (SubCateDesc === "newCarForm") {
      return null;
    }
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
