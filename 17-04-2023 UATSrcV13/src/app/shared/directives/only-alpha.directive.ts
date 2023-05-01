import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: 'input[appOnlyAlpha]'
})
export class OnlyAlphaDirective {
    prevKey!: number;

    constructor(private _el: ElementRef,
        private control: NgControl) { }
    // @HostListener('keydown', ['$event']) onKeyDown(event: { keyCode: any; }) {
    //     var k: number;
    //     k = event.keyCode;  //         k = event.keyCode;  (Both can be used)
    //     if (this.prevKey == 32 && this.prevKey == k) {
    //         this.prevKey = k;
    //         return false;
    //     }
    //     this.prevKey = k;
    //     return ((k > 64 && k < 91) || k == 8 || k == 9 || k == 32 || (k > 36 && k < 41));
    // }
    @HostListener('input', ['$event']) onInputChange(event: any) {
        const abstractControl = this.control.control;
        const initalValue = this._el.nativeElement.value;
        const updatedValue = initalValue.replace(/[^A-Za-z\s]*/g, '');
        this._el.nativeElement.value = updatedValue
        abstractControl && abstractControl.setValue(updatedValue)
        if (initalValue !== this._el.nativeElement.value) {
            event.stopPropagation();
        }
    }
}