import { TestBed } from '@angular/core/testing';

import { BackdoorGuard } from './backdoor.guard';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BackdoorGuard', () => {
  let guard: BackdoorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, RouterModule, HttpClientTestingModule]
    });

    guard = TestBed.inject(BackdoorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
