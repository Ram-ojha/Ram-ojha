import { Pipe, PipeTransform } from "@angular/core";
import { ICoverageList, IPlansMotor } from "src/app/models/health-insu.Model";
import { IAddons } from "../../models/car-insu.Model";

@Pipe({
  name: "addons",
})
export class AddonsPipe implements PipeTransform {
  transform(addonsArray: IAddons[], plan: IPlansMotor): any {
    let foundArray: IAddons[] = [];
    let notFoundArray: IAddons[] = [];
    for (const addon of addonsArray) {
      let addonFound = plan.CoverageList.find(
        (coverage) => coverage.CoverageID === addon.RecordNo
      );
      if (!addonFound) notFoundArray.push(addon);
    }
    let a = [{ found: plan.CoverageList, notFound: notFoundArray }];

    return a;
  }
}
