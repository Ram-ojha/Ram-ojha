import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { PATTERN } from "src/app/models/common";
import { errorLog, IInsuranceType } from "src/app/models/common.Model";
import { decrypt, encrypt } from "src/app/models/common-functions";
import {
  IGender,
  IFamilyMembers,
  IAges,
  HealthModel,
  IHealthData,
  Relation as r,
} from "src/app/models/health-insu.Model";
import { PosHealthService } from "../services/pos-health.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { PosHomeService } from "../services/pos-home.service";
import { take } from "rxjs/operators";
import { InsuranceCategories } from "src/app/models/insurance.enum";

@Component({
  templateUrl: "./health.component.html",
  styleUrls: [
    "../pos-home.component.css",
    "./health.component.css",
    "../../shared/components/policy-expired/policy-expired.component.css",
  ],
})
export class HealthComponent implements OnInit, OnDestroy {
  //#region properties
  private _subscriptions: any[] = [];
  //all list objects
  genderList: IGender[] = [];
  familyMemberList: IFamilyMembers[] = [];
  selectedMembers: HealthModel[] = [];
  juniorAgeList: IAges[] = [];
  // daughterAgeList: IAges[] = [];
  seniorAgeList: IAges[] = [];

  // conditional properties
  showLoader: boolean = false; //for showing loader
  showFamilyMembers: boolean = false;
  isMemberChange: boolean = false;
  // ageStatus = false;

  //values properties
  insuranceType!: IInsuranceType | any;
  noOfSon: number = 0;
  noOfDaughter: number = 0;
  selectedTab: number = 0;
  isCompleted = false;
  isEditable = false;
  popupErrMsg = "";
  errMsg = "";
  ageErrMsg = "";

  //reactive form objects
  pIForm: FormGroup;
  ages: any = NgForm;
  ageFormTest!: NgForm;
  //#endregion

