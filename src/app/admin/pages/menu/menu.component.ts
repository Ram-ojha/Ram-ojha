import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../../services/menu.service';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @ViewChild('closeBtn') closeBtn:any;  
  allMenu:any[]=[];
  menu:any;
  
  constructor(private _menu : MenuService) {
    this._menu.getAll().subscribe((result)=>{
      console.log(result);
      this.allMenu = result;
    })
   }

  ngOnInit(): void {
  }

  askDelete(obj:any){
    console.log(obj);
    this.menu = obj;
  }
  confDelete(){
  
    this._menu.delete(this.menu).subscribe((result)=>{

      let n = this.allMenu.indexOf(this.menu);
      // console.log(n);
      this.allMenu.splice(n, 1);
        // console.log(result);
        this.closeBtn.nativeElement.click();
    })
  }
}
/*
var x = 'pink';
var arr = ['red', 'green', 'blue', 'yellow', 'pink']

var n = arr.indexOf(x);
arr.splice(n, 1);

*/
