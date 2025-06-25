import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[niHideCutCopyPasteToaster]',
  standalone:true
})
export class NiHideCutCopyPasteToasterDirective {
  constructor(private hostElement: ElementRef) {}

  @HostListener('select', [])
  onSelect() {
        this.hostElement.nativeElement.select(false);
  }

  // constructor() { }

  // @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
  //   e.preventDefault();
  // }

  // @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
  //   e.preventDefault();
  // }

  // @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent) {
  //   e.preventDefault();
  // }

  

  // constructor(el: ElementRef, renderer: Renderer2) {
  //   var events = 'select cut copy paste';
  //   events.split(' ').forEach(e => 
  //   renderer.listen(el.nativeElement, e, (event) => {
  //     event.preventDefault();
  //     })
  //   );

  // }
}