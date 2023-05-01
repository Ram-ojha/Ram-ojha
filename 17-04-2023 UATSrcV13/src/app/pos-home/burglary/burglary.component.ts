import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PATTERN } from 'src/app/models/common';
import { IInsuranceType } from "src/app/models/common.Model";
import { IGender, IFamilyMembers, IAges, HealthModel, IHealthData, Relation as r } from 'src/app/models/health-insu.Model';
import { PosHealthService } from '../services/pos-health.service';
import { ErrorHandleService } from 'src/app/shared/services/error-handler.service';
import { Gender } from 'src/app/models/insurance.enum';


@Component({
    templateUrl: './burglary.component.html',
    styleUrls: ['../pos-home.component.css',
        './burglary.component.css'
    ]
})
export class BurglaryComponent implements OnInit {

    //#region properties 

    //all list objects
    genderList: IGender[] = [];

    selectedTab = 0;
    // selectedIndex = 0;
    step = 0;
    isEditable = false;
    isCompleted = false;
    showLoader: boolean = false; //for showing loader
    insuranceType!: IInsuranceType;
    errMsg = '';


    constructor(private _router: Router, private _posHealthService: PosHealthService, private _errorHandleService: ErrorHandleService
        , fb: FormBuilder) {

    }

    ngOnInit(): void {
        // this.insuranceType = JSON.parse(sessionStorage.getItem('insuranceType')) as IInsuranceType;
        // if (!this.insuranceType && isNaN(this.insuranceType.InsuranceCateCode) || this.insuranceType.InsuranceCateCode < 1) {
        //     this._router.navigate(['/pos']);
        // }
        // if (this._posHealthService.healthDataList) {
        //     this.FillData(this._posHealthService.healthDataList)
        // }
        // else {
        //     this.getData();
        // }
    }


    //#region  private functions for Data
    // private getData() {
    //     this.showLoader = true;
    //     this._posHealthService.gethealthData().subscribe((result) => {
    //         this.showLoader = false
    //         if (result.successcode == '1') {
    //             this.FillData(result.data as IHealthData)
    //         }
    //     }, (err: any) => {
    //         this.showLoader = false;
    //         this._errorHandleService.handleError(err);
    //     });
    // }
    // private FillData(healthData: IHealthData) {

    // }
    //#endregion

    //#region public functions

    public onNextClick(tab: number) {
        this.selectedTab = tab;
    }
    onClickBackToTab(tab: number) {

        setTimeout(() => {
            this.selectedTab = tab;
        }, 100);
    }

    //#endregion

}