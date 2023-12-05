import { map, mergeMap, tap } from "rxjs/operators";
import { startWith } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { IApplicationVehicleRegData } from "src/app/models/bike-insu.Model";
import { ApplicationVehicleRegData } from "./../../../../models/bike-insu.Model";
import { setMinDate, setMaxDate, encrypt, encryption, setMaxRegDate, convertToDateFormat } from "./../../../../models/common-functions";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
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
} from "src/app/models/health-insu.Model";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import {
  yesNoList,
  NCBList,
  PATTERN,
  MASKS,
  Salutation,
} from "src/app/models/common";
import { EBajajDocListEnum, EDocListEnum, EIdentity, EYesNo } from "src/app/models/insurance.enum";
import {
  IState,
  ICity,
  IInsuranceCompany,
  IPincode,
  IMortgageBank,
  ApplicationVehicleData,
  IRegistrationYear,
  errorLog,
  ICKYCDocListBajaj,
  ICKYCBajaj,
  ICKYCDocList,
} from "src/app/models/common.Model";
import { decrypt, convertToMydate } from "src/app/models/common-functions";
import { VehicleBuyPlanService } from "../../../services/vehicle-buyplan.service";
import * as moment from "moment";
import { formatDate, Location } from "@angular/common";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ToastrService } from "ngx-toastr";
import { ApiResponse } from "src/app/models/api.model";
import { NgxCaptureService } from "ngx-capture";
import { PlanAndPremiumDetailsComponent } from "src/app/shared/components/plan-and-premium-details/plan-and-premium-details.component";
import { MatRadioChange} from "@angular/material/radio";
import {  MatSelectChange } from "@angular/material/select";
import { ErrorStateMatcher } from "@angular/material/core";


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-buyplan-bajaj',
  templateUrl: './buyplan-bajaj.component.html',
  styleUrls: ['./buyplan-bajaj.component.css', "../../buyplan/buyplan.component.css","../../../bike-insurance/bike-plans/bike-plans.component.css"]
})
  

export class BuyplanBajajComponent implements OnInit,OnDestroy {

  private _subscriptions: any[] = [];

  @ViewChild("screen", { static: true }) screen: any;
  @ViewChild("ppp", { static: false })
  planComp!: PlanAndPremiumDetailsComponent;
  @ViewChild("fileUpload", { static: false })
  fileUpload!: ElementRef; files: any = []
  //#region objects and lists

  //all list objects
  public genderList: IGender[] = [];
  public familyMemberList: IFamilyMembers[] = [];
  public stateList: IState[] = [];
  public cityList: ICity[] = [];
  public pincodeList: IPincode[] = [];
  public filterCityList: ICity[] = [];
  public insuCompanyList: IInsuranceCompany[] = [];
  ppInsurerList!: Observable<IInsuranceCompany[]>;
  ppODInsurerList!: Observable<IInsuranceCompany[]>;
  public yesNoList = yesNoList;
  public NCBList = NCBList;
  public filterStateList!: Observable<IState[]>;
  
  showLoader: boolean = false; //for showing loader
  public tabIndex = 0;
  errMsg_oi = "";
  errMsg_ca = "";
  errMsg_pp = "";
  errMsg_vd = "";
  isreview = false;
  isCompleted = false;
  isCompleted_add = false;
  isCompleted_pp = false;
  isCompleted_vd = false;
  isCompleted_ckycInfo: boolean=false;
  isNewPolicy = false; //true when new
  isPrvPolicyRemember =1;
  selectedIndex!: number;
  salutations = Salutation;
  getRTO!: string;
  filterState!: IState[];
  showDates!: number;
  //forms
  ownerInfoForm: FormGroup;
  addressForm: FormGroup;
  pastPolicyForm: FormGroup;
  vehicleDetailForm: FormGroup;
  ckycDetailForm: FormGroup;
  // postData: IRegistrationVehicleData = new RegistrationVehicleData();
  postData: IApplicationVehicleRegData = new ApplicationVehicleRegData();
  // sesDataSet : any;
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
  yearcount!: number;
  reliance!: boolean;
  IdvAmtforIffco!: number;


  // selected = new FormControl('valid', [Validators.required, Validators.pattern('valid')]);

  // selectFormControl = new FormControl('valid', [Validators.required, Validators.pattern('valid')]);

