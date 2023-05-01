import { startWith, map, mergeMap, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import {
  IGender,
  IFamilyMembers,
  Relation,
  IPlansMotor,
  IHealthInsPlanUrlsResponse,
  ICoverageList,
} from "src/app/models/health-insu.Model";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import {
  yesNoList,
  NCBList,
  PATTERN,
  MASKS,
  Salutation,
} from "src/app/models/common";

import { EYesNo } from "src/app/models/insurance.enum";
import {
  IState,
  ICity,
  IInsuranceCompany,
  IPincode,
  IMortgageBank,
  ApplicationVehicleData,
  IRegistrationYear,
  errorLog,
  ICitySBI,
  IDistrict,
} from "src/app/models/common.Model";
import {
  convertToDateFormat,
  convertToMydate,
  decrypt,
  encryption,
  setMaxDate,
  setMaxRegDate,
  setMinDate,
} from "src/app/models/common-functions";

import { VehicleBuyPlanService } from "../../services/vehicle-buyplan.service";
import {
  ApplicationVehicleRegData,
  IApplicationVehicleRegData,
} from "src/app/models/bike-insu.Model";
import * as moment from "moment";
import { Location, UpperCasePipe } from "@angular/common";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ToastrService } from "ngx-toastr";
import { ApiResponse } from "src/app/models/api.model";
import { NgxCaptureService } from "ngx-capture";
import { CarPlanAndPremiumDetailsComponent } from "src/app/shared/components/car-plan-and-premium-details/car-plan-and-premium-details.component";
import { CurrentCommunicationAddressComponent } from "src/app/shared/components/current-communication-address/current-communication-address.component";

