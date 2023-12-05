import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { Subscription } from "rxjs";
import { IInsuranceType } from "src/app/models/common.Model";
import { PosHomeService } from "src/app/pos-home/services/pos-home.service";
import { PosHeaderComponent } from "../pos-header/pos-header.component";
import { ErrorHandleService } from "../services/error-handler.service";

@Component({
  selector: "app-pos-shell",
  templateUrl: "./pos-shell.component.html",
  styleUrls: ["./pos-shell.component.css"],
})
export class PosShellComponent implements OnInit, OnDestroy {
  //nirmal code add
  navLinks: IInsuranceType[] = [];
  private _subscriptions: any = [];
  //navLinks: any[] = [];

  constructor(
    public _posHomeService: PosHomeService,
    private _errorHandleService: ErrorHandleService
  ) { }
  sideBar: boolean = false;
  ngOnInit() {

    // if (this._posHomeService.InsuranceTypeList)
    //   this.navLinks = this._posHomeService.InsuranceTypeList;
    // else
    this.getSideMenu();
    this._subscriptions.push(
      this._posHomeService.listenTosideBar.subscribe((listen) => {
        this.sideBar = listen;
        console.log(this.sideBar);
      }))
  }

  private getSideMenu() {
    this._subscriptions.push(
      this._posHomeService.insuranceTypeMenu.subscribe(
        (result) => {
          if (result.successcode == "1") {
            this.navLinks = result.data;
          }
        },
        (err: any) => {
          this._errorHandleService.handleError(err);
        }
      ))
  }

  public onMenuChange(insuranceCateCode: IInsuranceType) {
    if (insuranceCateCode) {
      sessionStorage.setItem(
        "insuranceType",
        JSON.stringify(insuranceCateCode)
      );
      if (sessionStorage.getItem("VehicleData")) {
        return sessionStorage.removeItem("VehicleData");
      }
      if (sessionStorage.getItem("CarData")) {
        return sessionStorage.removeItem("CarData");
      }
    } else return false;
  }
  // showMenu = false;
  // // hideShow = false;
  // onClickMenu(){
  //   // serviceList
  //   this.showMenu = true;
  // }
  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
