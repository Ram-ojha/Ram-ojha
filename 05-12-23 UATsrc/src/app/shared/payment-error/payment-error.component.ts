import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'payment-error',
    templateUrl: './payment-error.component.html',
    styleUrls: ['./payment-error.component.css']
})

export class PaymentErrorComponent implements OnInit {

    errorMessage!: string;
    showLoader: boolean = false;

    constructor(private _location: Location) { }

    ngOnInit() {
        this.errorMessage = 'Error';
    }

    goBack() {
        this._location.back();
    }

}