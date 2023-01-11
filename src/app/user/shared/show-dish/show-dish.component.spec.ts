import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDishComponent } from './show-dish.component';

describe('ShowDishComponent', () => {
  let component: ShowDishComponent;
  let fixture: ComponentFixture<ShowDishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      declarations: [ShowDishComponent],

    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowDishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
