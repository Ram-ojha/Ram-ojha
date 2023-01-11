import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AboutComponent } from '../pages/about/about.component';
import { HeaderComponent } from '../shared/header/header.component';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      // providers: [{ provide: Router, useClass: RouterModule }]
      // declarations: [AboutComponent, HeaderComponent], // declare the test component
      // providers: [{ provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } }]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
