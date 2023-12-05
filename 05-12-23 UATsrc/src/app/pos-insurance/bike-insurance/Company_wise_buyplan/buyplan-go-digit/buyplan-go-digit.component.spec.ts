import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyplanGoDigitComponent } from './buyplan-go-digit.component';

describe('BuyplanGoDigitComponent', () => {
  let component: BuyplanGoDigitComponent;
  let fixture: ComponentFixture<BuyplanGoDigitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyplanGoDigitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyplanGoDigitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
