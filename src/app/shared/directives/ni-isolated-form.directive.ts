import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm, NgModelGroup, FormGroupDirective } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[isolateForm]',
  standalone:true
})
export class IsolateForm1Directive implements OnInit, OnDestroy {
  @Input('appIgnoreChildValidation') childFormGroupName: string = '';

  private parentFormSubmitSubscription: Subscription;

  constructor(private parentFormGroup: FormGroupDirective, private ngForm: NgForm) {}

  ngOnInit(): void {debugger
    const childFormGroup = this.ngForm.form.get(this.childFormGroupName);
    if (childFormGroup) {
      this.parentFormSubmitSubscription = this.parentFormGroup.ngSubmit.subscribe(() => {
        // Disable validation for child form group on parent form submission
        childFormGroup.disable({ emitEvent: false });

        // Re-enable validation after a short delay to avoid affecting user interaction
        setTimeout(() => childFormGroup.enable({ emitEvent: false }), 0);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.parentFormSubmitSubscription) {
      this.parentFormSubmitSubscription.unsubscribe();
    }
  }
}






// import { Directive, OnInit, OnDestroy, ElementRef, Renderer2, HostListener, Injector } from '@angular/core';
// import { ControlContainer, NgControl, NgForm } from '@angular/forms';

// @Directive({
//   selector: '[isolateForm]'
// })
// export class IsolateFormDirective implements OnInit, OnDestroy {
//   private originalFormControl: NgForm | undefined;

//   constructor(private el: ElementRef, private renderer: Renderer2,private  form: ControlContainer) {}

//   ngOnInit() {
    
//     const form = this.el.nativeElement.closest('form');
//     if (form) {
//       this.originalFormControl = form['form'];
//       if (this.originalFormControl) {
//         // Remove the control from its parent form
//         const parentForm = form['form'] as NgForm;
//         if (parentForm) {
//           //parentForm.removeControl(this.originalFormControl);
//         }
//         // Apply isolated form control
//         this.applyIsolatedFormControl();
//       }
//     }
//   }

//   @HostListener('click')
//   onClick() {
//     debugger
//     console.log(this.el,'el elements');
//     console.log(this.form,'el form');
    
//     //this.keyboardSvc.fireKeyPressed(this.currentValue);
//     //const currentInputControl = this.injector.get(NgControl);
//     const form = this.el.nativeElement.closest('form');
//     if (form) {
//       debugger
//     }
//   }

//   ngOnDestroy() {
//     // Optionally, cleanup if needed
//   }

//   private applyIsolatedFormControl() {
//     if (this.originalFormControl) {
//       // Access the form control directly
//       const control = this.originalFormControl.control;
  
//       // Define the isolated form control behavior
//       const isolatedFormControl = {
//         setErrors: (errors: any) => {
//           control.setErrors(errors);
//         },
//         markAsDirty: () => {
//           this.renderer.removeClass(this.el.nativeElement, 'ng-pristine');
//           this.renderer.addClass(this.el.nativeElement, 'ng-dirty');
//           control.markAsDirty({ onlySelf: false });
//           control.markAsTouched({ onlySelf: false });
//         },
//       };
  
//       // Extend the original form control with isolated functionality
//       Object.assign(control, isolatedFormControl);
//     }
//   }
// }
