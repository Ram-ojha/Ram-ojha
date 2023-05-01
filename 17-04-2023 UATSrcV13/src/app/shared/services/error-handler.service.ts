import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/models/api.model';
import { errorLogApi } from 'src/app/models/constants';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandleService {
    public errorMessage: string = '';

    constructor(public _toastService: ToastrService
        , private _authService: AuthService,
        private _http:HttpClient
    ) { }

    public sendErrorLog(errorLog:any): Observable<ApiResponse>{
        return this._http.post<ApiResponse>(errorLogApi,errorLog, {headers: { hideLoader: 'true' }} );
    }

    public handleError(error: HttpErrorResponse) {
        this._toastService.clear();
        if (error.status === 401) {
            this.handle401Error();
        }
        if (error.status === 500) {
            this.handle500Error(error);
        }
        else if (error.status === 404) {
            this.handle404Error(error)
        }
        else {
            this.handleOtherError(error);
        }
    }

    private handle401Error() {
        this._toastService.warning('session time out, Please Refresh or login again.', '', { positionClass: 'toast-top-full-width', timeOut: 5000 });
        this._authService.logOut();
    }
    private handle500Error(error: HttpErrorResponse) {
        this.createErrorMessage(error);
        this._toastService.error(this.errorMessage, '', { timeOut: 5000 });
        //this._router.navigate(['/500']);
    }

    private handle404Error(error: HttpErrorResponse) {
        this.createErrorMessage(error);
        this._toastService.error(this.errorMessage, error.statusText, { timeOut: 5000 });
        //this._router.navigate(['/404']);
    }

    private handleOtherError(error: HttpErrorResponse) {
        this.createErrorMessage(error);
        this._toastService.error(this.errorMessage, error.statusText, { timeOut: 5000 });
        //TODO: this will be fixed later;
        // setTimeout(() => {
        //     if (confirm('Are you want to logout and relogin again to fix it.')) {
        //         this._authService.logOut();
        //     }
        // }, 300);
    }

    private createErrorMessage(error: HttpErrorResponse) {
        this.errorMessage = error.error ? error.error.Message ? error.error.Message : error.message : error.statusText;
    }
}
