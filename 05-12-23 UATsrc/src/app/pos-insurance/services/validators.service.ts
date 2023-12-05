import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { IRtos } from 'src/app/models/common.Model';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  constructor() { }

  static rtoValidators(rtoList: IRtos[]): ValidatorFn {
    return (control: AbstractControl): any => {
      const value = control.value
      const typedState: any = value && typeof value === "string" ? value.toLowerCase() : value;
      let stateFound = rtoList.find((rto: IRtos) => {
        return rto.RTODisplayName.toLowerCase() === typedState
      });

      if (typedState && !stateFound) return { requireMatch: true };
      else return null;
    };
  }
}
