import { Directive, ElementRef, HostListener, Injector, Input } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[niDecimal]",
  standalone:true
})
export class NiDecimalDirective {
  @Input("niDecimal") niDecimal: number = 0;

  constructor(private el: ElementRef, private injector: Injector) { }

  private check(value: string) {
    let regExpString =
      "^\\s*((\\d+(\\.\\d{0," +
      this.niDecimal +
      "})?)|((\\d*(\\.\\d{1," +
      this.niDecimal +
      "}))))\\s*$";
    return String(value).match(new RegExp(regExpString));
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
    setTimeout(() => {
      let currentValue: string = this.el.nativeElement.value;
      if (currentValue !== "" && !this.check(currentValue)) {
        if(isNaN(oldValue) || oldValue == ""){
          this.resetInputControl();
        } else {
          //this.el.nativeElement.value = oldValue;
          this.updateInputControl(oldValue);
        }
      }
    });
  }


  @HostListener("keypress", ["$event"])
  keyPress(event: KeyboardEvent) {
    // Check the key is a decimal digit or not 
    if(/^\d*\.?\d*$/.test(event.key))
    {
      this.run(this.el.nativeElement.value);
    } 
    else
    {
      event.preventDefault();
    }
  }
  

  // @HostListener("keydown", ["$event"])
  // onKeyDown(event: KeyboardEvent) { 
  //   this.run(this.el.nativeElement.value);
  // }

  @HostListener("paste", ["$event"])
  onPaste(event: ClipboardEvent) {
    this.run(this.el.nativeElement.value);
  }
}
