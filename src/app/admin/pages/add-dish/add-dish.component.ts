import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../../services/menu.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {DishService} from '../../../services/dish.service'


@Component({
  selector: 'app-add-dish',
  templateUrl: './add-dish.component.html',
  styleUrls: ['./add-dish.component.css']
})
export class AddDishComponent implements OnInit {

  allMenu:any[]=[];
  dishForm:FormGroup;
  checkForm:boolean=false;

  constructor(
    private _menu : MenuService,
    private _fb : FormBuilder,
    private _dish : DishService,
    private _router : Router
  ) {
      this._menu.getAll().subscribe((result)=>{
        this.allMenu=result;
      });
      this.dishForm = this._fb.group({
        menu : ["", Validators.required],
        name : ["", Validators.required],
        price : ["", Validators.required],
        detail : ["", Validators.required],
        image : ["", Validators.required]
      
      })
   }

  ngOnInit(): void {
  }

  submit(image:any){
    
    if(this.dishForm.invalid){
      this.checkForm=true;
      if (image.files[0] !== undefined) {
        if (image.files[0].type != "image/jpg"
          && image.files[0].type != "image/pdf"
          && image.files[0].type != "image/jpeg"
          && image.files[0].type != "image/png") {

          // alert();
          this.dishForm.controls.image.setErrors({ typeErr: true })
          return;
        }

        if (image.files[0].size > (2 * 1024 * 1024)) {
          this.dishForm.controls.image.setErrors({ sizeErr: true })
          return;
        }
      }
      return;
    }
    
    let form = new FormData();
    form.append("image", image.files[0]);
    form.append("formdata", JSON.stringify(this.dishForm.value));

    this._dish.save(form).subscribe((result)=>{
      console.log(result);
      this._router.navigate(["/admin/dishes"]);
    })
  }


  
}
