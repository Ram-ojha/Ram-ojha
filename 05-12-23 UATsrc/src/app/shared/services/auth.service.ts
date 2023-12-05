import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import * as Global from "src/app/models/constants";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { ApiResponse } from "src/app/models/api.model";
import { Router } from "@angular/router";
import { encrypt } from "src/app/models/common-functions";

@Injectable({
  providedIn: "root",
})

export class AuthService {
  // private currentUserSubject: BehaviorSubject<any>;
  // public currentUser: Observable<any>;
  // public token: string = '';

  auth_httpOptions = {
    headers: new HttpHeaders({
      content: "application/json",
      "content-type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache",
       
    }),
  };

  constructor(private _http: HttpClient, private _router: Router) {
    // this.tokenSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem('token')));
    // this.token = this.tokenSubject.asObservable();
    // this.token = sessionStorage.getItem('token');
  }

  public login(username: string, password: string): Observable<any> {
    // var data = "username=dilshad&password=Pos@1234&grant_type=password";
    const body = new HttpParams()
      .set("username", username)
      .set("password", password)
      .set("grant_type", "password");

    return this._http.post(Global.login, body, this.auth_httpOptions).pipe(
      tap((res: any) => {
        if (res) {
          if (res.access_token) {
            // console.log(res['.expires'])
            this.setToken(res.access_token, res.token_type);
            sessionStorage.setItem("tokenInfo", JSON.stringify(res));
            this.autoLogout(res.expires_in * 1000);
            if (res.user_name)
              if (res.user_name != "" || res.user_name != null)
                sessionStorage.setItem("User Name", encrypt(res.user_name));
            sessionStorage.setItem("posMob", encrypt(username));
          }
        }
      })
    );
  }

  public setPassword(data: any): Observable<any> {
    return this._http.post(Global.setNewPassword, data, Global.httpOptions);
  }

  public sendOtp(data: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.generateOTP,
      data,
      Global.httpOptions
    );
  }
  
  private setToken(token: string, type: string) {
    sessionStorage.setItem("token", type + " " + token);
    // this.tokenSubject.next(data.token_type + ' ' + data.access_token);
  }

  public get isLoggedIn(): boolean {
    const token = sessionStorage.getItem("token");
    return token == "" || token == null ? false : true;
  }

  public logOut() {
    sessionStorage.clear();
    this._router.navigate(["/login"], { replaceUrl: true });
    // this.tokenSubject.next(null);
    //this.token = '';
  }

  autoLogout(expirationDuration: number) {
    setTimeout(() => {
      this.logOut();
    }, expirationDuration);
  }

  // mobileNo: string,generatedOTP:string
  public verifyOTP(data: any): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      Global.verifyOTP,
      data,
      Global.httpOptions
    );
  }


//franchise Code 
public Franchise_UserAuth(rmCode:any,posCode:any):Observable<ApiResponse>
{
  return this._http.get<ApiResponse>(Global.franchiseLogin + '?RMCode='+ rmCode +'&PosCode='+posCode)
}
}
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   httpOptions = {
//     headers: new HttpHeaders({
//       'content': "application/json",
//       'content-type': "application/x-www-form-urlencoded",
//       'cache-control': 'no-cache',
//     })
//   };

//   constructor(private _http: HttpClient) { }

//   public getToken(username: string, password: string): Observable<any> {

//     let body = new URLSearchParams();
//     body.set('username', username);
//     body.set('password', password);
//     body.set('grant_type', 'password');

//     return this._http.post(apiToken + 'token', body, this.httpOptions).pipe(
//       tap((newToken) => {
//         // sessionStorage.setItem('token': JSON.stringify({}))
//         console.log(newToken)
//       }),
//       catchError(this.handleError<any>('token'))
//     );
//   }

//   public getUserInfo(): Observable<any> {
//     return this._http.get(apiHost + 'CommonLogin/GetLogin');
//   }

//   private handleError<T>(operation = 'operation', result?: T) {
//     return (error: any): Observable<T> => {

//       // TODO: send the error to remote logging infrastructure
//       console.error(error); // log to console instead

//       // TODO: better job of transforming error for user consumption
//       this.log(`${operation} failed: ${error.message}`);

//       // Let the app keep running by returning an empty result.
//       return of(result as T);
//     };
//   }

//   /** Log a HeroService message with the MessageService */
//   private log(message: string) {
//     console.log(`api: ${message}`);
//   }

// }
