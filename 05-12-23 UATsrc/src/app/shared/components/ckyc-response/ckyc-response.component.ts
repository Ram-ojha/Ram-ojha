import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ckyc-response',
  templateUrl: './ckyc-response.component.html',
  styleUrls: ['./ckyc-response.component.css']
})
export class CkycResponseComponent implements OnInit {

  currentUrl: string = ''
  constructor() { }

  ngOnInit(): void {
    debugger
    if (location.protocol == 'https:') {
      // location.href = location.href.replace(/^https:/, 'http:')
      // location.reload();
      let x = location.href.replace(/^https:/, 'http:')
      window.open(x, "_self");
    }
    this.currentUrl = sessionStorage.getItem("currentUrl")!;
  }
  CloseTap() {
    window.location.href = this.currentUrl;
    window.close();
  }
}
