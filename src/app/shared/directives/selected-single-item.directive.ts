import { Directive, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { NgControl, NgModel } from '@angular/forms';

@Directive({
  selector: '[selecteSingleItem]',
  standalone:true
})
export class SelectSingleItemDirective implements AfterViewInit {

  constructor(private ngModel: NgModel, private elementRef: ElementRef, private ngControl: NgControl, private renderer : Renderer2) { }

  ngAfterViewInit() {
    setTimeout(() => {
      let model = this.ngModel;
      let selectedObject = model.valueAccessor["selectedOption"];
      let list = model.valueAccessor["optionsToDisplay"];
      let optionValue = this.elementRef.nativeElement.attributes.optionvalue.nodeValue;
      if(selectedObject == null && list.length == 1)
      {
        const ctrl = this.ngControl.control;
        ctrl.setValue(list[0][optionValue], { emitEvent: false });
        this.renderer.addClass(this.elementRef.nativeElement, 'disabled');
      }
    }, 600);
  }
}

