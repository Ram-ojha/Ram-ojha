import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';

@Component({
  templateUrl: './bus-insurance.component.html',
  styleUrls: ['./bus-insurance.component.css']
})
export class BusInsuranceComponent implements OnInit {

  animal!: string;
  name!: string;
  value!: string;
  viewValue!: string;
  color = 'accent';
  //toppings = new FormControl();
  selectedIndex = 0;
  toppingList: string[] = ['1 Year', '2 Year', '3 Year', '4 Year', '5 Year'];
  toppingLister: string[] = ['Invoice Cover', '24x7 Roadside Assistance', 'Engine Protector', 'NCB Protection', 'Consumable', 'Key and Lock Replacement', 'Personal Accident Cover', 'Driver Cover', 'Passenger Cover', 'Accessories'];
  constructor(private _Router: Router) { }

  ngOnInit() {
    $("#loader").css("display", "block");
    setTimeout(() => {
      $("#loader").css("display", "none");
    }, 1000);

  }




  popup_lowest() {
    alert("dsds dsds");
  }

  selectTab(index: number): void {
    this.selectedIndex = index;
  }

}
