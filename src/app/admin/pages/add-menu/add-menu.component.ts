import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder,Validators } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.css']
})
export class AddMenuComponent implements OnInit {

  menuForm : FormGroup;
  checkForm=false;
  constructor(
    private _fb : FormBuilder,
    private _menu : MenuService,
    private _router : Router
    ) { 
    this.menuForm = this._fb.group({
      name : ["", Validators.required]
    })
  }

  ngOnInit(): void {
  }
  submit(){
    if(this.menuForm.invalid){
      this.checkForm=true;
      return;
    }
    // console.log(this.menuForm.value);
    this._menu.add(this.menuForm.value).subscribe((result)=>{
      // console.log(result);
      this._router.navigate(["/admin/menu"]);
    })
  }

}
