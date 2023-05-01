import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';

import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog'
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule } from '@angular/material/core';





@NgModule({
    imports: [
        MatCardModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatTabsModule,
        MatIconModule,
        MatRadioModule,
        MatCheckboxModule,
        MatStepperModule,
        MatSlideToggleModule,  //need
        MatDialogModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatSliderModule,
        MatTooltipModule,
        MatExpansionModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatOptionModule
    ],
    exports: [
        MatMenuModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatTabsModule,
        MatIconModule,
        MatRadioModule,
        MatCheckboxModule,
        MatStepperModule,
        MatSlideToggleModule,  //need car module
        MatDialogModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatExpansionModule,
        MatSliderModule,
        MatTooltipModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatOptionModule

    ],
    declarations: [],
    providers: []
})
export class BimaMaterialModule { }
