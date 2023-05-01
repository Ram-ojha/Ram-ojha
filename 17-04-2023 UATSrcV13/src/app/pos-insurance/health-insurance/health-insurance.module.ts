import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouterModule } from "@angular/router";
import { BimaMaterialModule } from "src/app/shared/bima-material.module";
import { ReviewPayComponent } from "./review-pay/review-pay.component";
import { HealthPlansComponent } from "./health-plans/health-plans.component";
import { HealthPlanFeaturesDialog } from "./health-plans/health-plan-features-dialog";
import { BuyplanComponent } from "./buyplan/buyplan.component";
import { PosShellComponent } from "../../shared/pos-shell/pos-shell.component";
import { PosCoreModule } from "src/app/shared/pos-core.module";
import { SharedModule } from "src/app/shared/shared.module";
import { HealthBuyPlanService } from "../services/health-buyplan.service";
import { BuyInsuranceGuard } from "src/app/shared/guards/buy-insurance.gaurd";
import { Page404Component } from "src/app/shared/page-404/page-404.component";
import { AuthGuard } from "src/app/shared/guards/auth.gaurd";
import { HealthPaymentComponent } from "./health-payment/health-payment.component";
import { PaymentErrorComponent } from "src/app/shared/payment-error/payment-error.component";
import { BuyplanGodigitComponent } from "./Company_wise_buyplan/buyplangodigit/buyplangodigit.component";
import { BuyplanTataaigComponent } from "./Company_wise_buyplan/buyplantataaig/buyplantataaig.component";
import { BuyplanstarComponent } from "./Company_wise_buyplan/buyplanstar/buyplanstar.component";
import { BuyplanRelianceComponent } from "./Company_wise_buyplan/buyplan-reliance/buyplan-reliance.component";
import { BuyplanNationalComponent } from "./Company_wise_buyplan/buyplan-national/buyplan-national.component";
import { BuyplanSbiComponent } from "./Company_wise_buyplan/buyplan-sbi/buyplan-sbi.component";
import { VehicleBuyPlanService } from "../services/vehicle-buyplan.service";
import { BuyplanHdfcErgoComponent } from './Company_wise_buyplan/buyplan-hdfc-ergo/buyplan-hdfc-ergo.component';

@NgModule({
  declarations: [
    HealthPlansComponent,
    BuyplanComponent,
    HealthPaymentComponent,
    ReviewPayComponent,
    HealthPlanFeaturesDialog,
    BuyplanGodigitComponent,
    BuyplanTataaigComponent,
    BuyplanstarComponent,
    BuyplanRelianceComponent,
    BuyplanNationalComponent,
    BuyplanSbiComponent,
    BuyplanHdfcErgoComponent,
  ],
  imports: [
    CommonModule,
    BimaMaterialModule,
    PosCoreModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: "",
        component: PosShellComponent,
        children: [
          // { path: '', redirectTo: 'plans', pathMatch: 'full' },
          {
            path: "best-plans/:a_id/:odp",
            component: HealthPlansComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure",
            component: BuyplanComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-godigit/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure",
            component: BuyplanGodigitComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-tataAig/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure",
            component: BuyplanTataaigComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-star/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure",
            component: BuyplanstarComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-company/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure",
            component: BuyplanRelianceComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-hdfcErgo/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure",
            component: BuyplanHdfcErgoComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-national/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure",
            component: BuyplanNationalComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-sbi/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure",
            component: BuyplanSbiComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "buyplan-oriental/:a_id/:odp/:c_id/:p_cd/:sum_insured/:prm/:tanure/:qno",
            component: BuyplanComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "health-payment/:comp_code/:comp_data",
            component: HealthPaymentComponent,
            canActivate: [BuyInsuranceGuard],
          },
          {
            path: "car-payment-error",
            component: PaymentErrorComponent,
            canActivate: [BuyInsuranceGuard],
          },
          { path: "**", component: Page404Component },
          // { path: 'review-and-pay', component: ReviewPayComponent, canActivate: [BuyInsuranceGuard] },
        ],
        canActivate: [AuthGuard],
      },
    ]),
  ],
  providers: [HealthBuyPlanService, BuyInsuranceGuard, VehicleBuyPlanService],
  entryComponents: [HealthPlansComponent, HealthPlanFeaturesDialog],
})
export class HealthInsuranceModule {}
