import { TestBed } from '@angular/core/testing';

import { DishService } from './dish.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

describe('DishService', () => {
  let service: DishService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useClass: HttpClientModule }]
    });
    service = TestBed.inject(DishService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
