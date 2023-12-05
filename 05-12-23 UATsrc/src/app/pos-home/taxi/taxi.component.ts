import { OnInit, Component, ViewChild } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PolicyExpiredComponent } from 'src/app/shared/components/policy-expired/policy-expired.component';
import { yesNoList } from 'src/app/models/common';
import { IInsuranceType } from 'src/app/models/common.Model';
import { CarInfoModel } from 'src/app/models/car-insu.Model';
import { Router } from '@angular/router';


@Component({
    selector: 'taxi',
    templateUrl: './taxi.component.html',
    styleUrls: ['../pos-home.component.css']
})
export class TaxiComponent implements OnInit {

    //#region objects and lists
    // @ViewChild('carModel', { static: false }) private carModelCmp: CarModelVariantComponent;
    // @ViewChild('vehicleRtos', { static: false }) private rtoCmp: VehicleRtoComponent;
    @ViewChild('policyExpire', { static: false }) private policyCmp!: PolicyExpiredComponent;

    //all list objects
    public yesNoList = yesNoList;
    // policySubType: IInsuranceSubType[] = [];

    // conditional properties
    showLoader = false; //for showing loader
    // knowCarNumber: boolean = false;
    displayRtoPopup: any = false;
    displayCarModelPopup: any = false;
    showExpiredPolicy = false;
    // policyType: number = 3;

    //values properties
    insuranceType!: IInsuranceType | any;
    policyExpireDisplayValue: string = '';
    public openBy: string = '';
    public errMsg = '';

    //reactive form objects
    renewCarForm: FormGroup;

    //#endregion

    constructor(private _router: Router
        , private fb: FormBuilder) {
        this.renewCarForm = fb.group({
            CarDisplayValue: ['', Validators.required],
            CarBrandCode: ['', Validators.required],
            CarModelCode: ['', Validators.required],
            CarVariantCode: ['', Validators.required],
            RegistrationYearCode: ['', Validators.required],
            isPreviousPolicyExp: ['', Validators.required],
            claimInPreviousYear: ['', Validators.required],
            CarExpiryCode: [''],
            RTOCode: ['', Validators.required],
            RTODisplayName: ['', Validators.required],
            FuelCode: [''],

            CarBrandDesc: '',
            CarModelDesc: '',
            CarVariantDesc: '',
            RegistrationYearDesc: '',
            FuelDesc: [''],
            RTOName: '',
        });
    }

    ngOnInit() {
        this.insuranceType = JSON.parse(sessionStorage.getItem('insuranceType')!);
        if (!this.insuranceType && isNaN(this.insuranceType.InsuranceCateCode) || this.insuranceType.InsuranceCateCode < 1) {
            this._router.navigate(['/pos']);
        }
    }

    public onClickCar(openBy: string) {
        this.openBy = openBy;
        this.displayCarModelPopup = true;
    }
    public onPolicyExpiredChange(event: number, openBy: string) {
        if (event == 1) {
            this.showExpiredPolicy = true;
            this.openBy = openBy;
        }
        else {
            this.policyExpireDisplayValue = '';
            this.policyCmp.selectedValue = '';
        }
    }
    public closeCarModelVariantPopup(event: CarInfoModel) {
        if (event) {
            if (this.openBy == 'renewCarForm') {
                this.renewCarForm.patchValue({
                    CarDisplayValue: event.CarBrandDesc + ', ' + event.CarModelDesc + ', ' + event.CarVariantDesc + ', ' + event.RegistrationYearDesc,
                    CarBrandCode: event.CarBrandCode,
                    CarModelCode: event.CarModelCode,
                    CarVariantCode: event.CarVariantCode,
                    RegistrationYearCode: event.RegistrationYearCode,
                    FuelCode: event.FuelCode,

                    CarBrandDesc: event.CarBrandDesc,
                    CarModelDesc: event.CarModelDesc,
                    CarVariantDesc: event.CarVariantDesc,
                    RegistrationYearDesc: event.RegistrationYearDesc,
                    FuelDesc: event.FuelTypeDesc,
                });
            }
        }
        this.displayCarModelPopup = false;
        this.openBy = '';
    }
    public closeRtosPopup(selected: string) {
        this.displayRtoPopup = false;
        if (event) {
            if (this.openBy == 'renewCarForm') {
                this.renewCarForm.patchValue({
                    RTOCode: +(selected.split(',')[0]),
                    RTODisplayName: selected.split(',')[1],
                    RTOName: selected.split(',')[1]
                });
            }
        }
        this.openBy = '';
    }
    public closePolicyExpiredPopup(event: string) {
        this.showExpiredPolicy = false;
        if (this.openBy == 'renewCarForm') {
            if (event)
                this.renewCarForm.controls!['CarExpiryCode'].setValue(+event.split(',')[0]);
            else {
                this.renewCarForm.patchValue({
                    CarExpiryCode: '', isPreviousPolicyExp: '',
                })
            }
        }
        this.policyExpireDisplayValue = event.split(',')[1];
        this.openBy = '';
    }

    onSubmitRenewCar() {

    }

}