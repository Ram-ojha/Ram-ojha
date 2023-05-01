import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderforsharedlinkComponent } from './headerforsharedlink.component';

describe('HeaderforsharedlinkComponent', () => {
  let component: HeaderforsharedlinkComponent;
  let fixture: ComponentFixture<HeaderforsharedlinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderforsharedlinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderforsharedlinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
