import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appOnlyNumbers]'
})
export class OnlyNumbersDirective {

  constructor(private _el: ElementRef,
    private control: NgControl) { }

  // @HostListener('keypress', ['$event']) oninput(e: { metaKey: any; ctrlKey: any; which: number; }) {
  //   // const charCode = (e.which) ?? e.which;//: event.keyCode;
  //   // if (charCode > 31 && (charCode < 48 || charCode > 57)) {
  //   //   return false;
  //   // }
  //   // return true;
  //   let input: string;
  //   if (e.metaKey || e.ctrlKey) {
  //     return true;
  //   }
  //   if (e.which === 32) {
  //     return false;
  //   }
  //   if (e.which === 0) {
  //     return true;
  //   }
  //   if (e.which < 33) {
  //     return true;
  //   }
  //   input = String.fromCharCode(e.which);
  //   return !!/[\d\s]/.test(input);
  // }
  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const initalValue = this._el.nativeElement.value;
    const abstractControl = this.control.control;
    const updatedValue = initalValue.replace(/[^0-9]*/g, '');
    this._el.nativeElement.value = updatedValue
    abstractControl && abstractControl.setValue(updatedValue)
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
