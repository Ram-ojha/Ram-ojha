import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { NgControl, NgModel, Validators } from '@angular/forms';
import { PATTERN } from 'src/app/models/common';
import { ICKYCDocList } from 'src/app/models/common.Model';
import { EDocListEnum } from 'src/app/models/insurance.enum';

declare const event: Event;

@Directive({
  selector: 'input[appTrim]'
})
export class TrimDirective {

  @Input() appTrim: any = false;
  constructor(
    private elementRef: ElementRef,
    private control: NgControl
  ) { }
  validators = [Validators.required, Validators.pattern(PATTERN.WHITESPACE)]
  @HostListener("focusout")
  onBlur() {
    let nativeValue = this.elementRef.nativeElement.value;
    let value = (nativeValue === null || nativeValue === undefined || nativeValue === "") ? null : nativeValue
    const abstractControl = this.control.control;
    value = value && value.trim();
    abstractControl && abstractControl.setValue(value)
  }

}


@Directive({
  selector: '[appTrimTemplate]'
})
export class TrimDirectiveTemplate {
  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private ngModel: NgModel) { }

  @HostListener("blur")
  onBlur() {
    if (!this.ngModel) {
      return;
    }

    let value = this.ngModel.model;

    if (value) {
      value = value.trim();
      this.renderer.setProperty(
        this.elementRef.nativeElement, "value", value);
      this.renderer.setAttribute(
        this.elementRef.nativeElement, "value", value);
      this.ngModel.update.emit(value);
    } else {
      this.renderer.setProperty(
        this.elementRef.nativeElement, "value", null);
      this.renderer.setAttribute(
        this.elementRef.nativeElement, "value", "");
      this.ngModel.update.emit("");
    }
  }
}




@Directive({
  selector: 'input[appRegexFormateValidation]'
})

export class RegexFormateValidationDirective {
  constructor(
    private _el: ElementRef,
    private control: NgControl
  ) { }
  @Input() identity!: ICKYCDocList;

  // @HostListener("keydown")
  // validate(control: FormControl): { [key: string]: any } | null {
  //   const controlToValidate = control.parent.get(this.appConfirmEqualValidator);
  //   if (controlToValidate && controlToValidate.value !== control.value) {
  //     return { 'notEqual': true }
  //   }
  //   // else if (controlToValidate && controlToValidate.value == control.value) {
  //   //     return { 'isEqual': true }
  //   // }
  //   return null;
  // }
  @HostListener("keydown") onKeyDown() {
    // const abstractControl = this.ngModel.model;
    // const initalValue = this._el.nativeElement.value;

    console.log(this.identity)
    const abstractControl = this.control.control;
    const initalValue = this._el.nativeElement.value;
    let updatedValue: any;

    console.log(this.identity, initalValue)

    if (this.identity.DocTypeCodeOdp == EDocListEnum.PAN) {
      // RegExp(PATTERN.PAN).exec
      updatedValue = RegExp(PATTERN.PAN).exec(initalValue)//initalValue.replace(PATTERN.PAN, '');

    } else if (this.identity.DocTypeCodeOdp == EDocListEnum.UID) {
      updatedValue = initalValue.replace(PATTERN.AADHAAR, '');

    } else if (this.identity.DocTypeCodeOdp == EDocListEnum.DrivingLicense) {
      updatedValue = initalValue.replace(PATTERN.DRIVINGLICENCE, '');

    }
    else if (this.identity.DocTypeCodeOdp == EDocListEnum.Passport) {
      updatedValue = initalValue.replace(PATTERN.PASSPORT, '');

    }
    else if (this.identity.DocTypeCodeOdp == EDocListEnum.VoterID) {
      updatedValue = initalValue.replace(PATTERN.VOTERID, '');

    }
    else if (this.identity.DocTypeCodeOdp == EDocListEnum.CKYC) {
      updatedValue = initalValue.replace(PATTERN.CKYC, '');

    }
    else if (this.identity.DocTypeCodeOdp == EDocListEnum.NREGA) {
      updatedValue = initalValue.replace(PATTERN.NAREGA, '');

    }
    else if (this.identity.DocTypeCodeOdp == EDocListEnum.NPRL) {
      updatedValue = initalValue.replace(PATTERN.NPR, '');

    }
    else if (this.identity.DocTypeCodeOdp == EDocListEnum.ITGI) {
      updatedValue = initalValue.replace(PATTERN.ITGI, '');

    } else if (this.identity.DocTypeCodeOdp == EDocListEnum.KYCId) {
      updatedValue = initalValue.replace(PATTERN.CKYC, '');

    }
    else {
      updatedValue = initalValue.replace(PATTERN.ALLREGEX, '');
    }
    this._el.nativeElement.value = updatedValue
    abstractControl && abstractControl.setValue(updatedValue)
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }





}




// selector: '[appConfirmEqualValidator]',
//  @Input() appConfirmEqualValidator: string;

// import { Directive, Input } from '@angular/core';
// import { FormControl, NG_VALIDATORS, Validator } from '@angular/forms';

// @Directive({
//   selector: '[appConfirmEqualValidator]',
//   providers: [{
//     provide: NG_VALIDATORS,
//     useExisting: ConfirmEqualValidatorDirective,
//     multi: true
//   }]
// })

// export class ConfirmEqualValidatorDirective implements Validator {

//   @Input() appConfirmEqualValidator: string;
//   validate(control: FormControl): { [key: string]: any } | null {
//     const controlToValidate = control.parent.get(this.appConfirmEqualValidator);
//     if (controlToValidate && controlToValidate.value !== control.value) {
//       return { 'notEqual': true }
//     }
//     // else if (controlToValidate && controlToValidate.value == control.value) {
//     //     return { 'isEqual': true }
//     // }
//     return null;
//   }

// }