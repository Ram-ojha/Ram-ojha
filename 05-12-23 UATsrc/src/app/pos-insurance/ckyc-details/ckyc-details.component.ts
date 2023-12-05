
import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiResponse } from 'src/app/models/api.model';
import { Location, UpperCasePipe } from "@angular/common";
import { ApplicationVehicleRegData, IApplicationVehicleRegData } from 'src/app/models/bike-insu.Model';
import { MASKS, PATTERN } from 'src/app/models/common';
import { convertToMydate, decrypt, encrypt, setMaxDate, setMaxRegDate, setMinDate } from 'src/app/models/common-functions';
import { ICKYCBajaj, ICKYCDocList, ICKYCDocListUniversal, ICKYCFutureGen, ICKYCGoDigit, ICKYCNewIndia, ICKYCReliance, ICkycResponse, ICKYCSBI, ICKYCShreeRam, ICKYCTataAig, ICKYCUniversal, IInsuranceType, ICKYCOriental, ICKYCOrientalStatus, ICKYCUnitedIndia } from 'src/app/models/common.Model';
import { IFamilyMembers, IGenderForCKYC } from 'src/app/models/health-insu.Model';
import { EDocListEnum, EUniversalDocListEnum } from 'src/app/models/insurance.enum';
import { PosHomeService } from 'src/app/pos-home/services/pos-home.service';
import { VehicleBuyPlanService } from '../services/vehicle-buyplan.service';
@Component({
  selector: 'app-ckyc-details',
  templateUrl: './ckyc-details.component.html',
  styleUrls: ['./ckyc-details.component.css']
})
export class CkycDetailsComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];

  ckycDetailForm!: FormGroup;
  // @ViewChild("iffcoTokioRadio", { static: false }) iffcoTokioRadio: ElementRef;
  @Output("isCkycValidate") isCkycValidate = new EventEmitter<any>();
  @ViewChild('bajajTemplateForm', { static: false })
  bajajTemplateForm!: NgForm;
  isIffcoDefaultRadioButton = true;

  errMsg_oi = "";
  errMsg_ca = "";
  PlanData: any;
  sessionData: any;
  manualKYCurl: string = "";
  successcode: string = "";
  date: string = convertToMydate(new Date());
  isCompleted_ckycInfo: boolean = false;
  showTimer: boolean = false;
  identityMask: any = null;
  identityMaskForPOI: any = null;
  identityMaskForPOA: any = null;

  validationObj: Array<{ key: string, validation: any[] }> = []//[{key:string,validation:any[]}];
  CkycDocList: ICKYCDocList[] = [];
  CkycDocListFilter: ICKYCDocList[] = [];
  isckycFailedForIffcoTokio: boolean = false;
  CkycMask = MASKS.CKYC;
  ckycYesNoDesc: string = "Yes"
  ckycYesNoCode: number = 1
  successPanNo: boolean = true;
  successDocNo: boolean = true;
  successDocUpload: boolean = true;
  successFileUpload: boolean = false;

  gendertypeForFuture: IGenderForCKYC[] = [{
    GenderCode: "M",
    GenderDesc: "Male"
  }, {
    GenderCode: "F",
    GenderDesc: "Female"
  }]

  step: { stepInd: number; stepDesc: string; } = {
    stepInd: 0,
    stepDesc: ''
  };


  gendertypeForSBI: IGenderForCKYC[] = [{
    GenderCode: "M",
    GenderDesc: "Male"
  }, {
    GenderCode: "F",
    GenderDesc: "Female"
  }, {
    GenderCode: "T",
    GenderDesc: "Transgender"
  }]

  ckycDetails: any;
  // Orientalkycstatus = true;
  // Orientalkyc = false;
  postData: IApplicationVehicleRegData = new ApplicationVehicleRegData();
  display!: string;
  changetored: boolean = false;
  displayNone: boolean = false;
  btnCkeckStauts: boolean = false;
  ckyAdditionalData: any;
  errMsg_TataAig!: string;
  ckycResult: any;
  docExtension: any = '';
  fileName: any = '';
  base64url: string | ArrayBuffer = '';
  fileUpload: any;
  files: any;
  proposalNoTataAig: string = "";
  CKYCHideShowShreeRam: boolean = true
  base64urlProPic!: string;
  base64urlPAN!: string;
  base64urlOtherDoc!: string;
  fileNameProPic: any = "";
  fileNamePOI: any = "";
  fileNamePOA: any = "";



  fileNamePhotograph: any;
  fileExtionPhotograph!: string | undefined;

  showModal: boolean = false;
  sessionPostData: any;
  fileExtionPOI!: string | undefined;
  fileExtionPOA!: string | undefined;
  formDataForIffcoTokio!: FormData;
  isCreateFormIffcoTokio: boolean = true;
  isCkycUploadDocTrue: boolean = true;
  iffcoTokioReferenceNo: any;
  ckycTataAigPayLoad!: ICKYCTataAig;
  ckycResponseData!: ICkycResponse;
  formDataForGodigit!: FormData;
  uploadfileGodigit!: string | Blob;
  insuranceType!: IInsuranceType;
  uniqueId: any;
  docType!: ICKYCDocList | undefined;
  PanMask = MASKS.PAN;
  UrlData: any;
  UniqueId: any;
  planFilter: any;
  isPOIStatusFound: boolean = true;
  radioBtnValueBajaj: string = "CKYC";
  panDocName: any;
  OrientalCKYCStatus: any;
  showstatus: boolean = false;
  Unique_Id: any;
  HideCkyc: boolean = true;
  constructor(
    private _fb: FormBuilder,
    private posHomeService: PosHomeService,
    private _vehicleBuyPlanService: VehicleBuyPlanService,
    private _route: ActivatedRoute,
    private _router: Router, private _toastService: ToastrService,
    private _location: Location,

  ) {

  }
  ngOnInit() {

    this.insuranceType = JSON.parse(sessionStorage.getItem("insuranceType")!);
    if (this.insuranceType.InsuranceCateCode === 1) {
      this.sessionData = JSON.parse(sessionStorage.getItem("Data")!);
      this.PlanData = this.sessionData.premiumDataPlans;
      this.sessionPostData = JSON.parse(sessionStorage.getItem("postData")!)
      this.UrlData = JSON.parse(sessionStorage.getItem("UrlData")!)
    }
    if (this.insuranceType.InsuranceCateCode === 2) {

      this.sessionData = JSON.parse(sessionStorage.getItem("CarData")!);
      this.PlanData = JSON.parse(sessionStorage.getItem("popupData")!);
      this.sessionPostData = JSON.parse(sessionStorage.getItem("postData")!)
      this.UrlData = JSON.parse(sessionStorage.getItem("UrlData")!)
    } if (this.insuranceType.InsuranceCateCode === 3) {

      this.planFilter = JSON.parse(sessionStorage.getItem("planFilter")!)
      this.sessionData = JSON.parse(sessionStorage.getItem("Data")!);
      this.PlanData = JSON.parse(sessionStorage.getItem("companyData")!);
    }
    if (this.insuranceType.InsuranceCateCode === 10) {

      this.sessionData = JSON.parse(sessionStorage.getItem("CVData")!);
      this.PlanData = JSON.parse(sessionStorage.getItem("popupData")!);
      this.sessionPostData = JSON.parse(sessionStorage.getItem("postData")!)
      this.UrlData = JSON.parse(sessionStorage.getItem("UrlData")!)
    }
    if (this.PlanData.CompanyCode === "15") {
      this.Unique_Id = JSON.parse(sessionStorage.getItem("UniqueId")!)
      if (this.Unique_Id != null) {
        this.showstatus = true;

      }
    }

    if (this.PlanData.CompanyCode === "9" ||
      this.PlanData.CompanyCode === "4" ||
      this.PlanData.CompanyCode === "12") {
      this._subscriptions.push(
        this._route.paramMap.subscribe((p: any) => {
          const No: string = p.get("a_id");
          const Odp: string = p.get("odp");
          this.postData.ApplicationNo = Number(decrypt(No));
          this.postData.ApplicationNoOdp = Number(decrypt(Odp));
        })
      );
    } else {
      this._subscriptions.push(
        this._route.paramMap.subscribe((p: any) => {
          const No: string = p.get("a_id");
          const Odp: string = p.get("odp");

          this.postData.ApplicationNo = Number(No);
          this.postData.ApplicationNoOdp = Number(Odp);
        })
      );

      this._subscriptions.push(this._route.queryParams
        .subscribe((params: any) => {
          // console.log("--f-f-f-f-f-f-", params);
          if (params && params.unique_id) {
            this.uniqueId = params.unique_id
          } else {
            this.uniqueId = null
          }
        }
        ))
    }

    // let a=decrypt(this.proposalNoTataAig)

    console.log(this.proposalNoTataAig)
    switch (this.PlanData.CompanyCode) {
      case "2":
        {
          this.ckycDetailFormForFutrue()
          break;
        }
      case "7": {
        this.ckycDetailFormForSBI()
        break;
      }
      case "9": {
        this.ckycDetailFormForTataAig()
        break;
      } case "11": {
        this.ckycDetailFormForReliance()
        break;
      } case "4": {
        this.ckycDetailFormForIffcoTokkio()
        break;
      } case "19": {
        this.ckycDetailFormForShreeRam()
        break;
      } case "6": {
        this.ckycDetailFormForUniversal()
        break;
      } case "8": {
        this.ckycDetailFormForGoDigit()
        break;
      } case "12": {
        this.ckycDetailFormForNewIndia()
        break;
      } case "16": {
        this.ckycDetailFormForUnitedIndia()
        break;
      } case "14": {
        this.ckycDetailFormForHDFCHealth()
        break;
      } case "13": {
        // this.ckycDetailFormForTataAig()
        this.ckycDetailFormBajaj();
        break;
      }
      default: {
        break;
      }
    }

    if (this.PlanData.CompanyCode !== "11") {
      this.getCkycDocList()
    } else {
      if (this.uniqueId !== null) {
        this.checkRelianceCkycStatus()
      } else {
        this.getCkycDocList()
      }
    }

    if (this.PlanData.CompanyCode == "19") //|| this.PlanData.CompanyCode == "4"
    {
      this.updateIdentityValidity()
      this.updateIdentityValidityPOI()
      this.updateIdentityValidityPOA()
    } else if (this.PlanData.CompanyCode == "4") //|| this.PlanData.CompanyCode == "4"
    {
      this.updateIdentityValidity()
      this.updateIdentityValidityPOI()
      this.updateIdentityValidityPOA()
    }
    else {
      if (this.PlanData.CompanyCode != "15") {
        this.updateIdentityValidity()
      }

    }


  }
  getMinDate(year: number) {
    return setMinDate(year);
  }
  getMaxDate(year: number) {
    return setMaxDate(year);
  }
  getMaxRegDate(year: number) {
    return setMaxRegDate(year)
  }


  ckycDetailFormForFutrue() {
    this.ckycDetailForm = this._fb.group({
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      doctype: ["", [Validators.required]],
      docNo: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      FullName: ["", [Validators.required]],
      customerType: ["I", [Validators.required]],

    })
  }
  ckycDetailFormForSBI() {
    this.ckycDetailForm = this._fb.group({
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      doctype: ["", [Validators.required]],
      docNo: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      FullName: ["", [Validators.required]],
      customerType: ["Ind", [Validators.required]],
      pinCode: ["", [Validators.required]],
      mobileNo: ["", [Validators.required]]
    })
  }
  ckycDetailFormForTataAig() {
    console.log(this.step);

    this.step!.stepInd = 1;
    this.step!.stepDesc = "pan"

    this.ckycDetailForm = this._fb.group({
      DOB: [""],
      doctype: [""],
      docNo: [""],
      gender: [""],
      FullName: [""],
      panNo: [""],//, Validators.pattern(PATTERN.PAN)
      uidNo: [""],//, Validators.pattern(PATTERN.AADHAAR)
      docData: [""]
    })



    // this.onSelectStep(this.step)

    // this.validationObj.push({key:"panNo",validation:[Validators.required,Validators.pattern(PATTERN.PAN)]})
    // this.validationObj.push({key:"FullName",validation:[Validators.required]});
    this.identityMask = MASKS.PAN
    // this.onAddValidation(this.validationObj)
  }
  ckycDetailFormForGoDigit() {

    this.ckycDetailForm = this._fb.group({
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      doctype: ["", [Validators.required]],
      docData: ['',],
      docNo: ['']
    })
  }


  ckycDetailFormForUnitedIndia() {

    this.ckycDetailForm = this._fb.group({
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      doctype: ["", [Validators.required]],
      docNo: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      FullName: ["", [Validators.required]],
      customerType: ["Ind", [Validators.required]],
      pinCode: ["", [Validators.required]],
      mobileNo: ["", [Validators.required]]
    })
  }

  ckycDetailFormForNewIndia() {
    this.ckycDetailForm = this._fb.group({
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      doctype: ["", [Validators.required]],
      docNo: ['']
    })
  }
  ckycDetailFormForReliance() {
    this.ckycDetailForm = this._fb.group({
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      doctype: ["", [Validators.required]],
      docNo: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      FullName: ["", [Validators.required]],
      customerType: ["Ind", [Validators.required]],
      panNo: [""]
    })
  }

  ckycDetailFormForIffcoTokkio() {
    this.ckycDetailForm = this._fb.group({
      doctype: [""],
      docNo: [""],
      doctypePOI: [""],
      docNoPOI: [""],
      doctypePOA: [""],
      docNoPOA: [""],
      docDataPOI: [""],
      docDataPOA: [""],
      docPhotograph: [""]
    })
  }
  ckycDetailFormForShreeRam() {
    this.ckycDetailForm = this._fb.group({
      // DOB: ["", [Validators.required, Validators.maxLength(10)]],
      doctypePOI: ["", [Validators.required]],
      docNoPOI: ["", [Validators.required]],
      doctypePOA: ["", [Validators.required]],
      docNoPOA: ["", [Validators.required]],
      docDataPOI: ["", [Validators.required]],
      docDataPOA: ["", [Validators.required]],
      ckycNo: ["", [Validators.required, Validators.minLength(14)]],
      profilePic: ["", [Validators.required]],
      Fathername: ["", [Validators.required]],
      panNo: ["", [Validators.required]],
      panDocUpload: ["", [Validators.required]]

    })
    this.onSelectChange("CKYC");
    // this.updateIdentityValidity()
    this.updateIdentityValidityPOI();
    this.updateIdentityValidityPOA();
    this.identityMask = MASKS.PAN;
  }


  ckycDetailFormForUniversal() {
    this.ckycDetailForm = this._fb.group({
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      doctype: ["", [Validators.required]],
      docNo: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      FullName: ["", [Validators.required]]

    })
  }
  ckycDetailFormForHDFCHealth() {
    this.ckycDetailForm = this._fb.group({
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      docNo: ["", [Validators.required]],
      doctype: ["", [Validators.required]],
      FullName: ["", [Validators.required]],
      gender: ["", [Validators.required]]
    })
  }


  ckycDetailFormBajaj() {
    this.ckycDetailForm = this._fb.group({
      ckycNo: ["", [Validators.required, Validators.pattern(PATTERN.CKYC)]],
      DOB: ["", [Validators.required, Validators.maxLength(10)]],
      panNo: ["", [Validators.required, Validators.pattern(PATTERN.PAN)]],
      doctype: ["", [Validators.required]],
      docData: ['', [Validators.required]],
      docNo: ['']
    })
    this.onChangeCKYCYesNO(1);
  }

  onAddValidation(vldObj: { key: string, validation: any[] }[]) {
    console.log(vldObj);

    vldObj.forEach((x: any) => {
      console.log(this.ckycDetailForm.controls[x.key], x.key);

      this.ckycDetailForm.controls[x.key]!.setValidators([...x.validation]);
      this.ckycDetailForm.controls[x.key]!.updateValueAndValidity();
    })
  }


  onSelectChange(event: any) {
    console.log(event);
    debugger
    if (event === 'CKYC') {

      this.CKYCHideShowShreeRam = true;
      if (this.ckycDetailForm.controls["ckycNo"]) {

        this.ckycDetailForm.controls["ckycNo"]!.enable();
        this.ckycDetailForm.controls["panNo"]!.enable();
        this.ckycDetailForm.controls["panDocUpload"]!.enable();

        this.ckycDetailForm.controls["docNoPOI"]!.disable();
        this.ckycDetailForm.controls["docDataPOI"]!.disable();
        this.ckycDetailForm.controls["docDataPOA"]!.disable();
        this.ckycDetailForm.controls["docNoPOA"]!.disable();
        this.ckycDetailForm.controls["doctypePOA"]!.disable();
        this.ckycDetailForm.controls["doctypePOI"]!.disable();
        this.ckycDetailForm.controls["Fathername"]!.disable();
        this.ckycDetailForm.controls["profilePic"]!.disable();
      }

    } else {
      this.CKYCHideShowShreeRam = false
      this.ckycDetailForm.controls["ckycNo"]!.disable();


      this.ckycDetailForm.controls["panNo"]!.enable();
      this.ckycDetailForm.controls["panDocUpload"]!.enable();
      this.ckycDetailForm.controls["docDataPOI"]!.enable();
      this.ckycDetailForm.controls["docDataPOA"]!.enable();
      this.ckycDetailForm.controls["docNoPOA"]!.enable();
      this.ckycDetailForm.controls["docNoPOI"]!.enable();
      this.ckycDetailForm.controls["doctypePOA"]!.enable();
      this.ckycDetailForm.controls["doctypePOI"]!.enable();
      this.ckycDetailForm.controls["Fathername"]!.enable();
      this.ckycDetailForm.controls["profilePic"]!.enable();

    }
    // this.oiForm.reset()
    // this.ckycDetailForm.updateValueAndValidity()
    // this.ckycDetailForm.reset()
    // this.ckycDetailForm.markAsPristine();
    // this.ckycDetailForm.markAsUntouched();
    // this.ckycDetailForm.value.reset();
  }

  onRemoveValidation(vldObj: { key: string, validation: any[] }[]) {
    vldObj.forEach((x: any) => {
      this.ckycDetailForm.controls[x.key]!.clearValidators();
      this.ckycDetailForm.controls[x.key]!.updateValueAndValidity();
    })
  }

  onShowHideInputOfTataAig() {

  }

  onSelectCustomerType(event: MatSelectChange) {
    if (this.PlanData.CompanyCode == '7' || this.PlanData.CompanyCode == '11') {
      if (event.value === 'Ind') {
        this.CkycDocListFilter = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.ApplicableFor === 'Ind' || x.ApplicableFor === 'Both') })
      } else if (event.value === 'LE') {
        this.CkycDocListFilter = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.ApplicableFor === 'LE' || x.ApplicableFor === 'Both') })

      } else {
        this.CkycDocListFilter = this.CkycDocList
      }
    } else if (this.PlanData.CompanyCode == "2" || this.PlanData.CompanyCode == '16') {
      if (event.value === 'I') {
        this.CkycDocListFilter = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.ApplicableFor === 'Ind' || x.ApplicableFor === 'Both') })
      } else if (event.value === 'C') {
        this.CkycDocListFilter = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.ApplicableFor === 'LE' || x.ApplicableFor === 'Both') })

      } else {
        this.CkycDocListFilter = this.CkycDocList
      }
    } else {
      if (event.value === 'Ind') {
        this.CkycDocListFilter = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.ApplicableFor === 'Ind' || x.ApplicableFor === 'Both') })
      } else if (event.value === 'LE') {
        this.CkycDocListFilter = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.ApplicableFor === 'LE' || x.ApplicableFor === 'Both') })

      } else {
        this.CkycDocListFilter = this.CkycDocList
      }
    }
  }
  editDetails() {
    this.successcode = '';
    this.ckycDetails = null;
    this.btnCkeckStauts = false;
    this.ckycDetailForm.enable();

  }

  editDetailsSBI() {
    this.successcode = '';
    this.ckycDetails = null;
    this.btnCkeckStauts = false;
    this.ckycDetailForm.enable();
    // this.onChangeCKYCYesNO(this.ckycYesNoCode,this.step)
    console.log(this.radioBtnValueBajaj)
    this.onSelectStep(this.radioBtnValueBajaj)
  }
  editDetailsTataAig() {
    this.successcode = '';
    this.ckycDetails = null;
    this.btnCkeckStauts = false;
    this.ckycDetailForm.enable()
    this.fileName = ''
    this.ckycDetailForm.patchValue({
      DOB: "",
      doctype: "",
      docNo: "",
      panNo: "",
      docData: ""
    })
    // this.onSelectStep(this.step)
  }
  onContinueSuccessClick() {
    if (this.insuranceType.InsuranceCateCode === 1) { //For Bike
      if (this.PlanData.CompanyCode == '7') {
        this._router.navigate([
          `/bike-insurance/buyplan-Sbi`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      } else if (this.PlanData.CompanyCode == '11') {
        this._router.navigate([
          `/bike-insurance/buyplan`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      }

      else if (this.PlanData.CompanyCode == '6') {
        this._router.navigate([
          `/bike-insurance/buyplan-UniversalShampoo`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      } else if (this.PlanData.CompanyCode == '9' || this.PlanData.CompanyCode == '12') {
        this.isCkycValidate.emit(this.ckycResponseData)
        this.showModal = !this.showModal;
      }
      else {
        this._router.navigate([
          `/bike-insurance/buyplan`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      }
    } else if (this.insuranceType.InsuranceCateCode === 2) { //For Car
      if (this.PlanData.CompanyCode == '7') {
        this._router.navigate([
          `/car-insurance/buyplan`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      } else if (this.PlanData.CompanyCode == '6') {
        this._router.navigate([
          `/car-insurance/buyplan`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      } else if (this.PlanData.CompanyCode == '9' || this.PlanData.CompanyCode == '12') {
        this.isCkycValidate.emit(this.ckycResponseData)
        this.showModal = !this.showModal;
      }
      else {
        this._router.navigate([
          `/car-insurance/buyplan`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      }
    } else if (this.insuranceType.InsuranceCateCode === 3) {//for health
      if (this.PlanData.CompanyCode == "14") {
        const p_id = this.PlanData.PartnerId;
        this._router.navigate([
          `/health-insurance/buyplan-hdfcErgo/`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
          encrypt(this.PlanData.CompanyCode),
          encrypt(this.PlanData.ProductCode),
          encrypt(`${this.planFilter.sumInsured}`),
          // encrypt(plan.),
          encrypt(this.PlanData.Premium),
          encrypt(`${this.planFilter.Tanure}`),
        ]);
      }
    } else if (this.insuranceType.InsuranceCateCode === 10) { //For Commercial Vehicle
      if (this.PlanData.CompanyCode == '7') {
        this._router.navigate([
          `/cv-insurance/buyplan`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      } else if (this.PlanData.CompanyCode == '6') {
        this._router.navigate([
          `/cv-insurance/buyplan`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      } else if (this.PlanData.CompanyCode == '9' || this.PlanData.CompanyCode == '12') {
        this.isCkycValidate.emit(this.ckycResponseData)
        this.showModal = !this.showModal;
      }
      else {
        this._router.navigate([
          `/cv-insurance/buyplan`,
          encrypt(`${this.postData.ApplicationNo}`),
          encrypt(`${this.postData.ApplicationNoOdp}`),
        ], { replaceUrl: true });
      }
    }
  }

  public onSubmitCKYCInfoBajaj(): any {
    this.step = { stepInd: 0, stepDesc: '' };
    this.errMsg_oi = "";
    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    let cData = this.ckycDetailForm.value;
    let dob = new Date(cData.DOB)
    let formatDOB = formatDate(dob, 'dd-MMM-yyyy', 'en-US');
    let docT = { DocShortDesc: "", DocDesc: '' };
    let DocNO: any;

    if (cData.ckycNo) {
      this.step.stepInd = 1; this.step.stepDesc = "CKYC";
      DocNO = cData.ckycNo;
      docT.DocShortDesc = "Z";
      docT.DocDesc = "CKYC Number"
    } else if (cData.panNo) {
      this.step.stepInd = 2; this.step.stepDesc = "POI";
      DocNO = cData.panNo;
      docT.DocShortDesc = "C";
      docT.DocDesc = "PAN"
    } else {
      if (cData.doctype.DocDesc === "PAN") {
        this.step.stepDesc = "POI";
      } else {
        this.step.stepDesc = "POA";
      }
      this.step.stepInd = 3;
      DocNO = cData.docNo.trim();
      docT = cData.doctype
    }
    // onChangeCKYCYesNO
    const ckycData: ICKYCBajaj = {
      ApplicationNo: this.postData.ApplicationNo,
      RegistrationNo: "0",
      Quotationno: this.PlanData.policyNumber,
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      CKYCStepInd: this.step.stepInd,
      CKYCStepDesc: this.step.stepDesc,
      CKYCNO: "0",
      DOB: formatDOB,
      DocumentNo: DocNO,
      DocShortDesc: docT.DocShortDesc,
      DocDesc: docT.DocDesc,
      documentExtension: this.docExtension,
      FileBase64: this.base64url ? this.base64url : ""
    }
    debugger;
    if ((this.docExtension === null || this.docExtension === "" || this.docExtension === undefined)
      && (this.base64url === "" || this.base64url === null || this.base64url === undefined)) {
      this._subscriptions.push(
        this.posHomeService.postCKYCBajajDetails(ckycData).subscribe((result: ApiResponse) => {
          debugger
          if (result.successcode == "0" || result.successcode == null) {
            this._toastService.error(result.msg, 'Validation Failed!');

          } else if (result.successcode == '1' && result.data.errCode != "1") {
            let ckData = result.data;
            this._toastService.success(result.msg, 'Validation Success.');
            sessionStorage.setItem("CKYCData", JSON.stringify(ckData));

            this.successcode = "1";
            this.ckycDetails = result.data
            this.ckycDetailForm.disable();

            // this._toastService.success(result.msg, 'Validation Success.');
            // this.isCompleted_ckycInfo = true;
            // setTimeout(() => {
            //   this.tabIndex++;
            // }, 100);



          } else {

            if (result.data!.poiStatus === "FOUND" && result.data!.ckycStatus === "NOT_FOUND" && result.data!.poaStatus === "NA") {
              this._toastService.error("CKYC number not found using POI details.Enter correct details or You can search CKYC number using other Documents.", 'CKYC Error.');
              if (this.step.stepInd == 2) {
                this.isPOIStatusFound = false;
                this.step.stepInd = 1;
                this.step.stepDesc = "POI"
                this.onChangeCKYCYesNO(0, this.step)
              }
            }
            else if (result.data!.poiStatus === "FOUND" && result.data!.poaStatus === "FOUND" && result.data!.ckycStatus === "NOT_FOUND") {
              this._toastService.error("CKYC number not found using POA details.", 'CKYC Error.');
              if (this.step.stepInd == 3) {
                this.isPOIStatusFound = false
                this.onChangeCKYCYesNO(0, this.step)
              }
            } else {
              this._toastService.error(result.msg, 'CKYC Error.');
              // if (this.step.stepInd == 3) {
              //   // this.isPOIStatusFound=true;
              //   // this.onChangeCKYCYesNO(0, this.step)
              // }
            }
          }
        })
      )
    }
    else {
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
            let ckData = result.data;
            sessionStorage.setItem("CKYCData", JSON.stringify(ckData));
            this._toastService.success(result.msg, 'Validation Success.');
            this.isCompleted_ckycInfo = true;
            // setTimeout(() => {
            //   this.tabIndex++;
            // }, 100);
          }
        })
      )
    }



    // BajajValidateCKYCDocUplode


  }

  onSubmitCKYCInfoOriental(value: any) {
    console.log(value);
    let ckycData: ICKYCOriental = {
      ApplicationNo: this.postData.ApplicationNo,
      RegistrationNo: "0",
    }
    this.showstatus = true
    this.HideCkyc = false
    if (value == "ckyc") {
      this.posHomeService.OrientalCKYCGet(ckycData).subscribe((result: ApiResponse) => {
        debugger
        this.Unique_Id = result.data
        if (result.successcode == '1') {
          debugger
          let URl = result.data.ManualCkycUrl;
          console.log(window.location.href)
          sessionStorage.setItem("currentUrl", window.location.href);
          window.open(URl, "_self");
          let OrientalCKYCStatus = {
            UniqueId: result.data.UniqueId,
            manualCkycUrl: result.data.ManualCkycUrl
          }
          console.log(OrientalCKYCStatus);
          console.log(result);

          sessionStorage.setItem("UniqueId", JSON.stringify(OrientalCKYCStatus))
          // location.href = URl

          // this.Orientalkyc = true;
          // this.Orientalkycstatus = false;
        }

      })
    } else {
      debugger
      console.log(this.Unique_Id);

      let ckycDatastatus: ICKYCOrientalStatus = {
        ApplicationNo: this.postData.ApplicationNo,
        RegistrationNo: "0",
        req_id: this.Unique_Id.UniqueId,
        CompanyCode: this.PlanData.CompanyCode,
        manualKYCurl: this.Unique_Id.ManualCkycUrl ? this.Unique_Id.ManualCkycUrl : this.Unique_Id.manualCkycUrl
      }
      this.posHomeService.OrientalCKYCStatus(ckycDatastatus).subscribe((result: ApiResponse) => {
        debugger
        this.successcode = result.successcode
        if (result.successcode == '0') {
          this._toastService.error(result.msg, "");
        } else {
          this.ckycDetails = result.data
          this.showstatus = false;
          let ckData = result.data;
        }
      })
    }

  }


  onSubmitCKYCInfoFuture(): any {
    console.log(this.ckycDetailForm.controls);

    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    this.errMsg_oi = "";
    console.log(this.errMsg_oi);

    let step: any = { stepInd: 0, stepDesc: '' };
    let cData = this.ckycDetailForm.value;
    let dob = new Date(cData.DOB)
    let formatDOB = formatDate(dob, 'dd-MM-yyyy', 'en-US');
    let docT = { DocShortDesc: "", DocDesc: '' };
    let DocNO: any;
    console.log(formatDOB);

    if (cData.ckycNo) {
      step.stepInd = 1; step.stepDesc = "CKYC";
      DocNO = cData.ckycNo;
      docT.DocShortDesc = "CKYC_NO";
      docT.DocDesc = "Existing CKYC Number"
    } else if (cData.panNo) {
      step.stepInd = 2; step.stepDesc = "POI";
      DocNO = cData.panNo;
      docT.DocShortDesc = "PAN";
      docT.DocDesc = "PAN Card"
    } else {
      step.stepInd = 3; step.stepDesc = "POA";
      DocNO = cData.docNo;
      docT = cData.doctype
    }

    const ckycData: ICKYCFutureGen = {
      ApplicationNo: this.postData.ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      DOB: formatDOB,
      DocumentNo: DocNO,
      DocShortDesc: docT.DocShortDesc,
      DocDesc: docT.DocShortDesc,
      Name: cData.FullName,
      Gender: cData.gender,
      CustomerType: cData.customerType
    }
    debugger
    this._subscriptions.push(
      this.posHomeService.FutureGenCKYCDetails(ckycData).subscribe((result: ApiResponse) => {
        // console.log(result);
        if (result.successcode == "0" || result.successcode == null) {
          this._toastService.error(result.msg, 'Validation Error.');
          this.successcode = "";

        } else if (result.successcode == '1') {
          this.ckycDetails = result.data;
          sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
          if (result.data.CKYCRemark == 'OK') {
            this._toastService.success(result.msg, 'Validation Success.');
            this.successcode = "1";
            this.ckycDetailForm.disable();
          } else {
            this._toastService.warning(result.data.CKYCRemark, 'Validation Failed!');
            this.manualKYCurl = result.data.ManualCkycUrl;
            this.successcode = "2";
            this.ckycDetailForm.disable();
          }
        } else {
          this._toastService.error(result.msg, 'Validation Error.');
          this.successcode = "";
        }
      }))
  }

  public onCheckCkycStausFuture() {
    this._subscriptions.push(
      this._vehicleBuyPlanService.getCkycDocUploadStatusFuture(this.ckycDetails.UniqueId).subscribe((result: ApiResponse) => {
        console.log(result)
      })
    )
  }


  public onSubmitCKYCInfoSBI(): any {

    // sessionStorage.removeItem("CKYCData");
    console.log(this.ckycDetailForm);

    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    this.errMsg_oi = "";
    console.log(this.errMsg_oi);

    let step: any = { stepInd: 0, stepDesc: '' };
    let cData = this.ckycDetailForm.value;
    let dob = new Date(cData.DOB)
    let formatDOB = formatDate(dob, 'dd-MMM-yyyy', 'en-US');
    let docT = cData.doctype;//{ DocShortDesc: "", DocDesc: '' };

    const ckycData: ICKYCSBI = {
      ApplicationNo: this.postData.ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      Quotationno: this.PlanData.policyNumber,
      DOB: formatDOB,
      DocumentNo: cData.docNo,
      DocShortDesc: docT.DocShortDesc,
      DocDesc: docT.DocDesc,
      Name: cData.FullName,
      Gender: cData.gender,
      CustomerType: cData.customerType,
      RegistrationNo: '',
      CKYCStepInd: 0,
      CKYCStepDesc: '',
      CKYCNO: '',
      FileBase64: '',
      documentExtension: '',
      Pincode: cData.pinCode,
      MobileNo: cData.mobileNo
    }

    console.log(ckycData);


    debugger
    this._subscriptions.push(
      this.posHomeService.postCkycSBIStauts(ckycData).subscribe((result: ApiResponse) => {
        console.log(result);
        debugger
        this.ckyAdditionalData = result.additionaldata;
        if (this.ckyAdditionalData) {
          sessionStorage.setItem("CKYCAdditionalData", JSON.stringify(this.ckyAdditionalData));
        }
        if (result.successcode == "0" || result.successcode == null) {

          this._toastService.warning(result.msg, 'Validation Failed!');

          this.successcode = "";

        }
        else if (result.successcode == '1') {
          this.ckycDetails = result.data;

          sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));

          if (this.ckycDetails!.KYCStatus == 'No' &&
            this.ckycDetails!.CKYCStatus === null) {
            this._toastService.warning(result.data.CKYCRemark, result.msg);
            this._toastService.warning(result.data.CKYCRemark, 'Validation Failed!');
            this.manualKYCurl = this.ckycDetails!.ManualCkycUrl;
            this.successcode = "2";
            this.ckycDetailForm.disable();

          } else if (this.ckycDetails!.KYCStatus == 'Yes') {


            if (this.ckycDetails!.CKYCStatus === "CKYCRejected") {
              this._toastService.warning(result.data.CKYCRemark, 'Validation Warning!');
              this.manualKYCurl = this.ckycDetails!.ManualCkycUrl;
              this.successcode = "2";
              this.ckycDetailForm.disable();
            } else {
              this._toastService.success(result.msg, 'Validation Success.');
              this.manualKYCurl = result!.data!.ManualCkycUrl;
              this.successcode = "1";
              this.ckycDetailForm.disable()
            }
          } else if (this.ckycDetails!.KYCStatus == 'No') {
            if (this.ckycDetails!.CKYCStatus === "CKYCRejected") {
              this._toastService.warning(result.data.CKYCRemark, result.msg);
              this.manualKYCurl = this.ckycDetails!.ManualCkycUrl;
              this.successcode = "2";

              this.ckycDetailForm.disable();
            } else {
              this._toastService.success(result.msg, 'Validation Success.');
              this.manualKYCurl = result!.data!.ManualCkycUrl;
              this.successcode = "1";
              this.ckycDetailForm.disable()
            }
          } else if (this.ckycDetails!.KYCStatus === null) {

            if (this.ckycDetails!.CKYCStatus === "CKYCRejected" || this.ckycDetails!.CKYCStatus === null) {
              this._toastService.warning(result.data.CKYCRemark, result.msg);
              this.manualKYCurl = this.ckycDetails!.ManualCkycUrl;
              this.successcode = "2";

              this.ckycDetailForm.disable();
            } else {
              this._toastService.success(result.msg, 'Validation Success.');
              this.manualKYCurl = result!.data!.ManualCkycUrl;
              this.successcode = "1";
              this.ckycDetailForm.disable()
            }


          }
          else {
            this._toastService.success(result.msg, 'Validation Success.');
            this.manualKYCurl = result!.data!.ManualCkycUrl;
            this.successcode = "1";
            this.ckycDetailForm.disable()
          }

        } else {
          this._toastService.warning("Something went wrong.Please try again.", 'Validation Failed!');
        }
      }))
  }


  onSubmitCKYCInfoReliance(): any {

    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    this.errMsg_oi = "";
    let cData = this.ckycDetailForm.value;
    let dob = new Date(cData.DOB)
    let formatDOB = formatDate(dob, 'dd-MM-yyyy', 'en-US');


    const ckycData: ICKYCReliance = {
      ApplicationNo: this.postData.ApplicationNo,
      RegistrationNo: "0",
      Quotationno: "",
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      CKYCStepInd: "1",
      CKYCStepDesc: "",
      DOB: formatDOB,
      DocumentNo: cData.docNo,
      DocShortDesc: cData.doctype.DocShortDesc,
      DocDesc: cData.doctype.DocDesc,
      documentExtension: this.docExtension,
      FileBase64: this.base64url ? this.base64url : "",
      Name: cData.FullName,
      Gender: cData.gender,
      PanNumber: cData.panNo
    }

    this._subscriptions.push(
      this.posHomeService.RelianceCKYCDetails(ckycData, "fetch")!.subscribe((result: ApiResponse) => {

        if (result.successcode == "0" || result.successcode == null) {
          this._toastService.error(result.msg, 'CKYC Error.');
          this.successcode = "";
          // this.ckycDetailForm.disable()

        } else if (result.successcode == '1') {
          this.ckycDetails = result.data;
          sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
          if (result.data.CKYCStatus == "true") {
            this._toastService.success(result.msg, 'Validation Success.');
            this.successcode = "1";
            this.ckycDetailForm.disable()
          } else {
            this._toastService.warning(result.data.CKYCRemark, 'Validation Failed!');
            this.manualKYCurl = result.data.ManualCkycUrl;
            this.successcode = "2";
            this.ckycDetailForm.disable();
          }

        }
      }))
  }


  checkRelianceCkycStatus() {
    const ckycData: any = {
      ApplicationNo: this.postData.ApplicationNo,
      UniqueId: this.uniqueId,
      CompanyCode: this.PlanData.CompanyCode
    }
    this.getCkycDocList()

    this.posHomeService.RelianceCKYCDetails(ckycData, "status")!.subscribe((result: ApiResponse) => {
      // console.log(result);
      if (result.successcode == "0" || result.successcode == null) {

        this._toastService.error(result.msg, 'Validation Failed!');
        // this.manualKYCurl = result.data.ManualCkycUrl;
        this.successcode = "2";
        this.ckycDetailForm.disable();
      } else if (result.successcode == '1') {
        this.ckycDetails = result.data;
        sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
        if (result.data.CKYCStatus == "true") {
          this._toastService.success(result.msg, 'Validation Success.');
          this.successcode = "1";
          this.docType = this.CkycDocListFilter.find(x => x.DocShortDesc === this.ckycDetails.DocType)
          this.ckycDetailForm.patchValue({
            doctype: this.docType,
            DOB: new Date(this.ckycDetails.DOB),
            FullName: this.ckycDetails.FirstName,
            gender: this.ckycDetails.Gender
          })

          this.ckycDetailForm.disable()
          this.ckycDetailForm.patchValue({
            docNo: this.ckycDetails.DocNumber
          })

        } else {
          this._toastService.warning(result.data.CKYCRemark, 'Validation Failed!');
          this.manualKYCurl = result.data.ManualCkycUrl;
          this.successcode = "2";
          this.ckycDetailForm.disable();
        }

      }
    })
  }

  onSubmitCKYCInfoUniversal(): any {
    debugger
    console.log(this.ckycDetailForm.controls);

    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    this.errMsg_oi = "";
    console.log(this.errMsg_oi);

    let step: any = { stepInd: 0, stepDesc: '' };
    let cData = this.ckycDetailForm.value;
    let dob = new Date(cData.DOB)
    let formatDOB = formatDate(dob, 'dd-MMM-yyyy', 'en-US');
    let docT = { DocShortDesc: "", DocDesc: '' };
    let DocNO: any;

    // if (cData.ckycNo) {
    //   step.stepInd = 1; step.stepDesc = "CKYC";
    //   DocNO = cData.ckycNo;
    //   docT.DocShortDesc = "CKYC_NO";
    //   docT.DocDesc = "Existing CKYC Number"
    // } else if (cData.panNo) {
    //   step.stepInd = 2; step.stepDesc = "POI";
    //   DocNO = cData.panNo;
    //   docT.DocShortDesc = "PAN";
    //   docT.DocDesc = "PAN Card"
    // } else {
    //   step.stepInd = 3; step.stepDesc = "POA";
    //   DocNO = cData.docNo;
    //   docT = cData.doctype
    // }

    // if (doctype != 'Aadhar Card') {
    //   this.ckycDetailForm.controls.FullName.disable();
    //   this.ckycDetailForm.controls.gender.disable();
    // } else {
    //   this.ckycDetailForm.setValidators([Validators.required])
    // }
    console.log(cData);

    const ckycData: ICKYCUniversal = {
      ApplicationNo: this.postData.ApplicationNo,
      RegistrationNo: "0",
      Quotationno: "",
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      CKYCStepInd: "1",
      CKYCStepDesc: "",
      DOB: formatDOB,
      DocumentNo: cData!.docNo,
      DocShortDesc: cData!.doctype!.DocShortDesc,
      DocDesc: cData!.doctype!.DocDesc,
      documentExtension: "",
      FileBase64: "",
      Name: cData.FullName,
      Gender: cData.gender

    }
    console.log(this.PlanData);

    debugger
    this._subscriptions.push(
      this.posHomeService.postCKYCUniversalDetails(ckycData).subscribe((result: ApiResponse) => {
        console.log(result);
        if (result.successcode == "0" || result.successcode == null) {
          this._toastService.error(result.msg, 'Validation Failed!');
          console.log(result)
          this.manualKYCurl = result.data.ManualCkycUrl
          this.successcode = "2";
          this.ckycDetailForm.disable()
        }
        if (result.successcode == '1') {
          if (result.data.CKYCStatus === "success") {
            this._toastService.success(result.msg, 'Validation Success.');
            this.ckycDetails = result.data
            this.successcode = "1";
            sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
            this.ckycDetailForm.disable()
          }
          if (result.data.CKYCStatus === "failure") {
            this._toastService.error(result.msg, 'Validation Failed!');
            console.log(result)
            this.manualKYCurl = result.data.ManualCkycUrl
            this.successcode = "2";
            this.ckycDetailForm.disable()
          }

        }
      }))


  }

  public onSubmitCKYCInfoForGoDigit(): any {
    debugger
    console.log("lkdasfkldajkldsajk jdfaslk")
    console.log("jkdf ", this.ckycDetailForm)
    // this.step = { stepInd: 0, stepDesc: '' };
    this.errMsg_oi = "";
    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }

    if (this.fileUploadList[0] === "" || this.fileUploadList[0] === null || this.fileUploadList[0] === undefined) {
      this.errMsg_oi = "Please Enter Document file.";
      return false;
    }
    let cData = this.ckycDetailForm.value;
    let dob = new Date(cData.DOB)
    let formatDOB = formatDate(dob, 'dd-MMM-yyyy', 'en-US'); //dd-MMM-yyyy
    let docT = { DocShortDesc: "", DocDesc: '' };
    let DocNO: any;
    console.log(this.ckycDetailForm)
    let iskycDone: boolean;
    if (cData.doctype.DocDesc === "CKYC") {
      iskycDone = true
    }
    // {↵  "ApplicationNo": 24157,↵  "CompanyCode": "8",↵  "CompanyName": "Go Digit",↵  "DOB": "15-Sep-1998",↵  "DocType": "D02",↵  "DocNo": "JZRPK6966E"↵ }
    const ckycData: ICKYCGoDigit = {

      ApplicationNo: this.postData.ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      DOB: formatDOB,
      DocType: cData.doctype.DocShortDesc,
      DocumentNo: cData.docNo
    }

    this.formDataForGodigit = new FormData();
    this.formDataForGodigit.append("Document", this.fileUploadList[0])
    this.formDataForGodigit.append("JsonData", JSON.stringify(ckycData))
    // this.formDataForIffcoTokio.append("Document", this.fileUploadList[0]);
    console.log(this.uploadfileGodigit)
    console.log(this.formDataForGodigit);
    this._subscriptions.push(
      this._vehicleBuyPlanService.getGoDigitValidateCKYC(this.formDataForGodigit).subscribe((res: any) => {
        debugger
        console.log(res);
        if (res.successcode === "1" && res.data[0].msg === "success") {
          this._toastService.success(res.msg, 'Validation Success.');
          // this._router.navigate([
          //   `/bike-insurance/buyplan`,
          //   encrypt(`${this.postData.ApplicationNo}`),
          //   encrypt(`${this.postData.ApplicationNoOdp}`),
          // ]);
          this.onContinueSuccessClick()
        } else if (res.successcode === "0" && res.successcode === null) {
          this._toastService.error(res.msg, 'Validation Failed!');
        } else {
          this._toastService.error('Something Went Wrong');
        }
      })
    )
  }


  public onSubmitCKYCInfoForUnitedIndia(): any {
    debugger
    this.errMsg_oi = "";
    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    let cData = this.ckycDetailForm.value;
    let dob = new Date(cData.DOB)
    let formatDOB = formatDate(dob, 'dd/MMM/yyyy', 'en-US'); //dd-MMM-yyyy
    let docT = cData.doctype;
    console.log(this.ckycDetailForm)
    const ckycData: ICKYCUnitedIndia = {
      ApplicationNo: this.postData.ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      DOB: formatDOB,
      DocumentNo: cData.docNo,
      DocShortDesc: cData.doctype.DocShortDesc,
      Gender: cData.gender,
      MobileNo: cData.mobileNo,
      Pincode: cData.pinCode,
      Name: cData.FullName,
    }

    this._subscriptions.push(
      this._vehicleBuyPlanService.getUnitedIndiaValidateCKYC(ckycData).subscribe((res: ApiResponse) => {
        debugger
        console.log(res);
        if (res.successcode === "1") {
          this.ckycDetails = res.data;
          if (res.data) {
            if (res.data.KYCStatus === "Y" && (res.data.ManualCkycUrl === "" || res.data.ManualCkycUrl === null)) {
              this._toastService.success(res.msg, 'Validation Success.');
              this.successcode = '1';
              sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
            } else {
              this.manualKYCurl = res.data.ManualCkycUrl;
              this._toastService.warning(res.msg, 'Validation Warning.');
              this.successcode = '2';
            }
            // this.onContinueSuccessClick()
            this.ckycDetailForm.disable()
          } else {
            this.successcode = '';
            this._toastService.error(res.data.msg, 'Validation Failed!');
          }
        } else if (res.successcode === "0" && res.data.ManualCkycUrl !== "") {
          this.manualKYCurl = res.data.ManualCkycUrl;
          this._toastService.warning(res.msg, 'Validation Warning.');
          this.successcode = '2';
          this.ckycDetailForm.disable()

        } else if (res.successcode === "0") {
          this.successcode = '';
          this._toastService.error(res.msg, 'Validation Failed!');
        } else {
          this.successcode = '';
          this._toastService.error('Something Went Wrong');
        }
      })
    )
  }



  onSubmitCKYCInfoShreeRam(): any {
    console.log(this.ckycDetailForm);
    debugger
    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    let cData = this.ckycDetailForm.value;

    const ckycData: ICKYCShreeRam = {
      ApplicationNo: this.postData.ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,

    }


    if (this.CKYCHideShowShreeRam == true) {
      ckycData.ckycNumber = cData!.ckycNo
      ckycData.PanImageBase64 = this.base64url
      ckycData.PanNumber = cData.panNo
    } else {
      ckycData.DocType = cData.doctypePOI!.DocShortDesc;
      ckycData.PanNumber = cData.panNo;
      ckycData.PanImageBase64 = this.base64url


      ckycData.DocumentNo = cData.docNoPOI;
      ckycData.DocName = cData.doctypePOI!.DocDesc;
      ckycData.POIDocUploadBase64 = this.base64urlPAN;
      ckycData.POADocUploadBase64 = this.base64urlOtherDoc;
      ckycData.ProfilePicBase64 = this.base64urlProPic;
      ckycData.FatherName = cData.Fathername;
      ckycData.POA_TypeCode = cData.doctypePOA.DocShortDesc;
      ckycData.POA_TypeDesc = cData.doctypePOA.DocDesc;
      ckycData.POA_TypeNo = cData.docNoPOA;
    }



    this._subscriptions.push(
      this.posHomeService.ShreeRamCKYCDetails(ckycData).subscribe((result: ApiResponse) => {
        debugger
        console.log(result.data);
        if (result.successcode == "1") {
          if (result.data[0].Status == 1) {
            this._toastService.success(result.msg, 'Validation Success.');
            this.onContinueSuccessClick()
          } else {
            this._toastService.error(result.msg, 'Validation Failed.');
          }
        } else {
          this._toastService.error(result.msg, 'Validation Failed.');
        }

      }))

  }



  onSubmitCKYCInfoNewIndia(): any {
    console.log(this.ckycDetailForm);

    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }

    let cData = this.ckycDetailForm.value;
    let dob = moment(cData.DOB, "DD/MM/YYYY")//new Date(this.sessionPostData.DOB)
    let formatDOB: string = formatDate(dob.toDate(), 'dd/MM/yyyy', 'en-US');
    const ckycData: ICKYCNewIndia = {
      ApplicationNo: +this.postData.ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      RegistrationNo: this.sessionPostData.Data.RegistrationNo,
      DOB: formatDOB,
      DocType: cData.doctype.DocShortDesc,
      DocumentNo: cData.docNo
    }

    const apiType = 'validate'
    this._subscriptions.push(
      this.posHomeService.NewIndiaCKYDetails(ckycData, apiType)!.subscribe((result: ApiResponse) => {
        console.log(result.data);
        if (result.successcode == "1" && result.data) {
          this.ckycDetails = result.data;
          this.ckycResponseData = result.data
          if (this.ckycDetails.KYCStatus.toLowerCase() == "success" && this.ckycDetails.ManualCkycUrl === null) {
            this._toastService.success(this.ckycDetails.KYCStatus, 'Validation Success.');
            this.successcode = "1";
            this.ckycDetailForm.disable()
          } else {
            sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
            this.manualKYCurl = this.ckycDetails.ManualCkycUrl
            this._toastService.warning("Proceed with Manual Ckyc ", 'Validation Warning.');
            this.successcode = "2";
            this.ckycDetailForm.disable()
          }
          // this.ckycDetailForm.disable()
        } else {
          this._toastService.error(result.msg, 'Validation Failed!.');
        }


      }))

  }

  checkCKYStatusForNewIndia() {
    const ckycData =
    {
      ApplicationNo: +this.postData.ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      CompanyName: this.PlanData.ProductName,
      RegistrationNo: this.sessionPostData.Data.RegistrationNo,
      req_id: this.ckycDetails.UniqueId ? this.ckycDetails.UniqueId : ""
    }

    const apiType = 'status';
    this._subscriptions.push(
      this.posHomeService.NewIndiaCKYDetails(ckycData, apiType)!.subscribe((result: ApiResponse) => {
        if (result.successcode == "1" && result.data) {
          this._toastService.success(result.msg, 'Ckyc Status.');
          this.ckycResponseData = result.data
          this.successcode = "1";
          this.ckycDetailForm.disable();
        } else {
          this.ckycResponseData = result.data
          this._toastService.error("Manual Ckyc Status is Pending.", 'Ckyc Status.');
        }


      }))

  }

  onSubmitCKYCInfoIffcoTokio(): any {
    debugger
    this.errMsg_oi = ""
    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    let cData = this.ckycDetailForm.value;
    let proposalData = JSON.parse(sessionStorage.getItem("postData")!)

    let apiType: string;

    if (this.isckycFailedForIffcoTokio === false) {
      let dob = moment(proposalData.DOB, "DD-MM-YYYY").toDate() //new Date(proposalData!.DOB)
      let formatDOB = formatDate(dob, 'dd-MMM-yyyy', 'en-US');
      apiType = "fetch"
      const ckycData: any = {
        ApplicationNo: this.postData.ApplicationNo,
        RegistrationNo: this.sessionPostData.Data.RegistrationNo,
        Quotationno: "",
        CompanyCode: this.PlanData.CompanyCode,
        CompanyName: this.PlanData.ProductName,
      }
      ckycData.CKYCStepInd = 1,
        ckycData.CKYCStepDesc = "POI",
        ckycData.firstName = proposalData!.VechileOwnerName,
        ckycData.lastName = proposalData!.VehicleOwnerLastName,
        ckycData.DOB = formatDOB,
        ckycData.DocumentNo = cData.docNo,//"5111550325",
        ckycData.DocShortDesc = "",
        ckycData.DocDesc = cData.doctype.DocDesc,
        ckycData.Gender = proposalData!.GenderCodeDesc === "Male" ? "M" : "F"


      this._subscriptions.push(
        this.posHomeService.IffcoTokioCKYCDetails(ckycData, apiType)!.subscribe((result: ApiResponse) => {
          console.log(result.data);
          // this._router.navigate([
          //   `/bike-insurance/buyplan-IffcoTokio`,
          //   encrypt(`${this.postData.ApplicationNo}`),
          //   encrypt(`${this.postData.ApplicationNoOdp}`),
          // ]);
          if (result.successcode === "0") {
            this._toastService.error(result.msg, "CKYC Failed!")
            this.isCkycValidate.emit(false)
            // this.isckycFailedForIffcoTokio = true;
          } else if (result.successcode === "1") {
            sessionStorage.setItem("CKYCData", JSON.stringify(result.data));
            this.isCkycValidate.emit(true)
            this.showModal = !this.showModal;
          } else {
            this._toastService.error(result.msg ? result.msg : "Something went wrong .Please try again later.", "Not Responding")
            this.isCkycValidate.emit(false)
            // this.isckycFailedForIffcoTokio = true;
          }
        }))
    } else {
      if (this.isCreateFormIffcoTokio === true) {
        this.iffcoTokioReferenceNo = ''
        apiType = "create";
        console.log(this.fileUploadList);
        if (this.fileUploadList.length !== 3) {
          this.errMsg_oi = "Please fill all details correctly.";
          return false;
        }
        console.log(this.sessionPostData, cData);
        let dob = moment(this.sessionPostData.DOB, "DD-MM-YYYY").toDate()
        const ckycDataPOI: any = {
          ApplicationNo: this.sessionPostData.ApplicationNo,
          RegistrationNo: this.sessionPostData.Data.RegistrationNo,
          Quotationno: this.PlanData.Quotationno,
          CompanyCode: this.PlanData.CompanyCode,
          CompanyName: this.PlanData.ProductName,
          CKYCStepInd: 2,
          CKYCStepDesc: "POI",
          DOB: formatDate(dob, 'dd-MMM-yyyy', 'en-US'),
          DocShortDesc: "IDENTITY_PROOF",
          DocDesc: "PAN",
          DocumentNo: cData.docNoPOI,
          documentExtension: this.fileExtionPOI,
          FileBase64: "",
          prefix: this.sessionPostData.Salutation,
          firstName: this.sessionPostData.VechileOwnerName,
          middleName: "",
          lastName: this.sessionPostData.VehicleOwnerLastName,
          gender: this.sessionPostData.GenderCodeDesc[0],
          relatedPersonPrefix: "Mr",
          relatedPersonFirstName: this.sessionPostData.NomineeName.split(" ")[0],
          relatedPersonMiddleName: this.sessionPostData.NomineeName.split(" ").length > 2 ? this.sessionPostData.NomineeName.split(" ")[1] : "",
          relatedPersonLastName: this.sessionPostData.NomineeName.split(" ")[this.sessionPostData.NomineeName.split(" ").length - 1],
          relationshipType: this.sessionPostData.RelationshipDesc,
          MobileNo: this.sessionPostData.MobileNo,

          email: this.sessionPostData.EmailID,
          address: this.sessionPostData.PostalAdd + this.sessionPostData.Area,
          city: this.sessionPostData.CityDesc,
          district: this.sessionPostData.CityDesc,
          state: this.sessionPostData.StateDesc,
          country: "India",
          pinCode: this.sessionPostData.PINCode,
          correspondenceAddress: this.sessionPostData.PostalAdd + this.sessionPostData.Area,
          correspondenceCity: this.sessionPostData.CityDesc,
          correspondenceDistrict: this.sessionPostData.CityDesc,
          correspondenceState: this.sessionPostData.StateDesc,
          correspondenceCountry: "India",
          correspondencePinCode: this.sessionPostData.PINCode,
        }
        const ckycDataPOA: any = {
          ApplicationNo: this.sessionPostData.ApplicationNo,
          RegistrationNo: this.sessionPostData.Data.RegistrationNo,
          Quotationno: this.PlanData.Quotationno,
          CompanyCode: this.PlanData.CompanyCode,
          CompanyName: this.PlanData.ProductName,
          CKYCStepInd: 2,
          CKYCStepDesc: "POA",
          DOB: formatDate(dob, 'dd-MMM-yyyy', 'en-US'),
          DocShortDesc: "ADDRESS_PROOF",
          DocDesc: cData.doctypePOA.DocDesc,
          DocumentNo: cData.docNoPOA,
          documentExtension: this.fileExtionPOA,
          FileBase64: "",
          prefix: this.sessionPostData.Salutation,
          firstName: this.sessionPostData.VechileOwnerName,
          middleName: "",
          lastName: this.sessionPostData.VehicleOwnerLastName,
          gender: this.sessionPostData.GenderCodeDesc[0],
          relatedPersonPrefix: "",
          relatedPersonFirstName: this.sessionPostData.NomineeName.split(" ")[0],
          relatedPersonMiddleName: this.sessionPostData.NomineeName.split(" ").length > 2 ? this.sessionPostData.NomineeName.split(" ")[1] : "",
          relatedPersonLastName: this.sessionPostData.NomineeName.split(" ")[this.sessionPostData.NomineeName.split(" ").length - 1],
          relationshipType: this.sessionPostData.RelationshipDesc,
          MobileNo: this.sessionPostData.MobileNo,

          email: this.sessionPostData.EmailID,
          address: this.sessionPostData.PostalAdd + this.sessionPostData.Area,
          city: this.sessionPostData.CityDesc,
          district: this.sessionPostData.CityDesc,
          state: this.sessionPostData.StateDesc,
          country: "India",
          pinCode: this.sessionPostData.PINCode,
          correspondenceAddress: this.sessionPostData.PostalAdd + this.sessionPostData.Area,
          correspondenceCity: this.sessionPostData.CityDesc,
          correspondenceDistrict: this.sessionPostData.CityDesc,
          correspondenceState: this.sessionPostData.StateDesc,
          correspondenceCountry: "India",
          correspondencePinCode: this.sessionPostData.PINCode,
        }

        const ckycDataPhoto: any = {
          ApplicationNo: this.sessionPostData.ApplicationNo,
          RegistrationNo: this.sessionPostData.Data.RegistrationNo,
          Quotationno: this.PlanData.Quotationno,
          CompanyCode: this.PlanData.CompanyCode,
          CompanyName: this.PlanData.ProductName,
          CKYCStepInd: 2,
          CKYCStepDesc: "POI",
          DOB: formatDate(dob, 'dd-MMM-yyyy', 'en-US'),
          DocShortDesc: "OTHERS",
          DocDesc: "PHOTOGRAPH",
          DocumentNo: '',//cData.docPhotograph,
          documentExtension: this.fileExtionPOI,
          FileBase64: "",
          prefix: this.sessionPostData.Salutation,
          firstName: this.sessionPostData.VechileOwnerName,
          middleName: "",
          lastName: this.sessionPostData.VehicleOwnerLastName,
          gender: this.sessionPostData.GenderCodeDesc[0],
          relatedPersonPrefix: "Mr",
          relatedPersonFirstName: this.sessionPostData.NomineeName.split(" ")[0],
          relatedPersonMiddleName: this.sessionPostData.NomineeName.split(" ").length > 2 ? this.sessionPostData.NomineeName.split(" ")[1] : "",
          relatedPersonLastName: this.sessionPostData.NomineeName.split(" ")[this.sessionPostData.NomineeName.split(" ").length - 1],
          relationshipType: this.sessionPostData.RelationshipDesc,
          MobileNo: this.sessionPostData.MobileNo,

          email: this.sessionPostData.EmailID,
          address: this.sessionPostData.PostalAdd + this.sessionPostData.Area,
          city: this.sessionPostData.CityDesc,
          district: this.sessionPostData.CityDesc,
          state: this.sessionPostData.StateDesc,
          country: "India",
          pinCode: this.sessionPostData.PINCode,
          correspondenceAddress: this.sessionPostData.PostalAdd + this.sessionPostData.Area,
          correspondenceCity: this.sessionPostData.CityDesc,
          correspondenceDistrict: this.sessionPostData.CityDesc,
          correspondenceState: this.sessionPostData.StateDesc,
          correspondenceCountry: "India",
          correspondencePinCode: this.sessionPostData.PINCode,
        }
        console.log(this.fileUploadList);
        this.formDataForIffcoTokio = new FormData();
        this.formDataForIffcoTokio.append("Document", this.fileUploadList[0]);
        this.formDataForIffcoTokio.append("Document", this.fileUploadList[1]);
        this.formDataForIffcoTokio.append("Document", this.fileUploadList[0]);

        // this.formDataForIffcoTokio.append("Document",JSON.stringify([this.fileUploadList[0],this.fileUploadList[1]]))
        this.formDataForIffcoTokio.append("JsonData", JSON.stringify([ckycDataPOI, ckycDataPOA, ckycDataPhoto]))
        console.log(this.formDataForIffcoTokio);

        this._subscriptions.push(
          this.posHomeService.IffcoTokioCKYCDetails(this.formDataForIffcoTokio, apiType)!.subscribe((result: ApiResponse) => {
            console.log(result);
            debugger
            if (result.successcode === "0") {
              if (result.data) {
                if (result.data!.recordCreated == 'N' && result.data!.documentStored == 'N' && result.data!.ckycStatus !== "EXISTING RECORD" && result.data.ckycStatus !== "SUCCESS") {
                  this._toastService.error(result.msg, "CKYC Failed!")
                } else if (result.data!.recordCreated == 'Y' && result.data!.documentStored == 'N') {
                  this._toastService.error(result.msg, "CKYC Failed!")
                } else {
                  this._toastService.error(result.msg, "CKYC Failed!")
                }
              } else {
                this._toastService.error(result.msg, "CKYC Failed!")

              }

              this.isCkycValidate.emit(false)
            } else if (result.successcode === "1") {

              if (result.data.recordCreated == 'Y' && result.data.documentStored == 'Y' && result.data.ckycStatus === "SUCCESS") {
                sessionStorage.setItem("CKYCData", JSON.stringify(result.data));
                this.isCkycValidate.emit(true)
                this.showModal = !this.showModal;
              } else if (result.data.recordCreated == 'N' && result.data.documentStored == 'N' && (result.data.ckycStatus === "EXISTING RECORD" || result.data.ckycStatus === "SUCCESS")) {
                sessionStorage.setItem("CKYCData", JSON.stringify(result.data));
                this.isCkycValidate.emit(true)
                this.showModal = !this.showModal;
              } else if (result.data.recordCreated == 'Y' && result.data.documentStored == 'N' && result.data.ckycStatus !== "EXISTING RECORD" && result.data.ckycStatus !== "SUCCESS") {
                this._toastService.error(result.msg + " Please Upload CKYC Document.", "CKYC Exeception!")
                // this.isCkycUploadDocTrue = false;
                this.iffcoTokioReferenceNo = result.data.transactionId
              } else {
                this._toastService.error(result.msg, "CKYC Exeception!")
              }
            } else {
              this._toastService.error(result.msg ? result.msg : "Something went wrong .Please try again later.", "Not Responding")
              this.isCkycValidate.emit(false)
            }
          }))
      } else {
        apiType = "upload";
        console.log(this.sessionPostData, cData);
        let dob = moment(this.sessionPostData.DOB, "DD-MM-YYYY").toDate()
        const ckycDataPOI: any = {
          ApplicationNo: this.sessionPostData.ApplicationNo,
          RegistrationNo: "0",
          Quotationno: this.PlanData.Quotationno,
          CompanyCode: this.PlanData.CompanyCode,
          CompanyName: this.PlanData.ProductName,
          CKYCStepInd: 3,
          CKYCStepDesc: "POI",
          DOB: formatDate(dob, 'dd-MMM-yyyy', 'en-US'),
          DocShortDesc: "IDENTITY_PROOF",
          DocDesc: "PAN",
          DocumentNo: cData.docNoPOI,
          firstName: this.sessionPostData.VechileOwnerName,
          middleName: "",
          lastName: this.sessionPostData.VehicleOwnerLastName,
          TGICKYCRefrenceNo: this.iffcoTokioReferenceNo
        }
        const ckycDataPOA: any = {
          ApplicationNo: this.sessionPostData.ApplicationNo,
          RegistrationNo: "0",
          Quotationno: this.PlanData.Quotationno,
          CompanyCode: this.PlanData.CompanyCode,
          CompanyName: this.PlanData.ProductName,
          CKYCStepInd: 3,
          CKYCStepDesc: "POA",
          DOB: formatDate(dob, 'dd-MMM-yyyy', 'en-US'),
          DocShortDesc: "ADDRESS_PROOF",
          DocDesc: cData.doctypePOA.DocDesc,
          DocumentNo: cData.docNoPOA,
          firstName: this.sessionPostData.VechileOwnerName,
          middleName: "",
          lastName: this.sessionPostData.VehicleOwnerLastName,
          TGICKYCRefrenceNo: this.iffcoTokioReferenceNo
        }
        console.log(this.fileUploadList);
        this.formDataForIffcoTokio = new FormData();
        this.formDataForIffcoTokio.append("Document", this.fileUploadList[0]);
        this.formDataForIffcoTokio.append("Document", this.fileUploadList[1]);
        // this.formDataForIffcoTokio.append("Document",JSON.stringify([this.fileUploadList[0],this.fileUploadList[1]]))
        this.formDataForIffcoTokio.append("JsonData", JSON.stringify([ckycDataPOI, ckycDataPOA]))
        console.log(this.formDataForIffcoTokio);

        this._subscriptions.push(
          this.posHomeService.IffcoTokioCKYCDetails(this.formDataForIffcoTokio, apiType)!.subscribe((result: ApiResponse) => {
            console.log(result);
            if (result.successcode === "0") {

              this._toastService.error(result.msg, "CKYC Failed!")
              this.isCkycValidate.emit(false)
            } else if (result.successcode === "1") {

              if (result.data.ckycStatus === "200") {
                this.isCkycValidate.emit(true)
                this.showModal = !this.showModal;

              } else {
                this._toastService.error(result.msg, "CKYC Exeception!")
              }
            } else {
              this._toastService.error(result.msg ? result.msg : "Something went wrong .Please try again later.", "Not Responding")
              this.isCkycValidate.emit(false)
            }
          }))
      }

    }




  }
  public onChangeCkycFormFieldTataAig() {
    this.validationObj = []
    if (this.successcode == '0' && this.ckycDetails.req_id !== null) {
      this.step.stepInd = 2
      // this.step.stepDesc="AADHAR"
      //  {key:"panNo",validation:[]}
      //  this.identityMask=MASKS.PAN
      this.onRemoveValidation([{ key: "panNo", validation: [] }])
      this.validationObj.push({ key: "uidNo", validation: [Validators.required, Validators.pattern(PATTERN.AADHAAR)] })
      this.validationObj.push({ key: "FullName", validation: [Validators.required] });
      this.identityMask = MASKS.AADHAAR
      this.onAddValidation(this.validationObj)
      // this.onSelectStep(this.step)
      this.ckycDetailForm.enable()
    }


  }

  checkCKYCStatusForHDFC() {

    let ApplicationNo: any
    this._route.paramMap.subscribe((p) => {
      ApplicationNo = p.get("a_id");
    })
    let cData = this.ckycDetailForm.value;
    let formatDOB = formatDate(cData.DOB, 'dd-MMM-yyyy', 'en-US');
    const ckycData = {
      ApplicationNo: ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      DocumentNo: cData.docNo,
      CompanyName: "HDFCERGO",
      DOB: formatDOB,
      DocShortDesc: cData.doctype.DocShortDesc,
      DocDesc: cData.doctype.DocDesc,
      Name: cData.FullName,
      Gender: cData.gender,
      CKYCStepDesc: 1
    }
    this._subscriptions.push(
      this._vehicleBuyPlanService.getHdfcValidateCkyc(ckycData).subscribe((result: any) => {
        debugger
        if (result.successcode === "1") {
          if (result.data.CKYCStatus === "false") {
            this.successcode = '2'
            this._toastService.warning(result.msg, 'Validation Failed!');
          }
          if (result.data.CKYCStatus === "true") {
            this._toastService.success(result.msg, 'Validation Success!');
            this.successcode = '1'
            console.log(this.successcode);
          }
        } else {
          this.successcode = '3'
          this._toastService.warning(result.msg, 'Validation Failed!');
        }
      })
    )

  }



  onsubmitCKYCInfoHDFC(): any {
    debugger
    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    let ApplicationNo: any
    this._route.paramMap.subscribe((p) => {
      ApplicationNo = p.get("a_id");
    })
    let cData = this.ckycDetailForm.value;
    console.log(cData);

    console.log(this.ckycDetailForm.value);

    let formatDOB = formatDate(cData.DOB, 'dd-MMM-yyyy', 'en-US');
    console.log(formatDOB);
    const ckycData = {
      ApplicationNo: ApplicationNo,
      CompanyCode: this.PlanData.CompanyCode,
      DocumentNo: cData.docNo,
      CompanyName: "HDFCERGO",
      DOB: formatDOB,
      DocShortDesc: cData.doctype.DocShortDesc,
      DocDesc: cData.doctype.DocDesc,
      Name: cData.FullName,
      Gender: cData.gender,
      CKYCStepDesc: 1
    }
    this._subscriptions.push(
      this._vehicleBuyPlanService.getHdfcValidateCkyc(ckycData).subscribe((result: any) => {
        debugger
        this.UniqueId = result.data
        if (result.successcode === "1") {
          if (result.data.CKYCStatus === "false") {

            this.UniqueId = result.data
            this.successcode = '2'
            this.ckycDetailForm.disable()
            this._toastService.warning(result.msg, 'Validation Failed!');
            // window.open(result.data.ManualCkycUrl);
            setTimeout(() => {
              window.open(result.data.ManualCkycUrl);
            }, 4000)
          }
          if (result.data.CKYCStatus === "true") {
            this.successcode = '1';
            this._toastService.success(result.msg, 'CKYC Validation Success!');
            sessionStorage.setItem("ckycdata", JSON.stringify(this.UniqueId))
          }
          // this.isCkycValidForNivabupa = false
        } else {
          this.successcode = '3'
          this._toastService.warning(result.msg, 'Validation Failed!');
        }
      })
    )
  }

  onChangeCKYCYesNO(type: number, step?: any) {
    debugger;
    console.log(this)
    this.base64url = ""
    this.docExtension = ''
    this.fileName = "";

    this.ckycDetailForm.controls["DOB"].markAsPristine();
    this.ckycDetailForm.controls["DOB"].markAsUntouched();
    if (type === 1) {
      this.ckycYesNoDesc = "Yes";
      this.ckycYesNoCode = 1;
      this.ckycDetailForm.controls["ckycNo"].enable();
      this.ckycDetailForm.controls["ckycNo"].markAsPristine();
      this.ckycDetailForm.controls["ckycNo"].markAsUntouched();
      this.ckycDetailForm.controls["panNo"].disable();
      this.ckycDetailForm.controls["doctype"].disable();
      this.ckycDetailForm.controls["docData"].disable();
      this.ckycDetailForm.controls["docNo"].disable();
      this.ckycDetailForm.updateValueAndValidity();
    } else if (type === 0) {

      if (step) {
        if (step.stepInd === 1) {
          this.ckycDetailForm.controls["panNo"].enable();
          this.ckycDetailForm.controls["panNo"].markAsPristine();
          this.ckycDetailForm.controls["panNo"].markAsUntouched();
          this.ckycDetailForm.controls["ckycNo"].disable();
          this.ckycDetailForm.controls["doctype"].disable();
          this.ckycDetailForm.controls["docData"].disable();
          this.ckycDetailForm.controls["docNo"].disable();
          this.ckycDetailForm.updateValueAndValidity();
          this.ckycYesNoDesc = "No";
          this.ckycYesNoCode = 0
          this.successPanNo = true;
          this.successDocNo = false;
          this.step.stepInd = 1;
          this.step.stepDesc = 'POI';
        } else if (step.stepInd === 2) {
          this.ckycDetailForm.controls["panNo"].disable();

          this.ckycDetailForm.controls["ckycNo"].disable();
          this.ckycDetailForm.controls["docData"].disable();
          this.ckycDetailForm.controls["doctype"].enable();
          this.ckycDetailForm.controls["docNo"].enable();
          this.ckycDetailForm.controls["doctype"].markAsPristine();
          this.ckycDetailForm.controls["doctype"].markAsUntouched();
          this.ckycDetailForm.controls["docNo"].markAsPristine();
          this.ckycDetailForm.controls["docNo"].markAsUntouched();
          // this.ckycDetailForm.controls["doctype"].setErrors(null);
          // this.ckycDetailForm.controls["docNo"].setErrors(null);
          this.ckycDetailForm.updateValueAndValidity();
          this.ckycYesNoDesc = "No";
          this.ckycYesNoCode = 0
          // this.successPanNo = true;
          // this.successDocNo = true;
          this.successPanNo = false;
          this.successDocNo = false;
          this.successFileUpload = false;
        } else
          if (step.stepInd === 3) {
            this.ckycDetailForm.controls["panNo"].disable();

            this.ckycDetailForm.controls["ckycNo"].disable();
            this.ckycDetailForm.controls["doctype"].enable();
            this.ckycDetailForm.controls["docData"].enable();
            this.ckycDetailForm.controls["docNo"].enable();
            this.ckycDetailForm.controls["doctype"].markAsPristine();
            this.ckycDetailForm.controls["doctype"].markAsUntouched();
            this.ckycDetailForm.controls["docData"].markAsPristine();
            this.ckycDetailForm.controls["docData"].markAsUntouched();
            this.ckycDetailForm.controls["docNo"].markAsPristine();
            this.ckycDetailForm.controls["docNo"].markAsUntouched();
            // this.ckycDetailForm.controls["docData"].setErrors(null);
            // this.ckycDetailForm.controls["doctype"].setErrors(null);
            // this.ckycDetailForm.controls["docNo"].setErrors(null);
            this.ckycDetailForm.updateValueAndValidity();
            this.ckycYesNoDesc = "No";
            this.ckycYesNoCode = 0
            this.successPanNo = false;
            this.successDocNo = false;
            this.successFileUpload = true;
          }
      } else {
        this.ckycDetailForm.controls["panNo"].enable();
        this.ckycDetailForm.controls["panNo"].markAsPristine();
        this.ckycDetailForm.controls["panNo"].markAsUntouched();
        this.ckycDetailForm.controls["ckycNo"].disable();
        this.ckycDetailForm.controls["doctype"].disable();
        this.ckycDetailForm.controls["docData"].disable();
        this.ckycDetailForm.controls["docNo"].disable();
        this.ckycDetailForm.updateValueAndValidity();
        this.ckycYesNoDesc = "No";
        this.ckycYesNoCode = 0
        this.successPanNo = true;
        this.successDocNo = false;
        this.step.stepInd = 1;
        this.step.stepDesc = 'POI';
      }

    }
  }

  BacktoBuyPlan() {
    // let ApplicationNo: any
    // let ApplicationNoOdp: any
    // this._route.paramMap.subscribe((p) => {
    //   ApplicationNo = p.get("a_id");
    //   ApplicationNoOdp = p.get("odp")
    // })
    // console.log(encrypt(`${ApplicationNo}`),
    //   encrypt(`${ApplicationNoOdp}`));
    // if (this.insuranceType.InsuranceCateCode === 1) {

    // }
    // if (this.insuranceType.InsuranceCateCode === 2) {

    // }
    // if (this.insuranceType.InsuranceCateCode === 3) {
    //   if (this.PlanData.CompanyCode === "14") {
    //     this._router.navigate([
    //       `/health-insurance/best-plans/`,
    //       encrypt(ApplicationNo),
    //       encrypt(ApplicationNoOdp),
    //     ]);
    //   }
    // }

    this._location.back();
  }

  onSelectDocument(event: MatSelectChange) {
    if (event.value) {
      this.step.stepInd = 2;
      this.step.stepDesc = "POA"
      this.onChangeCKYCYesNO(0, this.step);
    }
  }



  onSelectStep(event: any): any {
    // this.ckycDetailForm.reset()

    if (this.PlanData.CompanyCode === "9") {
      this.editDetailsTataAig();
      if (event == "pan") {
        this.step.stepInd = 1; this.step.stepDesc = "PAN";
        // DocNO = cData.panNo;
        // docT.DocShortDesc = "";
        // docT.DocDesc = "PAN"
        this.ckycDetailForm.controls["uidNo"].disable();

        this.ckycDetailForm.controls["panNo"].enable();
        this.ckycDetailForm.controls["doctype"].enable();
        this.ckycDetailForm.controls["docData"].enable();
        this.ckycDetailForm.controls["docNo"].enable();
        this.ckycDetailForm.controls["FullName"].enable()
        this.ckycDetailForm.controls["DOB"].enable()
        this.ckycDetailForm.controls["gender"].enable()
        this.identityMask = MASKS.PAN;

      } else if (event == "form60") {
        this.step.stepInd = 2; this.step.stepDesc = "FORM60";
        // DocNO = cData.uidNo;
        // docT.DocShortDesc = "";
        // docT.DocDesc = "AADHAR"
        this.ckycDetailForm.controls["uidNo"].disable();
        this.ckycDetailForm.controls["panNo"].disable();
        this.ckycDetailForm.controls["doctype"].enable();
        this.ckycDetailForm.controls["docData"].enable();
        this.ckycDetailForm.controls["docNo"].enable();
        this.ckycDetailForm.controls["FullName"].enable()
        this.ckycDetailForm.controls["DOB"].enable()
        this.ckycDetailForm.controls["gender"].enable()

        // this.identityMask=PATTERN.
      } else if (event === "otherDoc") {
        this.step.stepInd = 3; this.step.stepDesc = "ANOTHERID";
        // DocNO = cData.uidNo;
        // docT.DocShortDesc = "";
        // docT.DocDesc = "AADHAR"
        this.ckycDetailForm.controls["uidNo"].enable();

        this.ckycDetailForm.controls["panNo"].disable();
        this.ckycDetailForm.controls["doctype"].disable();
        this.ckycDetailForm.controls["docData"].enable();
        this.ckycDetailForm.controls["docNo"].disable();
        this.ckycDetailForm.controls["FullName"].enable();
        this.ckycDetailForm.controls["DOB"].enable();
        this.ckycDetailForm.controls["gender"].enable();
        this.identityMask = MASKS.AADHAAR;
      } else {
        // step1.stepInd = 3; step1.stepDesc = "POA";
        // DocNO = cData.docNo;
        // docT = cData.doctype
      }
    } else if (this.PlanData.CompanyCode === "4") {

      console.log(event);
      const formControl = ["doctypePOI", "docNoPOI", "doctypePOA", "docNoPOA", "docDataPOA", "docDataPOI", "docPhotograph"];
      this.ckycDetailForm.markAsUntouched()
      if (event === "fetch") {
        this.isckycFailedForIffcoTokio = false;
        this.isIffcoDefaultRadioButton = true
        this.ckycDetailForm.addControl("doctype", new FormControl('', Validators.required));
        this.ckycDetailForm.addControl("docNo", new FormControl('', Validators.required));
        formControl.forEach((c: string) => {
          this.ckycDetailForm.removeControl(c)
        })

        this.updateIdentityValidity();

        // this.updateIdentityValidity()
        // this.ckycDetailForm.patchValue({
        //   doctype: "",
        //   docNo: ""
        // })
        // this.ckycDetailForm.controls["doctype"].enable();
        // this.ckycDetailForm.controls["docNo"].enable();
        // this.ckycDetailForm.controls["doctypePOI"].disable();
        // this.ckycDetailForm.controls["docNoPOI"].disable();
        // this.ckycDetailForm.controls["doctypePOA"].disable();
        // this.ckycDetailForm.controls["docNoPOA"].disable();
        // this.ckycDetailForm.controls["docDataPOA"].disable();

      } else if (event === "create") {
        this.isIffcoDefaultRadioButton = false
        this.isckycFailedForIffcoTokio = true;
        this.isCreateFormIffcoTokio = true;
        formControl.forEach((c: string) => {
          this.ckycDetailForm.addControl(c, new FormControl('', Validators.required))
        })
        this.ckycDetailForm.removeControl("doctype");
        this.ckycDetailForm.removeControl("docNo");
        // this.ckycDetailForm.controls["doctype"].disable();
        // this.ckycDetailForm.controls["docNo"].disable();
        // this.ckycDetailForm.controls["doctypePOI"].enable();
        // this.ckycDetailForm.controls["docNoPOI"].enable();
        // this.ckycDetailForm.controls["doctypePOA"].enable();
        // this.ckycDetailForm.controls["docNoPOA"].enable();
        // this.ckycDetailForm.controls["docDataPOA"].enable();

        this.updateIdentityValidityPOI()
        this.updateIdentityValidityPOA()



        // this.ckycDetailForm.patchValue({
        //   doctypePOI: "",
        //   docNoPOI: "",
        //   doctypePOA: "",
        //   docNoPOA: "",
        //   docDataPOI: "",
        //   docDataPOA: "",
        // })
        this.fileNamePOI = '';
        this.fileNamePOA = '';
        this.fileExtionPhotograph = '';

      } else {
        this.isckycFailedForIffcoTokio = true;
        this.isCreateFormIffcoTokio = false;
        // this.ckycDetailForm.controls["doctype"].disable();
        // this.ckycDetailForm.controls["docNo"].disable();
        // this.ckycDetailForm.controls["doctypePOI"].enable();
        // this.ckycDetailForm.controls["docNoPOI"].enable();
        // this.ckycDetailForm.controls["doctypePOA"].enable();
        // this.ckycDetailForm.controls["docNoPOA"].enable();
        // this.ckycDetailForm.controls["docDataPOA"].enable();
        this.ckycDetailForm.patchValue({
          doctypePOI: "",
          docNoPOI: "",
          doctypePOA: "",
          docNoPOA: "",
          docDataPOI: "",
          docDataPOA: "",
          docPhotograph: ""
        })
        this.fileNamePOI = '';
        this.fileNamePOA = '';
        this.fileExtionPhotograph = '';
      }

      Object.keys(this.ckycDetailForm.controls).forEach((c: any) => {
        this.ckycDetailForm.controls[`${c}`].setErrors(null)
      })
    } else if (this.PlanData.CompanyCode === "13") {
      let value = event
      this.radioBtnValueBajaj = value
      console.log(this.radioBtnValueBajaj);
      this.bajajTemplateForm.resetForm()
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
      } else {
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

  }



  onSubmitCKYCInfoTataAig(): any {
    console.log(this.postData.ApplicationNo);

    console.log(this.ckycDetailForm)
    if (this.ckycDetailForm.invalid) {
      this.errMsg_oi = "Please fill all details correctly.";
      return false;
    }
    this.errMsg_oi = "";
    // let step: any = { stepInd: 0, stepDesc: '' };
    let cData = this.ckycDetailForm.value;
    let dob = moment(this.sessionPostData.DOB, "DD-MM-YYYY")//new Date(this.sessionPostData.DOB)
    let formatDOB: string = formatDate(dob.toDate(), 'dd-MMM-yyyy', 'en-US');

    let l = JSON.parse(sessionStorage.getItem("tataAigPropsal")!)
    this.proposalNoTataAig = l.ProposalOrderNo;
    // this.proposalNoTataAig= decrypt(sessionStorage.getItem("proposalNo"));
    // if (cData.DOB === null ? false : cData.DOB === undefined ? false : cData.DOB === "" ? false : true) {
    //   formatDOB = formatDate(dob, 'dd-MMM-yyyy', 'en-US');
    // }
    // let docT = { DocShortDesc: "", DocDesc: '' };
    let DocNO: any;

    // if (cData.panNo) {
    //   step.stepInd = 1; step.stepDesc = "pan";
    //   DocNO = cData.panNo;
    //   docT.DocShortDesc = "";
    //   docT.DocDesc = "pan";
    // } else if (this.base64url !== null && this.base64url !== undefined && this.base64url !== '') {
    //   step.stepInd = 2; step.stepDesc = "form60";
    //   DocNO = cData.uidNo;
    //   docT.DocShortDesc = "";
    //   docT.DocDesc = "form60";
    // } else {
    //   step.stepInd = 3; step.stepDesc = "POA";
    //   DocNO = cData.docNo;
    //   docT = cData.doctype
    // }
    let apiType: string;
    if (this.step.stepInd === 1) {
      apiType = "fetch"
      const ckycData: ICKYCTataAig = {
        ApplicationNo: this.postData.ApplicationNo,
        CompanyCode: this.PlanData.CompanyCode,
        CompanyName: this.PlanData.ProductName,
        DOB: formatDOB,
        DocumentNo: cData.panNo,
        DocShortDesc: "",
        DocDesc: "PAN",
        Name: "",
        Gender: "",
        RegistrationNo: this.sessionPostData.Data.RegistrationNo,
        Quotationno: this.proposalNoTataAig,
        CKYCStepInd: 1,
        CKYCStepDesc: "PAN",
        CKYCNO: '0',
        FileBase64: this.base64url ? this.base64url : "",
        documentExtension: '',
      }

      console.log(this.postData.ApplicationNo);

      this._subscriptions.push(
        this.posHomeService.TataAigGenCKYCDetails(ckycData, apiType)!.subscribe((result: ApiResponse) => {
          // console.log(result);
          if (result.successcode == "0" || result.successcode == null) {

            if (result.data) {
              this.ckycDetails = result.data;
              if (this.ckycDetails!.ReferenceId) {
                apiType = "anotherId"

                ckycData.req_id = this.ckycDetails.ReferenceId;
                ckycData.DocDesc = "anotherId";
                ckycData.DocShortDesc = "";
                ckycData.CKYCStepDesc = "anotherId";
                ckycData.CKYCStepInd = 3;
                ckycData.DocType = cData.doctype.DocShortDesc
                ckycData.DocumentNo = cData.docNo
                // this._toastService.error(result.msg, 'Validation Failed!.');
                this.tataAigCkycUsingAnotherId(ckycData, apiType)
              }
            } else {
              this._toastService.error(result.msg, 'Validation Failed!.');
            }
          } else if (result.successcode == '1') {

            this.ckycDetails = result.data;
            if (this.ckycDetails.CKYCStatus == "True") {
              sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
              // this._toastService.success(result.msg, 'Validation Success.');
              // this.successcode = "1";
              // this.ckycDetailForm.disable()
              this.tataAigCkycStatusCheck(ckycData);
            } else {
              sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
              this._toastService.warning(result.msg, 'Validation Warning.');
              this.successcode = "2";
            }
            // this.ckycDetailForm.disable()
          } else {
            this._toastService.error(result.msg, 'Validation Failed!.');
          }
        }
        ))
    } else if (this.step.stepInd === 2) {
      apiType = "form60"
      const ckycData: ICKYCTataAig = {
        ApplicationNo: this.postData.ApplicationNo,
        CompanyCode: this.PlanData.CompanyCode,
        CompanyName: this.PlanData.ProductName,
        DOB: formatDOB,
        DocumentNo: DocNO,
        DocShortDesc: "",
        DocDesc: "form60",
        Name: "",
        Gender: "",
        RegistrationNo: this.sessionPostData.Data.RegistrationNo,
        Quotationno: this.proposalNoTataAig,
        CKYCStepInd: 2,
        CKYCStepDesc: "form60",
        FileBase64: "",
        documentExtension: ''
      }
      this.formDataForIffcoTokio = new FormData();
      this.formDataForIffcoTokio.append("Document", this.fileUploadList[0]);
      // this.formDataForIffcoTokio.append("Document",JSON.stringify([this.fileUploadList[0],this.fileUploadList[1]]))
      this.formDataForIffcoTokio.append("JsonData", JSON.stringify(ckycData))
      this._subscriptions.push(
        this.posHomeService.TataAigGenCKYCDetails(this.formDataForIffcoTokio, apiType)!.subscribe((result: ApiResponse) => {
          // console.log(result);
          if (result.successcode == "0" || result.successcode == null) {
            this._toastService.error(result.msg, 'Validation Failed!.');

          } else if (result.successcode == '1') {
            this.ckycDetails = result.data;
            apiType = "anotherId"

            ckycData.req_id = this.ckycDetails.ReferenceId;
            ckycData.DocDesc = "anotherId";
            ckycData.DocShortDesc = "";
            ckycData.CKYCStepDesc = "anotherId";
            ckycData.CKYCStepInd = 3;
            ckycData.DocType = cData.doctype.DocShortDesc
            ckycData.DocumentNo = cData.docNo
            this.ckycTataAigPayLoad = ckycData
            this.tataAigCkycUsingAnotherId(ckycData, apiType)
          }
        }
        ))
    } else {
      this._toastService.error("Please select option to continue ckyc process.", 'Validation Failed!.');
    }



  }

  tataAigCkycUsingAnotherId(ckycData: ICKYCTataAig, apiType: string) {
    this._subscriptions.push(
      this.posHomeService.TataAigGenCKYCDetails(ckycData, apiType)!.subscribe((result: ApiResponse) => {

        if (result.successcode == "0" || result.successcode == null) {
          if (result.data) {
            this.ckycDetails = result.data;
            if (this.ckycDetails.CKYCStatus === 'generate_otp_success') {
              sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
              this.ckycTataAigPayLoad = ckycData
              this.step.stepInd = 4; this.step.stepDesc = 'otp'
            } else {
              this._toastService.error(result.msg, 'Validation Failed!.');

            }
          } else {
            this._toastService.error(result.msg, 'Validation Failed!.');
          }
        } else if (result.successcode == '1') {
          this.ckycDetails = result.data;
          sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));

          if (this.ckycDetails.CKYCStatus == "True") {
            sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
            this.tataAigCkycStatusCheck(ckycData);
          } else {
            sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
            this._toastService.warning(result.msg, 'Validation Warning.');
            this.successcode = "2";
          }
          // this.ckycDetailForm.disable()
        } else {
          this._toastService.error(result.msg, 'Validation Failed!.');
        }
      }
      ))
  }

  tataAigCallOtpApi(form: NgForm) {
    debugger;
    const ckycSessionData = JSON.parse(sessionStorage.getItem("CKYCData")!);
    console.log(this.ckycTataAigPayLoad);

    let ckycData: any = this.ckycTataAigPayLoad

    ckycData.DocDesc = "SubmitOTP";
    ckycData.CKYCStepInd = 4;
    ckycData.CKYCStepDesc = "SubmitOTP";
    ckycData.client_id = ckycSessionData.ReferenceId; //Unique client_id which was generated in Verify API during successful response for id_type = AADHAAR
    ckycData.OTP = form.value.otp;  //OTP entered by user



    this._subscriptions.push(
      this.posHomeService.TataAigGenCKYCDetails(ckycData, "otp")!.subscribe((result: ApiResponse) => {

        if (result.successcode == "0" || result.successcode == null) {
          if (result.data) {

            this._toastService.error(result.msg, 'Validation Failed!.');

          } else {
            this._toastService.error(result.msg, 'Validation Failed!.');
          }
        } else if (result.successcode == '1') {
          // this.ckycDetails = result.data;
          // sessionStorage.setItem("CKYCData", JSON.stringify(this.ckycDetails));
          this.tataAigCkycStatusCheck(ckycData);
        } else {
          this._toastService.error(result.msg, 'Validation Failed!.');
        }
      }
      ))
  }

  tataAigCkycStatusCheck(ckycData: ICKYCTataAig) {

    const ckycSessionData = JSON.parse(sessionStorage.getItem("CKYCData")!);
    // const ckycData: ICKYCTataAig = this.ckycTataAigPayLoad;

    ckycData.DocDesc = "Fetch";
    ckycData.CKYCStepInd = 5;
    ckycData.CKYCStepDesc = "Fetch";

    this._subscriptions.push(
      this.posHomeService.TataAigGenCKYCDetails(ckycData, "status")!.subscribe((result: ApiResponse) => {

        if (result.successcode == "0" || result.successcode == null) {
          if (result.data) {

            this._toastService.error(result.msg, 'Validation Failed!.');
            // this._toastService.success(result.msg, 'Validation Success.');
            this.successcode = "2";
            this.ckycDetailForm.disable()
          } else {
            this._toastService.error(result.msg, 'Validation Failed!.');
            this._toastService.success(result.msg, 'Validation Success.');
            this.successcode = "2";
            this.ckycDetailForm.disable()
          }
        } else if (result.successcode == '1') {
          if (result.data.CKYCRemark == "1") {
            this._toastService.success(result.msg, 'Validation Success.');
            this.successcode = "1";
            this.ckycResponseData = result.data
            this.ckycDetailForm.disable()
          } else {
            this._toastService.error(result.msg, 'Validation Failed!.');
            this.successcode = "2";
            this.ckycResponseData = result.data
            this.ckycDetailForm.disable()
          }

        } else {
          this._toastService.error(result.msg, 'Validation Failed!.');
          // this._toastService.success(result.msg, 'Validation Success.');
          this.successcode = "2";
          this.ckycDetailForm.disable()
        }
      }
      ))
  }
  private updateIdentityValidity() {
    const control: any = this.ckycDetailForm.get("docNo");
    this._subscriptions.push(
      this.ckycDetailForm.get("doctype") && this.ckycDetailForm.get("doctype")!.valueChanges.subscribe((identity: ICKYCDocList | any) => {
        control.reset();

        if (identity!.DocTypeCodeOdp == EDocListEnum.PAN) {
          this.identityMask = MASKS.PAN;
          control.setValidators([
            Validators.pattern(PATTERN.PAN),
            Validators.required,
          ]);
        } else if (identity!.DocTypeCodeOdp == EDocListEnum.UID) {
          this.identityMask = MASKS.AADHAAR;
          control.setValidators([
            Validators.pattern(PATTERN.AADHAAR),
            Validators.required,
          ]);
        } else if (identity!.DocTypeCodeOdp == EDocListEnum.DrivingLicense) {
          this.identityMask = MASKS.DRIVINGLICENSE;
          control.setValidators([
            Validators.required,
            // Validators.pattern(PATTERN.DRIVINGLICENCE)

          ]);
        }
        else if (identity!.DocTypeCodeOdp == EDocListEnum.Passport) {
          this.identityMask = MASKS.PASSPORT;
          control.setValidators([
            Validators.required
          ]);
        }
        else if (identity!.DocTypeCodeOdp == EDocListEnum.VoterID) {
          this.identityMask = MASKS.VOTERID
          control.setValidators([
            Validators.pattern(PATTERN.VOTERID),
            Validators.required
          ]);
        }
        else if (identity!.DocTypeCodeOdp == EDocListEnum.CKYC) {
          this.identityMask = MASKS.CKYC
          control.setValidators([
            Validators.required,
            Validators.minLength(14)
          ]);
        }
        else if (identity!.DocTypeCodeOdp == EDocListEnum.NREGA) {
          this.identityMask = MASKS.NAREGACARD
          control.setValidators([
            Validators.required,
            Validators.pattern(PATTERN.NAREGA)
          ]);
        }
        else if (identity!.DocTypeCodeOdp == EDocListEnum.NPRL) {
          this.identityMask = MASKS.NPR
          control.setValidators([
            Validators.required,
            Validators.minLength(5)
          ]);
        }
        else if (identity!.DocTypeCodeOdp == EDocListEnum.ITGI) {
          this.identityMask = MASKS.ITGI
          control.setValidators([
            Validators.required
          ]);
        } else if (identity!.DocTypeCodeOdp == EDocListEnum.KYCId) {
          this.identityMask = MASKS.KYCID;
          control.setValidators([
            Validators.required
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

  private updateIdentityValidityPOI() {
    const control: any = this.ckycDetailForm.get("docNoPOI");
    this._subscriptions.push(
      this.ckycDetailForm
        .get("doctypePOI") && this.ckycDetailForm
          .get("doctypePOI")!
          .valueChanges.subscribe((identity: ICKYCDocList | any) => {
            control.reset();
            console.log(identity);

            if (identity!.DocTypeCodeOdp == EDocListEnum.PAN) {
              this.identityMaskForPOI = MASKS.PAN;
              control.setValidators([
                Validators.pattern(PATTERN.PAN),
                Validators.required,
              ]);
            } else if (identity!.DocTypeCodeOdp == EDocListEnum.UID) {
              this.identityMaskForPOI = MASKS.AADHAAR;
              control.setValidators([
                Validators.pattern(PATTERN.AADHAAR),
                Validators.required,
              ]);
            } else if (identity!.DocTypeCodeOdp == EDocListEnum.DrivingLicense) {
              this.identityMaskForPOI = MASKS.DRIVINGLICENSE;
              control.setValidators([
                // Validators.pattern(PATTERN.DRIVINGLICENCE),
                Validators.required,
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.Passport) {
              this.identityMaskForPOI = MASKS.PASSPORT;
              control.setValidators([
                Validators.pattern(PATTERN.PASSPORT),
                Validators.required,
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.VoterID) {
              this.identityMaskForPOI = MASKS.VOTERID
              control.setValidators([
                Validators.pattern(PATTERN.VOTERID),
                Validators.required,
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.CKYC) {
              this.identityMaskForPOI = MASKS.CKYC
              control.setValidators([
                Validators.required, Validators.minLength(14)
              ]);
            }

            else if (identity!.DocTypeCodeOdp == EDocListEnum.NREGA) {
              this.identityMaskForPOI = MASKS.NAREGACARD
              control.setValidators([
                Validators.pattern(PATTERN.NAREGA),
                Validators.required,
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.NPRL) {
              this.identityMaskForPOI = MASKS.NPR
              control.setValidators([
                // Validators.pattern(PATTERN.VOTERID),
                Validators.minLength(5),
                Validators.required,
              ]);
            }
            else {
              this.identityMaskForPOI = null;
              control.setValidators(Validators.required);
            }
            control.updateValueAndValidity();
          })
    );


  }
  private updateIdentityValidityPOA() {
    const control: any = this.ckycDetailForm.get("docNoPOA");
    this._subscriptions.push(
      this.ckycDetailForm
        .get("doctypePOA") && this.ckycDetailForm
          .get("doctypePOA")!
          .valueChanges.subscribe((identity: ICKYCDocList | any) => {
            control.reset();
            if (identity!.DocTypeCodeOdp == EDocListEnum.PAN) {
              this.identityMaskForPOA = MASKS.PAN;
              control.setValidators([
                Validators.pattern(PATTERN.PAN),
                Validators.required,
              ]);
            } else if (identity!.DocTypeCodeOdp == EDocListEnum.UID) {
              this.identityMaskForPOA = MASKS.AADHAAR;
              control.setValidators([
                Validators.pattern(PATTERN.AADHAAR),
                Validators.required,
              ]);
            } else if (identity!.DocTypeCodeOdp == EDocListEnum.DrivingLicense) {
              this.identityMaskForPOA = MASKS.DRIVINGLICENSE;
              control.setValidators([
                // Validators.pattern(PATTERN.DRIVINGLICENCE),
                Validators.required,
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.Passport) {
              this.identityMaskForPOA = MASKS.PASSPORT;
              control.setValidators([
                Validators.pattern(PATTERN.PASSPORT),
                Validators.required,
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.VoterID) {
              this.identityMaskForPOA = MASKS.VOTERID
              control.setValidators([
                Validators.pattern(PATTERN.VOTERID),
                Validators.required,
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.NREGA) {
              this.identityMaskForPOA = MASKS.NAREGACARD
              control.setValidators([
                Validators.pattern(PATTERN.NAREGA),
                Validators.required,
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.CKYC) {
              this.identityMaskForPOA = MASKS.CKYC
              control.setValidators([
                Validators.pattern(PATTERN.CKYC),
                Validators.required,
                , Validators.minLength(14)
              ]);
            }
            else if (identity!.DocTypeCodeOdp == EDocListEnum.NPRL) {
              this.identityMaskForPOA = MASKS.NPR
              control.setValidators([
                // Validators.pattern(PATTERN.VOTERID),
                Validators.minLength(5),
                Validators.required,
              ]);
            }
            else {
              this.identityMaskForPOA = null;
              control.setValidators(Validators.required);
            }
            control.updateValueAndValidity();
          })
    );


  }




  getCkycDocList() {
    let CompanyCode = this.PlanData.CompanyCode
    this._subscriptions.push(
      this.posHomeService.getCKYCDocList(CompanyCode).subscribe((result: any) => {
        this.CkycDocList = result.data;
        if (CompanyCode == '7' ||
          CompanyCode == '2' ||
          CompanyCode == '11' ||
          CompanyCode == '4' ||
          CompanyCode == '16') {
          this.CkycDocListFilter = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.ApplicableFor === "Ind" || x.ApplicableFor === "Both") })
          // console.log(CompanyCode, result.data);
        }
        else if (CompanyCode == '19') {
          this.CkycDocListFilter = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.DocTypeCodeOdp !== 2) })
          // this.CkycDocList = this.CkycDocList.filter((x: ICKYCDocList) => { return (x.DocTypeCodeOdp === 2) })
        }
      })

    )
  }

  DocAPI() {
    if (this.PlanData.CompanyCode == "2") {

      this.btnCkeckStauts = true;
      this.countDowntimer(1)
      window.open(this.manualKYCurl)
    } else if (this.PlanData.CompanyCode == "11") {
      window.open(this.manualKYCurl)
    } else if (this.PlanData.CompanyCode == "14") {
      window.open(this.UniqueId.ManualCkycUrl);
    }
    else {
      window.open(this.manualKYCurl)
    }
  }


  countDowntimer(minute: number) {
    // let minute = 1;
    this.showTimer = true;
    let seconds: number = minute * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const prefix = minute < 10 ? "0" : "";

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = "0" + statSec;
      } else textSec = statSec;
      var hours = Math.floor(seconds / 3600);
      var minutes = Math.floor((seconds - (hours * 3600)) / 60);
      // var seconds = sec_num - (hours * 3600) - (minutes * 60);
      const prefixMin = minutes < 10 ? "0" : "";
      const prefixHour = hours < 10 ? "0" : "";
      this.display = `${prefixMin}${minutes}m : ${textSec}s`;
      // if (seconds == 30) {
      //   this.changetored = true;
      // }
      if (seconds == 0) {
        console.log("finished");
        this.displayNone = true;
        this.showTimer = false;
        clearInterval(timer);
      }
    }, 1000);
  }


  ngOnDestroy() {
    if (this._subscriptions.length > 0) {

      this._subscriptions.forEach((sub: Subscription) => {
        console.log(typeof (sub), typeof (Subscription));
        if (typeof (sub) === typeof (Subscription)) {
          sub.unsubscribe()
        }
      }, (err: Error) => {
        console.log(err.message);
      });
    }
  }
  fileUploadList: any = []
  uploadFile(event: Event, inputType: string, controlname: string) {
    let file: any = (event.target as HTMLInputElement);
    const doc: any = this.ckycDetailForm.controls[`${controlname}`];
    console.log(this.fileUploadList);
    if (file) {
      let docArray = ["pdf", "jpg", "jpeg", "tif", "tiff"]
      let FileExtension = file.files[0].name.split(".")//file.name.split(".")[1];
      let isExists: boolean = docArray.some(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
      var FileSize = file.files[0].size / 1024;
      if (!isExists) {
        doc.setValidators([
          (): ValidationErrors => { return { fileExtensionError: "Please Upload Only pdf, jpg, jpeg, tif, tiff. ...!!" } }
        ]);
        doc.patchValue(null)
        doc.updateValueAndValidity();
        console.log(doc)
        return;
      }
      if (FileSize > 3000) {
        // alert("Max file size allowed is 4 MB. Allowed file type Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx.");
        doc.setValidators([
          (): ValidationErrors => { return { fileSizeError: "Max file size allowed is 3 MB. Allowed file type Only pdf, jpg, jpeg, tif, tiff." } }
        ]);
        doc.patchValue(null)
        doc.updateValueAndValidity();
        console.log(doc)

        return;
      }
      doc.setValidators(null);
      doc.updateValueAndValidity();
      if (inputType === "POI") {
        this.fileUploadList[0] = ''
        this.fileUploadList[0] = file.files[0];
        this.fileNamePOI = file.files[0].name;
        this.fileExtionPOI = docArray.find(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
      } else if (inputType === "POA") {
        this.fileUploadList[1] = '';
        this.fileUploadList[1] = file.files[0];
        this.fileNamePOA = file.files[0].name;
        this.fileExtionPOA = docArray.find(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
      } else if (inputType === "photo") {
        this.fileUploadList[2] = '';
        this.fileUploadList[2] = file.files[0];
        this.fileNamePhotograph = file.files[0].name;
        this.fileExtionPhotograph = docArray.find(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
      }
      else {
        return;
      }

    }
  }


  uploadSingleFile(event: Event, inputType: string, controlname: string) {
    let file: any = (event.target as HTMLInputElement);
    const doc = this.ckycDetailForm.controls[`${controlname}`];
    console.log(this.fileUploadList);
    if (file) {
      let docArray = ["pdf", "jpg", "jpeg", "tif", "tiff"];
      let FileExtension = file.files[0].name.split(".")//file.name.split(".")[1];
      let isExists: boolean = docArray.some(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
      var FileSize = file.files[0].size / 1024;
      if (!isExists) {
        doc.setValidators([
          (): ValidationErrors => { return { fileExtensionError: "Please Upload Only pdf, jpg, jpeg, tif, tiff. ...!!" } }
        ]);
        doc.updateValueAndValidity();
        console.log(doc)
        return;
      }
      if (FileSize > 3000) {
        // alert("Max file size allowed is 4 MB. Allowed file type Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx.");
        doc.setValidators([
          (): ValidationErrors => { return { fileSizeError: "Max file size allowed is 3 MB. Allowed file type Only pdf, jpg, jpeg, tif, tiff." } }
        ]);
        doc.updateValueAndValidity();
        console.log(doc)

        return;
      }
      doc.setValidators(null);
      doc.updateValueAndValidity();
      if (inputType === "POI") {
        this.fileUploadList[0] = ''
        this.fileUploadList[0] = file.files[0];
        this.fileName = file.files[0].name;
        this.fileExtionPOI = docArray.find(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
      } else {
        return;
      }


    }
  }


  uploadSingleFileForGoDigit(event: Event, inputType: string, controlname: string) {
    let file: any = (event.target as HTMLInputElement);
    const doc = this.ckycDetailForm.controls[`${controlname}`];
    console.log(this.fileUploadList);
    if (file) {
      let docArray = ["jpg", "bmp", "jpeg"];
      let FileExtension = file.files[0].name.split(".")//file.name.split(".")[1];
      let isExists: boolean = docArray.some(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
      var FileSize = file.files[0].size / 1024;
      if (!isExists) {
        doc.setValidators([
          (): ValidationErrors => { return { fileExtensionError: "Please Upload Only jpg, bmp, jpeg. ...!!" } }
        ]);
        doc.updateValueAndValidity();
        console.log(doc)
        return;
      }
      if (FileSize > 3000) {
        // alert("Max file size allowed is 4 MB. Allowed file type Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx.");
        doc.setValidators([
          (): ValidationErrors => { return { fileSizeError: "Max file size allowed is 3 MB. Allowed file type Only pdf, jpg, jpeg, tif, tiff." } }
        ]);
        doc.updateValueAndValidity();
        console.log(doc)

        return;
      }
      doc.setValidators(null);
      doc.updateValueAndValidity();
      if (inputType === "POI") {
        this.fileUploadList[0] = ''
        this.fileUploadList[0] = file.files[0];
        this.fileName = file.files[0].name;
        this.fileExtionPOI = docArray.find(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
      } else {
        return;
      }


    }
  }
  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach((file: any) => {

    });
  }
  onClick() {

    const fileUpload = this.fileUpload.nativeElement; fileUpload.onchange = () => {

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
    console.log(file, FileSize)

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
    let docArray = ["pdf"];
    let FileExtension = file.name.split(".")//file.name.split(".")[1];
    let isExists: boolean = docArray.some(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
    this.docExtension = FileExtension[FileExtension.length - 1]
    console.log(FileExtension, isExists, FileExtension[FileExtension.length - 1])
    if (!isExists) {
      // alert("Please Upload Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx. ...!!");
      doc.setValidators([
        (): ValidationErrors => { return { fileExtensionError: "Please Upload Only pdf. ...!!" } }
      ]);
      doc.updateValueAndValidity();
      console.log(doc)
      return;
    }
    if (FileSize > 6000) {
      // alert("Max file size allowed is 4 MB. Allowed file type Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx.");
      doc.setValidators([
        (): ValidationErrors => { return { fileSizeError: "Max file size allowed is 6 MB. Allowed file type Only pdf." } }
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


  fileProgressShreeRam(event: any, controlName: string): any {
    const doc = this.ckycDetailForm.controls[`${controlName}`];//("docData")
    if (!event.target.files[0]) {
      doc.setValidators([Validators.required]);
      doc.updateValueAndValidity();
      return false;
    }

    let files: any = new FileReader();
    let file = event.target.files[0];
    var FileSize = file.size / 1024;
    console.log(file, FileSize)

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
    let docArray = ["png", "jpg", "jpeg"];
    let FileExtension = file.name.split(".")//file.name.split(".")[1];
    let isExists: boolean = docArray.some(x => x == FileExtension[FileExtension.length - 1]!.toLowerCase())
    this.docExtension = FileExtension[FileExtension.length - 1]
    console.log(FileExtension, isExists, FileExtension[FileExtension.length - 1])
    if (!isExists) {
      // alert("Please Upload Only pdf,png,xlsx. ...!!");
      doc.setValidators([
        (): ValidationErrors => { return { fileExtensionError: "Please Upload Only png,jpg,jpeg ...!!" } }
      ]);
      doc.updateValueAndValidity();
      console.log(doc)
      return;
    }
    if (FileSize > 2000) {
      // alert("Max file size allowed is 4 MB. Allowed file type Only pdf, jpeg, gif, bitmap, xls, xlsx, doc, docx.");
      doc.setValidators([
        (): ValidationErrors => { return { fileSizeError: "Max file size allowed is 2 MB. Allowed file type Only pdf." } }
      ]);
      doc.updateValueAndValidity();
      console.log(doc)

      return;
    }
    doc.setValidators(null);
    doc.updateValueAndValidity();
    console.log(this.ckycDetailForm)
    if (controlName === "profilePic") {
      this.fileNameProPic = file.name;
    } else if (controlName === "docDataPOI") {
      this.fileNamePOI = file.name;
    }
    else if (controlName === "panDocUpload") {
      this.panDocName = file.name;
    }
    else {
      this.fileNamePOA = file.name;
    }



    // this.Image = event.target.files[0].value;
    // this.uploadfilename = file.name;
    //this.Image =file.path+'/'+file.name;

    files.readAsDataURL(file);
    files.onload = () => {
      if (controlName === "profilePic") {
        this.base64urlProPic = files.result.toString().split(",")[1];
        console.log(this.base64urlProPic);

      } else if (controlName === "docDataPOI") {
        this.base64urlPAN = files.result.toString().split(",")[1];
        console.log(this.base64urlPAN);

      }
      else if (controlName === "panDocUpload") {
        this.base64url = files.result.toString().split(",")[1];
        console.log(this.base64url);

      }
      else {
        this.base64urlOtherDoc = files.result.toString().split(",")[1];
        console.log(this.base64urlOtherDoc);

      }
    };
  }


  closeModal(): void {

    // this.isChecked = false;
    // this.shareUrlForm.removeControl('emailId')
    if (this.PlanData.CompanyCode == '4' || this.PlanData.CompanyCode === '9' || this.PlanData.CompanyCode === '12') {
      // this.isckycFailedForIffcoTokio = false;
      // this.ckycDetailForm.controls{}
      this.isIffcoDefaultRadioButton = true
      this.onSelectStep("fetch")
      Object.keys(this.ckycDetailForm.controls).forEach((c: any) => {
        this.ckycDetailForm.controls[c].setValue("")
      })
      // this.ckycDetailForm.controls
      this.isCkycValidate.emit(false)
      this.showModal = !this.showModal;
    }



  }




}



