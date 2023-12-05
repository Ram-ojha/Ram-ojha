import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyplanIffcotokioComponent } from './buyplan-iffcotokio.component';

describe('BuyplanIffcotokioComponent', () => {
  let component: BuyplanIffcotokioComponent;
  let fixture: ComponentFixture<BuyplanIffcotokioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyplanIffcotokioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyplanIffcotokioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
