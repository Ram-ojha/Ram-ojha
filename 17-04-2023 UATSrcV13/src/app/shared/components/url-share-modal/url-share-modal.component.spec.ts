import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlShareModalComponent } from './url-share-modal.component';

describe('UrlShareModalComponent', () => {
  let component: UrlShareModalComponent;
  let fixture: ComponentFixture<UrlShareModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlShareModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlShareModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
