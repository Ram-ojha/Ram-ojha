import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { PosManagerRoutingModule } from "./pos-manager-routing.module";

import { PosCoreModule } from "../shared/pos-core.module";
import { PosProfileComponent } from "./pos-profile/pos-profile.component";
import { PosPolicyBoardComponent } from "./pos-policy-board/pos-policy-board.component";
import { PosLeadsComponent } from "./pos-leads/pos-leads.component";
import { PosPayoutComponent } from "./pos-payout/pos-payout.component";
import { PosCertificateComponent } from "./pos-certificate/pos-certificate.component";
import { PosRenewalsComponent } from "./pos-renewals/pos-renewals.component";
import { MissingPolicyComponent } from "./missing-policy/missing-policy.component";
import { NewProductsComponent } from "./new-products/new-products.component";
import { BimaMaterialModule } from "../shared/bima-material.module";
import { RouterModule } from "@angular/router";
import { PosShellComponent } from "../shared/pos-shell/pos-shell.component";
import { SharedModule } from "../shared/shared.module";
import { PosCertificateApiService } from "../pos-manager/services/pos-certificate-api.service";
import { PosPolicyServicingComponent } from "./pos-policy-servicing/pos-policy-servicing.component";
import { PolicyServicingApiService } from "./services/pos-policy-servicing.service";
import { ViewPolicyComponent } from "./pos-policy-board/view-policy/view-policy.component";
import { BikePolicyComponent } from "./pos-policy-board/bike-policy/bike-policy.component";
import { CarPolicyComponent } from "./pos-policy-board/car-policy/car-policy.component";
import { HealthPolicyComponent } from "./pos-policy-board/health-policy/health-policy.component";
import { MatTableExporterModule } from "mat-table-exporter";


@NgModule({
  declarations: [
    PosProfileComponent,
    PosPolicyBoardComponent,
    PosLeadsComponent,
    PosPayoutComponent,
    PosCertificateComponent,
    PosRenewalsComponent,
    MissingPolicyComponent,
    NewProductsComponent,
    PosPolicyServicingComponent,
    ViewPolicyComponent,
    BikePolicyComponent,
    CarPolicyComponent,
    HealthPolicyComponent,
  ],
  imports: [
    CommonModule,
    PosCoreModule,
    // PosManagerRoutingModule,
    BimaMaterialModule,
    SharedModule,
    MatTableExporterModule,
    RouterModule.forChild([
      {
        path: "",
        component: PosShellComponent,
        children: [
          { path: "profile", component: PosProfileComponent },
          {
            path: "policy-board",
            component: PosPolicyBoardComponent,
            children: [
              { path: "", redirectTo: "summary", pathMatch: "full" },
              { path: "summary", component: ViewPolicyComponent },
              { path: "bike-insurance/:InsuranceCateCode", component: BikePolicyComponent },
              { path: "car-insurance/:InsuranceCateCode", component: CarPolicyComponent },
              { path: "health-insurance/:InsuranceCateCode", component: HealthPolicyComponent },
              { path: "cv-insurance/:InsuranceCateCode", component: CarPolicyComponent },
            ],
          },
          { path: "leads", component: PosLeadsComponent },
          { path: "policy-servicing", component: PosPolicyServicingComponent },
          { path: "payout", component: PosPayoutComponent },
          { path: "certification", component: PosCertificateComponent },
          { path: "renewals", component: PosRenewalsComponent },
          { path: "missing-policy", component: MissingPolicyComponent },
          { path: "new-products", component: NewProductsComponent },
          { path: "", redirectTo: "profile", pathMatch: "full" },
        ],
      },
    ]),
  ],
  providers: [PosCertificateApiService, PolicyServicingApiService, DatePipe],
})
export class PosManagerModule { }
