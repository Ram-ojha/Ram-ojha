import { Injectable, OnDestroy } from "@angular/core";
import {
  CanActivate,
  Router,
  ActivatedRoute,
  CanActivateChild,
} from "@angular/router";
import { Observable, Subscription } from "rxjs";

@Injectable()
export class BuyInsuranceGuard implements CanActivate, OnDestroy {
  private _subscriptions: any = [];
  constructor(private _router: Router, private _route: ActivatedRoute) { }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {

    this._subscriptions.push(
      this._route.queryParamMap.subscribe((p: any) => {
        const AppNo = +p.get("a_id");
        const AppNoOdp = +p.get("odp");
        if (isNaN(AppNo) || AppNo < 1 || isNaN(AppNoOdp) || AppNoOdp < 1) {
          //this._router.navigate(['/pos']);
          return false;
        }
        return true;
      }))

    return true;
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
