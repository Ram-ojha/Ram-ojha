import { Component, OnDestroy, OnInit } from "@angular/core";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";

import { PosHomeService } from "./services/pos-home.service";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandleService } from "../shared/services/error-handler.service";
import { IInsuranceType } from "../models/common.Model";

@Component({
  selector: "pos-home",
  templateUrl: "./pos-home.component.html",
  styleUrls: ["./pos-home.component.css"],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class PosHomeComponent implements OnInit, OnDestroy {
  navLinks: IInsuranceType[] = [];
  public showLoader: boolean = false;
  private _subscriptions: any[] = [];

  constructor(
    public _posHomeService: PosHomeService,
    private _router: Router,
    private _errorHandleService: ErrorHandleService
  ) { }

  ngOnInit() {

    // ($("input") as any).attr("autocomplete", "off");
    this.getMenu();
    this.getSelectedTab();
  }

  private getSelectedTab() {
    let sesData = JSON.parse(sessionStorage.getItem("insuranceType")!);
    if (sesData) this._router.navigate([`pos/${sesData.RouteUrl}`]);
    else this._router.navigate([`pos/bike-insurance`]);
  }

  private getMenu() {
    debugger
    this.showLoader = true;
    sessionStorage.removeItem("UniqueId");
    this._subscriptions.push(
      this._posHomeService.insuranceTypeMenu.subscribe(
        (result) => {
          this.showLoader = false;
          if (result.successcode == "1") {
            this.navLinks = result.data;
            // this._router.navigate(['/pos/bike-insurance']);
            const existValue = JSON.parse(
              sessionStorage.getItem("insuranceType")!
            ) as IInsuranceType;
            let links = this.navLinks.slice();
            if (
              existValue &&
              !isNaN(existValue.InsuranceCateCode) &&
              existValue.InsuranceCateCode > 0
            ) {
              const selected = links.filter(
                (item: IInsuranceType) =>
                  item.InsuranceCateCode == existValue.InsuranceCateCode
              );
              if (!selected) {
                const selected = links.filter(
                  (item: IInsuranceType) => item.PriorityCode == 1
                )[0];
                sessionStorage.setItem("insuranceType", JSON.stringify(selected));
                this._router.navigate(["/pos/" + selected.RouteUrl]);
              }
            } else {
              const selected = links.filter(
                (item: IInsuranceType) => item.PriorityCode == 1
              )[0];
              sessionStorage.setItem("insuranceType", JSON.stringify(selected));
              this._router.navigate(["/pos/" + selected.RouteUrl]);
            }
          }
        },
        (err: any) => {
          this.showLoader = false;
          if (err instanceof HttpErrorResponse)
            this._errorHandleService.handleError(err);
        }
      ))

  }
  public onMenuChange(insuranceCateCode: IInsuranceType): any {
    debugger
    if (insuranceCateCode) {
      sessionStorage.setItem(
        "insuranceType",
        JSON.stringify(insuranceCateCode)
      );
      let sessionValue = JSON.parse(sessionStorage.getItem("VehicleData")!);
      let sessionValue2 = JSON.parse(sessionStorage.getItem("CarData")!);
      let sessionValue3 = JSON.parse(sessionStorage.getItem("CVData")!);
      if (sessionValue != undefined) {
        if (
          insuranceCateCode.InsuranceCateCode != sessionValue.InsuranceCateCode
        ) {
          sessionStorage.removeItem("VehicleData");
        }
      }
      if (sessionValue2 != undefined) {
        if (
          insuranceCateCode.InsuranceCateCode != sessionValue2.InsuranceCateCode
        ) {
          sessionStorage.removeItem("CarData");
        }
      }
      if (sessionValue3 != undefined) {
        if (
          insuranceCateCode.InsuranceCateCode != sessionValue3.InsuranceCateCode
        ) {
          sessionStorage.removeItem("CVData");
        }
      }
    } else return false;
  }
  // public onMenuChange(insuranceCateCode: IInsuranceType) {

  //     if (insuranceCateCode) {

  //         sessionStorage.setItem('insuranceType', JSON.stringify(insuranceCateCode));
  //         let sessionValue = JSON.parse(sessionStorage.getItem('VehicleData'));
  //         if (sessionValue != undefined)
  //             if (insuranceCateCode.InsuranceCateCode != sessionValue.InsuranceCateCode) {
  //                 sessionStorage.removeItem('VehicleData')
  //             }
  //     } else
  //         return false;
  // }
  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
}
