import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashComponent } from './pages/dash/dash.component';
import { VieworderComponent } from './pages/vieworder/vieworder.component';
import { AdminComponent } from './admin.component';
import { MenuComponent } from './pages/menu/menu.component';
import { DishesComponent } from './pages/dishes/dishes.component';
import { AddMenuComponent } from './pages/add-menu/add-menu.component';
import { AddDishComponent } from './pages/add-dish/add-dish.component';
import { LoginComponent } from './pages/login/login.component';
import { BackdoorGuard } from './guard/backdoor.guard';
import { AntiBackdoorGuard } from './guard/anti-backdoor.guard';
import { UsersComponent } from './pages/users/users.component';
import { UpdateMenuComponent } from './pages/update-menu/update-menu.component';
import { StudentComponent } from './pages/student/student.component';


const routes: Routes = [
  {
    path: "",
    component: AdminComponent,
    children: [
      {
        path: "",
        component: LoginComponent,
        // canActivate : [AntiBackdoorGuard]
      },
      {
        path: "dashboard",
        component: DashComponent,
        // canActivate : [BackdoorGuard]
      },
      {
        path: "vieworder",
        component: VieworderComponent,
        // canActivate: [BackdoorGuard]
      },
      {
        path: "menu",
        component: MenuComponent,
        canActivate: [BackdoorGuard]
      },
      {
        path: "dishes",
        component: DishesComponent,
        canActivate: [BackdoorGuard]
      },
      {
        path: "add-menu",
        component: AddMenuComponent,
        canActivate: [BackdoorGuard]
      },
      {
        path: "add-dish",
        component: AddDishComponent,
        canActivate: [BackdoorGuard]
      },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [BackdoorGuard]
      },
      {
        path: "update-menu/:id",
        component: UpdateMenuComponent,
        canActivate: [BackdoorGuard]
      },
      {
        path: "student",
        component: StudentComponent,
        canActivate: [BackdoorGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
