import { AfterViewInit, AfterViewChecked,Directive, ElementRef, HostListener, Input, OnInit, Optional, Renderer2, Self } from '@angular/core';
import { AbstractControl, ControlContainer, FormArray, FormGroup, NgForm, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
@Directive({
  selector: '[appIsolatedForm]',
  standalone:true
})
export class IsolatedFormDirective   implements OnInit {

  // @Input("isIsolated") isIsolated: boolean;
  //@Input("parentForm") parentForm: NgForm | undefined;
  private originalFormControl: NgForm | undefined;

  constructor(private el: ElementRef, private form: ControlContainer) {}

  ngOnInit() {

    setTimeout(() => {debugger
     // let rs= this.parentForm;
      let test=this.form["_parent"].form.controls['address'] as FormGroup;
      let controls = this.form["_parent"].form.controls  as FormGroup;
      // let rs =  controls.get('contactForm') as FormGroup;
      // rs.removeControl('address');

      const filteredControls = Object.keys(controls).reduce((acc, key) => {
        if (key !== 'address') {
          acc[key] = controls[key];
        }
        return acc;
      }, {});

      //(this.form["_parent"].form.controls  as FormGroup).removeControl('gender');
      console.log(filteredControls);
      return filteredControls;
      
    },50);
    
  }

  checkControl(controls: any) {
    Object.keys(controls).forEach((field) => {
      const control = controls[field];
      if (control instanceof UntypedFormControl) {
        let dirNodeValue = false;
        if((control as any).nativeElement) {
          const element = (control as any).nativeElement;
          
        }
      }
       
    });
  }

  getControlName = (control: AbstractControl) =>
    {
        var controlName = null;
        var parent = control["_parent"];
    
        // only such parent, which is FormGroup, has a dictionary 
        // with control-names as a key and a form-control as a value
        if (parent instanceof FormGroup)
        {
            // now we will iterate those keys (i.e. names of controls)
            Object.keys(parent.controls).forEach((name) =>
            {
                // and compare the passed control and 
                // a child control of a parent - with provided name (we iterate them all)
                if (control === parent.controls[name])
                {
                    // both are same: control passed to Validator
                    //  and this child - are the same references
                    controlName = name;
                }
            });
        }
        // we either found a name or simply return null
        return controlName;
    }

 
  private validateChildFields(formGroup: UntypedFormGroup) {debugger
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      // control.controls.array.forEach(element => {
        
      // });
      if (control instanceof UntypedFormControl) {
        if((<any>control).nativeElement){
          control.markAsTouched({ onlySelf: true });
          control.markAsDirty({ onlySelf: true });
        }        
      }
    })
  }

  @HostListener('submit')
  onClick() {
    
   // this.parentForm.form.controls

    console.log(this.el.nativeElement);
    // let r= this.isIsolated;
    // if (this.controlContainer && this.parentForm) {
    //   // Detach the child form group from the parent form group
    //   const parent = this.parentForm.form;
    //   const control = this.controlContainer.control;

    //   if (control && parent) {
    //     //parent.removeControl(control);
    //   }
    // }

    
  }

  
    
  }

