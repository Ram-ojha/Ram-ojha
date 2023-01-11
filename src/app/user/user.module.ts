import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { WelcomeComponent } from './shared/welcome/welcome.component';
import { BookTableComponent } from './shared/book-table/book-table.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { MyAccountComponent } from './pages/my-account/my-account.component';
import { ShowDishComponent } from './shared/show-dish/show-dish.component';


@NgModule({
  declarations: [
    UserComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    HeaderComponent,
    FooterComponent,
    WelcomeComponent,
    BookTableComponent,
    SignupComponent,
    LoginComponent,
    MyAccountComponent,
    ShowDishComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule
  ],
  exports: [
    // BookTableComponent,
    // WelcomeComponent,
    // ShowDishComponent,
    // HeaderComponent,
    // FooterComponent,
  ]
})
export class UserModule { }
