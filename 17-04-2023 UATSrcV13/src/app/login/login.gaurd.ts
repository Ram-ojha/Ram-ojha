import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(private _authService: AuthService, private _router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const isLogedIn = this._authService.isLoggedIn;
        if (isLogedIn) {
            sessionStorage.removeItem('insuranceType');
            this._router.navigate(['/pos'])
            return false;
        }
        return true;

    }
}