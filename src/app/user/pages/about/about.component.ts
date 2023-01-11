import { Component, OnInit } from '@angular/core';
import{AuthService} from '../../servcies/auth.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private _auth:AuthService) { 
    console.log("hello");
    this._auth.getall().subscribe((result)=>{
    })
  }
  

  ngOnInit(): void {
  }

}
