import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BimaMaterialModule } from 'src/app/shared/bima-material.module';
import { CarPlansComponent } from './car-plans/car-plans.component';
import { BuyplanComponent } from './buyplan/buyplan.component';
import { ReviewPayComponent } from './review-pay/review-pay.component';
import { PosShellComponent } from '../../shared/pos-shell/pos-shell.component';
import { PosCoreModule } from 'src/app/shared/pos-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { VehicleBuyPlanService } from '../services/vehicle-buyplan.service';
import { Page404Component } from 'src/app/shared/page-404/page-404.component';
import { AuthGuard } from 'src/app/shared/guards/auth.gaurd';
import { BuyInsuranceGuard } from 'src/app/shared/guards/buy-insurance.gaurd';
import { PaymentErrorComponent } from 'src/app/shared/payment-error/payment-error.component';
import { CarPaymentComponent } from './car-payment/car-payment.component';
import { carBreakinCaseComponent } from './car-breakin-case/car-breakin-case.component';
import { CkycDetailsComponent } from '../ckyc-details/ckyc-details.component';

@NgModule({
  declarations: [
    CarPlansComponent,
    BuyplanComponent,
    ReviewPayComponent,
    CarPaymentComponent,
    carBreakinCaseComponent,


  ],
  imports: [
    CommonModule,
    BimaMaterialModule,
    PosCoreModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '', component: PosShellComponent, children: [
          { path: 'best-plans/:a_id/:odp', component: CarPlansComponent, canActivate: [BuyInsuranceGuard] },
          {
            path: 'buyplan/:a_id/:odp',
            component: BuyplanComponent,
            canActivate: [BuyInsuranceGuard]
          },

          { path: 'car-payment/:key', component: CarPaymentComponent, canActivate: [BuyInsuranceGuard] },
          // { path: 'review-and-pay', component: ReviewPayComponent, canActivate: [BuyInsuranceGuard] },
          { path: 'car-breakin-case/:a_id/:odp', component: carBreakinCaseComponent, canActivate: [BuyInsuranceGuard] },
          { path: 'car-payment-error', component: PaymentErrorComponent, canActivate: [BuyInsuranceGuard] },
          {
            path: "CkycDetails/:a_id/:odp",
            component: CkycDetailsComponent,
            canActivate: [BuyInsuranceGuard],
          },
          { path: '**', component: Page404Component }
        ], canActivate: [AuthGuard]
      }

    ]),
  ],
  exports: [],
  providers: [VehicleBuyPlanService, BuyInsuranceGuard]
})
export class CarInsuanceModule { }
