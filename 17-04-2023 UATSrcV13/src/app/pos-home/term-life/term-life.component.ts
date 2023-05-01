import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: './term-life.component.html',
    styleUrls: ['../pos-home.component.css']
})
export class TermLifeComponent implements OnInit {
    constructor(private _router: Router) { }
    ngOnInit(): void {

    }

    term_life() {
        this._router.navigate(['/pos/term']);
    }

}