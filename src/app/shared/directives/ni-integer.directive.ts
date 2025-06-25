import { Directive, ElementRef, HostListener, Injector, Input, Optional, Self, ChangeDetectorRef } from "@angular/core";
import { ControlContainer, NgControl } from "@angular/forms";
import { EMPTY } from "rxjs";

@Directive({
  selector: "input[type=text] input[niNumber]",
  standalone:true
})
export class NiIntegerDirective {
  @Input("minNum") minNum: number = 0;
  @Input("maxNum") maxNum: number = 0;

  constructor(private el: ElementRef, private injector: Injector ) { }

  private check(value: string) {
    return String(value).match(new RegExp(/^\d+$/));
  }

  resetInputControl() {
    const currentInputControl = this.injector.get(NgControl);
    currentInputControl.reset();
  }

  updateInputControl(oldValue: string) {
    const currentInputControl = this.injector.get(NgControl);
    if (currentInputControl) {
      currentInputControl.control.setValue(oldValue);
    }
  }

  private run(oldValue) {
      let currentValue: string = this.el.nativeElement.value;
      const curVal = Number(currentValue);
      if (currentValue !== "" && !this.check(currentValue)) {
        if(isNaN(oldValue) || oldValue == ""){
          this.resetInputControl();
        } else {
          this.el.nativeElement.value = oldValue;
        }      
      } else {
        if (this.maxNum > 0 && curVal > this.maxNum) {
          this.el.nativeElement.value = oldValue;
        }
      } 
  }
  
  
  private runForBlur(oldValue) {
      let currentValue: string = this.el.nativeElement.value;
      const curVal = Number(currentValue);
      if (this.minNum > 0 && curVal < this.minNum) {
        this.el.nativeElement.value = "";
      }
      else{
        this.run(this.el.nativeElement.value);
      }
  }
  /*
  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    this.run(this.el.nativeElement.value);
  }

  @HostListener("onKeyup", ["$event"])
  onKeyup(event: KeyboardEvent) {
    this.run(this.el.nativeElement.value);
  }
  */
 
  @HostListener("keypress", ["$event"])
  keyPress(event: KeyboardEvent) {
    // Check the key is a digit or not 
    if(/\d$/.test(event.key))
    {
      this.run(this.el.nativeElement.value);
    } 
    else
    {
      event.preventDefault();
    }
  }
   
  @HostListener("paste", ["$event"])
  onPaste(event: ClipboardEvent) { 
    this.run(this.el.nativeElement.value);
  }

  @HostListener("blur") onblur() {
    this.runForBlur(this.el.nativeElement.value);
  }

  // @HostListener('input', ['$event']) onInputChange(event) {
  //   const initalValue = this.el.nativeElement.value;
  //   this.el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
  //   if ( initalValue !== this.el.nativeElement.value) {
  //     event.stopPropagation();
  //   }
  // }
}
