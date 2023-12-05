import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { decrypt } from "src/app/models/common-functions";
import { Subscription } from "rxjs";

@Component({
  selector: "pos-header",
  templateUrl: "./pos-header.component.html",
  styleUrls: ["./pos-header.component.css"],
})
export class PosHeaderComponent implements OnInit, OnDestroy {
  @Output() listenSidebar: EventEmitter<boolean> = new EventEmitter<boolean>();
  // navLinks: IInsuranceType[] = [];
  UserName!: string;
  sideBar: boolean = false;
  private _subscriptions: any = []
  constructor(
    public _posHomeService: PosHomeService,
    public _authService: AuthService,
    private _router: Router
  ) { }

  ngOnInit() {
    if (sessionStorage.getItem("User Name"))
      this.UserName = decrypt(sessionStorage.getItem("User Name")!);

    // $("#sideBarOpen").click(function(){
    //     $("#icon").toggleClass('fa-times')
    //     $("#icon").toggleClass('fa-indent')
    // });
    this._subscriptions.push(
      this._posHomeService.listenTosideBar.subscribe((listen) => {
        this.sideBar = listen;
      }))
  }
  public onLogoClick() {
    let sesData = JSON.parse(sessionStorage.getItem("insuranceType")!);
    if (sesData) this._router.navigate([`pos/${sesData.RouteUrl}`]);
    else this._router.navigate([`pos/bike-insurance`]);
  }
  // public onMenuChange(insuranceCateCode: IInsuranceType) {
  //     if (insuranceCateCode){
  //       sessionStorage.setItem('insuranceType', JSON.stringify(insuranceCateCode));
  //       if (sessionStorage.getItem('VehicleData')) {
  //           sessionStorage.removeItem('VehicleData')
  //       }
  //       if (sessionStorage.getItem('CarData')) {
  //           sessionStorage.removeItem('CarData')
  //       }
  //     }else
  //       return false;
  // }

  onLogoutClick() {
    this._authService.logOut();
  }
  openSideBar() {

    if (this.sideBar) {
      this._posHomeService.listenTosideBar.next(false);
    } else this._posHomeService.listenTosideBar.next(true);
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
