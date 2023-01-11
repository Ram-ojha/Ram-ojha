import { Component, OnInit } from '@angular/core';
import{MenuService}from '../../../services/menu.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  allDish:any=[];

  constructor(
    private getdata : MenuService
  ) {

    this.getdata.getAll().subscribe((result)=>{
      this.allDish = result;
      // console.log(result);
      
    })

   }

  ngOnInit(): void {
  }

}
