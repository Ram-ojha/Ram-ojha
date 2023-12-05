import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, OnChanges } from '@angular/core';
import { PosHomeService } from 'src/app/pos-home/services/pos-home.service';
import { ErrorHandleService } from '../../services/error-handler.service';
import { errorLog, IInsuranceCompany, IPolicyExpired, IPreviousPolicyExpiryType } from '../../../models/common.Model';
import { decrypt } from 'src/app/models/common-functions';
import { forkJoin, map, Observable, of, startWith, Subscription } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';

export interface IPolicyExpiredList {
  PolicyTypeCode: number
  PolicyTypeDesc: string
  PolicyTypeDescDetail: string
}

export interface IPolicyExpiredDetails {
  policyExpiredType: IPolicyExpiredList,
  previousPolicyExpiredCompany: IInsuranceCompany
}

@Component({
  selector: 'app-policy-type',
  templateUrl: './Previous-policy-type.component.html',
  styleUrls: ['./Previous-policy-type.component.css']
})

export class PolicyTypeComponent implements OnInit, OnDestroy, OnChanges {

  @Input() isVisible!: boolean;
  @Input() PolicyExpiryType: IPreviousPolicyExpiryType[] = [];
  PreviousPolicyCompList: IInsuranceCompany[] = [];


  @Output() closePopupClick = new EventEmitter<any>();
  @Input() isRememberPrvPolDetails!: number;


  @ViewChild('autoPPInsurer') autoPPInsurer!: MatAutocomplete;
  policyExpiredList: IPolicyExpired[] = [];
  PolicyTypeList: IPolicyExpiredList[] = [];
  previousPolicyCompListAsync!: Observable<IInsuranceCompany[]>;
  prvPolicyInsurer: FormControl = new FormControl('', [Validators.required]);
  prvPolicyType: FormControl = new FormControl('', [Validators.required])

  policyExpiredDetails: IPolicyExpiredDetails = new PolicyExpiredDetails();
  errorMsg: string = "";

  selectedValue: any = '';
  private _subscriptions: any = [];
  link: any;
  userName: any;
  posMobileNo: any;
  errorLogDetails!: errorLog
  constructor(private _posHomeService: PosHomeService, private _errorHandleService: ErrorHandleService) { }

  ngOnInit() {
    debugger
    this.link = window.location.hash.split('/');
    this.userName = decrypt(sessionStorage.getItem("User Name")!);
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    // if (this.insuranceCateCode > 0)
    this.getData();
    this.editBike(); this.editCar();

  }
  editBike() {
    const vData = JSON.parse(sessionStorage.getItem("VehicleData")!);
    if (vData && vData.edit == 1) {
      let selectedValue: IInsuranceCompany =
      {
        InsuranceCompanyCode: vData.PrvInsurerCode,
        InsuranceCompanyDesc: vData.PrvInsurerName
      };
      let selectedPolilcyType: IPolicyExpiredList = {
        PolicyTypeCode: vData.PreviousPolicyTypeCode,
        PolicyTypeDesc: vData.PreviousPolicyTypeDesc,
        PolicyTypeDescDetail: ""
      };
      this.prvPolicyInsurer.setValue(selectedValue.InsuranceCompanyDesc);
      this.prvPolicyType.setValue(selectedPolilcyType);
      // this.OnSelectPreviousCompany(selectedValue);
      console.log(this.prvPolicyType);

      // this.onSelect(selectedPolilcyType.PolicyTypeCode);
      //console.log(this.selectedValue);
      // this.onSelect(this.selectedValue);
    }
  }

  editCar() {
    const vData = JSON.parse(sessionStorage.getItem("CarData")!);
    if (vData && vData.edit == 1) {
      let selectedValue: IInsuranceCompany =
      {
        InsuranceCompanyCode: vData.PrvInsurerCode,
        InsuranceCompanyDesc: vData.PrvInsurerName
      };
      let selectedPolilcyType: IPolicyExpiredList = {
        PolicyTypeCode: vData.PreviousPolicyTypeCode,
        PolicyTypeDesc: vData.PreviousPolicyTypeDesc,
        PolicyTypeDescDetail: ""
      };
      this.prvPolicyInsurer.setValue(selectedValue.InsuranceCompanyDesc);
      this.prvPolicyType.setValue(selectedPolilcyType);
      // this.OnSelectPreviousCompany(selectedValue);
      console.log(this.prvPolicyType);

      // this.onSelect(selectedPolilcyType.PolicyTypeCode);
      //console.log(this.selectedValue);
      // this.onSelect(this.selectedValue);
    }
  }

