import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
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
  selector: "app-buyplan-reliance",
  templateUrl: "./buyplan-reliance.component.html",
  styleUrls: ["./buyplan-reliance.component.css"],
})
export class BuyplanRelianceComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];
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
    setMaxDateForReliance(year, month, date);
  minDate = (year: number, month = 0, date = 0) =>
    setMinDateForReliance(year, month, date);

  minDateHdfc = (year: number, month = 0, date = 0) =>
    setMinDateForHdfc(year, month, date)

  setMinDays = (days = 0) => setMinDays(days);

  minDateCur = (year: number, month = 0, date = 0) =>
    setMinDateCurent1(year, month, date);

  maxDateCur = (year: number, month = 0, date = 0) =>
    setMaxDateCurent1(year, month, date);

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
  // GenderSalutation: any = "";
  selectedSalutation: string = Salutation[0].value;

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
      AddArea: [
        { value: "", disabled: true },
        [Validators.required, RequireMatch],
      ],

      AddPincode: [{ value: "", disabled: true }, [Validators.required]],
      city: [
        { value: "", disabled: true },
        [Validators.required, RequireMatch],
      ],
      state: ["", [Validators.required]],
      StateCode: [""],
      StateDesc: [""],
      Tanure: "",
      MarriedStatusCode: "",
      MarriedStatusDesc: "",
      OccupationCode: "",
      OccupationDesc: "",
    });
    this.communicationAddressForm = _fb.group({
      AddFlatNo: ["", [Validators.required]],
      address: ["", [Validators.required]],
      AddArea: ["", [Validators.required, RequireMatch]],
      AddPincode: ["", [Validators.required]],
      city: ["", []],
      state: ["", [Validators.required]],
      identity: ["", [Validators.required]],
      IdentityNo: [""],
      SocialStatusBpl: [""],
      SocialStatusDisabled: [""],
      SocialStatusInformal: [""],
      SocialStatusUnorganized: [""],
      CityCode: [""],
      CityDesc: [""],
      StateCode: [""],
      StateDesc: [""],
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


    $("input").attr("autocomplete", "off");
    // $("input").attr("type", "abcdefghijklmnopqrstuvwxyz");
    try {
      this._subscriptions.push(
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
            PartnerId: "",
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
          console.log(this.companyData);

          // this.get(
          //   this.ApplicationNo,
          //   this.ApplicationNoOdp,
          //   Number(this.plan.CompanyCode),
          //   p_cd == "COMPREHENSIVE"
          //     ? p_cd
          //     : p_cd == "COMPREHENSIVEIND"
          //     ? p_cd
          //     : "0"
          // );
          console.log(this.plan.ProductCode);
          // pass product code only if the company is reliance or if company is hdfc-ergo and the product code is 2804(optima) otherwise pass zero
          let productCode =
            this.companyData.CompanyCode == "11" ||
              (this.companyData.CompanyCode == "14" &&
                +this.plan.ProductCode == 2805)
              ? this.plan.ProductCode
              : 0;
          this.get(
            this.ApplicationNo,
            this.ApplicationNoOdp,
            Number(this.plan.CompanyCode),
            productCode // ProductCode
          );
          const tan = Number(decrypt(p.get("tanure")));
          this.proposerForm.patchValue({
            Tanure: tan ? 1 : tan,
          });
          // if(this.companyData.CompanyCode == "14")
          //   {this.proposerForm.patchValue({
          //   PropGenderTitle : 'Mr',
          //   gender :'Male'
          // })}
          // console.log(this.proposerForm.get('gender').value);
        })
      );

      this.proposerForm.controls["city"].disable();
      // this.proposerForm.controls["AddPincode"].disable();
    } catch (error) {
      console.error("HB Client error: " + error);
    }
    this.updateIdentityValidity();
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    console.log(this.insuredMembersForm);

  }

  public ProposerInsurer(event: any) {
    this.tabIndex = 0;
    if (event.checked == true) {
      this.Proposer_Insurer = true;
    } else {
      this.Proposer_Insurer = false;
    }
    // this.proposerForm.reset();
    // if (this.stateList.length == 0) {
    // this.proposerForm.controls["city"].enable();
    // this.proposerForm.controls["AddPincode"].enable();
    // this.proposerForm.patchValue({
    // state: this.memberDetails[0]["StateDesc"],
    // city: this.memberDetails[0]["CityDesc"],
    // AddPincode: this.memberDetails[0]["Pincode"],
    // });
    // }
  }

  gen: any = [{ GenderCode: null, GenderDesc: "" }];

  public onSelectSalutation(e: any) {

    let salutation = this.proposerForm.get("PropGenderTitle");
    console.log(e)
    if (e.value == "Mr") {

      this.gen = this.genderList.filter(r => r.GenderCode == 1)

    } else { //if((e.value == "Ms" || e.value == "Mrs" || e.value == "Miss"))
      this.gen = this.genderList.filter(r => r.GenderCode == 2)
      console.log(this.gen, e.value, salutation);
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
    const control: any = this.communicationAddressForm.get("IdentityNo");
    this._subscriptions.push(
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
        })
    );
  }

  filteredCityListForMemebers!: Observable<ICity[]>;
  filteredStateListForMembers!: Observable<IState[]>;
  private get(id: number, idOdp: number, c_code: number, ProductCode: any) {
    this.showLoader = true;
    this._subscriptions.push(
      this._healthBuyPlanService
        .getHealthMasterData(id, idOdp, c_code, ProductCode)
        .subscribe(
          (result) => {
            console.log("test", result);
            this.showLoader = false;

            // proposer filtering
            this.filteredProposerStateList = this.proposerForm.controls[
              "state"
            ].valueChanges.pipe(
              startWith(""),
              map((state) => this._filterState(state))
            );
            this.filteredStateListForMembers =
              this.communicationAddressForm.controls["state"].valueChanges.pipe(
                startWith(""),
                map((state) => this._filterState(state))
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
              this.cities = result.data["city"];
              this.genderList = result.data["gender"];
              this.occupations = result.data["occupation"];
              this.pincodeList = result.data["pincode"];
              this.appointeList = result.data["appointe"];

              // this.setPincode();
              this.getArea();
              // this.companyQuestions=result.data['companyquestions']
              //this.nomineerelationList = this.nomineerelationList.filter(m => m.FamilyMemberCode != 1);
              this.ddlpraposalrelationList();
              //this.Proposer_Insurer = true;
              //this.Proposer_Insurer_Not_Self = true;
              //this.ProposerInsurerNotSelectSelf();
              this.memberDetails.forEach((member, index) => {

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
              console.log(
                "-----------------",
                this.memberDetails[0]["StateDesc"]
              );
              this.CommonForm.patchValue({
                EmailId: this.memberDetails[0]["EmailId"],
                MobileNo: this.memberDetails[0]["MobileNo"],
              });

              // this.proposerForm.get("AddPincode").enable();
              // this.proposerForm.patchValue({
              //   AddPincode: this.memberDetails[0]["Pincode"],
              // });

              this.communicationAddressForm.patchValue({
                state: this.memberDetails[0]["StateDesc"],
                city: this.memberDetails[0]["CityDesc"],
                AddPincode: this.memberDetails[0]["Pincode"],
              });
              console.log(this.proposerForm.value);
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
                  console.log(res);
                });
            }
          },
          (err: any) => {
            this.showLoader = false;
            this._errorHandleService.handleError(err);
          }
        )
    );
  }
  get f() {
    return this.proposerForm.controls;
  }

  getArea() {


    const stateCodeForMember: string = this.stateList.find(
      (state: any) =>
        state.StateDesc.toUpperCase() ===
        this.memberDetails[0].StateDesc.toUpperCase()
    )!.StateCode;
    let citiesForGivenState = this.cities.filter(
      (state) => state.StateCode == stateCodeForMember
    );
    // if(this.memberDetails[0].StateDesc.toUpperCase() === 'DELHI' )
    // {}
    // console.log(this.memberDetails[0].CityDesc.toUpperCase() +""+ this.memberDetails[0].StateDesc.toUpperCase())
    const cityIdForMember: string = citiesForGivenState.find(
      (city) =>
        city.CityDesc.toUpperCase() ===
        this.memberDetails[0].CityDesc.toUpperCase()
    )!.CityCode;
    console.log(cityIdForMember);
    const pincodeForMember = this.memberDetails[0].Pincode;
    // this.proposerForm.get("AddArea").setValue("");
    // this.areaForProposer = this._healthBuyPlanService
    //   .getAreaByStateCityPincode(
    //     stateCodeForProposer,
    //     cityIdForProposer,
    //     pincode
    //   )
    //   .pipe(
    //     mergeMap((res) => {
    //       return this.proposerForm.get("AddArea").valueChanges.pipe(
    //         startWith(""),
    //         //debounceTime(100),
    //         map((value) => this._filterArea(value, res))
    //       );
    //     })
    //   );

    this.areaForMembers = this.getAreaEndPoint(
      stateCodeForMember,
      cityIdForMember,
      pincodeForMember
    )!.pipe(
      mergeMap((res) => {
        return this.communicationAddressForm.get("AddArea")!.valueChanges.pipe(
          startWith(""),
          //debounceTime(100),
          map((value) => this._filterArea(value, res))
        );
      })
    );
  }

  filteredPincodeList!: Observable<any[]>;
  // setPincode() {
  //   
  //   this.filteredPincodeList = this.proposerForm
  //     .get("AddPincode")
  //     .valueChanges.pipe(
  //       startWith(""),
  //       map((pin) => this._filterPincode(pin))
  //     );
  // }

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

    console.log(date);
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

    // arr = this.data;
    console.log("Question", arr);
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
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.ParentID) {
          mappedElem.Members = this.memberDetails.slice();
          mappedArr[mappedElem["ParentID"]]["Childrens"].push(mappedElem);
          // mappedArr[mappedElem['ParentID']]['Members'] = this.memberDetails.slice();;
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          mappedElem.Members = this.memberDetails.slice();
          tree.push(mappedElem);
        }
      }
    }

    this.companyQueTree = tree;
    console.log(this.companyQueTree);
    await this.createQAForm(tree);
    // console.log(JSON.stringify(tree))
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
    console.log("this.qnaForm", this.qnaForm);
    // console.log("Tree", tree)
  };

  //#region  all type filters functions

  private _filterState(value: string): IState[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.stateList.filter(
      (row) => row.StateDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterCity(value: string, cityList?: ICity[]): ICity[] {


    if (typeof value !== "string") return [];
    const filterBy = value ? value.toLowerCase() : value;
    return cityList!.filter(
      (row) => row.CityDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterArea(value: string, areaData: any): ICity[] {

    if (typeof value !== "string" || !areaData || !areaData.data) return [];
    const filterBy = value ? value.toLowerCase() : value;
    return areaData["data"].filter(
      (row: { [x: string]: string; }) => row["AreaDesc"].toLowerCase().indexOf(filterBy) === 0
    );
  }
  // private _filterPincode(value: string): any[] {
  //   
  //   const filterBy = value ? value.toLowerCase() : value;
  //   return this.stateList.filter((row) => {
  //     if (row.StateDesc) row.StateDesc.includes(filterBy);
  //   });
  // }

  private _filterPincode(value: string, pincodeList?: IPincode[]): IPincode[] {

    // const filterBy = value ? value.toLowerCase() : value;
    return pincodeList!.filter((row: any) => {
      if (row.Pincode) return row.Pincode.includes(value);
    });
  }

  proposerCityDisplayFn(cityObject: { CityDesc: any; }) {
    return cityObject ? cityObject.CityDesc : "";
  }

  proposerAreaDisplayFn(areaObject: { [x: string]: any; }) {
    return areaObject ? areaObject["AreaDesc"] : "";
  }

  async onSelectState(formName: string): Promise<any> {
    if (formName === "proposer") {

      const stateCode: string = this.proposerForm.get("state")!.value;
      const stateDesc = this.stateList.find(
        (state) => +state.StateCode === +stateCode
      )!.StateDesc;
      this.proposerForm.patchValue({
        StateDesc: stateDesc,
      });
      const citiesForSelectedState = this.cities.filter(
        (city) => city.StateCode === stateCode
      );
      if (!stateCode) return false;
      this.proposerForm.controls["city"].enable();
      this.proposerForm.controls["city"].reset();

      this.proposerForm.controls["AddPincode"].reset();
      this.proposerForm.controls["AddArea"].reset();
      this.filteredCityList = this.proposerForm.controls[
        "city"
      ].valueChanges.pipe(
        startWith(""),
        map((city) => this._filterCity(city, citiesForSelectedState))
      );
    } else {
      const stateCode: string =
        this.communicationAddressForm.get("state")!.value;
      const stateDesc = this.stateList.find(
        (state) => +state.StateCode === +stateCode
      )!.StateDesc;
      this.communicationAddressForm.patchValue({
        StateDesc: stateDesc,
        StateCode: stateCode,
      });
      const citiesForSelectedState = this.cities.filter(
        (city) => city.StateCode === stateCode
      );
      if (!stateCode) return false;
      this.communicationAddressForm.controls["city"].enable();
      this.communicationAddressForm.controls["city"].reset();
      this.filteredCityListForMemebers = this.communicationAddressForm.controls[
        "city"
      ].valueChanges.pipe(
        startWith(""),
        map((city) => this._filterCity(city, citiesForSelectedState))
      );
    }
  }

  areaForProposer!: Observable<any[]>;
  areaForMembers!: Observable<any[]>;
  // async onSelectCity(formName) {
  //   const pincode: string = this.memberDetails[0].Pincode;

  //   if (formName === "proposer") {
  //     const cityIdForProposer: number =
  //       this.proposerForm.get("city").value["CityCode"];
  //     const stateCodeForProposer: string = this.proposerForm.get("state").value;
  //     this.proposerForm.get("AddArea").setValue("");
  //     this.areaForProposer = this._healthBuyPlanService
  //       .getAreaByStateCityPincode(
  //         stateCodeForProposer,
  //         cityIdForProposer,
  //         pincode
  //       )
  //       .pipe(
  //         mergeMap((res) => {
  //           return this.proposerForm.get("AddArea").valueChanges.pipe(
  //             startWith(""),
  //             //debounceTime(100),
  //             map((value) => this._filterArea(value, res))
  //           );
  //         })
  //       );
  //   } else {
  //     const cityIdForMembers: number =
  //       this.communicationAddressForm.get("city").value["CityCode"];
  //     const stateCodeForMembers: string =
  //       this.communicationAddressForm.get("state").value;

  //     this.communicationAddressForm.get("AddArea").setValue("");

  //     this.areaForMembers = this._healthBuyPlanService
  //       .getAreaByStateCityPincode(
  //         stateCodeForMembers,
  //         cityIdForMembers,
  //         pincode
  //       )
  //       .pipe(
  //         mergeMap((res) => {
  //           return this.communicationAddressForm
  //             .get("AddArea")
  //             .valueChanges.pipe(
  //               startWith(""),
  //               //debounceTime(100),
  //               map((value) => this._filterArea(value, res))
  //             );
  //         })
  //       );
  //   }
  // }

  onSelectCity(formName: any) {

    this.proposerForm.get("AddPincode")!.enable();
    this.proposerForm.get("AddPincode")!.reset();

    this.proposerForm.get("AddArea")!.reset();

    const cityCodeForProposer: string =
      this.proposerForm.get("city")!.value["CityCode"];
    // const pincode = this.proposerForm.get("AddPincode").value;
    const pincodesForSelectedCity = this.pincodeList.filter(
      (pincode) => pincode.CityCode === cityCodeForProposer
    );

    this.filteredPincode = this.proposerForm.controls[
      "AddPincode"
    ].valueChanges.pipe(
      startWith(""),
      map((pin) => this._filterPincode(pin, pincodesForSelectedCity))
    );

    // this.areaForMembers = this._healthBuyPlanService
    //   .getAreaByStateCityPincode(
    //     stateCodeForProposer,
    //     cityCodeForProposer,
    //     pincode
    //   )
    //   .pipe(
    //     mergeMap((res) => {
    //       return this.communicationAddressForm.get("AddArea").valueChanges.pipe(
    //         startWith(""),
    //         //debounceTime(100),
    //         map((value) => this._filterArea(value, res))
    //       );
    //     })
    //   );
  }

  getAreaEndPoint(stateCodeForProposer: string, cityIdForProposer: string, pincode: string): any {
    //reliance
    if (this.companyData.CompanyCode == "11")
      return this._healthBuyPlanService.getAreaByStateCityPincode(
        stateCodeForProposer,
        cityIdForProposer,
        pincode
      );
    //hdfc-ergo
    if (this.companyData.CompanyCode == "14")
      return this._healthBuyPlanService.getAreaByStateCityPincodeHDFC(
        stateCodeForProposer,
        cityIdForProposer,
        pincode
      );
    //sbi
    if (this.companyData.CompanyCode == "7")
      return this._healthBuyPlanService.getAreaByStateCityPincodeForSBI(
        stateCodeForProposer,
        cityIdForProposer,
        pincode
      );
  }

  // hdfcPropserSalutationValidation(){
  //  const sal = this.proposerForm.get('PropGenderTitle').value;
  //  this.GenderSalutation = (sal == 'Ms' || sal == 'Miss' || sal == 'Mrs') ? 'Female' : 'Male';
  // }
  onSelectPincode(formName: string) {

    if (formName === "proposer") {
      this.proposerForm.get("AddArea")!.enable();
      this.proposerForm.get("AddArea")!.reset();
      const cityIdForProposer: string =
        this.proposerForm.get("city")!.value["CityCode"];
      const stateCodeForProposer: string = this.proposerForm.get("state")!.value;
      const pincode = this.proposerForm.get("AddPincode")!.value;
      // this.proposerForm.get("AddArea").setValue("");
      this.areaForProposer = this.getAreaEndPoint(
        stateCodeForProposer,
        cityIdForProposer,
        pincode
      )!.pipe(
        mergeMap((res) => {
          return this.proposerForm.get("AddArea")!.valueChanges.pipe(
            startWith(""),
            //debounceTime(100),
            map((value) => this._filterArea(value, res))
          );
        })
      );
    }
  }
  //   // const city: string = this.proposerForm.get("city").value;
  //   // if (!city) return false;

  //   // this.proposerForm.controls["AddPincode"].enable();
  //   // this.cityPincodes = this.statePincodes.filter(
  //   //   (pin) => pin.CityCode == city
  //   // );
  //   // this.proposerForm.controls["AddPincode"].reset();
  //   // this.filteredPincode = this.proposerForm.controls[
  //   //   "AddPincode"
  //   // ].valueChanges.pipe(
  //   //   startWith(""),
  //   //   //debounceTime(100),
  //   //   map((value) => this._filterPincode(value))
  //   // );

  //   //  const pins= new Promise<IPincode[]>(() =>
  //   //      this.pincodeList.filter(pin => pin.CityCode == city)
  //   //  );
  //   //   pins.then(p => this.pincodeList=p)
  // }

  async AddressonSelectState(): Promise<any> {


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
    // this.filteredPincode = this.communicationAddressForm.controls[
    //   "AddPincode"
    // ].valueChanges.pipe(
    //   startWith(""),
    //   //debounceTime(100),
    //   map((value) => this._filterPincode(value))
    // );
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

    console.log(this.qnaForm);
    console.log(node);

    const parent = this.medicalHis.filter(
      (item) => item.QuestionID == node.QuestionID
    ); //check selected exist or not

    // async onChekedChange(event: any, node: IQuestionsTree, selectedMemberCode: number, op: string, selectedIndx: number) {
    //   const parent = this.medicalHis.filter(item => item.QuestionID == node.QuestionID)//check selected exist or not
    if (selectedMemberCode > 0 && op == "") {
      for (const sub of node.Childrens) {
        // work for all event except "none"
        const frmArry = this.qnaForm.controls[sub.QuestionID] as FormArray;
        if (event.checked) frmArry.controls[selectedIndx].enable();
        else frmArry.controls[selectedIndx].disable();

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
            console.log(sub);
            for (var i = 0; i < node.Members.length; i++) {
              frmArry.controls[i].disable();
              frmArry.controls[i].setValue("");
            }


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
              console.log("sdasdasdasdasdasdasdas", sub1);
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
        }
      }

      if (
        (node.QuestionID == 230 ||
          node.QuestionID == 242 ||
          node.QuestionID == 250) &&
        op != ""
      ) {
        this.multipalselection = 1;
      } else if (
        (node.QuestionID == 230 ||
          node.QuestionID == 242 ||
          node.QuestionID == 250) &&
        op == ""
      ) {
        this.multipalselection = 0;
      }
      console.log(this.medicalHis);
      console.log(this.qnaForm.value);
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
        } else {
          frmGroup.controls[`none${node.QuestionID}`].setValue(false);
        }
      }

      if (
        (node.QuestionID == 230 ||
          node.QuestionID == 242 ||
          node.QuestionID == 250) &&
        op != ""
      ) {
        this.multipalselection = 0;
      } else if (
        (node.QuestionID == 230 ||
          node.QuestionID == 242 ||
          node.QuestionID == 250) &&
        op == ""
      ) {
        this.multipalselection = 1;
      }
      console.log(this.medicalHis);
      console.log(this.qnaForm.value);
    }
    console.log(this.multipalselection);
  }

  onSubmitProposer(): any {

    this.errMsg = "";
    console.log(this.proposerForm.value);
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
        console.log(this.proposerForm);
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
    console.log(this.insuredMembers);
  }

  onSubmitCommunicationAddress(): any {

    console.log(this.communicationAddressForm.value);
    this.proposerForm.controls["city"].enable();
    this.proposerForm.controls["AddPincode"].enable();
    this.proposerForm.controls["AddArea"].enable();
    this.proposerForm.controls["AddFlatNo"].enable();
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
      console.log(this.proposerForm.value);
    }

    if (this.Proposer_Insurer == false) {
      this.tabIndex = 2;
    } else {
      this.tabIndex = 3;
    }
  }

  onSubmitNominee(): any {

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
      // console.log("this.companyQueTree", this.companyQueTree);
      this.onSubmitReview();
    }
  }

  async onSubmitReview(): Promise<any> {

    const stateCode = this.stateList.find(
      (state) =>
        state.StateDesc.toUpperCase() ===
        this.communicationAddressForm.get("state")!.value.toUpperCase()
    )!.StateCode;
    const cityCode = this.cities.find(
      (city) =>
        city.CityDesc.toUpperCase() ===
        this.communicationAddressForm.get("city")!.value.toUpperCase()
    )!.CityCode;
    const cityDesc = this.communicationAddressForm
      .get("city")!
      .value.toUpperCase();

    this.communicationAddressForm.patchValue({
      // communicationForm: state desc is inside 'state' propoerty
      // proposerForm: state 'code' is inside 'state' propoerty

      StateCode: stateCode,
      CityCode: cityCode,
      CityDesc: cityDesc,
    });
    if (this.companyData.companyCode == '14') this.proposerForm.controls['gender']!.setValue((this.proposerForm.get('PropGenderTitle')?.value == ('Mr')) ? 'Male' : 'Female')
    console.log("this.proposerForm.value", this.proposerForm.value);
    console.log(
      "this.communicationAddressForm.value",
      this.communicationAddressForm.value
    );


    var medicalHisValidation = this.qnaForm.value;
    console.log(medicalHisValidation);
    this.companyData.Premium = this.SmokePremiumActual;
    this.SmokePremium = this.SmokePremiumActual;
    this.StopCompanyInd = 0;
    this.ExtraLoading = 0;
    //var medicalHisValidation = this.qnaForm.value;
    //console.log("qnaForm",this.qnaForm);
    console.log(this.companyQueTree);

    // validation futer generl
    if (this.companyData.CompanyCode == 11 || this.companyData.CompanyCode == 14) {
      for (let i = 0; i < this.companyQueTree.length; i++) {
        if (this.companyQueTree[i].CompanyStopInd == true) {
          this.medicalHisAns = this.medicalHis.filter(
            (m) => m.QuestionID === this.companyQueTree[i].QuestionID
          );
          if (this.medicalHisAns.length > 0) {
            console.log(this.companyQueTree[i].CompanyStopValue);
            console.log(this.medicalHisAns[0].QuestionValue);
            for (let A = 0; A < this.medicalHisAns.length; A++) {
              if (
                this.companyQueTree[i].CompanyStopValue ===
                this.medicalHisAns[A].QuestionValue
              ) {
                //this.errMsg = "Please Yes Checkbox";
                this.StopCompanyInd = 1;
              }
            }
            console.log(this.medicalHisAns);
          }
        }
        if (this.companyQueTree[i].CompanyLoadInd == true) {

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
              console.log(this.companyQueTree[i].Childrens[c].CompanyStopValue);
              console.log(this.medicalHisAns[0].QuestionValue);
              for (let A = 0; A < this.medicalHisAns.length; A++) {
                if (
                  this.companyQueTree[i].Childrens[c].CompanyStopValue ===
                  this.medicalHisAns[A].QuestionValue
                ) {
                  //this.errMsg = "Please Yes Checkbox";
                  this.StopCompanyInd = 1;
                }
              }
              console.log(this.medicalHisAns);
            }
          }
          if (this.companyQueTree[i].Childrens[c].CompanyLoadInd == true) {

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


    // Previous working
    for (let keys in medicalHisValidation) {
      let ind = 0;
      let tvalue;
      $.each(medicalHisValidation[keys], function (key, val) {
        if (val === true) {
          ind = 1;
          tvalue = val;
        } else {
          tvalue = val;
        }
        console.log(val);
      });
      if (ind === 0) {
        if (tvalue === false) {
          this.errMsg = "Please fill all details correctly.";
          return false;
        }
      }
      console.log(medicalHisValidation[keys]);
    }

    let i = 0;
    this.errMsg = "";
    if (this.qnaForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    // else {
    //   if (this.multipalselection == 0) {
    //     this.errMsg = "Please fill all details correctly.";
    //     return false;
    //   }
    // }

    this.showLoader = true;
    this._subscriptions.push(
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
          this.ExtraLoading,
          this.Proposer_Insurer,

        )
        .subscribe(
          (result) => {
            this.showLoader = false;
            if (result.successcode == "1") {
              this.regUrlData = result.data.Table[0];
              this.questionDataFromAPI = result.data.Table1;
              console.log(this.regUrlData);
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
                  console.log(res);
                });

              console.error("HB server error : " + result.msg);
            }
          },
          (err) => {
            this.showLoader = false;
            this._errorHandleService.handleError(err);
          }
        )
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

    if (!code || isNaN(code)) return "";

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
          (m: { FamilyMemberCode: string; }) => m.FamilyMemberCode == "Son" || m.FamilyMemberCode == "Daughter"
        );
      } else {
        this.praposalrelationList = this.praposalrelationLists;
      }
    } else {
      this.praposalrelationList = this.praposalrelationLists;
    }
  }

  GetFamilyMemberDesc(RecordNo: number, QuestionID: number, MemberDesc: any) {

    console.log(RecordNo, QuestionID, MemberDesc);
    this.medicalHis.find(
      (m) => m.QuestionID == QuestionID && m.RecordNo == RecordNo
    ).QuestionValue = MemberDesc;
    console.log(this.medicalHis);
    console.log(this.qnaForm);
  }

  noneForAll(event: { checked: any; }) {
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
    console.log(this.qnaForm.value);
  }

  multipallist(event: { checked: any; }, child: { Childrens: any; }, FamilyMemberCode: any, RecordNo: any) {

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
    console.log(this.medicalHis);
    // this.medicalHis.push({
    //   QuestionID: sub.QuestionID,
    //   FamilyMemberCode: selectedMemberCode,
    //   QuestionValue: "No",
    //   RecordNo: RecordNo,
    // });
  }

  multipalselect(event: any) {

    if (event.checked) {
      this.multipalselection++;
    } else {
      if (this.multipalselection > -1) {
        this.multipalselection--;
      }
    }

    console.log(this.multipalselection);
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
      console.log(this.medicalHis);
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
      console.log(this.medicalHis);
    }
  }

  subenabledisable(event: { checked: any; }, child: { Childrens: any; }, selectedIndx: any) {

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
  //   
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
  //       console.log(result)
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
  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

export function RequireMatch(control: AbstractControl) {
  const selection: any = control.value;
  if (typeof selection === "string") {
    return { incorrect: true };
  }
  return null;
}
export const setMinDateCurent1 = (year: number, month = 0, date = 0): Date => {
  const dt = new Date();
  // console.log(dt.getFullYear() - (year + 1));
  // console.log(dt.getMonth() )
  // console.log(dt.getDate() - (date - 1))
  //return new Date((+dt.getFullYear()) - year, (0), (1));
  // return new Date(
  //   +dt.getFullYear() - (year + 1 ) ,
  //   +dt.getMonth() ,
  //   +dt.getDate() - (date - 1) 
  // );

  if (year == 0) {
    //return new Date((+dt.getFullYear()) - year, (0), (1));
    return new Date(
      +dt.getFullYear() - (year + 1),
      +dt.getMonth() - month++,
      +dt.getDate() - date
    );
  } else {
    return new Date(
      +dt.getFullYear() - (year + 1),
      +dt.getMonth(),
      +dt.getDate() - (date - 1)
    );
  }
};
export const setMaxDateCurent1 = (year: number, month = 0, date = 0): Date => {
  //  console.log(year,month,date)
  const dt = new Date();
  // // return new Date((+dt.getFullYear()) - year, (11), (31));
  // // console.log(dt.getFullYear() - year);
  // // console.log(dt.getMonth() - month);
  // // console.log(dt.getDate() - date);
  // return new Date(
  //   +dt.getFullYear() - year ,
  //   +dt.getMonth() - month + 11,
  //   +dt.getDate() - date 
  // );

  if (year == 0) {
    return new Date(
      +dt.getFullYear() - year,
      +dt.getMonth() - (year != 0 ? month++ : 3),
      +dt.getDate() - date
    );
  } else {
    return new Date(
      +dt.getFullYear() - year,
      +dt.getMonth() - month + 11,
      +dt.getDate() - date
    );
  }
};
export const setMinDateForReliance = (year: number, month = 0, date = 0): Date => {
  const dt = new Date();
  // console.log(dt.getFullYear() - (year + 1));
  // console.log(dt.getMonth() - (month++ + 5 ) )
  // console.log(dt.getDate() - date)
  // return new Date((+dt.getFullYear()) - year, (0), (1));
  return new Date(
    +dt.getFullYear() - (year),
    +dt.getMonth() - (month++ + 11),
    +dt.getDate() - date
  );
};

export const setMinDateForHdfc = (
  year: number,
  month = 0,
  date = 0
): Date => {
  const dt = new Date();
  // console.log(dt.getFullYear() - (year ));
  // console.log(dt.getMonth() - (month + 12));
  // console.log(dt.getDate() - date);
  // return new Date((+dt.getFullYear()) - year, (0), (1));
  return new Date(
    +dt.getFullYear() - year,
    +dt.getMonth() - (month + 12),
    +dt.getDate() - date
  );
};


export const setMaxDateForReliance = (year: number, month = 0, date = 0): Date => {
  //  console.log(year,month,date)
  const dt = new Date();
  // return new Date((+dt.getFullYear()) - year, (11), (31));
  // console.log(dt.getFullYear() - year );
  // console.log(dt.getMonth() - month);
  // console.log(dt.getDate() - date);
  return new Date(
    +dt.getFullYear() - year,
    +dt.getMonth() - month,
    +dt.getDate() - date
  );
};
