import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComponent } from './admin.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AddDishComponent } from './pages/add-dish/add-dish.component';
import { AddDishesComponent } from './pages/add-dishes/add-dishes.component';
import { AddMenuComponent } from './pages/add-menu/add-menu.component';
import { DashComponent } from './pages/dash/dash.component';
import { DishesComponent } from './pages/dishes/dishes.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MenuComponent } from './pages/menu/menu.component';
import { StudentComponent } from './pages/student/student.component';
import { UpdateMenuComponent } from './pages/update-menu/update-menu.component';
import { UsersComponent } from './pages/users/users.component';
import { VieworderComponent } from './pages/vieworder/vieworder.component';
import { DiscountPipe } from './pipes/discount.pipe';
import { LoginService } from './services/login.service';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [LoginService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
