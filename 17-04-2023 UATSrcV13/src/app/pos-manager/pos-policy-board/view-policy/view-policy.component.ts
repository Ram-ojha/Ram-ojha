import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { Indication } from "src/app/models/insurance.enum";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { PolicyServicingApiService } from "../../services/pos-policy-servicing.service";

@Component({
  selector: "app-view-policy",
  templateUrl: "./view-policy.component.html",
  styleUrls: ["./view-policy.component.css"],
})
export class ViewPolicyComponent implements OnInit, OnDestroy {
  private _subscriptions: any = [];
  dateForm!: FormGroup;
  totalPolicies!: number;
  totalPremium!: number;
  loading!: boolean;
  successCode!: string;

  constructor(
    public _posHomeService: PosHomeService,
    public _policyBoardService: PolicyServicingApiService,
    private _errorHandleService: ErrorHandleService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit() {
    $("input").attr("autocomplete", "off");
    this.getpoliciesSummary();
  }

  public getpoliciesSummary() {
    this.loading = true;
    this._subscriptions.push(
      this._policyBoardService.policySearch(Indication.ALL).subscribe(
        (response) => {
          this.loading = false;
          console.log(response);
          this.successCode = response.successcode;
          if (this.successCode != "1") {
            this._toastrService.warning(response.msg);
            return;
          }

          this.totalPolicies = response.data.Table[0].NoOfPolicies;
          this.totalPremium = response.data.Table[0].TotalPremiumPerYr;
        },
        (err: any) => {
          this.loading = false;
          this._errorHandleService.handleError(err);
        }
      ))
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
