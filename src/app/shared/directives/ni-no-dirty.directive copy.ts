import { AfterViewInit, Directive, HostListener, Injector } from '@angular/core';
import { NgControl, NgModel } from '@angular/forms'; // Import NgModel

@Directive({
    selector: '[noDirty]',
    standalone:true
})
export class NoDirtyDirective{
  currentControlName: string = null;

  constructor(private control: NgControl) {}

  @HostListener('blur') onBlur() {debugger
    if (this.control.control) {
      this.control.control.markAsPristine();
      this.control.control.markAsUntouched();
    }
  }

  // constructor(private injector: Injector){
  //   debugger
  //   let s=4;
  // }
    // constructor(private ngModel: NgModel) {
    //   debugger
    //     // Access the form control (ngModel) and set markAsDirty to false
    //     this.ngModel.control.markAsDirty({ onlySelf: false });
    // }

  //   @HostListener("ngModelChange", ["$event"]) ngModelChange(event: any) {
  //     setTimeout(() => {
  //       this.validateOnControl(this.prepareInputControl().control);
  //     });
  //   }

  //   prepareInputControl() {debugger
  //     const currentInputControl = this.injector.get(NgControl);
  //     this.currentControlName = currentInputControl.name.toString();
  //     return currentInputControl;
  //   }

  //   validateOnControl(control: any) {debugger
  //   if(control.dirty || control.touched) {
  //     control.markAsTouched(false);
  //     control.markAsDirty(false);
  //   }
  // }
}