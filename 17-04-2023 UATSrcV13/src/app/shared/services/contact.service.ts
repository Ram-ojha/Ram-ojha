import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api.model";
import * as Global from "../../models/constants";
import { Injectable } from "@angular/core";

@Injectable()
export class ContactService {
  constructor(private _http: HttpClient) {}

  public saveContact(
    name: string,
    email: string,
    subject: string,
    msg: string
  ): Observable<ApiResponse> {
    const body = {
      FullName: name,
      EmailId: email,
      Subject: subject,
      Message: msg,
    };
    return this._http.post<ApiResponse>(
      Global.saveContact,
      body,
      Global.httpOptions
    );
  }
}
