import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-show-dish',
  templateUrl: './show-dish.component.html',
  styleUrls: ['./show-dish.component.css']
})
export class ShowDishComponent implements OnInit {

  apiUrl = environment.API_URL;
  @Input() x:any;
  
  constructor() { }

  ngOnInit(): void {
  }

}
