import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BimaMaterialModule } from 'src/app/shared/bima-material.module';
import { CvPlansComponent } from './cv-plans/cv-plans.component';
import { PosShellComponent } from 'src/app/shared/pos-shell/pos-shell.component';
import { PosCoreModule } from 'src/app/shared/pos-core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { VehicleBuyPlanService } from '../services/vehicle-buyplan.service';
import { Page404Component } from 'src/app/shared/page-404/page-404.component';
import { AuthGuard } from 'src/app/shared/guards/auth.gaurd';
import { BuyInsuranceGuard } from 'src/app/shared/guards/buy-insurance.gaurd';
import { BuyPlanComponent } from './buy-plan/buy-plan.component';
import { ReviewPayComponent } from './review-pay/review-pay.component';
import { CvPaymentComponent } from './cv-payment/cv-payment.component';
import { CkycDetailsComponent } from '../ckyc-details/ckyc-details.component';



@NgModule({
  declarations: [
    CvPlansComponent,
    BuyPlanComponent,
    ReviewPayComponent,
    CvPaymentComponent
  ],
  imports: [
    CommonModule,
    BimaMaterialModule,
    PosCoreModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '', component: PosShellComponent, children: [
          // { path: "", redirectTo: "best-plans", pathMatch: "full" },
          { path: 'best-plans/:a_id/:odp', component: CvPlansComponent, canActivate: [BuyInsuranceGuard] },
          { path: 'buyplan/:a_id/:odp', component: BuyPlanComponent, canActivate: [BuyInsuranceGuard] },
          { path: 'cv-payment/:key', component: CvPaymentComponent, canActivate: [BuyInsuranceGuard] },
          {
            path: "CkycDetails/:a_id/:odp",
            component: CkycDetailsComponent,
            canActivate: [BuyInsuranceGuard],
          },
          // // { path: 'review-and-pay', component: ReviewPayComponent, canActivate: [BuyInsuranceGuard] },
          // { path: 'car-breakin-case/:a_id/:odp', component: carBreakinCaseComponent, canActivate: [BuyInsuranceGuard] },
          // { path: 'car-payment-error', component: PaymentErrorComponent, canActivate: [BuyInsuranceGuard] },
          { path: '**', component: Page404Component }
        ], canActivate: [AuthGuard]
      }
    ]),
  ],
  providers: [VehicleBuyPlanService, BuyInsuranceGuard],
})
export class CvInsuranceModule { }
