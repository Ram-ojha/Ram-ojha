import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-page-404',
    template: `
   <div id="notfound">
		<div class="notfound">
			<div class="notfound-404" style="background: url('~/assets/img/bg404.jpg') no-repeat;">
				<h1>Oops!</h1>
			</div>
			<h2>404 - Page not found</h2>
			<p>The page you are looking for might have been removed had its name changed or is temporarily unavailable.</p>
			<a (click)="goBack()">Take a step back</a>
		</div>
	</div>
  `,
    styleUrls: ['./page-404.component.css']
})
export class Page404Component implements OnInit {

    constructor(private _location: Location) { }

    ngOnInit() {
        console.log(this._location)
    }
    public goBack(): void {
        this._location.back();
    }

}
