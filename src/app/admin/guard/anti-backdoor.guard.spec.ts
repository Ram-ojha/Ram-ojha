import { TestBed } from '@angular/core/testing';

import { AntiBackdoorGuard } from './anti-backdoor.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('AntiBackdoorGuard', () => {
  let guard: AntiBackdoorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // providers: [{ provide: Router, useClass: RouterModule }]
      imports: [RouterTestingModule]
      // declarations: [AntiBackdoorGuard]

    });
    guard = TestBed.inject(AntiBackdoorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
