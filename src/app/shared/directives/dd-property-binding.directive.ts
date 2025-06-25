import {
  Directive,
  Input,
  ElementRef,
  HostListener,
  Optional,
} from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[cusPropertyBinding]',
  standalone:true
})
export class DdPropertyBindingDirective {
  @Input('cusPropertyBinding') model: any;
  @Input() textProperty = '';
  @Input() valueProperty = '';

  constructor(
    @Optional() private ngModel: NgModel,
    private elementRef: ElementRef
  ) {}

  @HostListener('ngModelChange', ['$event'])
  ngModelChange(event: any) {
    const optionLabel =
      this.elementRef.nativeElement.attributes.optionlabel.nodeValue;
    const optionValue =
      this.elementRef.nativeElement.attributes.optionvalue.nodeValue;
    const tagName = this.elementRef.nativeElement.tagName;
    let ids = '';
    let names = '';
    let count = 0;

    if (tagName === 'P-DROPDOWN') {
      const selectedObject = this.ngModel.valueAccessor['selectedOption'];
      const selectedText = selectedObject[optionLabel];
      this.model[this.textProperty] = selectedText;
    } else {
      const selectedObjectList = this.ngModel.viewModel;
      const mainList = this.ngModel.valueAccessor['_options'];

      for (let i = 0; i < selectedObjectList.length; i++) {
        for (let j = 0; j < mainList.length; j++) {
          if (selectedObjectList[i] === mainList[j][optionValue]) {
            if (count === 0) {
              ids += mainList[j][optionValue];
              names += mainList[j][optionLabel];
              count++;
            } else {
              ids += ',' + mainList[j][optionValue];
              names += ',' + mainList[j][optionLabel];
            }
            break;
          }
        }
      }
      this.model[this.textProperty] = names;
      this.model[this.valueProperty] = ids;
    }
  }
}
