import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-term-insurance',
  templateUrl: './term-insurance.component.html',
  styleUrls: ['./term-insurance.component.css']
})
export class TermInsuranceComponent implements OnInit {

  modelpopup: any = true;
  Smoke: any = true;
  annual_income: any = false;
  occupation: any = false;
  termplan = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  constructor() { }

  ngOnInit() {
  }

  Smokes() {
    this.Smoke = true;
    this.annual_income = false;
    this.occupation = false;
  }

  annual_incomes() {
    this.Smoke = false;
    this.annual_income = true;
    this.occupation = false;
  }

  occupations() {
    this.Smoke = false;
    this.annual_income = false;
    this.occupation = true;
  }
  AllPlan() {
    this.modelpopup = false;
  }


}
