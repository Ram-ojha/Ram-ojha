import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CkycDetailsComponent } from './ckyc-details.component';

describe('CkycDetailsComponent', () => {
  let component: CkycDetailsComponent;
  let fixture: ComponentFixture<CkycDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CkycDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CkycDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
