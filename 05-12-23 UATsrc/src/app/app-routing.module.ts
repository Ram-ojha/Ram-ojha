import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { LoginGuard } from "./login/login.gaurd";
import { IndexComponent } from "./index/index.component";
import { AxisComponent } from "./axis/axis.component";
import { FranchiseLoginComponent } from "./login/franchise-login/franchise-login.component";
import { PageInvalidComponent } from "./page-invalid/page-invalid.component";
import { PaymentLinkShareComponent } from "./pos-insurance/bike-insurance/payment-link-share/payment-link-share.component";
import { BikePaymentComponent } from "./pos-insurance/bike-insurance/bike-payment/bike-payment.component";
import { CarPaymentLinkShareComponent } from "./pos-insurance/car-insurance/car-payment-link-share/car-payment-link-share.component";
import { CkycResponseComponent } from "./shared/components/ckyc-response/ckyc-response.component";
const routes: Routes = [
  { path: "", component: IndexComponent },
  { path: "login", component: LoginComponent, canActivate: [LoginGuard] },
  { path: "franchiselogin/:rm/:ps", component: FranchiseLoginComponent },
  { path: "pageInvalid", component: PageInvalidComponent },
  {
    path: "pos",
    loadChildren: () =>
      import("./pos-home/pos-home.module").then((c) => c.PosHomeModule),
  },
  // { path: 'pos', loadChildren: () => import('./pos/pos.module').then(pos => pos.PosModule) },

  {
    path: "bike-insurance",
    loadChildren: () =>
      import("./pos-insurance/bike-insurance/bike-insurance.module").then(
        (b) => b.BikeInsuanceModule
      ),
  },
  {
    path: "car-insurance",
    loadChildren: () =>
      import("./pos-insurance/car-insurance/car-insurance.module").then(
        (c) => c.CarInsuanceModule
      ),
  },
  {
    path: "health-insurance",
    loadChildren: () =>
      import("./pos-insurance/health-insurance/health-insurance.module").then(
        (m) => m.HealthInsuranceModule
      ),
  },
  {
    path: "cv-insurance",
    loadChildren: () =>
      import("./pos-insurance/cv-insurance/cv-insurance.module").then(
        (m) => m.CvInsuranceModule
      ),
  },



  {
    path: "pay",
    component: PaymentLinkShareComponent,
  },
  {
    path: "cpay",
    component: CarPaymentLinkShareComponent,
  },
  {
    path: "bike-payment/:key",
    component: BikePaymentComponent,
    // canActivate: [BuyInsuranceGuard],
  },
  {
    path: "ckyc-response/thankyou",
    component: CkycResponseComponent,
  },
  // {
  //   path: 'bus-insurance',
  //   loadChildren: () => import('./pos-insurance/bus-insurance/bus-insurance.module').then(b => b.BusInsuranceModule)
  // },
  // {
  //   //this is not in use now
  //   path: 'term-life-insurance',
  //   loadChildren: () => import('./pos-insurance/term-insurance/term-insurance.module').then(m => m.TermInsuranceModule)
  // },
  // {
  //   path: 'travel-insurance',
  //   loadChildren: () => import('./pos-insurance/travel-insurance/travel-insurance.module').then(m => m.TravelInsuranceModule)
  // },
  // {
  //   path: 'taxi-insurance',
  //   loadChildren: () => import('./pos-insurance/car-insurance/car-insurance.module').then(c => c.CarInsuanceModule)
  // },

  {
    path: "manage",
    loadChildren: () =>
      import("./pos-manager/pos-manager.module").then(
        (m) => m.PosManagerModule
      ),
  },
  // Added for mobile view
  { path: "axis", component: AxisComponent },
  { path: "services", redirectTo: "", pathMatch: "full" },
  { path: "about", redirectTo: "", pathMatch: "full" },
  { path: "testimonials", redirectTo: "", pathMatch: "full" },
  { path: "contactus", redirectTo: "", pathMatch: "full" },
  { path: "headr-btm", redirectTo: "", pathMatch: "full" },
  // Added for mobile view end
  { path: "no-internet", component: PageNotFoundComponent },
  { path: "**", component: PageNotFoundComponent },
];

@NgModule({
  // imports: [RouterModule.forRoot(routes)],
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
