
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable } from "@angular/core"
import { Observable, of } from "rxjs";
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    // public currentUser: Observable<ApiResponse>;

    constructor(private _authService: AuthService, private _router: Router) { }

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {

        if (this._authService.isLoggedIn) {
            const token: any = sessionStorage.getItem('token');
            if (!token) {
                this._authService.logOut();
            }
            req = req.clone({
                setHeaders: {
                    Authorization: token
                }
            });

            return next.handle(req);
        } else {
            this._authService.logOut();
            return of();
        }
        //     .pipe(
        //     tap((evt: HttpEvent<any>) => {
        //         if (evt instanceof HttpResponse) {
        //             // if (evt.body && evt.body.success)
        //             //     alert('success');
        //         }
        //         return of(event);
        //     }),
        //     // catchError((err: any) => {
        //     //     if (err instanceof HttpErrorResponse) {
        //     //         if (err.status === 401) {
        //     //             this.handle401Error(err)
        //     //         }
        //     //     }
        //     //     return of(err);
        //     // })
        // );

    }
}