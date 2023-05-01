import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _authService: AuthService) { }

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        const isLogedIn = this._authService.isLoggedIn;
        if (!isLogedIn) {
            // this._router.navigate(['/login']);
            this._authService.logOut();
            return false;
        }
        return true;
    }
}


