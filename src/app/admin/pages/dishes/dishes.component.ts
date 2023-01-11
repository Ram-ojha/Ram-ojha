import { Component, OnInit, ViewChild } from '@angular/core';
import { DishService } from '../../../services/dish.service';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.css']
})
export class DishesComponent implements OnInit {

  @ViewChild('closeBtn') closeBtn:any;

  allDish:any[]=[];
  dish:any;
  constructor(
    private _dish : DishService
  ) {
    this._dish.getAll().subscribe((result)=>{
      this.allDish = result;
    })
   }

  ngOnInit(): void {
  }

  askDelete(obj:any){
    this.dish = obj;
  }

  confDelete(){
    this._dish.delete(this.dish).subscribe((result)=>{
        let n = this.allDish.indexOf(this.dish);
        this.allDish.splice(n, 1);
        this.closeBtn.nativeElement.click();
    })
  }

}
