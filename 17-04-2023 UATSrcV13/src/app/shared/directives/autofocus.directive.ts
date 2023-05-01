import { Directive, ElementRef, Renderer2, Input, AfterViewInit } from '@angular/core';

@Directive({ selector: '[myFocus]' })
export class AutofocusDirective implements AfterViewInit {

  @Input('myFocus') isFocused!: boolean;

  constructor(private hostElement: ElementRef, private renderer: Renderer2) { }

  ngAfterViewInit() {
    if (this.isFocused) {
      this.renderer.selectRootElement(this.hostElement.nativeElement).focus();
    }
  }
}