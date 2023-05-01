
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'pos-footer',
    templateUrl: './pos-footer.component.html',
    styles: [`#footer {
    background: #083b66;
    padding: 0 0 5px 0;
    font-size: 14px;
    float: left;
    left: 0px;
    right: 0px;
    width: 100%;
    bottom: 0px;
    position: fixed;
    z-index: 1;
}
  #footer .copyright {
    text-align: center;
    padding-top: 5px;
}`]
})
export class PosFooterComponent implements OnInit {
    constructor() { }
    ngOnInit() { }
}
