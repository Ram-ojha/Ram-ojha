import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  NgForm,
  FormControl,
  FormArray,
  AbstractControl,
} from "@angular/forms";
import { HealthBuyPlanService } from "../../../services/health-buyplan.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import {
  IFamilyMembers,
  IFamilyMemberDetails,
  IGender,
  IPlansHealth,
  IRegUrlData,
  IHealthInsPlanUrlsResponse,
} from "src/app/models/health-insu.Model";
import {
  IState,
  ICity,
  Occupation,
  IQuestionsTree,
  IPincode,
  IYesNoInd,
  errorLog,
} from "src/app/models/common.Model";
import {
  decrypt,
  convertToMydate,
  setMaxDate,
  setMinDate,
  isValidAadhaar,
  setMinDays,
  setMinDateCurent,
  setMaxDateCurent,
} from "src/app/models/common-functions";
import {
  yesNoList,
  Salutation,
  PATTERN,
  Feets,
  Inches,
  Identities,
  MASKS,
} from "src/app/models/common";
import { EMPTY, Observable } from "rxjs";
import { startWith, map, mergeMap } from "rxjs/operators";
import { EIdentity, EYesNo } from "src/app/models/insurance.enum";

@Component({
  templateUrl: "./buyplanstar.component.html",
  styleUrls: ["./buyplanstar.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class BuyplanstarComponent implements OnInit {
  // new by dilshad
  private ApplicationNo = 0;
  private ApplicationNoOdp = 0;

  showLoader = false;
  relationList: IFamilyMembers[] = [];
  praposalrelationList: IFamilyMembers[] = [];
  praposalrelationLists: any = [];
  nomineerelationList: IFamilyMembers[] = [];
  appointeList: IFamilyMembers[] = [];
  memberDetails: IFamilyMemberDetails[] = [];
  stateList: IState[] = [];
  filteredProposerStateList!: Observable<IState[]>;
  filteredStateList!: Observable<IState[]>;
  cities: ICity[] = [];
  filteredCityList!: Observable<ICity[]>;
  selectedCityList: ICity[] = [];
  genderList: IGender[] = [];
  yesNoList = yesNoList;
  salutations = Salutation;
  feets = Feets;
  inches = Inches;
  occupations: Occupation[] = [];

  proposerForm: FormGroup;
  insuredMembers: IFamilyMemberDetails[] = [];
  nomineeForm: FormGroup;
  qnaForm!: FormGroup;
  communicationAddressForm: FormGroup;
  CommonForm: FormGroup;

  errMsg = "";
  tabIndex = 0;
  companyQueTree: IQuestionsTree[] = [];
  medicalHis: any[] = [];
  Useridentity = Identities.filter((m) => m.viewValue != "GSTIN");
  pincodeList: IPincode[] = [];
  filteredPincode!: Observable<IPincode[]>;
  private plan!: IPlansHealth;
  isreview = false;
  reviewData: any;
  regUrlData: IRegUrlData = {
    RegistrationNoOdp: 0,
    ApplicationNo: 0,
    ApplicationNoOdp: 0,
    RegistrationNo: 0,
    CompanyCode: 0,
    CompanyCodeOdp: 0,
    PartnerId: 0,
    ProductCode: "",
    APIBaseUrl: "",
    APIMethod: "",
  };
  questionDataFromAPI: any[] = [];
  isCompleted = false;
  statePincodes: IPincode[] = [];
  cityPincodes: IPincode[] = [];
  NoneOfTheAbove: boolean = false;
  //maxDate = setMaxDate(0);
  maxDate = (year: number, month = 0, date = 0) =>
    setMaxDate(year, month, date);
  minDate = (year: number, month = 0, date = 0) =>
    setMinDate(year, month, date);
  setMinDays = (days = 0) => setMinDays(days);

  minDateCur = (year: number, month = 0, date = 0) =>
    setMinDateCurent(year, month, date);

  maxDateCur = (year: number, month = 0, date = 0) =>
    setMaxDateCurent(year, month, date);

  minDate1 = new Date(2020, 0, 1);
  maxDate1 = new Date(2020, 11, 31);
  currentDate = new Date();
  identityMask: any = null;
  companyData: any;
  medicalHisAns: any = [];
  SmokePremium: number = 0;
  SmokePremiumActual: number = 0;
  StopCompanyInd: number = 0;
  AppointeeDetails: boolean = false;
  WeightValidation: any;
  WeightTouchedValidation: any;
  Proposer_Insurer: boolean = false;
  Proposer_Insurer_Not_Self: boolean = false;
  ExtraLoading: number = 0;
  insuredMembersForm!: NgForm;
  OccupationCode: any;
  OccupationDesc: any;
  MarriedStatusCode: any;
  MarriedStatusDesc: any;
  multipalselection: number = 0;
  selectedSalutation: string = Salutation[0].value;
  childValidation: any[] = [];

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _healthBuyPlanService: HealthBuyPlanService,
    private _errorHandleService: ErrorHandleService
  ) {
    this.proposerForm = _fb.group({
      PropGenderTitle: ["", Validators.required],
      PropFirstName: ["", [Validators.required]],
      PropLastName: ["", [Validators.required]],
      PropDOB: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      proposerRelationCode: ["", [Validators.required]],
      EmailId: [""],
      MobileNo: [""],
      AddFlatNo: ["", [Validators.required]],
      AddArea: ["", [Validators.required, RequireMatch]],

      AddPincode: ["", [Validators.required]],
      city: ["", [Validators.required, RequireMatch]],
      state: ["", [Validators.required]],
      Tanure: "",
      MarriedStatusCode: "",
      MarriedStatusDesc: "",
      OccupationCode: "",
      OccupationDesc: "",
    });
    this.communicationAddressForm = _fb.group({
      AddFlatNo: ["", [Validators.required]],
      AddArea: ["", [Validators.required, RequireMatch]],
      AddPincode: ["", [Validators.required]],
      city: ["", [Validators.required, RequireMatch]],
      state: ["", [Validators.required]],
      identity: ["", [Validators.required]],
      IdentityNo: [""],
      SocialStatusBpl: [""],
      SocialStatusDisabled: [""],
      SocialStatusInformal: [""],
      SocialStatusUnorganized: [""],
    });
    this.CommonForm = _fb.group({
      EmailId: ["", [Validators.required, Validators.pattern(PATTERN.EMAIL)]],
      MobileNo: [
        "",
        [Validators.required, Validators.pattern(PATTERN.MOBILENO)],
      ],
    });
    this.nomineeForm = _fb.group({
      NomineeName: ["", [Validators.required]],
      nominee: ["", [Validators.required]],
      age: ["", [Validators.required]],
      AppointeeName: [""],
      AppointeeDOB: [""],
      AppointeeRelationCode: [""],
    });
  }
  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog;

  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    //console.log(this.insuredMembersForm);
    $("input").attr("autocomplete", "off");
    // $("input").attr("type", "abcdefghijklmnopqrstuvwxyz");
    try {
      this._route.paramMap.subscribe((p: any) => {
        const No: string = p.get("a_id");
        const Odp: string = p.get("odp");
        const c_cd: string = p.get("c_id");
        const prm: string = decrypt(p.get("prm"));
        const p_cd: string = decrypt(p.get("p_cd"));
        const sum_insured: string = decrypt(p.get("sum_insured"));
        this.ApplicationNo = Number(decrypt(No));
        this.ApplicationNoOdp = Number(decrypt(Odp));

        this.plan = {
          ProductCode: p_cd,
          SumInsured: sum_insured,
          Premium: prm,
          CompanyCode: decrypt(c_cd),
          CompanyLogo: "",
          CompanyUrl: "",
          ProductName: "",
          IDVVAlue: "",
          MaxIDVVAlue: "",
          MinIDVVAlue: "",
        };

        this.companyData = JSON.parse(sessionStorage.getItem("companyData")!);
        this.SmokePremiumActual = this.companyData.Premium;
        //console.log(this.companyData);

        this.get(
          this.ApplicationNo,
          this.ApplicationNoOdp,
          Number(this.plan.CompanyCode),
          p_cd == "COMPREHENSIVE"
            ? p_cd
            : p_cd == "COMPREHENSIVEIND"
              ? p_cd
              : "0"
        );
        const tan = Number(decrypt(p.get("tanure")));
        this.proposerForm.patchValue({
          Tanure: tan ? 1 : tan,
        });
      });

      this.proposerForm.controls["city"].disable();
      this.proposerForm.controls["AddPincode"].disable();
    } catch (error) {
      console.error("HB Client error: " + error);
    }
    this.updateIdentityValidity();
  }

  public ProposerInsurer(event: any) {
    this.tabIndex = 0;
    if (event.checked == true) {
      this.Proposer_Insurer = true;
    } else {
      this.Proposer_Insurer = false;
    }
    this.proposerForm.reset();
    if (this.stateList.length == 0) {
      this.proposerForm.controls["city"].enable();
      this.proposerForm.controls["AddPincode"].enable();
      this.proposerForm.patchValue({
        state: this.memberDetails[0]["StateDesc"],
        // city: this.memberDetails[0]["CityDesc"],
        AddPincode: this.memberDetails[0]["Pincode"],
      });
    }
  }

  public ProposerInsurerNotSelectSelf() {
    this.tabIndex = 0;
    this.proposerForm.reset();
    if (this.stateList.length == 0) {
      this.proposerForm.controls["city"].enable();
      this.proposerForm.controls["AddPincode"].enable();
      this.proposerForm.patchValue({
        state: this.memberDetails[0]["StateDesc"],
        city: this.memberDetails[0]["CityDesc"],
        AddPincode: this.memberDetails[0]["Pincode"],
      });
    }
  }

  private updateIdentityValidity() {
    const control = this.communicationAddressForm.get("IdentityNo")!;

    this.communicationAddressForm
      .get("identity")!
      .valueChanges.subscribe((identity: IYesNoInd | undefined) => {
        control.reset();
        if (identity!.value == EIdentity.PAN) {
          this.identityMask = MASKS.PAN;
          control.setValidators([
            Validators.pattern(PATTERN.PAN),
            Validators.required,
          ]);
        } else if (identity!.value == EIdentity.AADHAAR) {
          this.identityMask = MASKS.AADHAAR;
          control.setValidators([
            Validators.pattern(PATTERN.AADHAAR),
            Validators.required,
          ]);
        } else if (identity!.value == EIdentity.GSTIN) {
          this.identityMask = MASKS.GSTIN;
          control.setValidators([
            Validators.pattern(PATTERN.GSTIN),
            Validators.required,
          ]);
        } else {
          control.setValidators(Validators.required);
        }
        control.updateValueAndValidity();
      });
  }

  filteredCityListForMemebers: Observable<ICity[]> | undefined;
  private get(id: number, idOdp: number, c_code: number, ProductCode: any) {
    this.showLoader = true;
    this._healthBuyPlanService
      .getHealthMasterData(id, idOdp, c_code, ProductCode)
      .subscribe(
        (result) => {
          //console.log("test", result);
          this.showLoader = false;

          // proposer filtering
          this.filteredProposerStateList = this.proposerForm.controls[
            "state"
          ].valueChanges.pipe(
            startWith(""),
            map((state) => this._filterState(state))
          );
          this.filteredCityList = this.proposerForm.controls[
            "city"
          ].valueChanges.pipe(
            startWith(""),
            map((city) => this._filterCity(city))
          );

          // insured members filtering
          this.filteredStateList = this.communicationAddressForm.controls[
            "state"
          ].valueChanges.pipe(
            startWith(""),
            map((state) => this._filterState(state))
          );
          this.filteredCityListForMemebers =
            this.communicationAddressForm.controls["city"].valueChanges.pipe(
              startWith(""),
              map((city) => this._filterCity(city))
            );
          if (result.successcode == "1" && result.data) {
            this.relationList = result.data["relation"];
            this.praposalrelationLists = result.data["relation"];
            this.nomineerelationList = result.data["relation"];
            this.memberDetails = result.data["memberdetails"];
            this.stateList = result.data["state"];
            this.cities = result.data["StarInsurancecity"];
            this.genderList = result.data["gender"];
            this.occupations = result.data["occupation"];
            this.pincodeList = result.data["pincode"];
            this.appointeList = result.data["appointe"];

            // this.companyQuestions=result.data['companyquestions']
            //this.nomineerelationList = this.nomineerelationList.filter(m => m.FamilyMemberCode != 1);
            this.ddlpraposalrelationList();
            //this.Proposer_Insurer = true;
            //this.Proposer_Insurer_Not_Self = true;
            //this.ProposerInsurerNotSelectSelf();
            this.memberDetails.forEach((member, index) => {
              //
              if (this.memberDetails[index].FamilyMemberCode == 1) {
                //this.Proposer_Insurer = false;
                //this.Proposer_Insurer_Not_Self = false;
              }
              if (this.companyData.CompanyCode == 1) {
                this.Proposer_Insurer_Not_Self = true;
              }
              let date = new Date().getDate();
              let month = new Date().getMonth();
              let year =
                +new Date().getFullYear() -
                (this.memberDetails[index].Age != 0
                  ? +this.memberDetails[index].Age
                  : +this.memberDetails[index].Age + 1);
              let dob = new Date(year, month, date);
              member["DOB"] = dob;
            });
            //console.log("-----------------", this.memberDetails[0]["StateDesc"] );
            this.CommonForm.patchValue({
              EmailId: this.memberDetails[0]["EmailId"],
              MobileNo: this.memberDetails[0]["MobileNo"],
            });

            this.communicationAddressForm.patchValue({
              state: this.memberDetails[0]["StateDesc"],
              city: this.memberDetails[0]["CityDesc"],
              AddPincode: this.memberDetails[0]["Pincode"],
            });
            //console.log(this.proposerForm.value);
            if (result.data["companyquestions"])
              this.makeQuestionsTree(result.data["companyquestions"]);

            // this.getCityByPIN();
          } else {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = ''
            this.errorLogDetails.ControllerName = "Health";
            this.errorLogDetails.MethodName = "GetHealthRegData";
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                //console.log(res);
              });
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      );
  }
  get f() {
    return this.proposerForm.controls;
  }

  SocialStatusSelect(event: any) {
    if (event.checked) this.NoneOfTheAbove = false;
  }

  SocialStatusNoneOfTheAbove(event: any) {
    if (event.checked) {
      this.communicationAddressForm.patchValue({
        SocialStatusBpl: false,
        SocialStatusDisabled: false,
        SocialStatusInformal: false,
        SocialStatusUnorganized: false,
      });
    }
    this.NoneOfTheAbove = true;
  }

  appointeedetails(date: any) {
    //
    //console.log(date);
    let TodayDate = new Date().getFullYear();
    //let NomineDate = convertToMydate(date.value);
    let NomineDateYear = date.value._i.year;
    let yearCount = TodayDate - NomineDateYear;
    if (yearCount < 18) {
      this.AppointeeDetails = true;
      this.nomineeForm.controls["AppointeeName"].setValidators([
        Validators.required,
      ]);
      this.nomineeForm.controls["AppointeeDOB"].setValidators([
        Validators.required,
      ]);
      this.nomineeForm.controls["AppointeeRelationCode"].setValidators([
        Validators.required,
      ]);
    } else {
      this.nomineeForm.controls["AppointeeName"].setValue("");
      this.nomineeForm.controls["AppointeeDOB"].setValue("");
      this.nomineeForm.controls["AppointeeRelationCode"].setValue("");

      this.nomineeForm.controls["AppointeeName"].setValidators(null);
      this.nomineeForm.controls["AppointeeDOB"].setValidators(null);
      this.nomineeForm.controls["AppointeeRelationCode"].setValidators(null);
      this.AppointeeDetails = false;
    }
    this.nomineeForm.controls["AppointeeName"].updateValueAndValidity();
    this.nomineeForm.controls["AppointeeDOB"].updateValueAndValidity();
    this.nomineeForm.controls["AppointeeRelationCode"].updateValueAndValidity();
  }

  private async makeQuestionsTree(arr: IQuestionsTree[]) {
    //
    // arr = this.data;
    //console.log("Question", arr);
    var tree: IQuestionsTree[] = [],
      mappedArr: any = {},
      arrElem: IQuestionsTree,
      mappedElem: IQuestionsTree;
    // First map the nodes of the array to an object -> create a hash table.
    for (let i = 0, len = arr.length; i < len; i++) {
      arrElem = arr[i];
      mappedArr[arrElem.QuestionID] = arrElem;
      mappedArr[arrElem.QuestionID]["Childrens"] = [];
      mappedArr[arrElem.QuestionID]["Members"] = [];
    }
    for (var QuestionID in mappedArr) {
      if (mappedArr.hasOwnProperty(QuestionID)) {
        mappedElem = mappedArr[QuestionID];

        //filtering adult,child question start pranay
        if (mappedElem.IsAdultChild === 0) {
          mappedElem.Members = this.memberDetails.slice();
        } else if (mappedElem.IsAdultChild === 2) {
          mappedElem.Members = this.memberDetails.filter(m => m.Age < 18)
        } else if (mappedElem.IsAdultChild === 1) {
          mappedElem.Members = this.memberDetails.filter(m => m.Age >= 18)
        }
        //filtering adult,child question end pranay

        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.ParentID) {
          // mappedElem.Members = this.memberDetails.slice();
          mappedArr[mappedElem["ParentID"]]["Childrens"].push(mappedElem);
          // mappedArr[mappedElem['ParentID']]['Members'] = this.memberDetails.slice();;
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          // mappedElem.Members = this.memberDetails.slice();
          if (mappedElem.Members.length > 0) {//new code
            tree.push(mappedElem);
          }
          // tree.push(mappedElem);//old code
        }
      }
    }

    this.companyQueTree = tree;
    //console.log(this.companyQueTree);
    await this.createQAForm(tree);
    //console.log(JSON.stringify(tree))
  }

  private createQAForm = async (tree: IQuestionsTree[]) => {
    let group: any = {};
    for (let row of tree) {
      // -------------------- make dynamic form arrays for sub questions
      for (let item of row.Childrens) {
        let subGroup = [];
        for (let i = 0; i < item.Members.length; i++) {
          subGroup.push(
            item.IsRequired == 1
              ? new FormControl(
                { value: "", disabled: true },
                Validators.required
              )
              : new FormControl({ value: "", disabled: true })
          );
        }
        group[item.QuestionID] = this._fb.array(subGroup);

        // new code
        for (let subitem of item.Childrens) {
          //
          let subGroup = [];
          for (let i = 0; i < subitem.Members.length; i++) {
            subGroup.push(
              subitem.IsRequired == 1
                ? new FormControl(
                  { value: "", disabled: true },
                  Validators.required
                )
                : new FormControl({ value: "", disabled: true })
            );
          }
          group[subitem.QuestionID] = this._fb.array(subGroup);
        }
        //new code
      }
      // -------------- this will make groups for all checkboxes
      let frmctls: any = {};
      for (let i = 0; i < row.Members.length; i++) {
        // i am change code tree
        const key = row.Members[i].RecordNo;
        frmctls[key] = new FormControl(false);
        if (row.Members.length == i + 1)
          frmctls["none" + row.QuestionID] = new FormControl(false);
      }
      group[row.QuestionID] = new FormGroup(frmctls);
    }
    this.qnaForm = new FormGroup(group);
    //console.log("this.qnaForm", this.qnaForm);
    //console.log("Tree", tree)
  };

  //#region  all type filters functions

  private _filterState(value: string): IState[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.stateList.filter(
      (row) => row.StateDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterCity(value: string): ICity[] {
    //
    //console.log("typeof city value ", typeof value);

    if (typeof value !== "string") return [];
    const filterBy = value ? value.toLowerCase() : value;
    return this.cities.filter(
      (row: any) => row["city_name"].toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterArea(value: string, areaData: any): ICity[] {
    //
    if (typeof value !== "string") return [];
    const filterBy = value ? value.toLowerCase() : value;
    return areaData.filter(
      (row: any) => row["areaName"].toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterPincode(value: string): IPincode[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.cityPincodes.filter(
      (row) => row.Pincode.trim().indexOf(filterBy) === 0
    );
  }

  proposerCityDisplayFn(cityObject: any) {
    return cityObject ? cityObject["city_name"] : "";
  }

  proposerAreaDisplayFn(areaObject: any) {
    return areaObject ? areaObject["areaName"] : "";
  }

  async onSelectState(): Promise<any> {
    // const state: IState = this.proposerForm.get('state').value;
    const state: string = this.proposerForm.get("state")!.value;
    if (!state) return false;
    this.proposerForm.controls["city"].enable();
    this.proposerForm.controls["AddPincode"].disable();
    this.selectedCityList = state
      ? this.cities.filter((city: ICity) => city.StateCode == state)
      : [];
    this.statePincodes = this.pincodeList.filter(
      (pin) => pin.StateCode == state
    );
    this.proposerForm.controls["AddPincode"].reset();
    this.proposerForm.controls["city"].reset();
    this.filteredCityList = this.proposerForm.controls[
      "city"
    ].valueChanges.pipe(
      startWith(""),
      map((city) => this._filterCity(city))
    );
  }

  areaForProposer!: Observable<any[]>;
  areaForMembers!: Observable<any[]>;
  async onSelectCity(formName: any) {
    const pincode: string = this.memberDetails[0].Pincode;

    if (formName === "proposer") {
      const cityIdForProposer: number =
        this.proposerForm.get("city")!.value["city_id"];
      this.proposerForm.get("AddArea")!.setValue("");
      this.areaForProposer = this._healthBuyPlanService
        .getAreaByCity(pincode, cityIdForProposer)
        .pipe(
          mergeMap((res) => {
            return this.proposerForm.get("AddArea")!.valueChanges.pipe(
              startWith(""),
              //debounceTime(100),
              map((value) => this._filterArea(value, res))
            );
          })
        );
    } else {
      const cityIdForMembers: number =
        this.communicationAddressForm.get("city")!.value["city_id"];
      this.communicationAddressForm.get("AddArea")!.setValue("");

      this.areaForMembers = this._healthBuyPlanService
        .getAreaByCity(pincode, cityIdForMembers)
        .pipe(
          mergeMap((res) => {
            return this.communicationAddressForm
              .get("AddArea")!
              .valueChanges.pipe(
                startWith(""),
                //debounceTime(100),
                map((value) => this._filterArea(value, res))
              );
          })
        );
    }
    // const city: string = this.proposerForm.get("city").value;
    // if (!city) return false;

    // this.proposerForm.controls["AddPincode"].enable();
    // this.cityPincodes = this.statePincodes.filter(
    //   (pin) => pin.CityCode == city
    // );
    // this.proposerForm.controls["AddPincode"].reset();
    // this.filteredPincode = this.proposerForm.controls[
    //   "AddPincode"
    // ].valueChanges.pipe(
    //   startWith(""),
    //   //debounceTime(100),
    //   map((value) => this._filterPincode(value))
    // );

    //  const pins= new Promise<IPincode[]>(() =>
    //      this.pincodeList.filter(pin => pin.CityCode == city)
    //  );
    //   pins.then(p => this.pincodeList=p)
  }

  async AddressonSelectState(): Promise<any> {
    //

    // const state: IState = this.proposerForm.get('state').value;
    const state: string = this.communicationAddressForm.get("state")!.value;
    if (!state) return false;
    this.communicationAddressForm.controls["city"].enable();
    this.communicationAddressForm.controls["AddPincode"].disable();
    this.selectedCityList = state
      ? this.cities.filter((city: ICity) => city.StateCode == state)
      : [];
    this.statePincodes = this.pincodeList.filter(
      (pin) => pin.StateCode == state
    );
    this.communicationAddressForm.controls["AddPincode"].reset();
    this.communicationAddressForm.controls["city"].reset();
    this.filteredCityList = this.communicationAddressForm.controls[
      "city"
    ].valueChanges.pipe(
      startWith(""),
      map((city) => this._filterCity(city))
    );
  }
  async AddressononSelectCity(): Promise<any> {
    const city: string = this.communicationAddressForm.get("city")!.value;
    if (!city) return false;

    this.communicationAddressForm.controls["AddPincode"].enable();
    this.cityPincodes = this.statePincodes.filter(
      (pin) => pin.CityCode == city
    );
    this.communicationAddressForm.controls["AddPincode"].reset();
    this.filteredPincode = this.communicationAddressForm.controls[
      "AddPincode"
    ].valueChanges.pipe(
      startWith(""),
      //debounceTime(100),
      map((value) => this._filterPincode(value))
    );
  }

  //#endregion

  async onChekedChange(
    event: any,
    node: IQuestionsTree,
    selectedMemberCode: number,
    RecordNo: number,
    op: string,
    selectedIndx: number
  ) {

    //console.log(this.qnaForm);
    //console.log(node);

    const parent = this.medicalHis.filter(
      (item) => item.QuestionID == node.QuestionID
    ); //check selected exist or not

    // async onChekedChange(event: any, node: IQuestionsTree, selectedMemberCode: number, op: string, selectedIndx: number) {
    //   const parent = this.medicalHis.filter(item => item.QuestionID == node.QuestionID)//check selected exist or not
    if (selectedMemberCode > 0 && op == "") {
      let checkChildValidation = []
      for (const sub of node.Childrens) {
        // work for all event except "none"
        const frmArry = this.qnaForm.controls[sub.QuestionID] as FormArray;
        if (event.checked) {
          frmArry.controls[selectedIndx].enable();
          frmArry.controls[selectedIndx].setValue('')
        }
        else {
          frmArry.controls[selectedIndx].disable();
          frmArry.controls[selectedIndx].setValue('')
        }

        for (const sub1 of sub.Childrens) {
          // work for all event except "none"
          const frmArry2 = this.qnaForm.controls[sub1.QuestionID] as FormArray;
          if (event.checked) {
            frmArry2.controls[selectedIndx].disable();
            frmArry2.controls[selectedIndx].setValue("");
          } else {
            frmArry2.controls[selectedIndx].disable();
            frmArry2.controls[selectedIndx].setValue("");
          }
        }
      }
    }
    if (event.checked) {
      //work when checkbox is checked

      if (parent.length == 0) {
        //insert new data for first time
        for await (const item of node.Members) {
          const a =
            item.FamilyMemberCode == selectedMemberCode &&
              item.RecordNo == RecordNo
              ? "Yes"
              : "No"; //EYesNo[EYesNo.YES]
          this.medicalHis.push({
            QuestionID: node.QuestionID,
            FamilyMemberCode: item.FamilyMemberCode,
            QuestionValue: a,
            RecordNo: item.RecordNo,
            MedicalLoadingInd: 0,
            MedicalLoadingPercentage: 0,
            MedicalLoadingAmt: 0,
          });
        }

        if (selectedMemberCode > 0)
          for await (const sub of node.Childrens)
            this.medicalHis.push({
              QuestionID: sub.QuestionID,
              FamilyMemberCode: selectedMemberCode,
              QuestionValue: "No",
              RecordNo: RecordNo,
            });

        // if (RecordNo > 0 && node.Childrens.length===0 )
        //   this.manageChildValidation(node.QuestionID, RecordNo, true, 'add');
        // else
        if (RecordNo > 0) {
          if (node.Childrens.length === 1 && (node.Childrens[0].ControlName === 'textbox' || node.Childrens[0].ControlName === 'date'))
            this.manageChildValidation(node.QuestionID, RecordNo, true, 'add');
          else
            this.manageChildValidation(node.QuestionID, RecordNo, node.Childrens.length > 0 ? false : true, 'add');
        }

      } else {
        if (selectedMemberCode == 0) {
          //work when option is "none"
          //remove all child if exist and update parent
          for await (const sub of node.Childrens) {
            let SubQuestion = this.medicalHis.filter(
              (m) => m.QuestionID == sub.QuestionID
            );
            for await (const subQ of SubQuestion) {
              const index = this.medicalHis.findIndex(
                (value) => value.QuestionID == sub.QuestionID //&&
                //value.FamilyMemberCode == selectedMemberCode
              );
              this.medicalHis.splice(index, 1);
            }
            //if (index != -1) this.medicalHis.splice(index, 1);

            const frmArry = this.qnaForm.controls[sub.QuestionID] as FormArray;
            //console.log(sub);
            for (var i = 0; i < node.Members.length; i++) {
              frmArry.controls[i].disable();
              frmArry.controls[i].setValue("");
            }
            //

            // little sub question start text box value remove
            for await (const sub1 of sub.Childrens) {
              let SubQuestion = this.medicalHis.filter(
                (m) => m.QuestionID == sub1.QuestionID
              );
              for await (const subQ of SubQuestion) {
                const index = this.medicalHis.findIndex(
                  (value) => value.QuestionID == sub1.QuestionID
                );
                this.medicalHis.splice(index, 1);
              }
              const frmArry1 = this.qnaForm.controls[
                sub1.QuestionID
              ] as FormArray;
              //console.log("sdasdasdasdasdasdasdas", sub1);
              for (var i = 0; i < sub1.Members.length; i++) {
                frmArry1.controls[i].disable();
                frmArry1.controls[i].setValue("");
              }
            }
            // little sub question end text box value remove
          }
          for await (const item of parent) item.QuestionValue = "No";

          // unchecking all members for current question
          const frmGroup = this.qnaForm.controls[node.QuestionID] as FormGroup;
          for (let member of node.Members) {
            frmGroup.controls[member.RecordNo].setValue(false);
          }
          this.manageChildValidation(node.QuestionID, 0, true, 'none');
        } else {
          // adding one subquestion row
          for await (const sub of node.Childrens)
            this.medicalHis.push({
              QuestionID: sub.QuestionID,
              FamilyMemberCode: selectedMemberCode,
              QuestionValue: "No",
              RecordNo: RecordNo,
            });

          // update parent status
          const rowToUpdate = parent.find(
            (p) =>
              p.QuestionID == node.QuestionID &&
              p.FamilyMemberCode == selectedMemberCode &&
              p.RecordNo == RecordNo
          );
          //console.log(rowToUpdate);
          if (rowToUpdate) {
            rowToUpdate.QuestionValue = "Yes";
            // const updateRowIndex = this.medicalHis.findIndex(fi => fi.QuestionID == node.QuestionID && fi.FamilyMemberCode == selectedMemberCode)
            // this.medicalHis.splice(updateRowIndex, 1, rowToUpdate);
          }

          // check/uncheck none checkbox
          let frmGroup = this.qnaForm.controls[node.QuestionID] as FormGroup;
          if (this.isNoneChecked(node.QuestionID)) {
            frmGroup.controls[`none${node.QuestionID}`].setValue(true);
          } else {
            frmGroup.controls[`none${node.QuestionID}`].setValue(false);
          }

          // this.manageChildValidation(node.QuestionID, RecordNo, node.Childrens.length > 0 ? false : true, 'add');

          if (node.Childrens.length === 1 && (node.Childrens[0].ControlName === 'textbox' || node.Childrens[0].ControlName === 'date'))
            this.manageChildValidation(node.QuestionID, RecordNo, true, 'add');
          else
            this.manageChildValidation(node.QuestionID, RecordNo, node.Childrens.length > 0 ? false : true, 'add');
        }
      }

      if (
        (node.QuestionID == 230 ||
          node.QuestionID == 242 ||
          node.QuestionID == 250 || node.QuestionID == 674) &&
        op != ""
      ) {
        this.multipalselection = 1;
      } else if (
        (node.QuestionID == 230 ||
          node.QuestionID == 242 ||
          node.QuestionID == 250 || node.QuestionID == 674) &&
        op == ""
      ) {
        this.multipalselection = 0;
      }
      //console.log(this.medicalHis);
      //console.log(this.qnaForm.value);
    } else {
      //work when checkbox is un-checked
      const existCnt = parent.filter((p) => p.QuestionValue == "Yes"); //check if it is last unchecked
      //first remove selected sub element
      if (existCnt.length > 0) {
        for await (const sub of node.Childrens) {
          const index = this.medicalHis.findIndex(
            (value) =>
              value.QuestionID == sub.QuestionID &&
              value.FamilyMemberCode == selectedMemberCode
          );
          if (index != -1) this.medicalHis.splice(index, 1);

          for await (const sub1 of sub.Childrens) {
            const index = this.medicalHis.findIndex(
              (value) =>
                value.QuestionID == sub1.QuestionID &&
                value.FamilyMemberCode == selectedMemberCode
            );
            if (index != -1) this.medicalHis.splice(index, 1);
          }
        }
      }
      const rowToUpdate = parent.find(
        (p) =>
          p.QuestionID == node.QuestionID &&
          p.FamilyMemberCode == selectedMemberCode &&
          p.RecordNo == RecordNo
      );
      if (rowToUpdate) rowToUpdate.QuestionValue = "No";

      // check/uncheck none checkbox
      if (selectedMemberCode !== 0) {
        let frmGroup = this.qnaForm.controls[node.QuestionID] as FormGroup;
        if (this.isNoneChecked(node.QuestionID)) {
          frmGroup.controls[`none${node.QuestionID}`].setValue(true);
          // this.manageChildValidation(node.QuestionID, RecordNo, true, 'none');
        } else {
          frmGroup.controls[`none${node.QuestionID}`].setValue(false);
          // this.manageChildValidation(node.QuestionID, 0,  true, 'remove');
        }
        this.manageChildValidation(node.QuestionID, RecordNo, true, 'remove');
      }


      if (
        (node.QuestionID == 230 ||
          node.QuestionID == 242 ||
          node.QuestionID == 250 || node.QuestionID == 674) &&
        op != ""
      ) {
        this.multipalselection = 0;
      } else if (
        (node.QuestionID == 230 ||
          node.QuestionID == 242 ||
          node.QuestionID == 250 || node.QuestionID == 674) &&
        op == ""
      ) {
        this.multipalselection = 1;
      }
      //console.log(this.medicalHis);
      //console.log(this.qnaForm.value);
    }

    //console.log(this.multipalselection);
  }

  //new code by dilshad on 22 Aug 2022
  private manageChildValidation(QuestionID: number, FamilyMemberCode: number, isChildValid: boolean, op: string): void {

    if (op === 'add') {
      this.childValidation.push({ q_id: QuestionID, m_Id: FamilyMemberCode, isChildValid: isChildValid })
    } else if (op === 'remove') {
      const indexToRemove = this.childValidation.findIndex((row) => row.q_id == QuestionID && row.m_Id == FamilyMemberCode);
      if (indexToRemove != -1)
        this.childValidation.splice(indexToRemove, 1)
    } if (op === 'none') {
      const records: any[] = this.childValidation.filter((row) => row.q_id == QuestionID);
      if (records.length > 0)
        records.forEach(element => {
          const indexToRemove = this.childValidation.findIndex((row) => row.q_id == QuestionID && row.m_Id == element.m_Id);
          if (indexToRemove != -1)
            this.childValidation.splice(indexToRemove, 1)
        });
    }

    console.log(this.childValidation)

    this.errMsg = '';
  }



  onSubmitProposer(): any {
    //
    this.errMsg = "";
    //console.log(this.proposerForm.value);
    if (this.proposerForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    // if (
    //   this.proposerForm.get("identity").value == EIdentity.AADHAAR &&
    //   !isValidAadhaar(this.proposerForm.get("IdentityNo").value)
    // ) {
    //   this.errMsg = "Please enter valid aadhaar number.";
    //   return false;
    // }

    // let GetForm = this.proposerForm.value;
    // if (GetForm.married.viewValue == "Yes") {
    //   if (this.memberDetails.length == 1) {
    //     this.errMsg = "User opting individual plan and selecting marital status as Married";
    //     return false;
    //   }
    // }
    // else if (GetForm.married.viewValue == "No") {
    //   if (this.memberDetails.length > 1) {
    //     this.errMsg = "User opting Floater plan and selecting marital status as Single";
    //     return false;
    //   }
    // }
    // this.insuredMembers = [];
    // for (let i = 0; i < this.memberDetails.length; i++) {
    //   if (this.memberDetails[i].FamilyMemberCode == 1) {
    //     const row: IFamilyMemberDetails = {
    //       RecordNo: 0,
    //       FamilyMemberDesc: this.memberDetails[i].FamilyMemberDesc,
    //       FamilyMemberCode: this.memberDetails[i].FamilyMemberCode,
    //       DOB: convertToMydate(GetForm.PropDOB),
    //       FirstName: GetForm.PropFirstName,
    //       GenderCode: GetForm.gender.GenderCode,
    //       GenderDesc: GetForm.gender.GenderDesc,
    //       GenderTitle: GetForm.PropGenderTitle,
    //       HeightInFeet: GetForm.HeightInFeet,
    //       HeightInInch: GetForm.HeightInInch,
    //       LastName: GetForm.PropLastName,
    //       MarriedStatusCode: GetForm.married.value,
    //       MarriedStatusDesc: GetForm.married.viewValue,
    //       OccupationCode: GetForm.occupation.OccupationCode,
    //       OccupationDesc: GetForm.occupation.OccupationDesc,
    //       Weight: GetForm.Weight,
    //       identity: GetForm.identity,
    //     };
    //     this.insuredMembers.push(row);
    //   }
    // }

    //marride stutas praposal
    let FamilyMember = this.proposerForm.controls["proposerRelationCode"].value;
    if (
      FamilyMember.FamilyMemberCode == 5 ||
      FamilyMember.FamilyMemberCode == 6
    ) {
      this.MarriedStatusCode = this.yesNoList[1].value;
      this.MarriedStatusDesc = this.yesNoList[1].viewValue;
      this.proposerForm.controls["MarriedStatusCode"].setValue(
        this.MarriedStatusCode
      );
      this.proposerForm.controls["MarriedStatusDesc"].setValue(
        this.MarriedStatusDesc
      );
    } else {
      this.MarriedStatusCode = this.yesNoList[0].value;
      this.MarriedStatusDesc = this.yesNoList[0].viewValue;
      this.proposerForm.controls["MarriedStatusCode"].setValue(
        this.MarriedStatusCode
      );
      this.proposerForm.controls["MarriedStatusDesc"].setValue(
        this.MarriedStatusDesc
      );
    }

    this.tabIndex = 1;
  }
  onSubmitMemberDetails(insuredMembersForm: NgForm): any {

    const fDetail = insuredMembersForm.value;
    this.errMsg = "";

    if (this.CommonForm.invalid) {
      this.errMsg = "Please fill Mobile No & Email Id details correctly.";
      return false;
    }
    if (insuredMembersForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }

    // for (let i = 0; i < this.memberDetails.length; i++) {
    //   // only age difference Self and Son & Daughter
    //   if (this.memberDetails[i].FamilyMemberCode == 1) {

    //     let SelfAge = this.proposerForm.controls['PropDOB'].value;
    //     SelfAge = Math.abs(Date.now() - SelfAge);
    //     SelfAge = Math.floor((SelfAge / (1000 * 3600 * 24)) / 365.25);

    //     for (let s = 0; s < this.memberDetails.length; s++) {
    //       let FamilyMemberCode = fDetail["FamilyMemberCode" + s];
    //       if (FamilyMemberCode == 5 || FamilyMemberCode == 6) {
    //         let MemberAge = new Date(fDetail["DOB" + s]);
    //         let MemberAges = Math.abs(Date.now() - MemberAge.getTime());
    //         MemberAges = Math.floor((MemberAges / (1000 * 3600 * 24)) / 365.25);
    //         if ((SelfAge - MemberAges) < 18 && (this.memberDetails[s].FamilyMemberCode == 5 || this.memberDetails[s].FamilyMemberCode == 6)) {
    //           this.errMsg = 'Self and ' + this.memberDetails[s].FamilyMemberDesc
    //             + ' age difference should be more than 18 years.';
    //           return false;
    //         }
    //       }
    //     }
    //   }
    //   // only age difference Self and Son & Daughter
    //   // only age difference Spouse and Son & Daughter
    //   if (this.memberDetails[i].FamilyMemberCode == 2) {
    //     let SpouseAge = new Date(fDetail["DOB" + i]);
    //     let SpouseAges = Math.abs(Date.now() - SpouseAge.getTime());
    //     SpouseAges = Math.floor((SpouseAges / (1000 * 3600 * 24)) / 365.25);

    //     for (let s = 0; s < this.memberDetails.length; s++) {
    //       let FamilyMemberCode = fDetail["FamilyMemberCode" + s];
    //       if (FamilyMemberCode == 5 || FamilyMemberCode == 6) {
    //         let MemberAge = new Date(fDetail["DOB" + s]);
    //         let MemberAges = Math.abs(Date.now() - MemberAge.getTime());
    //         MemberAges = Math.floor((MemberAges / (1000 * 3600 * 24)) / 365.25);
    //         if ((SpouseAges - MemberAges) < 18 && (this.memberDetails[s].FamilyMemberCode == 5 || this.memberDetails[s].FamilyMemberCode == 6)) {
    //           this.errMsg = 'Spouse and ' + this.memberDetails[s].FamilyMemberDesc
    //             + ' age difference should be more than 18 years.';
    //           return false;
    //         }
    //       }
    //     }
    //   }
    // }

    if (this.Proposer_Insurer == false) {
      this.tabIndex = 1;
    } else {
      this.tabIndex = 2;
    }
    let GetForm = this.proposerForm.value;
    this.insuredMembers = [];

    for (let i = 0; i < this.memberDetails.length; i++) {
      //child Occupation
      if (this.memberDetails[i].Age < 18) {
        let Occupation = this.occupations.filter(
          (m) => m.OccupationDesc.toLowerCase() == "student"
        );
        if (Occupation.length > 0) {
          this.OccupationCode = Occupation[0].OccupationCode;
          this.OccupationDesc = Occupation[0].OccupationDesc;
        }
      } else {
        this.OccupationCode =
          this.memberDetails[i].OccupationDesc.OccupationCode;
        this.OccupationDesc =
          this.memberDetails[i].OccupationDesc.OccupationDesc;
      }

      //marride stutas Spouse & Father & Mother & Grand Mother & Grand Father & Mother-In-Law & Father-In-Law
      if (this.memberDetails[i].FamilyMemberCode == 1) {
        let Selfmarride = this.memberDetails.filter(
          (m) =>
            m.FamilyMemberCode == 2 ||
            m.FamilyMemberCode == 5 ||
            m.FamilyMemberCode == 6 ||
            m.FamilyMemberCode == 7 ||
            m.FamilyMemberCode == 8
        );
        if (Selfmarride.length > 0) {
          this.MarriedStatusCode = this.yesNoList[0].value;
          this.MarriedStatusDesc = this.yesNoList[0].viewValue;
        } else {
          this.MarriedStatusCode = this.yesNoList[1].value;
          this.MarriedStatusDesc = this.yesNoList[1].viewValue;
        }
      } else if (
        this.memberDetails[i].FamilyMemberCode == 2 ||
        this.memberDetails[i].FamilyMemberCode == 3 ||
        this.memberDetails[i].FamilyMemberCode == 4 ||
        this.memberDetails[i].FamilyMemberCode == 7 ||
        this.memberDetails[i].FamilyMemberCode == 8 ||
        this.memberDetails[i].FamilyMemberCode == 9 ||
        this.memberDetails[i].FamilyMemberCode == 10
      ) {
        this.MarriedStatusCode = this.yesNoList[0].value;
        this.MarriedStatusDesc = this.yesNoList[0].viewValue;
      } else if (
        this.memberDetails[i].FamilyMemberCode == 5 ||
        this.memberDetails[i].FamilyMemberCode == 6
      ) {
        this.MarriedStatusCode = this.yesNoList[1].value;
        this.MarriedStatusDesc = this.yesNoList[1].viewValue;
      }

      if (this.memberDetails[i].FamilyMemberCode == 1) {
        //
        if (this.Proposer_Insurer == false) {
          this.proposerForm.controls["PropGenderTitle"].setValue(
            fDetail["GenderTitle" + i]
          );
          this.proposerForm.controls["PropFirstName"].setValue(
            this.memberDetails[i].FirstName
          );
          this.proposerForm.controls["PropLastName"].setValue(
            this.memberDetails[i].LastName
          );
          this.proposerForm.controls["PropDOB"].setValue(fDetail["DOB" + i]);
          this.proposerForm.controls["gender"].setValue(fDetail["gender" + i]);
          this.proposerForm.controls["MarriedStatusCode"].setValue(
            this.MarriedStatusCode
          );
          this.proposerForm.controls["MarriedStatusDesc"].setValue(
            this.MarriedStatusDesc
          );
        }
        //console.log(this.proposerForm);
      }

      // comman code praposal
      if (i == 0) {
        this.proposerForm.controls["OccupationCode"].setValue(
          this.OccupationCode
        );
        this.proposerForm.controls["OccupationDesc"].setValue(
          this.OccupationDesc
        );
        this.proposerForm.controls["EmailId"].setValue(
          this.CommonForm.controls["EmailId"].value
        );
        this.proposerForm.controls["MobileNo"].setValue(
          this.CommonForm.controls["MobileNo"].value
        );
      }

      const row: IFamilyMemberDetails = {
        RecordNo: 0,
        Age: 0,
        FamilyMemberDesc: this.memberDetails[i].FamilyMemberDesc,
        FamilyMemberCode: this.memberDetails[i].FamilyMemberCode,
        DOB: convertToMydate(fDetail["DOB" + i]),
        FirstName: this.memberDetails[i].FirstName,
        GenderCode: fDetail["gender" + i].GenderCode,
        GenderDesc: fDetail["gender" + i].GenderDesc,
        GenderTitle: fDetail["GenderTitle" + i],
        HeightInFeet: this.memberDetails[i].HeightInFeet,
        HeightInInch: this.memberDetails[i].HeightInInch,
        LastName: this.memberDetails[i].LastName,
        // MarriedStatusCode: fDetail["married" + i].value,
        // MarriedStatusDesc: fDetail["married" + i].viewValue,
        MarriedStatusCode: this.MarriedStatusCode,
        MarriedStatusDesc: this.MarriedStatusDesc,
        OccupationCode: this.OccupationCode,
        OccupationDesc: this.OccupationDesc,
        Weight: this.memberDetails[i].Weight,
        identity: "",
        CityCode: "",
        CityDesc: "",
        Pincode: "",
        StateCode: "",
        StateDesc: "",
        EmailId: "",
        MobileNo: ""
      };
      this.insuredMembers.push(row);
    }
    //console.log(this.insuredMembers);
  }

  onSubmitCommunicationAddress(): any {
    //
    //console.log(this.communicationAddressForm.value);
    this.proposerForm.controls["city"].enable();
    this.proposerForm.controls["AddPincode"].enable();
    this.errMsg = "";
    if (this.communicationAddressForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    if (this.Proposer_Insurer == false) {
      this.proposerForm.controls["AddFlatNo"].setValue(
        this.communicationAddressForm.controls["AddFlatNo"].value
      );
      this.proposerForm.controls["AddArea"].setValue(
        this.communicationAddressForm.controls["AddArea"].value
      );
      this.proposerForm.controls["state"].setValue(
        this.communicationAddressForm.controls["state"].value
      );
      this.proposerForm.controls["city"].setValue(
        this.communicationAddressForm.controls["city"].value
      );
      this.proposerForm.controls["AddPincode"].setValue(
        this.communicationAddressForm.controls["AddPincode"].value
      );
      const self = {
        ActiveInd: true,
        EntryDate: "2020-01-18T00:00:00",
        FamilyMemberCode: 1,
        FamilyMemberDesc: "Self",
        MemberCategory: 1,
        PriorityCode: 1,
      };
      this.proposerForm.controls["proposerRelationCode"].setValue(self);

      this.proposerForm.controls["Tanure"].setValue("1");
      //console.log(this.proposerForm.value);
    }

    if (this.Proposer_Insurer == false) {
      this.tabIndex = 2;
    } else {
      this.tabIndex = 3;
    }
  }

  onSubmitNominee(): any {
    //
    this.errMsg = "";
    if (this.nomineeForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    if (this.companyQueTree.length != 0) {
      if (this.Proposer_Insurer == false) {
        this.tabIndex = 3;
      } else {
        this.tabIndex = 4;
      }
    } else {
      //console.log("this.companyQueTree", this.companyQueTree);
      this.onSubmitReview();
    }
  }

  async onSubmitReview(): Promise<any> {
    //
    const medicalHisValidation = this.qnaForm.value;

    this.companyData.Premium = this.SmokePremiumActual;
    this.SmokePremium = this.SmokePremiumActual;
    this.StopCompanyInd = 0;
    this.ExtraLoading = 0;
    //var medicalHisValidation = this.qnaForm.value;

    console.log(medicalHisValidation);
    console.log(this.companyQueTree);
    console.log(this.childValidation);

    // validation futer generl
    if (this.companyData.CompanyCode == 3) {
      for (let i = 0; i < this.companyQueTree.length; i++) {
        if (this.companyQueTree[i].CompanyStopInd == true) {
          this.medicalHisAns = this.medicalHis.filter(
            (m) => m.QuestionID === this.companyQueTree[i].QuestionID
          );
          if (this.medicalHisAns.length > 0) {
            //console.log(this.companyQueTree[i].CompanyStopValue);
            //console.log(this.medicalHisAns[0].QuestionValue);
            for (let A = 0; A < this.medicalHisAns.length; A++) {
              if (
                this.companyQueTree[i].CompanyStopValue ===
                this.medicalHisAns[A].QuestionValue
              ) {
                //this.errMsg = "Please Yes Checkbox";
                this.StopCompanyInd = 1;
              }
            }
            //console.log(this.medicalHisAns);
          }
        }
        if (this.companyQueTree[i].CompanyLoadInd == true) {
          //
          this.medicalHisAns = this.medicalHis.filter(
            (m) => m.QuestionID === this.companyQueTree[i].QuestionID
          );
          for (let S = 0; S < this.medicalHisAns.length; S++) {
            if (
              this.companyQueTree[i].CompanyLoad ==
              this.medicalHisAns[S].QuestionValue
            ) {
              // else {
              //   this.companyData.Premium = this.OldPremium;
              // }
              // LoadTypeInd 1 Rupees
              if (this.companyQueTree[i].LoadTypeInd == 1) {
                this.SmokePremium =
                  Number(this.SmokePremium) +
                  Number(this.companyQueTree[i].CompanyLoadValue);
                this.ExtraLoading += Number(
                  this.companyQueTree[i].CompanyLoadValue
                );
                this.companyData.Premium = this.SmokePremium;

                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingInd = 1;
                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingAmt = this.companyQueTree[i].CompanyLoadValue;
                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingPercentage =
                  this.companyQueTree[i].CompanyLoadValue;
              }
              // LoadTypeInd 2 Percentage
              if (this.companyQueTree[i].LoadTypeInd == 2) {
                //this.OldPremium = this.companyQueTree[i].CompanyLoadValue;
                let PercentageAmt =
                  (Number(this.SmokePremiumActual) *
                    Number(this.companyQueTree[i].CompanyLoadValue)) /
                  100;
                this.SmokePremium =
                  Number(this.SmokePremium) + Number(PercentageAmt);
                this.companyData.Premium = this.SmokePremium;
                this.ExtraLoading += PercentageAmt;

                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingInd = 1;
                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingAmt = PercentageAmt;
                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingPercentage =
                  this.companyQueTree[i].CompanyLoadValue;
              }
            } else {
              this.medicalHis.find(
                (item) =>
                  item.RecordNo == this.medicalHisAns[S].RecordNo &&
                  item.QuestionID == this.medicalHisAns[S].QuestionID
              ).MedicalLoadingInd = 0;
              this.medicalHis.find(
                (item) =>
                  item.RecordNo == this.medicalHisAns[S].RecordNo &&
                  item.QuestionID == this.medicalHisAns[S].QuestionID
              ).MedicalLoadingAmt = 0;
              this.medicalHis.find(
                (item) =>
                  item.RecordNo == this.medicalHisAns[S].RecordNo &&
                  item.QuestionID == this.medicalHisAns[S].QuestionID
              ).MedicalLoadingPercentage = 0;
            }
          }

          // else {
          //   if (this.OldPremium != 0) {
          //     this.companyData.Premium = this.OldPremium;
          //   }
          // }
        }

        // child stopind and loading
        for (let c = 0; c < this.companyQueTree[i].Childrens.length; c++) {
          if (this.companyQueTree[i].Childrens[c].CompanyStopInd == true) {
            this.medicalHisAns = this.medicalHis.filter(
              (m) =>
                m.QuestionID === this.companyQueTree[i].Childrens[c].QuestionID
            );
            if (this.medicalHisAns.length > 0) {
              //console.log(this.companyQueTree[i].Childrens[c].CompanyStopValue);
              //console.log(this.medicalHisAns[0].QuestionValue);
              for (let A = 0; A < this.medicalHisAns.length; A++) {
                if (
                  this.companyQueTree[i].Childrens[c].CompanyStopValue ===
                  this.medicalHisAns[A].QuestionValue
                ) {
                  //this.errMsg = "Please Yes Checkbox";
                  this.StopCompanyInd = 1;
                }
              }
              //console.log(this.medicalHisAns);
            }
          }
          if (this.companyQueTree[i].Childrens[c].CompanyLoadInd == true) {
            //
            this.medicalHisAns = this.medicalHis.filter(
              (m) =>
                m.QuestionID === this.companyQueTree[i].Childrens[c].QuestionID
            );
            for (let S = 0; S < this.medicalHisAns.length; S++) {
              if (
                this.companyQueTree[i].CompanyLoad ==
                this.medicalHisAns[S].Childrens[c].QuestionValue
              ) {
                // else {
                //   this.companyData.Premium = this.OldPremium;
                // }
                // LoadTypeInd 1 Rupees
                if (this.companyQueTree[i].Childrens[c].LoadTypeInd == 1) {
                  this.SmokePremium =
                    Number(this.SmokePremium) +
                    Number(
                      this.companyQueTree[i].Childrens[c].CompanyLoadValue
                    );
                  this.ExtraLoading += Number(
                    this.companyQueTree[i].Childrens[c].CompanyLoadValue
                  );
                  this.companyData.Premium = this.SmokePremium;

                  this.medicalHis.find(
                    (item) =>
                      item.RecordNo == this.medicalHisAns[S].RecordNo &&
                      item.QuestionID == this.medicalHisAns[S].QuestionID
                  ).MedicalLoadingInd = 1;
                  this.medicalHis.find(
                    (item) =>
                      item.RecordNo == this.medicalHisAns[S].RecordNo &&
                      item.QuestionID == this.medicalHisAns[S].QuestionID
                  ).MedicalLoadingAmt =
                    this.companyQueTree[i].Childrens[c].CompanyLoadValue;
                  this.medicalHis.find(
                    (item) =>
                      item.RecordNo == this.medicalHisAns[S].RecordNo &&
                      item.QuestionID == this.medicalHisAns[S].QuestionID
                  ).MedicalLoadingPercentage =
                    this.companyQueTree[i].Childrens[c].CompanyLoadValue;
                }
                // LoadTypeInd 2 Percentage
                if (this.companyQueTree[i].Childrens[c].LoadTypeInd == 2) {
                  //this.OldPremium = this.companyQueTree[i].CompanyLoadValue;
                  let PercentageAmt =
                    (Number(this.SmokePremiumActual) *
                      Number(
                        this.companyQueTree[i].Childrens[c].CompanyLoadValue
                      )) /
                    100;
                  this.SmokePremium =
                    Number(this.SmokePremium) + Number(PercentageAmt);
                  this.companyData.Premium = this.SmokePremium;
                  this.ExtraLoading += PercentageAmt;

                  this.medicalHis.find(
                    (item) =>
                      item.RecordNo == this.medicalHisAns[S].RecordNo &&
                      item.QuestionID == this.medicalHisAns[S].QuestionID
                  ).MedicalLoadingInd = 1;
                  this.medicalHis.find(
                    (item) =>
                      item.RecordNo == this.medicalHisAns[S].RecordNo &&
                      item.QuestionID == this.medicalHisAns[S].QuestionID
                  ).MedicalLoadingAmt = PercentageAmt;
                  this.medicalHis.find(
                    (item) =>
                      item.RecordNo == this.medicalHisAns[S].RecordNo &&
                      item.QuestionID == this.medicalHisAns[S].QuestionID
                  ).MedicalLoadingPercentage =
                    this.companyQueTree[i].Childrens[c].CompanyLoadValue;
                }
              } else {
                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingInd = 0;
                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingAmt = 0;
                this.medicalHis.find(
                  (item) =>
                    item.RecordNo == this.medicalHisAns[S].RecordNo &&
                    item.QuestionID == this.medicalHisAns[S].QuestionID
                ).MedicalLoadingPercentage = 0;
              }
            }
          }
        }
        // child stopind and loading
      }
    }




    for (let i = 0; i < this.companyQueTree.length; i++) {//looping all parent questions

      const parent = medicalHisValidation[this.companyQueTree[i].QuestionID];
      let flag = false; this.errMsg = "";

      if (!Object.values(parent).some((val: any) => { return val === true })) { //checking every parent question for all members
        //throw error if not selected any parent member
        console.log('Please check one parent ' + i + 1)
        this.errMsg = "Please select atleast one from all or select none.";
        return;
      } else {
        //if all parent are seleceted then --> check for sub question
        // console.log(i + 1 + ' parent checked ')
        const checkedMember: any[] = this.childValidation.filter((row) => row.q_id == this.companyQueTree[i].QuestionID);
        for await (const element of checkedMember) {
          // console.log("dfsadsk", element, checkedMember, this.qnaForm);

          if (!element.isChildValid) {
            this.errMsg = "Please select atleast one sub disease from all selected members.";
            flag = true;
            break;
          }


        }
        console.log('flag: ' + flag + ' ' + i)
        if (flag)
          return;

      }

    }//end of parent loop

    // if (this.qnaForm.invalid) {
    //   this.errMsg = "Please fill all details correctly..";
    //   return false;
    // }

    // alert('success')
    // Previous working
    // for (let keys in medicalHisValidation) {
    //   let ind = 0;
    //   let tvalue;
    //   $.each(medicalHisValidation[keys], function (key, val) {
    //     if (val === true) {
    //       ind = 1;
    //       tvalue = val;
    //     } else {
    //       tvalue = val;
    //     }
    //     //console.log(val);
    //   });
    //   if (ind === 0) {
    //     if (tvalue === false) {
    //       this.errMsg = "Please fill all details correctly.";
    //       return false;
    //     }
    //   }
    //   //console.log(medicalHisValidation[keys]);
    // }

    let i = 0;
    this.errMsg = "";
    if (this.qnaForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }


    // this.showLoader = true;

    this._healthBuyPlanService
      .savehealthPraposal(
        this.ApplicationNo,
        this.ApplicationNoOdp,
        this.proposerForm.value,
        this.nomineeForm.value,
        this.insuredMembers,
        this.medicalHis,
        this.plan,
        this.regUrlData,
        this.companyData,
        this.communicationAddressForm.value,
        this.ExtraLoading
      )
      .subscribe(
        (result) => {
          this.showLoader = false;
          if (result.successcode == "1") {
            this.regUrlData = result.data.Table[0];
            this.questionDataFromAPI = result.data.Table1;
            //console.log(this.regUrlData);
            var proposerForm: number = 0;
            var insuredMembers: number;
            var addressindex: number;
            var nomineeForm: number;
            var medicalHis: number;

            if (this.Proposer_Insurer == false) {
              insuredMembers = 0;
              addressindex = 1;
              nomineeForm = 2;
              medicalHis = 3;
            } else {
              var proposerForm = 0;
              insuredMembers = 1;
              addressindex = 2;
              nomineeForm = 3;
              medicalHis = 4;
            }
            // Code for review data page end
            this.reviewData = {
              propsr: this.proposerForm.value,
              nominee: this.nomineeForm.value,
              members: this.insuredMembers,
              medical: this.medicalHis,
              plan: this.plan,
              memberDetails: this.memberDetails,
              regUrlData: this.regUrlData,
              questionData: this.questionDataFromAPI,
              Premium: Math.round(this.companyData.Premium),
              proposerForm: proposerForm,
              insuredMembers: insuredMembers,
              nomineeForm: nomineeForm,
              addressindex: addressindex,
              medicalHis: medicalHis,
              StopCompanyInd: this.StopCompanyInd,
              address: this.communicationAddressForm.value,
              companyCode: this.companyData.CompanyCode,
              PlanType: this.companyData.PartnerId,
            };
            //console.log(this.reviewData);

            this.isreview = true;
          } else {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.ApplicationNo;
            this.errorLogDetails.CompanyName = ''
            this.errorLogDetails.ControllerName = "Health";
            this.errorLogDetails.MethodName = "SaveRegistrationHealthData";
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                //console.log(res);
              });
            console.error("HB server error : " + result.msg);
          }
        },
        (err) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      );
  }

  onClickBack(index: number) {
    this.tabIndex = index;
  }

  onClickEdit(event: number) {
    this.tabIndex = event;
    this.isreview = false;
  }
  public onChangeTab(event: any) {
    this.tabIndex = event.selectedIndex;
  }

  isHidden = (parQue_id: number): boolean =>
    this.medicalHis.find(
      (f) => f.QuestionID == parQue_id && f.QuestionValue == "Yes"
    )
      ? false
      : true;
  isChecked = (parQue_id: number, m_cd: number, RecordNo: number): boolean =>
    this.medicalHis.find(
      (f) =>
        f.QuestionID == parQue_id &&
        f.FamilyMemberCode == m_cd &&
        f.QuestionValue == "Yes" &&
        f.RecordNo == RecordNo
    )
      ? true
      : false;

  isdisable = (parQue_id: number, m_cd: number, RecordNo: number): boolean =>
    this.medicalHis.find(
      (f) =>
        f.QuestionID == parQue_id &&
        f.FamilyMemberCode == m_cd &&
        f.RecordNo == RecordNo
    )
      ? true
      : false;

  isNoneChecked(parQue_id: number): boolean {
    let allCheck = true;
    let existCnt = 0;
    const parent = this.medicalHis.filter(
      (f) => f.QuestionID == parQue_id && f.QuestionValue === "Yes"
    );
    if (parent.length > 0) {
      allCheck = false;
    }
    return allCheck;
  }

  isNoneForAllChecked = () => {
    for (const question of this.companyQueTree) {
      const frmGroup = this.qnaForm.controls[question.QuestionID] as FormGroup;
      if (!frmGroup.controls[`none${question.QuestionID}`].value) {
        return false;
      }
    }
    return true;
  };

  WeightSelection(insuredMembersForm: NgForm, index: number) {
    insuredMembersForm.controls["Weight" + index].setValidators([
      Validators.min(5),
      Validators.max(200),
    ]);
    insuredMembersForm.controls["Weight" + index].updateValueAndValidity();
    this.WeightValidation =
      insuredMembersForm.controls["Weight" + index].errors;
    this.WeightTouchedValidation =
      insuredMembersForm.controls["Weight" + index].touched;
  }

  displayFn(code: any) {
    //
    if (!code) return "";

    let index = this.stateList.findIndex((state) => state.StateCode == code);
    return this.stateList[index].StateDesc;
  }

  private ddlpraposalrelationList() {
    if (this.memberDetails.length == 1 || this.memberDetails.length == 2) {
      let List = this.memberDetails.filter(
        (m) => m.FamilyMemberCode == 3 || m.FamilyMemberCode == 4
      );
      if (this.memberDetails.length == List.length) {
        this.praposalrelationList = this.praposalrelationLists.filter(
          (m: any) => m.FamilyMemberCode == "Son" || m.FamilyMemberCode == "Daughter"
        );
      } else {
        this.praposalrelationList = this.praposalrelationLists;
      }
    } else {
      this.praposalrelationList = this.praposalrelationLists;
    }
  }

  GetFamilyMemberDesc(RecordNo: number, QuestionID: number, MemberDesc: any) {
    //
    //console.log(RecordNo, QuestionID, MemberDesc);
    this.medicalHis.find(
      (m) => m.QuestionID == QuestionID && m.RecordNo == RecordNo
    ).QuestionValue = MemberDesc;
    //console.log(this.medicalHis);
    //console.log(this.qnaForm);
  }

  noneForAll(event: any) {
    for (const question of this.companyQueTree) {
      this.onChekedChange(event, question, 0, 0, "none", 0);
      const frmGroup = this.qnaForm.controls[question.QuestionID] as FormGroup;
      if (event.checked) {
        frmGroup.controls[`none${question.QuestionID}`].setValue(true);
        let oldPremium = JSON.parse(sessionStorage.getItem("companyData")!);
        this.companyData.Premium = oldPremium.Premium;
        this.SmokePremiumActual = oldPremium.Premium;
        this.multipalselection = 1;
      } else {
        frmGroup.controls[`none${question.QuestionID}`].setValue(false);
        this.multipalselection = 1;
      }
    }
    //console.log(this.qnaForm.value);
  }

  multipallist(event: any, child: any, FamilyMemberCode: any, RecordNo: any) {
    //
    if (event.checked) {
      for (const sub of child.Childrens)
        this.medicalHis.push({
          QuestionID: sub.QuestionID,
          FamilyMemberCode: FamilyMemberCode,
          QuestionValue: "No",
          RecordNo: RecordNo,
        });
    } else {
      for (const sub of child.Childrens) {
        let index = this.medicalHis.findIndex(
          (m) =>
            m.QuestionID == sub.QuestionID &&
            m.FamilyMemberCode == FamilyMemberCode
        );
        if (index !== -1) {
          this.medicalHis.splice(index, 1);
        }
      }
    }
    //console.log(this.medicalHis);
    // this.medicalHis.push({
    //   QuestionID: sub.QuestionID,
    //   FamilyMemberCode: selectedMemberCode,
    //   QuestionValue: "No",
    //   RecordNo: RecordNo,
    // });
  }

  multipalselect(event: any) {
    //
    if (event.checked) {
      this.multipalselection++;
    } else {
      if (this.multipalselection > -1) {
        this.multipalselection--;
      }
    }

    //console.log(this.multipalselection);
  }

  GetFamilyMemberDescCheck(
    RecordNo: number,
    QuestionID: number,
    FamilyMemberCode: number,
    event: any
  ) {

    if (event.checked) {
      this.medicalHis.find(
        (m) => m.QuestionID == QuestionID && m.RecordNo == RecordNo
      ).QuestionValue = "Yes";
      //console.log(this.medicalHis);
    } else {
      this.medicalHis.find(
        (m) => m.QuestionID == QuestionID && m.RecordNo == RecordNo
      ).QuestionValue = "No";
      // FamilyMemberCode: 2, QuestionValue: "No", RecordNo: 1050
      let QuestionValue = this.medicalHis.filter(
        (m) =>
          m.FamilyMemberCode == FamilyMemberCode &&
          m.RecordNo == RecordNo &&
          m.QuestionValue == "Yes" &&
          m.subchild == 1
      );
      QuestionValue.forEach((element) => {
        //
        let index = this.medicalHis.findIndex(
          (m) =>
            m.QuestionID == element.QuestionID &&
            m.RecordNo == element.RecordNo &&
            m.QuestionValue == "Yes"
        );
        if (index !== -1) {
          this.medicalHis.splice(index, 1);
        }
      });
      //console.log(this.medicalHis);
    }
  }

  onChangeChild(event: any, parentQuestionID: number, RecordNo: number, index: number) {

    const rowToUpdate = this.childValidation.find(
      (p) =>
        p.q_id == parentQuestionID &&
        p.m_Id == RecordNo
    );

    if (rowToUpdate) {
      rowToUpdate.isChildValid = this.isChildCheked(parentQuestionID, index);
    }

    console.log(this.childValidation)
  }

  private isChildCheked = (Questionid: number, index: number): boolean => {

    const obj = [];
    const P_Question: IQuestionsTree | undefined = this.companyQueTree.find((c) => c.QuestionID == Questionid);

    for (const question of P_Question!.Childrens) {

      const frmArry = this.qnaForm.controls[question.QuestionID] as FormArray;
      console.log(frmArry);

      obj.push(frmArry.controls[index].value);

      //     this.errMsg = "Please select atleast one sub disease from all selected members.";
      //     flag = true;
      //     break;

    }

    return obj.some(val => val === true);
  }

  subenabledisable(event: any, child: any, selectedIndx: any) {
    //
    for (const sub1 of child.Childrens) {
      // work for all event except "none"
      const frmArry = this.qnaForm.controls[sub1.QuestionID] as FormArray;
      if (event.checked) {
        frmArry.controls[selectedIndx].enable();
        frmArry.controls[selectedIndx].setValue("");
      } else {
        frmArry.controls[selectedIndx].disable();
        frmArry.controls[selectedIndx].setValue("");
      }
    }
  }

  // ReCallQuotation(event:any,option:any,ReCallQuotation:any='')
  // {
  //   //
  //   if(ReCallQuotation == 1)
  //   {
  //     this.showLoader = true;
  //   let PEDData = 0;
  //   if(event.checked && option == 1)
  //   {
  //     PEDData = 1;
  //   }
  //   else if(event.checked && option == 0)
  //   {
  //     PEDData = 0;
  //   }
  //   let QuotationData: IHealthInsPlanUrlsResponse = {
  //     ProductCode: this.companyData.ProductCode,
  //     ApplicationNo: this.ApplicationNo.toString(),
  //     ApplicationNoOdp:  this.ApplicationNoOdp.toString(),
  //     Age: "",
  //     APIBaseUrl: this.companyData.APIBaseUrl,
  //     APIMethod: this.companyData.APIMethod,
  //     GenderDesc: "",
  //     MobileNo: "",
  //     Partnerid: "",
  //     Pincode: "",
  //     PEDData:PEDData
  // }
  //   this._healthBuyPlanService.getInsuranceCompanyPlan(QuotationData, Number(this.plan.SumInsured), this.companyData.Tanure).subscribe(result => {
  //     this.showLoader = false;
  //     if (result.successcode == "1" && result.data != null) {
  //      //console.log(result)
  //       this.companyData.Premium = result.data.Premium;
  //       this.SmokePremiumActual = result.data.Premium;
  //     }
  //   });
  //   }
  // }


  get pf() {
    return this.proposerForm.controls;
  }
  get cf() {
    return this.communicationAddressForm.controls;
  }
}

export function RequireMatch(control: AbstractControl) {
  const selection: any = control.value;

  if (typeof selection === "string") {
    return { incorrect: true };
  }
  return null;
}
