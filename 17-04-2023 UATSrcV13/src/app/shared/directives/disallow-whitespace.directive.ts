import { Directive } from "@angular/core";

@Directive({
  selector: "[appDisallowWhitespace]",
  host: {
    "(keydown)": "onKeyUp($event)",
  },
})
export class DisallowWhitespaceDirective {
  constructor() { }

  onKeyUp($event: any) {
    if ($event.keyCode === 32) {
      $event.preventDefault();
    }
  }
}
