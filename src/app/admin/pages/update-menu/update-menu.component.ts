import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../services/menu.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-menu',
  templateUrl: './update-menu.component.html',
  styleUrls: ['./update-menu.component.css']
})
export class UpdateMenuComponent implements OnInit {

  updateMenuForm:FormGroup;
  formCheck = false;
  
  constructor(
    private _actRoute : ActivatedRoute,
    private _menuServe : MenuService,
    private _fb : FormBuilder,
    private _rotuer : Router
  ) {
    this.updateMenuForm = this._fb.group({
      _id : [""],
      name : ["", Validators.required]
    })
    
    
    let id = this._actRoute.snapshot.paramMap.get("id");
    this._menuServe.get(id).subscribe((result)=>{
      this.updateMenuForm.controls.name.setValue(result.name);
      this.updateMenuForm.controls._id.setValue(result._id);
      
    })
    
   }

  ngOnInit(): void {
    
  }

  update(){
    if(this.updateMenuForm.invalid){
      this.formCheck = true;
      return;
    }
    console.log(this.updateMenuForm.value);
    this._menuServe.update(this.updateMenuForm.value).subscribe((result)=>{
      console.log(result);
      this._rotuer.navigate(["/admin/menu"]);

    })
  }
}
