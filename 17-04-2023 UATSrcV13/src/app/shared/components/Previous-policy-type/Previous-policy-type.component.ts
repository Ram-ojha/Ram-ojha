import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PosHomeService } from 'src/app/pos-home/services/pos-home.service';
import { ErrorHandleService } from '../../services/error-handler.service';
import { errorLog, IPolicyExpired, IPreviousPolicyExpiryType } from '../../../models/common.Model';
import { decrypt } from 'src/app/models/common-functions';
import { Subscription } from 'rxjs';

export interface IPolicyExpiredList {
  PolicyTypeCode: number
  PolicyTypeDesc: string
  PolicyTypeDescDetail: string
}

@Component({
  selector: 'app-policy-type',
  templateUrl: './Previous-policy-type.component.html',
  styleUrls: ['./Previous-policy-type.component.css']
})

export class PolicyTypeComponent implements OnInit, OnDestroy {

  @Input() isVisible!: boolean;
  @Input() PolicyExpiryType!: IPreviousPolicyExpiryType[];
  @Output() closePopupClick = new EventEmitter<any>();
  @Input() isRememberPrvPolDetails!: number;

  policyExpiredList: IPolicyExpired[] = [];
  PolicyTypeList: IPolicyExpiredList[] = [];

  selectedValue: any = '';
  private _subscriptions: any = [];
  link: any;
  userName: any;
  posMobileNo: any;
  errorLogDetails!: errorLog
  constructor(private _posHomeService: PosHomeService, private _errorHandleService: ErrorHandleService) { }

  ngOnInit() {
    this.link = window.location.hash.split('/');
    this.userName = decrypt(sessionStorage.getItem("User Name")!);
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    // if (this.insuranceCateCode > 0)
    //   this.getData(this.insuranceCateCode);

  }
  private getData(insuranceCateCode: number) {
    // if (this.policyExpiredList.length == 0)
    this._subscriptions.push(
      this._posHomeService.getPolicyExpiredList(insuranceCateCode).subscribe((result: any) => {
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
          this.policyExpiredList = result.data
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
    let data = this.PolicyExpiryType.find(x => x.PolicyTypeCode == PolicyTypeCode)
    // if (event._checked) {
    //   this.selectedValue = event.value;
    this.closePopupClick.emit(data);
    // } else {
    // this.closePopupClick.emit(this.selectedValue);
    // }
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
