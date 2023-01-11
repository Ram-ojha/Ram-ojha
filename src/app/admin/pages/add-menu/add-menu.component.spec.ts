import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMenuComponent } from './add-menu.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuService } from 'src/app/services/menu.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AddMenuComponent', () => {
  let component: AddMenuComponent;
  let fixture: ComponentFixture<AddMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddMenuComponent],
      imports: [RouterTestingModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      // providers: [{ provide: FormBuilder, useClass: FormsModule }],
      // { provide: HttpClient, useClass: HttpClientModule }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
