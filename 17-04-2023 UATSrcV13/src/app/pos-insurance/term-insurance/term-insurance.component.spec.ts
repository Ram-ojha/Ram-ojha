import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermInsuranceComponent } from './term-insurance.component';

describe('TermInsuranceComponent', () => {
  let component: TermInsuranceComponent;
  let fixture: ComponentFixture<TermInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermInsuranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
