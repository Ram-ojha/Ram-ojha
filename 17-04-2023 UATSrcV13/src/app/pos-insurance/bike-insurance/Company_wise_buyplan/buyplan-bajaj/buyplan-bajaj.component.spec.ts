import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyplanBajajComponent } from './buyplan-bajaj.component';

describe('BuyplanBajajComponent', () => {
  let component: BuyplanBajajComponent;
  let fixture: ComponentFixture<BuyplanBajajComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyplanBajajComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyplanBajajComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
