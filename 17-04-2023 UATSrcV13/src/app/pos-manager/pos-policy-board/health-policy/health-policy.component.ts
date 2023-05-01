import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Subject, Subscription } from "rxjs";
import {
  IInsuranceType,
  IPolicyAndPremiumStats,
  IPolicyRecord,
} from "src/app/models/common.Model";
import { Indication } from "src/app/models/insurance.enum";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { PolicyServicingApiService } from "../../services/pos-policy-servicing.service";

@Component({
  selector: "app-health-policy",
  templateUrl: "./health-policy.component.html",
  styleUrls: ["./health-policy.component.css"],
})
export class HealthPolicyComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];
  dateForm: FormGroup;
  successCode!: string;
  errorMessage!: string;
  policyAndPremiumStats!: IPolicyAndPremiumStats;
  policyHistoryData!: IPolicyRecord;
  nameFilter = new FormControl("");
  policyNoFilter = new FormControl("");
  VehicleNoFilter = new FormControl("");
  noResults$ = new Subject<boolean>();
  loading!: boolean;
  clearAllFilters: boolean = true;
  filterValues: any = {
    name: "",
    policyNo: "",
    date: {
      fromDate: "",
      toDate: "",
    },
  };
  displayedColumns = [
    "name",
    "mobileNo",
    "regNo",
    "insurer",
    "premium",
    "paymentDate",
    "policyNo",
  ];

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: false })
  paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false })
  sort!: MatSort;

  constructor(
    public _posHomeService: PosHomeService,
    public _policyBoardService: PolicyServicingApiService,
    private _errorHandleService: ErrorHandleService,
    private _toastrService: ToastrService,
    private _fb: FormBuilder
  ) {
    this.dateForm = this._fb.group({
      fromDate: ["", Validators.required],
      toDate: ["", Validators.required],
    });
  }

  ngOnInit() {
    $("input").attr("autocomplete", "off");
    this.getHealthPolicyData();
    this.fieldListener();
  }

  get fromDate() {
    return this.dateForm.get("fromDate");
  }

  get toDate() {
    return this.dateForm.get("toDate");
  }

  public getHealthPolicyData() {
    this.loading = true;
    this._subscriptions.push(
      this._policyBoardService.policySearch(Indication.HEALTH).subscribe(
        (response) => {
          this.loading = false;
          console.log(response);
          this.successCode = response.successcode;
          if (this.successCode != "1") {
            this._toastrService.warning(response.msg);
            return;
          }

          this.policyAndPremiumStats = response.data.Table[0];
          this.policyHistoryData = response.data.Table1;

          // mapping table data
          this.createTableData(this.policyHistoryData);
        },
        (err: any) => {
          this.loading = false;
          this._errorHandleService.handleError(err);
        }
      ))
  }

  onValueChanges() {
    this.clearAllFilters = false;
    if (!this.dataSource) return;
    this.dataSource.filter = JSON.stringify(this.filterValues);
    this.noResults$.next(this.dataSource.filteredData.length === 0);
  }

  private fieldListener() {
    this.nameFilter.valueChanges.subscribe((name) => {
      this.filterValues.name = name;
      this.onValueChanges();
    });
    this.policyNoFilter.valueChanges.subscribe((policyNo) => {
      this.filterValues.policyNo = policyNo;
      this.onValueChanges();
    });
    this.fromDate!.valueChanges.subscribe((fromDate) => {
      this.filterValues.date.fromDate = fromDate;
      this.onValueChanges();
    });
    this.toDate!.valueChanges.subscribe((toDate) => {
      this.filterValues.date.toDate = toDate;
      this.onValueChanges();
    });
  }

  private createFilter(): (contact: IPolicyRecord, filter: string) => boolean {
    let filterFunction = function (policyData: IPolicyRecord, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      let searchByName = searchTerms.name.toUpperCase();
      let searchByPolicy = searchTerms.policyNo.toUpperCase();
      let searchFromDate = searchTerms.date.fromDate;
      let searchToDate = searchTerms.date.toDate;
      let policyDatapolicyNo = policyData.policyNo ? policyData.policyNo : "";

      if (searchFromDate === "" || searchToDate === "") {
        return (
          policyData.name.includes(searchByName) &&
          policyDatapolicyNo.includes(searchByPolicy)
        );
      }

      searchFromDate = new Date(searchFromDate);
      searchToDate = new Date(searchToDate);
      let actualPolicyDataDate = new Date(policyData.paymentDate);

      return (
        policyData.name.includes(searchByName) &&
        policyDatapolicyNo.includes(searchByPolicy) &&
        actualPolicyDataDate >= searchFromDate &&
        actualPolicyDataDate <= searchToDate
      );
    };

    return filterFunction;
  }

  clearFilter() {
    this.policyNoFilter.setValue("");
    this.nameFilter.setValue("");
    this.VehicleNoFilter.setValue("");
    this.fromDate!.setValue("");
    this.toDate!.setValue("");
    this.clearAllFilters = true;
  }

  filterByDate() {
    if (this.dateForm.invalid) {
      this.errorMessage = " Please fill both the fields with valid date format";
      return;
    }
    this.errorMessage = "";

    // converting dates to workable format
    let fromDate = this.fromDate!.value.toDate();
    let toDate = this.toDate!.value.toDate();

    console.log(fromDate, typeof fromDate);

    this.filterValues.date.fromDate = fromDate;
    this.filterValues.date.toDate = toDate;

    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  // Material table data
  createTableData(policyHistoryArray: any) {
    let tableData: IPolicyRecord[] = [];

    //  inserting dynamic data -->
    policyHistoryArray.forEach((policyData: any) => {
      let paymentDate = policyData.TransactionDate;

      if (isNaN(Date.parse(paymentDate))) {
        paymentDate = paymentDate.replace("PM", "").replace("AM", "");
      }

      tableData.push(
        new IPolicyRecord(
          `${policyData.PropGenderTitle} 
          ${policyData.PropFirstName} 
          ${policyData.PropLastName}`,
          policyData.MobileNo,
          policyData.RegistrationNo,
          policyData.CompanyName,
          policyData.PremiumPerYr,
          paymentDate,
          policyData.PolicyNumber
        )
      );
    });

    this.dataSource = new MatTableDataSource(tableData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.createFilter();
    this.clearFilter();
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}

