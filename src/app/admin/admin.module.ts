import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { HomeComponent } from './pages/home/home.component';
import { DashComponent } from './pages/dash/dash.component';
import { VieworderComponent } from './pages/vieworder/vieworder.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { MenuComponent } from './pages/menu/menu.component';
import { DishesComponent } from './pages/dishes/dishes.component';
import { AddMenuComponent } from './pages/add-menu/add-menu.component';
import { AddDishComponent } from './pages/add-dish/add-dish.component';
import { LoginComponent } from './pages/login/login.component';
import { AddDishesComponent } from './pages/add-dishes/add-dishes.component';
import { UsersComponent } from './pages/users/users.component';
import { UpdateMenuComponent } from './pages/update-menu/update-menu.component';
import { StudentComponent } from './pages/student/student.component';
import { DiscountPipe } from './pipes/discount.pipe';
import { LoginService } from './services/login.service';



@NgModule({
  declarations: [
    AdminComponent,
    HomeComponent,
    DashComponent,
    VieworderComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    DishesComponent,
    AddMenuComponent,
    AddDishComponent,
    LoginComponent,

    AddDishesComponent,
    UsersComponent,
    UpdateMenuComponent,
    StudentComponent,
    DiscountPipe

  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,

  ],
  providers: [LoginService]
})
export class AdminModule { }
