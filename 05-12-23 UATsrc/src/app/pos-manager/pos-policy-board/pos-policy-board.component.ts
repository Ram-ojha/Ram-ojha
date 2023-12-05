import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";

import { ToastrService } from "ngx-toastr";
import { IInsuranceType } from "src/app/models/common.Model";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { PolicyServicingApiService } from "../services/pos-policy-servicing.service";

@Component({
  templateUrl: "./pos-policy-board.component.html",
  styleUrls: ["./pos-policy-board.component.css"],
  // encapsulation: ViewEncapsulation.None,
})
export class PosPolicyBoardComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];
  navLinks: IInsuranceType[] = [];
  public showLoader: boolean = false;
  successCode!: string;
  errorMessage!: string;
  loading!: boolean;

  constructor(
    public _posHomeService: PosHomeService,
    public _policyBoardService: PolicyServicingApiService,
    private _errorHandleService: ErrorHandleService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit() {
    $("input").attr("autocomplete", "off");
    this.getMenu();
  }

  private getMenu() {

    this.showLoader = true;
    this._subscriptions.push(
      this._posHomeService.insuranceTypeMenu.subscribe(
        (result) => {
          this.showLoader = false;
          if (result.successcode == "1") {
            this.navLinks = result.data;
          }
        },
        (err: any) => {
          this.showLoader = false;
          if (err instanceof HttpErrorResponse)
            this._errorHandleService.handleError(err);
        }
      ))
  }
  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
}