  constructor(
    private _router: Router,
    private _posHealthService: PosHealthService,
    private _posHomeService: PosHomeService,
    private _errorHandleService: ErrorHandleService,
    fb: FormBuilder
  ) {
    this.pIForm = fb.group({
      gender: ["", [Validators.required]],
      pincode: [
        "",
        [
          Validators.required,
          Validators.maxLength(6),
          Validators.pattern(PATTERN.PINCODE),
        ],
      ],
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
          Validators.maxLength(100),
          Validators.pattern(PATTERN.EMAIL),
        ],
      ],
      members: ["", Validators.required],
      //membersDisplay: [{ value: '', readonly: true }]
    });
    this.ages = {
      selfAge: "",
      spouseAge: "",
      fatherAge: "",
      motherAge: "",
      sAgeList: [],
      dAgeList: [],
      gFather: "",
      gMother: "",
      fatherIL: "",
      motherIL: "",
    };
  }

  posMobileNo: any;
  userName: any;
  errorLogDetails = {} as unknown as errorLog;
  link: any;

  ngOnInit(): void {
    // this.insuranceType = JSON.parse(
    //   sessionStorage.getItem("insuranceType")
    // ) as IInsuranceType;
    // if (
    //   (!this.insuranceType && isNaN(this.insuranceType.InsuranceCateCode)) ||
    //   this.insuranceType.InsuranceCateCode < 1
    // ) {
    //   this._router.navigate(["/pos"]);
    // }

    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);

    this._subscriptions.push(
      this._posHomeService.insuranceTypeMenu.pipe(take(1)).subscribe((apiRes: any) => {

        if (apiRes.successcode == "0" || apiRes.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = '';
          this.errorLogDetails.CompanyName = '';
          this.errorLogDetails.ControllerName = "PosHome";
          this.errorLogDetails.MethodName = 'GetInsuranceType'
          this.errorLogDetails.ErrorCode = apiRes.successcode ? apiRes.successcode : "0";
          this.errorLogDetails.ErrorDesc = apiRes.msg ? apiRes.msg : "Something went wrong.";
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              console.log('errorlog-----=>', res);
            });
        }

        let insuranceMenu: IInsuranceType[] = apiRes.data;
        this.insuranceType = insuranceMenu.find(
          (type) => type.InsuranceCateCode === InsuranceCategories.HEALTH
        );
        console.log(this.insuranceType);
      })
    )

    if (this._posHealthService.healthDataList) {
      this.FillData(this._posHealthService.healthDataList);
    } else {
      this.getData();
    }
  }

  //#region  private functions for Data
  private getData() {
    this.showLoader = true;
    this._subscriptions.push(
      this._posHealthService.gethealthData().subscribe(
        (result) => {
          this.showLoader = false;
          if (result.successcode == "0" || result.successcode == null) {
            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = '';
            this.errorLogDetails.CompanyName = '';
            this.errorLogDetails.ControllerName = "Health"
            this.errorLogDetails.MethodName = 'GetHealthInsuranceData'
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log('errorlog-----=>', res);
              });
          }
          if (result.successcode == "1") {
            this.FillData(result.data as IHealthData);
          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    )

  }
  private FillData(healthData: IHealthData) {
    // let healthData = result.data as HealthData;
    this.genderList = healthData.gender;
    this.seniorAgeList = healthData.seniorage;
    this.juniorAgeList = healthData.juniorage;
    // for (let i = 0; i < this.juniorAgeList.length; i++) {
    //     this.daughterAgeList.push({
    //         AgeCode: this.juniorAgeList[i].AgeCode,
    //         AgeDesc: this.juniorAgeList[i].AgeDesc,
    //         FamilyMemberCode: 6,
    //     })
    // }
    this.familyMemberList = healthData.familymember;
    console.log(this.familyMemberList);
    let edit_Member = sessionStorage.getItem("edit_Member");
    if (edit_Member == "1") {
      let edit_Member = sessionStorage.setItem("edit_Member", "0");
      this.Edit();
    }
  }
  //#endregion

  //#region public functions
  public closePopup() {
    if (this.selectedMembers.length == 0) {
      this.pIForm.controls["members"].setValue("");
    }
    this.showFamilyMembers = !this.showFamilyMembers;
    if (this.isMemberChange) this.onOkClick("close");
  }
  public onClickOpenPopup() {
    this.showFamilyMembers = !this.showFamilyMembers;
  }

  public onChekedChange(member: IFamilyMembers) {
    this.isMemberChange = true;
    let isExist = false;
    let index = null;
    for (let i = 0; i < this.selectedMembers.length; i++) {
      isExist =
        this.selectedMembers[i].FamilyMemberCode == member.FamilyMemberCode;
      index = i;
      if (isExist) break;
    }
    if (isExist && index != null) {
      this.selectedMembers.splice(index, 1);
    } else {
      if (
        (this.noOfDaughter >= 4 && member.FamilyMemberCode == r.Son) ||
        (this.noOfSon >= 4 && member.FamilyMemberCode == r.Daughter)
      ) {
        //this.selectedMembers.push({ FamilyMemberCode: member.FamilyMemberCode, FamilyMemberDesc: member.FamilyMemberDesc, AgeCode: 0, AgeDesc: '' });
      } else {
        this.selectedMembers.push({
          FamilyMemberCode: member.FamilyMemberCode,
          FamilyMemberDesc: member.FamilyMemberDesc,
          PriorityCode: member.PriorityCode,
          MemberCategory: member.MemberCategory,
        });
      }
    }
    const counter = this.selectedMembers.find(
      (item: IFamilyMembers) => item.FamilyMemberCode == member.FamilyMemberCode
    )
      ? 1
      : 0;
    if (member.FamilyMemberCode == r.Son) {
      this.noOfSon = counter;
      this.ages.sAgeList = [];
    }
    if (member.FamilyMemberCode == r.Daughter) {
      this.noOfDaughter = counter;
      this.ages.dAgeList = [];
    }
  }
  public isChecked(memberId: number): boolean {
    return this.selectedMembers.find(
      (member: IFamilyMembers) => member.FamilyMemberCode == memberId
    )
      ? true
      : false;
  }
  public inc(count: number, str: string) {
    this.isMemberChange = true;
    if (str == "s") {
      this.noOfSon = Math.min(
        4 - this.noOfDaughter,
        Math.max(1, this.noOfSon + count)
      );
    } else
      this.noOfDaughter = Math.min(
        4 - this.noOfSon,
        Math.max(1, this.noOfDaughter + count)
      );
  }

  public onOkClick(condition: string) {

    console.log(this.selectedMembers);
    const errs = this.hasError();
    if (condition == "ok" && errs) this.showFamilyMembers = false;
    if (this.isMemberChange) {
      this.errMsg = "";
      this.pIForm.controls["members"].setValue("");
      let str = [];
      this.selectedMembers.sort((a, b) =>
        a.PriorityCode > b.PriorityCode ? 1 : -1
      );
      for (let i = 0; i < this.selectedMembers.length; i++) {
        if (this.selectedMembers[i].FamilyMemberCode == r.Son) {
          this.ages.sAgeList = [];
          str.push(
            this.noOfSon <= 1
              ? this.selectedMembers[i].FamilyMemberDesc
              : this.noOfSon + " " + this.selectedMembers[i].FamilyMemberDesc
          );
          for (let j = 0; j < this.noOfSon; j++) {
            this.ages.sAgeList.push({ sonAge: "" });
          }
        } else if (this.selectedMembers[i].FamilyMemberCode == r.Daughter) {
          this.ages.dAgeList = [];
          str.push(
            this.noOfDaughter <= 1
              ? this.selectedMembers[i].FamilyMemberDesc
              : this.noOfDaughter.toString() +
              " " +
              this.selectedMembers[i].FamilyMemberDesc
          );
          for (let j = 0; j < this.noOfDaughter; j++)
            this.ages.dAgeList.push({ daughterAge: "" });
        } else if (this.selectedMembers[i].FamilyMemberCode == r.Spouse) {
          str.push(
            this.pIForm.get("gender")!.value
              ? this.pIForm.get("gender")!.value.split(",")[0] == 1
                ? "Wife"
                : "Husband"
              : this.selectedMembers[i].FamilyMemberDesc
          );
        } else str.push(this.selectedMembers[i].FamilyMemberDesc);
      }
      this.pIForm.controls["members"].setValue(str.join(", "));
      this.isMemberChange = false;
    }
  }

  public memberclear() {
    this.selectedMembers = [];
    this.ages.sAgeList = [];
    this.ages.dAgeList = [];
    this.noOfSon = 0;
    this.noOfDaughter = 0;
  }
  onChangeGender(value: any) {
    let oldValue: string = this.pIForm.get("members")!.value;
    if (oldValue) {
      const replaceBy =
        value.split(",")[0] == 1
          ? "Wife"
          : value.split(",")[0] == 2
            ? "Husband"
            : "Spouse";
      if (oldValue.includes("Husband")) {
        return this.pIForm.controls["members"].setValue(
          oldValue.replace("Husband", replaceBy)
        );
      }
      if (oldValue.includes("Wife")) {
        return this.pIForm.controls["members"].setValue(
          oldValue.replace("Wife", replaceBy)
        );
      }
      if (oldValue.includes("Spouse")) {
        return this.pIForm.controls["members"].setValue(
          oldValue.replace("Spouse", replaceBy)
        );
      }
    }
  }
  // onChangeTab(event) {
  // }
  public onNextClick(): any {
    this.errMsg = "";
    if (this.pIForm.invalid) {
      this.errMsg = "Please fill all details correctly.";
      return false;
    }
    if (this.hasError()) {
      this.isCompleted = true;
      this.isEditable = false;
      this.ageErrMsg = "";
      setTimeout(() => {
        this.selectedTab = 1;
      }, 100);
    } else {
      this.errMsg = this.popupErrMsg;
    }
  }
  onClickBackToTab(tab: number) {
    this.isEditable = true;
    this.isCompleted = false;
    setTimeout(() => {
      this.selectedTab = tab;
    }, 100);
  }
  onChangeAge() { }
  onSubmit() {
    this.ageErrMsg = "";
    //console.log(this.noOfSon);
    if (this.vaidateData()) {
      if (!this.validateAge()) {
        // alert("Success");
        const frmValue = this.pIForm.value;
        let ageList = [];
        for (const item in this.ages) {
          if (this.ages[item]) {
            if (this.ages[item] instanceof Array) {
              for (let i = 0; i < this.ages[item].length; i++) {
                const key = Object.keys(this.ages[item][i]);
                // ageList.push(childAges[i][key[0]]);
                const childAges = this.ages[item][i][key[0]];
                const member: IFamilyMembers | null | undefined = this.getFamilyMDesc(item);
                ageList.push({
                  AgeCode: childAges.AgeCode,
                  AgeDesc: childAges.AgeDesc,
                  FamilyMemberCode: member ? member.FamilyMemberCode : 0,
                  FamilyMemberDesc: member ? member.FamilyMemberDesc : "",
                });
              }
            } else {
              // ageList.push(this.ages[item]);
              const member: IFamilyMembers | null | undefined = this.getFamilyMDesc(item);
              ageList.push({
                AgeCode: this.ages[item].AgeCode,
                AgeDesc: this.ages[item].AgeDesc,
                FamilyMemberCode: member ? member.FamilyMemberCode : 0,
                FamilyMemberDesc: member ? member.FamilyMemberDesc : "",
              });
            }
          }
        }
        const data = {
          InsuranceCateCode: this.insuranceType.InsuranceCateCode,
          InsuranceCateDesc: this.insuranceType.InsuranceCateDesc,
          GenderCode: frmValue.gender.split(",")[0],
          GenderDesc: frmValue.gender.split(",")[1],
          Pincode: frmValue.pincode,
          MobileNo: frmValue.mobileNo,
          EmailId: frmValue.emailId,
          healthInsuranceMembers: ageList,
        };
        console.log(data);
        sessionStorage.setItem("healthQuotes", encrypt(JSON.stringify(data)));
        sessionStorage.setItem("noSon", encrypt(JSON.stringify(this.noOfSon)));
        sessionStorage.setItem(
          "noDaughter",
          encrypt(JSON.stringify(this.noOfDaughter))
        );
        this.showLoader = true;
        this._subscriptions.push(
          this._posHealthService.saveHealthQuates(data).subscribe(
            (result) => {
              // this.showLoader = false;
              if (result.successcode == "0" || result.successcode == null) {
                this.errorLogDetails.UserCode = this.posMobileNo;
                this.errorLogDetails.ApplicationNo = '';
                this.errorLogDetails.CompanyName = '';
                this.errorLogDetails.ControllerName = "Health"
                this.errorLogDetails.MethodName = 'SaveApplicationData'
                this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
                this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
                this._errorHandleService
                  .sendErrorLog(this.errorLogDetails)
                  .subscribe((res: any) => {
                    console.log('errorlog-----=>', res);
                  });
              }
              if (result.successcode == "1") {
                const ApplicationNo = encrypt(`${result.data[0].ApplicationNo}`);
                const ApplicationNoOdp = encrypt(
                  `${result.data[0].ApplicationNoOdp}`
                );
                this._router.navigate([
                  `/health-insurance/best-plans/`,
                  ApplicationNo,
                  ApplicationNoOdp,
                ]);
                // this._router.navigate(['/health-insurance/best-plans'], { queryParams: { 'ApplicationNo': result.data[0].ApplicationNo, 'ApplicationNoOdp': result.data[0].ApplicationNoOdp } });
              } else {
                this._errorHandleService._toastService.warning(result.msg);
              }
            },
            (err: any) => {
              this.showLoader = false;
              this._errorHandleService.handleError(err);
            }
          )
        )

      } else {
        this.ageErrMsg = this.ageErrMsg
          ? this.ageErrMsg
          : "Age Difference is invalid.";
      }
    } else {
      this.ageErrMsg = "Please select age of all members.";
    }
  }

  private getFamilyMDesc(member: string): IFamilyMembers | null | undefined {
    switch (member) {
      case "selfAge": {
        return this.familyMemberList.find((m) => m.FamilyMemberCode == r.Self);
      }
      case "spouseAge": {
        return this.familyMemberList.find(
          (m) => m.FamilyMemberCode == r.Spouse
        );
      }
      case "fatherAge": {
        return this.familyMemberList.find(
          (m) => m.FamilyMemberCode == r.Father
        );
      }
      case "motherAge": {
        return this.familyMemberList.find(
          (m) => m.FamilyMemberCode == r.Mother
        );
      }
      case "gFather": {
        return this.familyMemberList.find(
          (m) => m.FamilyMemberCode == r.GrandFather
        );
      }
      case "gMother": {
        return this.familyMemberList.find(
          (m) => m.FamilyMemberCode == r.GrandMother
        );
      }
      case "fatherIL": {
        return this.familyMemberList.find(
          (m) => m.FamilyMemberCode == r.FatherInLaw
        );
      }
      case "motherIL": {
        return this.familyMemberList.find(
          (m) => m.FamilyMemberCode == r.MotherInLaw
        );
      }
      case "sAgeList": {
        return this.familyMemberList.find((m) => m.FamilyMemberCode == r.Son);
      }
      case "dAgeList": {
        return this.familyMemberList.find(
          (m) => m.FamilyMemberCode == r.Daughter
        );
      }
      default: {
        return null;
        break;
      }
    }
  }

  // check family member is selected or not
  private hasError(): boolean {

    this.popupErrMsg = "";
    if (this.selectedMembers.length == 0) {
      this.popupErrMsg = "Please select atleast one person.";
      return false;
    } else if (
      this.selectedMembers.length == 1 &&
      (this.selectedMembers[0].FamilyMemberCode == r.Son ||
        this.selectedMembers[0].FamilyMemberCode == r.Daughter)
    ) {
      this.popupErrMsg = "Please select one adult member.";
      return false;
      //   this.popupErrMsg = this.selectedMembers.length == 1 ? (member.FamilyMemberCode == 5 || member.FamilyMemberCode == 6) ? 'Please select one adult member.' : '' : 'Please select atleast one person.';
    } else if (
      this.selectedMembers.length == 2 &&
      (this.selectedMembers[0].FamilyMemberCode == r.Son ||
        this.selectedMembers[0].FamilyMemberCode == r.Daughter) &&
      (this.selectedMembers[1].FamilyMemberCode == r.Son ||
        this.selectedMembers[1].FamilyMemberCode == r.Daughter)
    ) {
      this.popupErrMsg = "Please select one adult member.";
      return false;
    }
    // Added by jayam
    // else if (
    //   this.selectedMembers.find(
    //     (x) => x.FamilyMemberCode == r.Father || x.FamilyMemberCode == r.Mother
    //   )
    // ) {
    //   if (
    //     this.selectedMembers.find(
    //       (x) =>
    //         x.FamilyMemberCode == r.Son ||
    //         x.FamilyMemberCode == r.Daughter ||
    //         x.FamilyMemberCode == r.GrandFather ||
    //         x.FamilyMemberCode == r.GrandMother ||
    //         x.FamilyMemberCode == r.FatherInLaw ||
    //         x.FamilyMemberCode == r.MotherInLaw
    //     )
    //   ) {
    //     this.popupErrMsg =
    //       "You can't select Father and Mother with any other relation.";
    //     return false;
    //   }
    //   return true;
    // }
    // Added by jayam end
    else {
      // 
      const childExist = this.selectedMembers.find(
        (item) =>
          item.FamilyMemberCode == r.Son || item.FamilyMemberCode == r.Daughter
      );
      const parentExist = this.selectedMembers.find(
        (item) =>
          item.FamilyMemberCode == r.Self || item.FamilyMemberCode == r.Spouse
      );
      if (childExist && !parentExist) {
        this.popupErrMsg = "Please select one parent member.";
        return false;
      } else return true;
    }
  }
  // for checking age or each member is selected or not
  private vaidateData(): boolean {
    let isValid = false;
    for (let i = 0; i < this.selectedMembers.length; i++) {
      isValid = this.checkSelected(this.selectedMembers[i].FamilyMemberCode);
      if (!isValid) break;
    }
    return isValid;
  }
  private checkSelected(param: any): boolean {
    switch (param) {
      case r.Self: {
        return this.ages.selfAge ? true : false;
      }
      case r.Spouse: {
        return this.ages.spouseAge ? true : false;
      }
      case r.Father: {
        return this.ages.fatherAge ? true : false;
      }
      case r.Mother: {
        return this.ages.motherAge ? true : false;
      }
      case r.Son: {
        if (this.ages.sAgeList.length === 0) return true;
        else {
          for (let j = 0; j < this.ages.sAgeList.length; j++) {
            if (this.ages.sAgeList[j].sonAge == "") return false;
          }
          return true;
        }
      }
      case r.Daughter: {
        if (this.ages.dAgeList.length === 0) return true;
        else {
          for (let j = 0; j < this.ages.dAgeList.length; j++) {
            if (this.ages.dAgeList[j].daughterAge == "") return false;
          }
          return true;
        }
      }
      case r.GrandMother: {
        return this.ages.gMother ? true : false;
      }
      case r.GrandFather: {
        return this.ages.gFather ? true : false;
      }
      case r.MotherInLaw: {
        return this.ages.motherIL ? true : false;
      }
      case r.FatherInLaw: {
        return this.ages.fatherIL ? true : false;
      }
      default: {
        return false;
      }
    }
  }
  // for checking ages difference of selected members to insure
  private validateAge(): boolean {
    //return true if any member age is incorrect
    this.ageErrMsg = "";
    for (let i = 0; i < this.selectedMembers.length; i++) {
      // <------     for all selected members
      // 
      // console.log("Case", this.selectedMembers[i].FamilyMemberCode)
      // console.log("Case", r)
      // if (this.selectedMembers[i].FamilyMemberCode != r.Self && this.selectedMembers[i].FamilyMemberCode != r.Spouse
      //     && this.selectedMembers[i].FamilyMemberCode != r.Father) {
      //     continue;
      // }

      switch (this.selectedMembers[i].FamilyMemberCode) {
        case r.Self: {
          const selfAge = +this.ages.selfAge.AgeDesc.split(" ")[0];
          for (let j = 0; j < this.selectedMembers.length; j++) {
            //<-------------  for each selected member
            // console.log(`${this.selectedMembers[j].FamilyMemberDesc} ==> ` + this.selectedMembers[j].FamilyMemberCode)

            // if (this.selectedMembers[j].FamilyMemberCode == r.Self || this.selectedMembers[j].FamilyMemberCode == r.Spouse || this.selectedMembers[j].FamilyMemberCode == r.FatherInLaw || this.selectedMembers[j].FamilyMemberCode == r.MotherInLaw) {
            //     continue;
            // }
            let memberAge = 0;
            if (
              (this.selectedMembers[j].FamilyMemberCode == r.Son ||
                this.selectedMembers[j].FamilyMemberCode == r.Daughter) &&
              this.isChildrenAgeValid(
                selfAge,
                this.selectedMembers[j].FamilyMemberCode
              )
            ) {
              this.ageErrMsg =
                "Self and " +
                this.selectedMembers[j].FamilyMemberDesc +
                " age difference should be more than 18 years.";
              return true;
            }
            // self-parents
            if (
              this.selectedMembers[j].FamilyMemberCode == r.Father ||
              this.selectedMembers[j].FamilyMemberCode == r.Mother
            ) {
              memberAge =
                this.selectedMembers[j].FamilyMemberCode == r.Father
                  ? +this.ages.fatherAge.AgeDesc.split(" ")[0]
                  : +this.ages.motherAge.AgeDesc.split(" ")[0];
              if (memberAge - selfAge < 18) {
                this.ageErrMsg =
                  "Self and " +
                  this.selectedMembers[j].FamilyMemberDesc +
                  " age difference should be more than 18 years.";
                return true;
              }
            }
            // self-grand-parents
            if (
              this.selectedMembers[j].FamilyMemberCode == r.GrandFather ||
              this.selectedMembers[j].FamilyMemberCode == r.GrandMother
            ) {
              memberAge =
                this.selectedMembers[j].FamilyMemberCode == r.GrandFather
                  ? +this.ages.gFather.AgeDesc.split(" ")[0]
                  : +this.ages.gMother.AgeDesc.split(" ")[0];
              if (memberAge - selfAge < 36) {
                this.ageErrMsg =
                  "Self and " +
                  this.selectedMembers[j].FamilyMemberDesc +
                  " age difference should be more than 36 years.";
                return true;
              }
            }
            // InLaws
            // if (this.selectedMembers[j].FamilyMemberCode == r.FatherInLaw || this.selectedMembers[j].FamilyMemberCode == r.MotherInLaw) {
            //     memberAge = this.selectedMembers[j].FamilyMemberCode == r.FatherInLaw ? +this.ages.fatherIL.AgeDesc.split(' ')[0] : +this.ages.motherIL.AgeDesc.split(' ')[0];
            //     if ((memberAge - selfAge) < 18) {
            //         this.ageErrMsg = 'Self and ' + this.selectedMembers[j].FamilyMemberDesc
            //             + ' age difference should be more than 18 years.';
            //         return true;
            //     }
            // }
          }
          break;
        }
        case r.Spouse: {
          const spouseAge = +this.ages.spouseAge.AgeDesc.split(" ")[0];
          for (let j = 0; j < this.selectedMembers.length; j++) {
            //<-------------  for each selected member
            if (
              (this.selectedMembers[j].FamilyMemberCode == r.Son ||
                this.selectedMembers[j].FamilyMemberCode == r.Daughter) &&
              this.isChildrenAgeValid(
                spouseAge,
                this.selectedMembers[j].FamilyMemberCode
              )
            ) {
              this.ageErrMsg =
                "spouse" +
                " and " +
                this.selectedMembers[j].FamilyMemberDesc +
                " age difference should be more than 18 years.";
              return true;
            }
            // if (this.selectedMembers[j].FamilyMemberCode != r.FatherInLaw &&
            //     this.selectedMembers[j].FamilyMemberCode != r.MotherInLaw &&
            //     this.selectedMembers[j].FamilyMemberCode != r.Father &&
            //     this.selectedMembers[j].FamilyMemberCode != r.Mother) {
            //     continue;
            // }
            let memberAge = 0;
            // self-parent
            if (
              this.selectedMembers[j].FamilyMemberCode == r.FatherInLaw ||
              this.selectedMembers[j].FamilyMemberCode == r.MotherInLaw
            ) {
              memberAge =
                this.selectedMembers[j].FamilyMemberCode == r.FatherInLaw
                  ? +this.ages.fatherIL.AgeDesc.split(" ")[0]
                  : +this.ages.motherIL.AgeDesc.split(" ")[0];
              if (memberAge - spouseAge < 18) {
                // this.pIForm.get('gender').value.split(',')[1]
                this.ageErrMsg =
                  "Spouse" +
                  " and " +
                  this.selectedMembers[j].FamilyMemberDesc +
                  " age difference should be more than 18 years.";
                return true;
              }
            }

            // self-parent father & mother
            let NotSelectSelf = this.selectedMembers.filter(
              (m) => m.FamilyMemberCode == 1
            );
            if (NotSelectSelf.length == 0) {
              if (
                this.selectedMembers[j].FamilyMemberCode == r.Father ||
                this.selectedMembers[j].FamilyMemberCode == r.Mother
              ) {
                memberAge =
                  this.selectedMembers[j].FamilyMemberCode == r.Father
                    ? +this.ages.fatherAge.AgeDesc.split(" ")[0]
                    : +this.ages.motherAge.AgeDesc.split(" ")[0];
                if (memberAge - spouseAge < 18) {
                  this.ageErrMsg =
                    "Spouse and " +
                    this.selectedMembers[j].FamilyMemberDesc +
                    " age difference should be more than 18 years.";
                  return true;
                }
              }
            }
          }
          break;
        }
        case r.Father: {
          const fatherAge = +this.ages.fatherAge.AgeDesc.split(" ")[0];
          for (let j = 0; j < this.selectedMembers.length; j++) {
            //<-------------  for each selected member
            if (
              this.selectedMembers[j].FamilyMemberCode != r.GrandFather &&
              this.selectedMembers[j].FamilyMemberCode != r.GrandMother
            ) {
              continue;
            }
            let memberAge = 0;
            // self-parents
            if (
              this.selectedMembers[j].FamilyMemberCode == r.GrandFather ||
              this.selectedMembers[j].FamilyMemberCode == r.GrandMother
            ) {
              memberAge =
                this.selectedMembers[j].FamilyMemberCode == r.GrandFather
                  ? +this.ages.gFather.AgeDesc.split(" ")[0]
                  : +this.ages.gMother.AgeDesc.split(" ")[0];
              if (memberAge - fatherAge < 18) {
                this.ageErrMsg =
                  "Father and " +
                  this.selectedMembers[j].FamilyMemberDesc +
                  " age difference should be more than 18 years.";
                return true;
              }
            }
          }
          break;
        }
      }
    }
    return false;
  }
  private isChildrenAgeValid(parentAge: number, opr: number): boolean {
    //return true if all child age is 18 less than parent
    if (this.ages.sAgeList.length > 0 && opr == r.Son) {
      // <----     check if son are selected
      for (let j = 0; j < this.ages.sAgeList.length; j++) {
        //<-------------  for each son
        const childage: IAges = this.ages.sAgeList[j].sonAge;
        if (
          childage.AgeDesc.includes("year") &&
          parentAge - +childage.AgeDesc.split(" ")[0] < 18
        ) {
          return true;
        }
      }
    }
    if (this.ages.dAgeList.length > 0 && opr == r.Daughter) {
      for (let j = 0; j < this.ages.dAgeList.length; j++) {
        //<-------------  for each daughter
        const childage: IAges = this.ages.dAgeList[j].daughterAge;
        if (
          childage.AgeDesc.includes("year") &&
          parentAge - +childage.AgeDesc.split(" ")[0] < 18
        ) {
          return true;
        }
      }
    }
    return false;
  }
  //#endregion

  Edit() {
    if (sessionStorage.getItem("healthQuotes") != null) {
      let healthQuotes = JSON.parse(
        decrypt(sessionStorage.getItem("healthQuotes")!)
      );
      let Son = JSON.parse(decrypt(sessionStorage.getItem("noSon")!));
      let Daughter = JSON.parse(decrypt(sessionStorage.getItem("noDaughter")!));
      console.log("age", Son);
      let Gender = this.genderList.filter(
        (m) => m.GenderCode == healthQuotes.GenderCode
      );
      let GenderDesc = Gender[0].GenderDesc;
      this.pIForm.patchValue({
        gender: `${healthQuotes.GenderCode},${GenderDesc}`,
      });
      this.pIForm.controls["pincode"].setValue(healthQuotes.Pincode);
      this.pIForm.controls["mobileNo"].setValue(healthQuotes.MobileNo);
      this.pIForm.controls["emailId"].setValue(healthQuotes.EmailId);
      //var a = $("#ddlselfAge").text('21 years');

      this.selectedMembers = healthQuotes.healthInsuranceMembers;
      this.noOfSon = Son;
      this.noOfDaughter = Daughter;

      this.isMemberChange = true;
      this.onOkClick("ok");
      // for (let index = 0; index < healthQuotes.healthInsuranceMembers.length; index++) {
      //     const element = healthQuotes.healthInsuranceMembers[index];
      //     console.log("element", element);
      //     const d = {
      //         AgeCode: 40,
      //         AgeDesc: "21 years",
      //         FamilyMemberCode: 1,
      //         MemberCategory: 1
      //     }
      //     if (element.FamilyMemberCode == 1) {
      //         this.ages.selfAge = d;
      //     }
      //     if (element.FamilyMemberCode == 2) {
      //         this.ages.spouseAge = d;
      //     }
      // }
    }
  }
  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
}
