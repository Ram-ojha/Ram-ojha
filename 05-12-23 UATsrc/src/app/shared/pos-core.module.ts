
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosShellComponent } from './pos-shell/pos-shell.component';
import { PosHeaderComponent } from './pos-header/pos-header.component';
import { PosFooterComponent } from './pos-footer/pos-footer.component';
import { RouterModule } from '@angular/router';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as _moment from 'moment';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './services/token.intercepter';
import { AuthGuard } from './guards/auth.gaurd';
const My_Formate = {
    parse: {
        dateInput: ['DD/MM/YYYY', 'D/M/YY'],
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
}

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        // BimaMaterialModule,
        MatMenuModule,
        MatIconModule
    ],
    exports: [
        // BimaMaterialModule,
        PosHeaderComponent,
        PosFooterComponent,
    ],
    declarations: [
        PosShellComponent,
        PosHeaderComponent,
        PosFooterComponent,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE]
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: My_Formate
        },
        AuthGuard
    ]
})
// export class SharedModule { } //old
export class PosCoreModule { }
