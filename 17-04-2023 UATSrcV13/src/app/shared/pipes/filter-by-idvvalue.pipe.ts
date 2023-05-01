import { Pipe, PipeTransform } from '@angular/core';
import { IPlansMotor } from 'src/app/models/health-insu.Model';

@Pipe({
  name: 'filterByIDVValue'
})
export class FilterByIDVValuePipe implements PipeTransform {

  transform(data: IPlansMotor[], check: any, match?: boolean): any {
    if (check) {
      // console.log(data, check, match);

      if (data.length > 0) {
        return data.filter((e) => {
          return e.IDVVAlue !== check;
          // if (c) {
          //   return c != null && (+c.ODPremium != 0 || +c.TPPremium != 0);
          // }
          // else {
          //   // console.log(c, +c.ODPremium, c.TPPremium);

          //   return !c || (!+c.ODPremium && !+c.TPPremium);
          // }
        });
      }
    } else {
      if (match) return data;
      else return null;
    }
  }


}
