import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyplanSbiComponent } from './buyplan-sbi.component';

describe('BuyplanSbiComponent', () => {
  let component: BuyplanSbiComponent;
  let fixture: ComponentFixture<BuyplanSbiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyplanSbiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyplanSbiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
