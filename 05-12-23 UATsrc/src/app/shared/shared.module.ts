import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VehicleRtoComponent } from "./components/vehicle-rtos/vehicle-rtos.component";
import { BimaMaterialModule } from "./bima-material.module";
import { Page404Component } from "./page-404/page-404.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BikeModelVariantComponent } from "./components/bike-model-variant/bike-model-variant.component";
import { PolicyExpiredComponent } from "./components/policy-expired/policy-expired.component";
import { CarModelVariantComponent } from "./components/car-model-variant/car-model-variant.component";
import { SmallLoaderComponent } from "./loader/small-loader";
import { LoaderComponent } from "./loader/loader";
import { PosHomeService } from "../pos-home/services/pos-home.service";
import { OnlyNumbersDirective } from "./directives/only-numbers.directive";
import { OnlyAlphaDirective } from "./directives/only-alpha.directive";
import { BlockPasteDropDirective } from "./directives/block-paste-and-drop.directive";
import { MaskedInputDirective, TextMaskModule } from "angular2-text-mask";
import { AutofocusDirective } from "./directives/autofocus.directive";
import { UppercaseDirective } from "./directives/uppercase.directive";
import { TimerFormatPipe } from "./pipes/timer-format.pipe";
import { CustomPopopComponent } from "./components/custom-popop/custom-popop.component";
import { ContactService } from "./services/contact.service";
import { PlanAndPremiumDetailsComponent } from "./components/plan-and-premium-details/plan-and-premium-details.component";
import { CarPlanAndPremiumDetailsComponent } from "./components/car-plan-and-premium-details/car-plan-and-premium-details.component";
import { AppLoaderComponent } from "./loader/Loader-full";
import { PaymentErrorComponent } from "./payment-error/payment-error.component";
import { PolicyTypeComponent } from "./components/Previous-policy-type/Previous-policy-type.component";
import { CustomRoundUpPipe } from "./pipes/CustomRoundUp.pipe";
import { FilterPlansPipe } from "./pipes/filter-plans.pipe";
import { AddonsPipe } from "./pipes/addons.pipe";
// import { ValueArrayPipe } from './pipes/valueArray.pipe';
// import { LoaderComponent } from './loader/loader';
import { LoadingInterceptor } from "./services/login-interceptor";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { DisallowWhitespaceDirective } from "./directives/disallow-whitespace.directive";
import { QuotesSharingModalComponent } from "./components/quotes-sharing-modal/quotes-sharing-modal.component";
import { NgxCaptureModule } from "ngx-capture";
import { CvModelVariantComponent } from "./components/cv-model-variant/cv-model-variant.component";
import { CvPlanAndPremiumDetailsComponent } from "./components/cv-plan-and-premium-details/cv-plan-and-premium-details.component";
// import { BuyPlanComponent } from "../pos-insurance/cv-insurance/buy-plan/buy-plan.component";
import { UrlShareModalComponent } from "./components/url-share-modal/url-share-modal.component";


import { ResponseModalComponent } from "./components/response-modal/response-modal.component";
import { CurrentCommunicationAddressComponent } from "./components/current-communication-address/current-communication-address.component";
import { FilterByIDVValuePipe } from "./pipes/filter-by-idvvalue.pipe";
import { CkycDetailsComponent } from "../pos-insurance/ckyc-details/ckyc-details.component";
import { RegexFormateValidationDirective, TrimDirective, TrimDirectiveTemplate } from "./directives/trim.directive"









@NgModule({
  imports: [
    CommonModule,
    BimaMaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule
  ],
  exports: [
    //module
    CommonModule,
    BimaMaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    NgxCaptureModule,
    //component
    VehicleRtoComponent,
    Page404Component,
    PaymentErrorComponent,
    BikeModelVariantComponent,
    CarModelVariantComponent,
    CvModelVariantComponent,
    PolicyExpiredComponent,
    PolicyTypeComponent,
    CustomRoundUpPipe,
    LoaderComponent,
    SmallLoaderComponent,
    AppLoaderComponent,
    OnlyNumbersDirective,
    OnlyAlphaDirective,
    BlockPasteDropDirective,
    AutofocusDirective,
    UppercaseDirective,
    TimerFormatPipe,
    CustomPopopComponent,
    PlanAndPremiumDetailsComponent,
    CarPlanAndPremiumDetailsComponent,
    CvPlanAndPremiumDetailsComponent,
    FilterPlansPipe,
    FilterByIDVValuePipe,
    AddonsPipe,
    DisallowWhitespaceDirective,
    QuotesSharingModalComponent,
    UrlShareModalComponent,
    ResponseModalComponent,
    CurrentCommunicationAddressComponent,
    CkycDetailsComponent,
    TrimDirective,
    TrimDirectiveTemplate,
    RegexFormateValidationDirective
    // BuyPlanComponent
    // ValueArrayPipe
  ],
  declarations: [
    VehicleRtoComponent,
    Page404Component,
    PaymentErrorComponent,
    BikeModelVariantComponent,
    CarModelVariantComponent,
    CvModelVariantComponent,
    PolicyExpiredComponent,
    PolicyTypeComponent,
    CustomRoundUpPipe,
    LoaderComponent,
    SmallLoaderComponent,
    AppLoaderComponent,
    OnlyNumbersDirective,
    OnlyAlphaDirective,
    BlockPasteDropDirective,
    AutofocusDirective,
    UppercaseDirective,
    TimerFormatPipe,
    CustomPopopComponent,
    PlanAndPremiumDetailsComponent,
    CarPlanAndPremiumDetailsComponent,
    CvPlanAndPremiumDetailsComponent,
    FilterPlansPipe,
    FilterByIDVValuePipe,
    AddonsPipe,
    DisallowWhitespaceDirective,
    QuotesSharingModalComponent,
    UrlShareModalComponent,
    ResponseModalComponent,
    CurrentCommunicationAddressComponent,
    CkycDetailsComponent,
    TrimDirective,
    TrimDirectiveTemplate,
    RegexFormateValidationDirective
    // BuyPlanComponent
    // ValueArrayPipe
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    PosHomeService,
    ContactService,
  ],
  entryComponents: [],
})
// export class PosCoreModule { }//old
export class SharedModule { }
