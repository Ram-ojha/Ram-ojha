import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { MatSlideToggleModule } from '@angular/material';
// import { PosService } from '../services/pos.service';
import { BimaMaterialModule } from 'src/app/shared/bima-material.module';
import { BusInsuranceComponent } from './bus-insurance.component';
import { PosShellComponent } from 'src/app/shared/pos-shell/pos-shell.component';


@NgModule({
  declarations: [
    BusInsuranceComponent,
  ],
  imports: [
    CommonModule,
    BimaMaterialModule,
    // MatSlideToggleModule,

    RouterModule.forChild([
      {
        path: '', component: PosShellComponent, children: [
          { path: '', component: BusInsuranceComponent }
        ]
      }

    ]),
  ],
  exports: [],
  // providers: [PosService]
})
export class BusInsuranceModule { }
