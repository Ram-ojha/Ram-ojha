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
import { ToastrService } from "ngx-toastr";
import { of, Subject, throwError } from "rxjs";
import { catchError, pluck, switchMap, tap } from "rxjs/operators";
import {
  IPolicyAndPremiumStats,
  IPolicyRecord,
} from "src/app/models/common.Model";
import { Indication } from "src/app/models/insurance.enum";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { PolicyServicingApiService } from "../../services/pos-policy-servicing.service";

@Component({
  selector: "app-car-policy",
  templateUrl: "./car-policy.component.html",
  styleUrls: ["./car-policy.component.css"],
})
export class CarPolicyComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];

  dateForm: FormGroup;
  successCode!: string;
  showLoader: boolean = false;
  successCodeForPendingPayment!: string;
  errorMessage!: string;
  policyAndPremiumStats!: IPolicyAndPremiumStats;
  policyHistoryData!: IPolicyRecord[];
  paymentPendingData!: IPolicyRecord[];
  nameFilter = new FormControl("");
  policyNoFilter = new FormControl("");
  VehicleNoFilter = new FormControl("");
  loading!: boolean;
  clearAllFilters: boolean = true;
  filterValues: any = {
    name: "",
    policyNo: "",
    vehicleNo: "",
    date: {
      fromDate: "",
      toDate: "",
    },
  };
  displayedColumnsForVehicles = [
    "sno",
    "regNo",
    "paymentDate",
    "insurer",
    "name",
    "mobileNo",

    "vehicleNo",
    "premium",

    "policyNo",
    "InpectionCheckStarus",
    "CommisionAmt",
    "DownloadLinkURL",
  ];
  columns = [
    { colId: "sno", colName: "S.NO." },
    { colId: "regNo", colName: "Reg No." },
    { colId: "paymentDate", colName: "Registration Date" },
    { colId: "insurer", colName: "Insurer" },
    { colId: "name", colName: "Name" },
    { colId: "mobileNo", colName: "Mobile No." },
    { colId: "vehicleNo", colName: "Vehicle No." },
    { colId: "policyNo", colName: "Policy No." },
    { colId: "premium", colName: "Premium" },
    { colId: "InpectionCheckStarus", colName: "Break-In Status" },
    { colId: "CommisionAmt", colName: "Commission" },
    { colId: "DownloadLinkURL", colName: "DownloadLinkURL" },
  ];
  // columns = [
  //   "name",
  //   "mobileNo",
  //   "regNo",
  //   "insurer",
  //   "premium",
  //   "paymentDate",
  //   "policyNo",
  //   "vehicleNo",
  // ];
  displayedColumns = this.columns.map((col) => col.colId).concat(["actions"]);

  noResults$ = new Subject<boolean>();

  dataSource!: MatTableDataSource<any>;
  dataSourceForPendingPaymentData!: MatTableDataSource<any>;

  @ViewChild("paymentDonePaginator", { read: MatPaginator, static: false })
  paymentDonePaginator!: MatPaginator;
  @ViewChild("paymentPendingPaginator", { read: MatPaginator, static: false })
  paymentPendingPaginator!: MatPaginator;
  @ViewChild("paymentDoneSort", { static: false })
  paymentDoneSort!: MatSort;
  @ViewChild("paymentPendingSort", { static: false })
  paymentPendingSort!: MatSort;
  inspectionStatus: any;
  ics!: boolean;
  registrationNo!: boolean;

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
    this.getCarPolicyData();
    this.getCarPendingPaymentData();
    this.fieldListener();
  }

  get fromDate() {
    return this.dateForm.get("fromDate");
  }

  get toDate() {
    return this.dateForm.get("toDate");
  }

  public getCarPolicyData() {
    this.loading = true;
    this._subscriptions.push(
      this._policyBoardService.policySearch(Indication.CAR).subscribe(
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
          const tableData = this.createTableData(this.policyHistoryData);
          this.dataSource = new MatTableDataSource(tableData);
          this.dataSource.paginator = this.paymentDonePaginator;
          this.dataSource.sort = this.paymentDoneSort;
          this.dataSource.filterPredicate = this.createFilter();
          this.clearFilter();
        },
        (err: any) => {
          this.loading = false;
          this._errorHandleService.handleError(err);
        }
      ))
  }

  getCarPendingPaymentData() {
    this.loading = true;
    this._subscriptions.push(
      this._policyBoardService
        .policySearch(Indication.CAR_PAYMENT_PENDING)
        .subscribe(
          (response) => {
            this.loading = false;
            console.log(response);
            // return;
            this.successCodeForPendingPayment = response.successcode;
            if (response.successcode != "1") {
              this._toastrService.warning(response.msg);
              return;
            }

            // this.policyAndPremiumStats = response.data.Table[0];
            this.paymentPendingData = response.data.Table1;

            // mapping table data
            const tableData = this.createTableData(this.paymentPendingData);

            this.dataSourceForPendingPaymentData = new MatTableDataSource(
              tableData
            );
            this.dataSourceForPendingPaymentData.paginator =
              this.paymentPendingPaginator;
            this.dataSourceForPendingPaymentData.sort = this.paymentPendingSort;
            //  this.dataSourceForPendingPaymentData.filterPredicate = this.createFilter();
            this.clearFilter();
          },
          (err: any) => {
            this.loading = false;
            this._errorHandleService.handleError(err);
          }
        ))
  }

  onCheckStatus(regNo: any) {
    console.log(regNo);
    // 
    this.showLoader = true;
    this.inspectionStatus = "";
    this._subscriptions.push(
      this._policyBoardService.getPolicyCheckStatus(regNo).subscribe((res) => {
        console.log(res);
        this.inspectionStatus = res.data[0].InpectionCheckStarus;
        this.registrationNo = res.data[0].RegistrationNo;
        this.showLoader = false;
      }));

    ($("#checkStatusOfPayment") as any).modal("show");
  }

  onMakePayment(regNo: any) {
    console.log(regNo);
    this._subscriptions.push(
      this._policyBoardService.getPaymentDone(regNo).subscribe((res) => {
        console.log(res);


        this.newPostForm(res.msg, res.data);
      }))
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
    this.VehicleNoFilter.valueChanges.subscribe((vehicleNo) => {
      this.filterValues.vehicleNo = vehicleNo;
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
    let filterFunction = function (policyData: IPolicyRecord, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let searchByName = searchTerms.name.toUpperCase();
      let searchByPolicy = searchTerms.policyNo.toUpperCase();
      let vehicleNo = searchTerms.vehicleNo.toUpperCase();
      let searchFromDate = searchTerms.date.fromDate;
      let searchToDate = searchTerms.date.toDate;
      let policyDatapolicyNo = policyData.policyNo ? policyData.policyNo : "";
      let policyDataVehicleNo = policyData.vehicleNo
        ? policyData.vehicleNo
        : "";

      if (searchFromDate === "" || searchToDate === "") {
        return (
          policyData.name.includes(searchByName) &&
          policyDatapolicyNo.includes(searchByPolicy) &&
          policyDataVehicleNo.includes(vehicleNo)
        );
      }

      searchFromDate = new Date(searchFromDate);
      searchToDate = new Date(searchToDate);
      let actualPolicyDataDate = new Date(policyData.paymentDate);

      return (
        policyData.name.includes(searchByName) &&
        policyDatapolicyNo.includes(searchByPolicy) &&
        policyDataVehicleNo.includes(vehicleNo) &&
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

  private newPostForm(path: string, formData: string) {

    let method = "post";
    let form = document.createElement("form");
    form.setAttribute("name", "XML_DATA");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.innerHTML = formData;
    document.body.appendChild(form);
    form.submit();
  }
  // Material table data
  createTableData(policyHistoryArray: any) {
    let tableData: IPolicyRecord[] = [];

    //  inserting dynamic data -->
    policyHistoryArray.forEach((policyData: any) => {
      tableData.push(
        new IPolicyRecord(
          policyData.VechileOwnerName,
          policyData.MobileNo,
          policyData.RegistrationNo,
          policyData.InsuranceCompDesc,
          policyData.PoicyTotalAmount,
          policyData.RegistrationDate,
          policyData.PolicyNo,
          policyData.VechileRegNo,
          policyData.DownloadLinkURL,
          policyData.CommisionAmt,
          policyData.InpectionCheckStarus
        )
      );
    });

    return tableData;
  }

  downloadPdf(source: string, filename: string) {
    // const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.target = "_blank";
    link.download = filename || "policy.pdf";
    link.click();
  }

  viewPdf(rowData: any) {
    // searching companyCode in main policyData
    let selectedPolicyData: any = this.policyHistoryData.find(
      (data: any) => data["RegistrationNo"] === rowData.regNo
    );

    let companyCode = selectedPolicyData["InsuranceCompCode"];

    if (companyCode == 2) {
      // 2 = Future Generali
      this.getPdfFromApi(rowData.DownloadLinkURL, selectedPolicyData["PolicyNo"]);


      return;
    }
    //New India
    else if (companyCode == "12") {
      let pdfLinkUrl = rowData.DownloadLinkURL.split(",")
      for (let i = 0; i < pdfLinkUrl.length; i++) {
        this.downloadPdf(pdfLinkUrl[i], selectedPolicyData["PolicyNo"])
      }
    }
    else {

      this.downloadPdf(rowData.DownloadLinkURL, selectedPolicyData["PolicyNo"]);
    }
    // this.getPdfFromApi(rowData.DownloadLinkURL, selectedPolicyData["PolicyNo"]);
  }

  getPdfFromApi(url: string, policyPdfName: string) {
    this.loading = true;
    this._subscriptions.push(
      this._policyBoardService.getPolicyPdf(url).subscribe(
        (data) => {
          this.loading = false;
          console.log(data.data);
          // return;
          this.downloadPdf(data.data, policyPdfName);
        },
        (err: any) => {
          this.loading = false;
          this._errorHandleService.handleError(err);
          return throwError("");
        }
      ))
  }
  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
  // viewPdf(url) {
  //   
  //   return this._policyBoardService.getPolicyPdf(url).pipe(
  //     pluck("data"),
  //     tap((data) => console.log(data)),
  //     catchError((err: any) => {
  //       this.loading = false;
  //       this._errorHandleService.handleError(err);
  //       return throwError("");
  //     })
  //   );
  // }
}
