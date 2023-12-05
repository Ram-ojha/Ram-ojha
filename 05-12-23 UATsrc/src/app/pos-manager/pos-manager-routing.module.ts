import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PosShellComponent } from '../shared/pos-shell/pos-shell.component';
import { PosProfileComponent } from './pos-profile/pos-profile.component';
import { PosPolicyBoardComponent } from './pos-policy-board/pos-policy-board.component';
import { PosLeadsComponent } from './pos-leads/pos-leads.component';
import { PosPayoutComponent } from './pos-payout/pos-payout.component';
import { PosCertificateComponent } from './pos-certificate/pos-certificate.component';
import { PosRenewalsComponent } from './pos-renewals/pos-renewals.component';
import { MissingPolicyComponent } from './missing-policy/missing-policy.component';
import { NewProductsComponent } from './new-products/new-products.component';
import { PosPolicyServicingComponent } from './pos-policy-servicing/pos-policy-servicing.component';

const routes: Routes = [{
  path: '', component: PosShellComponent, children: [
    { path: 'profile', component: PosProfileComponent },
    { path: 'policy-board', component: PosPolicyBoardComponent },
    { path: 'policy-servicing', component: PosPolicyServicingComponent },
    { path: 'leads', component: PosLeadsComponent },
    { path: 'payout', component: PosPayoutComponent },
    { path: 'certification', component: PosCertificateComponent },
    { path: 'renewals', component: PosRenewalsComponent },
    { path: 'missing-policy', component: MissingPolicyComponent },
    { path: 'new-products', component: NewProductsComponent },
    { path: '', redirectTo: 'profile', pathMatch: 'full' },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PosManagerRoutingModule { }
