import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'app-full-loader',
    template: `
<div *ngIf="display">
        <div class="HBLoader" >
            <img src="../../../assets/img/NEWHB.gif" />
        </div>
        </div>
`,
    styleUrls: ['./loader.css']
})
export class LoaderComponent {
    @Input() display!: boolean | null;

}


