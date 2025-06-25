import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[niDbclickPrevent]',
  standalone:true
})
export class NiDbclickPreventDirective {
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  @HostListener('click', ['$event', '$event.target'])
  clickEvent(event) {
    const elementRef = this.elementRef;
    const renderer = this.renderer;
    const element = (event.srcElement.disabled === undefined) ? event.srcElement.parentElement : event.srcElement;
    if (elementRef.nativeElement.localName == 'li' || elementRef.nativeElement.localName == 'a' || elementRef.nativeElement.localName == 'button') {
      renderer.addClass(element, 'disabled');
    } else {
      element.setAttribute('disabled', true);
    }

    setTimeout(function () {
      if (elementRef.nativeElement.localName == 'li' || elementRef.nativeElement.localName == 'a' || elementRef.nativeElement.localName == 'button') {
        renderer.removeClass(element, 'disabled');
      } else {
        element.removeAttribute('disabled');
      }
    }, 1000);
  }
}

