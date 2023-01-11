import { TestBed } from '@angular/core/testing';
import { MenuService } from './menu.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MenuService', () => {
  let service: MenuService;
  let httpClient: HttpClient;
  beforeEach(() => {
    TestBed.configureTestingModule({

      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MenuService);
    // httpClient = TestBed.inject(HttpClient);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    // expect(httpClient).toBeTruthy();

  });
});
