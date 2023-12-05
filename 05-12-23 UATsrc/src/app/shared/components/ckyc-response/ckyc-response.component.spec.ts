import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CkycResponseComponent } from './ckyc-response.component';

describe('CkycResponseComponent', () => {
  let component: CkycResponseComponent;
  let fixture: ComponentFixture<CkycResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CkycResponseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CkycResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
