import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: './travel.component.html',
    styleUrls: ['../pos-home.component.css']
})
export class TravelComponent implements OnInit {

    StartDate = new Date();
    EndDate = new Date();
    duration: boolean = false;
    residents = false;
    medicalconditions = false;

    groupmember: string[] = ["", "", ""];
    member = false;

    allstudent: string[] = ["", "", ""];
    studentbtn = false;


    constructor(private _router: Router) { }
    ngOnInit(): void {

    }
    TravelStartEndDate(TravelStartDate: any) {
        if (TravelStartDate.value != "") {
            let SingleDate = TravelStartDate.value.split('/');
            let finaldate = new Date(SingleDate[2] + '/' + SingleDate[1] + '/' + SingleDate[0])
            this.EndDate = new Date(finaldate.getFullYear() + '/' + (finaldate.getMonth() + 1) + '/' + finaldate.getDate())
        }
    }
    TravellingMultiple(event: any) {
        if (event.value == 1) {
            this.duration = true;
        }
        else {
            this.duration = false;
        }
    }
    travellers(event: any) {
        if (event.value == 2) {
            this.residents = true;
        }
        else {
            this.residents = false;
        }
    }
    medical(event: any) {
        if (event.value == 2) {
            this.medicalconditions = true;
        }
        else {
            this.medicalconditions = false;
        }
    }
    TRAVELINSURANCE() {
        this._router.navigate(['/pos/travel']);
    }
    memeberadd() {
        if (this.groupmember.length <= 4) {
            this.groupmember.push("");
            if (this.groupmember.length == 5) {
                this.member = true;
            }
        }
    }
    studentadd() {
        if (this.allstudent.length <= 4) {
            this.allstudent.push("");
            if (this.allstudent.length == 5) {
                this.studentbtn = true;
            }
        }
    }


}