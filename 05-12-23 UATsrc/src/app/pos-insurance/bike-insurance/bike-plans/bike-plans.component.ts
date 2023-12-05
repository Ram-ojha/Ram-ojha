import { RenewBikePlanYearList } from "./../../../models/common";
import {
  IHealthInsPlanUrlsResponse,
  IPlansHealth,
  IPlansMotor,
} from "src/app/models/health-insu.Model";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  IApplicationVehiclePlan,
  ApplicationVehiclePlan,
  IFilterVehiclePlan,
  IRenewVehicleQuato,
  IVehiclePlanFilter,
} from "src/app/models/bike-insu.Model";
import { NCBList, PlanYearList } from "src/app/models/common";
import { EYesNo } from "src/app/models/insurance.enum";
import { ApplicationVehicleData, errorLog, IInsuranceCompany, IList, MinMaxIDVInterface } from "src/app/models/common.Model";
import {
  calculatePercent,
  convertToMydate,
  decrypt,
  encrypt,
} from "src/app/models/common-functions";
import { VehicleBuyPlanService } from "../../services/vehicle-buyplan.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { PlanAndPremiumDetailsComponent } from "src/app/shared/components/plan-and-premium-details/plan-and-premium-details.component";
import { QuotesSharingModalComponent } from "src/app/shared/components/quotes-sharing-modal/quotes-sharing-modal.component";
import { NgxCaptureService } from "ngx-capture";
import { ResponseModalComponent } from "src/app/shared/components/response-modal/response-modal.component";
import { ApiResponse } from "src/app/models/api.model";
import { formatDate } from "@angular/common";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { map, Observable, startWith } from "rxjs";

@Component({
  templateUrl: "./bike-plans.component.html",
  styleUrls: ["./bike-plans.component.css"],
})
export class BikePlansComponent implements OnInit, OnDestroy {

  private _subscriptions: any = [];
  @ViewChild("ppp", { static: false })
  planCOmp!: PlanAndPremiumDetailsComponent;
  @ViewChild("shareQuotesModal", { static: false })
  shareQuotesModal!: QuotesSharingModalComponent;
  @ViewChild("screen", { static: true }) screen: any;
  @ViewChild("showResponseModal", { static: false })
  showResponseModal!: ResponseModalComponent;
  @ViewChild('closeModal') closeModal!: ElementRef;

  responseDetails: any;
  responseResult: any = [];
  showLoader = false;
  selectedIndex = 0;
  ncbList = NCBList;
  yearList: any = [];
  discountAmt!: number;
  discountLoading!: number;
  // sortPlans: number = 0;
  sortPlans: boolean = true;
  postData: IApplicationVehiclePlan = new ApplicationVehiclePlan();
  plan: IFilterVehiclePlan = {
    isTPPD: false,
    isComprehensive: false,
    isTp: true,
    isOd: "",
    idvType: 0,
    previousNcb: "",
    currentNcb: "",
    zeroDp: false,
    paCover: false,
    tppdCover: false,
    isMultiYear: { id: -0, value: "" },
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
  PACoverForm: FormGroup;
  prvPolicyExDate = new FormControl("", [Validators.required]);
  ncbInput = new FormControl("", [Validators.required]);
  idvRadioType = new FormControl(2);
  yesno = EYesNo;
  isNcbEditable = true;
  popupActive = "ncb";
  minDate!: Date;
  maxDate!: Date;
  planResponse: IPlansMotor[] = [];
  filteredPlans: IPlansMotor[] = [];
  planLoader = true;
  apiUrls: IHealthInsPlanUrlsResponse[] = [];
  premiumDataPlans: any;
  responseCount!: number;
  GetIPlansHealth!: IPlansMotor;
  showOd!: boolean;
  disableComprehensive!: boolean;
  disableTP!: boolean;
  customIdv: boolean = true;
  PreviousPolicyTypeCode!: number;
  PreviousPolicyTypeDesc!: string;
  disableControlsUntilLoading: boolean = true;
  isExMoreThan90Days!: boolean;
  vData!: ApplicationVehicleData;
  display = "none";
  idvPopUp: string = "none";
  addonConfirmation: string = "none";
  myModal: string = "none";
  hadPolicy: string = "none";
  premiumPopUp: boolean = false;
  NCB!: number;
  finalNCB!: number;
  ODPremium: string = "";
  newNCB: any;
  myPAcoverModel: any;
  PaCoverReason: number | undefined | null;
  date: string = convertToMydate(new Date());
  ErrMsg: string = "";
  CompanyCode: any;
  PacoverValues: any;
  myZeroDepQuesModal: string = 'none';

  public insuCompanyList: IInsuranceCompany[] = [];
  ppInsurerList!: Observable<IInsuranceCompany[]>;


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
  private _filterPPInsurer(value: string): IInsuranceCompany[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.insuCompanyList.filter(
      (row) => row.InsuranceCompanyDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private vbService: VehicleBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private checkPopupDisplay: ChangeDetectorRef,
    private screenCaptureService: NgxCaptureService,
    private _fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.PACoverForm = this._fb.group({
      Companyname: ["", [Validators.required]],
      PolicyStratDate: ["", [Validators.required]],
      PolicyNo: ["", [Validators.required]],
      PolicyEndDate: ["", [Validators.required]],
      SumInsured: ["", [Validators.required, Validators.min(1500000)]]
    })

  }
  // VisiblePlan : boolean = false;
  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  errors: errorLog[] = []
  link: any;
  //#region  work on page load
  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);

    this.vData = JSON.parse(sessionStorage.getItem("VehicleData")!);
    if (this.vData.edit == 1) {
      this.vData.edit = 0;
      sessionStorage.setItem("VehicleData", JSON.stringify(this.vData));
    }
    console.log(this.vData);

    this.plan.idvType = 3;
    // this.VisiblePlan = (this.vData["PreviousPolicyTypeDesc"] == 'Comrehensive') ? true : false;
    this.plan.isMultiYear = { id: 1, value: "1 year" }; //this.yearList[5];
    this._subscriptions.push(
      this.route.paramMap.subscribe((p: any) => {
        const No = p.get("a_id");
        const Odp = p.get("odp");
        this.postData.ApplicationNo = Number(decrypt(No));
        this.postData.ApplicationNoOdp = Number(decrypt(Odp));
        this.get(this.postData.ApplicationNo, this.postData.ApplicationNoOdp);
      })
    );

    sessionStorage.removeItem("postData");
    this.checkCurrentPolicyExDuration();
  }


  checkCurrentPolicyExDuration() {
    let carData = JSON.parse(sessionStorage.getItem("VehicleData")!);
    // console.log("CarDATa=", carData);

    if (carData.VehicleExpiryDesc == "Expired more than 90 days") {
      this.isExMoreThan90Days = true;
      console.log(this.isExMoreThan90Days);
      // this.ncbInput.setValue(this.plan.currentNcb = 0);
    } else {
      this.isExMoreThan90Days = false;
    }
  }

  // Slider
  formatLabel(value: number) {
    return value;
  }
  // Slider end

