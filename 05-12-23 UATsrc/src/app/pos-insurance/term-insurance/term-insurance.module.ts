import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TermInsuranceComponent } from './term-insurance.component';
import { RouterModule } from '@angular/router';
import { BimaMaterialModule } from 'src/app/shared/bima-material.module';
import { PosShellComponent } from 'src/app/shared/pos-shell/pos-shell.component';
import { PosCoreModule } from 'src/app/shared/pos-core.module';
import { AuthGuard } from 'src/app/shared/guards/auth.gaurd';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [TermInsuranceComponent],
  imports: [
    CommonModule,
    BimaMaterialModule,
    PosCoreModule,
    SharedModule,//need for passing authorization token
    RouterModule.forChild([
      {
        path: '', component: PosShellComponent, children: [
          { path: '', component: TermInsuranceComponent }
        ], canActivate: [AuthGuard]
      }
    ]),
  ]
})
export class TermInsuranceModule { }
