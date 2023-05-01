import { yesNoList } from "./../../../models/common";
import {
  IHealthInsPlanUrlsResponse,
  IPlansMotor,
} from "./../../../models/health-insu.Model";
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  DebugElement,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { NCBList } from "src/app/models/common";
import { EYesNo } from "src/app/models/insurance.enum";
import {
  calculatePercent,
  decrypt,
  encrypt,
} from "src/app/models/common-functions";
import {
  ApplicationVehiclePlan,
  IApplicationVehiclePlan,
  IFilterVehiclePlan,
  IVehiclePlanFilter,
  IRenewVehicleQuato,
} from "src/app/models/bike-insu.Model";
import { VehicleBuyPlanService } from "../../services/vehicle-buyplan.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
import { IAddons } from "../../../models/car-insu.Model";
import { ApplicationVehicleData, errorLog } from "src/app/models/common.Model";
import { Observable, Subject } from "rxjs";
import { CarPlanAndPremiumDetailsComponent } from "src/app/shared/components/car-plan-and-premium-details/car-plan-and-premium-details.component";
import { MatDialog } from "@angular/material/dialog";
import { QuotesSharingModalComponent } from "src/app/shared/components/quotes-sharing-modal/quotes-sharing-modal.component";
import { NgxCaptureService } from "ngx-capture";
import { ResponseModalComponent } from "src/app/shared/components/response-modal/response-modal.component";
import * as $ from "jquery";
import { MatCheckboxChange } from "@angular/material/checkbox";

declare let html2canvas: any;

@Component({
  templateUrl: "./car-plans.component.html",
  styleUrls: ["./car-plans.component.css"],
})
export class CarPlansComponent implements OnInit, OnDestroy, AfterViewInit {
  private _subscriptions: any[] = [];

  @ViewChild("cpp", { static: false }) planCom!: CarPlanAndPremiumDetailsComponent;
  @ViewChild("shareQuotesModal", { static: false }) shareQuotesModal!: QuotesSharingModalComponent;
  @ViewChild("screen", { static: true }) screen: any;
  @ViewChild("showResponseModal", { static: false }) showResponseModal!: ResponseModalComponent;

  @ViewChild("showAntiTheftSubmitBtn") showAntiTheftSubmitBtn!: ElementRef;
  @ViewChild("submitAddonBtn") submitAddonBtn!: ElementRef;
  responseDetails: any;
  responseResult: any = [];
  showLoader = false;
  selectedIndex = 0;
  ncbList = NCBList;
  yearList: any = [];
  additionalCoverAddons: IAddons[] = [];
  additionalCoverAccessories: IAddons[] = [];
  additionalCoverAdditionalCovers: IAddons[] = [];
  additionalCoverVoluntaryInsurerDiscounts: IAddons[] = [];
  VoluntaryInsurerDiscounts = ["None", "2500", "5000", "7500", "15000"];
  postData: IApplicationVehiclePlan = new ApplicationVehiclePlan();
  plan: IFilterVehiclePlan = {
    isTPPD: false,
    isComprehensive: false,
    isTp: false,
    isOd: "",
    idvType: 0,
    previousNcb: "",
    currentNcb: "",
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
    Owner_Driver_PA_Cover_Other_Value: 0
  };
  minIdv: number = 0;
  maxIdv: number = 0;
  idvInputValue = new FormControl("", [
    Validators.required,
    Validators.maxLength(6),
  ]);
  discountAmt!: number;
  discountLoading!: number;
  isExMoreThan90Days!: boolean;
  // Validators.max(this.maxIdv),
  // Validators.min(this.minIdv),
  prvPolicyExDate = new FormControl("", [Validators.required]);
  previousPolicyTypeCode!: number;
  previousPolicyTypeDesc!: string;
  ncbInput = new FormControl("", [Validators.required]);
  idvRadioType = new FormControl(2);
  yesno = EYesNo;
  yesNolist = yesNoList;
  checkedbox!: boolean;
  isNcbEditable = true;
  popupActive = "ncb";
  minDate!: Date;
  maxDate!: Date;
  planResponse: IPlansMotor[] = [];
  planLoader = true;
  filterPlans: IPlansMotor[] = [];
  // unmatchedPlans: IPlansMotor[] = [];
  premiumDataPlans: any;
  addon: FormGroup;
  idvErrMsg!: string;
  responseCount!: number;
  apiUrls: IHealthInsPlanUrlsResponse[] = [];
  showOd!: boolean;
  showTp!: boolean;
  showComprehensive!: boolean;
  GetIPlansHealth!: IPlansMotor;
  sortPlans: boolean = false;
  minValue: number = 1000;
  maxValue: number = 616200;
  minV: number = 10000;
  maxV: number = 50000;
  unnamedPassengerCovers = ["20000", "30000", "40000", "50000", "100000", "200000"];


  // Addons params
  ElectricalAccessories: string = "0";
  NonElectricalAccessories: string = "0";
  CNGKit: string = "0";
  VoluntaryExcess: string = "0";
  PAtoPassenger: string = "0";
  updated!: Date;
  additionalCoverDisable: boolean = true;
  // New Addons default value
  Zero_Depreciation: number = 0;
  Roadside_Assistance: number = 0;
  Engine_Protection_Cover: number = 0;
  NCB_Protector: number = 0;
  Key_Lock_Replacement: number = 0;
  Consumables: number = 0;
  Daily_Allowance: number = 0;
  Invoice_Price: number = 0;
  Tyre_Protector: number = 0;
  RIM_Damage_Cover: number = 0;
  Loss_of_Personal_Belongings: number = 0;
  Paid_Driver_Cover: number = 0;
  Owner_Driver_PA_Cover: number = 0;
  savedCarData!: ApplicationVehicleData;
  addonsToBeCheckedBeforeBuying: number[] = [1, 3, 8, 9, 6];
  // [zero dep, engine protection,Invoice,tyre protector,consumables]
  disableControlsUntilLoading: boolean = true;
  customIdv: boolean = true;
  display: string = "none";
  AddCoverDisplay: string = "none";
  idvPopUp: string = "none";
  AddonsClose: boolean = false;
  addonConfirmation: string = "none";
  myModal: string = "none";
  hadPolicy: string = "none";
  premiumPopUp: boolean = false;
  myPAcoverModel: any;
  PaCoverReason: number | undefined | null;
  Owner_Driver_PA_Cover_Other_Value!: number | null;