@Component({
  selector: "app-buyplan",
  templateUrl: "./buyplan.component.html",
  styleUrls: [
    "./buyplan.component.css",
    "../../bike-insurance/bike-plans/bike-plans.component.css",
  ],
})
export class BuyplanComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];
  @ViewChild("screen", { static: true }) screen: any;
  @ViewChild("cpp", { static: false })
  planComp!: CarPlanAndPremiumDetailsComponent;


  @ViewChild("currentAddressModel", { static: false })
  currentAddressModel!: CurrentCommunicationAddressComponent;

  //#region objects and lists

  //all list objects
  public genderList: IGender[] = [];
  public familyMemberList: IFamilyMembers[] = [];
  public stateList: IState[] = [];
  public filterStateList!: Observable<IState[]>;
  public districtList: IDistrict[] = [];
  public filterDistrictList: IDistrict[] = [];
  filteredDistrictList!: Observable<IDistrict[]>;
  public cityList: ICity[] = [];
  public filterCityList: ICity[] = [];
  public _cityList: ICitySBI[] = [];
  public _filterCityList: ICitySBI[] = [];
  public insuCompanyList: IInsuranceCompany[] = [];
  public mortgageBankList: IMortgageBank[] = [];
  public filterMortgageBankList!: Observable<IMortgageBank[]>;
  public pincodeList: IPincode[] = [];

  filteredautoPincodeList!: Observable<IPincode[]>;
  ppInsurerList!: Observable<IInsuranceCompany[]>;
  ppODInsurerList!: Observable<IInsuranceCompany[]>;
  public yesNoList = yesNoList;
  public NCBList = NCBList;
  filteredCityList!: Observable<ICity[]>;
  _filteredCityList!: Observable<ICitySBI[]>;
  searchState!: IState[];
  showLoader: boolean = false; //for showing loader
  public tabIndex = 0;
  isreview = false;
  errMsg_oi = "";
  errMsg_pd = "";
  errMsg_pp = "";
  errMsg_add = "";
  errMsg_vd = "";
  isCompleted = false;
  isCompleted_pd = false;
  isCompleted_pp = false;
  isCompleted_add = false;
  isCompleted_vd = false;
  isNewPolicy = false; //true when new
  isPrvPolicyRemember = 1;
  selectedIndex = 0;
  BikeExpiryCode!: number;
  InvalidDate = "";
  PlanData: any;
  minDate: any;
  maxDate: any;
  date: string = convertToMydate(new Date());
  salutations = Salutation;
  getRTO!: string;
  filterState!: any;
  //forms
  ownerInfoForm: FormGroup;
  // addressForm: FormGroup;
  addressForm: FormGroup;
  pastPolicyForm: FormGroup;
  vehicleDetailForm: FormGroup;

  postData: IApplicationVehicleRegData = new ApplicationVehicleRegData();
  // vehicleMask = MASKS.VEHICLENO;
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
  maxLenForAreaPostalADD!: number;
  stateDetails: any;
  filterList!: any;
  checkCurrentAddForm!: boolean | null;
  CurrentAddressForm!: FormGroup;
  reliance!: boolean;
  ckycSessionData: any;

  addressRegex = PATTERN.ADDRESSPATTERN;
  CKYCData: boolean = false;
  enginNoMaxLength!: number;
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
  premiumDataPlans!: IPlansMotor[] | any;
  reviewData: any;
  selectedRto!: string;
  initialQuotationRequest!: ApplicationVehicleData;
  yearChanged!: boolean;

  regYearList: IRegistrationYear[] = [];
  newPremium: number = 0;
  oldPremium: number = 0;
  currentRegYear!: number;
  newPremiumModal: string = "none";
  //#endregion

  constructor(
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private _route: ActivatedRoute,
    private _location: Location,
    private _router: Router,
    private posHomeService: PosHomeService,
    private _toastService: ToastrService,
    private screenCaptureService: NgxCaptureService,

    _fb: FormBuilder
  ) {
    this.ownerInfoForm = _fb.group({
      // carAsCompany: ["", Validators.required],
      ownerName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
        ],
      ],
      ownerLastName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
        ],
      ],
      PropGenderTitle: ["", Validators.required],
      mobileNo: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.pattern(PATTERN.MOBILENO),
          Validators.maxLength(10),
        ],
      ],
      emailId: [
        "",
        [
          Validators.required,
          Validators.pattern(PATTERN.EMAIL),
          Validators.maxLength(70),
        ],
      ],
      gender: ["", Validators.required],
      // married: ["", Validators.required],
      dob: ["", [Validators.required, Validators.maxLength(10)]],
      nomineeName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
        ],
      ],
      nomineeDob: ["", [Validators.required, Validators.maxLength(10)]],
      nomineeRelation: ["", Validators.required],
      gstin: [
        "",
        [Validators.maxLength(15), Validators.pattern(PATTERN.GSTIN)],
      ],
    });
    this.addressForm = _fb.group({
      area: ["", [Validators.required, Validators.minLength(4), Validators.maxLength(150)]], // earlier 15
      pincode: [
        "",
        [
          Validators.required,
          Validators.maxLength(6),
          Validators.pattern(PATTERN.PINCODE),
        ],
      ],
      postalAdd: ["", [Validators.required, Validators.minLength(4), Validators.maxLength(150)]],
      state: ["", Validators.required],
      district: ["", Validators.required],
      city: ["", Validators.required],
    });
    this.pastPolicyForm = _fb.group({
      prvPolicyExpDate: ["", [Validators.required, Validators.maxLength(10)]],
      prvPolicyStartDate: ["", [Validators.required, Validators.maxLength(10)]],
      thirdPartyPolicyIncepDate: [null],
      thirdPartyPolicyExpDate: [null],
      prvPolicyInsurer: ["", Validators.required],
      prvPolicyNo: ["", Validators.required],
      claimInPrvYear: ["0", Validators.required],
      ncb: [null],
      prvPolicyODInsurer: [""],
      prvPolicyODNo: [""],
    });
    this.vehicleDetailForm = _fb.group({
      regNo: [""],
      regDate: ["", [Validators.required, Validators.maxLength(10)]],
      engineNo: [
        "",
        [
          Validators.required,
          Validators.minLength(5), //earlier 6
          // Validators.maxLength(25),
          Validators.pattern(PATTERN.ALPHANUMERIC),
        ],
      ],
      chassisNo: [
        "",
        [
          Validators.required,
          Validators.minLength(5), //earlier 17
          // Validators.maxLength(17),
          Validators.pattern(PATTERN.ALPHANUMERIC),
        ],
      ],
      onMortgage: ["0", Validators.required],
      IsPUC: [''],
      bankName: [""],
      bankAddress: [""],
    });
  }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;

  ngOnInit() {
    this.initialQuotationRequest = JSON.parse(
      sessionStorage.getItem("CarData")!
    );

    this.ckycSessionData = JSON.parse(sessionStorage.getItem("CKYCData")!)
    if (this.initialQuotationRequest.edit == 1) {
      this.initialQuotationRequest.edit = 0;
      sessionStorage.setItem(
        "CarData",
        JSON.stringify(this.initialQuotationRequest)
      );
    }
    this._subscriptions.push(
      this._route.paramMap.subscribe((p: any) => {
        const No: string = p.get("a_id");
        const Odp: string = p.get("odp");
        this.postData.ApplicationNo = Number(decrypt(No));
        this.postData.ApplicationNoOdp = Number(decrypt(Odp));
      })
    );
    this._subscriptions.push(
      this.posHomeService
        .getRegYearFuelList(this.initialQuotationRequest["InsuranceCateCode"])
        .subscribe((res) => {
          //console.log({ res });

          if (res.successcode == "0" || res.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
            this.errorLogDetails.CompanyName = this.PlanData.ProductName;
            this.errorLogDetails.ControllerName = "PosHome";
            this.errorLogDetails.MethodName = "GetFuelYearList";
            this.errorLogDetails.ErrorCode = res.successcode ? res.successcode : "0";
            this.errorLogDetails.ErrorDesc = res.msg ? res.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                //console.log(res);
              });
          }
          this.regYearList = this.regYearList = res.data.Table1;
        })
    );

    this.premiumDataPlans = JSON.parse(sessionStorage.getItem("popupData")!);
    this.PlanData = this.premiumDataPlans;
    this.getRTO = this.PlanData.rto;
    this.currentRegYear =
      +this.initialQuotationRequest["VehicleRegistrationYrDesc"];
    this.isPrvPolicyRemember = this.initialQuotationRequest.PrvPolicyRememberCode;
    this.checkCurrentAddForm = this.PlanData.CompanyCode === "11" ? true : null;
    console.log("sdffdsd--------=-==--->", this.checkCurrentAddForm, this.PlanData)
    // if (this._vehicleBuyPlanService.PraposalMasterData) {
    //   let data = this._vehicleBuyPlanService.PraposalMasterData;
    //   this.genderList = data.Gender;
    //   this.familyMemberList = data.Family_Member;
    //   this.stateList = data.State;
    //   this.cityList = data.City;
    //   this.insuCompanyList = data.Insurance_Company;
    // } else {
    this.reliance = this.PlanData.CompanyCode == '11' ? true : false;
    if (this.PlanData.isOdOnly) {
      this.setOdValidators();
    }
    if (this.isPrvPolicyRemember == 0) {
      this.pastPolicyForm.disable()
    } else {
      this.pastPolicyForm.enable()
    }
    this.getData();
    // }
    this.getSavedData();
    this.setMortgageValidators();
    this.listenRegYearChange();
    if (this.PlanData.CompanyCode == "11") {
      this.salutations = this.salutations.filter(s => s.value !== 'M/s')//slice(1, 1)
    }
    debugger
    if (this.PlanData.CompanyCode == '13') {
      this.vehicleDetailForm.get("engineNo")!.setValidators([Validators.maxLength(14)])
      this.enginNoMaxLength = 14
    } else {
      this.vehicleDetailForm.get("engineNo")!.setValidators([Validators.maxLength(17)])
      this.enginNoMaxLength = 17
    }
  }

  listenRegYearChange() {
    // this.vehicleDetailForm.get("regDate").valueChanges.subscribe((value) => {
    //   let regYear = +convertToMydate(value).split("/")[2];
    //   let initiallySetRegYear =
    //     +this.initialQuotationRequest["VehicleRegistrationYrDesc"];
    //   if (regYear !== initiallySetRegYear) this.yearChanged = true;
    //   else this.yearChanged = false;
    // });
    this._subscriptions.push(
      this.vehicleDetailForm.get("regDate")!.valueChanges.subscribe((value) => {
        if (+new Date(value).getFullYear() !== +this.currentRegYear) {
          this.yearChanged = true;
        } else this.yearChanged = false;
      })
    );
  }

  private setOdValidators() {
    const thirdPartyPolicyIncepDateControl: any = this.pastPolicyForm.get(
      "thirdPartyPolicyIncepDate"
    );
    const thirdPartyPolicyExpDateControl: any = this.pastPolicyForm.get(
      "thirdPartyPolicyExpDate"
    );
    thirdPartyPolicyIncepDateControl.setValidators([
      Validators.required,
      Validators.maxLength(10),
    ]);
    thirdPartyPolicyExpDateControl.setValidators([
      Validators.required,
      Validators.maxLength(10),
    ]);
    this.pastPolicyForm.setValidators(thirdPartyDateValidator);
    this.pastPolicyForm.updateValueAndValidity();
    thirdPartyPolicyIncepDateControl.updateValueAndValidity();
    thirdPartyPolicyExpDateControl.updateValueAndValidity();
  }

  //#region private functions for making server call

  private getDistrictList(StateCode?: any) {

    this._subscriptions.push(this._vehicleBuyPlanService.GetDistrict(StateCode).subscribe((result) => {
      if (result.successcode == "0") {
        this.errorLogDetails.UserCode = this.posMobileNo;
        this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
        this.errorLogDetails.CompanyName = this.PlanData.ProductName;
        this.errorLogDetails.ControllerName = "VehicleData";
        this.errorLogDetails.MethodName = "GetPincodeListByDistrict";
        this.errorLogDetails.ErrorCode = result.successcode;
        this.errorLogDetails.ErrorDesc = result.msg;
        this._errorHandleService
          .sendErrorLog(this.errorLogDetails)
          .subscribe((res: any) => {
            console.log(res);
          });

      }
      this.districtList = result.data
      this.setDistrictValidator()
      this.onChangeDistrictInput()

    }))

  }

  fectchDataFromCKYCSession() {
    // alert(0)
    debugger;
    console.log(this.ckycSessionData)
    if (this.ckycSessionData === null) {
      this.CKYCData = false
    } else {
      this.CKYCData = true
      let g: IGender | any;
      let sts: IState | any;
      if (this.ckycSessionData!.Gender) {
        g = this.genderList.find((g: IGender) => g!.GenderDesc[0] === this.ckycSessionData!.Gender)
      }

      if (this.ckycSessionData.CorAddress.AddState !== "" || this.ckycSessionData.CorAddress.AddState !== null || this.ckycSessionData.CorAddress.AddState !== undefined) {
        sts = this.stateList!.find((x: IState) => {
          // console.log(x.StateDesc.split(" ").join("").toLowerCase() , this.ckycSessionData.CorAddress.AddState.split(" ").join("").toLowerCase());

          return (x!.StateShortDesc.toLowerCase() == this.ckycSessionData!.CorAddress.AddState.toLowerCase()) || (x.StateDesc.split(" ").join("").toLowerCase() == this.ckycSessionData.CorAddress.AddState.split(" ").join("").toLowerCase())
        })
      } else {
        this.filterStateList.subscribe(res => {
          console.log("input satetr ", res)
          this.filterState = res.filter(m => {
            return m.StateShortDesc.toString() == this.getRTO.slice(0, 2)
          })
          //  console.log('flitrer saftafd ',this.filterState)
        });
        this.filterStateList = this.addressForm.controls[
          "state"
        ].valueChanges.pipe(
          startWith(""),
          map((state) => this._filterState(state))
        );
        this.setStateValidator();
        this.setCityValidator();
      }
      // const cts = this.cityList!.find((x: ICity) => x!.CityDesc == this.ckycSessionData!.CorAddress.AddCity)
      // this.filterStateList = this.addressForm.controls[
      //   "state"
      // ].valueChanges.pipe(
      //   startWith(""),
      //   map((state) => this._filterState(state))
      // );
      // this.setStateValidator();
      // this.setCityValidator();
      // this.getDistrictList(sts!.StateCode)
      // this.getDistrictList(this.filterState[0].StateShortDesc)

      // const pincode=this.pincodeList!.find((x:IPincodeSBI)=>x!.Pincode==this.ckycSessionData!.A99ResponseData!.CKYCDownloadResult!.CKYCPerAddPin)
      let db = moment(this.ckycSessionData.DOB, "DD-MM-YYYY")
      this.ownerInfoForm.patchValue({
        ownerName: this.ckycSessionData!.FirstName,
        ownerLastName: this.ckycSessionData!.LastName,
        PropGenderTitle: this.ckycSessionData.Title ? this.ckycSessionData.Title.slice(0, 1).toUpperCase() + this.ckycSessionData.Title.slice(1, this.ckycSessionData.Title.length).toLowerCase() : "",
        gender: this.ckycSessionData!.Gender ? `${g.GenderCode},${g.GenderDesc}` : "",
        dob: db.toDate(),//formatDate(new Date(this.ckycSessionData!.DOB), 'dd/MM/yyyy', 'en-US'),
        mobileNo: this.ckycSessionData!.MobileNumber,
        emailId: this.ckycSessionData!.EmailAdd,
      });


      this.addressForm.patchValue({
        pincode: this.ckycSessionData!.CorAddress.AddPin,
        postalAdd: this.ckycSessionData!.CorAddress.Add1,
        state: this.ckycSessionData.CorAddress.AddState ? sts.StateDesc : "",//this.ckycSessionData!.CorAddress.AddState,//
        city: this.ckycSessionData!.CorAddress.AddCity,//cts.CityDesc,//
        area: this.ckycSessionData!.CorAddress.Add2,
        // district: this.ckycSessionData!.AddDistrict
      });
      console.log(this.ownerInfoForm, this.addressForm);
    }

  }

  fectchDataFromCKYCSessionForSBI() {
    if (this.ckycSessionData === null) {
      this.CKYCData = false
    } else {
      this.CKYCData = true
      let g: { GenderCode: any; GenderDesc: any; } | any = null;
      let sts: IState | any = null;
      if (this.ckycSessionData!.Gender) {

        g = this.genderList.find((g: IGender) => g!.GenderDesc[0] === this.ckycSessionData!.Gender)

      }
      if (this.ckycSessionData.CorAddress.AddState) {
        sts = this.stateList!.find((x: IState) => x!.StateCode.toLowerCase() == this.ckycSessionData.CorAddress.AddState.toLowerCase())
        this.getDistrictList(sts!.StateCode)

      }
      let db = moment(this.ckycSessionData.DOB, "DD-MMM-YYYY")
      console.log(db, db.toDate());

      this.ownerInfoForm.patchValue({
        ownerName: this.ckycSessionData!.FirstName,
        ownerLastName: this.ckycSessionData!.LastName,
        PropGenderTitle: this.ckycSessionData.Title ? this.ckycSessionData.Title.slice(0, 1).toUpperCase() + this.ckycSessionData.Title.slice(1, this.ckycSessionData.Title.length).toLowerCase() : "",
        gender: this.ckycSessionData!.Gender ? `${g.GenderCode},${g.GenderDesc}` : "",
        dob: db.toDate(),//formatDate(new Date(this.ckycSessionData!.DOB), 'dd/MM/yyyy', 'en-US'),
        mobileNo: this.ckycSessionData!.MobileNumber,
        emailId: this.ckycSessionData!.EmailAdd,
      });


      this.addressForm.patchValue({
        pincode: this.ckycSessionData!.CorAddress.AddPin,
        postalAdd: this.ckycSessionData!.CorAddress.Add1,
        state: this.ckycSessionData.CorAddress.AddState ? sts.StateDesc : "",//this.ckycSessionData!.CorAddress.AddState,//
        city: this.ckycSessionData!.CorAddress.AddCity,//cts.CityDesc,//
        addArea: this.ckycSessionData!.CorAddress.Add2,
        district: this.ckycSessionData!.CorAddress.AddDistrict
      });
      console.log(this.ownerInfoForm, this.addressForm);
    }

  }

  private getData() {
    this.showLoader = true;
    this.ownerInfoForm.patchValue({
      PropGenderTitle: "Mr",
    });
    this._subscriptions.push(
      this._vehicleBuyPlanService.getPraposalMaster(this.PlanData.CompanyCode).subscribe(
        (result) => {

          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
            this.errorLogDetails.CompanyName = this.PlanData.ProductName;
            this.errorLogDetails.ControllerName = " VehicleData";
            this.errorLogDetails.MethodName = "GetVehicleProposalData";
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                //console.log(res);
              });
          }
          if (result.successcode == "1") {
            this.genderList = result.data.Gender;
            this.familyMemberList = result.data.Family_Member;
            this.stateList = result.data.State;
            this.cityList = result.data.City;

            this.filterStateList = this.addressForm.controls[
              "state"
            ].valueChanges.pipe(
              startWith(""),
              map((state) => this._filterState(state))
            );


            if (this.PlanData.CompanyCode == '2' || this.PlanData.CompanyCode == '11' || this.PlanData.CompanyCode == "6") {
              this.fectchDataFromCKYCSession();
            } else if (this.PlanData.CompanyCode == "7") {
              this.fectchDataFromCKYCSessionForSBI()
            }
            else {
              this.filterStateList = this.addressForm.controls[
                "state"
              ].valueChanges.pipe(
                startWith(""),
                map((state) => this._filterState(state)));

              this.filterStateList.subscribe(res => {
                //console.log("input satetr ",res)

                this.filterState = res.filter(m => {
                  return m.StateShortDesc.toString() == this.getRTO.slice(0, 2)
                })
                if (this.PlanData.CompanyCode == '7') {
                  this.getDistrictList(this.filterState[0].StateShortDesc)
                }
                //  console.log('flitrer saftafd ',this.filterState)

              });
              this.cityList = result.data.City;
              this.setStateValidator();
              this.setCityValidator();

            }




            // this.insuCompanyList = result.data.Insurance_Company;

            this._subscriptions.push(
              this._vehicleBuyPlanService
                .GetPreviousInsurerByCompanyCode(this.PlanData.CompanyCode)
                .subscribe(
                  (result) => {
                    this.showLoader = false;
                    if (result.successcode == "0" || result.successcode == null) {
                      this.errorLogDetails.UserCode = this.posMobileNo;
                      this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
                      this.errorLogDetails.CompanyName = this.PlanData.ProductName;
                      this.errorLogDetails.ControllerName = " VehicleData";
                      this.errorLogDetails.MethodName = "GetPreviousInsurerByCompanyCode";
                      this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
                      this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
                      this._errorHandleService
                        .sendErrorLog(this.errorLogDetails)
                        .subscribe((res: any) => {
                          //console.log(res);
                        });
                    }
                    // let search = new RegExp(this.premiumDataPlans.ProductName , 'i');

                    // let b = result.data.filter(item => search.test(item.PREVIOUSINSURERS));
                    // result.data.Insurance_Company = result.data.filter(function(item) {
                    //   return item.PREVIOUSINSURERS !== b[0].PREVIOUSINSURERS
                    // })
                    // Remove selected company from api insurance Company end
                    this.mortgageBankList = result.data.MortgageBankList;
                    // async ngOnInit(): Promise<any> {
                    //   const data = await this.service.getData().pipe(take(1)).toPromise();
                    //   this.data = this.modifyMyData(data);
                    // }

                    this.insuCompanyList = result.data.PreviousInsurerList;

                    this.ppInsurerList = this.pastPolicyForm.controls[
                      "prvPolicyInsurer"
                    ].valueChanges.pipe(
                      startWith(""),
                      map((prvPolicyInsurer) =>
                        this._filterPPInsurer(prvPolicyInsurer)
                      )
                    );

                    this.setInsuranceCompanyValidator();

                    if (this.PlanData.CompanyCode != '7') {
                      this.pastPolicyForm.get(['prvPolicyODInsurer'])!.disable()
                      this.pastPolicyForm.get(['prvPolicyODNo'])!.disable()
                    }
                    // if (this.PlanData.CompanyCode = '7') {
                    //   console.log(this.pastPolicyForm)
                    //   this.pastPolicyForm.get("prvPolicyODInsurer").disable()
                    //   this.pastPolicyForm.get("prvPolicyODNo").disable()
                    // }this.addressForm.controls['district'].enable()


                    if (this.PlanData.isOdOnly == true) {
                      this.ppODInsurerList = this.pastPolicyForm.controls[
                        "prvPolicyODInsurer"
                      ].valueChanges.pipe(
                        startWith(""),
                        map((prvPolicyInsurer) =>
                          this._filterPPInsurer(prvPolicyInsurer)
                        )
                      );

                      this.setInsuranceODCompanyValidator();
                    }



                  },
                  (err: any) => {
                    this.showLoader = false;
                    // if (result.successcode == "0") {
                    this.errorLogDetails.UserCode = this.posMobileNo;
                    this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
                    this.errorLogDetails.CompanyName = this.PlanData.ProductName;
                    this.errorLogDetails.ControllerName = " VehicleData";
                    this.errorLogDetails.MethodName = "GetPreviousInsurerByCompanyCode";
                    this.errorLogDetails.ErrorCode = '0';
                    this.errorLogDetails.ErrorDesc = 'Something went wrong.';
                    this._errorHandleService
                      .sendErrorLog(this.errorLogDetails)
                      .subscribe((res: any) => {
                        //console.log(res);
                      });
                    // }
                    this._errorHandleService.handleError(err);
                  }
                )
            );
            this.filterCityList = [];
          }
        },
        (err: any) => {
          this.showLoader = false;
          // if (result.successcode == "0") {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
          this.errorLogDetails.CompanyName = this.PlanData.ProductName;
          this.errorLogDetails.ControllerName = " VehicleData";
          this.errorLogDetails.MethodName = "GetPreviousInsurerByCompanyCode";
          this.errorLogDetails.ErrorCode = err.successcode;
          this.errorLogDetails.ErrorDesc = err.msg;
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              //console.log(res);
            });
          // }
          this._errorHandleService.handleError(err);
        }
      )
    );
  }


  isReadonly = (fieldName: string, data: any): boolean => {

    switch (fieldName) {
      case 'mobileNo': {
        return (data!.MobileNumber !== null && data!.MobileNumber !== "" && data!.MobileNumber !== undefined)
      }
      case 'PropGenderTitle': {
        return (data!.Title !== null && data!.Title !== "" && data!.Title !== undefined)
      }
      case 'ownerName': {
        return (data!.FirstName !== null && data!.FirstName !== "" && data!.FirstName !== undefined)
      }
      case 'ownerLastName': {
        return (data!.LastName !== null && data!.LastName !== "" && data!.LastName !== undefined)
      }
      case 'dob': {
        return (data!.DOB !== null && data!.DOB !== "" && data!.DOB !== undefined)
      }
      case 'emailId': {
        return (data!.EmailAdd !== null && data!.EmailAdd !== "" && data!.EmailAdd !== undefined)
      }
      case 'postalAdd': {
        return (data!.CorAddress.Add1 !== null && data!.CorAddress.Add1 !== "" && data!.CorAddress.Add1 !== undefined)
      }
      case 'addArea': {
        return (data!.CorAddress.Add2 !== null && data!.CorAddress.Add2 !== "" && data!.CorAddress.Add2 !== undefined)
      }
      case 'state': {
        return (data!.CorAddress.AddState !== null && data!.CorAddress.AddState !== "" && data!.CorAddress.AddState !== undefined)
      }
      case 'district': {
        return (data!.CorAddress.AddDistrict !== null && data!.CorAddress.AddDistrict !== "" && data!.CorAddress.AddDistrict !== undefined)
      }
      case 'city': {
        return (data!.CorAddress.AddCity !== null && data!.CorAddress.AddCity !== "" && data!.CorAddress.AddCity !== undefined)
      }
      case 'pincode': {
        return (data!.CorAddress.AddPin !== null && data!.CorAddress.AddPin !== "" && data!.CorAddress.AddPin !== undefined)
      }
      case 'gender': {
        return (data!.CorAddress.Gender !== null && data!.CorAddress.Gender !== "" && data!.CorAddress.Gender !== undefined)
      }
      default: {
        return true;
      }
    }

  }

  setStateValidator() {
    this.af
      .get("state")!
      .setValidators([Validators.required, RequireMatch(this.stateList)]);
    this.af.get("state")!.updateValueAndValidity();
  }

  setDistrictValidator() {
    this.af
      .get("district")!
      .setValidators([Validators.required, RequireMatchDistrict(this.districtList)]);
    this.af.get("district")!.updateValueAndValidity();
  }

  setCityValidator() {
    this.af
      .get("city")!
      .setValidators([Validators.required, RequireMatchCity(this.cityList)]);
    this.af.get("city")!.updateValueAndValidity();
  }

  setSBICityValidator() {
    this.af
      .get("city")!
      .setValidators([Validators.required, RequireMatchSBICity(this._cityList)]);
    this.af.get("city")!.updateValueAndValidity();
  }

  setPincodeValidator() {
    this.af
      .get("pincode")!
      .setValidators([
        Validators.required,
        RequireMatchPincode(this.pincodeList),
      ]);
    this.af.get("pincode")!.updateValueAndValidity();
  }



  emptyAddressFieldOnError() {
    debugger
    if (this.PlanData.CompanyCode == "7") {
      if (this.af.get("state")!.errors) {

        this.af.get("district")!.reset()
        this.af.get("city")!.reset()
        this.af.get("pincode")!.reset()

        this.filteredCityList = of([])
        this.filteredautoPincodeList = of([])

      } else if (this.af.get("district")!.errors) {

        this.af.get("city")!.reset()
        this.af.get("pincode")!.reset()

        this.filteredCityList = of([])
        this.filteredautoPincodeList = of([])

      } else if (this.af.get("city")!.errors) {

        this.af.get("pincode")!.reset()
        this.filteredautoPincodeList = of([])
      }
    } else {
      if (this.af.get("state")!.errors) {

        this.af.get("city")!.reset()
        this.af.get("pincode")!.reset()

        this.filteredCityList = of([])
        this.filteredautoPincodeList = of([])


      } else if (this.af.get("city")!.errors) {

        this.af.get("pincode")!.reset()
        this.filteredautoPincodeList = of([])

      } else {
        this.filteredCityList = this.filteredCityList
        this.filteredautoPincodeList = this.filteredautoPincodeList

      }
    }
  }
  get pf() {
    return this.pastPolicyForm;
  }

  get af() {
    return this.addressForm;
  }

  get bf() {
    return this.vehicleDetailForm
  }

  setInsuranceCompanyValidator() {
    this.pf
      .get("prvPolicyInsurer")!
      .setValidators([
        Validators.required,
        RequireMatchPrvInsCompany(this.insuCompanyList),
      ]);
    this.pf.get("prvPolicyInsurer")!.updateValueAndValidity();
  }
  setInsuranceODCompanyValidator() {
    this.pf
      .get("prvPolicyODInsurer")!
      .setValidators([
        Validators.required,
        RequireMatchPrvInsCompany(this.insuCompanyList),
      ]);
    this.pf.get("prvPolicyODNo")!.setValidators([Validators.required, Validators.maxLength(25), Validators.minLength(6)])
    this.pf.get('prvPolicyODNo')!.updateValueAndValidity()
    this.pf.get("prvPolicyODInsurer")!.updateValueAndValidity();
  }

  setBankMortageValidator() {

    this.bf
      .get("bankName")!
      .setValidators([
        Validators.required,
        RequireMatchMortageBankName(this.mortgageBankList),
      ]);
    this.bf.get("bankName")!.updateValueAndValidity();
  }

  dataToBePatched!: ApplicationVehicleData[] | any;
  private getSavedData() {
    this._subscriptions.push(
      this._vehicleBuyPlanService
        .getSavedPraposalData(
          this.postData.ApplicationNo,
          this.postData.ApplicationNoOdp
        )
        .subscribe(
          (result) => {

            this.showLoader = false;
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
              this.errorLogDetails.CompanyName = this.PlanData.ProductName;
              this.errorLogDetails.ControllerName = `VehicleData`;
              this.errorLogDetails.MethodName = "GetApplicationData";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  //console.log(res);
                });
            }
            if (result.successcode == "1") {
              let data = result.data.Table[0];
              this.dataToBePatched = result.data.Table1[0];

              this.isNewPolicy = data.SubCateCode == 4; //4=new vehicle
              const regNo: any = this.vehicleDetailForm.get("regNo");
              this.selectedRto = data.VehicleRTODesc.split(" ")[0] + "-";
              if (this.PlanData.CompanyCode == '7' && !this.isNewPolicy) {
                this.vehicleDetailForm.get('IsPUC')!.setValidators([Validators.required])
              }
              else {
                this.vehicleDetailForm.get('IsPUC')!.setValidators(null)
              }
              this.vehicleDetailForm.get('IsPUC')!.updateValueAndValidity()

              if (this.isNewPolicy) {
                regNo.setValidators([]);
              } else {
                regNo.setValidators([Validators.required]);
                // Validators.pattern(PATTERN.VEHICLENO),
              }
              // const vehicleRegistrationYear = data.VehicleRegistrationYrDesc;

              if (!this.isNewPolicy) {
                this.setNewPolicyValidators();

                // <previous policy expiry date patching>
                let dateString = data.PreviousPolicyExpiryDate;
                let dataSplit = dateString.split("/");
                let dateConverted;
                if (dataSplit[2].split(" ").length > 1) {
                  let hora = dataSplit[2].split(" ")[1].split(":");
                  dataSplit[2] = dataSplit[2].split(" ")[0];
                  dateConverted = new Date(
                    +dataSplit[2],
                    +dataSplit[1] - 1,
                    +dataSplit[0],
                    +hora[0],
                    +hora[1]
                  );
                } else {
                  dateConverted = new Date(
                    +dataSplit[2],
                    +dataSplit[1] - 1,
                    +dataSplit[0]
                  );
                }
                let dateCov;
                if (dataSplit[2].split(" ").length > 1) {
                  let hora = dataSplit[2].split(" ")[1].split(":");
                  dataSplit[2] = dataSplit[2].split(" ")[0];

                  dateCov = new Date(
                    +dataSplit[2] - 1,
                    +dataSplit[1] - 1,
                    +dataSplit[0] + 1,
                    +hora[0],
                    +hora[1]
                  );

                } else {

                  dateCov = new Date(
                    +dataSplit[2] - 1,
                    +dataSplit[1] - 1,
                    +dataSplit[0] + 1
                  );
                }
                console.log(dateCov);
                this.pastPolicyForm.patchValue({
                  prvPolicyStartDate: dateCov,
                });
                this.pastPolicyForm.patchValue({
                  prvPolicyExpDate: dateConverted,
                });
                // </previous policy expiry date patching>

                //<new vehicle year reg Date>
                let prvPolicyExpDate =
                  this.pastPolicyForm.get("prvPolicyExpDate")!.value;

                // increasing the vehicle reg date by one day ie next day after the previous policy expiry date
                let vehicleRegDate = new Date(
                  prvPolicyExpDate.getTime() + 1000 * 60 * 60 * 24
                );
                let vehicleRegYear = data.VehicleRegistrationYrDesc;
                vehicleRegDate.setFullYear(vehicleRegYear);

                this.vehicleDetailForm.patchValue({
                  regDate: vehicleRegDate,
                });
                //</new vehicle reg date>
                //patching vehicle reg date
                // let prvPolicyExpDate = new Date(
                //   this.premiumDataPlans["previousPolicyExpiryDate"]
                // );
                // let vehicleRegDate = new Date(
                //   prvPolicyExpDate.getTime() + 1000 * 60 * 60 * 24
                // );
                // vehicleRegDate.setFullYear(vehicleRegistrationYear);
                // this.vehicleDetailForm.patchValue({
                //   // regDate: new Date(
                //   //   vehicleRegistrationYear,
                //   //   new Date().getMonth(),
                //   //   new Date().getDate() + 1
                //   // ),
                //   regDate: vehicleRegDate,
                // });
                // this.minDate = new Date(Number(vehicleRegistrationYear), 0, 1);
                // this.maxDate = new Date(Number(vehicleRegistrationYear), 11, 31);
              } else {
                this.vehicleDetailForm.patchValue({ regDate: new Date() });
                this.minDate = new Date();
                this.maxDate = new Date();
              }

              // setting owner info default values (tabIndex=0)

              if (this.PlanData.CompanyCode !== "2"
                && this.PlanData.CompanyCode != "11"
                && this.PlanData.CompanyCode != "6"
                && this.PlanData.CompanyCode != "7") {
                this.ownerInfoForm.patchValue({
                  ownerName: data.OwnerName,
                });
                this.ownerInfoForm.patchValue({
                  ownerLastName: data.OwnerLastName,
                });
              }
              // setting past policy default values (tabIndex=2)
              this.pastPolicyForm.patchValue({
                // prvPolicyStartDate: new Date(
                //   vehicleRegistrationYear,
                //   new Date().getMonth(),
                //   new Date().getDate()
                // ),
                // prvPolicyExpDate: new Date(
                //   JSON.parse(
                //     sessionStorage.getItem("popupData")
                //   ).previousPolicyExpiryDate
                // ),
                prvPolicyExpDate: new Date(
                  this.premiumDataPlans["previousPolicyExpiryDate"]
                ),
              });

              // setting vehicle default values (tabIndex=3)
              this.vehicleDetailForm.patchValue({
                // regDate: new Date(),
                // regNo: data.VehicleNo,
                engineNo: data.EngineNo,
                chassisNo: data.VehicleIdentityNo,
              });

              this.dataToBePatched &&
                this.preFillProposalForm(this.dataToBePatched);

              if (!this.isNewPolicy) {
                this.checkIfRegDateIsAllowed();
                this.companyWiseRegDateValidation();
              }
            }
          },
          (err: any) => {
            this.showLoader = false;
            this._errorHandleService.handleError(err);
          }
        )
    );
  }

  preFillProposalForm(dataToBePatched: any) {
    if (dataToBePatched.PaymentInd === 1) {
      this._router.navigateByUrl("/pos");
      return;
    }
    this.ownerInfoForm.patchValue({
      ownerName: dataToBePatched.VechileOwnerName,
      ownerLastName: dataToBePatched.VehicleOwnerLastName,
      PropGenderTitle: dataToBePatched.Salutation,
      gender: `${dataToBePatched.GenderCode},${dataToBePatched.GenderCodeDesc}`,
      dob: new Date(dataToBePatched.DOB),
      mobileNo: dataToBePatched.MobileNo,
      emailId: dataToBePatched.EmailID,
      nomineeName: dataToBePatched.NomineeName,
      nomineeDob: new Date(dataToBePatched.NomineeDOB),
      nomineeRelation: `${dataToBePatched.RelationshipCode},${dataToBePatched.RelationshipDesc}`,
    });

    this.addressForm.patchValue({
      pincode: dataToBePatched.PINCode,
      postalAdd: dataToBePatched.PostalAdd,
      state: dataToBePatched.StateDesc,
      city: dataToBePatched.CityDesc,
      area: dataToBePatched.Area,
    });

    this.pastPolicyForm.patchValue({
      prvPolicyStartDate: new Date(dataToBePatched.PreviousPolicyStartDate),
      prvPolicyExpDate: new Date(dataToBePatched.PreviousPolicyExpDate),
      thirdPartyPolicyIncepDate: new Date(
        dataToBePatched.ThirdPartyPolicyInceptionDate
      ),
      thirdPartyPolicyExpDate: new Date(
        dataToBePatched.ThirdPartyPolicyExpiryDate
      ),
      prvPolicyODInsurer: dataToBePatched.PreviousPolicyInsurerDescOD,
      prvPolicyODNo: dataToBePatched.PreviousPolicyNoOD,
      prvPolicyInsurer: dataToBePatched.PreviousPolicyInsurerDesc,
      prvPolicyNo: dataToBePatched.PreviousPolicyNo,
      claimInPrvYear: dataToBePatched.ClaimInPastYearCode,
      ncb: dataToBePatched.PreviousNCB,
    });

    this.vehicleDetailForm.patchValue({
      regNo: dataToBePatched.VechileRegNo.slice(
        4,
        dataToBePatched.VechileRegNo.length
      ),
      regDate: new Date(dataToBePatched.VechileRegDate),
      engineNo: dataToBePatched.VechileEngineNo,
      chassisNo: dataToBePatched.VechileChassisNo,
      onMortgage: dataToBePatched.MortgageInd.toString(),
      IsPUC: dataToBePatched.IsPUC ? 1 : 0,
      bankName: dataToBePatched.MortgageLBankName,
      bankAddress: dataToBePatched.MortgageBankAddress,
    });

    //console.log("this.vehicleDetailForm", this.vehicleDetailForm);
  }

  companyWiseRegDateValidation() {
    if (this.premiumDataPlans["CompanyCode"] === "9") {
      this.vehicleDetailForm
        .get("regDate")!
        .setValidators([
          regDateValidationForTATA,
          pastpolicyExDateValidationForTATA(
            this.pastPolicyForm.get("prvPolicyExpDate")!.value
          ),
        ]);
      // this.vehicleDetailForm
      //   .get("regDate")
      //   .setValidators(
      //     pastpolicyExDateValidationForTATA(
      //       this.pastPolicyForm.get("prvPolicyExpDate").value
      //     )
      //   );
      this.vehicleDetailForm.get("regDate")!.updateValueAndValidity();
    }
  }

  private setNewPolicyValidators() {
    const prvPolicyExpDateControl: any = this.pastPolicyForm.get("prvPolicyExpDate");
    const prvPolicyInsurerControl: any = this.pastPolicyForm.get("prvPolicyInsurer");
    const prvPolicyNoControl: any = this.pastPolicyForm.get("prvPolicyNo");

    prvPolicyExpDateControl.setValidators([
      Validators.required,
      Validators.maxLength(10),
    ]);
    prvPolicyInsurerControl.setValidators([Validators.required]);
    prvPolicyNoControl.setValidators([Validators.required]);

    prvPolicyExpDateControl.updateValueAndValidity();
    prvPolicyInsurerControl.updateValueAndValidity();
    prvPolicyNoControl.updateValueAndValidity();
  }
  private setMortgageValidators() {
    const bankNameControl: any = this.vehicleDetailForm.get("bankName");
    const bankAddControl: any = this.vehicleDetailForm.get("bankAddress");
    this._subscriptions.push(
      this.vehicleDetailForm.controls["onMortgage"].valueChanges.subscribe(
        (mort) => {
          if (mort == 1) {
            bankNameControl.setValidators([
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(60),
            ]);

            bankAddControl.setValidators([
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(190),
            ]);
            // this.filterMortgageBankList = this.mortgageBankList
            this.filterMortgageBankList =
              this.PlanData.CompanyCode == "11"
                ? of([])
                : this.vehicleDetailForm.controls["bankName"].valueChanges.pipe(
                  startWith(""),
                  map((bankName) => this._filterBanks(bankName.trim()))
                );


            this.setBankMortageValidator()
          } else {
            bankNameControl.setValidators(null);
            bankAddControl.setValidators(null);
            bankNameControl.setValue("");
            bankAddControl.setValue("");
          }

          bankNameControl.updateValueAndValidity();
          bankAddControl.updateValueAndValidity();
        }
      )
    );
  }
  get vehValid() {
    return this.vehicleDetailForm.controls;
  }
  //#endregion

  //#region  button events and functions

  getMinDate(year: number) {
    return setMinDate(year);
  }
  getMaxDate(year: number) {
    return setMaxDate(year);
  }
  getMaxRegDate(year: number) {
    return setMaxRegDate(year)
  }

  // getMaxDate(year: number) {
  //   const dt = new Date();
  //   return new Date(
  //     +dt.getFullYear() + year,
  //     +dt.getMonth() + 1,
  //     +dt.getDay() + 1
  //   );
  // }
  // getMinDate(year: number) {
  //   const dt = new Date();
  //   return new Date(+dt.getFullYear() - year, +dt.getMonth(), +dt.getDay() + 2);
  // }
  public onChangeTab(event: any) {
    this.tabIndex = event.selectedIndex;
    this.setStates(event.selectedIndex);
  }


  onClickPlanDetails(index: number): void {


    this.premiumDataPlans = JSON.parse(JSON.stringify(this.premiumDataPlans));


    this.planComp.PopUp = true;
    setTimeout(() => {
      this.selectedIndex = index;
    }, 100);
  }
  // onChangeState() {
  //   const stateCode = this.addressForm.get("state").value
  //     ? this.addressForm.get("state").value.split(",")[0]
  //     : 0;
  //   this.filterCityList = stateCode
  //     ? this.cityList.filter((city: ICity) => city.StateCode == stateCode)
  //     : [];
  // }
  // by kishori
  private _filterState(value: string): IState[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.stateList.filter(
      (row) => row.StateDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterDistrict(value: string): IDistrict[] {

    const filterBy = value ? value.toLowerCase() : value;
    return this.filterDistrictList.filter(
      (row) => row.District_Name.toLowerCase().indexOf(filterBy) === 0
    );
  }

  // private _filterCitySbi(value: string): ICitySBI[] {
  //   const filterBy = value ? value.toLowerCase() : value;
  //   return this.filterCityList.filter(
  //     (row) => row.City_Name.toLowerCase().indexOf(filterBy) === 0
  //   );
  // }


  private _filterCity(value: string): ICity[] {
    debugger
    const filterBy = value ? value.toLowerCase() : value;
    return this.filterCityList.filter(
      (row) => row.CityDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }

  private _filterCitySbi(value: string): ICitySBI[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this._filterCityList.filter(
      (row) => row.City_Name.toLowerCase().indexOf(filterBy) === 0
    );
  }

  private _filterPincode(value: string): IPincode[] {
    const filterBy = value;
    return this.pincodeList.filter(
      (option) => option.Pincode.toString().trim().indexOf(filterBy) === 0
    );
  }

  private _filterPPInsurer(value: string): IInsuranceCompany[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.insuCompanyList.filter(
      (row) => row.InsuranceCompanyDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterBanks(value: string): IMortgageBank[] {
    const filterBy = value;
    return this.mortgageBankList
      .filter(
        (option) =>
          option.MortgageLBankName.toString().trim().indexOf(filterBy) === 0
      )
      .slice(0, 100);
  }

  async onChangeBank() {
    const bank = this.vehicleDetailForm.get("bankName")!.value;
  }
  async onChangePPInsurer() {
    const ppI = this.pastPolicyForm.get("prvPolicyInsurer")!.value;
  }
  async onChangePPODInsurer() {
    const ppI = this.pastPolicyForm.get("prvPolicyODInsurer")!.value;
  }
  // async onChangeStateInput() {
  //   setTimeout(() => {
  //     if (
  //       !this.stateList.find(
  //         (state) => state.StateDesc === this.addressForm.value.state
  //       )
  //     ) {
  //       this.addressForm.patchValue({
  //         state: "",
  //       });
  //     }
  //   }, 500);
  // }

  async onChangeStateInput() {
    if (
      this.stateList.find(
        (state) => state.StateDesc === this.addressForm.value.state
      )
    ) {
      // this.onChangeState();
    }
  }
  async onChangeState() {
    //
    // const stateCode = this.addressForm.get('state').value ? this.addressForm.get('state').value.split(',')[0] : 0;
    //   this.filterCityList = stateCode ? this.cityList.filter((city: ICity) => city.StateCode == stateCode) : [];
    const sts = this.addressForm.get("state")!.value; //st.name
    this.searchState = sts
      ? this.stateList.filter((st: IState) => st.StateDesc == sts)
      : [];

    if (this.PlanData.CompanyCode == '7') {
      let stateCode = this.searchState[0].StateShortDesc;

      this.filterDistrictList = stateCode
        ? this.districtList.filter((district: IDistrict) => district.State_code == stateCode)
        : [];
      this.addressForm.controls["district"].reset()
      this.addressForm.controls["city"].reset();
      this.addressForm.controls["pincode"].reset();
      this.filteredDistrictList = this.addressForm.controls["district"].valueChanges.pipe(
        startWith(""),
        map((district) => this._filterDistrict(district))
      );
    } else {
      let stateCode = this.searchState[0].StateCode;
      // const stateCo = this.searchState.find((e) => {
      //   stateCode = e.StateCode;
      // });
      this.filterCityList = stateCode
        ? this.cityList.filter((city: ICity) => city.StateCode == stateCode)
        : [];
      this.addressForm.controls["district"].reset()
      this.addressForm.controls["city"].reset();
      this.addressForm.controls["pincode"].reset();
      this.filteredCityList = this.addressForm.controls["city"].valueChanges.pipe(
        startWith(""),
        map((city) => this._filterCity(city))
      );


    }
  }

  onChangeDistrictInput() {

    if (
      this.districtList.find(
        (District) => District.District_Name === this.addressForm.value.district
      )
    ) {

      this.onChangeDistrict();
    }

  }


  async onChangeDistrict() {

    // console.log(city);

    let dts: any = this.addressForm.get("district")!.value;
    let district: any = this.districtList.find(
      (District) => District.District_Name === dts
    )
    console.log(district);

    // console.log(district);
    this.showLoader = true;
    this.addressForm.controls["city"].reset();
    this.addressForm.controls["pincode"].reset();
    this._subscriptions.push(
      this._vehicleBuyPlanService.GetCity(district.State_code, district.District_code).subscribe((result) => {
        this.showLoader = false;
        if (result.successcode == "0") {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
          this.errorLogDetails.CompanyName = this.PlanData.ProductName;
          this.errorLogDetails.ControllerName = "VehicleData";
          this.errorLogDetails.MethodName = "GetPincodeListByDistrict";
          this.errorLogDetails.ErrorCode = result.successcode;
          this.errorLogDetails.ErrorDesc = result.msg;
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              console.log(res);
            });
        }
        this._cityList = result.data;
        this.setSBICityValidator();
        console.log(this.cityList);
        this._filterCityList = this._cityList

        this.addressForm.controls["city"].reset();
        this._filteredCityList = this.addressForm.controls["city"].valueChanges.pipe(
          startWith(""),
          map((city) => this._filterCitySbi(city))
        );

      })
    );
  }
  // onChangeCityInput() {
  //   setTimeout(() => {
  //     if (
  //       !this.cityList.find(
  //         (city) => city.CityDesc === this.addressForm.value.city
  //       )
  //     ) {
  //       this.addressForm.patchValue({
  //         city: "",
  //       });
  //     }
  //   }, 1000);
  // }

  onChangeCityInput() {
    if (
      this.cityList.find(
        (City) => City.CityDesc === this.addressForm.value.city
      )
    ) {

      this.onChangeCity();
    }
  }
  async onChangeCity() {
    debugger
    let cts = this.addressForm.get("city")!.value;
    // let city: ICity = this.cityList.find(
    //   (City) => City.CityDesc === cts
    // )
    this.showLoader = true;
    if (this.PlanData.CompanyCode == '7') {
      let city: ICitySBI | any = this._cityList.find(
        (City) => City.City_Name === cts
      )
      this.addressForm.controls["pincode"].reset();
      this._subscriptions.push(
        this._vehicleBuyPlanService.GetPincodeSBI(city.State_code, city.District_Code, city.City_code).subscribe((result) => {
          this.showLoader = false;
          if (result.successcode == "0") {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
            this.errorLogDetails.CompanyName = this.PlanData.ProductName;
            this.errorLogDetails.ControllerName = "VehicleData";
            this.errorLogDetails.MethodName = "GetPincodeListByDistrict";
            this.errorLogDetails.ErrorCode = result.successcode;
            this.errorLogDetails.ErrorDesc = result.msg;
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });
          }
          this.pincodeList = result.data;

          if (result.data) {
            this.setPincodeValidator();
            this.filteredautoPincodeList = this.addressForm.controls[
              "pincode"
            ].valueChanges.pipe(
              startWith(""),
              map((pincode) => this._filterPincode(pincode))
            );
          } else {
            this.pincodeList = []
            this.setPincodeValidator();
          }
        })
      );
    } else {
      let city: ICity | any = this.cityList.find(
        (City) => City.CityDesc === cts
      )
      this.addressForm.controls["pincode"].reset();
      this._subscriptions.push(
        this._vehicleBuyPlanService.GetPincode(cts, city.StateDesc).subscribe((result) => {
          this.showLoader = false;
          this.pincodeList = result.data;
          this.setPincodeValidator();
          this.filteredautoPincodeList = this.addressForm.controls[
            "pincode"
          ].valueChanges.pipe(
            startWith(""),
            map((pincode) => this._filterPincode(pincode))
          );
        })
      );
    }
  }
  async onChangePinCodeInput() {
    // setTimeout(() => {
    //   if (
    //     !this.pincodeList.find(
    //       (pincode) => pincode.Pincode === this.addressForm.value.pincode
    //     )
    //   ) {
    //     this.addressForm.patchValue({
    //       pincode: "",
    //     });
    //   }
    // }, 1000);
  }
  async onChangePincode() {
    const pin = this.addressForm.get("pincode")!.value;
  }
  // by kishori end
  onClickEdit(i: number) {
    if (this.isNewPolicy && i == 3) i--;
    this.tabIndex = i;
    const regNo: any = this.vehicleDetailForm.get("regNo");
    if (this.isNewPolicy) {
      regNo.setValidators([]);
    } else {
      regNo.setValidators([Validators.required]);
      // Validators.pattern(PATTERN.VEHICLENO),
    }
    regNo.updateValueAndValidity();
    this.isreview = false;
    this.setStates(i);
    // this.tabIndex = i;
    // this.isreview = false;
    // this.setStates(i);
  }
  onClickBack(i: number) {
    this.setStates(i);
    setTimeout(() => {
      this.tabIndex = i;
    }, 100);
  }
  private setStates(i: number) {
    switch (i) {
      case 0: {
        this.isCompleted = false;
        this.isCompleted_pd = false;
        this.isCompleted_add = false;
        this.isCompleted_vd = false;
        break;
      }
      case 1: {
        this.isCompleted_pd = false;
        this.isCompleted_add = false;
        this.isCompleted_vd = false;
        break;
      }
      case 2: {
        this.isCompleted_vd = false;
        this.isCompleted_add = false;

        break;
      }
      case 3: {
        this.isCompleted_add = false;
        break;
      }
      default: {
        break;
      }
    }
  }
  calculateDiff() {
    var dateSent = this.pastPolicyForm.value.prvPolicyExpDate;
    let currentDate = new Date();
    dateSent = new Date(dateSent);
    // IPolicyExpired
    // BikeExpiryCode: 3
    // BikeExpiryDesc: "I am not sure when it expired"
    // BikeExpiryCode: 2
    // BikeExpiryDesc: "Expired more than 90 days"
    // BikeExpiryCode: 1
    // BikeExpiryDesc: "Expired within 90 days"
    var difference = Math.floor(
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ) -
        Date.UTC(
          dateSent.getFullYear(),
          dateSent.getMonth(),
          dateSent.getDate()
        )) /
      (1000 * 60 * 60 * 24)
    );

    // console.log("BikeExpiryCode", this.BikeExpiryCode);
    // console.log("difference", difference);

    if (difference > 0) {
      if (this.BikeExpiryCode == 1)
        if (difference <= 90) {
          this.InvalidDate = "";
        } else {
          this.InvalidDate =
            "Please select date within 90 days from current date";
        }
      if (this.BikeExpiryCode == 2)
        if (difference >= 90) {
          this.InvalidDate = "";
        } else {
          this.InvalidDate =
            "Please select date more then 90 days from current date";
        }
    }
  }
  onClickChangeInsurer() {
    this._location.back();
  }
  checkIfRegDateIsAllowed() {


    if (this.PlanData.isOdOnly) {
      this.vehicleDetailForm
        .get("regDate")!
        .setValidators([
          // regDateCheckBefore2018ForTATA,
          regDateValidationForAllOd,
          Validators.required,
        ]);
    }
    else if (this.PlanData.isComprehensive) {
      this.vehicleDetailForm
        .get("regDate")!
        .setValidators([
          // regDateCheckBefore2018ForComp,
          regDateValidationForAllComp,
          Validators.required,
        ]);
    }
    this.vehicleDetailForm.get("regDate")!.updateValueAndValidity();
  }
  onClickEditCarInfo() {
    let vData: ApplicationVehicleData = JSON.parse(
      sessionStorage.getItem("CarData")!
    );
    vData.edit = 1;
    sessionStorage.setItem("CarData", JSON.stringify(vData));
    this._router.navigate(["/pos/car-insurance"]);
  }

  public onSubmitOwnerInfo(): any {
    this.errMsg_oi = "";
    if (this.ownerInfoForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    if (this.validatePersonalInfo()) {
      this.isCompleted = true;
      setTimeout(() => {
        this.tabIndex = 1;
      }, 100);
    }
  }

  public onSubmitPersonalInfo(): any {
    this.errMsg_pd = "";
    if (this.addressForm.invalid) {
      this.errMsg_pd = "Please fill all details correctly.";
      return false;
    }
    if (this.validatePersonalInfo()) {
      this.isCompleted_pd = true;
      setTimeout(() => {
        this.tabIndex = 2;
      }, 100);
    }
  }

  public onSubmitAddress(): any {

    // this.errMsg_add = "";
    // if (this.addressForm.invalid) {
    //   this.errMsg_add = "Please fill all details correctly.";
    //   return false;
    // }
    // this.isCompleted_add = true;
    // setTimeout(() => {
    //   this.tabIndex = 2;
    // }, 100);
    if (this.PlanData.CompanyCode == "7") {
      this.addressForm.controls['district'].enable()
    } else {
      this.addressForm.controls['district'].disable()
    }

    this.errMsg_add = "";
    if (this.addressForm.invalid) {
      this.errMsg_add = "Please fill all details correctly.";
      return false;
    }
    // console.log("prjkl;asjkldsflsj", this.checkCurrentAddForm)
    // if (this.checkCurrentAddForm) {
    //   this.errMsg_add = "Please fill Registration address form."
    //   return false;
    // }
    this.isCompleted_pd = true;
    if (!this.isNewPolicy) {
      this.isCompleted_vd = true;
    }

    // if(this.PlanData.CompanyCode == 11){
    //   this.selectTab();
    //   return;
    // }

    setTimeout(() => {
      this.tabIndex++;
    }, 100);
  }
  private validatePastPolicy(): boolean {
    if (
      this.pastPolicyForm.controls["claimInPrvYear"].value == EYesNo.NO &&
      this.pastPolicyForm.controls["ncb"].value == null
    ) {
      this.errMsg_pp = "Please select no claim bonus(NCB).";
      return false;
    }
    return true;
  }
  // changes by kishori
  public onSubmitVehicleInfo(): any {
    //
    this.errMsg_vd = "";

    if (this.vehicleDetailForm.invalid) {
      this.errMsg_vd = "Please fill all details correctly.";
      return false;
    }
    if (this.isNewPolicy || this.isPrvPolicyRemember == 0) {
      // this.isCompleted_pp = true;
      this.onSubmitPastPolicy();
    }
    if (!this.isNewPolicy) {
      // this.pastPolicyForm.patchValue({
      //   prvPolicyStartDate: this.vehicleDetailForm.value.regDate,
      // });
      this.isCompleted_vd = true;
      setTimeout(() => {
        this.tabIndex++;
      }, 100);
    }
  }

  // dummyReviewData = {
  //   ApplicationNo: 6770,
  //   ApplicationNoOdp: 6868,
  //   VechileOwnerName: "OWNER",
  //   VehicleAsCompany: "OWNER",
  //   VehicleOwnerLastName: "LAST NAME",
  //   MobileNo: "9999999999",
  //   EmailID: "test@gmail.com",
  //   OwnerGSTNo: "",
  //   Salutation: "Mr",
  //   GenderCode: "1",
  //   GenderDesc: "Male",
  //   DOB: "21/05/2003",
  //   NomineeDOB: "21/05/2003",
  //   NomineeName: "NOMINEE",
  //   RelationshipCode: "7",
  //   RelationshipDesc: "Brother",
  //   PINCode: "413110",
  //   PostalAdd: " HOUSE",
  //   Area: "AREA",
  //   StateCode: 21,
  //   StateDesc: "Maharashtra",
  //   CityCode: 587,
  //   CityDesc: "Pune",
  //   InsuranceCompCode: "8",
  //   InsuranceCompDesc: "GODIGIT",
  //   IDVAmount: "472729",
  //   ZeroDepreciationCode: 0,
  //   ZeroDepreciationDesc: false,
  //   PolicyTenure: 1,
  //   PersonalAccidentCoverInd: 0,
  //   PersonalAccidentCoverDesc: false,
  //   ComprehensiveThirdPartyCode: 0,
  //   ComprehensiveThirdPartyDesc: "COMPREHENSIVE",
  //   PolicyPremiumAmount: 0,
  //   CGSTPolicyPremiumAmount: 0,
  //   SGSTPolicyPremiumAmount: 0,
  //   IGSTPolicyPremiumAmount: 0,
  //   TotalGSTPremiumAmount: 0,
  //   PolicyPremiumGSTRate: 0,
  //   GSTApplicableCode: 0,
  //   GSTApplicableDesc: "",
  //   PoicyTotalAmount: 0,
  //   CoverageList: [
  //     {
  //       CoverageID: 0,
  //       CoverageCode: "IDV Basic",
  //       Limit1: "378184",
  //       ODPremium: "6673.47",
  //       TPPremium: "3221.00",
  //       Rate: null,
  //       tempCoverCode: null,
  //     },
  //     {
  //       CoverageID: 0,
  //       CoverageCode: "IDV Basic",
  //       Limit1: "378184",
  //       ODPremium: "6673.47",
  //       TPPremium: "3221.00",
  //       Rate: null,
  //       tempCoverCode: null,
  //     },
  //     {
  //       CoverageID: 20,
  //       CoverageCode: "No Claim Bonus",
  //       Limit1: "25",
  //       ODPremium: "-1668.37",
  //       TPPremium: "0",
  //       Rate: null,
  //       tempCoverCode: null,
  //     },
  //   ],
  //   VechileRegNo: "MH12SD6767",
  //   VechileRegDate: "21/05/2018",
  //   PreviousPolicyStartDate: "21/05/2018",
  //   PreviousPolicyExpDate: "06/04/2021",
  //   PreviousPolicyInsurerCode: 132,
  //   PreviousPolicyInsurerDesc:
  //     "FUTURE GENERALI INDIA INSURANCE COMPANY LIMITED",
  //   PreviousPolicyNo: "LKSJDFKSJFKSJ",
  //   VechileEngineNo: "6F87S6DF87S6F7SD6F87",
  //   VechileChassisNo: "876SD87F6DS786F8S",
  //   MortgageInd: "0",
  //   MortgageIndDesc: "NO",
  //   MortgageLBankName: "",
  //   MortgageBankAddress: "",
  //   Data: {
  //     RegistrationNo: 3234,
  //     RegistrationNoOdp: 3225,
  //     InsuranceCateCode: 2,
  //     SubCateCode: 3,
  //     ApplicationNo: 6770,
  //     ApplicationNoOdp: 6868,
  //     CompanyCode: 8,
  //     APITypeDesc: "Go Digit Renew Car Proposal",
  //     APIBaseUrl: "https://hbwebsiteapi.azurewebsites.net/api/",
  //     APIMethod: "GoDigit/GetRenewCarProposalGoDigit",
  //     Partnerid: "0",
  //     ProductCode: "0",
  //     PrvPolicyExCode: 1,
  //   },
  // };

  public onSubmitPastPolicy(): any {
    debugger
    // this.postData = JSON.parse(JSON.stringify(this.dummyReviewData));
    // this.isreview = true;
    // return;

    if (!this.isNewPolicy) {
      this.errMsg_pp = "";
      if (this.pastPolicyForm.invalid) {
        this.errMsg_pp = "Please fill all details correctly.";
        return false;
      }
    }

    if (+this.initialQuotationRequest["SubCateCode"] !== 4 && +this.isPrvPolicyRemember != 0) {
      //if not new
      if (this.yearChanged) {
        this.runQuotationRequest();
        this.currentRegYear = +new Date(
          this.vehicleDetailForm.get("regDate")!.value
        ).getFullYear();
        this.oldPremium = Math.round(
          this.premiumDataPlans["amountPayableIncludingGst"]
        );

        return;
      }
      this.newPremiumModal = "none";
    }

    this.showLoader = true;
    if (this.validateVehicle()) {

      this.isCompleted_vd = true;
      let rv = new ApplicationVehicleRegData();
      rv.ApplicationNo = this.postData.ApplicationNo;
      rv.ApplicationNoOdp = this.postData.ApplicationNoOdp;
      rv.DiscountAmount = Math.abs(this.PlanData.DiscountAmt);
      rv.DiscountLoading = Math.abs(this.PlanData.DiscountLoading);
      const owner = this.ownerInfoForm.value;
      const add = this.addressForm.value;
      const v = this.vehicleDetailForm.value;
      const pi = this.pastPolicyForm.value;
      console.log("---dsfdsak", add)
      // vehicle owner info
      rv.VehicleAsCompany =
        // owner.carAsCompany == 1 ? EYesNo[EYesNo.YES] : EYesNo[EYesNo.NO];
        rv.VechileOwnerName = owner.ownerName;
      rv.VehicleOwnerLastName = owner.ownerLastName;
      rv.MobileNo = owner.mobileNo;
      rv.EmailID = owner.emailId;
      rv.OwnerGSTNo = owner.gstin;
      rv.Salutation = owner.PropGenderTitle;
      // personal info
      if (owner.gender) {
        rv.GenderCode = owner.gender.split(",")[0];
        rv.GenderCodeDesc = owner.gender.split(",")[1];
      }
      // rv.Married = pi.married == 1 ? EYesNo[EYesNo.YES] : EYesNo[EYesNo.NO];
      rv.DOB = convertToMydate(owner.dob);
      rv.NomineeDOB = convertToMydate(owner.nomineeDob);
      rv.NomineeName = owner.nomineeName;
      if (owner.nomineeRelation) {
        rv.RelationshipCode = owner.nomineeRelation.split(",")[0];
        rv.RelationshipDesc = owner.nomineeRelation.split(",")[1];
      }

      //communication address
      rv.PINCode = add.pincode;
      rv.PostalAdd = add.postalAdd;
      rv.Area = add.area;

      let stateData: any = this.stateList.find((x) => x.StateDesc.trim().toLowerCase() == add.state.trim().toLowerCase());
      let cityData: any = this.cityList.find((x) => x.CityDesc.trim().toLowerCase() == add.city.trim().toLowerCase());

      if (this.PlanData.CompanyCode == '7') {
        let _cityData: any = this._cityList.find((x) => x.City_Name.trim().toLowerCase() == add.city.trim().toLowerCase());
        let district: any = this.districtList.find((x) => x.District_Name.trim().toLowerCase() == add.district.trim().toLowerCase())
        if (add.state) {
          rv.SBI_State_Code = stateData.StateShortDesc;
          rv.SBI_State_Name = stateData.StateDesc;
          rv.StateDesc = stateData.StateDesc;
        }
        if (add.district) {
          rv.SBI_District_Code = district.District_Code
          rv.SBI_District_Name = district.District_Name
        }
        if (add.city) {
          rv.SBI_City_Name = _cityData.City_Name
          rv.SBI_City_Code = _cityData.City_code
          rv.CityDesc = _cityData.City_Name;
        }
      } else {
        if (add.state) {
          rv.StateCode = stateData.StateCode;
          rv.StateDesc = stateData.StateDesc;
        }
        if (add.city) {
          rv.CityCode = cityData.CityCode;
          rv.CityDesc = cityData.CityDesc;
        }
      }

      // if (add.state) {
      //   rv.StateCode = add.state.split(",")[0];
      //   rv.StateDesc = add.state.split(",")[1];
      // }
      // if (add.city) {
      //   rv.CityCode = add.city.split(",")[0];
      //   rv.CityDesc = add.city.split(",")[1];
      // }

      // Added parameters
      rv.InsuranceCompCode = this.PlanData.CompanyCode;
      rv.InsuranceCompDesc = this.PlanData.ProductName;
      rv.IDVAmount = this.PlanData.IDVVAlue;
      // rv.InsurancePolicyCode = 0;
      // rv.InsurancePolicyDesc = "";
      rv.ZeroDepreciationCode = this.PlanData.zeroDp ? 1 : 0;
      rv.ZeroDepreciationDesc = this.PlanData.zeroDp;
      rv.PolicyTenure = this.PlanData.tenure;
      rv.PersonalAccidentCoverInd = this.PlanData.pacover ? 1 : 0;
      rv.PersonalAccidentCoverDesc = this.PlanData.pacover;
      rv.Owner_Driver_PA_Cover_Other_Value = this.PlanData.Owner_Driver_PA_Cover_Other_Value
      // 0 = Comprehensive, 1 = ThirdParty, 2 = isOdOnly
      // this.PlanData.isComprehensive ? 0 ? 2 : 0 : 1

      if (this.PlanData.isComprehensive) {
        rv.ComprehensiveThirdPartyCode = 0;
        rv.ComprehensiveThirdPartyDesc = "COMPREHENSIVE";
      }
      if (this.PlanData.isTp) {
        rv.ComprehensiveThirdPartyCode = 1;
        rv.ComprehensiveThirdPartyDesc = "TP";
      }
      if (this.PlanData.isOdOnly) {
        rv.ThirdPartyPolicyInceptionDate = convertToMydate(
          pi.thirdPartyPolicyIncepDate
        );
        rv.ThirdPartyPolicyExpiryDate = convertToMydate(
          pi.thirdPartyPolicyExpDate
        );
        rv.ComprehensiveThirdPartyCode = 2;
        rv.ComprehensiveThirdPartyDesc = "ODONLY";
      }
      rv.PolicyPremiumAmount = 0;
      rv.CGSTPolicyPremiumAmount = 0;
      rv.SGSTPolicyPremiumAmount = 0;
      rv.IGSTPolicyPremiumAmount = 0;
      rv.TotalGSTPremiumAmount = 0;
      rv.PolicyPremiumGSTRate = 0;
      rv.GSTApplicableCode = 0;
      rv.GSTApplicableDesc = "";
      // rv.OwnerGSTNo = "0"
      rv.PoicyTotalAmount = 0;
      // rv.PreviousPolicyExpDate = "11/09/2020"
      // rv.PreviousPolicyInsurerCode = 0
      // rv.PreviousPolicyInsurerDesc = ""
      // rv.PreviousPolicyNo = "0"
      // rv.ClaimInPastYearCode = 0;
      rv.CoverageList = [];
      // Added parameters end
      // let idvBasic = this.PlanData.CoverageList.find(
      //   (x) => x.CoverageCode == "IDV Basic"
      // );
      // rv.CoverageList.push(idvBasic);
      // if (this.PlanData.pacover) {
      //   let paCover = this.PlanData.CoverageList.find(
      //     (x) => x.CoverageCode == "PA Owner / Driver"
      //   );
      //   rv.CoverageList.push(paCover);
      // }
      // if (this.PlanData.zeroDp) {
      //   let depWaiver = this.PlanData.CoverageList.find(
      //     (x) => x.CoverageCode == "Depreciation Waiver"
      //   );
      //   rv.CoverageList.push(depWaiver);
      // }
      if (!this.PlanData.isTp) {
        if (this.PlanData.NCB != undefined) {
          let NCB = this.PlanData.CoverageList.find(
            (x: { CoverageCode: string; }) => x.CoverageCode == "No Claim Bonus"
          );
          rv.CoverageList.push(NCB);
        }
      }
      this.PlanData.selectedAddons.map((x: ICoverageList) => rv.CoverageList.push(x));
      // this.PlanData.discountByAddons.map(x => rv.CoverageList.push(x));

      // for (let index = 0; index < this.PlanData.selectedAddons.length; index++) {
      //   rv.CoverageList.push(this.PlanData.selectedAddons[index])
      // }
      // for (let index = 0; index < this.PlanData.discountByAddons.length; index++) {
      //   rv.CoverageList.push(this.PlanData.discountByAddons[index])
      // }
      // vehicle details
      let regno = this.selectedRto + v.regNo;
      rv.VechileRegNo = regno.replace(/-/g, "").length > 4 ? regno.replace(/-/g, "") : `${regno.replace(/-/g, "")}AA1234`  //regno.replace(/-/g, "");
      rv.VechileRegDate = convertToMydate(v.regDate);
      if (!this.isNewPolicy && this.isPrvPolicyRemember != 0) {
        // rv.PreviousPolicyExpDate
        rv.PreviousPolicyStartDate = convertToMydate(pi.prvPolicyStartDate);
        rv.PreviousPolicyExpDate = convertToMydate(pi.prvPolicyExpDate);
        // if (pi.prvPolicyInsurer) {
        //   rv.PreviousPolicyInsurerCode = pi.prvPolicyInsurer.split(",")[0];
        //   rv.PreviousPolicyInsurerDesc = pi.prvPolicyInsurer.split(",")[1];
        // }
        // rv.RegistrationDate = convertToMydate(this.vehicleDetailForm.get("regDate").value);
        let ppInsurerData: any = this.insuCompanyList.find(
          (x) => x.InsuranceCompanyDesc == pi.prvPolicyInsurer
        );
        let ppInsurerODData: any = this.insuCompanyList.find(
          (x) => x.InsuranceCompanyDesc == pi.prvPolicyODInsurer
        );
        if (pi.prvPolicyInsurer) {
          rv.PreviousPolicyInsurerCode = ppInsurerData.InsuranceCompanyCode;
          rv.PreviousPolicyInsurerDesc = ppInsurerData.InsuranceCompanyDesc;
        }
        rv.PreviousPolicyNo = pi.prvPolicyNo;

        if (pi.prvPolicyODInsurer) {
          // console.log(ppInsurerODData, pp.prvPolicyODInsurer);
          rv.PreviousPolicyInsurerODCode = ppInsurerODData.InsuranceCompanyCode;
          rv.PreviousPolicyInsurerODDesc = ppInsurerODData.InsuranceCompanyDesc;
        }
        rv.PreviousPolicyODNo = pi.prvPolicyODNo
        // rv.ClaimInPastYearCode = pi.claimInPrvYear;
        // if (rv.ClaimInPastYearCode == EYesNo.YES) {
        //   rv.ClaimInPastYearDesc = EYesNo[EYesNo.YES];
        // if (!this.PlanData.isTp) {
        //   rv.PreviousNCBCode = pi.ncb.split(",")[0];
        //   rv.PreviousNCBDesc = pi.ncb.split(",")[1];
        // } else {
        //   rv.PreviousNCBCode = 0;
        //   rv.PreviousNCBDesc = "0";
        // }
        // }
      }

      rv.VechileEngineNo = v.engineNo;
      rv.VechileChassisNo = v.chassisNo;
      // public decimal MortgageLBankCode { get; set; }
      //   public string MortgageLBankName { get; set; }
      if (this.PlanData.CompanyCode == '7') {
        rv.IsPUC = v.IsPUC == 1 ? true : false;
      }

      rv.MortgageInd = v.onMortgage;
      let bankData: any = this.mortgageBankList.find(
        (x) => x.MortgageLBankName == v.bankName
      );
      if (rv.MortgageInd == "1") {
        rv.MortgageIndDesc = EYesNo[EYesNo.YES];
        rv.MortgageLBankName = bankData
          ? bankData.MortgageLBankName
          : v.bankName;
        rv.MortgageLBankCode = bankData ? bankData.MortgageLBankCode : 0;
        rv.MortgageBankAddress = v.bankAddress;
      } else {
        rv.MortgageIndDesc = EYesNo[EYesNo.NO];
        rv.MortgageLBankName = "";
        rv.MortgageBankAddress = "";
      }
      // rv['CoverageList'] = this.premiumDataPlans['selectedAddons']
      // console.log("rv", rv)

      // rv["RegistrationNo"] =
      //   this.dataToBePatched && this.dataToBePatched["RegistrationNo"]
      //     ? this.dataToBePatched["RegistrationNo"]
      //     : 0;
      // rv["RegistrationNoOdp"] =
      //   this.dataToBePatched && this.dataToBePatched["RegistrationNoOdp"]
      //     ? this.dataToBePatched["RegistrationNoOdp"]
      //     : 0;
      debugger
      if (this.reviewData) {
        rv["RegistrationNo"] = this.reviewData["Data"]["RegistrationNo"];
        rv["RegistrationNoOdp"] = this.reviewData["Data"]["RegistrationNoOdp"];
      } else if (this.dataToBePatched) {
        rv["RegistrationNo"] = this.dataToBePatched["RegistrationNo"];
        rv["RegistrationNoOdp"] = this.dataToBePatched["RegistrationNoOdp"];
      }

      this.postData = rv;
      //console.log(JSON.stringify(this.postData));
      this._subscriptions.push(
        this._vehicleBuyPlanService.savePraposal(this.postData).subscribe(
          (result) => {
            // this.showLoader = false;
            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
              this.errorLogDetails.CompanyName = this.PlanData.ProductName;
              this.errorLogDetails.ControllerName = "VehicleData";
              this.errorLogDetails.MethodName = "SaveVehicleRegData";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  //console.log(res);
                });
            }
            //console.log("Api Result ==> ", result);
            if (result.successcode == "1") {

              sessionStorage.setItem("UrlData", JSON.stringify(result.data[0]));
              this.isreview = true;
              this.reviewData = rv;
              this.reviewData["Data"] = result.data[0];
              sessionStorage.setItem(
                "postData",
                JSON.stringify(this.reviewData)
              );

              const appNo = encryption(result.data[0]['ApplicationNo'].toString());
              const appOdpNo = encryption(result.data[0]['ApplicationNoOdp'].toString());
              console.log(result.data[0]['ApplicationNo'])

              sessionStorage.setItem("postData", JSON.stringify(this.reviewData));

              // const url = this._router.navigate([`/car-insurance/buyplan/`,appNo,appOdpNo])//(`/bike-insurance/buyplan/${appNo}/${appOdpNo}`);//this._location.replaceState(`/bike-insurance/buyplan/`,appNo,appOdpNo);//
              // console.log("url  ",url);
              this.showLoader = false;
            }
            // this.postData = rv;
            // this.isreview = true;
            // Api response left

            // if (result.successcode == '1') {
            //     this._errorHandleService._toastService.success('Praposal form submitted successfully.', result.msg);
            //     this._router.navigate(['/pos/bike-insurance']);
            // } else {
            //     this._errorHandleService._toastService.warning(result.msg, result.successcode);
            // }
          },
          (err: any) => {
            // this.showLoader = false;
            this._errorHandleService.handleError(err);
          }
        )
      );
    }
    // this.tabIndex = 3;
  }

  onSubmitNewPolicyPayment() {
    this.yearChanged = false;
    this.onSubmitPastPolicy();
  }

  runQuotationRequest() {

    this.showLoader = true;
    this.newPremium = 0;
    // this.oldPremium = 0;

    // let currentYear = 2019; // for testing purpose
    let currentYear = +convertToMydate(
      this.vehicleDetailForm.get("regDate")!.value
    ).split("/")[2];
    let regYearObject = this.regYearList.find(
      (yearObj) => +yearObj.RegistrationYearDesc === currentYear
    );

    let quotationReq = {
      ApplicationNo: this.postData.ApplicationNo,
      ApplicationNoOdp: this.postData.ApplicationNoOdp,
      RegistrationDate: convertToDateFormat(this.vehicleDetailForm.get("regDate")!.value),
    }
    // let quotationRequest = {
    //   ...this.initialQuotationRequest,
    //   VehicleRegistrationYrCode: regYearObject.RegistrationYearCode,
    //   VehicleRegistrationYrDesc: regYearObject.RegistrationYearDesc,
    //   // RegistrationDate : (this.vehicleDetailForm.get("regDate").value),
    //   PolicyTenure: this.PlanData.tenure, //this.postData["tenure"],
    //   PreviousPolicyExpiryDate: convertToMydate(
    //     this.pastPolicyForm.get("prvPolicyExpDate").value
    //   ),
    // };
    this._subscriptions.push(
      this.posHomeService
        .saveQuatesAfterDateChange(quotationReq)
        .pipe(
          mergeMap((res: ApiResponse) => {
            //console.log({ res });
            this.postData.ApplicationNo = this.postData.ApplicationNo;
            this.postData.ApplicationNoOdp = this.postData.ApplicationNoOdp;
            return this._vehicleBuyPlanService
              .getBikeQuotationUrls(
                this.postData.ApplicationNo,
                this.postData.ApplicationNoOdp
              )
              .pipe(
                tap((data: ApiResponse) => console.log({ data })),
                mergeMap((apiurlData) => {
                  const companyUrlsArray: IHealthInsPlanUrlsResponse[] | any =
                    apiurlData.data;
                  const companyApiUrlData = companyUrlsArray.find(
                    (urlData: any) =>
                      +urlData["CompanyCode"] ===
                      +this.premiumDataPlans["CompanyCode"]
                  );

                  const filterdata =
                    this.premiumDataPlans["carRequestWithAddons"];
                  filterdata.PartnerId = companyApiUrlData.Partnerid;
                  filterdata.ProductCode = companyApiUrlData.ProductCode;
                  filterdata.ApplicationNo = companyApiUrlData.ApplicationNo;
                  filterdata.ApplicationNoOdp =
                    companyApiUrlData.ApplicationNoOdp;
                  filterdata.APIBaseUrl = companyApiUrlData.APIBaseUrl;
                  filterdata.APIMethod = companyApiUrlData.APIMethod;
                  filterdata.PolicyTenure = 1; //this.postData["tenure"],
                  filterdata.IDVValue = this.PlanData.IDVVAlue; //this.sessData.IDVVAlue;
                  filterdata.PreviousNCB =
                    this.initialQuotationRequest.PreviousNCB;
                  filterdata.CurrentNCB =
                    this.initialQuotationRequest.CurrentNCB;

                  return this._vehicleBuyPlanService.getInsuranceCompanyPlan(
                    filterdata
                  );
                })
              );
          })
        )
        .subscribe(
          (result: ApiResponse) => {
            this.showLoader = false;
            if (!result || result.successcode == "0" || result.successcode == null) {

              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
              this.errorLogDetails.CompanyName = this.PlanData.ProductName;
              this.errorLogDetails.ControllerName = " VehicleData/";
              this.errorLogDetails.MethodName = "SaveApplicationData_VehicleRegistrationYr_Update";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  //console.log(res);
                });

              this._toastService.error(result.msg, "", { timeOut: 5000 });
              return;
            }
            this.makePremium(result);
            // open modal
            this.newPremiumModal = "block";
          },
          (err: any) => {
            this.showLoader = false;
            this._errorHandleService.handleError(err);
          }
        )
    );
  }
  //close newPremiumModal
  closeModalDialog() {
    this.newPremiumModal = "none";
  }
  makePremium(result: ApiResponse) {

    this.showLoader = false;
    result.data.Premium = Math.round(result.data.NetPremium);

    let idvBasic = result.data.CoverageList.find(
      (x: { CoverageCode: string; }) => x.CoverageCode === "IDV Basic"
    );

    let idvODPremium = idvBasic ? +idvBasic.ODPremium : 0;
    let idvTPPremium = idvBasic ? +idvBasic.TPPremium : 0;
    let discountAmount =
      result.data && result.data.DiscountAmt
        ? +result.data.DiscountAmt.replace(/-/g || /--/, "")
        : 0;

    if (this.premiumDataPlans["isComprehensive"])
      result.data.Premium = idvODPremium + idvTPPremium - discountAmount;
    if (this.premiumDataPlans["isTp"])
      result.data.Premium = +idvBasic.TPPremium;
    if (this.premiumDataPlans["isOdOnly"])
      result.data.Premium = +idvBasic.ODPremium - discountAmount;

    this.yearChanged = false;

    this.saveNewSessionData(result.data);
  }

  addCoverages(plan: IPlansMotor) {

    plan.CoverageList.forEach((coverage: { CoverageID: number; ODPremium: string | number; TPPremium: string | number; }) => {
      if (coverage.CoverageID !== 0) {
        if (this.premiumDataPlans["isTp"]) {
          if (coverage.CoverageID != 20) {
            plan.Premium += +coverage.ODPremium + +coverage.TPPremium;
            plan.Premium = Math.round(plan.Premium);
          }
        } else {
          plan.Premium += +coverage.ODPremium + +coverage.TPPremium;
        }
      }
    });

    return Math.round(plan.Premium);
  }

  // this is for premium breakup updation and saving new session data to show in review page
  saveNewSessionData(item: IPlansMotor) {
    const premiumWithoutGst = this.addCoverages(item);
    const gstAmount = premiumWithoutGst * 0.18;
    this.newPremium = Math.round(premiumWithoutGst + gstAmount); // premium including GST

    let idvBasic = item.CoverageList.find(
      (x) => x.CoverageCode === "IDV Basic"
    );


    let data = { ...this.premiumDataPlans };

    data["CoverageList"] = item.CoverageList;
    data["selectedAddons"] = item.CoverageList;
    data["IDVVAlue"] = item.IDVVAlue;
    data["MaxIDVVAlue"] = item.MaxIDVVAlue;
    data["MinIDVVAlue"] = item.MinIDVVAlue;
    data["gst"] = gstAmount;
    data["amountPayableIncludingGst"] = this.newPremium;
    data["Premium"] = premiumWithoutGst;
    data["IDV"] = idvBasic;
    data["DiscountAmt"] = item["DiscountAmt"].replace(/--/g, "-");
    if (this.premiumDataPlans["isTp"]) {
      data["CoverageList"] = item.CoverageList.filter(
        (x) => x.CoverageID != 20
      );
    }
    this.premiumDataPlans = JSON.parse(JSON.stringify(data));
    sessionStorage.setItem("popupData", JSON.stringify(data));
  }

  private validateOwnerInfo(): boolean {
    return true;
  }
  // by kishori
  private validatePersonalInfo(): boolean {
    const dob = this.ownerInfoForm.get("dob")!.value;

    const toDate = moment();
    if (Math.abs(toDate.diff(dob, "years")) < 18) {
      this.errMsg_oi = "Owner age should be greater than 18 years.";
      return false;
    } else {
      const nomineedob = this.ownerInfoForm.get("nomineeDob")!.value;
      // console.log("nomineedob=" + nomineedob);

      const ndob = Math.abs(toDate.diff(nomineedob, "years"));
      // console.log("ndob=" + ndob);
      const rel = this.ownerInfoForm.get("nomineeRelation")!.value
        ? this.ownerInfoForm.get("nomineeRelation")!.value.split(",")[0]
        : 0;
      const ownerAge = Math.abs(toDate.diff(dob, "years"));
      // console.log("OwnerAge=" + ownerAge);
      if (rel == Relation.Son || rel == Relation.Daughter) {
        if (ndob - ownerAge < 18) {
          this.errMsg_oi = "Parent age should be more than 18 years from Owner";
          // console.log(this.errMsg_oi);

          return false;
        }
      }
      if (rel == Relation.Father || rel == Relation.Mother) {
        if (ownerAge - ndob < 18) {
          this.errMsg_oi =
            "Owner age should be more than 18 years from children.";
          // console.log(this.errMsg_oi);
          return false;
        }
      }
    }
    return true;
  }
  // by kishori end
  private validateVehicle(): boolean {
    if (
      this.vehicleDetailForm.get("onMortgage")!.value == 1 &&
      (!this.vehicleDetailForm.get("bankName")!.value ||
        !this.vehicleDetailForm.get("bankAddress")!.value)
    ) {
      this.errMsg_vd = "Please fill mortgage bank details.";
      return false;
    }
    return true;
  }
  //#endregion

  labelPosition: any;
  selectTab(index?: number): void {
    // console.log(this.CurrentAddressForm)
    // setTimeout(() => {
    //   this.selectedIndex = index;
    // }, 100);
    this.filterList = this.filterState
    console.log(this.displayBikeModelPopup)
    this.displayBikeModelPopup = true
    // $("#exampleModalCenter").modal("show");
  }
  displayBikeModelPopup: any = false;
  public closeBikeModelVariantPopup(event?: any) {
    //if (event) {
    console.log("dsfdsdfdf           ---------<>", event);
    this.checkCurrentAddForm = event
    console.log("dfskdfsl;dfs;", event)


    // }
    this.displayBikeModelPopup = false;

  }

  takeScreenShot() {
    this.captureScreen();
  }

  async captureScreen() {
    try {
      const capturePromise = this.screenCaptureService.getImage(
        this.screen.nativeElement,
        true
      );
      let imgString = await capturePromise;
      console.log(imgString);
      let postData: any = { ...this.postData };
      postData["screenshot"] = imgString;
      this.postData = postData;
    } catch (err) {
      console.log({ err });
    }
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

export const regDateValidationForTATA = (
  control: AbstractControl
): ValidationErrors | null => {
  console.log(control.value);

  // let regYear = new Date(control.value).getFullYear();
  // let currentYear = new Date().getFullYear();

  // if (currentYear - regYear >= 9) return { yearError: true };
  // return null;

  let regDate = new Date(control.value);
  let monthDiff =
    new Date().getMonth() -
    regDate.getMonth() +
    12 * (new Date().getFullYear() - regDate.getFullYear());

  if (monthDiff >= 117) return { dateError: true }; // Dont allow reg date more than 9 years and 9 months
  return null;
};

export const pastpolicyExDateValidationForTATA = (
  pastPolicyExDate: string | number | Date
): ValidatorFn => {

  return (control: AbstractControl): ValidationErrors | null => {
    let regDate = new Date(control.value);
    let monthDiff =
      new Date(pastPolicyExDate).getMonth() -
      regDate.getMonth() +
      12 * (new Date(pastPolicyExDate).getFullYear() - regDate.getFullYear());
    if (monthDiff <= 9) return { postPolicyDateError: true };
    return null;
  };
};

export const thirdPartyDateValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  console.log(control);

  let tpExpiryDate = control.get("thirdPartyPolicyExpDate")!.value;
  let odExpiryDate = control.get("prvPolicyExpDate")!.value;

  if (odExpiryDate >= tpExpiryDate) return { expiryDateError: true };

  return null;
};

