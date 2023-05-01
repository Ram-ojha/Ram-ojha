import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  templateUrl: './buyplan.component.html',
  styleUrls: ['./buyplan.component.css']
})
export class BuyplanComponent implements OnInit {

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ''
    });
  }

}
