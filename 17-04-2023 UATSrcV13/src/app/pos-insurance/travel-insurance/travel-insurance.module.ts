import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { TravelInsuranceComponent } from './travel-insurance.component';
import { RouterModule } from '@angular/router';
import { BimaMaterialModule } from 'src/app/shared/bima-material.module';
import { TravelPlansComponent } from './travel-plans/travel-plans.component';
import { BuyplanComponent } from './buyplan/buyplan.component';
import { PosShellComponent } from '../../shared/pos-shell/pos-shell.component';
import { PosCoreModule } from 'src/app/shared/pos-core.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [TravelPlansComponent, BuyplanComponent],
  imports: [
    CommonModule,
    BimaMaterialModule,

    PosCoreModule,
    SharedModule,

    RouterModule.forChild([{
      path: '', component: PosShellComponent, children: [
        // { path: '', redirectTo: 'plans', pathMatch: 'full' },
        { path: '', component: TravelPlansComponent },
        { path: 'buyplan', component: BuyplanComponent },
        // { path: 'review-and-pay', component: ReviewPayComponent },

      ]
    }]),

  ]
})
export class TravelInsuranceModule { }
