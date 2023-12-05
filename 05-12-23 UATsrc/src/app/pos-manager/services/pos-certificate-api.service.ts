import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as Global from "src/app/models/constants";
import { Observable } from "rxjs";
import { ApiResponse } from "src/app/models/api.model";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as moment from "moment";


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable()
export class PosCertificateApiService {
  constructor(private _http: HttpClient) { }


  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const myworkbook: XLSX.WorkBook = { Sheets: { 'data': myworksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(myworkbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    var today = moment().format("DD-MM-YYYY")
    FileSaver.saveAs(data, today + fileName + '_exported' + EXCEL_EXTENSION);
  }

  public GetPOSCertificate(): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.GetPOSCertificate,
      Global.httpOptions
    );
  }
  public DownloadPOSCertificate(): Observable<ApiResponse> {
    return this._http.get<ApiResponse>(
      Global.DownloadPOSCertificate,
      Global.httpOptions
    );
  }

}
