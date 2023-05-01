import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyplanUniversalShampooComponent } from './buyplan-universal-shampoo.component';

describe('BuyplanUniversalShampooComponent', () => {
  let component: BuyplanUniversalShampooComponent;
  let fixture: ComponentFixture<BuyplanUniversalShampooComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyplanUniversalShampooComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyplanUniversalShampooComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