  private get(id: number, idOdp: number) {
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

              this.plan.zeroDp = res.ZeroDepCode == EYesNo.YES;
              this.plan.paCover = res.PACoverCode == EYesNo.YES;
              this.plan.tppdCover = res.TPPDCoverCode == EYesNo.YES;

              const yr: any = this.yearList.find((item: any) =>
                this.getSelected(item, res.MultiYrCode.toString())
              );
              this.plan.isMultiYear = yr;

              // this.plan.idvValue = res.IDVValue;
              this.ncbInput.setValue((this.plan.previousNcb = res.PrvNCBDesc));
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
              this.PreviousPolicyTypeCode = bikeres.PreviousPolicyTypeCode;
              this.PreviousPolicyTypeDesc = bikeres.PreviousPolicyTypeDesc;

              if (bikeres.SubCateCode == 1 && bikeres.VehicleNo == "") {
                // renew
                this.plan.vehicleNo = bikeres.VehicleNo;
                // this.plan.rto = bikeres.Location;
                this.plan.rto = bikeres.VehicleRTODesc;
                this.plan.vehicleDesc =
                  bikeres.VehicleBrandDesc +
                  ", " +
                  bikeres.VehicleModelDesc +
                  ", " +
                  bikeres.VehicleVarientDesc;
                // this.plan.vehicleDesc = bikeres.Description;

                // New Condition for Comprehensive, Od, tp, PA and zero
                if (
                  bikeres.PreviousPolicyTypeCode == 1 ||
                  bikeres.PreviousPolicyTypeCode == 7
                ) {
                  this.plan.isComprehensive = true;
                  this.plan.isTp = false;
                }
                if (
                  bikeres.PreviousPolicyTypeCode == 2 ||
                  bikeres.PreviousPolicyTypeCode == 8 ||
                  bikeres.PreviousPolicyTypeCode == 9 ||
                  bikeres.PreviousPolicyTypeCode == 4
                ) {
                  this.plan.isTp = true;
                  this.disableComprehensive = this.disableTP = true;
                }
                if (
                  bikeres.PreviousPolicyTypeCode == 3 ||
                  bikeres.PreviousPolicyTypeCode == 5 ||
                  bikeres.PreviousPolicyTypeCode == 6
                ) {
                  this.plan.isOdOnly = true;
                  this.plan.isTp = false;
                  this.showOd = true;
                }
                // New Condition for Comprehensive, Od, tp, PA and zero end

                this.plan.RegYear = bikeres.VehicleRegistrationYrDesc;
                // let year = (new Date().getFullYear() - Number(this.plan.RegYear));
                // if (year <= 3) {
                //     // For showing Od toggle
                //     this.showOd = false;
                // } else {
                //     this.showOd = true;
                // }
                this.plan.engineSize = bikeres.EngineSize;
                this.yearList = RenewBikePlanYearList;
                this.plan.isMultiYear = this.yearList[0];
                // this.plan.previousNcb = bikeres.PreviousNCB
                // this.plan.currentNcb = bikeres.CurrentNCB
                this.ncbInput.setValue(
                  (this.plan.previousNcb = bikeres.PreviousNCB)
                );
                this.plan.currentNcb = bikeres.CurrentNCB;
                if (this.plan.ClaimPrvPolicyDesc == "YES" ||
                  this.isExMoreThan90Days
                ) {
                  this.ncbInput.setValue(this.plan.currentNcb = 0);
                }
              } else {
                //new
                this.plan.rto = bikeres.VehicleRTODesc;
                this.plan.vehicleDesc =
                  bikeres.VehicleBrandDesc +
                  " , " +
                  bikeres.VehicleModelDesc +
                  " , " +
                  bikeres.VehicleVarientDesc;
                this.plan.RegYear = bikeres.VehicleRegistrationYrDesc;
                this.yearList = PlanYearList;
                this.plan.isMultiYear = this.yearList[4];
                this.plan.isComprehensive = true;
                this.plan.isTp = false;
              }
              // if (bikeres.SubCateCode == 1 && !result.data.Table[0]) {
              //     this.manageFilters(bikeres.PrvPolicyExCode, bikeres.ClaimPrvPolicyCode, bikeres.VehicleExpiryCode);
              // }
              this.getBikeQuotationUrl(
                this.postData.ApplicationNo,
                this.postData.ApplicationNoOdp
              );
            }
          } else {

            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = "";
              this.errorLogDetails.CompanyName = "";
              this.errorLogDetails.ControllerName = "VehicleData"
              this.errorLogDetails.MethodName = 'GetApplicationVehiclePlan';
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                //console.log(res)
              })
            }

          }
        })
    );
  }

  // GetBikeQuotation
  private getBikeQuotationUrl(id: number, idOdp: number) {
    this.showLoader = true;
    this.disableControlsUntilLoading = true;
    this.responseResult = [];

    this._subscriptions.push(
      this.vbService.getBikeQuotationUrls(id, idOdp).subscribe((result) => {
        this.showLoader = false;
        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "VehicleData"
          this.errorLogDetails.MethodName = 'GetBikeQuotationUrl';
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            //console.log(res)
          })
        }
        if (result.successcode == "1" && result.data) {
          this.apiUrls = result.data;
          this.getFilterData();
        }
      })
    );
  }

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
    //
    //     if (this.plan.idvValue == 0)
    //       this.plan.idvValue = Math.round(result.data.MinIDVVAlue);
    //   }
    // });
  }

  // GST Calculator
  calculateGstPercentage(amount: number) {
    // const gst = this.calculateGstPercentage(1000);
    // //console.log("Total with Gst", gst);
    // //console.log("Total Gst", gst - 1000);
    return Math.round(amount * 0.18);
  }
  // GST Calculator end
  filterPremium(filterValue?: any) {
    this.sortPlans = !this.sortPlans;
    if (filterValue == 1) {
      this.filteredPlans = this.filteredPlans.sort((a, b) =>
        Number(a.Premium) > Number(b.Premium) ? -1 : 1
      );
    } else if (filterValue == 2) {
      this.filteredPlans = this.filteredPlans.sort((a, b) =>
        Number(a.Premium) > Number(b.Premium) ? 1 : -1
      );
    }
    // if (this.sortPlans == 1) {
    //     this.filteredPlans = this.filteredPlans.sort((a, b) => (Number(a.Premium) > Number(b.Premium) ? -1 : 1))
    // } else if (this.sortPlans == 2) {
    //     this.filteredPlans = this.filteredPlans.sort((a, b) => (Number(a.Premium) > Number(b.Premium) ? 1 : -1))
    // }

    /////////////////
    // else {
    //     this.filteredPlans = this.planResponse;
    // }
  }
  getFilterData() {
    this.setDefaultValues();
    this.showLoader = true;
    this.disableControlsUntilLoading = true;
    this.responseCount = 0;
    this.responseResult = []
    for (let i = 0; i < this.apiUrls.length; i++) {
      if (this.apiUrls[i].APIMethod != null) this.fetchUrlData(this.apiUrls[i]);
      else this.responseCount++;
    }
  }

  setDefaultValues() {
    if (this.plan.zeroDp) this.plan.zeroDp = false;
    if (this.plan.paCover) {
      this.plan.paCover = false;
      this.plan.Owner_Driver_PA_Cover_Other_Value = 0
    }
    console.log(this.plan.tppdCover);

    if (this.plan.tppdCover || this.plan.isTPPD) this.plan.isTPPD = false;
  }

  CompareMinIdvValueOfComp: any = [];
  CompareMaxIdvValueOfComp: any = [];
  MinMaxIDV: MinMaxIDVInterface[] = [];
  private fetchUrlData(data: IHealthInsPlanUrlsResponse) {

    console.log();

    let IdvValue: number;
    let MinIDVVAlue: any;
    let MaxIDVVAlue: any;
    console.log(this.plan.currentNcb);

    let findIdvComp: MinMaxIDVInterface | undefined = this.MinMaxIDV.find((x: MinMaxIDVInterface) => x.apiMethod === data.APIMethod)
    if (findIdvComp) {
      if (+findIdvComp.minIdv !== +findIdvComp.maxIdv) {
        if (this.plan.idvValue > +findIdvComp.maxIdv) {
          IdvValue = +findIdvComp.maxIdv
        } else if (this.plan.idvValue < +findIdvComp.minIdv) {
          IdvValue = +findIdvComp.minIdv
        } else {
          IdvValue = this.plan.idvValue
        }
      } else {
        IdvValue = this.plan.idvValue
      }

      MinIDVVAlue = findIdvComp.minIdv;
      MaxIDVVAlue = findIdvComp.maxIdv;
    } else {
      MinIDVVAlue = 0//findIdvComp.minIdv;
      MaxIDVVAlue = 0//findIdvComp.maxIdv;
      IdvValue = this.plan.idvValue
    }
    const filterdata = {
      PartnerId: data.Partnerid,
      ProductCode: data.ProductCode,
      ApplicationNo: data.ApplicationNo,
      ApplicationNoOdp: data.ApplicationNoOdp,
      APIBaseUrl: data.APIBaseUrl,
      APIMethod: data.APIMethod,
      PolicyTenure: +this.plan.isMultiYear.value.replace(/[^\d-]/g, ""),
      IDVValue: IdvValue,
      PreviousNCB: this.plan.previousNcb == "" ? "0" : this.plan.previousNcb,
      CurrentNCB: this.plan.currentNcb == "" ? "20" : this.plan.currentNcb,
      stopLoader: true,
      MaxIDVVAlue: MaxIDVVAlue,
      MinIDVVAlue: MinIDVVAlue
    };

    this.planLoader = false;



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
              ErrorCode: result.successcode,
              ErrorDesc: result.msg,
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

            let findInd: number = this.MinMaxIDV.findIndex((x: MinMaxIDVInterface) => x.apiMethod === data.APIMethod)
            if (findInd === -1) {
              this.MinMaxIDV.push({
                minIdv: result.data.MinIDVVAlue,
                maxIdv: result.data.MaxIDVVAlue,
                apiMethod: filterdata.APIMethod
              })
            }

            console.log(this.MinMaxIDV);

            result.data.Premium = result.data.NetPremium;

            this.CompareMinIdvValueOfComp.push(result.data.MinIDVVAlue);
            //console.log(this.CompareMinIdvValueOfComp);
            this.CompareMaxIdvValueOfComp.push(result.data.MaxIDVVAlue);
            //console.log(this.CompareMaxIdvValueOfComp);

            this.discountAmt = Number(
              result.data.DiscountAmt.replace(/-/g || /--/, " ")
            );
            this.discountLoading = Number(
              result.data.DiscountLoading.replace(/-/g || /--/, " ")
            );
            //console.log("DiscountAmt=" + this.discountAmt);
            //console.log("DiscountLoading=" + this.discountLoading);

            let idvBasic = result.data.CoverageList.find(
              (x: any) => x.CoverageCode === "IDV Basic"
            );
            let ncb = result.data.CoverageList.find(
              (x: { CoverageCode: string; }) => x.CoverageCode === "No Claim Bonus"
            );

            if (idvBasic.TPPremium === null) idvBasic.TPPremium = "0";
            if (
              result.data.DiscountAmt != null &&
              idvBasic.ODPremium != null &&
              idvBasic.TPPremium
            ) {
              if (this.plan.SubCateCode == 1) {
                // Renew
                if (result.data.CompanyCode === '15') {
                  this.premiumCalculationForOriental(result, idvBasic, ncb);
                }
                else if (result.data.CompanyCode == "11") {
                  this.premiumCalculationForReliance(result)
                }
                else {
                  if (this.plan.isComprehensive)
                    if (ncb == undefined) {
                      result.data.Premium =
                        Number(idvBasic.ODPremium) +
                        Number(idvBasic.TPPremium) +
                        Number(result.data.DiscountAmt.replace(/--/g, "-"))
                        ;
                    } else {
                      result.data.Premium =
                        Number(idvBasic.ODPremium) +
                        Number(idvBasic.TPPremium) +
                        Number(ncb.ODPremium) +
                        Number(result.data.DiscountAmt.replace(/--/g, "-"))
                        ;
                    }
                  if (this.plan.isTp)
                    result.data.Premium = Number(idvBasic.TPPremium);
                  if (this.plan.isOdOnly) {
                    // result.data.Premium = Math.round(Number(idvBasic.ODPremium));
                    if (ncb != undefined && +result.data.DiscountAmt != 0) {
                      result.data.Premium =
                        Number(idvBasic.ODPremium) +
                        Number(result.data.DiscountAmt.replace(/--/g, "-")) +
                        Number(ncb.ODPremium)
                        ;
                    } else if (ncb != undefined) {
                      result.data.Premium =
                        Number(idvBasic.ODPremium) + Number(ncb.ODPremium)
                        ;
                    } else {
                      result.data.Premium =
                        Number(idvBasic.ODPremium) +
                        Number(result.data.DiscountAmt.replace(/--/g, "-"))
                        ;
                    }
                  }
                }
              } else {
                // New
                result.data.Premium =
                  Number(idvBasic.ODPremium) +
                  Number(idvBasic.TPPremium) +
                  Number(result.data.DiscountAmt.replace(/--/g, "-"))
                  ;
              }
            }
            if (result.data.Premium != 0) {
              this.planResponse.push(result.data);
            }
            this.filteredPlans = this.planResponse;
          }
          if (this.apiUrls.length == this.responseCount) {
            this.planLoader = true;
            //console.log("SetValue", this.idvRadioType.value);
            if (this.idvRadioType.value != 3) this.getIDV();

            this.disableControlsUntilLoading = false;
            this._errorHandleService.sendErrorLog(this.errors).subscribe((res: any) => {
              console.log(res)
            })
            // if (this.plan.isTp || this.plan.isComprehensive) {
            //   this.plan.paCover = true;
            //   this.onChangePAcover();
            // }
          } else {
            this.showLoader = false;
          }
        },
        (error) => {
          //console.log("Error.status", error.status);
          //console.log("Error", error);
          this.responseCount++;
          this.showLoader = false;
        }
      )
    );
  }

  //forOriental 

  premiumCalculationForOriental(result: ApiResponse, idvBasic: { ODPremium: any; TPPremium: any; }, ncb: number | undefined) {

    let odPlusDiscount = Number(idvBasic.ODPremium) + Number(result.data.DiscountAmt.replace(/--/g, "-"));
    ncb = -(odPlusDiscount * (this.plan.currentNcb / 100));
    this.newNCB = ncb;
    let toCheckAboveHundred = odPlusDiscount + ncb;
    let revisedODPremium;
    if (toCheckAboveHundred < 100) {
      const remainAmt = 100 - toCheckAboveHundred;
      revisedODPremium = Number(idvBasic.ODPremium) + remainAmt;
    }

    if (this.plan.isComprehensive)
      if (ncb == undefined) {

        result.data.Premium =
          Number(idvBasic.ODPremium) +
          Number(idvBasic.TPPremium) +
          Number(result.data.DiscountAmt.replace(/--/g, "-"))
          ;
      } else {

        result.data.Premium = (toCheckAboveHundred < 100) ?
          Number(revisedODPremium) +
          Number(idvBasic.TPPremium) +
          Number(ncb) +
          Number(result.data.DiscountAmt.replace(/--/g, "-"))
          :
          Number(idvBasic.ODPremium) +
          Number(idvBasic.TPPremium) +
          Number(ncb) +
          Number(result.data.DiscountAmt.replace(/--/g, "-"))
          ;
      }
    if (this.plan.isTp)
      result.data.Premium = Number(idvBasic.TPPremium);
    if (this.plan.isOdOnly) {
      // result.data.Premium = Math.round(Number(idvBasic.ODPremium));
      if (ncb != undefined && +result.data.DiscountAmt != 0) {
        result.data.Premium = (toCheckAboveHundred < 100) ?
          Number(revisedODPremium) +
          Number(result.data.DiscountAmt.replace(/--/g, "-")) +
          Number(ncb)
          :
          Number(idvBasic.ODPremium) +
          Number(result.data.DiscountAmt.replace(/--/g, "-")) +
          Number(ncb)
          ;
      } else if (ncb != undefined) {
        result.data.Premium = (toCheckAboveHundred < 100) ?
          Number(revisedODPremium) + Number(ncb)
          :
          Number(idvBasic.ODPremium) + Number(ncb)
          ;
      } else {
        result.data.Premium =
          Number(idvBasic.ODPremium) +
          Number(result.data.DiscountAmt.replace(/--/g, "-"))
          ;
      }
    }
  }

  //for Reliance
  //#region for Reliance
  premiumCalculationForReliance(result: any) {


    let totalODPremium = 0;
    let totalTPPremium = 0;
    let odCalculation = 0
    let idvBasic = result.data.CoverageList.find(
      (x: any) => x.CoverageCode === "IDV Basic"
    );
    let ncb = result.data.CoverageList.find(
      (x: any) => x.CoverageCode === "No Claim Bonus"
    );
    //in case of Reliance ,if Total OD premium is less than 100 ,
    //we have to provide 100 Rs by default else we will provide the actual calculation amount.

    if (this.plan.SubCateCode == 1) {
      // Renew
      if (this.plan.isComprehensive) {

        if (ncb == undefined) {
          odCalculation = Number(idvBasic.ODPremium) +
            Number(result.data.DiscountAmt.replace(/--/g, "-"));
          if (odCalculation < 100) {
            totalODPremium = 100;
          } else {
            totalODPremium = odCalculation;
          }
          totalTPPremium = Number(idvBasic.TPPremium);
        } else {
          odCalculation = Number(idvBasic.ODPremium) +
            Number(result.data.DiscountAmt.replace(/--/g, "-")) +
            Number(ncb.ODPremium);

          if (odCalculation < 100) {
            totalODPremium = 100;
          } else {
            totalODPremium = odCalculation;
          }
          totalTPPremium = Number(idvBasic.TPPremium);

        }

        result.data.Premium = Math.round(totalODPremium + totalTPPremium);
      }
      if (this.plan.isTp) {
        result.data.Premium = Math.round(Number(idvBasic.TPPremium));
      }
      if (this.plan.isOdOnly) {
        // result.data.Premium = Math.round(Number(idvBasic.ODPremium));
        if (ncb != undefined && +result.data.DiscountAmt != 0) {
          odCalculation = Math.round(
            Number(idvBasic.ODPremium) +
            Number(result.data.DiscountAmt.replace(/--/g, "-")) +
            Number(ncb.ODPremium)
          );
          if (odCalculation < 100) {
            totalODPremium = 100;
          } else {
            totalODPremium = odCalculation;
          }

        } else if (ncb != undefined) {
          odCalculation = Math.round(
            Number(idvBasic.ODPremium) + Number(ncb.ODPremium)
          );
          if (odCalculation < 100) {
            totalODPremium = 100;
          } else {
            totalODPremium = odCalculation;
          }

        } else {
          odCalculation = Math.round(
            Number(idvBasic.ODPremium) +
            Number(result.data.DiscountAmt.replace(/--/g, "-"))
          );
          if (odCalculation < 100) {
            totalODPremium = 100;
          } else {
            totalODPremium = odCalculation;
          }
        }
        result.data.Premium = totalODPremium + totalTPPremium;
      }
    }
    else {
      // New

      odCalculation = Number(idvBasic.ODPremium) +
        Number(result.data.DiscountAmt.replace(/--/g, "-"))

      if (odCalculation < 100) {
        totalODPremium = 100;
      } else {
        totalODPremium = odCalculation;
      }
      totalTPPremium = Number(idvBasic.TPPremium);

      result.data.Premium = Math.round(totalODPremium + totalTPPremium);
    }
  }
  //#endregion


  // GetBikeQuotation end

  // //#region  code for Previous policy expiry date and NCB

  // //this function open a popup when (renew policy) and set all condition acc to prv policy data
  ncbExpDateErrMsg = "";
  private manageFilters(
    prvPloicyExpCode: number,
    claimInPrvPolicyCode: number,
    expInd: number
  ) {
    // prvPloicyExpCode=1: YES it expired, claimInPrvPolicyCode=1: Yes claimed
    if (prvPloicyExpCode == 1) {
      switch (expInd) {
        case 3:
        case 1: {
          // for expired within 90 days and // not sure when it expires
          this.setMinDays = 90;
          this.setMaxDays = 2;
          if (claimInPrvPolicyCode == 1) {
            this.ncbInput.setValue("0");
            this.isNcbEditable = false;
          } else {
            this.ncbInput.setValue("25");
            this.isNcbEditable = true;
          }
          break;
        }
        case 2: {
          // for expired more than 90 days
          this.ncbInput.setValue("0");
          this.isNcbEditable = false;
          this.setMinDays = 0;
          this.setMaxDays = -90;
          break;
        }
        default: {
          break;
        }
      }
    } else {
      this.setMinDays = 2;
      this.setMaxDays = 0;
      if (claimInPrvPolicyCode == 1) {
        this.ncbInput.setValue("0");
        this.isNcbEditable = false;
      } else {
        this.ncbInput.setValue("25");
        this.isNcbEditable = true;
      }
    }
    ($("#policyExpiryDateModal") as any).modal("show");
  }
  onClickPreviousPolicyTab(type: string): any {
    this.ncbExpDateErrMsg = "";
    // if (this.popupActive == 'date' && this.prvPolicyExDate.invalid) {
    //     this.ncbExpDateErrMsg = 'Please select valid date';
    //     return false;
    // } else
    if (this.isNcbEditable == false && this.popupActive == "ncb") return false;

    this.popupActive = type;
  }
  onClickOkPrvPolicyModal(ncbValue: any): any {

    this.ncbInput.patchValue(ncbValue);
    this.ncbExpDateErrMsg = "";
    // if (this.prvPolicyExDate.invalid) {
    //     this.ncbExpDateErrMsg = 'Please select valid date';
    //     return false;
    // } else
    if (this.isNcbEditable && this.popupActive != "ncb") {
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
        // if (selectedNcb && selectedNcb.id != this.ncbList[this.ncbList.length - 1].id) {
        //     const ncb = this.ncbList.find((item) => this.getSelected(item, (selectedNcb.id + 1).toString())).value;
        //     this.ncbInput.setValue(ncb);
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
        } else {
          this.plan.currentNcb = this.ncbInput.value;
        }

        this.planResponse = [];
        this.filteredPlans = [];
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
                this.errorLogDetails.MethodName = 'UpdateNCB';
                this.errorLogDetails.ErrorCode = res.successcode ? res.successcode : "0";
                this.errorLogDetails.ErrorDesc = res.msg ? res.msg : "Something went wrong.";
                this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
                  //console.log(res)
                })

              }
              if (res.successcode == "1") {
                this.getBikeQuotationUrl(
                  this.postData.ApplicationNo,
                  this.postData.ApplicationNoOdp
                );
              }
            })
        );

        // }
      }
      ($("#policyExpiryDateModal") as any).modal("hide");
    }
  }
  // //#endregion

  private getSelected(row: IList, id: string) {
    return row.id.toString() == id;
  }
  //#region IDV Modal

  idvErrMsg = "";
  onClickOpenIdvModal() {
    this.idvErrMsg = "";
    this.idvPopUp = "block";
    this.idvRadioType.setValue(this.plan.idvType ? this.plan.idvType : 2);
    if (this.idvRadioType.value == 3) {
      this.idvInputValue.enable();
      this.idvInputValue.setValue(this.plan.idvValue);
    }
    ($("#idvModal") as any).modal("show");
    // setTimeout(() => {
    //this.idvInputValue.disable();
    // }, 10);
  }
  gridsize: number = 30;
  isIDV: boolean = false;
  onSetValueClick(idvType: number): any {
    // 
    if (
      (this.idvInputValue.value < this.minIdv ||
        this.idvInputValue.value > this.maxIdv) &&
      !this.customIdv
    ) {
      this.idvErrMsg = `IDV value must be between ${this.minIdv} and ${this.maxIdv}`;
      return false;
    }

    this.idvErrMsg = "";
    this.plan.idvType = this.idvRadioType.value;
    if (this.idvInputValue.invalid && idvType == 3) {
      this.idvErrMsg =
        this.idvInputValue.value == null
          ? "Please enter IDV value"
          : "IDV value must be between minimum and maximum";
      this.idvPopUp = "block";
      return false;
    } else {

      this.isIDV = true;
      this.plan.idvValue = this.idvInputValue.value;
      this.filteredPlans = [];
      this.planResponse = [];
      if (this.plan.zeroDp) this.plan.zeroDp = false;
      this.getFilterData();
      this.idvPopUp = "none";
    }
  }
  updateSetting(event: any) {
    this.gridsize = event.value;
  }
  onChangeIdv() {
    this.idvErrMsg = "";
    this.idvInputValue.reset();
    if (this.idvRadioType.value == 3) {
      this.idvInputValue.enable();
      this.idvPopUp = "block";
    } else this.idvInputValue.disable();
  }
  setCustomIdv(event: { checked: any; }) {
    if (event.checked) {
      this.customIdv = false;
      this.idvPopUp = "block";
      this.idvInputValue.enable();
    } else {
      this.customIdv = true;
      this.idvInputValue.disable();
      this.idvInputValue.setValue(0);
    }
  }

  onClickNotYourBike() {
    let vData: ApplicationVehicleData = JSON.parse(
      sessionStorage.getItem("VehicleData")!
    );
    vData.edit = 1;
    sessionStorage.setItem("VehicleData", JSON.stringify(vData));
    this._router.navigate(["/pos/bike-insurance"]);
  }

  onBuyPlanClickTataAig() {

    if (this.plan.zeroDp) {
      this.addonConfirmation = "block";
    }
    else {
      this.myModal = "none";
      this.onBuyPlanClick(this.GetIPlansHealth)
    }
  }

  onBuyPlanClickPACoverQuestion() {
    debugger;
    if (this.plan.paCover !== true && (this.showOd !== true || this.showOd === undefined)) {
      this.myPAcoverModel = "block";
    } else {
      this.myPAcoverModel = 'none'
    }
  }

  onBuyPlanClickZeroDepCoverQuestion() {
    debugger;
    if (this.plan.zeroDp === true) {
      this.myZeroDepQuesModal = 'block';
    } else {
      this.myZeroDepQuesModal = 'none';
    }
  }

  PAcoverForm() {
    debugger;
    console.log(this.PACoverForm)
    if (this.PACoverForm.invalid) {
      this.ErrMsg = "Please fill all details correctly."
      return;
    }
    let PAcoverdata = this.PACoverForm.value
    let startdate = PAcoverdata.PolicyStratDate
    let enddate = PAcoverdata.PolicyEndDate
    let datestart = new Date(startdate)
    let formatstart = formatDate(datestart, 'MM-dd-yyyy', 'en-US');


    let dateend = new Date(enddate)
    let formatend = formatDate(dateend, 'MM-dd-yyyy', 'en-US');
    this.PacoverValues = `${PAcoverdata.Companyname}|${formatstart}|${formatend}|${PAcoverdata.PolicyNo}|${PAcoverdata.SumInsured}`
    this.modelclose1(2)
    this.closeModal.nativeElement.click();

  }

  labelPosition!: 1 | 2;
  onBuyPlanClick1(item: IPlansMotor) {
    debugger;
    this.GetIPlansHealth = item;
    this.CompanyCode = item.CompanyCode
    if (this.plan.SubCateCode == 1) {
      // Renew Case
      if (this.plan.isOdOnly == false &&
        (item.CompanyCode === '11' || item.CompanyCode == '7')
        && this.plan.paCover !== true &&
        (this.PaCoverReason === null || this.PaCoverReason === undefined)
      ) {
        this.getPreviousInsurerData();
        this.onBuyPlanClickPACoverQuestion();
        return;
      }

      if (item.CompanyCode === '19') {

        if (this.plan.isOdOnly == false
          && this.plan.paCover !== true &&
          (this.PaCoverReason === null || this.PaCoverReason === undefined)
        ) {
          this.getPreviousInsurerData();
          this.onBuyPlanClickPACoverQuestion();
          return;
        }

        if (this.plan.zeroDp == true &&
          (this.hadZeroDep === false)
        ) {
          // this.getPreviousInsurerData();
          this.onBuyPlanClickZeroDepCoverQuestion();
          return;
        }

      }

      if (item.CompanyCode === "12" ||
        item.CompanyCode === "11" ||
        item.CompanyCode === "8" ||
        item.CompanyCode === '4' ||
        item.CompanyCode === '13'
      ) {
        this.myModal = "none";
        this.onBuyPlanClick(item);
        return
      }

      if (+this.vData.PrvPolicyExCode !== 1) {
        // rollover case
        if (item.CompanyCode === "9") this.onBuyPlanClickTataAig();
        else if (item.CompanyCode === "4") this.onBuyPlanClick(this.GetIPlansHealth);
        else this.myModal = "block";
      } else {
        // break-in case
        if (item.CompanyCode === '9') {
          this.myModal = "none";
          this.onBuyPlanClick(item);
          return;
        } else {
          this.myModal = "block";
        }
      }


    } else {
      // New case
      // this.onBuyPlanClick(item);
      if ((item.CompanyCode === '11' || item.CompanyCode === '7' || item.CompanyCode == '19')
        && this.plan.paCover !== true &&
        (this.PaCoverReason === null || this.PaCoverReason === undefined)) {
        this.getPreviousInsurerData();
        this.onBuyPlanClickPACoverQuestion();
      }
      else {
        this.onBuyPlanClick(item);
      }
    }
  }

  modelclose1(id: any) {
    debugger;
    // this.myPAcoverModel = "none";
    // yes=1 & no=2
    console.log('-----><', id, this.PaCoverReason)
    if (id !== undefined && this.plan.SubCateCode == 1 && id !== null) {

      if (this.GetIPlansHealth.CompanyCode == '19' && id == '2') {
        if (this.PACoverForm.invalid || this.PacoverValues === undefined) {
          this.myPAcoverModel = "block";
          // this.myModal = "none";
          return false
        } else {
          this.plan.Owner_Driver_PA_Cover_Other_Value = `${id}|${this.PacoverValues}`;
          this.myPAcoverModel = "none";
          // this.myModal = "block";
          this.onBuyPlanClick1(this.GetIPlansHealth)
          return true;
        }
      } else {

        this.plan.Owner_Driver_PA_Cover_Other_Value = id;
        this.myPAcoverModel = "none";
        // this.myModal = "block";
        this.onBuyPlanClick1(this.GetIPlansHealth)
        return true;
      }


    } else if (id !== undefined && this.plan.SubCateCode == 2 && id !== null) {

      if (this.GetIPlansHealth.CompanyCode == '19' && id == '2') {

        if (this.PACoverForm.invalid || this.PacoverValues === undefined) {
          this.myPAcoverModel = "block";
          // this.myModal = "none";
          return false
        } else {
          this.plan.Owner_Driver_PA_Cover_Other_Value = `${id}|${this.PacoverValues}`;
          this.myPAcoverModel = "none";
          // this.myModal = "block";
          this.onBuyPlanClick1(this.GetIPlansHealth)
          return true;
        }
      } else {

        this.plan.Owner_Driver_PA_Cover_Other_Value = id
        this.myPAcoverModel = "none";
        // this.myModal = "block";
        this.onBuyPlanClick1(this.GetIPlansHealth)
        return true;
      }
    }
    else {
      this.myPAcoverModel = "block";
      // this.myModal = "none";
      return false
    }
  }

  hadAddonsInPreviousPolicy() {
    this.addonConfirmation = "none";
    if (this.GetIPlansHealth.CompanyCode == '9') {
      this.myModal = "none";
      this.onBuyPlanClick(this.GetIPlansHealth);
      return;
    } else {
      this.myModal = "block";

    }
  }




  modelclose(id: number): any {
    this.myModal = "none";
    // yes=1 & no=2
    if (id == 1) {
      this.myModal = "none";
      this.hadPolicy = "block";

      return false;
    } else {
      this.onBuyPlanClick(this.GetIPlansHealth);
    }
  }

  hadZeroDep: boolean = false;
  zeroDepModelClose(id: number): any {
    this.myZeroDepQuesModal = 'none';
    // yes=1 & no=2
    if (id == 2) {
      // this.myZeroDepQuesModal = 'block';
      this.closeModalDialog()
      this.hadZeroDep = false;
    } else {

      this.myZeroDepQuesModal = 'none';
      this.hadZeroDep = true;
      this.onBuyPlanClick1(this.GetIPlansHealth);
    }
  }

  hadPolicyModalClose() {
    this.hadPolicy = "none";
    this.closeModalDialog()
  }
  onBuyPlanForOriental() {

  }
  onBuyPlanClick(item: IPlansMotor) {
    debugger
    // if (!this.plan.paCover && this.plan.SubCateCode == 2) {
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
    data.IDVValue = this.plan.idvValue ? this.plan.idvValue : +item.IDVVAlue;
    // data.IDVValue = this.plan.idvValue;
    // data.IDVValue = +item.IDVVAlue;

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

    data.TPPDCoverCode = this.plan.tppdCover ? EYesNo.YES : EYesNo.NO;
    data.TPPDCoverDesc = this.plan.tppdCover ? EYesNo[EYesNo.YES] : EYesNo[EYesNo.NO];
    // data.Owner_Driver_PA_Cover_Other_Value = this.PaCoverReason


    if (this.plan.isMultiYear) {
      data.MultiYrCode = this.plan.isMultiYear.id;
      data.MultiYrDesc = this.plan.isMultiYear.value;
    } else {
      data.MultiYrCode = 0;
      data.MultiYrDesc = "";
    }
    data.InsurancePlanCode = 100;
    data.InsurancePlanDesc = "test";
    data.CoverageList = item.CoverageList
    // if(item.ProductName == 'The Oriental Insurance Company Ltd.') {
    //   this.premiumDataPlansForOriental = this.popupDataforOriental(item);
    // }
    // else 
    this.premiumDataPlans = this.popupData(item, data.ApplicationNo);
    const sesDataSet = {
      rto: this.plan.rto,
      vehicleDesc: this.plan.vehicleDesc,
      premiumDataPlans: this.premiumDataPlans,

    };
    // const sesdata = encrypt(JSON.stringify(sesDataSet));
    const sesdata = JSON.stringify(sesDataSet);
    sessionStorage.setItem("Data", sesdata);
    //console.log(this.planResponse);
    //console.log("Session Value" + sessionStorage.getItem("Data"));

    this.showLoader = true;
    // //commented saveVichiel plan api start pranay
    // this._subscriptions.push(
    //   this.vbService.saveSelectedPlan(data).subscribe(
    //     (result) => {
    //       // this.showLoader = false;
    //       if (result) {
    //         this._router.navigate([
    //           `/bike-insurance/buyplan`,
    //           encrypt(`${this.postData.ApplicationNo}`),
    //           encrypt(`${this.postData.ApplicationNoOdp}`),
    //         ]);
    //       } else {
    //         // if(result.successcode == "0"){
    //         this.errorLogDetails.UserCode = this.posMobileNo;
    //         this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
    //         this.errorLogDetails.CompanyName = '';
    //         this.errorLogDetails.ControllerName = "VehicleData"
    //         this.errorLogDetails.MethodName = 'SaveVehicleRegData';
    //         this.errorLogDetails.ErrorCode = result.successcode;
    //         this.errorLogDetails.ErrorDesc = result.msg;
    //         this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
    //           console.log(res)
    //         })

    //         //  }
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
    //       this.errorLogDetails.MethodName = 'SaveVehicleRegData';
    //       this.errorLogDetails.ErrorCode = err.successcode;
    //       this.errorLogDetails.ErrorDesc = err.msg;
    //       this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
    //         console.log(res)
    //       })

    //       this._errorHandleService.handleError(err);
    //     }
    //   )
    // );
    // //commented saveVichiel plan api end pranay
    if (this.GetIPlansHealth.CompanyCode == '2') {
      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);
    } else if (this.GetIPlansHealth.CompanyCode == '19' || this.GetIPlansHealth.CompanyCode == '16') {
      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);
    } else if (this.GetIPlansHealth.CompanyCode == '7') {

      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);

    } else if (this.GetIPlansHealth.CompanyCode == '13') {
      // this._router.navigate([
      //   `/bike-insurance/buyplan-Bajaj`,
      //   encrypt(`${this.postData.ApplicationNo}`),
      //   encrypt(`${this.postData.ApplicationNoOdp}`),
      // ]);

      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);
    } else if (this.GetIPlansHealth.CompanyCode == '4') {
      this._router.navigate([
        `/bike-insurance/buyplan-IffcoTokio`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
      ]);
    }
    else if (this.GetIPlansHealth.CompanyCode == '6') {
      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);

    } else if (this.GetIPlansHealth.CompanyCode == '8') {
      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);

    } else if (this.GetIPlansHealth.CompanyCode == '9') {
      this._router.navigate([
        `/bike-insurance/buyplan`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
      ]);

    } else if (this.GetIPlansHealth.CompanyCode == '11') {
      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);
    } else if (this.GetIPlansHealth.CompanyCode == '15') {

      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);

    }
    // else if (this.GetIPlansHealth.CompanyCode == '8') {
    //   this._router.navigate([
    //     `/bike-insurance/buyplan-GoDigit`,
    //     encrypt(`${this.postData.ApplicationNo}`),
    //     encrypt(`${this.postData.ApplicationNoOdp}`),
    //   ]);
    // }
    else {
      this._router.navigate([
        `/bike-insurance/buyplan`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
      ]);
    }
  }

  selectTab(index: number, item: IPlansMotor): void {
    setTimeout(() => {
      this.selectedIndex = index;
    }, 100);
    // if (index == 1) {
    //     let a = document.createElement('a');
    //     a.target = '_blank';
    //     a.href = 'https://www.iffcotokio.co.in/contact-us?tab=garage';
    //     a.click();
    //     // window.location.href = "https://www.iffcotokio.co.in/contact-us?tab=garage";
    // } else {
    // this.premiumPopUp = true;

    console.log(item.ProductName);
    this.premiumDataPlans = this.popupData(item, this.postData.ApplicationNo);
    // if(item.ProductName == 'The Oriental Insurance Company Ltd.') {

    //   // this.popupDataforOriental(item);
    //   this.premiumDataPlansForOriental = this.popupDataforOriental(item);
    //   this.planCOmp.popUp2 = true;
    // console.log(this.premiumDataPlansForOriental);

    // }
    // else{


    this.planCOmp.PopUp = true;

    // } 
    ($("#exampleModalCenter") as any).modal("show");

    // }
    // Passing values in popup
  }

  popupData(item: IPlansMotor | any, ApplicationNo: number) {
    debugger
    let NCB = item.CoverageList.find(
      (x: { CoverageCode: string; }) => x.CoverageCode === "No Claim Bonus"
    );
    let TPPD = item.CoverageList.find((x: { CoverageID: number; }) => x.CoverageID == 28);
    let PAOwner = item.CoverageList.find((x: { CoverageID: number; }) => x.CoverageID == 16);
    let IdvBasic = item.CoverageList.find(
      (x: { CoverageCode: string; }) => x.CoverageCode === "IDV Basic"
    );
    let DepWaiver = item.CoverageList.find((x: { CoverageID: number; }) => x.CoverageID == 1);


    if ((item.ProductName == 'The Oriental Insurance Company Ltd.') &&
      !this.plan.isTp &&
      this.plan.SubCateCode === 1) {
      if (this.plan.zeroDp && DepWaiver) {

        const calNcb = Number(IdvBasic.ODPremium) + Number(DepWaiver.ODPremium) + Number(item.DiscountAmt);
        this.finalNCB = -(calNcb * (this.plan.currentNcb / 100));
        if (NCB) {

          NCB.ODPremium = ((-calNcb) * (this.plan.currentNcb / 100)).toString();
        }
        // console.log(NCB);
        if (this.finalNCB != undefined) item["NCB"] = NCB;
        item.Premium = this.plan.paCover == true ? (calNcb + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) - (this.finalNCB)) : (calNcb + Number(IdvBasic.TPPremium) + (this.finalNCB));

        if ((calNcb + this.finalNCB) < 100) {
          const remainingAmt = 100 - (calNcb + this.finalNCB);
          this.ODPremium = (Number(IdvBasic.ODPremium) + remainingAmt).toString();
          if (this.ODPremium) item["odPremium"] = this.ODPremium;
          item.Premium = this.plan.paCover == true ? Number(this.ODPremium) + Number(DepWaiver.ODPremium) + Number(PAOwner.TPPremium) + Number(item.DiscountAmt) + Number(IdvBasic.TPPremium) + (this.finalNCB) : Number(this.ODPremium) + Number(DepWaiver.ODPremium) + Number(item.DiscountAmt) + Number(IdvBasic.TPPremium) - (this.finalNCB);

        } else {
          this.ODPremium = "";
          item["odPremium"] = ""
          item.Premium = this.plan.paCover ? calNcb + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) + (this.finalNCB) : (calNcb + Number(IdvBasic.TPPremium) + (this.finalNCB));
        }
      }
      else {
        const calNcb = Number(IdvBasic.ODPremium) + Number(item.DiscountAmt);
        this.finalNCB = -(calNcb * (this.plan.currentNcb / 100));
        if (NCB) {
          NCB.ODPremium = (-(calNcb) * (this.plan.currentNcb / 100)).toString();
        }
        console.log(this.finalNCB);
        if (this.finalNCB != undefined) item["NCB"] = NCB;
        // item.Premium = Math.round(calNcb + Number(IdvBasic.TPPremium) -(this.finalNCB)); 
        item.Premium = this.plan.paCover ? calNcb + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) + (this.finalNCB) : calNcb + Number(IdvBasic.TPPremium) + (this.finalNCB);
        if ((calNcb + this.finalNCB) < 100) {

          const remainingAmt = 100 - (calNcb + this.finalNCB);
          this.ODPremium = (Number(IdvBasic.ODPremium) + remainingAmt).toString();
          if (this.ODPremium) item["odPremium"] = this.ODPremium;
          item.Premium = this.plan.paCover ? Number(this.ODPremium) + Number(item.DiscountAmt) + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) + (this.finalNCB) : Number(this.ODPremium) + Number(item.DiscountAmt) + Number(IdvBasic.TPPremium) + (this.finalNCB);
        } else {
          this.ODPremium = "";
          item["odPremium"] = "";


          item.Premium = this.plan.paCover ? calNcb + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) + (this.finalNCB) : calNcb + Number(IdvBasic.TPPremium) + (this.finalNCB);
        }
      }
    }
    // else item.CompanyCode == item.CompanyCode;
    if (IdvBasic != undefined) item["IdvBasic"] = IdvBasic;
    if (NCB != undefined) item["NCB"] = NCB;
    if (PAOwner != undefined) item["PAOwner"] = PAOwner;
    if (TPPD != undefined) item["TPPD"] = TPPD;
    if (DepWaiver != undefined) item["DepWaiver"] = DepWaiver;

    item["tenure"] = this.plan.isMultiYear.value.replace(/[^\d-]/g, "");
    item['istppd'] = this.plan.isTPPD;
    if (
      item["DiscountAmt"] != null ||
      item["DiscountAmt"] != "" ||
      item["DiscountAmt"] != "0"
    ) {
      item["DiscountAmt"] = Number(item["DiscountAmt"]).toString().replace(/--/g, "-");
    }
    // item["DiscountLoading"] = Math.round(Math.abs(item["DiscountLoading"])); //this will be discount amount in %
    item["DiscountPercent"] = calculatePercent(
      +IdvBasic.ODPremium,
      Math.abs(+item["DiscountAmt"])
    );
    item["vehicleDesc"] = this.plan.vehicleDesc;
    item["SubCateCode"] = this.plan.SubCateCode;
    item["isOdOnly"] = this.plan.isOdOnly;
    item["isComprehensive"] = this.plan.isComprehensive;
    item["isTp"] = this.plan.isTp;
    item["pacover"] = this.plan.paCover;
    item['Owner_Driver_PA_Cover_Other_Value'] = `${this.plan.Owner_Driver_PA_Cover_Other_Value}`
    item["isTppd"] = this.plan.tppdCover;
    item["currentNcb"] = +this.plan.currentNcb;
    item["PremiumWithGst"] = Math.round(+item.Premium);
    item["zeroDp"] = this.plan.zeroDp;
    item["GST"] =
      Number(this.calculateGstPercentage(+item["PremiumWithGst"]))
      ;
    item["AmountPayableIncludingGST"] =
      +item["GST"] + Math.round(+item.Premium);
    //console.log("item ==> ", item);
    item["ApplicationNo"] = ApplicationNo
    return item;
  }
  // popupDataforOriental(item: IPlansMotor) {
  //   
  //   // let NCB = item.CoverageList.find(
  //   //   (x) => x.CoverageCode === "No Claim Bonus"
  //   // );
  //   if(item.CompanyCode == '15'){
  //     let TPPD = item.CoverageList.find((x) => x.CoverageID == 28);
  //     let PAOwner = item.CoverageList.find((x) => x.CoverageID == 16);
  //     let IdvBasic = item.CoverageList.find(
  //       (x) => x.CoverageCode === "IDV Basic"
  //     );
  //     let DepWaiver = item.CoverageList.find((x) => x.CoverageID == 1);

  //     if(this.plan.zeroDp){
  //     const calNcb = Number(IdvBasic.ODPremium) + Number(DepWaiver.ODPremium) + Number(item.DiscountAmt);
  //     this.finalNCB = calNcb * (this.plan.currentNcb/100);
  //     // console.log(NCB);
  //     if (this.finalNCB != undefined) item["NCB"] = this.finalNCB;
  //     item.Premium = this.plan.paCover == true ? (Math.round(calNcb + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) -(this.finalNCB))) : (Math.round(calNcb + Number(IdvBasic.TPPremium) -(this.finalNCB)));

  //     if((calNcb + this.finalNCB) < 100){
  //     const remainingAmt = Math.round(100 - (calNcb - this.finalNCB));
  //     this.ODPremium = (Number(IdvBasic.ODPremium) + remainingAmt).toString();
  //     if(this.ODPremium) item["odPremium"] = this.ODPremium;
  //     item.Premium = this.plan.paCover == true ? Math.round(Number(this.ODPremium) + Number(DepWaiver.ODPremium) + Number(PAOwner.TPPremium)  + Number(item.DiscountAmt) + Number(IdvBasic.TPPremium) -(this.finalNCB)) : Math.round(Number(this.ODPremium) + Number(DepWaiver.ODPremium) + Number(item.DiscountAmt) + Number(IdvBasic.TPPremium) -(this.finalNCB));

  //     }
  //     else{
  //       this.ODPremium ="";
  //        item["odPremium"] = ""
  //       item.Premium = this.plan.paCover ? Math.round(calNcb + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) - (this.finalNCB)) : Math.round(calNcb + Number(IdvBasic.TPPremium) -(this.finalNCB));
  //     } 
  //     }
  //     else{
  //       const calNcb = Number(IdvBasic.ODPremium) + Number(item.DiscountAmt);
  //       this.finalNCB = calNcb * (this.plan.currentNcb/100);
  //       console.log(this.finalNCB);
  //       if (this.finalNCB != undefined) item["NCB"] = this.finalNCB;
  //         // item.Premium = Math.round(calNcb + Number(IdvBasic.TPPremium) -(this.finalNCB)); 
  //         item.Premium = this.plan.paCover ? Math.round(calNcb + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) - (this.finalNCB)) : Math.round(calNcb + Number(IdvBasic.TPPremium) -(this.finalNCB));
  //       if((calNcb + this.finalNCB) < 100){

  //         const remainingAmt = Math.round(100 - (calNcb - this.finalNCB));
  //         this.ODPremium = (Number(IdvBasic.ODPremium) + remainingAmt).toString();
  //         if(this.ODPremium) item["odPremium"] = this.ODPremium;
  //         item.Premium = this.plan.paCover ? Math.round(Number(this.ODPremium) + Number(item.DiscountAmt) + Number(IdvBasic.TPPremium) + Number(PAOwner.TPPremium) - (this.finalNCB)) : Math.round(Number(this.ODPremium) + Number(item.DiscountAmt) + Number(IdvBasic.TPPremium) -(this.finalNCB));
  //         }
  //         else {
  //           this.ODPremium ="";
  //            item["odPremium"] = "";
  //           item.Premium = this.plan.paCover ? Math.round(calNcb + Number(IdvBasic.TPPremium) +Number(PAOwner.TPPremium) - (this.finalNCB)) : Math.round(calNcb + Number(IdvBasic.TPPremium) -(this.finalNCB));
  //         }
  //     }

  //     if (IdvBasic != undefined) item["IdvBasic"] = IdvBasic;

  //     if (PAOwner != undefined) item["PAOwner"] = PAOwner;
  //     if (TPPD != undefined) item["TPPD"] = TPPD;
  //     if (DepWaiver != undefined) item["DepWaiver"] = DepWaiver;

  //     item["tenure"] = this.plan.isMultiYear.value.replace(/[^\d-]/g, "");
  //      item['istppd'] = this.plan.isTPPD;
  //     if (
  //       item["DiscountAmt"] != null ||
  //       item["DiscountAmt"] != "" ||
  //       item["DiscountAmt"] != "0"
  //     ) {
  //       item["DiscountAmt"] = item["DiscountAmt"].replace(/--/g, "-");
  //     }
  //     // item["DiscountLoading"] = Math.round(Math.abs(item["DiscountLoading"])); //this will be discount amount in %
  //     item["DiscountPercent"] = calculatePercent(
  //       +IdvBasic.ODPremium,
  //       Math.abs(+item["DiscountAmt"])
  //     );
  //     item["vehicleDesc"] = this.plan.vehicleDesc;
  //     item["SubCateCode"] = this.plan.SubCateCode;
  //     item["isOdOnly"] = this.plan.isOdOnly;
  //     item["isComprehensive"] = this.plan.isComprehensive;
  //     item["isTp"] = this.plan.isTp;
  //     item["pacover"] = this.plan.paCover;
  //     item["isTppd"] = this.plan.tppdCover;
  //     item["currentNcb"] = +this.plan.currentNcb;

  //     item["PremiumWithGst"] = +item.Premium;
  //     item["zeroDp"] = this.plan.zeroDp;
  //     item["GST"] = Math.round(
  //       this.calculateGstPercentage(+item.Premium) - +item.Premium
  //     );
  //     item["AmountPayableIncludingGST"] = Math.round(
  //       +item["GST"] + +item.Premium
  //     );
  //     console.log("item ==> ", item);

  //   }

  //   return item;
  // }

  onToggleChange(ind: number) {
    this.plan.paCover = false;
    this.plan.zeroDp = false;
    // this.plan.tppdCover = false;
    if (ind === 0) {
      //isComprehensive
      this.plan.isTp = this.plan.isOdOnly = false;
      if (!this.plan.isComprehensive) {
        this.plan.isTp = false;
        this.showDefaultValue(ind);
        this.filterPremium(1);
        // this.plan.paCover = true;
        // this.onChangePAcover();
      } else {
        this.plan.isTp = true;
        this.showDefaultValue();
        // this.plan.isTp = this.plan.paCover = true;
        // this.onChangePAcover();
      }
    }
    if (ind === 1) {
      //isTp
      this.plan.isComprehensive = this.plan.isOdOnly = false;
      // this.onChangeZeroDep();
      if (!this.plan.isTp) {
        this.plan.isComprehensive = false;
        this.showDefaultValue();
        this.filterPremium(1);
        // this.plan.paCover = true;
        // this.onChangePAcover();
      } else {
        this.plan.isComprehensive = true;
        this.showDefaultValue(0);
        // this.plan.paCover = this.plan.isComprehensive = true;
        // this.onChangePAcover();
      }
    }
    if (ind === 2) {
      //isOdOnly
      this.plan.isTp = this.plan.isComprehensive = false;
      // this.onChangeZeroDep();
      if (!this.plan.isOdOnly) {
        this.filteredPlans = [];
        for (let i = 0; i < this.planResponse.length; i++) {
          let coverageList: any = this.planResponse[i].CoverageList.find(
            (x) => x.CoverageCode === "IDV Basic"
          );
          this.filteredPlans.push(this.planResponse[i]);
          this.filteredPlans[i].Premium = +coverageList.ODPremium;
          // this.filteredPlans[i].Premium = Math.round(Number(coverageList.ODPremium));
        }
        this.filterPremium(1);
      } else {
        this.plan.isTp = true;
        this.showDefaultValue();
        // this.plan.isTp = this.plan.paCover = true;
        // this.onChangePAcover();
      }
    }
  }

  showDefaultValue(ind?: number) {
    this.filteredPlans = [];
    this.filteredPlans = this.planResponse;
    for (let i = 0; i < this.filteredPlans.length; i++) {
      let idvBasic: any = this.filteredPlans[i].CoverageList.find(
        (x) => x.CoverageCode === "IDV Basic"
      );
      let ncb = this.filteredPlans[i].CoverageList.find(
        (x) => x.CoverageCode === "No Claim Bonus"
      );

      if (ind === 0) {
        // isComprehensive
        if (ncb == undefined) {
          this.filteredPlans[i].Premium =
            Number(idvBasic.ODPremium) + Number(idvBasic.TPPremium)
            ;
        } else {
          this.filteredPlans[i].Premium =
            Number(idvBasic.ODPremium) +
            Number(idvBasic.TPPremium) +
            Number(ncb.ODPremium) +
            Number(this.planResponse[i]["DiscountAmt"].replace(/--/g, "-"))
            ;
        }
      } else if (ind === 1) {
        // isOdOnly
        this.filteredPlans[i].Premium = Number(idvBasic.ODPremium);
      } else {
        // isTp
        // this.filteredPlans = [];
        // for (let i = 0; i < this.planResponse.length; i++) {
        //   this.filteredPlans.push(this.planResponse[i]);
        //   this.filteredPlans[i].Premium = Math.round(
        //     Number(idvBasic.TPPremium)
        //   );
        // }
        this.filteredPlans[i].Premium = Number(idvBasic.TPPremium);
      }
    }
  }

  onChangePAcover() {
    // By sourabh
    // console.log("lidkfjjfjjfj ........",this.plan.paCover)
    for (let i = 0; i < this.filteredPlans.length; i++) {
      const arr = this.filteredPlans[i].CoverageList;
      var paOwner = arr.find((x) => x.CoverageID == 16);
      if (this.plan.paCover && paOwner) {
        this.filteredPlans[i].Premium =
          this.filteredPlans[i].Premium +
          +paOwner.TPPremium +
          +paOwner.ODPremium
          ;
      } else if (!this.plan.paCover && paOwner) {
        this.filteredPlans[i].Premium =
          this.filteredPlans[i].Premium -
          +paOwner.TPPremium -
          +paOwner.ODPremium
          ;

        // if (this.plan.SubCateCode == 2) {
        //   this._errorHandleService._toastService.warning(
        //     "Personal Accident (PA) Cover is Mandatory",
        //     "Please select"
        //   );
        // }
      }
    }
    // By sourabh end
  }

  onChangeZeroDep() {
    // By Sourabh

    for (let i = 0; i < this.filteredPlans.length; i++) {
      var arr = this.filteredPlans[i].CoverageList;
      let ncb;
      let depWaiver = arr.find((x) => x.CoverageID == 1);
      // let Idvbasic = arr.find((x) => x.CoverageID == 0 );
      if (this.filteredPlans[i].CompanyCode === '15' && this.plan.SubCateCode == 1) this.popupData(this.filteredPlans[i], this.postData.ApplicationNo);
      else if (depWaiver && +depWaiver.ODPremium != 0) {
        this.filteredPlans[i].Premium = this.plan.zeroDp
          ? this.filteredPlans[i].Premium +
          Number(depWaiver.ODPremium)
          : this.filteredPlans[i].Premium -
          Number(depWaiver.ODPremium);
      }
    }

  }
  onChangeTPPD() {


    this.TppdList.splice(0, this.TppdList.length);
    for (let i = 0; i < this.filteredPlans.length; i++) {
      const arr = this.filteredPlans[i].CoverageList;
      var tppd = arr.find((x) => x.CoverageID == 28);
      var istppd = arr.findIndex((x) => x.CoverageID == 28)
      //console.log("isfdjldf ", istppd);


      this.checkTPPD(+this.filteredPlans[i].CompanyCode, istppd);
      //console.log("filterPlans", this.filteredPlans[i])

      if (this.plan.isTPPD && tppd) {
        this.filteredPlans[i].Premium =
          this.filteredPlans[i].Premium +
          +tppd.TPPremium +
          +tppd.ODPremium
          ;
      } else if (!this.plan.isTPPD && tppd) {
        this.filteredPlans[i].Premium =
          this.filteredPlans[i].Premium -
          +tppd.TPPremium -
          +tppd.ODPremium
          ;
      }
    }
  }
  TppdList: Array<{ policyCode: number; exists: number }> = []
  checkTPPD(policyCode: number, exists: number) {
    this.TppdList.push({ policyCode, exists });
  }

  onChangeYearPlan() {
    // 
    // this.plan.isOdOnly = false;
    // if (this.plan.SubCateCode == 1) {
    //   //Renew Case
    //   this.plan.isTp = true;
    //   this.plan.isComprehensive = false;
    // }
    // if (this.plan.SubCateCode == 2) {
    //   //New Case
    //   this.plan.isTp = false;
    //   this.plan.isComprehensive = true;
    // }
    this.plan.zeroDp = false;
    this.plan.paCover = false;
    this.plan.Owner_Driver_PA_Cover_Other_Value = 0
    this.planResponse = [];
    this.filteredPlans = [];

    // unchecking checkboxes on year change
    this.getBikeQuotationUrl(
      this.postData.ApplicationNo,
      this.postData.ApplicationNoOdp
    );
    this.plan.zeroDp = false;
    this.plan.paCover = false;
    this.plan.Owner_Driver_PA_Cover_Other_Value = 0

    this.plan.tppdCover = false;
  }

  premiumWithoutDiscount(item: { DiscountAmt: string; ProductName: string; CoverageList: any[]; Premium: string | number; }) {


    // if (this.plan.isTp) {
    let DiscountAmt = +item.DiscountAmt.replace(/--/g, "-");
    let actualAmount = "";
    if (item.ProductName == 'The Oriental Insurance Company Ltd.') this.NCB = this.newNCB;

    else {
      let ncbValue = item.CoverageList.find(
        (cover: { CoverageCode: string; }) => cover.CoverageCode == "No Claim Bonus"
      );
      this.NCB = ncbValue != undefined ? ncbValue.ODPremium : 0;
    }

    if (this.NCB && DiscountAmt) {
      if (!this.plan.isTp)
        actualAmount =
          +this.NCB != 0
            ? String(+item.Premium + +this.NCB - DiscountAmt)
            : "";
    } else if (this.NCB) {
      if (!this.plan.isTp)
        actualAmount =
          +this.NCB != 0
            ? String(+item.Premium + +this.NCB)
            : "";
    } else if (DiscountAmt != 0 && !this.plan.isTp)
      actualAmount = String(+item.Premium - DiscountAmt);
    return actualAmount;




    // let ncb = item.CoverageList.find((cover) => cover.CoverageCode == "No Claim Bonus");
    // if (ncb != undefined)
    //     return +ncb.ODPremium ? Math.round(+item.Premium - +ncb.ODPremium) : "";
    // if (item.DiscountAmt != "0" || item.DiscountAmt != null){
    //     let DiscountAmt = item.DiscountAmt.replace(/--/g, '-');
    //     return +DiscountAmt ? Math.round(+item.Premium - +DiscountAmt) : "";
    // }
    // }
  }
  openModalDialog() {
    this.display = "block"; //Set block css
  }

  closeModalDialog() {
    this.display = "none"; //set none css after close dialog
    this.idvPopUp = "none";
    this.myModal = "none";
    this.addonConfirmation = "none";
    this.myPAcoverModel = 'none';
    this.PaCoverReason = null;
    this.myZeroDepQuesModal = 'none';
    this.hadZeroDep = false;
  }

  openResponseModal() {

    this.showResponseModal.showResponse = true
    this.responseDetails = this.responseResult;
  }



  openDialog(): void {

    debugger
    this.shareQuotesModal.showModal = true;
    this.captureScreen();
  }



  getPreviousInsurerData() {
    this._subscriptions.push(
      // Remove selected company from api insurance Company
      this.vbService
        .GetPreviousInsurerByCompanyCode(
          this.GetIPlansHealth.CompanyCode
        )
        .subscribe(
          (result: any) => {
            console.log(result);

            this.insuCompanyList = result.data.PreviousInsurerList;
            this.ppInsurerList = this.PACoverForm.controls[
              "Companyname"
            ].valueChanges.pipe(
              startWith(""),
              map((prvPolicyInsurer) =>
                this._filterPPInsurer(prvPolicyInsurer)
              )
            );
          },
          (err: Error) => {
            this.showLoader = false;

            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo =
              this.postData.ApplicationNo;
            this.errorLogDetails.CompanyName = "ProductName";
            this.errorLogDetails.ControllerName = "VehicleData";
            this.errorLogDetails.MethodName = "GetVehicleProposalData";
            this.errorLogDetails.ErrorCode = err ? err.name : "0";
            this.errorLogDetails.ErrorDesc = err.message ? err.message : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                //console.log(res);
              });

            // this._errorHandleService.handleError(er);
            // this._toastService.error(err.message, err.name)
          }
        ))
  }

  quotesDetailsForSharing: any;
  capturedImage: any;
  async captureScreen() {
    debugger
    try {
      // const capturePromise =
      this.screenCaptureService.getImage(
        this.screen.nativeElement,
        true
      ).subscribe((imgString: string) => {
        //  let imgString = await capturePromise;
        // let convertedImageFile = this.convertBase64ToImage(imgString);

        let convertedImageFile = imgString.replace("data:image/png;base64,", "");
        // let motorDesc = `${this.plan.RegYear} ${this.plan.engineSize ? this.plan.engineSize : ''} ${}`
        let motorDesc = this.plan.vehicleDesc;
        let regYear = this.plan.RegYear;
        let policyType = this.vData["PreviousPolicyTypeDesc"]
          ? this.vData["PreviousPolicyTypeDesc"]
          : this.vData["SubCateDesc"];

        this.quotesDetailsForSharing = {
          image: convertedImageFile,
          planDescription: `${motorDesc} ${regYear} ${policyType}`,
        };
      })
      // .catch((err: Error) => {
      //   console.log(err.message);

      // })

    } catch (err) {
      console.log("error occured");
      console.log(err);
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
    this._subscriptions.forEach((sub: { unsubscribe: () => any; }) => sub.unsubscribe());
  }
}




