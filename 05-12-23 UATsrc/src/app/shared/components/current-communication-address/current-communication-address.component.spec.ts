import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentCommunicationAddressComponent } from './current-communication-address.component';

describe('CurrentCommunicationAddressComponent', () => {
  let component: CurrentCommunicationAddressComponent;
  let fixture: ComponentFixture<CurrentCommunicationAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentCommunicationAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentCommunicationAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