export function RequireMatch(stateList: IState[]) {
  return (control: AbstractControl) => {

    const typedState: any = control.value;
    let stateFound = stateList.find((state) => state.StateDesc === typedState);

    if (typedState && !stateFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchDistrict(districtList: IDistrict[]) {
  return (control: AbstractControl) => {

    const typedDistrict: any = control.value;
    let districtFound = districtList.find((state) => state.District_Name === typedDistrict);

    if (typedDistrict && !districtFound) return { requireMatch: true };
    else return null;
  };
}


export function RequireMatchCity(cityList: ICity[]) {
  debugger
  return (control: AbstractControl) => {

    const typedCity: any = control.value;
    let cityFound = cityList.find((state) => state.CityDesc === typedCity);

    if (typedCity && !cityFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchSBICity(cityList: ICitySBI[]) {
  debugger
  return (control: AbstractControl) => {

    const typedCity: any = control.value;
    let cityFound = cityList.find((state) => state.City_Name === typedCity);

    if (typedCity && !cityFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchPincode(pincode: IPincode[]) {
  return (control: AbstractControl) => {

    const typedValue: any = control.value;
    if (control.value === null || pincode === null) return null;
    let pincodeFound = pincode.find((pin) => pin.Pincode === typedValue);

    if (typedValue && !pincodeFound) return { requireMatch: true };
    else return null;
  };
}

export function RequireMatchPrvInsCompany(
  insuranceCompanyList: IInsuranceCompany[]
) {
  return (control: AbstractControl) => {

    const typedValue: string = control.value;
    let companyFound = insuranceCompanyList.find(
      (company) => company.InsuranceCompanyDesc === typedValue
    );

    if (typedValue && !companyFound) return { requireMatch: true };
    else return null;
  };
}
export const regDateValidationForAllOd = (
  control: AbstractControl
): ValidationErrors | null => {

  // console.log(control.value);
  let regDate = new Date(control.value);
  let dateToBeCheckedAgainst = new Date("2018-09-01");

  //match the hours of material moment date and javascript native date object
  dateToBeCheckedAgainst.setHours(0, 0, 0, 0);
  console.log({ dateToBeCheckedAgainst });

  if (regDate >= dateToBeCheckedAgainst) {
    // console.log("error");
    console.log('hi') // Dont allow reg date older than 1st sept 2018(od only)
    let monthDiff =
      new Date().getMonth() -
      regDate.getMonth() +
      12 * (new Date().getFullYear() - regDate.getFullYear());
    console.log(monthDiff);
    if (monthDiff > 36) {
      return { OdError: true };
    } else {
      return null
    }

  } else return { dateErrorSept2018: true }
  // let regYear = new Date(control.value).getFullYear();
  // let currentYear = new Date().getFullYear();

  // if (currentYear - regYear >= 9) return { yearError: true };
  // return null;
  // let regDate = new Date(control.value);

  // Dont allow reg date older than 9 years and 9 months
  // return null;
};
export const regDateValidationForAllComp = (
  control: AbstractControl
): ValidationErrors | null => {

  // console.log(control.value);
  let regDate = new Date(control.value);
  let dateToBeCheckedAgainst = new Date("2018-09-01");

  //match the hours of material moment date and javascript native date object
  dateToBeCheckedAgainst.setHours(0, 0, 0, 0);
  console.log({ dateToBeCheckedAgainst });

  if (regDate >= dateToBeCheckedAgainst) {
    // console.log("error");
    console.log('hi') // Dont allow reg date older than 1st sept 2018(od only)
    let monthDiff =
      new Date().getMonth() -
      regDate.getMonth() +
      12 * (new Date().getFullYear() - regDate.getFullYear());
    console.log(monthDiff);
    if (monthDiff <= 36) return { CompError: true };

  }
  // else return {dateErrorSept2018: true }
  // let regYear = new Date(control.value).getFullYear();
  // let currentYear = new Date().getFullYear();

  // if (currentYear - regYear >= 9) return { yearError: true };
  // return null;
  // let regDate = new Date(control.value);

  // Dont allow reg date older than 9 years and 9 months
  return null;
};
export function RequireMatchMortageBankName(
  filterMortgageBankList: IMortgageBank[]
) {
  return (control: AbstractControl) => {
    const typedValue: string = control.value;

    let companyFound = filterMortgageBankList.find(
      (company) => company.MortgageLBankName === typedValue
    );
    if (typedValue && !companyFound) return { requireMatch: true };
    else return null;
  };
}
