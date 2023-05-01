import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FranchiseLoginComponent } from './franchise-login.component';

describe('FranchiseLoginComponent', () => {
  let component: FranchiseLoginComponent;
  let fixture: ComponentFixture<FranchiseLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FranchiseLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FranchiseLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
