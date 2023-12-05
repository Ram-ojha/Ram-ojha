import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { PosCoreModule } from '../shared/pos-core.module';
// import { BimaMaterialModule } from '../shared/bima-material.module';
import { RouterModule } from '@angular/router';
import { PosShellComponent } from '../shared/pos-shell/pos-shell.component';
import { BikeComponent } from './bike/bike.component';
import { CarComponent } from './car/car.component';
import { PosHomeComponent } from './pos-home.component';
import { TaxiComponent } from './taxi/taxi.component';
import { BusComponent } from './bus/bus.component';
import { HealthComponent } from './health/health.component';
import { TermLifeComponent } from './term-life/term-life.component';
import { TravelComponent } from './travel/travel.component';
import { PosBikeService } from './services/pos-bike.service';
// import { PosHomeService } from './services/pos-home.service';
import { AuthGuard } from '../shared/guards/auth.gaurd';
import { Page404Component } from '../shared/page-404/page-404.component';
import { PosCarService } from './services/pos-car.service';
import { PosHealthService } from './services/pos-health.service';
import { OtherApiService } from '../pos-insurance/services/other-api.service';
import { FireComponent } from './fire/fire.component';
import { BurglaryComponent } from './burglary/burglary.component';
import { CommercialComponent } from './commercial/commercial.component';
import { PosCvServiceService } from './services/pos-cv-service.service';



@NgModule({
  declarations: [
    PosHomeComponent,
    BikeComponent,
    CarComponent,
    CommercialComponent,
    TaxiComponent,
    BusComponent,
    TravelComponent,
    TermLifeComponent,
    HealthComponent,
    FireComponent,
    BurglaryComponent
  ],
  imports: [
    CommonModule,
    // BimaMaterialModule,
    PosCoreModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '', component: PosShellComponent, children: [
          {
            path: '', component: PosHomeComponent, children: [
              { path: '', redirectTo: 'bike-insurance', pathMatch: 'full' },
              { path: 'bike-insurance', component: BikeComponent, canActivate: [AuthGuard] },
              { path: 'car-insurance', component: CarComponent, canActivate: [AuthGuard] },
              { path: 'health-insurance', component: HealthComponent, canActivate: [AuthGuard] },
              { path: 'cv-insurance', component: CommercialComponent, canActivate: [AuthGuard] },

              // { path: 'taxi-insurance', component: TaxiComponent, canActivate: [AuthGuard] },
              // { path: 'bus-insurance', component: BusComponent, canActivate: [AuthGuard] },
              // { path: 'term-life-insurance', component: TermLifeComponent, canActivate: [AuthGuard] },
              // { path: 'travel-insurance', component: TravelComponent, canActivate: [AuthGuard] },  //<---this is not in use now
              // { path: 'fire-insurance', component: FireComponent, canActivate: [AuthGuard] },
              // { path: 'burglary-insurance', component: BurglaryComponent, canActivate: [AuthGuard] },
              { path: '**', component: Page404Component },
            ]
          }
          // { path: '', component: ReviewPayComponent },
        ]
      }
    ]),

  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TokenInterceptor,
    //   multi: true
    // },
    //   {
    //   provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
    // },
    // PosHomeService,
    PosBikeService,
    PosCarService,
    PosHealthService,
    PosCvServiceService,
    OtherApiService,
  ]
})
export class PosHomeModule { }