  ngOnChanges() {

  }
  private getData() {
    // if (this.policyExpiredList.length == 0)
    // let policyExpiredListReq = this._posHomeService.getPolicyExpiredList(insuranceCateCode);
    // let previousPolicyCompanyListReq = this._posHomeService.getPreviousPolicyCompanyList();

    this._subscriptions.push(
      this._posHomeService.getPreviousPolicyCompanyList().subscribe((result: any) => {
        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "PosHome";
          this.errorLogDetails.MethodName = "GetPolicyExpiredList";
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            console.log('errorLog---=>', res)
          })
        }

        if (result.successcode == '1') {
          this.PreviousPolicyCompList = result.data
          // this.previousPolicyCompListAsync = of(this.PreviousPolicyCompList)
          this._filterPreviousPolicyList();

          // ['PolicyExpiredList'];
          // this.PolicyTypeList = result.data['PolicyTypeList'];
          // console.table(this.PolicyTypeList);
        }
      }, (err: any) => {
        this._errorHandleService.handleError(err);
      }))

  }
  closePopup() {
    this.closePopupClick.emit(this.selectedValue);
  }
  onSelect(PolicyTypeCode: number) {
    debugger
    console.log(this.prvPolicyType);

    let data: IPolicyExpiredList = this.PolicyExpiryType.find(x => x.PolicyTypeCode == PolicyTypeCode)!;
    this.prvPolicyType.setValue(data);

    this.policyExpiredDetails!["policyExpiredType"] = data;

  }

  sendData() {
    let isPreviousInsurerExists = this.PreviousPolicyCompList.some((x: IInsuranceCompany) => {
      return (x.InsuranceCompanyDesc.toLowerCase() === this.prvPolicyInsurer.value!.toLowerCase())
    })
    let isPolicyTypeExpire = this.PolicyExpiryType.some((x: IPolicyExpiredList) => {
      return x.PolicyTypeCode == this.prvPolicyType.value!.PolicyTypeCode
    });
    let filteredValue = this.filterPreviousPolicyList(this.prvPolicyInsurer.value);
    this.policyExpiredDetails!.previousPolicyExpiredCompany = filteredValue[0];
    this.onSelect(this.prvPolicyType.value!.PolicyTypeCode)

    if (!isPreviousInsurerExists || !isPolicyTypeExpire) {
      this.errorMsg = "Please select details.";
    } else {

      this.closePopupClick.emit(this.policyExpiredDetails);
    }

  }



  OnSelectPreviousCompany(item: IInsuranceCompany) {
    debugger
    if (this.prvPolicyInsurer.errors !== null) {
      this.errorMsg = "Please select previous insurer name.";
    } else {
      let filteredValue = this.filterPreviousPolicyList(this.prvPolicyInsurer.value);

      this.policyExpiredDetails!.previousPolicyExpiredCompany = filteredValue[0];
      // this.sendData();
    }
  }

  _filterPreviousPolicyList() {
    this.previousPolicyCompListAsync = this.prvPolicyInsurer.valueChanges.pipe(
      startWith(''),
      map((value: any) => this.filterPreviousPolicyList(value))
    )
  }

  filterPreviousPolicyList(filterValue: string): IInsuranceCompany[] {

    let filterBy = filterValue ? filterValue.toLowerCase() : "";
    return this.PreviousPolicyCompList.filter((list: IInsuranceCompany) => {
      return list.InsuranceCompanyDesc.toLowerCase().includes(filterBy)
    });
  }



  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }


  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}



class PolicyExpiredDetails implements IPolicyExpiredDetails {
  previousPolicyExpiredCompany: IInsuranceCompany = new InsuranceCompany();;
  policyExpiredType: IPolicyExpiredList = new PolicyExpiredList();
}

class PolicyExpiredList implements IPolicyExpiredList {
  PolicyTypeCode!: number;
  PolicyTypeDesc!: string;
  PolicyTypeDescDetail!: string;

}

class InsuranceCompany implements IInsuranceCompany {
  InsuranceCompanyCode!: number;
  InsuranceCompanyDesc!: string;

}
