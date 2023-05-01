import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[blockPasteAndDrop]'
})
export class BlockPasteDropDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    let input: string;
    input = String.fromCharCode(e.which);
    return !!/[\d\s]/.test(input);
  }
  @HostListener('drop', ['$event']) blockdragEnded(e: KeyboardEvent) {
    let input: string;
    input = String.fromCharCode(e.which);
    return !!/[\d\s]/.test(input);
  }

}
