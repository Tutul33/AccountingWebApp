import { Directive, Input, ElementRef, HostListener, Optional } from '@angular/core';
import { FormControlName, NgModel } from '@angular/forms';


@Directive({
  selector: '[niSelectedText]',
  standalone:true
})
export class NiSelectedTextDirective {

  @Input('niSelectedText') model: any;
  @Input() textProperty: string = '';
  @Input() valueProperty?: string = '';

  constructor(@Optional() private ngModelReactive: FormControlName, @Optional() private ngModel: NgModel, private elementRef: ElementRef) { }
  private dropdownList = [];
  private mainList = [];
  private optionLabel: any;
  private optionValue: any;

  @HostListener('ngModelChange', ['$event'])
  ngModelChange(event: any) {
    setTimeout(()=>{
    this.optionLabel = this.elementRef.nativeElement.attributes.optionlabel.nodeValue;
    this.optionValue = this.elementRef.nativeElement.attributes.optionvalue.nodeValue;
    let tagName = this.elementRef.nativeElement.tagName;
    let ids = '';
    let names = '';
    let count = 0;

   
     if (tagName === "P-DROPDOWN" || tagName === "P-SELECT") {
      const model = this.ngModel ? this.ngModel : this.ngModelReactive;
      let selectedObject = model.valueAccessor["selectedOption"];
     
      if (selectedObject === null) {
        this.mainList = model.valueAccessor["_options"];
        this.model[this.textProperty] = event;
        return;
      }

      let selectedText = selectedObject[this.optionLabel];
      this.model[this.textProperty] = selectedText;
    }
    else {
      const model: any = this.ngModel ? this.ngModel : this.ngModelReactive;
      let slectedValueList = model.viewModel;
      this.mainList = model.valueAccessor["_options"];

      let selectedObjectList = slectedValueList?.split(',') || [];

      for (let i = 0; i < selectedObjectList.length; i++) {
        for (var j = 0; j < this.mainList.length; j++) {
          if (selectedObjectList[i] == this.mainList[j][this.optionValue]) {
            if (count == 0) {
              ids += this.mainList[j][this.optionValue];
              names += this.mainList[j][this.optionLabel];
              count++;
            }
            else {
              ids += ", " + this.mainList[j][this.optionValue];
              names += ", " + this.mainList[j][this.optionLabel];
            }
            break;
          }
        }
      }

      this.model[this.textProperty] = names;
      if(this.valueProperty){
        this.model[this.valueProperty] = ids;
      }
      
    }
   },10)
  }

  @HostListener("keyup.enter", ['$event'])
  onMouseenter(event: any) {
    this.addToList(this.mainList, event.target.value)
  }

  private addToList(list, text) {
    if (typeof text === 'undefined' || text === '' || this._duplicateCheck(list, text)) {
      for (var i = 0; i < list.length; i++) {
        if (list[i][this.optionLabel].toLowerCase() === text.toLowerCase()) {
          setTimeout(() => { this.model[this.valueProperty] = list[i][this.optionValue]; }, 0);
          break;
        }
      }
      return;
    }

    let obj = {};
    let newId = 0;
    newId = this.mainList.length + 1;
    obj[this.optionValue] = newId;
    obj[this.optionLabel] = text;
    
    setTimeout(() => { this.model[this.valueProperty] = newId; }, 0);
    this.mainList.push(obj);
  }


  private _duplicateCheck(list: any[], text: any): boolean {
    if (typeof text === 'object') {
      for (let i = 0; i < list.length; i++) {
        if (list[i][this.optionLabel].toLowerCase() == text.toLowerCase()) {
          return true;
        }
      }
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i][this.optionLabel].toLowerCase() == text.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

}
