import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from "@angular/core";
import { IInsuranceType } from "./../../models/common.Model";
import { PolicyServicingApiService } from "./../services/pos-policy-servicing.service";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {
  yesNoList,
  Salutation,
  PATTERN,
  Feets,
  Inches,
  Identities,
  MASKS,
} from "src/app/models/common";
import {
  IState,
  ICity,
  Occupation,
  IQuestionsTree,
  IPincode,
  IYesNoInd,
} from "src/app/models/common.Model";
import { EIdentity, EYesNo } from "src/app/models/insurance.enum";
import { Observable, Subscription } from "rxjs";
import { map, startWith } from "rxjs/operators";
import {
  IFamilyMembers,
  IFamilyMemberDetails,
  IGender,
  IPlansHealth,
  IRegUrlData,
} from "src/app/models/health-insu.Model";
import { ToastrService } from "ngx-toastr";
import {
  decrypt,
  convertToMydate,
  setMaxDate,
  setMinDate,
  isValidAadhaar,
} from "src/app/models/common-functions";
export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
}
export interface CompanyMaster {
  CompanyCode: number;
  CompanyName: string;
}
export interface InsuranceTypeList {
  CompanyCode: number;
  InsuranceCateCode: number;
  InsuranceCateDesc: string;
}

@Component({
  templateUrl: "./pos-policy-servicing.component.html",
  styleUrls: ["./pos-policy-servicing.component.css"],
})
export class PosPolicyServicingComponent implements AfterViewInit, OnDestroy {
  private _subscriptions: any = [];
  showLoader: boolean = false;
  Search: FormGroup;
  PolicyServicingUpdate: FormGroup;
  Useridentity = Identities;
  identityMask = null;
  stateList: IState[] = [];
  filteredStateList!: Observable<IState[]>;
  cities: ICity[] = [];
  filteredCityList!: ICity[];
  pincodeList: IPincode[] = [];
  filteredPincode!: IPincode[];
  relationList: IFamilyMembers[] = [];
  Company!: CompanyMaster[];
  InsuranceType!: InsuranceTypeList[];
  InsuranceTypeList!: InsuranceTypeList[];
  GridShow: boolean = false;
  EditData: any;
  _PosPolicyUpdate: any = {};
  minDate = (year: number, month = 0, date = 0) =>
    setMinDate(year, month, date);

  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true })
  sort!: MatSort;

  displayedColumns: string[] = [
    "Sno",
    "PolicyNo",
    "TrnPolicyDate",
    "PropFirstName",
    "EmailId",
    "MobileNo",
    "Address",
    "action",
  ];
  dataSource!: MatTableDataSource<any>;
  myModal: string = 'none';
  constructor(
    private _FormBuilder: FormBuilder,
    private _getHealthMasterData: PolicyServicingApiService,
    private _toastrService: ToastrService
  ) {
    this.Search = this._FormBuilder.group({
      CompanyName: ["", Validators.required],
      InsuranceType: ["", Validators.required],
      PolicyNumber: [""],
    });
    this.PolicyServicingUpdate = this._FormBuilder.group({
      RecordNo: [""],
      NomineeRelationDesc: [""],
      RegistrationNo: [""],
      ApplicationNo: [""],
      AddFlatNo: [{ value: "", disabled: true }, Validators.required],
      AddArea: [{ value: "", disabled: true }, Validators.required],
      City: [{ value: "", disabled: true }, Validators.required],
      State: [{ value: "", disabled: true }, Validators.required],
      AllPincode: [{ value: "", disabled: true }, Validators.required],
      NomineeName: [{ value: "", disabled: true }, Validators.required],
      Age: [{ value: "", disabled: true }, Validators.required],
      NomineeRelation: [{ value: "", disabled: true }, Validators.required],
      aadhaarIdentity: [{ value: "", disabled: true }, Validators.required],
      panIdentity: [{ value: "", disabled: true }, Validators.required],
      aadhaarIdentityValue: [
        { value: "", disabled: true },
        Validators.required,
      ],
      panIdentityValue: [{ value: "", disabled: true }, Validators.required],
      chkAddress: false,
      chkNominee: false,
      chkIdentity: false,
    });
    // const a = [{ Sno: '1', PolicyNo: 'bbbbb', progress: 'cccccc', color: 'ddddddddd' }, { Sno: '2', PolicyNo: 'bbbbb', progress: 'cccccc', color: 'ddddddddd' }]
    // this.dataSource = new MatTableDataSource(null);
  }

  ngAfterViewInit() {
    //this.PolicyServicingUpdateDisble();
    //this.updateIdentityValidity();
    this.GetDropdown();
  }
  // private updateIdentityValidity() {
  //   const control = this.PolicyServicingUpdate.get("identityValue");

  //   this.PolicyServicingUpdate
  //     .get("Identity")
  //     .valueChanges.subscribe((identity: IYesNoInd | undefined) => {
  //       control.reset();
  //       if (identity.value == EIdentity.PAN) {
  //         this.identityMask = MASKS.PAN;
  //         control.setValidators([
  //           Validators.pattern(PATTERN.PAN),
  //           Validators.required,
  //         ]);
  //       } else if (identity.value == EIdentity.AADHAAR) {
  //         this.identityMask = MASKS.AADHAAR;
  //         control.setValidators([
  //           Validators.pattern(PATTERN.AADHAAR),
  //           Validators.required,
  //         ]);
  //       } else if (identity.value == EIdentity.GSTIN) {
  //         this.identityMask = MASKS.GSTIN;
  //         control.setValidators([
  //           Validators.pattern(PATTERN.GSTIN),
  //           Validators.required,
  //         ]);
  //       } else {
  //         control.setValidators(Validators.required);
  //       }
  //       control.updateValueAndValidity();
  //     });
  // }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log(this.dataSource.filter);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  GetDropdown() {
    this._subscriptions.push(
      this._getHealthMasterData.getHealthMasterData(1, 1, 1).subscribe((res) => {
        console.log(res);
        this.filteredStateList = res.data["state"];
        this.cities = res.data["city"];
        this.pincodeList = res.data["pincode"];
        this.relationList = res.data["relation"];
        this.showLoader = false;
        //   //Auto Fill
        //   // this.filteredCityList = this.cities;
        //   // this.filteredPincode = this.pincodeList;
        //   // console.log(this.filteredPincode);
      }))

    this._subscriptions.push(
      this._getHealthMasterData.getPolicyServicingDropdown().subscribe((res) => {
        //this.showLoader = true;
        this.Company = res.data["CompanyList"];
        this.InsuranceType = res.data["InsuranceTypeList"];
        //this.showLoader = false;
      }))
  }

  async GetInsorenceType(event: any) {
    this.Search.get("InsuranceType")!.setValue("");
    this.InsuranceTypeList = this.InsuranceType.filter(
      (m) => m.CompanyCode == event
    );
    this.GridShow = false;
  }
  async onSelectState() {
    const state: string = this.PolicyServicingUpdate.get("State")!.value;
    this.filteredCityList = this.cities.filter((m) => m.StateCode === state);
    console.log(this.filteredCityList);
  }

  async onSelectCity() {
    const City: string = this.PolicyServicingUpdate.get("City")!.value;
    this.filteredPincode = this.pincodeList.filter((m) => m.CityCode === City);
    console.log(this.filteredPincode);
  }
  async FamilyMemberDesc(FamilyMemberCode: any) {
    let menber = this.relationList.filter(
      (m) => m.FamilyMemberCode == FamilyMemberCode
    );
    console.log(menber);
    this.PolicyServicingUpdate.controls["NomineeRelationDesc"].setValue(
      menber[0].FamilyMemberDesc
    );
  }
  async GetIdentityValue() {
    this.PolicyServicingUpdate.get("identityValue")!.setValue("");
  }
  checkboxAddress(event: any) {
    if (event.checked) {
      this.PolicyServicingUpdate.controls["AddFlatNo"].enable();
      this.PolicyServicingUpdate.controls["AddArea"].enable();
      this.PolicyServicingUpdate.controls["City"].enable();
      this.PolicyServicingUpdate.controls["State"].enable();
      this.PolicyServicingUpdate.controls["AllPincode"].enable();
    } else {
      this.PolicyServicingUpdate.controls["AddFlatNo"].disable();
      this.PolicyServicingUpdate.controls["AddArea"].disable();
      this.PolicyServicingUpdate.controls["City"].disable();
      this.PolicyServicingUpdate.controls["State"].disable();
      this.PolicyServicingUpdate.controls["AllPincode"].disable();

      // checkbox unchecked
      this.PolicyServicingUpdate.controls["AddFlatNo"].setValue(
        this.EditData.AddFlatNo
      );
      this.PolicyServicingUpdate.controls["AddArea"].setValue(
        this.EditData.AddArea
      );
      this.PolicyServicingUpdate.controls["State"].setValue(
        this.EditData.AddStateDesc
      );
      this.onSelectState();
      this.PolicyServicingUpdate.controls["City"].setValue(
        this.EditData.AddCityDesc
      );
      this.onSelectCity();
      this.PolicyServicingUpdate.controls["AllPincode"].setValue(
        String(this.EditData.AddPincode)
      );
    }
  }

  checkboxNominee(event: any) {
    if (event.checked) {
      this.PolicyServicingUpdate.controls["NomineeName"].enable();
      this.PolicyServicingUpdate.controls["Age"].enable();
      this.PolicyServicingUpdate.controls["NomineeRelation"].enable();
    } else {
      this.PolicyServicingUpdate.controls["NomineeName"].disable();
      this.PolicyServicingUpdate.controls["Age"].disable();
      this.PolicyServicingUpdate.controls["NomineeRelation"].disable();

      // checkbox unchecked
      this.PolicyServicingUpdate.controls["NomineeName"].setValue(
        this.EditData.NomineeName
      );
      this.PolicyServicingUpdate.controls["Age"].setValue(
        this.EditData.NomineeDOB
      );
      this.PolicyServicingUpdate.controls["NomineeRelation"].setValue(
        this.EditData.NomineeRelationCode
      );
    }
  }
  checkboxIdentity(event: any) {
    if (event.checked) {
      this.PolicyServicingUpdate.controls["aadhaarIdentity"].enable();
      this.PolicyServicingUpdate.controls["aadhaarIdentityValue"].enable();
      this.PolicyServicingUpdate.controls["panIdentity"].enable();
      this.PolicyServicingUpdate.controls["panIdentityValue"].enable();
    } else {
      this.PolicyServicingUpdate.controls["aadhaarIdentity"].disable();
      this.PolicyServicingUpdate.controls["aadhaarIdentityValue"].disable();
      this.PolicyServicingUpdate.controls["panIdentity"].disable();
      this.PolicyServicingUpdate.controls["panIdentityValue"].disable();

      // checkbox unchecked
      if (this.EditData.IdentityNo === 0) {
        this.PolicyServicingUpdate.controls["aadhaarIdentity"].setValue(
          this.EditData.IdentityTypeDesc
        );
        this.PolicyServicingUpdate.controls["aadhaarIdentityValue"].setValue(
          this.EditData.IdentityNo
        );
      }
    }
  }

  EditPopup(Edit: any) {
    this.EditData = Edit;
    // update permiter
    this.PolicyServicingUpdate.controls["RecordNo"].setValue(
      this.EditData.RecordNo
    );
    this.PolicyServicingUpdate.controls["NomineeRelationDesc"].setValue(
      this.EditData.NomineeRelationDesc
    );
    this.PolicyServicingUpdate.controls["RegistrationNo"].setValue(
      this.EditData.RegistrationNo
    );
    this.PolicyServicingUpdate.controls["ApplicationNo"].setValue(
      this.EditData.ApplicationNo
    );
    // Change Address
    this.PolicyServicingUpdate.controls["AddFlatNo"].setValue(
      this.EditData.AddFlatNo
    );
    this.PolicyServicingUpdate.controls["AddArea"].setValue(
      this.EditData.AddArea
    );
    this.PolicyServicingUpdate.controls["State"].setValue(
      this.EditData.AddStateDesc
    );
    this.onSelectState();
    this.PolicyServicingUpdate.controls["City"].patchValue(
      this.EditData.AddCityDesc
    );
    this.onSelectCity();
    this.PolicyServicingUpdate.controls["AllPincode"].setValue(
      String(this.EditData.AddPincode)
    );

    // Nominee Details
    this.PolicyServicingUpdate.controls["NomineeName"].setValue(
      this.EditData.NomineeName
    );
    this.PolicyServicingUpdate.controls["Age"].setValue(
      this.EditData.NomineeDOB
    );
    this.PolicyServicingUpdate.controls["NomineeRelation"].setValue(
      this.EditData.NomineeRelationCode
    );

    // Update Identity
    // For AADHAAR
    if (this.EditData.IdentityTypeCode === 0) {
      this.PolicyServicingUpdate.controls["aadhaarIdentity"].setValue(
        this.EditData.IdentityTypeDesc
      );
      this.PolicyServicingUpdate.controls["aadhaarIdentityValue"].setValue(
        this.EditData.IdentityNo
      );
    }
    // $("#myModal").modal("show");
    this.myModal = 'block';
  }
  closemodel() {
    // $("#myModal").modal("hide");
    this.myModal = 'none';
    this.PolicyServicingUpdate.disable();
    this.PolicyServicingUpdate.controls["chkAddress"].enable();
    this.PolicyServicingUpdate.controls["chkAddress"].setValue(false);
    this.PolicyServicingUpdate.controls["chkNominee"].enable();
    this.PolicyServicingUpdate.controls["chkNominee"].setValue(false);
    this.PolicyServicingUpdate.controls["chkIdentity"].enable();
    this.PolicyServicingUpdate.controls["chkIdentity"].setValue(false);
  }
  PolicyServicing(): any {
    if (this.Search.invalid) {
      return false;
    }
    this.showLoader = true;
    this._subscriptions.push(
      this._getHealthMasterData
        .getAllPolicyServicing(this.Search.value)
        .subscribe(
          (res) => {
            console.log(res);
            if (res.data) {
              this.GridShow = true;
              this.dataSource = new MatTableDataSource(res.data);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            } else {
              this.GridShow = false;
              this._toastrService.warning("Record Not Found", "Opps");
            }
            this.showLoader = false;
          },
          (error: any) => {
            this.showLoader = false;
            this.GridShow = false;
            this._toastrService.error(error.message);
          }
        ))
  }

  PolicyUpdate(): any {
    if (this.PolicyServicingUpdate.invalid) {
      return false;
    }
    this.showLoader = true;
    this._PosPolicyUpdate.RecordNo = this.PolicyServicingUpdate.controls[
      "RecordNo"
    ].value;
    this._PosPolicyUpdate.RegistrationNo = this.PolicyServicingUpdate.controls[
      "RegistrationNo"
    ].value;
    this._PosPolicyUpdate.ApplicationNo = this.PolicyServicingUpdate.controls[
      "ApplicationNo"
    ].value;
    this._PosPolicyUpdate.AddFlatNo = this.PolicyServicingUpdate.controls[
      "AddFlatNo"
    ].value;
    this._PosPolicyUpdate.AddArea = this.PolicyServicingUpdate.controls[
      "AddArea"
    ].value;
    this._PosPolicyUpdate.AddStateDesc = this.PolicyServicingUpdate.controls[
      "State"
    ].value;
    this._PosPolicyUpdate.AddCityDesc = this.PolicyServicingUpdate.controls[
      "City"
    ].value;
    this._PosPolicyUpdate.AddPincode = this.PolicyServicingUpdate.controls[
      "AllPincode"
    ].value;
    this._PosPolicyUpdate.NomineeName = this.PolicyServicingUpdate.controls[
      "NomineeName"
    ].value;
    this._PosPolicyUpdate.NomineeDOB = convertToMydate(
      this.PolicyServicingUpdate.controls["Age"].value
    );
    this._PosPolicyUpdate.NomineeRelationCode = this.PolicyServicingUpdate.controls[
      "NomineeRelation"
    ].value;
    this._PosPolicyUpdate.NomineeRelationDesc = this.PolicyServicingUpdate.controls[
      "NomineeRelationDesc"
    ].value;
    this._PosPolicyUpdate.IdentityTypeDesc = this.PolicyServicingUpdate.controls[
      "Identity"
    ].value;
    this._PosPolicyUpdate.IdentityNo = this.PolicyServicingUpdate.controls[
      "identityValue"
    ].value;
    this._PosPolicyUpdate.InsuranceCateCode = this.Search.controls[
      "InsuranceType"
    ].value;
    console.log(this._PosPolicyUpdate);
    let Json = JSON.stringify(this._PosPolicyUpdate);
    this._subscriptions.push(
      this._getHealthMasterData.PolicyServicingUpdate(Json).subscribe(
        (res) => {
          console.log(res);
          if (res.successcode == "1") {
            // $("#myModal").modal("hide");
            this.myModal = 'none';
            this._toastrService.success("Policy Servicing Update", "Success");
            this.PolicyServicingUpdate.disable();
            this.PolicyServicingUpdate.controls["chkAddress"].enable();
            this.PolicyServicingUpdate.controls["chkAddress"].setValue(false);
            this.PolicyServicingUpdate.controls["chkNominee"].enable();
            this.PolicyServicingUpdate.controls["chkNominee"].setValue(false);
            this.PolicyServicingUpdate.controls["chkIdentity"].enable();
            this.PolicyServicingUpdate.controls["chkIdentity"].setValue(false);
            this.showLoader = false;
            //this.GridShow = false;
            this.PolicyServicing();
          } else {
            // $("#myModal").modal("hide");
            this.myModal = 'none';
            this._toastrService.error("Policy Servicing Not Update", "Error");
            // this.chkAddress = false;
            // this.chkNominee = false;
            // this.chkIdentity = false;
            this.PolicyServicingUpdate.disable();
            this.PolicyServicingUpdate.controls["chkAddress"].enable();
            this.PolicyServicingUpdate.controls["chkAddress"].setValue(false);
            this.PolicyServicingUpdate.controls["chkNominee"].enable();
            this.PolicyServicingUpdate.controls["chkNominee"].setValue(false);
            this.PolicyServicingUpdate.controls["chkIdentity"].enable();
            this.PolicyServicingUpdate.controls["chkIdentity"].setValue(false);
            this.showLoader = false;
            this.GridShow = false;
          }
        },
        (error) => {
          this._toastrService.error(error.message, "Error");
        }
      ))
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe()); // 🧙‍♂️🧙‍♂️
  }
}

export class ITableData {
  constructor(
    public Sno: number,
    public PolicyNo: string,
    public PolicyDate: string,
    public Name: string,
    public EmailId: string,
    public MobileNo: string,
    public Addresh: string,
    public action: string
  ) { }

}
