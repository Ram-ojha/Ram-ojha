import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { BikeInsuranceComponent } from './bike-insurance.component';
import { CommonModule } from "@angular/common";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { OtherApiService } from "../services/other-api.service";
import { BimaMaterialModule } from "src/app/shared/bima-material.module";
import { BikePlansComponent } from "./bike-plans/bike-plans.component";
import { BuyPlanComponent } from "./buyplan/buyplan.component";
import { ReviewPayComponent } from "./review-pay/review-pay.component";
import { PosShellComponent } from "../../shared/pos-shell/pos-shell.component";
import { PosCoreModule } from "src/app/shared/pos-core.module";
import { SharedModule } from "src/app/shared/shared.module";
import { VehicleBuyPlanService } from "../services/vehicle-buyplan.service";
import { AuthGuard } from "src/app/shared/guards/auth.gaurd";
import { PageNotFoundComponent } from "src/app/page-not-found/page-not-found.component";
import { Page404Component } from "src/app/shared/page-404/page-404.component";
import { BuyInsuranceGuard } from "src/app/shared/guards/buy-insurance.gaurd";
// import { BikePaymentComponent } from "./bike-payment/bike-payment.component";
import { PaymentErrorComponent } from "src/app/shared/payment-error/payment-error.component";
import { BuyplanSbiComponent } from './Company_wise_buyplan/buyplan-sbi/buyplan-sbi.component';
import { BuyplanBajajComponent } from './Company_wise_buyplan/buyplan-bajaj/buyplan-bajaj.component';


import { BuyplanIffcotokioComponent } from './Company_wise_buyplan/buyplan-iffcotokio/buyplan-iffcotokio.component';
import { BuyplanUniversalShampooComponent } from './Company_wise_buyplan/buyplan-universal-shampoo/buyplan-universal-shampoo.component';
import { BuyplanGoDigitComponent } from './Company_wise_buyplan/buyplan-go-digit/buyplan-go-digit.component';
import { CkycDetailsComponent } from "../ckyc-details/ckyc-details.component";



@NgModule({
  declarations: [
    // BikeInsuranceComponent,
    BikePlansComponent,
    BuyPlanComponent,
    ReviewPayComponent,
    BuyplanSbiComponent,
    BuyplanBajajComponent,
    BuyplanIffcotokioComponent,
    BuyplanUniversalShampooComponent,
    BuyplanGoDigitComponent,
    // BikePaymentComponent,
  ],
  imports: [
    CommonModule,
    BimaMaterialModule,
    MatSlideToggleModule, //need
    // BrowserAnimationsModule,
    PosCoreModule,
    SharedModule,
    RouterModule.forChild([
      {
        // path: '', component: BikeInsuranceComponent, children: [
        path: "",
        component: PosShellComponent,
        children: [
          { path: "", redirectTo: "best-plans", pathMatch: "full" },
          {
            path: "best-plans/:a_id/:odp",
            component: BikePlansComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan/:a_id/:odp",
            component: BuyPlanComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-Sbi/:a_id/:odp",
            component: BuyplanSbiComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-Bajaj/:a_id/:odp",
            component: BuyplanBajajComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-IffcoTokio/:a_id/:odp",
            component: BuyplanIffcotokioComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-UniversalShampoo/:a_id/:odp",
            component: BuyplanUniversalShampooComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-GoDigit/:a_id/:odp",
            component: BuyplanGoDigitComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "CkycDetails/:a_id/:odp",
            component: CkycDetailsComponent,
            canActivate: [BuyInsuranceGuard],
          },

          // {buyplan-GoDigit
          //   path: "bike-payment/:key/:urlParams",
          //   component: BikePaymentComponent,
          //   canActivate: [BuyInsuranceGuard],
          // },
          //   {
          //     path: "bike-payment/:key/:urlParams",
          //     component: BikePaymentComponent,
          //   },
          {
            path: "bike-payment-error",
            component: PaymentErrorComponent,
            canActivate: [BuyInsuranceGuard],
          },
          { path: "**", component: Page404Component },
        ],
        canActivate: [AuthGuard],
      },
    ]),
  ],
  exports: [],
  providers: [VehicleBuyPlanService, BuyInsuranceGuard],
})
export class BikeInsuanceModule { }
