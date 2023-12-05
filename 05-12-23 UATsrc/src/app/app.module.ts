import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { HttpClientModule } from "@angular/common/http";
// import { PosCoreModule } from './shared/pos-core.module';
import { LoginGuard } from "./login/login.gaurd";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "./shared/shared.module";
import { IndexComponent } from "./index/index.component";

import { LoadingService } from "./shared/services/loading.service";
import { LoadingInterceptor } from "./shared/services/login-interceptor";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { VehicleBuyPlanService } from './pos-insurance/services/vehicle-buyplan.service';
import { FranchiseLoginComponent } from './login/franchise-login/franchise-login.component'
import { PageInvalidComponent } from "./page-invalid/page-invalid.component";

import { AxisComponent } from './axis/axis.component';
import { PaymentLinkShareComponent } from "./pos-insurance/bike-insurance/payment-link-share/payment-link-share.component";
import { BikePaymentComponent } from "./pos-insurance/bike-insurance/bike-payment/bike-payment.component";
import { HeaderforsharedlinkComponent } from "./shared/headerforsharedlink/headerforsharedlink.component";
import { CarPaymentLinkShareComponent } from "./pos-insurance/car-insurance/car-payment-link-share/car-payment-link-share.component";
import { CkycResponseComponent } from "./shared/components/ckyc-response/ckyc-response.component";




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    IndexComponent,
    AxisComponent,
    FranchiseLoginComponent,
    PageInvalidComponent,
    PaymentLinkShareComponent,
    BikePaymentComponent,
    HeaderforsharedlinkComponent,
    CarPaymentLinkShareComponent,
    CkycResponseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule, // need to import when login or some other module need its features
    ToastrModule.forRoot({
      maxOpened: 5,
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
      positionClass: "toast-top-center",
      closeButton: true,
      timeOut: 3000,
    }),
    //nee for login component or can come from shared and bimamatemdule
    // ReactiveFormsModule,
    // MatCardModule,
    // MatFormFieldModule,
    // MatInputModule,
  ], exports: [],
  providers: [LoginGuard, LoadingService, VehicleBuyPlanService],
  bootstrap: [AppComponent],
})
export class AppModule { }
