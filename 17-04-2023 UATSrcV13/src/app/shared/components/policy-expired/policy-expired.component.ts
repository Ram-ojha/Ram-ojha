import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PosHomeService } from 'src/app/pos-home/services/pos-home.service';
import { ErrorHandleService } from '../../services/error-handler.service';
import { errorLog, IPolicyExpired } from '../../../models/common.Model';
import { decrypt } from 'src/app/models/common-functions';
import { Subscription } from 'rxjs';

export interface IPolicyExpiredList {
  PolicyTypeCode: number
  PolicyTypeDesc: string
  PolicyTypeDescDetail: string
}

@Component({
  selector: 'app-policy-expired',
  templateUrl: './policy-expired.component.html',
  styleUrls: ['./policy-expired.component.css']
})

export class PolicyExpiredComponent implements OnInit, OnDestroy {

  @Input() isVisible!: boolean;
  @Input() insuranceCateCode!: number;
  @Output() closePopupClick = new EventEmitter<string>();


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
    if (this.insuranceCateCode > 0)
      this.getData(this.insuranceCateCode);
    this.editData();
    this.editcar();
  }
  private getData(insuranceCateCode: number) {
    // if (this.policyExpiredList.length == 0)
    this._subscriptions.push(
      this._posHomeService.getPolicyExpiredList(insuranceCateCode).subscribe((result) => {
        if (result.successcode == "0" || result.successcode == null) {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = "";
          this.errorLogDetails.CompanyName = "";
          this.errorLogDetails.ControllerName = "PosHome"
          this.errorLogDetails.MethodName = "GetPolicyExpiredList";
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService.sendErrorLog(this.errorLogDetails).subscribe((res: any) => {
            console.log('errorLog---=>', res)
          })
        }
        if (result.successcode == '1') {
          this.policyExpiredList = result.data
          //console.log(this.policyExpiredList );

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
  onSelect(event: any) {
    //console.log(event.checked);
    if (event._checked) {
      this.selectedValue = event.value;
      //console.log(this.selectedValue);

      this.closePopupClick.emit(event.value);
    }

    else {
      this.closePopupClick.emit(this.selectedValue);
    }
  }
  editData() {
    const vData = JSON.parse(sessionStorage.getItem("VehicleData")!);
    if (vData && vData.edit == 1) {
      this.selectedValue = vData.VehicleExpiryCode + "," + vData.VehicleExpiryDesc;

      //console.log(this.selectedValue);
      this.onSelect(this.selectedValue);
    }
  }
  editcar() {
    const vData = JSON.parse(sessionStorage.getItem("CarData")!);
    if (vData && vData.edit == 1) {
      this.selectedValue = vData.VehicleExpiryCode + "," + vData.VehicleExpiryDesc;

      //console.log(this.selectedValue);
      this.onSelect(this.selectedValue);
    }
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe()); // 🧙‍♂️🧙‍♂️
  }
}
