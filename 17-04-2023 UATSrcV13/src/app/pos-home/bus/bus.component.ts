import { OnInit, Component } from '@angular/core';



import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
    selector: 'bus',
    templateUrl: './bus.component.html',
    styleUrls: ['../pos-home.component.css']
})
export class BusComponent implements OnInit {

    car_Renew_Insorance: any = true;
    New_Car_insorance: any = false;
    Car_Number_insorance: any = false;
    Select_Car: any = false;
    Select_Bus: any = false;
    Which_RTO: any = false;

    all_policy: any = false;

    //Bus
    CNGKit: boolean = false;
    NewCNGKit: boolean = false;

    constructor(private _router: Router) { }
    ngOnInit(): void {

    }

    car_selection(id: any) {
        $(".bike_area").css("display", "none");
        $(".lds-ripple").css("display", "block");
        setTimeout(() => {
            $(".bike_area").css("display", "block");
            $(".lds-ripple").css("display", "none");
        }, 1000);

        if (id.value == "1") {
            this.car_Renew_Insorance = true;
            this.New_Car_insorance = false;
            this.Car_Number_insorance = false;
        }
        else if (id.value == "2") {
            this.car_Renew_Insorance = false;
            this.New_Car_insorance = true;
            this.Car_Number_insorance = false;
        }
    }
    // Select_my_bus() {
    //     this.Select_Bus = true;

    // }
    close() {
        $(".Select_Bike_Not_know_No").removeClass("Select_Bike1");
        $(".Select_Bike_No_Know").removeClass("Select_Bike1");
        this.Which_RTO = false;
        // this.Select_Bike = false;
        this.Select_Car = false;
        this.Select_Bus = false;
        $(".Select_Car_No_Know").removeClass("Select_Bike1");
    }
    // Bus property
    FuelType(fuel: { value: number; }) {
        if (fuel.value == 4) {
            this.CNGKit = true;
        }
        else {
            this.CNGKit = false;
        }
    }

    NewFuelType(newfuel: { value: number; }) {
        if (newfuel.value == 4) {
            this.NewCNGKit = true;
        }
        else {
            this.NewCNGKit = false;
        }
    }

    busplan() {
        this._router.navigate(['/pos/bus'])
    }

}