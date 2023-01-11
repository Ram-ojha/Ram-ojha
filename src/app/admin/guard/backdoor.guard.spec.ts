import { TestBed } from '@angular/core/testing';

import { BackdoorGuard } from './backdoor.guard';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('BackdoorGuard', () => {
  let guard: BackdoorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // providers: [{ provide: AuthService, useClass: AuthService }]
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
    guard = TestBed.inject(BackdoorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
