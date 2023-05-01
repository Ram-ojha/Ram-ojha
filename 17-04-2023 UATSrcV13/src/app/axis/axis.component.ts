import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-axis',
  templateUrl: './axis.component.html',
  styleUrls: ['./axis.component.css']
})
export class AxisComponent implements OnInit {

  constructor(private http: HttpClient) { }

  apiUrl: string = "http://20.193.137.244/HamaraBimaAPIUAT/api/AxixBankIMPSFundsTransfer/PostPaymentToPosAccount"
  showMessage!: string;
  ngOnInit() {
  }

  callAxisApi() {
    this.http.post(this.apiUrl, {}).subscribe((data: any) => this.showMessage = data['msg'], (err) => console.log(err)
    );
  }
}