  private set setMinDays(days: number) {
    if (days != 0) {
      const dt = new Date();
      this.minDate = new Date(
        +dt.getFullYear(),
        +dt.getMonth(),
        +dt.getDate() - days
      );
    }
  }
  private set setMaxDays(days: number) {
    if (days != 0) {
      const dt = new Date();
      this.maxDate = new Date(
        +dt.getFullYear(),
        +dt.getMonth(),
        +dt.getDate() + days
      );
    }
  }

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private vbService: VehicleBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private screenCaptureService: NgxCaptureService,
    private renderer: Renderer2
  ) {
    this.addon = _fb.group({
      addonCoverName: [""],
    });
  }
  ngAfterViewInit(): void {
    console.log(this.showAntiTheftSubmitBtn, this.submitAddonBtn);

  }




  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  errors: errorLog[] = []
  link: any;
  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    this.savedCarData = JSON.parse(sessionStorage.getItem("CarData")!);
    if (this.savedCarData.edit == 1) {
      this.savedCarData.edit = 0;
      sessionStorage.setItem("CarData", JSON.stringify(this.savedCarData));
    }
    if (sessionStorage.getItem("reviewData"))
      sessionStorage.removeItem("reviewData");
    if (sessionStorage.getItem("postData"))
      sessionStorage.removeItem("postData");
    if (sessionStorage.getItem("finalData"))
      sessionStorage.removeItem("finalData");
    if (sessionStorage.getItem("regNo")) sessionStorage.removeItem("regNo");
    if (sessionStorage.getItem("appNo")) sessionStorage.removeItem("appNo");
    if (sessionStorage.getItem("proposalNo"))
      sessionStorage.removeItem("proposalNo");
    this.plan.idvType = 3;
    this._subscriptions.push(
      this.route.paramMap.subscribe((p: any) => {
        var ApplicationNo = p.get("a_id");
        var ApplicationNoOdp = p.get("odp");
        this.postData.ApplicationNo = Number(decrypt(ApplicationNo));
        this.postData.ApplicationNoOdp = Number(decrypt(ApplicationNoOdp));
        this.get(this.postData.ApplicationNo, this.postData.ApplicationNoOdp);
      })
    );
    this.yearList = [
      { id: 1, value: "1 Year" },
      { id: 2, value: "2 Year" },
      { id: 3, value: "3 Year" },
    ];
    this.getAddonsData();
    // $("#AddCover").click(function () {
    //   $(".additionalCovers").addClass("open");
    // });
    // $("#AddonsClose").click(function () {
    //   $(".additionalCovers").removeClass("open");
    // });
    this.AddonsClose = false;
    this.plan.isMultiYear = this.yearList[0];
    this.checkCurrentPolicyExDuration();
  }
  checkCurrentPolicyExDuration() {
    let carData = JSON.parse(sessionStorage.getItem("CarData")!);
    //console.log("CarDATa=", carData);

    if (carData.VehicleExpiryDesc == "Expired more than 90 days") {
      this.isExMoreThan90Days = true;
      //console.log(this.isExMoreThan90Days);
      // this.ncbInput.setValue(this.plan.currentNcb = 0);
    } else {
      this.isExMoreThan90Days = false;
    }
  }
  get(id: number, idOdp: number) {
    this.showLoader = true;
    this._subscriptions.push(
      this.vbService
        .getApplicationVehiclePlan(id, idOdp)
        .subscribe((result) => {

          this.showLoader = false;
          if (result.successcode == "1" && result.data) {
            // it works after slecting any plan
            if (result.data.Table[0]) {
              const res: IVehiclePlanFilter = result.data.Table[0];

              this.plan.isTp = res.CompTPODCode == EYesNo.YES;
              this.plan.isComprehensive = !this.plan.isTp;
              // this.plan.zeroDp = res.ZeroDepCode == EYesNo.YES;
              // this.plan.paCover = res.PACoverCode == EYesNo.YES;

              // const yr = this.yearList.find((item) =>
              //   this.getSelected(item, res.MultiYrCode.toString())
              // );
              this.yearList = [{ id: 1, value: "1 year" }];

              // this.plan.idvValue = res.IDVValue;
              // this.ncbInput.setValue((this.plan.ncb = res.PrvNCBDesc));

              this.isNcbEditable = res.PrvNCBDesc != "0";
              this.popupActive = "ncb";
              this.prvPolicyExDate.setValue(
                (this.plan.PolicyExpiryDate = new Date())
              ); //set date from DB
            }

            // to display bike info
            if (result.data.Table1[0]) {
              const bikeres: IRenewVehicleQuato = result.data.Table1[0];

              this.plan.ClaimPrvPolicyDesc = bikeres.ClaimPrvPolicyDesc;
              this.plan.PrvPolicyExCode = bikeres.PrvPolicyExCode;
              this.plan.SubCateCode = bikeres.SubCateCode;
              this.plan.SubCateDesc = bikeres.SubCateDesc;
              // this.GetCarQuotation(this.postData.ApplicationNo,this.postData.ApplicationNoOdp);
              this.callForQuotation();
              if (bikeres.SubCateCode == 3 && bikeres.VehicleNo == "") {
                // renew
                this.yearList = [
                  { id: 1, value: "1 Year" },
                  { id: 2, value: "2 Years" },
                  { id: 3, value: "3 Years" },
                ];
                this.plan.isMultiYear = this.yearList[0];
                this.plan.vehicleNo = bikeres.VehicleNo;
                this.plan.rto = bikeres.VehicleRTODesc;
                this.plan.vehicleDesc =
                  bikeres.VehicleBrandDesc +
                  " , " +
                  bikeres.VehicleModelDesc +
                  " , " +
                  bikeres.VehicleVarientDesc;
                this.plan.engineSize = bikeres.EngineSize;
                this.plan.RegYear = bikeres.VehicleRegistrationYrDesc;
                // this.plan.ncb = bikeres.PreviousNCB; // by sourabh
                this.ncbInput.setValue(
                  (this.plan.previousNcb = bikeres.PreviousNCB)
                );
                this.plan.currentNcb = bikeres.CurrentNCB;
                if (
                  this.plan.ClaimPrvPolicyDesc == "YES" ||
                  this.isExMoreThan90Days
                )
                  this.ncbInput.setValue((this.plan.currentNcb = 0));

                this.plan.PolicyExpiryDate = bikeres.PreviousPolicyExpiryDate; //  ---- by sourabh
                this.prvPolicyExDate.setValue(
                  new Date(bikeres.PreviousPolicyExpiryDate)
                ); //  ---- by sourabh

                this.previousPolicyTypeCode = bikeres["PreviousPolicyTypeCode"];
                this.previousPolicyTypeDesc = bikeres["PreviousPolicyTypeDesc"];

                //  setting default values of toggle buttons according to previous(or existing) policy type
                if (
                  this.previousPolicyTypeCode == 1 ||
                  this.previousPolicyTypeCode == 4
                ) {
                  this.showTp = this.showComprehensive = this.showOd = true; //disable
                  this.plan.isOdOnly = true; //check
                  this.plan.isTp = this.plan.isComprehensive = false; //uncheck
                }
                if (
                  this.previousPolicyTypeCode == 2 ||
                  this.previousPolicyTypeCode == 6
                ) {
                  this.showOd = true; //disable
                  this.plan.isComprehensive = true; //check
                  this.plan.isOdOnly = this.plan.isTp = false; //uncheck
                }
                if (
                  this.previousPolicyTypeCode == 7 ||
                  this.previousPolicyTypeCode == 3 ||
                  this.previousPolicyTypeCode == 5
                ) {
                  // this.showOd = true; //disable
                  this.showOd = this.showComprehensive = this.showTp = true; //disable
                  this.plan.isTp = true; //check
                  this.plan.isOdOnly = this.plan.isComprehensive = false; //uncheck
                }

                // let year = new Date().getFullYear() - Number(this.plan.RegYear);
                // if (year <= 3) {
                //   // to showOd toggle set this.showOd = false
                //   this.showOd = false;
                // } else {
                //   this.showOd = true;
                // }
              } else {
                //new
                this.yearList = [
                  { id: 1, value: "1 Year" },
                  { id: 2, value: "2 Years" },
                  { id: 3, value: "3 Years" },
                  { id: 4, value: "4 Years" },
                  { id: 5, value: "5 Years" },
                ];
                this.plan.isMultiYear = this.yearList[2];
                this.plan.rto = bikeres.VehicleRTODesc;
                this.plan.vehicleDesc =
                  bikeres.VehicleBrandDesc +
                  ", " +
                  bikeres.VehicleModelDesc +
                  ", " +
                  bikeres.VehicleVarientDesc;
                this.plan.RegYear = bikeres.VehicleRegistrationYrDesc;
                this.plan.isComprehensive = true;
                this.plan.isTp = false;
              }
              // if (bikeres.SubCateCode == 3 && !result.data.Table[0]) {
              //   this.manageFilters(
              //     bikeres.PrvPolicyExCode,
              //     bikeres.ClaimPrvPolicyCode,
              //     bikeres.VehicleExpiryCode
              //   );
              // }
            }
          } else {

            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "SBIGeneral";
              this.errorLogDetails.MethodName = "GetVihclePolicyIssurance";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  //console.log(res);
                });

            }

          }
        })
    );
  }
  // GetCarQuotation
  private GetCarQuotation(id: number, idOdp: number) {
    this.planResponse = [];
    this.filterPlans = [];
    this.responseResult = [];
    this._subscriptions.push(
      this.vbService.getCarQuotationUrls(id, idOdp).subscribe((result) => {
        this.planLoader = false;
        this.responseCount = 0;
        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "VehicleData";
          this.errorLogDetails.MethodName = "GetCarQuotationUrl";
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              //console.log("error----=>", res);
            });

        }
        if (result.successcode == "1" && result.data) {
          // IBikeQuotationUrls

          this.apiUrls = result.data;
          result.data.map((apiData: any) => {
            if (apiData.APIMethod) this.fetchUrlData(apiData);
            else this.responseCount++;
          });

          // for (let i = 0; i < result.data.length; i++) {
          //   if (result.data[i].APIMethod) this.fetchUrlData(result.data[i]);
          //   else this.responseCount++;
          // }
        }
      })
    );
  }

  // getIDV() {
  //   const filterdata = {
  //     PartnerId: "0",
  //     ProductCode: "0",
  //     ApplicationNo: this.postData.ApplicationNo,
  //     ApplicationNoOdp: this.postData.ApplicationNoOdp,
  //   };
  //   this.minIdv = Math.min.apply(Math, this.CompareMinIdvValueOfComp);
  //   this.maxIdv = Math.max.apply(Math, this.CompareMaxIdvValueOfComp);
  //   console.log(this.minIdv, this.maxIdv);

  //   // this.vbService.GetIDVValue(filterdata).subscribe((result) => {
  //   //   if (result.successcode == "1" && result.data) {
  //   //
  //   //     if (this.plan.idvValue == 0)
  //   //       this.plan.idvValue = result.data.MinIDVVAlue;
  //   //   }
  //   // });
  // }

  getIDV() {
    if (
      this.CompareMaxIdvValueOfComp.length > 0 ||
      this.CompareMinIdvValueOfComp.length > 0
    ) {
      this.minIdv = Math.min.apply(Math, this.CompareMinIdvValueOfComp);
      this.maxIdv = Math.max.apply(Math, this.CompareMaxIdvValueOfComp);
    }
    // const filterdata = {
    //   PartnerId: "0",
    //   ProductCode: "0",
    //   ApplicationNo: this.postData.ApplicationNo,
    //   ApplicationNoOdp: this.postData.ApplicationNoOdp,
    // };

    // this.vbService.GetIDVValue(filterdata).subscribe((result) => {
    //   if (result.successcode == "1" && result.data) {
    //
    //     if (this.plan.idvValue == 0)
    //       this.plan.idvValue = result.data.MinIDVVAlue;
    //   }
    // });
  }

  CompareMinIdvValueOfComp: any = [];
  CompareMaxIdvValueOfComp: any = [];

  requestForCarPlan: any;
  private fetchUrlData(data: any) {
    const filterdata = {
      ApplicationNo: data.ApplicationNo,
      ApplicationNoOdp: data.ApplicationNoOdp,
      PartnerId: data.Partnerid,
      ProductCode: data.ProductCode,
      APIBaseUrl: data.APIBaseUrl,
      APIMethod: data.APIMethod,
      PolicyTenure: +this.plan.isMultiYear.value.replace(/[^\d-]/g, ""),
      IDVValue: this.plan.idvValue,
      PreviousNCB: this.plan.previousNcb == "" ? "0" : this.plan.previousNcb,
      CurrentNCB: this.plan.currentNcb == "" ? "20" : this.plan.currentNcb,
      // Addons

      Zero_Depreciation: this.Zero_Depreciation,
      Roadside_Assistance: this.Roadside_Assistance,
      Engine_Protection_Cover: this.Engine_Protection_Cover,
      NCB_Protector: this.NCB_Protector,
      Key_Lock_Replacement: this.Key_Lock_Replacement,
      Consumables: this.Consumables,
      Daily_Allowance: this.Daily_Allowance,
      Invoice_Price: this.Invoice_Price,
      Tyre_Protector: this.Tyre_Protector,
      RIM_Damage_Cover: this.RIM_Damage_Cover,
      Loss_of_Personal_Belongings: this.Loss_of_Personal_Belongings,

      // Accessories

      ElectricalAccessories: this.ElectricalAccessories,
      NonElectricalAccessories: this.NonElectricalAccessories,
      CNGKit: this.CNGKit,

      // Additional Covers

      Paid_Driver_Cover: this.Paid_Driver_Cover,
      Owner_Driver_PA_Cover: this.Owner_Driver_PA_Cover,
      PAtoPassenger: this.PAtoPassenger,
      Owner_Driver_PA_Cover_Other_Value: this.Owner_Driver_PA_Cover_Other_Value,
      // Voluntary Insurer Discounts

      VoluntaryExcess: this.VoluntaryExcess,

      // AntiTheft Discount

      AntiTheft: this.antiTheftValue,
      stopLoader: true,
    };

    this.requestForCarPlan = filterdata;
    // ElectricalAccessories: +this.ElectricalAccessories != undefined?this.ElectricalAccessories:'0',
    // CNGKit: +this.CNGKit != undefined?this.CNGKit:'0',
    // VoluntaryExcess: +this.VoluntaryExcess != undefined?this.VoluntaryExcess:'0',
    // PAtoPassenger: +this.PAtoPassenger != undefined ?this.PAtoPassenger:'0',

    this.showLoader = true;
    this._subscriptions.push(
      this.vbService.getInsuranceCompanyPlan(filterdata).subscribe(
        (result) => {


          if (result.successcode == "0" || result.successcode == null) {

            let response = {
              UserCode: this.posMobileNo,
              ApplicationNo: this.postData.ApplicationNo,
              CompanyName: data.APIMethod.split("/")[0],
              ControllerName: data.APIMethod.split("/")[0],
              MethodName: data.APIMethod.split("/")[1],
              ErrorCode: result.successcode ? result.successcode : '0',
              ErrorDesc: result.msg ? result.msg : "Some thing went wrong",
            }
            this.errors.push(response)

            let ResponseData: any = {
              result: result,
              data: data
            }
            this.responseResult.push(ResponseData)
          }

          this.responseCount++;
          if (result.successcode == "1" && result.data != null) {
            this.showLoader = false;
            result.data.Premium = Math.round(result.data.NetPremium);
            this.CompareMinIdvValueOfComp.push(result.data.MinIDVVAlue);
            //console.log(this.CompareMinIdvValueOfComp);
            this.CompareMaxIdvValueOfComp.push(result.data.MaxIDVVAlue);
            //console.log(this.CompareMaxIdvValueOfComp);
            this.discountAmt = Number(
              result.data.DiscountAmt.replace(/-/g || /--/, "")
            );
            this.discountLoading = Number(
              result.data.DiscountLoading.replace(/-/g || /--/, "")
            );
            let idvBasic = result.data.CoverageList.find(
              (x: any) => x.CoverageCode === "IDV Basic"
            );
            let ncb = result.data.CoverageList.find(
              (x: any) => x.CoverageCode === "No Claim Bonus"
            );

            if (idvBasic.TPPremium === null) idvBasic.TPPremium = "0";
            if (
              this.discountAmt != null &&
              idvBasic.ODPremium != null &&
              idvBasic.TPPremium
            ) {
              if (this.plan.SubCateCode == 3) {
                // Renew
                if (this.plan.isComprehensive)
                  // if (ncb == undefined)
                  //   result.data.Premium = Math.round(
                  //     Number(idvBasic.ODPremium) +
                  //       Number(idvBasic.TPPremium) +
                  //       Number(result.data.DiscountAmt.replace(/--/g, "-"))
                  //   );
                  // else
                  result.data.Premium = Math.round(
                    Number(idvBasic.ODPremium) +
                    Number(idvBasic.TPPremium) -
                    // Number(ncb.ODPremium) +
                    // Number(result.data.DiscountAmt.replace(/--/g, "-"))
                    Number(this.discountAmt)
                  );
                if (this.plan.isTp)
                  result.data.Premium = Math.round(Number(idvBasic.TPPremium));
                console.log(result.data.Premium);
                if (this.plan.isOdOnly)
                  result.data.Premium = Math.round(
                    Number(idvBasic.ODPremium) - Number(this.discountAmt)
                  );

                // if (ncb != undefined && +result.data.DiscountAmt != 0)
                //   // result.data.Premium = Math.round(Number(idvBasic.ODPremium));
                //   result.data.Premium = Math.round(
                //     Number(idvBasic.ODPremium) +
                //       Number(result.data.DiscountAmt.replace(/--/g, "-")) +
                //       Number(ncb.ODPremium)
                //   );
                // else if (ncb != undefined)
                //   result.data.Premium = Math.round(
                //     Number(idvBasic.ODPremium) + Number(ncb.ODPremium)
                //   );
                // else
                //   result.data.Premium = Math.round(
                //     Number(idvBasic.ODPremium) +
                //       Number(result.data.DiscountAmt.replace(/--/g, "-"))
                //   );
              } else {
                // New
                result.data.Premium = Math.round(
                  Number(idvBasic.ODPremium) +
                  Number(idvBasic.TPPremium) -
                  // Number(result.data.DiscountAmt.replace(/--/g, "-"))
                  Number(this.discountAmt)
                );
                // if(result.data.CompanyCode == 9)
                //   for (let i = 0; i < result.data.CoverageList.length; i++) {
                //     if (result.data.CoverageList[i].CoverageCode != "IDV Basic")
                //       this.checkedAddons.push(result.data.CoverageList[i])
                //       this.addAddonsValue(this.checkedAddons);
                //   }
              }
              result.data.selectedAddons = [];
            }
            if (result.data.Premium != 0) {
              this.addOrSubtractAddonValue(result.data);
              result.data.MinIDVVAlue = Math.round(result.data.MinIDVVAlue);
              this.planResponse.push(result.data);
            }
            this.filterPlans = this.planResponse;
            // this.addAddonsValue(this.checkAccessoriesValues);
          }
          if (this.apiUrls.length == this.responseCount) {
            this.planLoader = true;
            this.disableControlsUntilLoading = false;
            this._errorHandleService
              .sendErrorLog(this.errors)
              .subscribe((res: any) => {
                console.log("error----=>", res);
              });
            if (this.idvRadioType.value != 3) this.getIDV();
            this.additionalCoverDisable = false;
            // if (!this.additionalCoverDisable) {
            // $("#AddCover").click(function () {
            //   $(".additionalCovers").addClass("open");
            // });
            // this.AddonsClose = true;
            // }
            // if (this.plan.isTp || this.plan.isComprehensive) {
            // this.plan.paCover = true;
            // this.onChangePAcover();
            // this.addAddonsValue(this.checkedAddons);
            // this.addOrSubtractAddonValue();
            this.filterPlans = JSON.parse(JSON.stringify(this.filterPlans));
            console.log(this.filterPlans);

            // this.addAddonsValue(this.checkAccessoriesValues);
            // }
          } else this.showLoader = false;
        },
        (error) => {
          console.log("Error.status", error.status);
          console.log("Error", error);
          // this.responseCount++;
          this.showLoader = false;
        }
      )
    );
  }

  ncbExpDateErrMsg = "";
  onClickPreviousPolicyTab(type: string): any {
    this.ncbExpDateErrMsg = "";
    if (this.isNcbEditable == false && this.popupActive == "ncb") return false;
    this.popupActive = type;
  }

  onClickOkPrvPolicyModal(ncbValue: any): any {
    this.ncbInput.patchValue(ncbValue);
    this.ncbExpDateErrMsg = "";
    if (this.isNcbEditable && this.popupActive != "ncb")
      this.popupActive = "ncb";
    else if (this.popupActive == "ncb" && this.ncbInput.invalid) {
      this.ncbExpDateErrMsg = "Please select your previous NCB";
      return false;
    } else {
      this.plan.PolicyExpiryDate = this.prvPolicyExDate.value;
      this.plan.previousNcb = this.ncbInput.value;
      if (+this.ncbInput.value != 50) {
        this.plan.currentNcb =
          +this.ncbInput.value != 0
            ? String(
              +this.ncbInput.value == 25 || +this.ncbInput.value == 35
                ? +this.ncbInput.value + 10
                : +this.ncbInput.value + 5
            )
            : "20";
      } else this.plan.currentNcb = this.ncbInput.value;
      this._subscriptions.push(
        this.vbService
          .getUpdatedNCB(
            this.postData.ApplicationNo,
            this.plan.currentNcb,
            this.plan.previousNcb
          )
          .subscribe((res) => {
            //console.log(res);
            if (res.successcode == "0" || res.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
              this.errorLogDetails.CompanyName = '';
              this.errorLogDetails.ControllerName = 'VehicleData'
              this.errorLogDetails.MethodName = "UpdateNCB"
              this.errorLogDetails.ErrorCode = res.successcode ? res.successcode : "0";
              this.errorLogDetails.ErrorDesc = res.msg ? res.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  //console.log("error----=>", res);
                });
            }
            if (res.successcode == "1") {
              this.callForQuotation();
              // $("#policyExpiryDateModal").modal("hide");
            }
          })
      );
      // this.GetCarQuotation(this.postData.ApplicationNo,this.postData.ApplicationNoOdp);
    }
  }

  // New idv functions
  gridsize: number = 30;
  updateSetting(event: any) {
    this.gridsize = event.value;
  }
  formatLabel(value: number) {
    return value;
  }
  // New idv functions end

  onClickOpenIdvModal() {
    this.idvErrMsg = "";
    this.checkedbox = false;
    this.idvRadioType.setValue(this.plan.idvType ? this.plan.idvType : 2);
    if (this.checkedbox == false) {
      this.idvInputValue.disable();
      this.idvInputValue.setValue(this.plan.idvValue);
    }
    // $("#idvModal").modal("show");
    this.idvPopUp = "block";
  }

  onSetValueClick(idvType: number): any {

    this.idvErrMsg = "";
    if (
      (this.idvInputValue.value < this.minIdv ||
        this.idvInputValue.value > this.maxIdv) &&
      !this.customIdv
    ) {
      this.idvErrMsg = "IDV value must be between minimum and maximum";
      return false;
    }

    this.plan.idvType = this.idvRadioType.value;
    if (this.idvInputValue.invalid && idvType == 3) {
      this.idvErrMsg =
        this.idvInputValue.value == null
          ? "Please enter IDV value"
          : "IDV value must be between minimum and maximum";
      // $("#idvId").focus();
      this.idvPopUp = "none";
      return false;
    } else {
      this.plan.idvValue = this.idvInputValue.value;
      if (idvType == 3) {
        // this.GetCarQuotation(this.postData.ApplicationNo,this.postData.ApplicationNoOdp);
        this.callForQuotation();
        this.idvPopUp = "none";
        // $("#idvModal").modal("hide");
      }
    }
  }
  onChangeIdv(event: any) {
    this.idvErrMsg = "";
    if (event.checked == true) {
      this.idvInputValue.enable();
      // $("#idvId").focus();
      this.idvPopUp = "block";
    } else if (this.checkedbox == true || event.checked == false) {
      this.idvInputValue.disable();
    }
  }

  setCustomIdv(event: any) {
    if (event.checked) {
      this.customIdv = false;
      // $("#idvId").focus();
      this.idvPopUp = "block";
      this.idvInputValue.enable();
    } else {
      this.customIdv = true;
      this.idvInputValue.disable();
      this.idvInputValue.setValue(0);
    }
  }

  onClickNotYourCar() {
    let vData: ApplicationVehicleData = JSON.parse(
      sessionStorage.getItem("CarData")!
    );
    vData.edit = 1;
    sessionStorage.setItem("CarData", JSON.stringify(vData));
    this._router.navigate(["/pos/car-insurance"]);
  }

  // addonInPreviousPolicy = new Subject();
  // onBuyPlanClick1(item: IPlansMotor) {
  //   
  //   this.GetIPlansHealth = item;
  //   if (this.plan.SubCateCode == 3) {
  //     // Renew Case
  //     if (
  //       +this.savedCarData.PrvPolicyExCode !== 1 &&
  //       item.CompanyCode === "9"
  //     ) {
  //       // rollover case , with tata aig company only
  //       let addonFound: boolean;
  //       let addonSelected: IAddons[] = [];
  //       this.checkedAddons.forEach((addon) => {
  //         if (this.addonsToBeCheckedBeforeBuying.includes(+addon.RecordNo)) {
  //           $("#addonConfirmation").modal("show");
  //           addonSelected.push(addon);
  //           addonFound = true;
  //         }
  //       });
  //       this.addonInPreviousPolicy.next(addonSelected);
  //       if (!addonFound) $("#myModal").modal("show");
  //     } else {
  //       $("#myModal").modal("show");
  //     }
  //   } else if (this.plan.SubCateCode == 4) {
  //     // New case
  //     this.onBuyPlanClick(item);
  //   }
  // }

  // hadAddonsInPreviousPolicy() {
  //   $("#myModal").modal("show");
  //   $("#addonConfirmation").modal("hide");
  // }

  // refactored...

  addonInPreviousPolicy: any = new Subject();
  onBuyPlanClickTataAig() {
    debugger
    let addonFound: boolean = false;

    let addonSelected: IAddons[] = [];
    this.checkedAddons.forEach((addon) => {
      if (this.addonsToBeCheckedBeforeBuying.includes(+addon.RecordNo)) {
        // $("#addonConfirmation").modal("show");
        this.addonConfirmation = "block";
        addonSelected.push(addon);
        addonFound = true;
      }
    });
    if (!addonFound) {
      this.myModal = "none";
      this.onBuyPlanClick(this.GetIPlansHealth);
      return;
    }
    this.addonInPreviousPolicy.next(addonSelected);

    // let addonFound: boolean;
    // this.checkedAddons.forEach((addon) => {
    //   if (this.addonsToBeCheckedBeforeBuying.includes(+addon.RecordNo)) {
    //     $("#addonConfirmation").modal("show");
    //     addonFound = true;
    //   }
    // });
    // if (!addonFound) $("#myModal").modal("show");
  }

  onBuyPlanClickRelianceAda() {

    if (this.plan.paCover !== true && (this.showOd === true || this.showOd === undefined)) {
      this.myPAcoverModel = "block";
    } else {
      this.myPAcoverModel = 'none'

    }
  }

  onBuyPlanClick1(item: IPlansMotor) {
    debugger
    this.GetIPlansHealth = item;

    if (this.plan.SubCateCode == 3) {
      // Renew Case
      if (this.plan.isOdOnly == false && item.CompanyCode === '11' && (this.PaCoverReason === null || this.PaCoverReason === undefined)) {
        this.onBuyPlanClickRelianceAda()
      }
      if (item.CompanyCode === "12") {
        this.myModal = "none";
        this.onBuyPlanClick(item);
        return
      }
      if (item.CompanyCode === "8") {
        this.myModal = "none";
        this.onBuyPlanClick(item);
        return;
      }
      if (item.CompanyCode === '4') {
        this.myModal = "none";
        this.onBuyPlanClick(item);
        return;
      }
      if (+this.savedCarData.PrvPolicyExCode !== 1) {
        // rollover case
        if (item.CompanyCode === "9") this.onBuyPlanClickTataAig();
        else this.myModal = "block";
      }
      // $("#myModal").modal("show");
      else {
        // break-in case
        // $("#myModal").modal("show");
        if (item.CompanyCode === '9') {
          this.myModal = "none";
          this.onBuyPlanClick(item);
          return;
        } else {
          this.myModal = "block";
        }
      }
    } else if (this.plan.SubCateCode == 4) {
      // New case

      if (item.CompanyCode === '11' && this.plan.paCover !== true && (this.PaCoverReason === null || this.PaCoverReason === undefined)) {
        this.onBuyPlanClickRelianceAda()
      } else {
        this.onBuyPlanClick(item);
      }
      // this.onBuyPlanClick(item)
    }
  }

  modelclose1(id: any) {

    this.myPAcoverModel = "none";
    // yes=1 & no=2
    console.log('-----><', id, this.PaCoverReason)
    if (id !== undefined && this.plan.SubCateCode == 3) {
      this.plan.Owner_Driver_PA_Cover_Other_Value = id
      this.myPAcoverModel = "none";
      // this.myModal = "block";
      this.onBuyPlanClick1(this.GetIPlansHealth)
      return true;
    } else if (id !== undefined && this.plan.SubCateCode == 4) {
      this.plan.Owner_Driver_PA_Cover_Other_Value = id
      this.myPAcoverModel = "none";
      // this.myModal = "block";
      this.onBuyPlanClick(this.GetIPlansHealth)
      return true;
    }
    else {
      this.myPAcoverModel = "block";
      // this.myModal = "none";
      return false
    }
  }

  hadAddonsInPreviousPolicy() {
    // $("#myModal").modal("show");
    // $("#addonConfirmation").modal("hide");
    this.addonConfirmation = "none";
    if (this.GetIPlansHealth.CompanyCode === '9') {
      this.myModal = "none";
      this.onBuyPlanClick(this.GetIPlansHealth);
      return;
    } else {
      this.myModal = "block";
    }

  }

  modelclose(id: number): any {
    this.myModal = "none";
    // $("#myModal").modal("hide");
    // yes=1 & no=2
    if (id == 1) {
      // $("#myModal").modal("hide");
      this.myModal = "none";
      this.PaCoverReason = null
      // $("#hadPolicy").modal("show");
      this.hadPolicy = "block";
      return false;
    } else {
      this.onBuyPlanClick(this.GetIPlansHealth);
    }
  }

  onBuyPlanClick(item: any) {
    // if (!this.plan.paCover && this.plan.SubCateCode == 4) {
    //   this._errorHandleService._toastService.warning(
    //     "Personal Accident (PA) Cover is Mandatory",
    //     "Please select"
    //   );
    //   return false;
    // }
    let data = new ApplicationVehiclePlan();

    data.ApplicationNo = this.postData.ApplicationNo;
    data.ApplicationNoOdp = this.postData.ApplicationNoOdp;
    data.ClaimPrvPolicyCode = this.postData.ClaimPrvPolicyCode;
    data.ClaimPrvPolicyDesc = this.postData.ClaimPrvPolicyDesc;
    data.DownloadAmount = this.discountAmt;
    data.DownloadLoading = this.discountLoading;
    data.CompTPODDesc = "";
    if (this.plan.isTp) {
      data.CompTPODCode = 1;
      data.CompTPODDesc = "Third Party Only";
    } else {
      data.CompTPODCode = 2;
      data.CompTPODDesc = "Comprehensive";
    }

    // data.IDVValue = this.plan.idvValue;
    // data.IDVValue = +item.IDVValue;
    data.IDVValue = this.plan.idvValue ? this.plan.idvValue : +item.IDVVAlue;
    data.PrvNCBValue = +this.plan.previousNcb;
    data.PrvNCBDesc = this.plan.previousNcb.toString();

    data.ZeroDepCode = this.plan.zeroDp ? EYesNo.YES : EYesNo.NO;
    data.ZeroDepDesc = this.plan.zeroDp
      ? EYesNo[EYesNo.YES]
      : EYesNo[EYesNo.NO];

    data.PACoverCode = this.plan.paCover ? EYesNo.YES : EYesNo.NO;
    data.PACoverDesc = this.plan.paCover
      ? EYesNo[EYesNo.YES]
      : EYesNo[EYesNo.NO];

    data.Owner_Driver_PA_Cover_Other_Value = this.plan.Owner_Driver_PA_Cover_Other_Value
    if (this.plan.isMultiYear) {
      data.MultiYrCode = this.plan.isMultiYear.id;
      data.MultiYrDesc = this.plan.isMultiYear.value;
    } else {
      data.MultiYrCode = 0;
      data.MultiYrDesc = "";
    }
    data.InsurancePlanCode = 100;
    data.InsurancePlanDesc = "test";
    item["carRequestWithAddons"] = this.requestForCarPlan;
    let popupData = JSON.stringify(this.popupData(item));
    console.log("popupData", popupData);
    sessionStorage.setItem("popupData", popupData);
    this.showLoader = true;
    // this._subscriptions.push(
    //   this.vbService.saveSelectedPlan(data).subscribe(
    //     (result) => {
    //       // this.showLoader = false;
    //       if (result) {
    //         this._router.navigate([
    //           `/car-insurance/buyplan`,
    //           encrypt(`${this.postData.ApplicationNo}`),
    //           encrypt(`${this.postData.ApplicationNoOdp}`),
    //         ]);
    //       } else {

    //         this.errorLogDetails.UserCode = this.posMobileNo;
    //         this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
    //         this.errorLogDetails.CompanyName = '';
    //         this.errorLogDetails.ControllerName = "VehicleData"
    //         this.errorLogDetails.MethodName = "SaveVehicleRegData"
    //         this.errorLogDetails.ErrorCode = result.successcode;
    //         this.errorLogDetails.ErrorDesc = result.msg;
    //         this._errorHandleService
    //           .sendErrorLog(this.errorLogDetails)
    //           .subscribe((res: any) => {
    //             console.log("error----=>", res);
    //           });

    //         this._errorHandleService._toastService.warning(
    //           "Please try again later.",
    //           `Oop's`
    //         );
    //       }
    //     },
    //     (err: any) => {
    //       this.showLoader = false;
    //       this.errorLogDetails.UserCode = this.posMobileNo;
    //       this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
    //       this.errorLogDetails.CompanyName = '';
    //       this.errorLogDetails.ControllerName = "VehicleData"
    //       this.errorLogDetails.MethodName = "SaveVehicleRegData"
    //       this.errorLogDetails.ErrorCode = err;
    //       this.errorLogDetails.ErrorDesc = err
    //       this._errorHandleService
    //         .sendErrorLog(this.errorLogDetails)
    //         .subscribe((res: any) => {
    //           console.log("error----=>", res);
    //         });
    //       this._errorHandleService.handleError(err);
    //     }
    //   )
    // );



    if (this.GetIPlansHealth.CompanyCode == '2') {
      this._router.navigate([
        `/car-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);
    } else if (this.GetIPlansHealth.CompanyCode == '19' || this.GetIPlansHealth.CompanyCode == '16') {
      this._router.navigate([
        `/car-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);
    } else if (this.GetIPlansHealth.CompanyCode == '7' || this.GetIPlansHealth.CompanyCode == '13') {
      //  buyplan - Sbi /: a_id /: odp
      // this._router.navigate([
      //   `/bike-insurance/buyplan-Sbi`,
      //   encrypt(`${this.postData.ApplicationNo}`),
      //   encrypt(`${this.postData.ApplicationNoOdp}`),
      // ]);
      this._router.navigate([
        `/car-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);

    }
    // else if (this.GetIPlansHealth.CompanyCode == '13') {
    //   this._router.navigate([
    //     `/car-insurance/buyplan`,
    //     encrypt(`${this.postData.ApplicationNo}`),
    //     encrypt(`${this.postData.ApplicationNoOdp}`),
    //   ]);
    // }
    else if (this.GetIPlansHealth.CompanyCode == '4' || this.GetIPlansHealth.CompanyCode == '9') {
      this._router.navigate([
        `/car-insurance/buyplan`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
      ]);
    }
    else if (this.GetIPlansHealth.CompanyCode == '6') {
      this._router.navigate([
        `/car-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);

    } else if (this.GetIPlansHealth.CompanyCode == '8') {
      this._router.navigate([
        `/car-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);

    } else if (this.GetIPlansHealth.CompanyCode == '11') {
      this._router.navigate([
        `/car-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);
    }

    else {
      this._router.navigate([
        `/car-insurance/buyplan`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
      ]);
    }
    // this._router.navigate([
    //   `/car-insurance/buyplan`,
    //   encrypt(`${this.postData.ApplicationNo}`),
    //   encrypt(`${this.postData.ApplicationNoOdp}`),
    // ]);

  }

  selectTab(index: number, item: any): void {
    setTimeout(() => {
      this.selectedIndex = index;
    }, 100);
    this.popupData(item);
    this.planCom.PopUp = true;
    // $("#exampleModalCenter").modal("show");
  }

  popupData(item: any) {
    this.premiumDataPlans = item;
    console.log(item);
    let idvBasic = this.premiumDataPlans.CoverageList.find(
      (x: any) => x.CoverageCode === "IDV Basic"
    );
    if (idvBasic != undefined) {
      item["IDV"] = idvBasic;
      // add.push(idvBasic);
    }
    if (this.plan.isTp) {
      item.CoverageList = item.CoverageList.filter((x: any) => (x.CoverageID != 20) && x.CoverageID == 0 || x.CoverageID == 14 || x.CoverageID == 15 || x.CoverageID == 16 || x.CoverageID == 17)

      // item.CoverageList = item.CoverageList.filter((x) => x.CoverageID != 20);
    }
    // let NCB = item.CoverageList.find(
    //   (x) => x.CoverageCode === "No Claim Bonus"
    // );
    // if (NCB != undefined) item["NCB"] = NCB;

    console.log(item.CoverageList);
    this.premiumDataPlans["SubCateCode"] = this.plan.SubCateCode;
    this.premiumDataPlans["selectedAddons"] = item.CoverageList;
    this.premiumDataPlans["vehicleDesc"] = this.plan.vehicleDesc;
    this.premiumDataPlans["gst"] = this.calculateGstPercentage(
      this.premiumDataPlans.Premium
    );
    this.premiumDataPlans["DiscountAmt"] = Math.round(Number(item["DiscountAmt"])).toString().replace(/--/g, "-");
    item["DiscountPercent"] = calculatePercent(
      +idvBasic.ODPremium,
      Math.abs(+item["DiscountAmt"])
    );
    this.premiumDataPlans["isOdOnly"] = this.plan.isOdOnly;
    this.premiumDataPlans["isComprehensive"] = this.plan.isComprehensive;
    this.premiumDataPlans["isTp"] = this.plan.isTp;
    this.premiumDataPlans["pacover"] = this.plan.paCover;
    this.premiumDataPlans['Owner_Driver_PA_Cover_Other_Value'] = this.plan.Owner_Driver_PA_Cover_Other_Value
    this.premiumDataPlans["zeroDp"] = this.plan.zeroDp;
    this.premiumDataPlans["rto"] = this.plan.rto;
    this.premiumDataPlans["currentNcb"] = +this.plan.currentNcb;
    this.premiumDataPlans["previousPolicyExpiryDate"] =
      this.plan.PolicyExpiryDate;
    this.premiumDataPlans["tenure"] = Number(
      this.plan.isMultiYear.value.replace(/[^\d-]/g, "")
    );
    this.premiumDataPlans["amountPayableIncludingGst"] =
      this.premiumDataPlans.Premium +
      this.calculateGstPercentage(this.premiumDataPlans.Premium);
    this.premiumDataPlans = JSON.parse(JSON.stringify(this.premiumDataPlans));
    return this.premiumDataPlans;
  }

  calculateGstPercentage(amount: any) {
    return Math.round(amount * 0.18);
  }

  hadPolicyModalClose() {
    // $("#hadPolicy").modal("hide");
    this.hadPolicy = "none";
  }

  filterPremium() {
    this.sortPlans = !this.sortPlans;
    if (this.sortPlans) {
      this.filterPlans = this.filterPlans.sort((a, b) =>
        Number(a.Premium) > Number(b.Premium) ? -1 : 1
      );
    } else {
      this.filterPlans = this.filterPlans.sort((a, b) =>
        Number(a.Premium) > Number(b.Premium) ? 1 : -1
      );
    }
  }

  markAddonAsChecked: boolean = true;
  checkAddon!: boolean;
  onToggleChange(ind: number) {
    if (ind === 0) {
      //isComprehensive
      this.plan.isTp = this.plan.isOdOnly = false;
      if (this.plan.isComprehensive) {
        this.plan.zeroDp = this.plan.isTp = false;
        // this.plan.paCover = true;
        this.showDefaultValue(ind);
        // this.onChangePAcover();
      } else {
        // this.plan.isTp = this.plan.paCover = true;
        this.plan.isTp = true;
        this.plan.zeroDp = false;
        this.showDefaultValue(1);
        // this.onChangePAcover();
      }
    }
    if (ind === 1) {
      //isTp
      this.plan.isComprehensive = this.plan.isOdOnly = false;
      if (this.plan.isTp) {
        this.plan.zeroDp = this.plan.isComprehensive = false;
        // this.plan.paCover = true;
        this.showDefaultValue(ind);
        // this.onChangePAcover();
      } else {
        // this.plan.paCover = this.plan.isComprehensive = true;
        this.plan.isComprehensive = true;
        this.showDefaultValue(0);
        // this.onChangePAcover();
      }
    }
    if (ind === 2) {
      //isOdOnly
      this.plan.isTp = this.plan.isComprehensive = false;
      if (this.plan.isOdOnly) {
        this.plan.paCover = this.plan.zeroDp = false;
        this.showDefaultValue(ind);
      } else {
        // this.plan.isTp = this.plan.paCover = true;
        this.plan.isTp = true;
        this.plan.zeroDp = false;
        this.showDefaultValue(1);
        // this.onChangePAcover();
      }
    }

    this.checkedAddons.length = 0;
    this.checkAccessoriesValues.length = 0;
    this.uncheckAllAddons();
    this.plan.zeroDp = false;
    this.plan.paCover = false;
    this.callForQuotation();
    this.checkAddon = false;
    // this.showAccessories(14);
    this.showUnnamedCover = false
  }

  uncheckAllAddons() {

    this.checkedAddons.length = 0;
    // addons

    this.Zero_Depreciation = 0,
      this.Roadside_Assistance = 0,
      this.Engine_Protection_Cover = 0,
      this.NCB_Protector = 0,
      this.Key_Lock_Replacement = 0,
      this.Consumables = 0,
      this.Daily_Allowance = 0,
      this.Invoice_Price = 0,
      this.Tyre_Protector = 0,
      this.RIM_Damage_Cover = 0,
      this.Loss_of_Personal_Belongings = 0,

      // Accessories

      this.ElectricalAccessories = "0",
      this.NonElectricalAccessories = "0",
      this.CNGKit = "0",

      // Additional Covers

      this.Paid_Driver_Cover = 0,
      this.Owner_Driver_PA_Cover = 0,
      this.PAtoPassenger = "0",


      // Voluntary Insurer Discounts

      this.VoluntaryExcess = "0",

      // AntiTheft Discount

      this.antiTheftValue = 0

  }

  showDefaultValue(ind?: number) {

    for (let i = 0; i < this.filterPlans.length; i++) {
      let coverageList: any = this.filterPlans[i].CoverageList.find(
        (x) => x.CoverageCode === "IDV Basic"
      );
      let ncb = this.filterPlans[i].CoverageList.find(
        (x) => x.CoverageCode === "No Claim Bonus"
      );
      if (ind === 0) {
        //isComprehensive
        if (ncb == undefined) {
          this.filterPlans[i].Premium = Math.round(
            Number(coverageList.ODPremium) +
            Number(coverageList.TPPremium) +
            Number(this.filterPlans[i]["DiscountAmt"].replace(/--/g, "-"))
          );
        } else {
          this.filterPlans[i].Premium = Math.round(
            Number(coverageList.ODPremium) +
            Number(coverageList.TPPremium) +
            Number(ncb.ODPremium)
          );
        }
      } else if (ind === 1) {
        // for tp
        this.filterPlans[i].Premium = Math.round(
          Number(coverageList.TPPremium)
        );
      } else if (ind === 2) {
        // for odOnly
        if (ncb == undefined) {
          this.filterPlans[i].Premium = Math.round(
            Number(coverageList.ODPremium)
          );
        } else {
          this.filterPlans[i].Premium = Math.round(
            Number(coverageList.ODPremium) + Number(ncb.ODPremium)
          );
        }
      }
    }
  }

  pushUniqueAddon(addonArray: IAddons[], addonToBePushed: IAddons) {
    let addonExists = addonArray.find(
      (addon) => +addon.RecordNo === addonToBePushed.RecordNo
    );
    if (!addonExists) addonArray.push(addonToBePushed);
  }

  onChangePAcover(event: any) {
    let paAddon: any = this.additionalCoverVoluntaryInsurerDiscounts.find(
      (addon) => +addon.RecordNo === 16
    );
    this.addons(event, paAddon);
    this.callForQuotation()
    // if (this.plan.paCover) {
    //   this.pushUniqueAddon(this.checkedAddons, paAddon);
    // } else {
    //   this.removeAddonFromArray(this.checkedAddons, +paAddon.RecordNo);
    // }
    // this.updateCheckedAddonsArray();
  }

  onChangeZeroDep(event: any) {
    let zeroDepAddon: any = this.additionalCoverAccessories.find(
      (addon) => +addon.RecordNo === 1
    );
    this.addons(event, zeroDepAddon);
    this.callForQuotation()
  }

  removeAddonFromArray(addonArray: IAddons[], recordNo: number) {
    // 
    let addonIndex: any = addonArray.findIndex(
      (addon) => +addon.RecordNo === recordNo
    );

    if (addonIndex != -1) addonArray.splice(addonIndex, 1);
  }

  // Additional Covers
  checkAccessoriesValues: IAddons[] = [];
  showSubmitButton: boolean = false;

  checkAddons(event: any, item: IAddons, insuredMembersForm: any, i: any) {
    // 
    if (insuredMembersForm != undefined)
      if (item.RecordNo == 12 || item.RecordNo == 13) {
        insuredMembersForm.controls["accessories" + i].setValue(1000);
      } else {
        insuredMembersForm.controls["accessories" + i].setValue(10000);
      }
    if (event.checked) {
      this.checkAccessoriesValues.push(item);
    } else {
      let accessoryInAddonsArray = this.checkedAddons.find(
        (addon) => +addon.RecordNo === +item.RecordNo
      );
      if (+item.RecordNo === 12) this.ElectricalAccessories = "0";
      if (+item.RecordNo === 13) this.NonElectricalAccessories = "0";
      if (+item.RecordNo === 14) this.CNGKit = "0";
      // if (accessoryInAddonsArray) this.callForQuotation();
      this.removeAddonFromArray(this.checkedAddons, +item.RecordNo);
      this.removeAddonFromArray(this.checkedAddonsTemp, +item.RecordNo);
      this.removeAddonFromArray(this.checkAccessoriesValues, +item.RecordNo);
    }
    this.showSubmit();
    //console.log(this.checkAccessoriesValues);
  }

  // addOrSubtractAddonValue(recordNo) {
  //   for (let plan of this.filterPlans) {
  //     let coverage = plan.CoverageList.find(
  //       (coverage) => +coverage.CoverageID === recordNo
  //     );
  //     if (coverage) {
  //       if (!coverage.ODPremium) coverage.ODPremium = "0";
  //       if (!coverage.TPPremium) coverage.TPPremium = "0";
  //       plan.Premium -= Math.round(+coverage.ODPremium + +coverage.TPPremium);
  //     }
  //   }
  // }
  addOrSubtractAddonValue(plan: any) {
    // Note: provide operator either 'add' or 'subtract'
    // 

    plan["checkedAddons"] = this.checkedAddons;
    console.log(this.checkedAddons);
    plan.CoverageList.forEach((coverage: any) => {
      if (coverage.CoverageID !== 0) {
        if (this.plan.isTp) {
          if ((coverage.CoverageID != 20) && coverage.CoverageID == 0 || coverage.CoverageID == 14 || coverage.CoverageID == 15 || coverage.CoverageID == 16 || coverage.CoverageID == 17) {
            plan.Premium += +coverage.ODPremium + +coverage.TPPremium;
            plan.Premium = Math.round(plan.Premium);
          }
        } else {
          plan.Premium += +coverage.ODPremium + +coverage.TPPremium;
          plan.Premium = Math.round(plan.Premium);
        }
      }
    });
    //console.log("premium from addSub function", plan.Premium);
    //console.log(this.checkedAddons);
    //console.log(this.filterPlans);
  }

  // addAddonsValue(addonsArray) {
  //   //
  //   for (let j = 0; j < this.filterPlans.length; j++) {
  //     for (let i = 0; i < addonsArray.length; i++) {
  //       let coverageListData = this.filterPlans[j].CoverageList.find(
  //         (x) => +x.CoverageID == +addonsArray[i].RecordNo
  //       );

  //       if (coverageListData) {
  //         if (!+coverageListData.ODPremium) coverageListData.ODPremium = "0";
  //         if (!+coverageListData.TPPremium) coverageListData.TPPremium = "0";
  //         this.filterPlans[j].Premium +=
  //           +coverageListData.ODPremium + +coverageListData.TPPremium;
  //       }
  //     }
  //   }
  // }

  arrayValue(RecordNo: any, event: any) {
    let value = event.value;
    for (let i = 0; i < this.checkAccessoriesValues.length; i++) {
      if (this.checkAccessoriesValues[i].RecordNo == RecordNo) {
        this.checkAccessoriesValues[i].Getvalue = value;
        break;
      }
    }
  }

  showSubmit() {
    let FoundAccessories;
    for (let i = 0; i < this.checkAccessoriesValues.length; i++) {
      FoundAccessories =
        this.checkAccessoriesValues[i].RecordNo == 12 ||
        this.checkAccessoriesValues[i].RecordNo == 13 ||
        this.checkAccessoriesValues[i].RecordNo == 14;
    }
    this.showSubmitButton = FoundAccessories ? true : false;
  }

  accessoriesSubmitted: boolean = false;
  onSubmitAddons() {
    // $("#AddonsClose").click();
    // this.AddonsClose = false;

    this.accessoriesSubmitted = true;
    this.checkAccessoriesValues.forEach((addon) => {
      this.pushUniqueAddon(this.checkedAddons, addon);
    });

    //console.log(this.checkedAddons);

    for (let i = 0; i < this.checkedAddons.length; i++) {
      if (this.checkedAddons[i].RecordNo == 12) {
        this.ElectricalAccessories = String(this.checkedAddons[i].value);
      }
      if (this.checkedAddons[i].RecordNo == 13) {
        this.NonElectricalAccessories = String(this.checkedAddons[i].value);
      }
      if (this.checkedAddons[i].RecordNo == 14) {
        this.CNGKit = String(this.checkedAddons[i].value);
      }
      //  else if (this.checkedAddons[i].RecordNo == 18) {
      //   this.VoluntaryExcess = String(this.checkedAddons[i].value);
      //   console.log(this.VoluntaryExcess);
      // } else if (this.checkedAddons[i].RecordNo == 17) {
      //   this.PAtoPassenger = String(this.checkedAddons[i].value);
      // }
    }
    // this.callForQuotation();
  }


  showAccessories = (RecordNo: number): boolean =>
    this.checkAccessoriesValues.find(
      (f) => f.RecordNo == RecordNo && (f.RecordNo == 12 || f.RecordNo == 13)
    )
      ? false
      : true;

  showExternalAccessories = (RecordNo: number): boolean =>
    this.checkAccessoriesValues.find(
      (f) => f.RecordNo == RecordNo && f.RecordNo == 14
    )
      ? false
      : true;

  private getAddonsData() {
    this._subscriptions.push(
      this.vbService.GetAddonsForPrivateCar().subscribe((result) => {

        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
          this.errorLogDetails.CompanyName = '';
          this.errorLogDetails.ControllerName = 'PosHome'
          this.errorLogDetails.MethodName = "GetAddonsForPrivateCar"
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              //console.log("error----=>", res);
            });
        }

        if (result.successcode == "1" && result.data != null) {
          if (result.data) {
            result.data.forEach((item: any, i: any) => {
              // if (item.RecordNo == 8)
              //   result.data[i].AddOnCoverName = "New Vehicle Replacement";
            });
          }
          this.additionalCoverAccessories = result.data.filter(
            (x: any) => x.AddOnCoverTypeCode == 1
          );
          this.additionalCoverAdditionalCovers = result.data.filter(
            (x: any) => x.AddOnCoverTypeCode == 2
          );
          this.additionalCoverVoluntaryInsurerDiscounts = result.data.filter(
            (x: any) => x.AddOnCoverTypeCode == 3
          );
          this.additionalCoverAddons = result.data.filter(
            (x: any) => x.AddOnCoverTypeCode == 4
          );
        }
      })
    );
  }

  selectedVoluntaryInsurer = "None";
  selectedARAI: number = 0;
  showAntiTheftSubmit: boolean = false;
  antiTheftValue: number = 0;
  getVoluntaryInsurerDiscounts(item: any, RecordNo: any, voluntaryInsurerAddon: IAddons) {
    //console.log(item);

    if (RecordNo == 18) {
      // $("#AddonsClose").click();
      // this.AddCoverDisplay = "none";
      // this.AddonsClose = false;
      if (this.selectedVoluntaryInsurer != item) {
        this.selectedVoluntaryInsurer = item;
        this.VoluntaryExcess = this.selectedVoluntaryInsurer;
        //console.log(this.VoluntaryExcess);

        let voluntaryInsurerIndex = this.checkedAddons.findIndex(
          (addon) => addon.RecordNo === voluntaryInsurerAddon.RecordNo
        );

        if (voluntaryInsurerIndex != -1) {
          // addon found in checkedaddon array
          // subtract addon value from premium if selected None...
          if (this.selectedVoluntaryInsurer === "None") {
            this.VoluntaryExcess = "0";
            this.checkedAddons.splice(voluntaryInsurerIndex, 1);
            // this.addOrSubtractAddonValue();
            this.updateCheckedAddonsArray();
            // return false;
          } else {
            // replace old voluntary addon with new one
            this.checkedAddons.splice(
              voluntaryInsurerIndex,
              1,
              voluntaryInsurerAddon
            );
          }
        } else {
          // no voluntary insurer in checkedAddons
          this.checkedAddons.push(voluntaryInsurerAddon);
        }
        // this.callForQuotation();
      }
    } else {
      //Anti theft case
      this.antiTheftValue = +item.value;
      if (this.selectedARAI != this.antiTheftValue) {
        this.showAntiTheftSubmit = true;
      } else {
        this.showAntiTheftSubmit = false;
      }
    }
    this.updateCheckedAddonsArray();
  }

  onSubmitAntiTheft(voluntaryInsurerAddon: any) {

    // $("#AddonsClose").click();
    // this.AddonsClose = true;
    // this.AddCoverDisplay = "none";
    // this.AddonsClose = false;
    this.selectedARAI = this.antiTheftValue;
    if (this.selectedARAI === 1) {
      this.antiTheftValue = 1;
      this.pushUniqueAddon(this.checkedAddons, voluntaryInsurerAddon);
    } else {
      this.antiTheftValue = 0;
      this.removeAddonFromArray(
        this.checkedAddons,
        +voluntaryInsurerAddon.RecordNo
      );
    }
    this.showAntiTheftSubmit = false;

    // this.callForQuotation();
  }

  onChooseUnnamedCover(item: IAddons, cover: any) {
    //console.log(cover);

    if (this.selectedUnnamedCover != cover) {
      // $("#AddonsClose").click();
      // this.AddCoverDisplay = "none";
      // this.AddonsClose = false;

      this.selectedUnnamedCover = cover;
      this.PAtoPassenger = this.selectedUnnamedCover;
      let addonPresentIndex = this.checkedAddons.findIndex(
        (addon) => +addon.RecordNo === +item.RecordNo
      );

      if (addonPresentIndex != -1)
        this.checkedAddons.splice(addonPresentIndex, 1, item);
      else this.checkedAddons.push(item);

      // this.callForQuotation();
    }
    //console.log(this.checkedAddons);
  }

  checkedAddons: IAddons[] = [];
  checkedAddonsTemp: IAddons[] = [];
  disableZeroDep: boolean = false;
  count: number = 0;
  selectedUnnamedCover: any;
  showUnnamedCover!: boolean;
  otherEffectsOnAddonClick(event: any, item: IAddons) {
    if (event.checked) {
      this.checkedAddons.push(item);
      if (+item.RecordNo === 1) this.plan.zeroDp = true;
      // if (
      //   +item.RecordNo === 2 ||
      //   +item.RecordNo === 4 ||
      //   +item.RecordNo === 6 ||
      //   +item.RecordNo === 8
      // ) {
      //   this.count++;
      // if (!this.plan.zeroDp) {
      //   this.onChangeZeroDep(event);
      // }
      //   this.disableZeroDep = true;
      //   this.plan.zeroDp = true;
      // }
      if (+item.RecordNo === 16) this.plan.paCover = true;
      if (+item.RecordNo === 17) {
        this.removeAddonFromArray(this.checkedAddons, +item.RecordNo);
        this.showUnnamedCover = true;
      }
    } else {
      // $("#AddonsClose").click();
      this.AddCoverDisplay = "none";
      this.AddonsClose = false;
      if (+item.RecordNo === 1) this.plan.zeroDp = false;
      // if (
      //   +item.RecordNo === 2 ||
      //   +item.RecordNo === 4 ||
      //   +item.RecordNo === 6 ||
      //   +item.RecordNo === 8
      // ) {
      //   this.count--;
      //   if (this.count === 0) this.disableZeroDep = false;
      // }
      if (+item.RecordNo === 16) this.plan.paCover = false;
      if (+item.RecordNo === 17) {
        let addonPresent = this.checkedAddons.find(
          (addon) => +addon.RecordNo === +item.RecordNo
        );
        if (addonPresent) this.callForQuotation();
        this.showUnnamedCover = false;
        this.PAtoPassenger = "0";
      }
      this.removeAddonFromArray(this.checkedAddons, +item.RecordNo);
    }
  }
  // addons(event, item: IAddons) {
  //   this.OtherEffectsOnAddonClick(event, item);
  //   for (let plan of this.filterPlans) {
  //     let coverage = plan.CoverageList.find(
  //       (x) => +x.CoverageID === +item.RecordNo
  //     );

  //     //new
  //     if (coverage) {
  //       if (!coverage.ODPremium) coverage.ODPremium = "0";
  //       if (!coverage.TPPremium) coverage.TPPremium = "0";

  //       if (event.checked) {
  //         plan.Premium += Math.round(+coverage.ODPremium + +coverage.TPPremium);
  //       } else {
  //         plan.Premium -= Math.round(+coverage.ODPremium + +coverage.TPPremium);
  //       }
  //     }
  //   }
  //   this.updateCheckedAddonsArray()
  // }

  isChecked(RecordNo: number): boolean {


    return this.checkedAddons.some((x: IAddons) => x.RecordNo === RecordNo)
  }


  addons(event: any, item: IAddons) {
    debugger;
    console.log(event);

    if (event.checked) {
      // this.AddCoverDisplay = "none";
      this.checkedAddons.push(item);
      this.checkedAddonsTemp.push(item)
      if (item.RecordNo == 1) {
        this.Zero_Depreciation = 1;
        // this.plan.zeroDp = true;
      }
      if (item.RecordNo == 2) this.Roadside_Assistance = 1;
      if (item.RecordNo == 3) this.Engine_Protection_Cover = 1;
      if (item.RecordNo == 4) this.NCB_Protector = 1;
      if (item.RecordNo == 5) this.Key_Lock_Replacement = 1;
      if (item.RecordNo == 6) this.Consumables = 1;
      if (item.RecordNo == 7) this.Daily_Allowance = 1;
      if (item.RecordNo == 8) this.Invoice_Price = 1;
      if (item.RecordNo == 9) this.Tyre_Protector = 1;
      if (item.RecordNo == 10) this.RIM_Damage_Cover = 1;
      if (item.RecordNo == 11) this.Loss_of_Personal_Belongings = 1;
      if (item.RecordNo == 15) this.Paid_Driver_Cover = 1;
      if (item.RecordNo == 16) {
        this.Owner_Driver_PA_Cover = 1;
        // this.plan.paCover = true;
      }
      if (+item.RecordNo === 17) {
        this.removeAddonFromArray(this.checkedAddons, +item.RecordNo);
        this.removeAddonFromArray(this.checkedAddonsTemp, +item.RecordNo)
        this.showUnnamedCover = true;
        return;
      }
    } else {
      //console.log("this.checkedAddons", this.checkedAddons);
      let indexElem = this.checkedAddons.findIndex(
        (x) => x.RecordNo == item.RecordNo
      );

      if (indexElem != -1) this.checkedAddons.splice(indexElem, 1);

      if (item.RecordNo == 1) {
        this.Zero_Depreciation = 0;
        // this.plan.zeroDp = false;
      }
      if (item.RecordNo == 2) this.Roadside_Assistance = 0;
      if (item.RecordNo == 3) this.Engine_Protection_Cover = 0;
      if (item.RecordNo == 4) this.NCB_Protector = 0;
      if (item.RecordNo == 5) this.Key_Lock_Replacement = 0;
      if (item.RecordNo == 6) this.Consumables = 0;
      if (item.RecordNo == 7) this.Daily_Allowance = 0;
      if (item.RecordNo == 8) this.Invoice_Price = 0;
      if (item.RecordNo == 9) this.Tyre_Protector = 0;
      if (item.RecordNo == 10) this.RIM_Damage_Cover = 0;
      if (item.RecordNo == 11) this.Loss_of_Personal_Belongings = 0;
      if (item.RecordNo == 15) this.Paid_Driver_Cover = 0;
      if (item.RecordNo == 16) {
        this.Owner_Driver_PA_Cover = 0;
        // this.plan.paCover = false;
        this.Owner_Driver_PA_Cover_Other_Value = this.plan.Owner_Driver_PA_Cover_Other_Value

      }
      if (+item.RecordNo === 17) {
        this.removeAddonFromArray(this.checkedAddons, +item.RecordNo);
        this.removeAddonFromArray(this.checkedAddonsTemp, +item.RecordNo);
        this.showUnnamedCover = false;
        this.selectedUnnamedCover = null;
        this.PAtoPassenger = "0";
        if (indexElem == -1) return;
      }
    }
    // this.callForQuotation();
    console.log("this.checkedAddons", this.checkedAddons);

    // this.otherEffectsOnAddonClick(event, item);
    // if (event.checked) this.addOrSubtractAddonValue(+item.RecordNo, "add");
    // else this.addOrSubtractAddonValue(+item.RecordNo, "subtract");
    // this.updateCheckedAddonsArray();
  }

  // addons(event, item: IAddons) {
  //   this.OtherEffectsOnAddonClick(event, item);

  //   if (event.checked) {
  //     this.checkedAddons.push(item); //storing checked addon
  //   } else {
  //     this.checkedAddons.splice(
  //       this.checkedAddons.findIndex(
  //         (addon) => addon.RecordNo === item.RecordNo
  //       ),
  //       1
  //     );
  //   }
  // }

  // updateCheckedAddonsArray() {
  //   this.updated = new Date();
  // }



  updateCheckedAddonsArray() {
    this.updated = new Date();
  }

  callForQuotation() {
    // $("#AddonsClose").click();
    // this.AddonsClose = true;

    // const showAntiTheftSubmitBtn: any = document.getElementById("showAntiTheftSubmitBtn")
    // const submitAddonBtn: any = document.getElementById("submitAddonBtn")
    // console.log(showAntiTheftSubmitBtn, submitAddonBtn);

    debugger

    // if (this.showAntiTheftSubmitBtn && this.submitAddonBtn) {

    //   let antiTheftBtn: HTMLElement = this.showAntiTheftSubmitBtn.nativeElement;
    //   antiTheftBtn.click();
    //   let addonBtn: HTMLElement = this.submitAddonBtn.nativeElement;
    //   addonBtn.click();
    // }

    // this.renderer
    // ($("#showAntiTheftSubmitBtn") as any).trigger("click")
    //   ($("#submitAddonBtn") as any).trigger('click');

    this.additionalCoverDisable = true;
    this.AddCoverDisplay = "none";
    this.AddonsClose = false;
    this.onSubmitAddons()
    let zeroDpExists = this.checkedAddons.findIndex(x => x.RecordNo == 1)
    let paCoverExists = this.checkedAddons.findIndex(x => x.RecordNo == 16)
    console.log(zeroDpExists, paCoverExists);

    if (zeroDpExists !== -1) {
      this.plan.zeroDp = true;
    } else {
      this.plan.zeroDp = false
    }
    if (paCoverExists !== -1) {
      this.plan.paCover = true;
    } else {
      this.plan.paCover = false
    }
    // $("#AddCover").click(function () {
    //   $(".additionalCovers").removeClass("open");
    // });

    this.filterPlans = [];
    this.planResponse = [];
    this.disableControlsUntilLoading = true;
    this.GetCarQuotation(
      this.postData.ApplicationNo,
      this.postData.ApplicationNoOdp
    );

  }
  openModalDialog() {
    this.display = "block"; //Set block css
  }
  openAddonCoverPopUp() {


    this.AddonsClose = true;
    this.AddCoverDisplay = "block";
  }
  closeModalDialog() {

    this.display = "none"; //set none css after close dialog
    this.AddonsClose = false;
    this.AddCoverDisplay = "none";
    this.idvPopUp = "none";
    this.addonConfirmation = "none";
    this.myModal = "none";
    this.myPAcoverModel = 'none'
    this.PaCoverReason = null
    console.log(typeof (this.PaCoverReason))
  }

  premiumWithoutDiscount(item: any) {
    // console.log(item);
    let DiscountAmt = +item.DiscountAmt.replace(/-/g || /--/, "");
    let ncb = item.CoverageList.find(
      (cover: any) => cover.CoverageCode == "No Claim Bonus"
    );

    let actualAmount = "";

    if (ncb && +DiscountAmt) {
      if (!this.plan.isTp)
        actualAmount =
          +ncb.ODPremium != 0
            ? String(Math.round(+item.Premium - +ncb.ODPremium + DiscountAmt))
            : "";
    } else if (ncb) {
      if (!this.plan.isTp)
        actualAmount =
          +ncb.ODPremium != 0
            ? String(Math.round(+item.Premium - +ncb.ODPremium))
            : "";
    } else if (+DiscountAmt && !this.plan.isTp) {
      actualAmount = String(Math.round(+item.Premium + DiscountAmt));
    }
    return actualAmount;
  }

  openResponseModal() {


    this.showResponseModal.showResponse = true
    this.responseDetails = this.responseResult;

  }

  openDialog(): void {

    // const dialogRef = this.dialog.open(QuotesSharingModalComponent, {
    //   width: "250px",
    //   data: {},
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   console.log("The dialog was closed");
    // });
    this.shareQuotesModal.ApplicationNo = this.postData.ApplicationNo
    this.shareQuotesModal.showModal = true;
    this.captureScreen();
  }

  quotesDetailsForSharing: any;
  capturedImage: any;
  async captureScreen() {

    try {
      const capturePromise = this.screenCaptureService.getImage(
        this.screen.nativeElement,
        true
      );
      // let imgString = await capturePromise;
      // let convertedImageFile = this.convertBase64ToImage(imgString);
      capturePromise.subscribe((imgString) => {
        let convertedImageFile = imgString.replace("data:image/png;base64,", "");
        // let motorDesc = `${this.plan.RegYear} ${this.plan.engineSize ? this.plan.engineSize : ''} ${}`
        let motorDesc = this.plan.vehicleDesc;
        let regYear = this.plan.RegYear;
        let policyType = this.savedCarData["PreviousPolicyTypeDesc"]
          ? this.savedCarData["PreviousPolicyTypeDesc"]
          : this.savedCarData["SubCateDesc"];

        this.quotesDetailsForSharing = {
          image: convertedImageFile,
          planDescription: `${motorDesc} ${regYear} ${policyType}`,
        };
      })

    } catch (err) {
      //console.log("error occured");
      //console.log({ err });
    }

    // html2canvas

    // html2canvas(document.querySelector("#capture")).then((canvas) => {
    //   

    //   /// document.body.appendChild(canvas);
    //   this.capturedImage = canvas.toDataURL();
    //   console.log("canvas.toDataURL() -->" + this.capturedImage);
    //   // this will contain something like (note the ellipses for brevity), console.log cuts it off
    //   // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAa0AAAB3CAYAAACwhB/KAAAXr0lEQVR4Xu2dCdiNZf7HP/ZQkpQtaUxDjYYoTSYlURMhGlmKa..."

    //   canvas.toBlob(function (blob) {
    //     //  just pass blob to something expecting a blob
    //     // somfunc(blob);

    //     // Same as canvas.toDataURL(), just longer way to do it.
    //     var reader = new FileReader();
    //     
    //     reader.readAsDataURL(blob);
    //     reader.onloadend = function () {
    //       let base64data = reader.result;
    //       console.log("Base64--> " + base64data);
    //     };
    //   });
    // });
  }

  convertBase64ToImage(dataURI: string) {
    const splitDataURI = dataURI.split(",");
    const byteString =
      splitDataURI[0].indexOf("base64") >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(":")[1].split(";")[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
