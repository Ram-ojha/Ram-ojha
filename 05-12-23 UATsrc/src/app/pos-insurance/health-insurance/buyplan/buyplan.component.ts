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
import { HealthBuyPlanService } from "../../services/health-buyplan.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import {
  IFamilyMembers,
  IFamilyMemberDetails,
  IGender,
  IPlansHealth,
  IRegUrlData,
  ITpaData,
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
import { startWith, map } from "rxjs/operators";
import { EIdentity, EYesNo } from "src/app/models/insurance.enum";
import * as moment from "moment";
@Component({
  templateUrl: "./buyplan.component.html",
  styleUrls: ["./buyplan.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class BuyplanComponent implements OnInit, OnDestroy {
  // new by dilshad
  private _subscriptions: any[] = [];
  public Options = [{ op: "Yes" }, { op: "No" }];
  private ApplicationNo = 0;
  private ApplicationNoOdp = 0;
  tpaData: ITpaData[] = [];
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
  //maxDate = setMaxDate(0);
  maxDate = (year: number, month = 0, date = 0) =>
    setMaxDate(year, month, date);
  minDate = (year: number, month = 0, date = 0) =>
    setMinDate(year, month, date);
  setMinDays = (days = 0) => setMinDays(days);

  minDateCur = (year: number, month = 0, date = 0) => {
    if (this.companyData.CompanyCode == '17' && year < 10) {
      return setMinDateCurent(10, month, date);
    } else {
      return setMinDateCurent(year, month, date);
    }

  }

  maxDateCur = (year: number, month = 0, date = 0) => {
    if (this.companyData.CompanyCode == '17' && year < 10) {

      return setMaxDateCurent(10, month, date);
    } else {
      return setMaxDateCurent(year, month, date)
    }
  }

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
  DesignationOrBusiness: any;
  MarriedStatusCode: any;
  MarriedStatusDesc: any;
  productCode: any;
  QNO!: string;
  BMI!: number;
  BMIValidation: any;
  hadPolicy!: string;
  tpa: any;

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
      AddArea: ["", [Validators.required]],
      AddPincode: ["", [Validators.required]],
      city: ["", [Validators.required]],
      state: ["", [Validators.required]],
      Tanure: "",
      MarriedStatusCode: "",
      MarriedStatusDesc: "",
      OccupationCode: "",
      OccupationDesc: "",
      DesignationOrBusiness: "",
      tpa: [""],
      tpaBranch: [""],
    });
    this.communicationAddressForm = _fb.group({
      AddFlatNo: ["", [Validators.required]],
      AddArea: ["", [Validators.required]],
      AddPincode: ["", [Validators.required]],
      city: ["", [Validators.required]],
      state: ["", [Validators.required]],
      identity: ["", [Validators.required]],
      IdentityNo: [""],
      SocialStatusBpl: [""],
      SocialStatusDisabled: [""],
      SocialStatusInformal: [""],
      SocialStatusUnorganized: [""],
      tpa: [""],
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
  selectedSalutation: string = Salutation[0].value;

  ngOnInit() {

    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    this.companyData = JSON.parse(sessionStorage.getItem("companyData")!);
    console.log(this.insuredMembersForm);
    if (this.companyData.CompanyCode == '17') {
      this.Useridentity = this.Useridentity.filter((i) => (i.viewValue == "PAN"))
      console.log(this.Useridentity[0].viewValue);

    }

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
          if (this.companyData.CompanyCode == '15') {
            this.QNO = decrypt(p.get("qno"));
          }
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


          this.SmokePremiumActual = this.companyData.Premium;
          console.log(this.companyData);
          //by kishori
          console.log(this.plan.ProductCode);
          this.productCode =
            (this.companyData.CompanyCode == "12" || this.companyData.CompanyCode == "18") ? this.plan.ProductCode : 0;
          this.get(
            this.ApplicationNo,
            this.ApplicationNoOdp,
            Number(this.plan.CompanyCode),
            this.productCode.toString()
          );
          const tan = Number(decrypt(p.get("tanure")));
          this.proposerForm.patchValue({
            Tanure: tan ? 1 : tan,
          });
          if (this.companyData.CompanyCode == '15') this.TpaForOriental(this.QNO);
        })
      );

      this.proposerForm.controls["city"].disable();
      this.proposerForm.controls["AddPincode"].disable();
    } catch (error) {
      console.error("HB Client error: " + error);
    }
    this.updateIdentityValidity();
  }

  TpaForOriental(QNO: string) {
    console.log(QNO);
    this._healthBuyPlanService.getDetailsForTPAOriental(QNO).subscribe((res: any) => {
      console.log(res['data']);
      this.tpaData = res['data'];
      //  this.communicationAddressForm.patchValue({ tpa: this.tpaData });
    })

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
        city: this.memberDetails[0]["CityDesc"],
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

  private get(id: number, idOdp: number, c_code: number, p_code: string) {
    this.showLoader = true;
    console.log(p_code);
    this._subscriptions.push(
      this._healthBuyPlanService
        .getHealthMasterData(id, idOdp, c_code, p_code)
        .subscribe(
          (result) => {
            console.log("test", result);
            this.showLoader = false;
            this.filteredProposerStateList = this.proposerForm.controls[
              "state"
            ].valueChanges.pipe(
              startWith(""),
              map((state) => this._filterState(state))
            );
            this.filteredStateList = this.communicationAddressForm.controls[
              "state"
            ].valueChanges.pipe(
              startWith(""),
              map((state) => this._filterState(state))
            );

            if (result.successcode == "0" || result.successcode == null) {
              this.errorLogDetails.UserCode = this.posMobileNo;
              this.errorLogDetails.ApplicationNo = this.ApplicationNo;
              this.errorLogDetails.CompanyName = ''
              this.errorLogDetails.ControllerName = "Health";
              this.errorLogDetails.MethodName = "/GetHealthRegData";
              this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
              this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
              this._errorHandleService
                .sendErrorLog(this.errorLogDetails)
                .subscribe((res: any) => {
                  console.log(res);
                });
            }

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
              this.tpa = result.data["TPA"]

              debugger
              let gendercode = this.memberDetails.find(x => x.GenderDesc == "Male")

              console.log(this.memberDetails, gendercode);

              // if (this.companyData.CompanyCode == 18 && gendercode.GenderCode == 1) {
              //   this.occupations = occupations.filter(x => x.OccupationCode != 3)

              // } else {
              //   this.occupations = result.data["occupation"];
              // }
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

              this.communicationAddressForm.patchValue({
                state: this.memberDetails[0]["StateDesc"],
                city: this.memberDetails[0]["CityDesc"],
                AddPincode: this.memberDetails[0]["Pincode"],
              });
              console.log(this.proposerForm.value);
              if (result.data["companyquestions"])
                this.makeQuestionsTree(result.data["companyquestions"]);
            } else {
            }
            this.getTpaDetails(result);
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
    // console.log("this.qnaForm", this.qnaForm)
    // console.log("Tree", tree)
  };

  //#region  all type filters functions

  private _filterState(value: string): IState[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.stateList.filter(
      (row) => row.StateDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterCity(value: string): ICity[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.selectedCityList.filter(
      (row) => row.CityDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterPincode(value: string): IPincode[] {
    const filterBy = value ? value.toLowerCase() : value;
    return this.cityPincodes.filter(
      (row) => row.Pincode.trim().indexOf(filterBy) === 0
    );
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
  async onSelectCity(): Promise<any> {
    const city: string = this.proposerForm.get("city")!.value;
    if (!city) return false;

    this.proposerForm.controls["AddPincode"].enable();
    this.cityPincodes = this.statePincodes.filter(
      (pin) => pin.CityCode == city
    );
    this.proposerForm.controls["AddPincode"].reset();
    this.filteredPincode = this.proposerForm.controls[
      "AddPincode"
    ].valueChanges.pipe(
      startWith(""),
      //debounceTime(100),
      map((value) => this._filterPincode(value))
    );
    //  const pins= new Promise<IPincode[]>(() =>
    //      this.pincodeList.filter(pin => pin.CityCode == city)
    //  );
    //   pins.then(p => this.pincodeList=p)
  }

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
        else {
          frmArry.controls[selectedIndx].disable();
          frmArry.controls[selectedIndx].reset();
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
              QuestionValue: "",
              RecordNo: RecordNo,
            });
      } else {
        if (selectedMemberCode == 0) {
          //work when option is "none"
          //remove all child if exist and update parent
          for await (const sub of node.Childrens) {
            // const index = this.medicalHis.findIndex(
            //   (value) =>
            //     value.QuestionID == sub.QuestionID //&&
            //     //value.FamilyMemberCode == selectedMemberCode
            // );
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
              QuestionValue: "",
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
        }
      }

      // if (
      //   existCnt.length == 1 ||
      //   (selectedMemberCode == 0 && op == "none" && parent.length >= 0)
      // ) {
      //   // mean all are unchecked
      //   //remove all selected parent row element
      //   for await (const item of parent) {
      //     const index = this.medicalHis.findIndex(
      //       (value) => value.QuestionID == node.QuestionID
      //     );
      //     //&& value.RecordNo == RecordNo
      //     if (index != -1) this.medicalHis.splice(index, 1);
      //   }
      // } else {
      // update selected parent
      const rowToUpdate = parent.find(
        (p) =>
          p.QuestionID == node.QuestionID &&
          p.FamilyMemberCode == selectedMemberCode &&
          p.RecordNo == RecordNo
      );
      if (rowToUpdate) rowToUpdate.QuestionValue = "No";

      // if (this.isNoneChecked(node.QuestionID)) {
      //   let frmGroup = this.qnaForm.controls[node.QuestionID] as FormGroup;
      //   frmGroup.controls[`none${node.QuestionID}`].setValue(true);
      // }

      // check/uncheck none checkbox
      if (selectedMemberCode !== 0) {
        let frmGroup = this.qnaForm.controls[node.QuestionID] as FormGroup;
        if (this.isNoneChecked(node.QuestionID)) {
          frmGroup.controls[`none${node.QuestionID}`].setValue(true);
        } else {
          frmGroup.controls[`none${node.QuestionID}`].setValue(false);
        }
      }
      console.log(this.medicalHis);
      console.log(this.qnaForm.value);
    }
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


  BMICalculation(insuredMembersForm: NgForm) {

    // console.log(this.af.controls["Weight" + index])
    // return (control: AbstractControl) => {
    let bmiValidation: boolean = false;
    let ageValidation: boolean = false;
    this.memberDetails.forEach((x: IFamilyMemberDetails, index: number) => {
      let BMI;
      // const obj = { bmiValidation: false, bmiErrorMsg: '' }
      debugger

      let HeightInFeet = insuredMembersForm.controls["HeightInFeet" + index].value;
      let HeightInInch = insuredMembersForm.controls["HeightInInch" + index].value;
      let weight = +insuredMembersForm.controls["Weight" + index].value;
      let dob = insuredMembersForm.controls["DOB" + index].value
      console.log(insuredMembersForm.controls["HeightInFeet" + index])
      console.log(insuredMembersForm.controls["HeightInInch" + index])
      console.log(insuredMembersForm.controls["Weight" + index])
      var timeDiff = Math.abs(Date.now() - new Date(dob).getTime());
      let age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
      if (HeightInFeet && HeightInInch && weight) {
        HeightInFeet = HeightInFeet * 12;
        HeightInFeet += HeightInInch

        let devision = HeightInFeet / 39.37
        let squre = devision * devision;
        BMI = (+weight / squre)
        console.log(BMI, squre, devision, weight, HeightInInch, HeightInFeet);
        console.log(BMI, weight)

        if (age >= 15) {

          if (BMI < 12) {
            return bmiValidation = true
          } else if (BMI >= 12 && BMI <= 15) {
            return bmiValidation = true
          }
          //   else if (BMI > 15 && BMI <= 18) {
          //    // obj.bmiErrorMsg = "Policy is not allowed for BMI less than 18 and more than 30"
          //    // obj.bmiValidation = true
          //    return null;
          //  }
          //  else if (BMI > 18 && BMI <= 30) {
          //    return null;
          //  } 
          // else if (BMI > 30 && BMI <= 35) {
          //   // obj.bmiErrorMsg = "Policy is not allowed for BMI less than 30 and more than 35"
          //   // obj.bmiValidation = true
          //   return null;
          // }
          //   else if (BMI > 35 && BMI <= 37) {
          //    // obj.bmiErrorMsg = "BMI is very average {BMI < 35 && BMI <= 37}"
          //    // obj.bmiValidation = true
          //    return null
          //  } 
          else if (BMI > 37) {
            return bmiValidation = true
          }
        } else if (age < 15 && age >= 10) {

          if (BMI < 12) {
            return bmiValidation = true
          }
          //  else if (BMI >= 12 && BMI <= 15) {
          //    // obj.bmiErrorMsg = "Policy is not allowed for BMI less than 18 and more than 30"
          //    // obj.bmiValidation = true
          //    return null;
          //  } else if (BMI > 15 && BMI <= 18) {
          //    // obj.bmiErrorMsg = "Policy is not allowed for BMI less than 18 and more than 30"
          //    // obj.bmiValidation = true
          //    return null;
          //  }
          //  else if (BMI > 18 && BMI <= 30) {
          //    return null;
          //  } else if (BMI > 30 && BMI <= 35) {
          //    // obj.bmiErrorMsg = "Policy is not allowed for BMI less than 30 and more than 35"
          //    // obj.bmiValidation = true
          //    return null;
          //  } else if (BMI > 35 && BMI <= 37) {
          //    // obj.bmiErrorMsg = "BMI is very average {BMI < 35 && BMI <= 37}"
          //    // obj.bmiValidation = true
          //    return null
          //  }
          else if (BMI > 37) {
            return bmiValidation = true
          }
        } else {
          return ageValidation = true
        }

      }
      return;
    })

    return { bmiValidation: bmiValidation, ageValidation: ageValidation };

    // }
  }

  closeModal() {
    this.hadPolicy = 'none'

  }
  openModal() {
    this.hadPolicy = 'block'
  }


  onChangeDesignation(member: IFamilyMemberDetails, index: any) {
    console.log(member)
    if (this.insuredMembersForm && this.companyData.CompanyCode == 18) {
      if (member.OccupationDesc.OccupationCode == 1 || member.OccupationDesc.OccupationCode == 2 || member.OccupationDesc.OccupationCode == 6) {
        this.insuredMembersForm.form.controls["DesignationOrBusiness" + index].enable()
      } else {
        this.insuredMembersForm.form.controls["DesignationOrBusiness" + index].disable()
      }
    } else {
      this.insuredMembersForm.form.controls["DesignationOrBusiness" + index].disable()
    }
  }
  onSubmitMemberDetails(insuredMembersForm: NgForm): any {
    console.log(insuredMembersForm)
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

    if (this.companyData.CompanyCode == 17) {
      let err = this.BMICalculation(insuredMembersForm)

      if (err.bmiValidation === true) {
        this.openModal()
        this.errMsg = 'Policy not allowed on invalid BMI.'
        //this.CommonForm.invalid
        return false
      } else if (err.ageValidation === true) {
        this.errMsg = 'Age should not be less than 10.'
        return false;
      }
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
      // if(this.companyData.CompanyCode != 15){
      if (this.memberDetails[i].Age < 18) {
        let Occupation = this.occupations.filter(
          (m) => m.OccupationDesc.toLowerCase() == "student"
        );
        if (Occupation.length > 0) {
          this.OccupationCode = Occupation[0].OccupationCode;
          this.OccupationDesc = Occupation[0].OccupationDesc;
          this.DesignationOrBusiness = null;// this.insuredMembersForm.form.get(`DesignationOrBusiness${i}`).value;

        }
      } else {
        this.OccupationCode =
          this.memberDetails[i].OccupationDesc.OccupationCode;
        this.OccupationDesc =
          this.memberDetails[i].OccupationDesc.OccupationDesc;
        this.DesignationOrBusiness = this.insuredMembersForm.form.get(`DesignationOrBusiness${i}`)!.value;
      }
      // }


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
        this.proposerForm.controls["DesignationOrBusiness"].setValue(this.DesignationOrBusiness)
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
        DesignationOrBusiness: this.DesignationOrBusiness,
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

    console.log(this.communicationAddressForm.value.tpa)
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
      this.proposerForm.controls["tpa"].setValue(
        this.communicationAddressForm.controls["tpa"].value
      )

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
  getTpaDetails(apiResult: any) {
    this.tpaData = apiResult.data["TPA"];
    this.communicationAddressForm.patchValue({ tpa: this.tpaData[0] });
    console.log(this.communicationAddressForm.value.tpa);
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

  dummyQuestionsData: any[] = [
    {
      QuestionID: 41,
      QuestionValue: "NO",
      QuestionDesc:
        "Is the person already have Health Total policy of Future Generali?",
      IsParent: true,
      ParentID: 0,
      FamilyMemberDesc: "Self",
    },
    {
      QuestionID: 42,
      QuestionValue: "NO",
      QuestionDesc:
        "Is the person in good health and free from physical and mental disease or infirmity or medical complaints or deformity?",
      IsParent: true,
      ParentID: 0,
      FamilyMemberDesc: "Self",
    },
    {
      QuestionID: 43,
      QuestionValue: "NO",
      QuestionDesc:
        "Is the person have at present or in the past had any health complaints, signs or symptoms, or were taking treatment or were hospitalized for any illness.",
      IsParent: true,
      ParentID: 0,
      FamilyMemberDesc: "Self",
    },
    {
      QuestionID: 44,
      QuestionValue: "NO",
      QuestionDesc:
        "Is the person at present or in the past met with any accident / injury or were hospitalized or taking treatment for any accident injury?",
      IsParent: true,
      ParentID: 0,
      FamilyMemberDesc: "Self",
    },
    {
      QuestionID: 45,
      QuestionValue: "NO",
      QuestionDesc:
        "Is the person undergone any surgery in the past or going for any planned surgery at present / recent future?",
      IsParent: true,
      ParentID: 0,
      FamilyMemberDesc: "Self",
    },
    {
      QuestionID: 46,
      QuestionValue: "NO",
      QuestionDesc: "Is the person Indian resident?",
      IsParent: true,
      ParentID: 0,
      FamilyMemberDesc: "Self",
    },
    {
      QuestionID: 47,
      QuestionValue: "NO",
      QuestionDesc: "Whether any Health Insurance Policy has been declined?",
      IsParent: true,
      ParentID: 0,
      FamilyMemberDesc: "Self",
    },
    {
      QuestionID: 48,
      QuestionValue: "NO",
      QuestionDesc: "Do you smoke.",
      IsParent: true,
      ParentID: 0,
      FamilyMemberDesc: "Self",
    },
  ];

  async onSubmitReview(): Promise<any> {
    var medicalHisValidation = this.qnaForm.value;
    console.log(medicalHisValidation);
    this.companyData.Premium = this.SmokePremiumActual;
    this.SmokePremium = this.SmokePremiumActual;
    this.StopCompanyInd = 0;
    this.ExtraLoading = 0;
    //var medicalHisValidation = this.qnaForm.value;
    console.log(this.qnaForm.value);
    console.log(this.companyQueTree);

    // validation futer generl
    if (
      this.companyData.CompanyCode == 2 ||
      this.companyData.CompanyCode == 6 ||
      this.companyData.CompanyCode == 9 ||
      this.companyData.CompanyCode == 10 ||
      this.companyData.CompanyCode == 15 ||
      this.companyData.CompanyCode == 4
    ) {
      for (let i = 0; i < this.companyQueTree.length; i++) {
        if (this.companyQueTree[i].Childrens.length > 0) {
          for (let j = 0; j < this.companyQueTree[i].Childrens.length; j++) {
            if (this.companyQueTree[i].Childrens[j].CompanyStopInd == true) {
              this.medicalHisAns = this.medicalHis.filter(
                (m) =>
                  m.QuestionID ===
                  this.companyQueTree[i].Childrens[j].QuestionID
              );
              if (this.medicalHisAns.length > 0) {
                console.log(
                  this.companyQueTree[i].Childrens[j].CompanyStopValue
                );
                console.log(this.medicalHisAns[0].QuestionValue);
                for (let A = 0; A < this.medicalHisAns.length; A++) {
                  if (
                    this.companyQueTree[i].Childrens[j].CompanyStopValue ===
                    this.medicalHisAns[A].QuestionValue
                  ) {
                    //this.errMsg = "Please Yes Checkbox";
                    this.StopCompanyInd = 1;
                  }
                }
                console.log(this.medicalHisAns);
              }
            }
          }
        } else if (this.companyQueTree[i].CompanyStopInd == true) {
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
      }
    }

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
      // $.each(medicalHisValidation[keys], function (key, val) {
      //   if (val === true) ind = 1;
      // });
      // if (ind == 0) {
      //   // if (tvalue === false) {
      //   this.errMsg = "Please fill all details correctly.";
      //   return false;
      //   // }
      // }
      console.log(medicalHisValidation[keys]);
    }
    let i = 0;
    // Check Karna hai

    // for await (let row of this.medicalHis) {
    //   var arr = this.qnaForm.value;
    //   if (arr.hasOwnProperty(row.QuestionID)) {
    //     if (!arr[row.QuestionID][1]) {
    //       this.medicalHis[i].QuestionValue = convertToMydate(
    //         arr[row.QuestionID]
    //       );
    //       if (convertToMydate(arr[row.QuestionID]) === "NaN/NaN/NaN") {
    //         if (arr[row.QuestionID][0] === undefined) {
    //           
    //           this.medicalHis[i].QuestionValue = "No";
    //         } else {
    //           this.medicalHis[i].QuestionValue = arr[row.QuestionID][0];
    //         }
    //       } else {
    //         this.medicalHis[i].QuestionValue = convertToMydate(
    //           arr[row.QuestionID]
    //         );
    //       }
    //     }
    //   }
    //   i++;
    // }

    this.errMsg = "";
    if (this.qnaForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }

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
          this.ExtraLoading
        )
        .subscribe(
          (result) => {
            this.showLoader = false;
            console.log("--------------------", result);
            if (result.successcode == "1") {
              this.regUrlData = result.data.Table[0];
              this.questionDataFromAPI = result.data.Table1;
              // this._router.navigate(['../review-and-pay'], { relativeTo: this._route });
              console.log(this.regUrlData);
              var proposerForm: number = 0;
              var insuredMembers: number;
              var addressindex: number;
              var nomineeForm: number;
              var medicalHis: number;

              // if (this.insuredMembers.length == 1) {
              //   insuredMembers = 0;
              //   address = 1;
              //   nomineeForm = 3;
              //   medicalHis = 4;
              // } else {
              //   insuredMembers = 1
              //   nomineeForm = 2
              //   medicalHis = 3
              // }
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
    //this.setStates(event.selectedIndex);
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

  isNoneChecked(parQue_id: number): boolean {
    let allCheck = true;
    let existCnt = 0;
    const parent = this.medicalHis.filter(
      (f) => f.QuestionID == parQue_id && f.QuestionValue === "Yes"
    );
    // parent.forEach((e) => {
    //   const exist = this.medicalHis.find(
    //     (f) => f.QuestionID == parQue_id && f.QuestionValue === "No"
    //   );
    //   if (exist) existCnt++;
    //   //console.log(existCnt);
    // });
    //allCheck = existCnt == parent.length;
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

  //Gender Selection
  // GenderSelection(insuredMembersForm: NgForm, Gender: any, memberDesc: any, index: number) {
  //   console.log(Gender);
  //   if (Gender.GenderCode == 3 && memberDesc == 'Self') {
  //     insuredMembersForm.controls['gender' + index].setValue('');
  //     this.errMsg = "Please Selecting " + memberDesc + " Gender status as Male/Female";
  //     return false;
  //   }
  //   if (Gender.GenderCode == 3 && memberDesc == 'Spouse') {
  //     insuredMembersForm.controls['gender' + index].setValue('');
  //     this.errMsg = "Please Selecting " + memberDesc + " Gender status as Male/Female";
  //     return false;
  //   }
  //   else if ((Gender.GenderCode == 2 || Gender.GenderCode == 3) && memberDesc == 'Son') {
  //     insuredMembersForm.controls['gender' + index].setValue('');
  //     this.errMsg = "Please Selecting " + memberDesc + " Gender status as Male";
  //     return false;
  //   }
  //   else if ((Gender.GenderCode == 1 || Gender.GenderCode == 3) && memberDesc == 'Daughter') {
  //     insuredMembersForm.controls['gender' + index].setValue('');
  //     this.errMsg = "Please Selecting " + memberDesc + " Gender status as Female";
  //     return false;
  //   }
  //   else if ((Gender.GenderCode == 2 || Gender.GenderCode == 3) && memberDesc == 'Father') {
  //     insuredMembersForm.controls['gender' + index].setValue('');
  //     this.errMsg = "Please Selecting " + memberDesc + " Gender status as Female";
  //     return false;
  //   }
  //   else if ((Gender.GenderCode == 1 || Gender.GenderCode == 3) && memberDesc == 'Mother') {
  //     insuredMembersForm.controls['gender' + index].setValue('');
  //     this.errMsg = "Please Selecting " + memberDesc + " Gender status as Female";
  //     return false;
  //   }
  //   else {
  //     this.errMsg = "";
  //   }
  // }

  //Married Selection
  // MarriedSelection(insuredMembersForm: NgForm, Married: any, memberDesc: any, index: number) {
  //   if (this.companyData.CompanyCode == 2) {
  //     if (this.memberDetails.length > 1) {
  //       if (Married.value == 0 && memberDesc != 'Son' && memberDesc != 'Daughter') {
  //         insuredMembersForm.controls['married' + index].setValue('');
  //         this.errMsg = "Please Selecting " + memberDesc + " Married status as Yes";
  //         return false;
  //       }
  //       else {
  //         this.errMsg = "";
  //       }
  //     }
  //     else {
  //       if (Married.value == 1 && memberDesc != 'Son' && memberDesc != 'Daughter') {
  //         insuredMembersForm.controls['married' + index].setValue('');
  //         this.errMsg = "Please Selecting " + memberDesc + " Married status as No";
  //         return false;
  //       }
  //       else {
  //         this.errMsg = "";
  //       }
  //     }
  //   }
  // }

  WeightSelection(insuredMembersForm: NgForm, index: number) {


    console.log(insuredMembersForm);

    this.insuredMembersForm = insuredMembersForm
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
  get af() {
    return this.insuredMembersForm;
  }

  isOccupationAccordingToGender(member: any, index: any, occupation: any): boolean {
    const genderType = member.form.get(`GenderTitle${index}`) ? member.form.get(`GenderTitle${index}`).value : '';
    // console.log(genderType)
    if (genderType == 'Mr') {
      return true
    } else {
      return false;
    }
    //     if (this.af.controls["GenderTitle" + index].value == 'M/s'){
    // return true
    //       }

  }



  displayFn(code: any) {

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

    console.log("sdssdsddsdsdsdsd", this.praposalrelationList);
  }

  GetFamilyMemberDesc(RecordNo: number, QuestionID: number, MemberDesc: any) {
    console.log(RecordNo, QuestionID, MemberDesc);
    this.medicalHis.find(
      (m) => m.QuestionID == QuestionID && m.RecordNo == RecordNo
    ).QuestionValue = MemberDesc;
    console.log(this.medicalHis);
  }

  noneForAll(event: any) {
    for (const question of this.companyQueTree) {
      this.onChekedChange(event, question, 0, 0, "none", 0);
      const frmGroup = this.qnaForm.controls[question.QuestionID] as FormGroup;
      if (event.checked)
        frmGroup.controls[`none${question.QuestionID}`].setValue(true);
      else frmGroup.controls[`none${question.QuestionID}`].setValue(false);
    }
    console.log(this.qnaForm.value);
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}


