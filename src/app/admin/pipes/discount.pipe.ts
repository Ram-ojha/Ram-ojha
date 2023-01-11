import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discount'
})
export class DiscountPipe implements PipeTransform {

  transform(a:any, b : any, c : any) {
    let x;
    if(b =="male"){
      x = a*10/100;
      if(c < 25)
      {
        x = x*15/100;
      }
    }
    if(b=="female"){
      x = a*15/100;
      if(c < 25)
      {
        x = x*15/100;
      }
    }
    return x;
  }

}
