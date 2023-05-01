import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CvPaymentComponent } from './cv-payment.component';

describe('CvPaymentComponent', () => {
  let component: CvPaymentComponent;
  let fixture: ComponentFixture<CvPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CvPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CvPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
