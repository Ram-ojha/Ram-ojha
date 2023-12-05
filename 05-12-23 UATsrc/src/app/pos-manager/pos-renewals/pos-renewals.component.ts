import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import * as moment from 'moment';
import { Subject } from 'rxjs';
import { ApiResponse } from 'src/app/models/api.model';
import { GetExpirePolicyInterface } from 'src/app/models/common.Model';
import { PosCertificateApiService } from '../services/pos-certificate-api.service';
import { PolicyServicingApiService } from '../services/pos-policy-servicing.service';
// import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { MatTableExporterDirective } from 'mat-table-exporter';
@Component({
  selector: 'app-pos-renewals',
  templateUrl: './pos-renewals.component.html',
  styleUrls: ['./pos-renewals.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PosRenewalsComponent implements OnInit {
  PolicyDateForm!: FormGroup;
  renewalsPolicy: GetExpirePolicyInterface[] = [];
  dataSource!: MatTableDataSource<GetExpirePolicyInterface>;
  noResults$ = new Subject<any>();
  successCode: any = "0";
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  // @ViewChild('table', { static: false }) table1: ElementRef;
  // @ViewChild('TABLE', { static: false }) table: ElementRef;
  @ViewChild('exporter', { static: false }) exporter!: MatTableExporterDirective
  displayedColumns = [
    'Name',
    'MobileNo',
    'InsuranceCateDesc',
    // 'SubCateDesc',
    "VehicleDetails",
    'VechileRegNo',
    'PolicyNo',
    "EntryDate",
    'PolicyExpiryDate'
    // 'PreviousPolicyExpDate',
    // 'PreviousPolicyStartDate',
    // 'TrnPolicyDate',
    // 'VehicleExpiryDesc'
  ];
  constructor(private _fb: FormBuilder,
    private posPolicyService: PolicyServicingApiService, private posCertificateApiService: PosCertificateApiService) { }

  ngOnInit() {
    this.PolicyDateForm = this._fb.group({
      from_Date: new FormControl(["", Validators.required]),
      to_Date: new FormControl(["", Validators.required])
    })
    var today = moment().add(-30, 'days');
    var laterDate = moment().add(30, 'days');//new Date(new Date().setDate(today.getDate() + 30));

    this.PolicyDateForm.patchValue({
      from_Date: today,
      to_Date: laterDate
    })
    this.getPolicyExpireDate();
  }
  applyFilter(filterTarget: any) {
    let filterValue = filterTarget.value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.noResults$.next(this.dataSource.filteredData.length === 0);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  getDateObject(dateString: any) {
    return new Date(dateString.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))
  }

  copyInputMessage(inputElement: any) {
    console.log(inputElement);

    // inputElement.select()
    document.queryCommandSupported('copy');
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.textMessageFunc('Text');
  }
  textMessage!: string;
  msgHideAndShow: boolean = false;
  textMessageFunc(msgText: string) {
    this.textMessage = msgText + " Copied to Clipboard";
    this.msgHideAndShow = true;
    setTimeout(() => {
      this.textMessage = "";
      this.msgHideAndShow = false;
    }, 1000);
  }

  exportAsXLSX(): void {
    // console.log(this.exporter.exportTable());

    var today = moment().format("DD-MM-YYYY")
    this.exporter.exportTable('xlsx', {
      fileName: today + 'PosExpiryPolicies'
    })
    // console.log(this.table);
    // console.log(this.table1);
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table1);
    // console.log(ws);

    // this.posCertificateApiService.exportAsExcelFile(this.dataSource.filteredData, 'PosExpiryPolicies');
  }


  getPolicyExpireDate() {
    let data = {
      "FromDate": this.PolicyDateForm.value.from_Date.toDate(),
      "ToDate": this.PolicyDateForm.value.to_Date.toDate()
    }
    this.posPolicyService.getPosExpiryPolicies(data).subscribe((res: ApiResponse) => {
      this.successCode = res.successcode;
      if (res.successcode == "1") {
        this.renewalsPolicy = res.data;
        this.dataSource = new MatTableDataSource<GetExpirePolicyInterface>(this.renewalsPolicy);

        this.noResults$.next(this.dataSource.filteredData.length === 0);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }

    }, (error: any) => {
      console.log(error);
    })
  }
}
