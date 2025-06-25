import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: "input[type=text] input[niSelect], input[type=number]input[niSelect]",
  standalone:true
})
export class NiSelectDirective {

  constructor(private el: ElementRef) { }

  @HostListener('focus', ['$event']) onInputFocus(event) {
    event.target.select();
  }

}
