import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageInvalidComponent } from './page-invalid.component';

describe('PageInvalidComponent', () => {
  let component: PageInvalidComponent;
  let fixture: ComponentFixture<PageInvalidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageInvalidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageInvalidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
