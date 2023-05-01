import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
// var parseString = require('xml2js').parseString;
// import { parseString,Parser } from 'xml2js';
// import { NgxXml2jsonService } from "ngx-xml2json";
import { vehicleUrl } from "src/app/models/constants";

@Injectable()
export class OtherApiService {
  constructor(
    private http: HttpClient,
    // private ngxXml2jsonService: NgxXml2jsonService
  ) { }

  public getVehicleInfo(bikeId: string): Observable<any> {
    return this.http.get(vehicleUrl(bikeId), { responseType: "text" }).pipe(
      // tap(
      //     data => this.log(data),
      //   // error => this.handleError
      // ),
      map((data) => this.convertToJson(data))
    );
  }

  private convertToJson(res: string) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(res, "text/xml");
    // return this.ngxXml2jsonService.xmlToJson(xml);
  }
}
