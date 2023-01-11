import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMenuComponent } from './update-menu.component';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('UpdateMenuComponent', () => {
  let component: UpdateMenuComponent;
  let fixture: ComponentFixture<UpdateMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateMenuComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule, FormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
