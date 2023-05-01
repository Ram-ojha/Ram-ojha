import { TestBed } from '@angular/core/testing';

import { ServicesValidatorsService } from './services-validators.service';

describe('ServicesValidatorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServicesValidatorsService = TestBed.get(ServicesValidatorsService);
    expect(service).toBeTruthy();
  });
});
