import { Pipe, PipeTransform } from "@angular/core";
import { IPlansMotor } from "src/app/models/health-insu.Model";

@Pipe({
  name: "filterPlans",
})
export class FilterPlansPipe implements PipeTransform {
  transform(data: IPlansMotor[], check: boolean, match?: boolean): any {
    if (check) {
      // console.log(data, check, match);

      if (data.length > 0) {
        return data.filter((e) => {
          let c = e.CoverageList.find((x) => x.CoverageID == 1);

          if (match) {
            return c != null && (+c.ODPremium != 0 || +c.TPPremium != 0);
          }
          else {
            // console.log(c, +c.ODPremium, c.TPPremium);

            return !c || (!+c.ODPremium && !+c.TPPremium);
          }
        });
      }
    } else {
      if (match) return data;
      else return null;
    }
  }
  // transform(data: IPlansMotor[], check:boolean): any {

  //   if(check && data.length>0){
  //     return data.filter(e=>{
  //       let c = e.CoverageList.find((x) => x.CoverageCode === "Depreciation Waiver");
  //       return c != null && +c.ODPremium != 0
  //     })
  //   }else{
  //     return data;
  //   }
  // }
}