  // nativeSelectFormControl = new FormControl('valid', [
  //   Validators.required,
  //   Validators.pattern('valid'),
  // ]);
  matcher = new MyErrorStateMatcher();
  base64url!: string | ArrayBuffer;
  fileName: any='';
  bajajCkycDocList!: ICKYCDocListBajaj;
  identityMask: any =null;
  docExtension: string="";
  successFileUpload: boolean=false;
  PANMask!: { guide: boolean; keepCharPositions: boolean; showMask: boolean; mask: RegExp[]; };
  step: { stepInd: number; stepDesc: string; } = { stepInd: 0, stepDesc: '' };
  isPOIStatusFound: boolean=true;
  // PlanDataforOriental: any;
  // premiumDataPlansforOriental: any;
  

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
  //#endregion
  PlanData: any;
  reviewData: any;
  BikeExpiryCode!: number;
  // InvalidDate = '';
  minDate: any;
  maxDate: any;
  premiumDataPlans: any;
  sessionData: any;
  newPolicyStartDate: Date = new Date();
  searchState!: IState[];
  searchPincode!: IPincode[];
  filteredCityList!: Observable<ICity[]>;
  public mortgageBankList: IMortgageBank[] = [];
  public filterMortgageBankList!: Observable<IMortgageBank[]>;
  filteredautoPincodeList!: Observable<IPincode[]>;
  cityPincodes: IPincode[] = [];
  nomineeMinDate = (year: number, month = 0, date = 0) =>
    setMinDate(year, month, date);
  selectedRto: string = "AB-09";
  date: string = convertToMydate(new Date());
  initialQuotationRequest!: ApplicationVehicleData;
  regYearList!: IRegistrationYear[];
  yearChanged!: boolean;
  newPremium: number = 0;
  oldPremium: number = 0;
  currentRegYear!: number;
  newPremiumModal: string = "none";
  ckycYesNoDesc: string = "Yes"
  ckycYesNoCode:number=1;
  addressRegex = PATTERN.ADDRESSPATTERN;
  constructor(
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private _route: ActivatedRoute,
    private _location: Location,
    private _router: Router,
     private _fb: FormBuilder,
    private posHomeService: PosHomeService,
    private _toastService: ToastrService,
    private screenCaptureService: NgxCaptureService
  ) {
    this.ownerInfoForm = _fb.group({
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
          Validators.minLength(2),
          Validators.maxLength(60),
        ],
      ],

      PropGenderTitle: ["", Validators.required],
      gender: ["", Validators.required],
      dob: ["", [Validators.required, Validators.maxLength(10)]],
      mobileNo: [
        "",
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(PATTERN.MOBILENO),
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
      nomineeName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
          // Validators.pattern(PATTERN.WHITESPACE)
        ],
      ],
      nomineeAge: ["", Validators.required, this.validateOwnerInfoAsync],
      nomineeRelation: ["", Validators.required],
    });

    this.addressForm = _fb.group({
      pincode: [
        "",
        [
          Validators.required,
          Validators.maxLength(6),
          Validators.pattern(PATTERN.PINCODE),
        ],
      ],
      postalAdd: ["", [Validators.required, Validators.minLength(4), Validators.maxLength(150)
        //  Validators.pattern(PATTERN.WHITESPACE)
        ]],
      state: ["", Validators.required],
      city: ["", Validators.required],
      addArea: ["", [Validators.required, Validators.minLength(4),Validators.maxLength(150), 
        // Validators.pattern(PATTERN.WHITESPACE)
      ]], //earlier 15
    });

    this.pastPolicyForm = _fb.group({
      prvPolicyStartDate: ["", [Validators.required, Validators.maxLength(10)]],
      prvPolicyExpDate: ["", [Validators.required, Validators.maxLength(10)]],
      thirdPartyPolicyIncepDate: [null],
      thirdPartyPolicyExpDate: [null],
      prvPolicyInsurer: ["", Validators.required],
      prvPolicyNo: ["", [Validators.required, Validators.maxLength(25), Validators.minLength(6)]],
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
          Validators.minLength(5), // earlier 17
          // Validators.maxLength(17),
          Validators.pattern(PATTERN.ALPHANUMERIC),
        ],
      ],
      onMortgage: ["0", Validators.required],
      IsPUC:[''],
      bankName: [""],
      bankAddress: [""],
    });

    this.ckycDetailForm = _fb.group({
      ckycNo: ["", [Validators.required,  Validators.minLength(14)]],
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      panNo: ["", [Validators.required, Validators.pattern(PATTERN.PAN)]],
      doctype: ["", [Validators.required]],
      docData: ['', [Validators.required]],
      docNo:['']
    })
  }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;
  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);

    this.initialQuotationRequest = JSON.parse(
      sessionStorage.getItem("VehicleData")!
    );
    if (this.initialQuotationRequest.edit == 1) {
      this.initialQuotationRequest.edit = 0;
      sessionStorage.setItem(
        "VehicleData",
        JSON.stringify(this.initialQuotationRequest)
      );
    }
    this._subscriptions.push(
      this._route.paramMap.subscribe((p:any) => {
        const No: string = p.get("a_id");
        const Odp: string = p.get("odp");
        this.postData.ApplicationNo = Number(decrypt(No));
        this.postData.ApplicationNoOdp = Number(decrypt(Odp));
      })
    );

    // Get values from session
    this.sessionData = JSON.parse(sessionStorage.getItem("Data")!);
    console.log("Session data ==> ", this.sessionData);
    this.PlanData = this.sessionData.premiumDataPlans;
    
    this.reliance = this.PlanData.CompanyCode == '11' ? true :false ;
    // this.PlanDataforOriental = this.sessionData.premiumDataPlansForOriental;
    this.PlanData["rto"] = this.sessionData.rto;
    // this.PlanDataforOriental["rto"] = this.sessionData.rto;
    this.getRTO=this.sessionData.rto;//for state filteration; added by pranay
    this.PlanData["vehicleDesc"] = this.sessionData.vehicleDesc;

    // this.PlanDataforOriental["vehicleDesc"] = this.sessionData.vehicleDesc;
    this.premiumDataPlans = this.sessionData.premiumDataPlans;
    // this.premiumDataPlansforOriental = this.sessionData.premiumDataPlansForOriental;
    this.currentRegYear =
      +this.initialQuotationRequest["VehicleRegistrationYrDesc"];
    this.isPrvPolicyRemember = this.initialQuotationRequest.PrvPolicyRememberCode;
    // this.PlanData["tenure"] = this.sessionData.tenure;
    // this.PlanData["zeroDp"] = this.sessionData.zeroDp;
    // this.PlanData["GST"] = this.PlanData.GST;
    // this.PlanData[
    // "AmountPayableIncludingGST"
    // ] = this.PlanData.AmountPayableIncludingGST;
    // Get values from session end
    // if (sessionStorage.getItem("postData")) {
    //   let getSesRegData = JSON.parse(sessionStorage.getItem("postData"));
    //   this.isreview = true;
    //   this.reviewData = getSesRegData;
    // }
    // 
    // if (this._vehicleBuyPlanService.PraposalMasterData) {
    //   let data = this._vehicleBuyPlanService.PraposalMasterData;
    //   this.genderList = data.Gender;
    //   this.familyMemberList = data.Family_Member;
    //   this.stateList = data.State;
    //   this.cityList = data.City;
    //   this.insuCompanyList = data.Insurance_Company;
    // } else {
    // }
    if (this.PlanData.isOdOnly) {
      this.setOdValidators();
    }
    if(this.isPrvPolicyRemember==0){
      this.pastPolicyForm.disable()
    }else{
      this.pastPolicyForm.enable()
    }

    this.PANMask=MASKS.PAN
    this.getData();
    this.setNcbValidators();
    this.setMortgageValidators();
    this.getSavedData();
    this.getRegYearList();
    this.listenRegYearChange();
    this.getCkycDocList();
    this.onChangeCKYCYesNO(1);
    this.updateIdentityValidity()
  }


  listenThirdPartyStartDate() {
    this.pastPolicyForm
      .get("thirdPartyPolicyIncepDate")!
      .valueChanges.subscribe((value) => {
        
        let thirdPartyPolicyEndDate = new Date(value);
        thirdPartyPolicyEndDate.setFullYear(
          thirdPartyPolicyEndDate.getFullYear() + 5
        );
        thirdPartyPolicyEndDate.setDate(thirdPartyPolicyEndDate.getDate() - 1);
        this.pastPolicyForm.patchValue({
          thirdPartyPolicyExpDate: thirdPartyPolicyEndDate,
        });
      });
  }

  listenRegYearChange() {
    // this.vehicleDetailForm.get("regDate").valueChanges.subscribe((value) => {
    //   let regYear = +convertToMydate(value).split("/")[2];
    //   let initiallySetRegYear =
    //     +this.initialQuotationRequest["VehicleRegistrationYrDesc"];
    //   if (regYear !== initiallySetRegYear) this.yearChanged = true;
    //   else this.yearChanged = false;
    // });
    
    if(this.PlanData['CompanyCode'] == "4"){
      
      
      this._subscriptions.push(
        this.vehicleDetailForm.get("regDate")!.valueChanges.subscribe((value) => {
          // console.log(+new Date(value).getDate() !== +new Date().getDate());
          // console.log(new Date(value).getMonth())
          // console.log(new Date().getMonth())
          if ((+new Date(value).getDate() !== +new Date().getDate()) || (+new Date(value).getMonth() !== +new Date().getMonth())   || (+new Date(value).getFullYear() !== +this.currentRegYear)) {
            this.yearChanged = true;
            // console.log(this.yearChanged);
          } else this.yearChanged = false;
        })
      );
    } else {
      this._subscriptions.push(
        this.vehicleDetailForm.get("regDate")!.valueChanges.subscribe((value) => {
          if (+new Date(value).getFullYear() !== +this.currentRegYear) {
            this.yearChanged = true;
          } else this.yearChanged = false;
        })
      );
    }
    
  }

  getCkycDocList(){
    this._subscriptions.push(
      this.posHomeService.getCKYCDocList(this.PlanData.CompanyCode).subscribe((result:any)=>{
        this.bajajCkycDocList=result.data;
      })
    )
  }

  getRegYearList() {
    this._subscriptions.push(
      this.posHomeService
        .getRegYearFuelList(this.initialQuotationRequest["InsuranceCateCode"])
        .subscribe((res) => {
          //console.log({ res });
          if (res.successcode == "0" || res.msg == null) {
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
  }

  get vehValid() {
    return this.vehicleDetailForm.controls;
  }
  //#region private functions for making server call
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
  private setNcbValidators() {
    const ncbControl :any= this.pastPolicyForm.get("ncb");
    this._subscriptions.push(
      this.pastPolicyForm
        .get("claimInPrvYear")!
        .valueChanges.subscribe((claim) => {
          if (claim == 1) {
            ncbControl.setValidators([Validators.required]);
          } else {
            ncbControl.setValidators(null);
            ncbControl.setValue("");
          }

          ncbControl.updateValueAndValidity();
        })
    );
  }
  private setMortgageValidators() {
    // const bankNameControl = this.vehicleDetailForm.get("bankName");
    // const bankAddControl = this.vehicleDetailForm.get("bankAddress");
    // this._subscriptions.push(
    //   this.vehicleDetailForm.controls["onMortgage"].valueChanges.subscribe(
    //     (mort) => {
    //       if (mort == "1") {
    //         bankNameControl.setValidators([
    //           Validators.required,
    //           Validators.minLength(3),
    //           Validators.maxLength(60),
    //         ]);
    //         bankAddControl.setValidators([
    //           Validators.required,
    //           Validators.minLength(3),
    //           Validators.maxLength(190),
    //         ]);
            
    //         if (this.premiumDataPlans.CompanyCode != '13'){ 
    //           this.filterMortgageBankList =
    //           this.premiumDataPlans.CompanyCode == "11"
    //           ? of([])
    //           : this.vehicleDetailForm.controls["bankName"].valueChanges.pipe(
    //             startWith(""),
    //             map((bankName) => this._filterBanks(bankName))
    //             );
    //           }
    //           // this.setBankMortageValidator()
    //       } else {
    //         bankNameControl.setValidators(null);
    //         bankAddControl.setValidators(null);
    //         bankNameControl.setValue("");
    //         bankAddControl.setValue("");
    //       }
    //       bankNameControl.updateValueAndValidity();
    //       bankAddControl.updateValueAndValidity();
    //     }
    //   )
    // );

    const bankNameControl: any = this.vehicleDetailForm.get("bankName");
    const bankAddControl: any = this.vehicleDetailForm.get("bankAddress");
    const mort =this.bf.get("onMortgage")!.value

          // console.log("kljfaskljdkldfj ssfdasdfa df", mort);

          if (mort == "1") {
            bankNameControl.setValidators([
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(60),
              RequireMatchMortageBankName(this.mortgageBankList, this.premiumDataPlans.CompanyCode)
            ]);
            bankAddControl.setValidators([
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(190),
            ]);
            // this.filterMortgageBankList =
            //   this.premiumDataPlans.CompanyCode == "11"
            //     ? of([])
            //     : this.vehicleDetailForm.controls["bankName"].valueChanges.pipe(
            //       startWith(""),
            //       map((bankName) => this._filterBanks(bankName))
            //     );
          } else {
            bankNameControl.setValidators(null);
            bankAddControl.setValidators(null);
            bankNameControl.setValue("");
            bankAddControl.setValue("");
          }
          bankNameControl.updateValueAndValidity();
          bankAddControl.updateValueAndValidity();
  }
  private getData() {
    this.showLoader = true;
    this.ownerInfoForm.patchValue({
      PropGenderTitle: "Mr",
    });
    this._subscriptions.push(
      this._vehicleBuyPlanService.getPraposalMaster(this.PlanData.CompanyCode).subscribe(
        (result) => {
          if (result.successcode == "0" || result.msg == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
            this.errorLogDetails.CompanyName = this.PlanData.ProductName;
            this.errorLogDetails.ControllerName = "VehicleData";
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
              map((state) => this._filterState(state)));
             this.filterStateList.subscribe(res=>{
               console.log("input satetr ",res)
           
             this.filterState = res.filter(m=>{
              return m.StateShortDesc.toString()==this.getRTO.slice(0,2)})
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
            // Remove selected company from api insurance Company
            this._vehicleBuyPlanService
              .GetPreviousInsurerByCompanyCode(
                this.premiumDataPlans.CompanyCode
              )
              .subscribe(
                (result) => {
                  this.showLoader = false;
                  // let search = new RegExp(this.premiumDataPlans.ProductName , 'i');

                  // let b = result.data.filter(item => search.test(item.PREVIOUSINSURERS));
                  // result.data.Insurance_Company = result.data.filter(function(item) {
                  //   return item.PREVIOUSINSURERS !== b[0].PREVIOUSINSURERS
                  // })
                  // Remove selected company from api insurance Company end
                  this.mortgageBankList = result.data.MortgageBankList;
                  this.filterMortgageBankList =
                    this.premiumDataPlans.CompanyCode == "11"
                      ? of([])
                      : this.vehicleDetailForm.controls["bankName"].valueChanges.pipe(
                        startWith(""),
                        map((bankName) => this._filterBanks(bankName.trim()))
                      );

                  this.setMortgageValidators()
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
                  if ( this.sessionData.premiumDataPlans.isOdOnly ==true){


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

                  this.errorLogDetails.UserCode = this.posMobileNo;
                  this.errorLogDetails.ApplicationNo =
                    this.postData.ApplicationNo;
                  this.errorLogDetails.CompanyName = this.PlanData.ProductName;
                  this.errorLogDetails.ControllerName = "VehicleData";
                  this.errorLogDetails.MethodName = "GetVehicleProposalData";
                  this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
                  this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
                  this._errorHandleService
                    .sendErrorLog(this.errorLogDetails)
                    .subscribe((res: any) => {
                      //console.log(res);
                    });

                  this._errorHandleService.handleError(err);
                }
              );
            this.filterCityList = [];
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    );
  }

  setStateValidator() {
    this.af
      .get("state")!
      .setValidators([Validators.required, RequireMatch(this.stateList)]);
    this.af.get("state")!.updateValueAndValidity();
  }

  setCityValidator() {
    this.af
      .get("city")!
      .setValidators([Validators.required, RequireMatchCity(this.cityList)]);
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

    if (this.addressForm.get("state")!.errors) {
      this.addressForm.get("city")!.reset()
      this.addressForm.get("pincode")!.reset()

      this.filteredCityList = of([])
      this.filteredautoPincodeList = of([])

    } else if (this.addressForm.get("city")!.errors) {
      this.addressForm.get("pincode")!.reset()
      this.filteredautoPincodeList = of([])
    }
  }

  onSelectDocument(event:MatSelectChange){
    if (event.value) {
      this.step.stepInd = 2;
      this.step.stepDesc = "POA"
      this.onChangeCKYCYesNO(0, this.step);
    }
  }

  onSelectStep(event: MatRadioChange): any{
    this.ckycDetailForm.reset()
    let value=event.value
    if (value === "CKYC") {
        // this.step.stepInd = 1;
        // this.step.stepDesc = "POI"
      this.onChangeCKYCYesNO(1, this.step);
    } else if (value === "PAN") {
        this.step.stepInd = 1;
        this.step.stepDesc = "POI"
      this.onChangeCKYCYesNO(0, this.step);
    } else if (value === "DOC") {
        this.step.stepInd = 2;
        this.step.stepDesc = "POA"
      this.onChangeCKYCYesNO(0, this.step);
      }else{
        return false;
      }
    // }
    // if (Ind === 'next') {
    //   if (step1.stepInd === 1) {
    //     this.step.stepInd = 2;
    //     this.step.stepDesc = "POA"
    //     this.onChangeCKYCYesNO(0, this.step);
    //   } else if (step1.stepInd === 2) {
    //     this.step.stepInd = 2;
    //     this.step.stepDesc = "POA";
    //   } else if (step1.stepInd === 3) {
    //     this.step.stepInd = 3;
    //     this.step.stepDesc = "POA"
    //   }
    // }
   
    
  }

  onChangeCKYCYesNO(type: number,step?:any) { 
    this.base64url=""
    this.docExtension=''
    this.fileName="";
    if (type === 1) {
      this.ckycYesNoDesc = "Yes";
      this.ckycYesNoCode=1
      this.ckycDetailForm.controls["ckycNo"].enable();
      
      this.ckycDetailForm.controls["panNo"].disable();
      this.ckycDetailForm.controls["doctype"].disable();
      this.ckycDetailForm.controls["docData"].disable();
      this.ckycDetailForm.controls["docNo"].disable();
      this.ckycDetailForm.updateValueAndValidity();
     return;
    } else if(type ===0) {
      
      if (step) { 
        if (step.stepInd ===2){
        this.ckycDetailForm.controls["panNo"].disable();

        this.ckycDetailForm.controls["ckycNo"].disable();
        this.ckycDetailForm.controls["doctype"].enable();
          this.ckycDetailForm.controls["docData"].disable();
        this.ckycDetailForm.controls["docNo"].enable();
        this.ckycDetailForm.updateValueAndValidity();
        this.ckycYesNoDesc = "No";
        this.ckycYesNoCode = 0
        // this.successPanNo = true;
        // this.successDocNo = true;
        this.successPanNo = false;
        this.successDocNo = false;
        this.successFileUpload = false;
        return;
      } else
       if (step.stepInd === 3 ){
        this.ckycDetailForm.controls["panNo"].disable();

        this.ckycDetailForm.controls["ckycNo"].disable();
        this.ckycDetailForm.controls["doctype"].enable();
        this.ckycDetailForm.controls["docData"].enable();
        this.ckycDetailForm.controls["docNo"].enable();
        this.ckycDetailForm.updateValueAndValidity();
        this.ckycYesNoDesc = "No";
        this.ckycYesNoCode = 0
        this.successPanNo = false;
        this.successDocNo = false;
        this.successFileUpload=true;
        return;
      }}
     this.ckycDetailForm.controls["panNo"].enable();

      this.ckycDetailForm.controls["ckycNo"].disable();
      this.ckycDetailForm.controls["doctype"].disable();
      this.ckycDetailForm.controls["docData"].disable();
      this.ckycDetailForm.controls["docNo"].disable();
      this.ckycDetailForm.updateValueAndValidity();
      this.ckycYesNoDesc = "No";
      this.ckycYesNoCode = 0
      this.successPanNo = true;
      this.successDocNo = false;
      this.step.stepInd=1;
      this.step.stepDesc='POI';
      return;
    }
  }

  onClickBackAndNextCkyc(type:number,step1:any,Ind:string){
    console.log(type,step1,Ind)
        
    if(Ind==='back'){
          if(step1.stepInd===1){
            this.step.stepInd=1;
            this.step.stepDesc="POI"
           
          }else if(step1.stepInd===2){
            this.step.stepInd=1;
            this.step.stepDesc="POI"
          } else if (step1.stepInd === 3){
            this.step.stepInd = 2;
            this.step.stepDesc = "POA"
          }
        }
        if(Ind==='next'){
          if (step1.stepInd === 1) {
            this.step.stepInd = 2;
            this.step.stepDesc = "POA"
            this.onChangeCKYCYesNO(0, this.step);
          } else if (step1.stepInd === 2) {
            this.step.stepInd = 2;
            this.step.stepDesc = "POA";
          } else if (step1.stepInd === 3) {
            this.step.stepInd = 3;
            this.step.stepDesc = "POA"
          }
        }
    this.onChangeCKYCYesNO(0, this.step);
  }

 onChangeOption(event: any) {
    console.log(event);
   const bankNameControl: any = this.vehicleDetailForm.get("bankName");
   const bankAddControl: any = this.vehicleDetailForm.get("bankAddress");

   const mort: any = event.value
    if (mort == '1') {
      this.setMortgageValidators()
      return
    }
    if (mort == "0") {
      console.log(mort);
      
      console.log(mort);
      bankNameControl.setValidators(null);
      bankAddControl.setValidators(null);
      bankNameControl.setValue("");
      bankAddControl.setValue("");
      // this.setBankMortageValidator()
      bankNameControl.updateValueAndValidity();
      bankAddControl.updateValueAndValidity();
    }


  }

  // setBankMortageValidator() {

  //   this.bf
  //     .get("bankName")
  //     .setValidators([
  //       Validators.required,
  //       RequireMatchMortageBankName(this.mortgageBankList,this.premiumDataPlans.CompanyCode),
  //     ]);
  //    this.bf.get("bankName").updateValueAndValidity();

  // }

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

  dataToBePatched!: ApplicationVehicleData[] | any;
  private getSavedData() {
    console.log(this.postData.ApplicationNo);
    console.log(this.postData.ApplicationNoOdp);
    this._subscriptions.push(
      this._vehicleBuyPlanService
        .getSavedPraposalData(
          this.postData.ApplicationNo,
          this.postData.ApplicationNoOdp
        )
        .subscribe(
          (result) => {
            this.showLoader = false;
            if (result.successcode == "0" || result.msg == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
              this.errorLogDetails.CompanyName = this.PlanData.ProductName;
              this.errorLogDetails.ControllerName = "VehicleData";
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

              this.isNewPolicy = data.SubCateCode === 2; //2=new vehicle
              const regNo: any = this.vehicleDetailForm.get("regNo");
              // this.selectedRto = data.VehicleRTODesc.split(" ")[0];
              this.selectedRto = data.VehicleRTODesc.split(" ")[0] + "-";
              // this.vehicleDetailForm.patchValue({ regNo: rto })
              if (this.PlanData.CompanyCode == '7' && !this.isNewPolicy) {
                this.vehicleDetailForm.get('IsPUC')!.setValidators([Validators.required])
              }
              else{
                this.vehicleDetailForm.get('IsPUC')!.setValidators(null)
              }
              this.vehicleDetailForm.get('IsPUC')!.updateValueAndValidity()

              if (this.isNewPolicy) {
                regNo.setValidators([]);
              } else {
                regNo.setValidators([Validators.required]);
                // Validators.pattern(PATTERN.VEHICLENO),
              }
              regNo.updateValueAndValidity();
              this.BikeExpiryCode = data.VehicleExpiryCode;
              // let previousExpiryDate = new Date(data.PreviousPolicyExpiryDate);
              if (!this.isNewPolicy) {
                // this.minDate = new Date(
                //   Number(data.VehicleRegistrationYrDesc),
                //   0,
                //   1
                // );
                // this.maxDate = new Date(Number(data.VehicleRegistrationYrDesc), 11, 31);
                //
                // let year = data.PreviousPolicyExpiryDate.split('/');
                // String to date converter

                // <previous policy expiry date patching>
                
                
                let dateString = data.PreviousPolicyExpiryDate;
                let dataSplit = dateString.split("/");
                let dateConverted;
                if (dataSplit[2].split(" ").length > 1) {
                  let hora = dataSplit[2].split(" ")[1].split(":");
                  dataSplit[2] = dataSplit[2].split(" ")[0];
                  dateConverted = new Date(
                    +dataSplit[2] ,
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
                  
                  dateCov =new Date(
                    +dataSplit[2] - 1 ,
                    +dataSplit[1] - 1,
                    +dataSplit[0] + 1
                  );
                }
                console.log(dateCov);
                this.pastPolicyForm.patchValue({
                  prvPolicyStartDate:dateCov,
                });
                this.pastPolicyForm.patchValue({
                  prvPolicyExpDate: dateConverted,
                });

                // </previous policy expiry date patching>

                /// <new vehicle reg year patch start>
                let prvPolicyExpDate =
                  this.pastPolicyForm.get("prvPolicyExpDate")!.value;
                  // const dt = prvPolicyExpDate.getFullYear() - 1 ;
                  // console.log(dt);
                  // console.log(new Date().getFullYear() - 1)
                  
                  // console.log(dateConvertedforPP);
                // increasing the vehicle reg date by one day ie next day after the previous policy expiry date
                let vehicleRegDate = new Date();
                let vehicleRegYear = data.VehicleRegistrationYrDesc;
                vehicleRegDate.setFullYear(vehicleRegYear);
                this.yearcount =  new Date().getFullYear() - +vehicleRegYear;
                console.log(this.yearcount); 
                this.vehicleDetailForm.patchValue({
                  regDate: vehicleRegDate,
                });
              this.showDates = (new Date().getFullYear() - data.VehicleRegistrationYrDesc) + 1;
              console.log(this.showDates);

                //  Another approach to increment the date by one day
                // let vehicleRegDate = new Date(
                //   new Date(prvPolicyExpDate.valueOf()).setDate(
                //     prvPolicyExpDate.getDate() + 1
                //   )
                // );

                // </new vehicle reg year patch end>

                // start: previous version vehicle reg date patch working...
                // let vData = JSON.parse(sessionStorage.getItem("VehicleData"));

                // // let month = getMonth.getMonth();
                // const md = vData.PreviousPolicyExpiryDate.split("/");
                // let date = +md[0] + 1;

                // this.vehicleDetailForm.patchValue({
                //   regDate: new Date(
                //     md[1] +
                //       "/" +
                //       date +
                //       "/" +
                //       data.VehicleRegistrationYrDesc
                //   ),
                // });

                // end : previous version vehicle reg date patch working

                // let getMonth = new Date();
                // let month = getMonth.getMonth();
                // this.vehicleDetailForm.patchValue({
                //   regDate: new Date(
                //     data.VehicleRegistrationYrDesc,
                //     month
                //   ),
                // });
                // let newDate = dateConverted.getFullYear() - 1;
                // let newMonth = dateConverted.getMonth();
                // let newhs = dateConverted.getDate() - 1;

                // prvPolicyStartDate: new Date(
                //   newDate, newMonth, newhs
                // )
                // prvPolicyExpDate: new Date(
                //   String(Number(data.VehicleRegistrationYrDesc) + 5)
                // ),
                
                this.checkIfRegDateIsAllowed();
                this.companyWiseRegDateValidation();
              }
              if (this.isNewPolicy) {
                this.vehicleDetailForm.patchValue({ regDate: new Date() });
              }
              this.ownerInfoForm.patchValue({
                ownerName: data.OwnerName,
              });
              this.ownerInfoForm.patchValue({
                ownerLastName: data.OwnerLastName,
              });
              this.vehicleDetailForm.patchValue({
                engineNo: data.EngineNo,
                chassisNo: data.VehicleIdentityNo,
              });

              this.dataToBePatched &&
                this.preFillProposalForm(this.dataToBePatched);

              // EngineSize
              // VehicleFitness
              // InsuranceDate
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
      nomineeAge: new Date(dataToBePatched.NomineeDOB),
      nomineeRelation: `${dataToBePatched.RelationshipCode},${dataToBePatched.RelationshipDesc}`,
    });

    this.addressForm.patchValue({
      pincode: dataToBePatched.PINCode,
      postalAdd: dataToBePatched.PostalAdd,
      state: dataToBePatched.StateDesc,
      city: dataToBePatched.CityDesc,
      addArea: dataToBePatched.Area,
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
      prvPolicyInsurer: dataToBePatched.PreviousPolicyInsurerDesc,
      prvPolicyNo: dataToBePatched.PreviousPolicyNo,
      prvPolicyODInsurer: dataToBePatched.PreviousPolicyInsurerDescOD,
      prvPolicyODNo: dataToBePatched.PreviousPolicyNoOD,
      claimInPrvYear: dataToBePatched.ClaimInPastYearCode,
      ncb: dataToBePatched.PreviousNCB,
    });


    console.log(dataToBePatched)
    this.vehicleDetailForm.patchValue({
      // regNo: dataToBePatched.VechileRegNo,
      regNo: dataToBePatched.VechileRegNo.slice(
        4,
        dataToBePatched.VechileRegNo.length
      ),
      regDate: new Date(dataToBePatched.VechileRegDate),
      engineNo: dataToBePatched.VechileEngineNo,
      chassisNo: dataToBePatched.VechileChassisNo,
      onMortgage: dataToBePatched.MortgageInd.toString(),
      IsPUC:dataToBePatched.IsPUC?1:0,
      bankName: dataToBePatched.MortgageLBankName,
      bankAddress: dataToBePatched.MortgageBankAddress,
    });
    this.onDobChange() 
    console.log("this.vehicleDetailForm", this.vehicleDetailForm);
  }

  makeThirdPartyEndDateReadOnly: boolean = false;
  companyWiseRegDateValidation() {
    
    if (this.premiumDataPlans["CompanyCode"] === "9") {
      // reg date validation
      this.vehicleDetailForm
        .get("regDate")!
        .setValidators([regDateValidationForTATA, Validators.required]);

      // reg date validation in case of od only
      if (this.PlanData.isOdOnly) {
        this.vehicleDetailForm
          .get("regDate")!
          .setValidators([
            regDateCheckBefore2018ForTATA,
            regDateValidationForTATA,
            Validators.required,
          ]);

        // previous policy validation
        this.pastPolicyForm
          .get("prvPolicyStartDate")!
          .setValidators([regDateCheckBefore2018ForTATA, Validators.required]);
        this.pastPolicyForm
          .get("thirdPartyPolicyIncepDate")!
          .setValidators([regDateCheckBefore2018ForTATA, Validators.required]);
      }
      // this.vehicleDetailForm
      //   .get("regDate")
      //   .setValidators(
      //     pastpolicyExDateValidationForTATA(
      //       this.pastPolicyForm.get("prvPolicyExpDate").value
      //     )
      //   );
      this.vehicleDetailForm.get("regDate")!.updateValueAndValidity();

      this.listenThirdPartyStartDate();
      this.makeThirdPartyEndDateReadOnly = true;
    }
  }
  checkIfRegDateIsAllowed(){
    

    if (this.PlanData.isOdOnly) { this.vehicleDetailForm
      .get("regDate")!
      .setValidators([
        // regDateCheckBefore2018ForTATA,
        regDateValidationForAllOd,
        Validators.required,
      ]);}
      else if(this.PlanData.isComprehensive) {
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
  getMinDate(year: number) {
    return setMinDate(year);
  }
  getMaxDate(year: number) {
    return setMaxDate(year);
  }
  getMaxRegDate(year : number){
   return setMaxRegDate(year)
  }


  uploadFile(file: any) {
    const formData = new FormData();
    formData.append('file', file.data);
    file.inProgress = true;

  }

  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach((file: any) => {
      this.uploadFile(file);
    });
  }

  onClick() {

    const fileUpload: any = this.fileUpload.nativeElement; fileUpload.onchange = () => {
    
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({ data: file, inProgress: false, progress: 0 });
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }
  fileProgress(event: any): any {

    const doc = this.ckycDetailForm.controls['docData'];//("docData")
    if (!event.target.files[0]) {
      doc.setValidators([Validators.required]);
      doc.updateValueAndValidity();
      return false;
    }
   
    let files: any = new FileReader();
    let file = event.target.files[0];
    var FileSize = file.size / 1024;
    console.log(file,FileSize)
 
    // let FileExtension = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);
    // if (FileExtension != 'pdf') {
    //   alert('Please Upload Only Pdf ...!!');
    //   return;
    // }
    // if (file.size > '2097152') {
    //   this.uploadfilename = '';
    //   alert('pdf size can not more than 2 MB');
    //   return false;
    // }
    let docArray = ["pdf", "jpeg", "gif", "bitmap", "xls", "xlsx", "doc", "docx"];
    let FileExtension= file.name.split(".")//file.name.split(".")[1];
    let isExists: boolean = docArray.some(x => x == FileExtension[FileExtension.length-1])
    this.docExtension = FileExtension[FileExtension.length - 1]
    console.log(FileExtension, isExists, FileExtension[FileExtension.length - 1])
    if (!isExists) {
      // alert("Please Upload Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx. ...!!");
      doc.setValidators([
        (): ValidationErrors => {return { fileExtensionError: "Please Upload Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx. ...!!" }}
      ]);
      doc.updateValueAndValidity();
      console.log(doc)
      return;
    }
    if (FileSize > 6000) {
      // alert("Max file size allowed is 4 MB. Allowed file type Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx.");
      doc.setValidators([
        (): ValidationErrors =>{ return {fileSizeError: "Max file size allowed is 6 MB. Allowed file type Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx."}}
      ]);
      doc.updateValueAndValidity();
      console.log(doc)

      return;
    }
    doc.setValidators(null);
    doc.updateValueAndValidity();
    console.log(this.ckycDetailForm)
    this.fileName = file.name
    // this.Image = event.target.files[0].value;
    // this.uploadfilename = file.name;
    //this.Image =file.path+'/'+file.name;

    files.readAsDataURL(file);
    files.onload = () => {
      this.base64url = files.result.toString().split(",")[1];
      console.log(this.base64url)
    };
  }

  // calculateDiff() {
  //     var dateSent = this.pastPolicyForm.value.prvPolicyExpDate;
  //     let currentDate = new Date();
  //     dateSent = new Date(dateSent);
  //     // IPolicyExpired
  //     // BikeExpiryCode: 3
  //     // BikeExpiryDesc: "I am not sure when it expired"
  //     // BikeExpiryCode: 2
  //     // BikeExpiryDesc: "Expired more than 90 days"
  //     // BikeExpiryCode: 1
  //     // BikeExpiryDesc: "Expired within 90 days"
  //     var difference = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));

  //     console.log("BikeExpiryCode", this.BikeExpiryCode);
  //     console.log("difference", difference);

  //     if (difference > 0) {
  //         if (this.BikeExpiryCode == 1)
  //             if (difference <= 90) {
  //                 this.InvalidDate = ''
  //             } else {
  //                 this.InvalidDate = "Please select date within 90 days from current date";
  //             }
  //         if (this.BikeExpiryCode == 2)
  //             if (difference >= 90) {
  //                 this.InvalidDate = ''
  //             } else {
  //                 this.InvalidDate = "Please select date more then 90 days from current date";
  //             }
  //     }
  // }
  // getMaxDate(year: number) {
  //     const dt = new Date();
  //     return new Date((+dt.getFullYear()) + year, (+dt.getMonth()) + 1, (+dt.getDay()) + 1);
  // }
  // getMinDate(year: number) {
  //     const dt = new Date();
  //     return new Date((+dt.getFullYear()) - year, (+dt.getMonth()), (+dt.getDay()) + 2);
  // }
  private _filterState(value: string): IState[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.stateList.filter(
      (row) => row.StateDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterCity(value: string): ICity[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.filterCityList.filter(
      (row) => row.CityDesc.toLowerCase().indexOf(filterBy) === 0
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
  // private _filterPincode(value: number): IPincode[] {
  //   //
  //   // const filterBy = value ? value.toLowerCase() : value;
  //   // return this.cityPincodes.filter(
  //   //   (row) => row.Pincode
  //   // );
  //   const filterValue = value;

  //   return this.cityPincodes.filter(option => +option.Pincode === 0);
  // }
  public onChangeTab(event: any) {
    this.tabIndex = event.selectedIndex;
    this.setStates(event.selectedIndex);
  }
  async onChangePPInsurer() {
    const ppI = this.pastPolicyForm.get("prvPolicyInsurer")!.value;
  }

  async onChangePPODInsurer() {
    const ppI = this.pastPolicyForm.get("prvPolicyODInsurer")!.value;
  }
  async onChangeStateInput() {
    if (
      this.stateList.find(
        (state) => state.StateDesc === this.addressForm.value.state
      )
    )
      {
        //this.onChangeState();
      }
  }
  
  async onChangeState() {
    
    const sts = this.addressForm.get("state")!.value; //st.name
    this.searchState = sts
      ? this.stateList.filter((st: IState) => st.StateDesc == sts)
      : [];
    let stateCode = this.searchState[0].StateCode;

    this.filterCityList = stateCode
      ? this.cityList.filter((city: ICity) => city.StateCode == stateCode)
      : [];
    this.addressForm.controls["city"].reset();
    this.addressForm.controls["pincode"].reset();
    this.filteredCityList = this.addressForm.controls["city"].valueChanges.pipe(
      startWith(""),
      map((city) => this._filterCity(city))
    );
  }
  onChangeCityInput() {
    if (
      this.cityList.find(
        (City) => City.CityDesc === this.addressForm.value.city
      )
    ){
//       let city:ICity=this.cityList.find(
//         (City) => City.CityDesc === this.addressForm.value.city
//       )
// console.log(city);

      this.onChangeCity();
    }
  }

  async onChangeCity() {
    
    // console.log(city);

    let cts: any = this.addressForm.get("city")!.value;
    let city: ICity|any = this.cityList.find(
      (City) => City.CityDesc === cts
    )
    console.log(city);
    this.showLoader = true;
    this.addressForm.controls["pincode"].reset();
    this._subscriptions.push(
      this._vehicleBuyPlanService.GetPincode(cts, city.StateDesc).subscribe((result) => {
        this.showLoader = false;
        if (result.successcode == "0" || result.msg == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
          this.errorLogDetails.CompanyName = this.PlanData.ProductName;
          this.errorLogDetails.ControllerName = "VehicleData";
          this.errorLogDetails.MethodName = "GetPincodeListByDistrict";
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              //console.log(res);
            });
        }
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
  async onChangeBank() {
    const bank = this.vehicleDetailForm.get("bankName")!.value;
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
    // }, 500);
  }
  async onChangePincode() {
    const pin = this.addressForm.get("pincode")!.value;
  }

  // onChangeState() {
  //   const stateCode = this.addressForm.get("state").value
  //     ? this.addressForm.get("state").value.split(",")[0]
  //     : 0;
  //   this.filterCityList = stateCode
  //     ? this.cityList.filter((city: ICity) => city.StateCode == stateCode)
  //     : [];
  // }
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
    // let sessionData: ApplicationVehicleRegData = JSON.parse(sessionStorage.getItem("postData"));
    // //
    // this.ownerInfoForm.patchValue({
    //   ownerName: sessionData.VechileOwnerName,
    //   gender: sessionData.GenderCode + "," + sessionData.GenderCodeDesc,
    //   dob: new Date(sessionData.DOB),
    //   mobileNo: sessionData.MobileNo,
    //   emailId: sessionData.EmailID,
    //   nomineeName: sessionData.NomineeName,
    //   nomineeAge: new Date(sessionData.NomineeDOB),
    //   nomineeRelation: sessionData.RelationshipCode + "," + sessionData.RelationshipDesc,
    // });

    // this.addressForm.patchValue({
    //   pincode: sessionData.PINCode,
    //   postalAdd: sessionData.PostalAdd,
    //   state: sessionData.StateDesc,
    //   city: sessionData.CityDesc,
    //   addArea: sessionData.Area,
    // });

    // this.pastPolicyForm.patchValue({
    //   prvPolicyStartDate: new Date(sessionData.PreviousPolicyStartDate),
    //   prvPolicyExpDate: new Date(sessionData.PreviousPolicyExpDate),
    //   thirdPartyPolicyIncepDate: new Date(sessionData.ThirdPartyPolicyInceptionDate),
    //   thirdPartyPolicyExpDate: new Date(sessionData.ThirdPartyPolicyExpiryDate),
    //   prvPolicyInsurer: sessionData.PreviousPolicyInsurerCode + "," + sessionData.PreviousPolicyInsurerDesc,
    //   prvPolicyNo: sessionData.PreviousPolicyNo,
    //   ncb: sessionData.PreviousNCBDesc,
    // });

    // this.vehicleDetailForm.patchValue({
    //   regNo: sessionData.VechileRegNo,
    //   regDate: sessionData.VechileRegDate,
    //   engineNo: sessionData.VechileEngineNo,
    //   chassisNo: sessionData.VechileChassisNo,
    //   onMortgage: sessionData.MortgageInd,
    //   bankName: sessionData.MortgageLBankName,
    //   bankAddress: sessionData.MortgageBankAddress,
    // });
  }
  onClickBack(i: number) {
    let indx = +Object.assign({}, this.tabIndex);
    this.setStates(indx--);
    setTimeout(() => {
      this.tabIndex--;
    }, 100);
  }

  private setStates(i: number) {
    switch (i) {
      case 0: {
        // this.isCompleted_ckycInfo=false
        this.isCompleted = false;
        this.isCompleted_add = false;
        this.isCompleted_pp = false;
        this.isCompleted_vd = false;
        break;
      }
      case 1: {
        // this.isCompleted = false;
        this.isCompleted_add = false;
        this.isCompleted_pp = false;
        this.isCompleted_vd = false;
        break;
      }
      case 2: {
        // this.isCompleted_add = false;
        this.isCompleted_pp = false;
        this.isCompleted_vd = false;
        break;
      }
      case 3: {
        // this.isCompleted_pp = false;
        this.isCompleted_vd = false;
        break;
      }
    
      default: {
        break;
      }
    }
  }
  onClickChangeInsurer() {
    this._location.back();

  }
  onClickEditVehicleInfo() {
    let vData: ApplicationVehicleData = JSON.parse(
      sessionStorage.getItem("VehicleData")!
    );
    vData.edit = 1;
    sessionStorage.setItem("VehicleData", JSON.stringify(vData));
    this._router.navigate(["/pos/bike-insurance"]);
  }


  successPanNo:boolean=true;
  successDocNo:boolean=true;
  successDocUpload:boolean=true;
  public onSubmitCKYCInfo(): any{
    debugger
     this.step={stepInd:0,stepDesc:''};
    this.errMsg_oi = "";
    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    let cData=this.ckycDetailForm.value;
    let dob=new Date(cData.DOB)
    let formatDOB = formatDate(dob, 'dd-MMM-yyyy', 'en-US');
    let docT ={ DocShortDesc: "",DocDesc: ''};
    let DocNO: any;
   
    if (cData.ckycNo){
      this.step.stepInd=1;this.step.stepDesc="CKYC";
      DocNO=cData.ckycNo;
      docT.DocShortDesc="Z";
      docT.DocDesc ="CKYC Number"
    } else if (cData.panNo ){
      this.step.stepInd = 2; this.step.stepDesc = "POI";
      DocNO = cData.panNo;
      docT.DocShortDesc = "C";
      docT.DocDesc = "PAN"
    }else{
      if (cData.doctype.DocDesc === "PAN"){
        this.step.stepDesc = "POI";
      }else{
        this.step.stepDesc = "POA";
      }
      this.step.stepInd = 3; 
      DocNO = cData.docNo.trim();
      docT=cData.doctype
    }
    // onChangeCKYCYesNO
   const ckycData:ICKYCBajaj= {
      ApplicationNo: this.postData.ApplicationNo,
        RegistrationNo: "0",
        Quotationno:  this.sessionData.premiumDataPlans.policyNumber,
        CompanyCode: this.PlanData.CompanyCode,
        CompanyName: this.PlanData.ProductName,
         CKYCStepInd: this.step.stepInd,
        CKYCStepDesc: this.step.stepDesc,
         CKYCNO:"0" ,
         DOB: formatDOB,
         DocumentNo: DocNO,
         DocShortDesc: docT.DocShortDesc,
         DocDesc: docT.DocDesc,
         documentExtension: this.docExtension,
         FileBase64: this.base64url?this.base64url:""
    }
    debugger;
    if ((this.docExtension === null || this.docExtension === "" || this.docExtension === undefined)
      && (this.base64url === "" || this.base64url === null || this.base64url === undefined) )  {
      this._subscriptions.push(
        this.posHomeService.postCKYCBajajDetails(ckycData).subscribe((result: ApiResponse) => {
debugger
          if (result.successcode == "0" || result.successcode == null) {
            this._toastService.error(result.msg, 'Validation Failed!');
            
            // let quotNo=this.sessionData.premiumDataPlans.Quotationno;
            // // Math.random(c) * Math.pow(10, x)
            // let x = Math.floor(Math.random() * Math.pow(10, quotNo.toString().length))
            // this.sessionData.premiumDataPlans.Quotationno =x;
            // this.sessionData.premiumDataPlans.policyNumber=x;
            // sessionStorage.setItem("Data",JSON.stringify(this.sessionData))
            // console.log(x,typeof(x))
            // if (this.step.stepInd == 1) {
            //   this.onChangeCKYCYesNO(0, this.step)
            // }
            // else if (this.step.stepInd == 2) {
            //   this.onChangeCKYCYesNO(0, this.step)
            // }
            // else
            //  if (this.step.stepInd == 3) {
            //   this.onChangeCKYCYesNO(0, this.step)
            // }
          }else if (result.successcode == '1' && result.data.errCode != "1") {

            // this._toastService.success(result.msg, 'Validation Success.');
            this.isCompleted_ckycInfo = true;
            setTimeout(() => {
              this.tabIndex++;
            }, 100);
          }else{
            
            if(result.data!.poiStatus==="FOUND" && result.data!.ckycStatus==="NOT_FOUND"  && result.data!.poaStatus==="NA"){
              this._toastService.error("CKYC number not found using POI details.Enter correct details or You can search CKYC number using other Documents.", 'CKYC Error.');
              if (this.step.stepInd == 2) {
                this.isPOIStatusFound=false;
                this.step.stepInd = 1;
                this.step.stepDesc = "POI"
                this.onChangeCKYCYesNO(0, this.step)
            } 
          }
            else if(result.data!.poiStatus==="FOUND" && result.data!.poaStatus==="FOUND" && result.data!.ckycStatus==="NOT_FOUND"){
              this._toastService.error("CKYC number not found using POA details.", 'CKYC Error.');
              if (this.step.stepInd == 3) {
              this.isPOIStatusFound=false
              this.onChangeCKYCYesNO(0, this.step)
            }
          }else{
            this._toastService.error(result.msg, 'CKYC Error.');
            if (this.step.stepInd == 3) {
              // this.isPOIStatusFound=true;
              // this.onChangeCKYCYesNO(0, this.step)
            }
            }
            
          }
        })
      )
  }
   else{
      this._subscriptions.push(
        this.posHomeService.postBajajValidateCKYCDocUplode(ckycData).subscribe((result: ApiResponse) => {
          console.log(result)
          debugger
          if (result.successcode == "0" || result.successcode == null) {
            this._toastService.error(result.msg, 'Validation Failed!');
            if (this.step.stepInd == 1) {
              this.onChangeCKYCYesNO(0, this.step)
            }
            else if (this.step.stepInd == 2) {
              this.onChangeCKYCYesNO(0, this.step)
            }
            else if (this.step.stepInd == 3) {
              this.onChangeCKYCYesNO(0, this.step)
            }
          }
          if (result.successcode == '1' && result.data.errMsg == "Success") {
            this._toastService.success(result.msg, 'Validation Success.');
            this.isCompleted_ckycInfo = true;
            setTimeout(() => {
              this.tabIndex++;
            }, 100);
          }
        })
      )
   }


 
  // BajajValidateCKYCDocUplode
 
     
   }

   private updateIdentityValidity() {
     const control: any = this.ckycDetailForm.get("docNo");
    this._subscriptions.push(
      this.ckycDetailForm
        .get("doctype")!
        .valueChanges.subscribe((identity: ICKYCDocList | any) => {
          control.reset();
          if (identity.DocTypeCodeOdp == EDocListEnum.PAN) {
            this.identityMask = MASKS.PAN;
            control.setValidators([
              Validators.pattern(PATTERN.PAN),
              Validators.required,
            ]);
          } else if (identity.DocTypeCodeOdp == EDocListEnum.UID) {
            this.identityMask = MASKS.AADHAAR;
            control.setValidators([
              Validators.pattern(PATTERN.AADHAAR),
              Validators.required,
            ]);
          } else if (identity.DocTypeCodeOdp == EDocListEnum.DrivingLicense) {
            this.identityMask = MASKS.DRIVINGLICENSE;
            control.setValidators([
              // Validators.pattern(PATTERN.DRIVINGLICENCE),
              Validators.required,
            ]);
          }
          else if (identity.DocTypeCodeOdp == EDocListEnum.Passport) {
            this.identityMask = MASKS.PASSPORT;
            control.setValidators([
              // Validators.pattern(PATTERN.PASSPORT),
              Validators.required,
            ]);
          }
          else if (identity.DocTypeCodeOdp == EDocListEnum.VoterID) {
            this.identityMask = MASKS.VOTERID
            control.setValidators([
              Validators.pattern(PATTERN.VOTERID),
              Validators.required,
            ]);
          }
          else if (identity.DocTypeCodeOdp == EDocListEnum.CKYC) {
            this.identityMask = MASKS.CKYC
            control.setValidators([
              // Validators.pattern(PATTERN.VOTERID),
              Validators.required,
            ]);
          }
          else if (identity.DocTypeCodeOdp == EDocListEnum.NREGA) {
            this.identityMask = MASKS.NAREGACARD
            control.setValidators([
              // Validators.pattern(PATTERN.VOTERID),
              Validators.required,
            ]);
          }
          else if (identity.DocTypeCodeOdp == EDocListEnum.NREGA) {
            this.identityMask = MASKS.NAREGACARD
            control.setValidators([
              // Validators.pattern(PATTERN.VOTERID),
              Validators.required,
            ]);
          }
          else if (identity.DocTypeCodeOdp == EDocListEnum.NPRL) {
            this.identityMask = MASKS.NPR
            control.setValidators([
              // Validators.pattern(PATTERN.VOTERID),
              Validators.required,
            ]);
          }
          else {
            this.identityMask = null;
            control.setValidators(Validators.required);
          }
          control.updateValueAndValidity();
        })
    );


  }

  // private updateIdentityValidity() {
  //   const control = this.ckycDetailForm.get("docNo");
  //   this._subscriptions.push(
  //     this.ckycDetailForm
  //       .get("doctype")
  //       .valueChanges.subscribe((identity: ICKYCDocListBajaj | undefined) => {
  //         control.reset();
  //         if (identity.DocDesc == EBajajDocListEnum.PAN) {
  //           this.identityMask = MASKS.PAN;
  //           control.setValidators([
  //             Validators.pattern(PATTERN.PAN),
  //             Validators.required,
  //           ]);
  //         } else if (identity.DocDesc == EBajajDocListEnum.UID ) {
  //           this.identityMask = MASKS.AADHAAR;
  //           control.setValidators([
  //             Validators.pattern(PATTERN.AADHAAR),
  //             Validators.required,
  //           ]);
  //         } else if (identity.DocDesc == EBajajDocListEnum.GSTIN) {
  //           this.identityMask = MASKS.GSTIN;
  //           control.setValidators([
  //             Validators.pattern(PATTERN.GSTIN),
  //             Validators.required,
  //           ]);
  //         } else if (identity.DocDesc == EBajajDocListEnum.DrivingLicense) {
  //           this.identityMask = MASKS.DRIVINGLICENSE;
  //           control.setValidators([
  //             // Validators.pattern(PATTERN.DRIVINGLICENCE),
  //             Validators.required,
  //           ]);
  //         }
  //         else if (identity.DocDesc == EBajajDocListEnum.Passport) {
  //           this.identityMask = MASKS.PASSPORT ;
  //           control.setValidators([
  //             Validators.pattern(PATTERN.PASSPORT),
  //             Validators.required,
  //           ]);
  //         } 
  //         else if (identity.DocDesc == EBajajDocListEnum.VoterID) {
  //           this.identityMask = MASKS.VOTERID
  //           control.setValidators([
  //             Validators.pattern(PATTERN.VOTERID),
  //             Validators.required,
  //           ]);
  //         } 
  //         else if (identity.DocDesc == EBajajDocListEnum.CKYC) {
  //           this.identityMask = MASKS.CKYC
  //           control.setValidators([
  //             // Validators.pattern(PATTERN.VOTERID),
  //             Validators.required,
  //           ]);
  //         } else if (identity.DocDesc == EBajajDocListEnum.NREGA) {
  //           this.identityMask = MASKS.NAREGACARD
  //           control.setValidators([
  //             // Validators.pattern(PATTERN.VOTERID),
  //             Validators.required,
  //           ]);
  //         } 
  //         else {
  //           this.identityMask = null;
  //           control.setValidators(Validators.required);
  //         }
  //         control.updateValueAndValidity();
  //       })
  //   );
  // }


  public searchCkycORDoc() {

  }
  onClickPlanDetails(index: number): void {
    // $('#premiumBreakupModel').modal('show');
    // setTimeout(() => {ks
    //     this.selectedIndex = index;
    // }, 100);
    
    this.PlanData = JSON.parse(JSON.stringify(this.premiumDataPlans));
    //  this.PlanDataforOriental = JSON.parse(JSON.stringify(this.premiumDataPlansforOriental));
    // if(this.PlanDataforOriental.ProductName == 'The Oriental Insurance Company Ltd.') this.planComp.popUp2 = true;
    //  else
      this.planComp.PopUp = true;
    setTimeout(() => { 
      this.selectedIndex = index;
    }, 100);
  }
  public onSubmitOwnerInfo(): any{
    this.errMsg_oi = "";
    if (this.ownerInfoForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    // if (this.validateOwnerInfo()) {
      this.isCompleted = true;
      setTimeout(() => {
        this.tabIndex++;
      }, 100);
    // }
  }
  public onSubmitAddress(): any {
    //console.log(this.addressForm.value);

    this.errMsg_ca = "";
    if (this.addressForm.invalid) {
      this.errMsg_ca = "Please fill all details correctly.";
      return false;
    }
    this.isCompleted_add = true;
    // if (!this.isNewPolicy) {
    //     this.isCompleted_pp = true;
    // }
    setTimeout(() => {
      this.tabIndex++;
    }, 100);
  }

  // dummyReviewData = {
  //   ApplicationNo: 6797,
  //   ApplicationNoOdp: 6895,
  //   VechileOwnerName: "OWNER ",
  //   VehicleOwnerLastName: "SURNAME",
  //   GenderCode: "1",
  //   GenderCodeDesc: "Male",
  //   DOB: "21/05/2003",
  //   MobileNo: "9999999999",
  //   EmailID: "test@gmail.com",
  //   NomineeDOB: "21/05/2003",
  //   NomineeName: "NOMINEE",
  //   Salutation: "Mr",
  //   RelationshipCode: "7",
  //   RelationshipDesc: "Brother",
  //   PINCode: "413110",
  //   PostalAdd: "HOUSE",
  //   Area: "AREA",
  //   StateCode: 21,
  //   StateDesc: "Maharashtra",
  //   CityCode: 587,
  //   CityDesc: "Pune",
  //   PreviousPolicyStartDate: "05/04/2016",
  //   PreviousPolicyExpDate: "06/04/2021",
  //   PreviousPolicyInsurerCode: 113,
  //   PreviousPolicyInsurerDesc: "BAJAJ ALLIANZ GENERAL INSURANCE CO. LTD.",
  //   PreviousPolicyNo: "LSKDJKLW4J",
  //   VechileRegNo: "MH12SD8768",
  //   VechileRegDate: "05/04/2016",
  //   VechileEngineNo: "S7D6F7S6F7DS6F87S6DF",
  //   VechileChassisNo: "8687S6D876F87DS6F",
  //   MortgageInd: "0",
  //   MortgageIndDesc: "NO",
  //   MortgageLBankName: "",
  //   MortgageBankAddress: "",
  //   InsuranceCompCode: "8",
  //   InsuranceCompDesc: "GODIGIT",
  //   IDVAmount: "37800",
  //   InsurancePolicyCode: 0,
  //   InsurancePolicyDesc: "",
  //   ZeroDepreciationCode: 0,
  //   ZeroDepreciationDesc: false,
  //   PolicyTenure: "1",
  //   PersonalAccidentCoverInd: 0,
  //   PersonalAccidentCoverDesc: false,
  //   ComprehensiveThirdPartyCode: 0,
  //   ComprehensiveThirdPartyDesc: "COMPREHENSIVE",
  //   PolicyPremiumAmount: 1701,
  //   CGSTPolicyPremiumAmount: 0,
  //   SGSTPolicyPremiumAmount: 0,
  //   IGSTPolicyPremiumAmount: 0,
  //   TotalGSTPremiumAmount: 0,
  //   PolicyPremiumGSTRate: 0,
  //   GSTApplicableCode: 0,
  //   GSTApplicableDesc: "",
  //   OwnerGSTNo: 0,
  //   PoicyTotalAmount: 0,
  //   CoverageList: [
  //     {
  //       CoverageID: 0,
  //       CoverageCode: "IDV Basic",
  //       Limit1: "30240",
  //       ODPremium: "677.76",
  //       TPPremium: "1193.00",
  //       Rate: null,
  //       tempCoverCode: null,
  //     },
  //     {
  //       CoverageID: 20,
  //       CoverageCode: "No Claim Bonus",
  //       Limit1: "25",
  //       ODPremium: "-169.44",
  //       TPPremium: "0",
  //       Rate: null,
  //       tempCoverCode: null,
  //     },
  //   ],
  //   Data: {
  //     RegistrationNo: 3250,
  //     RegistrationNoOdp: 3241,
  //     InsuranceCateCode: 1,
  //     SubCateCode: 1,
  //     ApplicationNo: 6797,
  //     ApplicationNoOdp: 6895,
  //     CompanyCode: 8,
  //     APITypeDesc: "Go Digit Renew Bike Proposal",
  //     APIBaseUrl: "https://hbwebsiteapi.azurewebsites.net/api/",
  //     APIMethod: "GoDigit/GetRenewBikeProposalGoDigit",
  //     Partnerid: "0",
  //     ProductCode: "0",
  //     PrvPolicyExCode: 1,
  //   },
  // };

  public onSubmitPastPolicy(): any{
    // this.postData = this.dummyReviewData;
    // this.isreview = true;
    // return;

    

    this.errMsg_pp = "";
    if (!this.isNewPolicy) {
      if (this.pastPolicyForm.invalid) {
        this.errMsg_pp = "Please fill all details correctly.";
        return false;
      }
    }

    if (+this.initialQuotationRequest["SubCateCode"] !== 2 && +this.isPrvPolicyRemember != 0) {
      //if not new
      if (this.yearChanged) {
        this.runQuotationRequest();
        this.currentRegYear = +new Date(
          this.vehicleDetailForm.get("regDate")!.value
        ).getFullYear();
        this.oldPremium = Math.round(
          this.premiumDataPlans["AmountPayableIncludingGST"]
        );
        return;
      }

      this.newPremiumModal = "none";
    }

    this.showLoader = true;
    this.isCompleted_pp = true;
    // //
    let rv = new ApplicationVehicleRegData();
    rv.ApplicationNo = this.postData.ApplicationNo;
    rv.ApplicationNoOdp = this.postData.ApplicationNoOdp;
    rv.DiscountAmount = this.premiumDataPlans.DiscountAmt;
    rv.DiscountLoading = this.premiumDataPlans.DiscountLoading;
    const owner = this.ownerInfoForm.value;
    const add = this.addressForm.value;
    const pp = this.pastPolicyForm.value;
    const v = this.vehicleDetailForm.value;
    // vehicle owner info
    rv.VechileOwnerName = owner.ownerName;
    rv.VehicleOwnerLastName = owner.ownerLastName;
    if (owner.gender) {
      rv.GenderCode = owner.gender.split(",")[0];
      rv.GenderCodeDesc = owner.gender.split(",")[1];
    }
    rv.DOB = convertToMydate(owner.dob);
    rv.MobileNo = owner.mobileNo;
    rv.EmailID = owner.emailId;
    // rv.NomineeAge = owner.nomineeAge;
    rv.NomineeDOB = convertToMydate(owner.nomineeAge);
    rv.NomineeName = owner.nomineeName;
    rv.Salutation = owner.PropGenderTitle;
    if (owner.nomineeRelation) {
      rv.RelationshipCode = owner.nomineeRelation.split(",")[0];
      rv.RelationshipDesc = owner.nomineeRelation.split(",")[1];
    }
    //communication address
    rv.PINCode = add.pincode;
    rv.PostalAdd = add.postalAdd;
    rv.Area = add.addArea;
    // //
    let stateData: any = this.stateList.find((x) => x.StateDesc == add.state);
    let cityData: any = this.cityList.find((x) => x.CityDesc == add.city);

    if (add.state) {
      rv.StateCode = stateData.StateCode;
      rv.StateDesc = stateData.StateDesc;
    }
    if (add.city) {
      rv.CityCode = cityData.CityCode;
      rv.CityDesc = cityData.CityDesc;
    }
    // //
    // if (add.state) {
    //   rv.StateCode = add.state.split(",")[0];
    //   rv.StateDesc = add.state.split(",")[1];
    // }
    // if (add.city) {
    //   rv.CityCode = add.city.split(",")[0];
    //   rv.CityDesc = add.city.split(",")[1];
    // }

    // past policy info
    if (!this.isNewPolicy && this.isPrvPolicyRemember!=0) {
      rv.PreviousPolicyStartDate = convertToMydate(pp.prvPolicyStartDate);
      rv.PreviousPolicyExpDate = convertToMydate(pp.prvPolicyExpDate);

      // if(this.PlanData.CompanyCode == "0") 
      // {
      //   rv.RegistrationDate = convertToMydate(this.vehicleDetailForm.get("regDate").value);
        
      // }
      rv.RegistrationDate = convertToMydate(this.vehicleDetailForm.get("regDate")!.value);
      //   rv.IDVAmount =  this.PlanData.IDVVAlue;
      // }
      // rv.IDVAmount = this.IdvAmtforIffco;
        console.log(rv.IDVAmount);
      let ppInsurerData: any = this.insuCompanyList.find(
        (x) => x.InsuranceCompanyDesc == pp.prvPolicyInsurer
      );

      let ppInsurerODData: any = this.insuCompanyList.find(
        (x) => x.InsuranceCompanyDesc == pp.prvPolicyODInsurer
      );
      
      if (pp.prvPolicyInsurer) {
        rv.PreviousPolicyInsurerCode = ppInsurerData.InsuranceCompanyCode;
        rv.PreviousPolicyInsurerDesc = ppInsurerData.InsuranceCompanyDesc;
      }
      rv.PreviousPolicyNo = pp.prvPolicyNo;
      
      if (pp.prvPolicyODInsurer) {
        // console.log(ppInsurerODData, pp.prvPolicyODInsurer);
        rv.PreviousPolicyInsurerODCode = ppInsurerODData.InsuranceCompanyCode;
        rv.PreviousPolicyInsurerODDesc = ppInsurerODData.InsuranceCompanyDesc;
      }
      rv.PreviousPolicyODNo=pp.prvPolicyODNo
      // rv.ClaimInPastYearCode = pp.claimInPrvYear;
      // console.log("pp.claimInPrvYear", pp.claimInPrvYear);
      // if (rv.ClaimInPastYearCode == EYesNo.YES) {
        //     rv.ClaimInPastYearDesc = EYesNo[EYesNo.YES];
      // if (!this.PlanData.isTp) {
      //     rv.PreviousNCBCode = pp.ncb.split(',')[0];
      //     rv.PreviousNCBDesc = pp.ncb.split(',')[1];
      // } else {
      //     rv.PreviousNCBCode = 0;
      //     rv.PreviousNCBDesc = "0";
      // }
      // }
    }
    // else {
    //     rv.ClaimInPastYearDesc = EYesNo[EYesNo.NO];
    //     rv.PreviousNCBCode = 0;
    //     rv.PreviousNCBDesc = '';
    // }
    // vehicle details
    // let regno = this.selectedRto + v.regNo;
    let regno = this.selectedRto + v.regNo;
    rv.VechileRegNo = regno.replace(/-/g, "").length > 4 ? regno.replace(/-/g, "") : `${regno.replace(/-/g, "")}AA1234` //regno.replace(/-/g, "");
    rv.VechileRegDate = convertToMydate(v.regDate);
    rv.VechileEngineNo = v.engineNo;
    rv.VechileChassisNo = v.chassisNo;
    
    rv.IsPUC=v.IsPUC == 1?true:false;
    rv.MortgageInd = v.onMortgage;
    let bankData: any = this.mortgageBankList.find(
      (x) => x.MortgageLBankName == v.bankName
    );

    if (rv.MortgageInd == "1") {
      rv.MortgageIndDesc = EYesNo[EYesNo.YES];
      rv.MortgageLBankName = bankData ? bankData.MortgageLBankName : v.bankName;
      rv.MortgageLBankCode = bankData ? bankData.MortgageLBankCode : 0;
      rv.MortgageBankAddress = v.bankAddress;
    } else {
      rv.MortgageIndDesc = EYesNo[EYesNo.NO];
      rv.MortgageLBankName = "";
      rv.MortgageBankAddress = "";
    }
    // rv.MortgageInd = v.onMortgage;
    // if (rv.MortgageInd == "1") {
    //   rv.MortgageIndDesc = EYesNo[EYesNo.YES];
    //   rv.MortgageLBankName = v.bankName;
    //   rv.MortgageBankAddress = v.bankAddress;
    // } else {
    //   rv.MortgageIndDesc = EYesNo[EYesNo.NO];
    //   rv.MortgageLBankName = "";
    //   rv.MortgageBankAddress = "";
    // }

    // Add values in this parameters

    // both
    rv.InsuranceCompCode = this.PlanData.CompanyCode;
    rv.InsuranceCompDesc = this.PlanData.ProductName;
    rv.IDVAmount = this.PlanData.IDVVAlue,
    // renew
    rv.InsurancePolicyCode = 0;
    rv.InsurancePolicyDesc = "";
    // both
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
        pp.thirdPartyPolicyIncepDate
      );
      rv.ThirdPartyPolicyExpiryDate = convertToMydate(
        pp.thirdPartyPolicyExpDate
      );
      rv.ComprehensiveThirdPartyCode = 2;
      rv.ComprehensiveThirdPartyDesc = "ODONLY";
    }
    rv.PolicyPremiumAmount = this.PlanData.Premium;
    // need to pass 0 for now
    rv.CGSTPolicyPremiumAmount = 0;
    rv.SGSTPolicyPremiumAmount = 0;
    rv.IGSTPolicyPremiumAmount = 0;
    rv.TotalGSTPremiumAmount = 0;
    rv.PolicyPremiumGSTRate = 0;
    rv.GSTApplicableCode = 0;
    rv.GSTApplicableDesc = "";
    rv.OwnerGSTNo = 0;
    rv.PoicyTotalAmount = 0;
    rv.CoverageList = [];


    // this.sessionData.CoverageList.push(this.sessionData.premiumDataPlans.CoverageList[0])
    let idvBasic = this.sessionData.premiumDataPlans.CoverageList.find(
      (x: { CoverageCode: string; }) => x.CoverageCode == "IDV Basic"
    );
    rv.CoverageList.push(idvBasic);
    if (this.premiumDataPlans.pacover) {
      let paCover = this.sessionData.premiumDataPlans.CoverageList.find(
        (x: { CoverageID: number; }) => x.CoverageID == 16
      );
      rv.CoverageList.push(paCover);
    }
    if (this.premiumDataPlans.zeroDp) {
      let depWaiver = this.sessionData.premiumDataPlans.CoverageList.find(
        (x: { CoverageID: number; }) => x.CoverageID == 1
      );
      if (depWaiver) {
        rv.CoverageList.push(depWaiver);
      }
    }
    let NCB = this.sessionData.premiumDataPlans.CoverageList.find(
      (x: { CoverageCode: string; }) => x.CoverageCode == "No Claim Bonus"
    );
    if (NCB != undefined) {
      rv.CoverageList.push(NCB);
    }
    if(this.premiumDataPlans.istppd){
      let TPPD = this.sessionData.premiumDataPlans.CoverageList.find(
        (x: { CoverageCode: string; }) => x.CoverageCode == "Third Party Property Damage"
      );
      rv.CoverageList.push(TPPD);
    }
    rv.PrvPolicyRememberCode = +this.initialQuotationRequest["PrvPolicyRememberCode"];
    rv.PrvPolicyRememberDesc = this.initialQuotationRequest["PrvPolicyRememberDesc"];

    //pass registrationNo and RegistrationOdpNo
    // rv["RegistrationNo"] =
    //   this.dataToBePatched && this.dataToBePatched["RegistrationNo"]
    //     ? this.dataToBePatched["RegistrationNo"]
    //     : 0;
    // rv["RegistrationNoOdp"] =
    //   this.dataToBePatched && this.dataToBePatched["RegistrationNoOdp"]
    //     ? this.dataToBePatched["RegistrationNoOdp"]
    //     : 0;

    if (this.reviewData) {
      rv["RegistrationNo"] = this.reviewData["Data"]["RegistrationNo"];
      rv["RegistrationNoOdp"] = this.reviewData["Data"]["RegistrationNoOdp"];
    } else if (this.dataToBePatched) {
      rv["RegistrationNo"] = this.dataToBePatched["RegistrationNo"];
      rv["RegistrationNoOdp"] = this.dataToBePatched["RegistrationNoOdp"];
    }
    // renew
    // rv.PreviousPolicyExpDate = "09/10/2020"
    // rv.PreviousPolicyInsurerCode = 0
    // rv.PreviousPolicyInsurerDesc = ""
    // rv.PreviousPolicyNo = pp.prvPolicyNo
    // rv.ClaimInPastYearCode = pp.claimInPrvYear

    console.log(rv);
    // return false;
    this.postData = rv;
    
    console.log("this.postData", JSON.stringify(this.postData));
    this._subscriptions.push(
      this._vehicleBuyPlanService.savePraposal(this.postData).subscribe(
        (result) => {
          if (result.successcode == "1") {
            // this._errorHandleService._toastService.success('Praposal form submitted successfully.', result.msg);
            console.log("Result ==> ", result);
            this.isreview = true;
            this.reviewData = rv;
            this.reviewData["Data"] = result.data[0];
            sessionStorage.setItem("postData", JSON.stringify(this.reviewData));

            const appNo = encryption(result.data[0]['ApplicationNo'].toString());
            const appOdpNo = encryption(result.data[0]['ApplicationNoOdp'].toString());
            console.log(result.data[0]['ApplicationNo'])
            
            sessionStorage.setItem("postData", JSON.stringify(this.reviewData));
         
            // const url = this._router.navigate([`/bike-insurance/buyplan/`,appNo,appOdpNo])//(`/bike-insurance/buyplan/${appNo}/${appOdpNo}`);//this._location.replaceState(`/bike-insurance/buyplan/`,appNo,appOdpNo);//
            // console.log("url  ",url);
            
            this.showLoader = false;
          } else {
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

            this._errorHandleService._toastService.warning(
              result.msg,
              result.successcode
            );
            this.showLoader = false;
          }
        },
        (err: any) => {
          this.showLoader = false;
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
          this.errorLogDetails.CompanyName = this.PlanData.ProductName;
          this.errorLogDetails.ControllerName = "VehicleData";
          this.errorLogDetails.MethodName = "SaveVehicleRegData";
          this.errorLogDetails.ErrorCode = "0";
          this.errorLogDetails.ErrorDesc = "Something went wrong.Try again later.";
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              //console.log(res);
            });
          this._errorHandleService.handleError(err);
        }
      )
    );
  }

  onSubmitNewPolicyPayment() {
    this.yearChanged = false;
    this.onSubmitPastPolicy();
  }

  runQuotationRequest() {
    
    this.showLoader = true;

    // let currentYear = 2012; // for testing purpose
    let currentYear = +convertToMydate(
      this.vehicleDetailForm.get("regDate")!.value
    ).split("/")[2];
    let regYearObject = this.regYearList.find(
      (yearObj) => +yearObj.RegistrationYearDesc === currentYear
    );
    
    let quotationReq ={
      ApplicationNo : this.postData.ApplicationNo,
      ApplicationNoOdp :  this.postData.ApplicationNoOdp,
      RegistrationDate : convertToDateFormat(this.vehicleDetailForm.get("regDate")!.value),
    }

    // let quotationRequest = {
    //   ...this.initialQuotationRequest,
    //   // VehicleRegistrationYrCode: regYearObject.RegistrationYearCode,
    //   // VehicleRegistrationYrDesc: regYearObject.RegistrationYearDesc,
    //   RegistrationDate : (this.vehicleDetailForm.get("regDate").value),
    //   // IDVAmount : this.initialQuotationRequest["PreviousPolicyTypeCode"] == 3 || 5 ? "0" : this.PlanData.IDVVAlue,
    //   // IDVValue :"0",
    //   PolicyTenure: this.PlanData.tenure, //this.postData["tenure"],
    //   PreviousPolicyExpiryDate: convertToMydate(
    //     this.pastPolicyForm.get("prvPolicyExpDate").value
    //   ),
    // };
    console.log("registration date ",quotationReq)
    this._subscriptions.push(
      this.posHomeService
        .saveQuatesAfterDateChange(quotationReq)
        .pipe(
          mergeMap((res: ApiResponse) => {
            console.log({ res });
            // this.postData.ApplicationNo = res.data[0]["ApplicationNo"];
            // this.postData.ApplicationNoOdp = res.data[0]["ApplicationNoOdp"];
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
                  const companyUrlsArray: IHealthInsPlanUrlsResponse[] =
                    apiurlData.data;
                  const companyApiUrlData: any = companyUrlsArray.find(
                    (urlData: any) =>
                      +urlData["CompanyCode"] ===
                      +this.premiumDataPlans["CompanyCode"]
                  );

                  const filterdata = {
                    PartnerId: companyApiUrlData.Partnerid,
                    ProductCode: companyApiUrlData.ProductCode,
                    ApplicationNo: companyApiUrlData.ApplicationNo,
                    ApplicationNoOdp: companyApiUrlData.ApplicationNoOdp,
                    APIBaseUrl: companyApiUrlData.APIBaseUrl,
                    APIMethod: companyApiUrlData.APIMethod,
                    PolicyTenure: this.premiumDataPlans["tenure"],
                    IDVValue: this.PlanData.IDVVAlue,
                    // IDVValue : (this.PlanData.isOdOnly ) && (this.PlanData.CompanyCode == "4") ? "0" : this.PlanData.IDVVAlue,
                      //  IDValue : "0",
                    PreviousNCB: this.initialQuotationRequest.PreviousNCB,
                    CurrentNCB: this.initialQuotationRequest.CurrentNCB,
                  };

                  return this._vehicleBuyPlanService.getInsuranceCompanyPlan(
                    filterdata
                  );
                  // .pipe(
                  //   tap((result: ApiResponse) =>
                  //     console.log("companyResult", result)
                  //   )
                  // );
                })
              );
          })
        )
        .subscribe(
          (result: ApiResponse) => {
            this.showLoader = false;
            if (!result || result.successcode == "0" || result.msg == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
              this.errorLogDetails.CompanyName = this.PlanData.ProductName;
              this.errorLogDetails.ControllerName = "VehicleData";
              this.errorLogDetails.MethodName = "GetBikeQuotationUrl";
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
            console.log(result);
            // this.IdvAmtforIffco =  result.data.IDVVAlue;
            
             
            // console.log(this.IdvAmtforIffco);
            
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
    let ncb = result.data.CoverageList.find(
      (x: { CoverageCode: string; }) => x.CoverageCode === "No Claim Bonus"
    );

    let idvODPremium = idvBasic ? +idvBasic.ODPremium : 0;
    let idvTPPremium = idvBasic ? +idvBasic.TPPremium : 0;
    let ncbODPremium = ncb ? +ncb.ODPremium : 0;
    let discountAmount =
      result.data && result.data.DiscountAmt
        ? +result.data.DiscountAmt.replace(/-/g || /--/, "")
        : 0;

    if (this.premiumDataPlans["isComprehensive"]) {
      result.data.Premium =
        idvODPremium + idvTPPremium - discountAmount + ncbODPremium;
    }
    if (this.premiumDataPlans["isTp"]) result.data.Premium = idvTPPremium;
    if (this.premiumDataPlans["isOdOnly"]) {
      result.data.Premium = idvODPremium - discountAmount + ncbODPremium;
    }

    this.yearChanged = false;
    this.saveNewSessionData(result.data);
  }

  addAddonsValue(plan: IPlansMotor) {
    
    if (this.premiumDataPlans["zeroDp"]) {
      let zeroDepCover = plan.CoverageList.find(
        (coverage) => +coverage.CoverageID === 1
      );
      if (zeroDepCover)
        plan.Premium += +zeroDepCover.ODPremium + +zeroDepCover.TPPremium;
    }
    if (this.premiumDataPlans["pacover"]) {
      let paCover = plan.CoverageList.find(
        (coverage) => +coverage.CoverageID === 16
      );
      if (paCover) plan.Premium += +paCover.ODPremium + +paCover.TPPremium;
    }

    return Math.round(plan.Premium);
  }

  // this is for premium breakup updation and saving new session data to show in review page
  saveNewSessionData(item: IPlansMotor | any) {
    const premiumWithoutGst = this.addAddonsValue(item);
    const gstAmount = premiumWithoutGst * 0.18;
    this.newPremium = Math.round(premiumWithoutGst + gstAmount); // premium including GST

    let idvBasic = item.CoverageList.find(
      (x: any) => x.CoverageCode === "IDV Basic"
    );
    let NCB = item.CoverageList.find(
      (x: any) => x.CoverageCode === "No Claim Bonus"
    );
    let TPPD = item.CoverageList.find((x: any) => x.CoverageCode === "TPPD");
    let PAOwner = item.CoverageList.find((x: any) => x.CoverageID == 16);
    let DepWaiver = item.CoverageList.find((x: any) => x.CoverageID == 1);

    
    let data = { ...this.premiumDataPlans };

    data["CoverageList"] = item.CoverageList;
    data["PremiumWithGst"] = +premiumWithoutGst;
    data["selectedAddons"] = item.CoverageList;
    data["IDVVAlue"] = item.IDVVAlue;
    data["MaxIDVVAlue"] = item.MaxIDVVAlue;
    data["MinIDVVAlue"] = item.MinIDVVAlue;
    data["GST"] = gstAmount;
    data["AmountPayableIncludingGST"] = this.newPremium;
    data["Premium"] = +premiumWithoutGst;
    data["IdvBasic"] = idvBasic;
    data["NCB"] = NCB;
    data["PAOwner"] = PAOwner;
    data["TPPD"] = TPPD;
    data["DepWaiver"] = DepWaiver;
    data["policyNumber"] = item["policyNumber"];
    data["DiscountAmt"] = item["DiscountAmt"].replace(/--/g, "-");
    if (this.premiumDataPlans["isTp"]) {
      data["CoverageList"] = item.CoverageList.filter(
        (x: any) => x.CoverageID != 20
      );
    }
    this.premiumDataPlans = JSON.parse(JSON.stringify(data));
    const sesDataSet = {
      rto: this.sessionData["rto"],
      vehicleDesc: this.sessionData["vehicleDesc"],
      premiumDataPlans: this.premiumDataPlans,
      // premiumDataPlansforOriental : this.premiumDataPlansforOriental
    };
    sessionStorage.setItem("Data", JSON.stringify(sesDataSet));

    // companyDetails =  JSON.parse(JSON.stringify(companyDetails));
    // sessionStorage.setItem("popupData", JSON.stringify(data));
  }

  public onSubmitVehicleInfo(): any{
    
    this.errMsg_vd = "";
    if (this.vehicleDetailForm.invalid) {
      this.errMsg_vd = "Please fill all details correctly.";
      return false;
    }

    if (this.isNewPolicy || this.isPrvPolicyRemember ==0) {
      this.isCompleted_pp = true;
      this.onSubmitPastPolicy();
    } else {
      // if (this.PlanData.CompanyCode != "11") {
      //   this.pastPolicyForm.patchValue({
      //     prvPolicyStartDate: this.vehicleDetailForm.value.regDate,
      //   });
      // }
      
      this.isCompleted_vd = true;
      setTimeout(() => {
        this.tabIndex++;
      }, 100);
    }

    // if (this.validateVehicle()) {
    // setTimeout(() => {
    //   this.tabIndex++;
    // }, 100);

    // let rv = new ApplicationVehicleRegData();
    // rv.ApplicationNo = this.postData.ApplicationNo;
    // rv.ApplicationNoOdp = this.postData.ApplicationNoOdp;
    // const owner = this.ownerInfoForm.value;
    // const add = this.addressForm.value;
    // const pp = this.pastPolicyForm.value;
    // const v = this.vehicleDetailForm.value;
    // // vehicle owner info
    // rv.VechileOwnerName = owner.ownerName;
    // if (owner.gender) {
    //     rv.GenderCode = owner.gender.split(',')[0];
    //     rv.GenderCodeDesc = owner.gender.split(',')[1];
    // }
    // rv.DOB = convertToMydate(owner.dob);
    // rv.MobileNo = owner.mobileNo;
    // rv.EmailID = owner.emailId;
    // // rv.NomineeAge = owner.nomineeAge;
    // rv.NomineeDOB = convertToMydate(owner.nomineeAge);
    // rv.NomineeName = owner.nomineeName;
    // if (owner.nomineeRelation) {
    //     rv.RelationshipCode = owner.nomineeRelation.split(',')[0];
    //     rv.RelationshipDesc = owner.nomineeRelation.split(',')[1];
    // }
    // //communication address
    // rv.PINCode = add.pincode;
    // rv.PostalAdd = add.postalAdd;
    // rv.Area = add.addArea;
    // if (add.state) {
    //     rv.StateCode = add.state.split(',')[0];
    //     rv.StateDesc = add.state.split(',')[1];
    // }
    // if (add.city) {
    //     rv.CityCode = add.city.split(',')[0];
    //     rv.CityDesc = add.city.split(',')[1];
    // }

    // // past policy info
    // if (!this.isNewPolicy) {
    //     rv.PreviousPolicyStartDate = convertToMydate(pp.prvPolicyStartDate);
    //     rv.PreviousPolicyExpDate = convertToMydate(pp.prvPolicyExpDate);
    //     if (pp.prvPolicyInsurer) {
    //         rv.PreviousPolicyInsurerCode = pp.prvPolicyInsurer.split(',')[0];
    //         rv.PreviousPolicyInsurerDesc = pp.prvPolicyInsurer.split(',')[1];
    //     }
    //     rv.PreviousPolicyNo = pp.prvPolicyNo;
    //     // rv.ClaimInPastYearCode = pp.claimInPrvYear;
    //     // console.log("pp.claimInPrvYear", pp.claimInPrvYear);
    //     // if (rv.ClaimInPastYearCode == EYesNo.YES) {
    //     //     rv.ClaimInPastYearDesc = EYesNo[EYesNo.YES];
    //     // if (!this.PlanData.isTp) {
    //     //     rv.PreviousNCBCode = pp.ncb.split(',')[0];
    //     //     rv.PreviousNCBDesc = pp.ncb.split(',')[1];
    //     // } else {
    //     //     rv.PreviousNCBCode = 0;
    //     //     rv.PreviousNCBDesc = "0";
    //     // }
    //     // }
    // }
    // // else {
    // //     rv.ClaimInPastYearDesc = EYesNo[EYesNo.NO];
    // //     rv.PreviousNCBCode = 0;
    // //     rv.PreviousNCBDesc = '';
    // // }
    // // vehicle details
    // rv.VechileRegNo = v.regNo.replace(/-/g, "");
    // rv.VechileRegDate = convertToMydate(v.regDate);
    // rv.VechileEngineNo = v.engineNo;
    // rv.VechileChassisNo = v.chassisNo;
    // rv.MortgageInd = v.onMortgage;
    // if (rv.MortgageInd) {
    //     rv.MortgageIndDesc = EYesNo[EYesNo.YES];
    //     rv.MortgageLBankName = v.bankName;
    //     rv.MortgageBankAddress = v.bankAddress
    // } else {
    //     rv.MortgageIndDesc = EYesNo[EYesNo.NO];
    //     rv.MortgageLBankName = '';
    //     rv.MortgageBankAddress = '';
    // }

    // // Add values in this parameters

    // // both
    // rv.InsuranceCompCode = this.PlanData.CompanyCode
    // rv.InsuranceCompDesc = this.PlanData.ProductName
    // rv.IDVAmount = this.PlanData.IDVVAlue
    // // renew
    // rv.InsurancePolicyCode = 0
    // rv.InsurancePolicyDesc = ""
    // // both
    // rv.ZeroDepreciationCode = this.PlanData.zeroDp ? 1 : 0
    // rv.ZeroDepreciationDesc = this.PlanData.zeroDp
    // rv.PolicyTenure = this.PlanData.tenure
    // rv.PersonalAccidentCoverInd = this.PlanData.pacover ? 1 : 0
    // rv.PersonalAccidentCoverDesc = this.PlanData.pacover
    // // 0 = Comprehensive, 1 = ThirdParty, 2 = isOdOnly
    // // this.PlanData.isComprehensive ? 0 ? 2 : 0 : 1
    // if (this.PlanData.isComprehensive) {
    //     rv.ComprehensiveThirdPartyCode = 0
    //     rv.ComprehensiveThirdPartyDesc = "COMPREHENSIVE"
    // }
    // if (this.PlanData.isTp) {
    //     rv.ComprehensiveThirdPartyCode = 1
    //     rv.ComprehensiveThirdPartyDesc = "TP"
    // }
    // if (this.PlanData.isOdOnly) {
    //     rv.ThirdPartyPolicyInceptionDate = convertToMydate(pp.thirdPartyPolicyIncepDate)
    //     rv.ThirdPartyPolicyExpiryDate = convertToMydate(pp.thirdPartyPolicyExpDate)
    //     rv.ComprehensiveThirdPartyCode = 2
    //     rv.ComprehensiveThirdPartyDesc = "ODONLY"
    // }
    // rv.PolicyPremiumAmount = this.PlanData.Premium
    // // need to pass 0 for now
    // rv.CGSTPolicyPremiumAmount = 0
    // rv.SGSTPolicyPremiumAmount = 0
    // rv.IGSTPolicyPremiumAmount = 0
    // rv.TotalGSTPremiumAmount = 0
    // rv.PolicyPremiumGSTRate = 0
    // rv.GSTApplicableCode = 0
    // rv.GSTApplicableDesc = ""
    // rv.OwnerGSTNo = 0
    // rv.PoicyTotalAmount = 0
    // rv.CoverageList = [];

    // // this.sessionData.CoverageList.push(this.sessionData.premiumDataPlans.CoverageList[0])
    // let idvBasic = this.sessionData.premiumDataPlans.CoverageList.find(x => x.CoverageCode == "IDV Basic");
    // rv.CoverageList.push(idvBasic)
    // if (this.sessionData.pacover) {
    //     let paCover = this.sessionData.premiumDataPlans.CoverageList.find(x => x.CoverageCode == "PA Owner / Driver");
    //     console.log("paCover", paCover);
    //     rv.CoverageList.push(paCover)
    // }
    // if (this.sessionData.zeroDp) {
    //     let depWaiver = this.sessionData.premiumDataPlans.CoverageList.find(x => x.CoverageCode == "Depreciation Waiver");
    //     rv.CoverageList.push(depWaiver)
    // }
    // let NCB = this.sessionData.premiumDataPlans.CoverageList.find(x => x.CoverageCode == "No Claim Bonus");
    // if (NCB != undefined) {
    //     rv.CoverageList.push(NCB)
    // }
    // // renew
    // // rv.PreviousPolicyExpDate = "09/10/2020"
    // // rv.PreviousPolicyInsurerCode = 0
    // // rv.PreviousPolicyInsurerDesc = ""
    // // rv.PreviousPolicyNo = pp.prvPolicyNo
    // // rv.ClaimInPastYearCode = pp.claimInPrvYear

    // console.log(rv)
    // // return false;
    // this.postData = rv;
    // console.log("this.postData", JSON.stringify(this.postData));
    // this._vehicleBuyPlanService.savePraposal(this.postData).subscribe((result) => {
    //     if (result.successcode == '1') {
    //         this.showLoader = false;
    //         // this._errorHandleService._toastService.success('Praposal form submitted successfully.', result.msg);
    //         console.log("Result ==> ", result)
    //         this.isreview = true;
    //         this.reviewData = rv;
    //         this.reviewData['Data'] = result.data[0];
    //     } else {
    //         this._errorHandleService._toastService.warning(result.msg, result.successcode);
    //     }
    // },
    //     (err: any) => {
    //         // this.showLoader = false;
    //         this._errorHandleService.handleError(err);
    //     }
    // );
    // }
  }

  // private validateOwnerInfo(): boolean {
  //   const dob = this.ownerInfoForm.get("dob").value;
  //   const toDate = moment();
  //   if (Math.abs(toDate.diff(dob, "years")) < 18) {
  //     this.errMsg_oi = "Owner age should be greater than 18 years.";
  //     return false;
  //   } else {
  //     const nomineeage = this.ownerInfoForm.get("nomineeAge").value;
  //     const nage = Math.abs(toDate.diff(nomineeage, "years"));
  //     const rel = this.ownerInfoForm.get("nomineeRelation").value
  //       ? this.ownerInfoForm.get("nomineeRelation").value.split(",")[0]
  //       : 0;
  //     const ownerAge = Math.abs(toDate.diff(dob, "years"));
  //     if (rel == Relation.Son || rel == Relation.Daughter) {
  //       if (nage - ownerAge < 18) {
  //         this.errMsg_oi =
  //           "Parent age should be more than 18 years from Owner.";
  //         return false;
  //       }
  //     }
  //     if (rel == Relation.Father || rel == Relation.Mother) {
  //       if (ownerAge - nage < 18) {
  //         this.errMsg_oi =
  //           "Owner age should be more than 18 years from children.";
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // }
  // private validateOwnerInfo(): boolean {
  //   const dob = this.ownerInfoForm.get("dob")!.value;
  //   const toDate = moment();
  //   if (Math.abs(toDate.diff(dob, "years")) < 18) {
  //     this.errMsg_oi = "Owner age should be greater than 18 years.";
  //     return false;
  //   } else {
  //     const nomineeage = this.ownerInfoForm.get("nomineeAge")!.value;
  //     const nage = Math.abs(toDate.diff(nomineeage, "years"));
  //     const rel = this.ownerInfoForm.get("nomineeRelation")!.value
  //       ? this.ownerInfoForm.get("nomineeRelation")!.value.split(",")[0]
  //       : 0;
  //     const ownerAge = Math.abs(toDate.diff(dob, "years"));
  //     if (rel == Relation.Son || rel == Relation.Daughter) {
  //       if (nage - ownerAge < 18) {
  //         this.errMsg_oi =
  //           "Parent age should be more than 18 years from Owner.";
  //         return false;
  //       }
  //     }
  //     if (rel == Relation.Father || rel == Relation.Mother) {
  //       if (ownerAge - nage < 18) {
  //         this.errMsg_oi =
  //           "Owner age should be more than 18 years from children.";
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // }

  onSelectNomineeRelation() {
    this.ownerInfoForm.get("nomineeAge")?.reset();
  }

  isDisable(str: any): boolean {
    let x = this.ownerInfoForm.get(`${str}`)
    if (x?.value) {
      return false;
    }
    return true;
  }


  onDobChange() {
    this.validateOwnerInfoAsync(this.ownerInfoForm.get("nomineeAge")!)
    this.ownerInfoForm.get("nomineeAge")?.updateValueAndValidity();
  }

  validateOwnerInfoAsync = async (control: AbstractControl): Promise<ValidationErrors | null> => {
    debugger;

    if (this.ownerInfoForm) {
      const dob = this.ownerInfoForm.get("dob")!.value;
      const toDate = moment();
      if (Math.abs(toDate.diff(dob, "years")) < 18) {
        // this.errMsg_oi = "Owner age should be greater than 18 years.";
        return { nommineeAgeMsg: "Owner age should be greater than 18 years." };
      } else {
        const nomineeage = this.ownerInfoForm.get("nomineeAge")!.value;
        const nage = Math.abs(toDate.diff(nomineeage, "years"));
        const rel = this.ownerInfoForm.get("nomineeRelation")!.value
          ? this.ownerInfoForm.get("nomineeRelation")!.value.split(",")[0]
          : 0;
        const ownerAge = Math.abs(toDate.diff(dob, "years"));
        if (rel === 0) {
          // return false;
          return { nommineeAgeMsg: "Please select the relationship with the nominee first." };
        }
        if (rel == Relation.Son || rel == Relation.Daughter) {
          if (nage - ownerAge < 18) {
            // this.errMsg_oi =
            //   "Parent age should be more than 18 years from Owner.";
            // return false;
            return { nommineeAgeMsg: "Parent age should be more than 18 years from Owner." };

          }
        }
        if (rel == Relation.Father || rel == Relation.Mother) {
          if (ownerAge - nage < 18) {
            // this.errMsg_oi =
            //   "Owner age should be more than 18 years from children.";
            return { nommineeAgeMsg: "Owner age should be more than 18 years from children." };
          }
        }
      }
    }
    return null;
  }
  // private validatePastPolicy(): boolean {
  //     if (this.pastPolicyForm.controls['claimInPrvYear'].value == EYesNo.NO && this.pastPolicyForm.controls['ncb'].value == null) {
  //         this.errMsg_pp = 'Please select no claim bonus(NCB).';
  //         return false;
  //     }
  //     return true;
  // }
  private validateVehicle(): boolean {
    if (
      this.vehicleDetailForm.get("onMortgage")!.value == EYesNo.YES &&
      (!this.vehicleDetailForm.get("bankName")!.value ||
        !this.vehicleDetailForm.get("bankAddress")!.value)
    ) {
      this.errMsg_vd = "Please fill mortgage bank details.";
      return false;
    }
    return true;
  }
  //#endregion

  takeScreenShot() {
    this.captureScreen();
  }

  async captureScreen() {
    
    try {
      const capturePromise: any = this.screenCaptureService.getImage(
        this.screen.nativeElement,
        true
      );
      let imgString:any = await capturePromise;
      // console.log(imgString);
      let postData: any = { ...this.postData };
      postData["screenshot"] = imgString;
      this.postData = postData;
    } catch (err) {
      console.log({ err });
    }
  }

  get af() {
    return this.addressForm;
  }
  get pf() {
    return this.pastPolicyForm;
  }
  get bf() {
    return this.vehicleDetailForm;
  }

  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

export const regDateValidationForTATA = (
  control: AbstractControl
): ValidationErrors |null=> {
  // console.log(control.value);

  // let regYear = new Date(control.value).getFullYear();
  // let currentYear = new Date().getFullYear();

  // if (currentYear - regYear >= 9) return { yearError: true };
  // return null;

  let regDate = new Date(control.value);
  let monthDiff =
    new Date().getMonth() -
    regDate.getMonth() +
    12 * (new Date().getFullYear() - regDate.getFullYear());

  if (monthDiff >= 117) return { dateError: true }; // Dont allow reg date older than 9 years and 9 months
  return null;
};

export const regDateCheckBefore2018ForTATA = (
  control: AbstractControl
): ValidationErrors |null=> {
  
  // console.log(control.value);

  let regDate = new Date(control.value);
  let dateToBeCheckedAgainst = new Date("2018-09-01");

  //match the hours of material moment date and javascript native date object
  dateToBeCheckedAgainst.setHours(0, 0, 0, 0);
  // console.log({ dateToBeCheckedAgainst });

  if (regDate < dateToBeCheckedAgainst) {
    // console.log("error");
    return { dateErrorSept2018: true }; // Dont allow reg date older than 1st sept 2018(od only)
  }
  return null;
};

export const pastpolicyExDateValidationForTATA = (
  pastPolicyExDate: Date
): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors|null => {
    let regDate = new Date(control.value);
    let monthDiff =
      pastPolicyExDate.getMonth() -
      regDate.getMonth() +
      12 * (pastPolicyExDate.getFullYear() - regDate.getFullYear());

    if (monthDiff <= 9){ return { postPolicyDateError: true };}else{
      return null
    }
  };
};




export const thirdPartyDateValidator = (
  control: AbstractControl
): ValidationErrors |null=> {
  // console.log(control);

  let tpInceptionDate = control.get("thirdPartyPolicyIncepDate")!.value;
  let tpExpiryDate = control.get("thirdPartyPolicyExpDate")!.value;
  let odExpiryDate = control.get("prvPolicyExpDate")!.value;
  const e = new Date(new Date(tpExpiryDate).getFullYear(), new Date(tpExpiryDate).getMonth(), new Date(tpExpiryDate).getDate());
  const i = new Date(new Date(tpInceptionDate).getFullYear(), new Date(tpInceptionDate).getMonth(), new Date(tpInceptionDate).getDate());

 let dateDiff=getAge(i,e)
// console.log(dateDiff);

  if (odExpiryDate >= tpExpiryDate) return { expiryDateError: true };
  // if (tpInceptionDate >= tpExpiryDate) return { expiryDateError: true };
  // if (
  //   +new Date(tpExpiryDate).getFullYear() -
  //     +new Date(tpInceptionDate).getFullYear() !==
  //   1
  // )
  //   return { thirdPartyEndDateError: true };
 
      // console.log(+e - +i,e,+i,e.valueOf(),i);
  // const diffTime = Math.abs(+e - +i);
  // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60  * 24 )); 
  // console.log(diffDays);
  // const t = new Date();


  if (dateDiff !=5) 
    return { thirdPartyEndDateError: true };

  return null;
};


function getAge(tpStart: any,tpEnd:any) {
  
  var start = new Date(tpStart);
  var end = new Date(tpEnd);
  var age = end.getFullYear() - start.getFullYear() ;
  var m = end.getMonth() - start.getMonth();
  // console.log(start, end, age, m);

  if (m < 0 || (m !== 0 || (start.getDate()-1 !== end.getDate()))) {
    if(age!=6){
      age--;
    }
  }
  return age;
}


export function RequireMatch(stateList: IState[]) {
  return (control: AbstractControl) => {
    
    const typedState: any = control.value;
    let stateFound = stateList.find((state) => state.StateDesc === typedState);

    if (typedState && !stateFound) return { requireMatch: true };
    else return null;
  };
}
export function RequireMatchCity(cityList: ICity[]) {
  return (control: AbstractControl) => {
    
    const typedCity: any = control.value;
    let cityFound = cityList.find((state) => state.CityDesc === typedCity);

    if (typedCity && !cityFound) return { requireMatch: true };
    else return null;
  };
}
export function RequireMatchPincode(pincode: IPincode[]) {
  return (control: AbstractControl) => {
    
    const typedValue: any = control.value;
    if (control.value === null || pincode === null) return { requireMatch: false };
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

export function RequireMatchMortageBankName(
  filterMortgageBankList: any,CompanyCode: string
) {
  // return (control: AbstractControl) => {
  //   
  //   const typedValue: string = control.value.trim();


  //   let companyFound = filterMortgageBankList.find(
  //     (company) => company.MortgageLBankName.trim() == typedValue
  //   );

  //   console.log(control.value, companyFound, typedValue, filterMortgageBankList);


  //   if (typedValue && !companyFound) return { requireMatch: true };
  //   else return null;
  // };

  return (control: AbstractControl) => {
    
    if (CompanyCode == '13' || CompanyCode == '12') {
      return null;
    }
    const typedBank: any = control.value;

    let BankFound = filterMortgageBankList.find((bank: { MortgageLBankName: any; }) => bank.MortgageLBankName === typedBank);
    console.log(BankFound);

    if (typedBank && !BankFound) return { requireMatch: true };
    else return null;
  };
}

export const regDateValidationForAllOd = (
  control: AbstractControl
): ValidationErrors|null => {
  
  // console.log(control.value);
  let regDate = new Date(control.value);
  let dateToBeCheckedAgainst = new Date("2018-09-01");

  //match the hours of material moment date and javascript native date object
  dateToBeCheckedAgainst.setHours(0, 0, 0, 0);
  // console.log({ dateToBeCheckedAgainst });

  if (regDate >= dateToBeCheckedAgainst) {
    // console.log("error");
    // console.log('hi') // Dont allow reg date older than 1st sept 2018(od only)
    let monthDiff =
    new Date().getMonth() -
    regDate.getMonth() +
    12 * (new Date().getFullYear() - regDate.getFullYear());
    // console.log(monthDiff);
    if (monthDiff > 60){ return { OdError: true }; }else{return null}
    
  }else return {dateErrorSept2018: true }
  
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
): ValidationErrors|null => {
  
  // console.log(control.value);
  let regDate = new Date(control.value);
  let dateToBeCheckedAgainst = new Date("2018-09-01");

  //match the hours of material moment date and javascript native date object
  dateToBeCheckedAgainst.setHours(0, 0, 0, 0);
  // console.log({ dateToBeCheckedAgainst });

  if (regDate >= dateToBeCheckedAgainst) {
    // console.log("error");
    // console.log('hi') // Dont allow reg date older than 1st sept 2018(od only)
    let monthDiff =
    new Date().getMonth() -
    regDate.getMonth() +
    12 * (new Date().getFullYear() - regDate.getFullYear());
    // console.log(monthDiff);
    if (monthDiff <= 60) {return { CompError: true }; 
  }else{
      return null
    }
    
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

// <Previous Policy Expiry Date>
// let dateString = data.PreviousPolicyExpiryDate;
//                 let dataSplit = dateString.split("/");
//                 let dateConverted;
               
//                 if (dataSplit[2].split(" ").length > 1) {
//                   let hora = dataSplit[2].split(" ")[1].split(":");
//                   dataSplit[2] = dataSplit[2].split(" ")[0];
//                   dateConverted = new Date(
//                     +dataSplit[2],
//                     +dataSplit[1] - 1,
//                     +dataSplit[0],
//                     +hora[0],
//                     +hora[1]
//                   );
                  
                   
//                 } else {
//                   dateConverted = new Date(
//                     +dataSplit[2],
//                     +dataSplit[1] - 1,
//                     +dataSplit[0]
//                   );
                 
//                 }
//                 if(this.PlanData.CompanyCode == '11'){
//                   let dateCov;
//                   if (dataSplit[2].split(" ").length > 1) {
//                     let hora = dataSplit[2].split(" ")[1].split(":");
//                     dataSplit[2] = dataSplit[2].split(" ")[0];
                   
//                     dateCov = new Date(
//                       +dataSplit[2] - 1,
//                       +dataSplit[1] - 1,
//                       +dataSplit[0] + 1,
//                       +hora[0],
//                       +hora[1]
//                     );
                     
//                   } else {
                    
//                     dateCov =new Date(
//                       +dataSplit[2] - 1,
//                       +dataSplit[1] - 1,
//                       +dataSplit[0] + 1
//                     );
//                   }
//                   console.log(dateCov);
//                   this.pastPolicyForm.patchValue({
//                     prvPolicyStartDate:dateCov,
//                   });
//                 }
//                console.log(dateConverted);
              
//                 this.pastPolicyForm.patchValue({
//                   prvPolicyExpDate: dateConverted,
//                 });




// <mat-step[completed]="isCompleted_ckycInfo" >
//   <div class="row mt-2" >
//     <div class="col-md-12 col-12" >
//       <!-- < label > User have CKYC Number ? </label> &nbsp; -->
//         < !-- < mat - radio - group aria - label="Select an option"
//           (change) = "onChangeCKYCYesNO(ckycYesNoCode,this.step);onClickBackAndNextCkyc(ckycYesNoCode,step, 'next')" >
//           <mat-radio - button name = "ckycYesNo"[value] = "ckycYesNoCode===1"[checked] = "1" >
//             CKYC
//             < /mat-radio-button>
//             < mat - radio - button name = "ckycYesNo"[value] = "ckycYesNoCode===0" >
//               PAN
//               < /mat-radio-button>
//               < mat - radio - button name = "ckycYesNo"[value] = "ckycYesNoCode===0" >
//                 DOC no.
//                                             < /mat-radio-button>
//                   < /mat-radio-group> -->

//                   < !-- < mat - radio - group aria - label="Select an option"(change) = "onChangeCKYCYesNO(ckycYesNoCode,this.step)"
//                   [(ngModel)] = "ckycYesNoCode" >
//                     <mat-radio - button name = "ckycYesNo"[value] = "+i.value " * ngFor="let i of yesNoList"
//                     [checked] = " +i.value==+ckycYesNoCode" >
//                       {{ i.viewValue }}
// </mat-radio-button>
//   < /mat-radio-group> -->

//   < mat - radio - group aria - label="Select an option"(change) = "onSelectStep($event)" >
//     <div class="row" >
//       <div class="col-md-4" >
//         <mat-radio - button name = "ckycYesNo" value = "CKYC"
// checked > <!--onChangeCKYCYesNO(ckycYesNoCode, this.step); -->
//   Search CKYC using CKYC Number.
//                                                     < /mat-radio-button>
//     < /div>
//     < div class="col-md-4" >
//       <mat-radio - button name = "ckycYesNo" value = "PAN" >
//         Search CKYC using PAN Number.
//                                                     < /mat-radio-button>
//           < /div>
//           < div class="col-md-4" >
//             <mat-radio - button[disabled]="isPOIStatusFound" name = "ckycYesNo"
// value = "DOC" >
//   Search CKYC using Document Number.
//                                                     < /mat-radio-button>
//     < /div>
//     < /div>



//     < /mat-radio-group>

//     < !-- < input type = "button" * ngIf="this.ckycYesNoCode==0 "(click) = "onClickBackAndNextCkyc(0,step, 'next')"
// class="w--button w--button--orange w--button--large marR10" value = "Next" autocomplete = "off" /> -->
//   </div>

//   < /div>
//   < form[formGroup]="ckycDetailForm" #oiForm = "ngForm"(ngSubmit) = "onSubmitCKYCInfo()" >
//     <ng-template matStepLabel > CKYC Details < /ng-template>
//       < div class="row pt-4" >
//         <div class="card" style = " 
// align - items: center;
// width: 100 %;
// padding: 6px;
// font - size: 15px;
// ">
//   < span * ngIf="ckycYesNoCode==1" > CKYC < /span>
//     < span
//     * ngIf="ckycYesNoCode==0 && this.successPanNo!==false &&this.successDocNo===false" > POI(Proof
//                                                 of Identity) < /span>
//       < span
//       * ngIf="ckycYesNoCode==0 &&this.successPanNo===false &&this.successDocNo==false" > POA(Proof
//                                                 of Address) < /span>
//         < /div>
//         < div class="col-md-12 select-gender" >

//           <div class="row" >
//             <div class="col-md-6" >
//               <mat-form - field appearance = "outline" >
//                 <mat-label > Date of birth < /mat-label>
//                   < input matInput[matDatepicker] = "dp6"(click) = "dp6.open()"
// formControlName = "DOB" required[placeholder] = "date"
// [max] = "getMinDate(18)"[min] = "getMinDate(99)"
// [maxlength] = "10" autocomplete = "off" />
//   <mat-datepicker - toggle matSuffix[for]="dp6" >
//     </mat-datepicker-toggle>
//     < mat - datepicker #dp6 disabled = "false" > </mat-datepicker>
//       < /mat-form-field>
//       < /div>
//       < div class="col-md-6" * ngIf="this.ckycYesNoCode==1" >
//         <mat-form - field appearance = "outline" >
//           <mat-label > CKYC NO < /mat-label>
//             < input matInput placeholder = "CKYC NO" appOnlyNumbers
//             [maxLength] = "14" formControlName = "ckycNo" required
// autocomplete = "off" />
//   </mat-form-field>
//   < /div>
//   < ng - container * ngIf="this.ckycYesNoCode==0 " >
//     <div class="col-md-6"
//       * ngIf="this.successPanNo!==false &&this.successDocNo===false" >
//         <!--this.successPanNo !== false-- >
//         <mat-form - field appearance = "outline" >
//           <mat-label > PAN NO < /mat-label>
//             < input matInput appUppercase placeholder = "PAN NO"
// formControlName = "panNo"[textMask] = "this.PANMask"
// autocomplete = "off" />
//   </mat-form-field>
//   < /div>
//   < div class="col-md-6"
//     * ngIf="this.successPanNo===false &&this.successDocNo==false" >
//       <!--this.successPanNo == false && this.successDocNo === false-- >
//       <!--* ngIf="this.successPanNo===false " && this.successDocNo === false-- >
//         <mat-form - field appearance = "outline" >
//           <mat-label > Choose one < /mat-label>
//             < mat - select formControlName = "doctype"
//               (selectionChange) = "onSelectDocument($event)" >
//               <mat-option value = "" > Select Doc Type.< /mat-option>
//                 < mat - option[value]="doc"
//                   * ngFor="let doc of  this.bajajCkycDocList" > {{ doc?.DocDesc }}</mat-option>
//                     < /mat-select>

//                     < mat - error
//                     * ngIf="ckycDetailForm.controls?.doctype?.hasError('required')" >
//                       You must make a
// selection < /mat-error>
//   < mat - error
//   * ngIf="ckycDetailForm.controls?.doctype?.hasError('pattern') && !ckycDetailForm.controls?.doctype?.hasError('required')" >
//     Your selection is invalid
//       < /mat-error>
//       < /mat-form-field>
//       < /div>
//       < div class="col-md-6"
//         * ngIf="this.successPanNo===false &&this.successDocNo==false" >
//           <!--!ckycDetailForm?.get('doctype')?.value-- >
//             <!--this.successPanNo == false && this.successDocNo === false-- >
//             <mat-form - field appearance = "outline" >
//               <mat-label > {{
//                 ckycDetailForm?.get('doctype')?.value ?
//                 ckycDetailForm?.get('doctype')?.value?.DocDesc : "Select
//                                                                 Document Type"}} </mat-label>
//     < input matInput appUppercase
//     [readonly] = " ckycDetailForm?.get('doctype')?.value?false:true"
//   placeholder = "{{ckycDetailForm?.get('doctype')?.value?.DocDesc}}"
//   formControlName = "docNo"[textMask] = "identityMask"
//   autocomplete = "off" />
//     <!-- < mat - error
//     * ngIf="ckycDetailForm?.controls?.docNo?.errors?.pattern" >
//       Please enter a valid Selected Document Number
//         < /mat-error> -->
//         < /mat-form-field>
//         < /div>
//         < div class="col-md-6"
//           * ngIf="this.successPanNo==false && this.successFileUpload===true" >
//             <!--this.successPanNo === false && this.successDocNo === false-- >
//             <mat-form - field appearance = "outline" >
//               <mat-label > Upload Selected Document < /mat-label>
//                 < input matInput type = "text" formControlName = "docData"
//                   (click) = "fileUpload.click()"[value] = "this.fileName" >
//                   <!-- < button mat - button color = "primary"(click) = "fileUpload.click()" > choose file < /button> -->
//                     < !-- < button mat - button color = "warn"(click) = "onClick()" > Upload < /button> -->
//                       < !-- < input type = "file" matInput(click) = "onClick()" name = "" id = "" > -->

//                         <input[hidden]="true" type = "file" #fileUpload
//   id = "fileUpload" name = "fileUpload" multiple = "multiple"
//     (change) = "fileProgress($event)" />

//     <mat-error
//     * ngIf="ckycDetailForm.controls?.docData?.hasError('fileExtensionError')" >
//       {{ ckycDetailForm.controls?.docData?.errors?.fileExtensionError }
// }
// </mat-error>
//   < mat - error
//   * ngIf="!ckycDetailForm.controls?.docData?.hasError('required')" >
//     {{ ckycDetailForm.controls?.docData?.errors?.required }}
// </mat-error>
//   < mat - error
//   * ngIf="ckycDetailForm.controls?.docData?.hasError('fileSizeError') " >
//     {{
//       ckycDetailForm.controls?.docData?.errors?.fileSizeError
// }}
// </mat-error>
//   < /mat-form-field>

//   < /div>
//   < /ng-container>

//   < /div>

//   < /div>

//   < /div>


//   < div class="row" >
//     <div class="col-md-6" >
//       <div class="col-md-12 text-error text-left" * ngIf="
//         (errMsg_oi && ckycDetailForm.invalid) || errMsg_oi
// ">
// { { errMsg_oi } }
// </div>
//   < /div>

//   < /div>
//   < div class="row" >
//     <!-- < div class="col-md-4 text-left" >

//       <input type="button" * ngIf="this.ckycYesNoCode==0 "
//         (click) = "onClickBackAndNextCkyc(0,step,'back')"
// class="w--button w--button--orange w--button--large marR10" value = "Back"
// autocomplete = "off" />
//   </div> -->
//   < div class="col-md-12 text-center" >

//     <button type="submit" class="w--button w--button--orange w--button--large" >
//       Validate
//       < !-- < i class="fa fa-arrow-right" aria - hidden="true" > </i> -->
//         < /button>
//         < /div>
//         < !-- < div class="col-md-4 text-right" >

//           <input type="button" * ngIf="this.ckycYesNoCode==0 "
//             (click) = "onClickBackAndNextCkyc(0,step, 'next')"
// class="w--button w--button--orange w--button--large marR10" value = "Next"
// autocomplete = "off" />
//   </div> -->
//   < /div>
//   < /form>
//   < /mat-step>