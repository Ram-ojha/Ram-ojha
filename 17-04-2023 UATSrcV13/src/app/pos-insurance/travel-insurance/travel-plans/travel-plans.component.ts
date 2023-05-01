import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './travel-plans.component.html',
  styleUrls: ['./travel-plans.component.css']
})
export class TravelPlansComponent implements OnInit {


  constructor(private _Router: Router
    , private _route: ActivatedRoute) { }
  allplan = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  ngOnInit() {
  }

  traveldetails() {
    this._Router.navigate(['buyplan'], { relativeTo: this._route });
  }


}
