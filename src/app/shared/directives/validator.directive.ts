import {
  Directive,
  ElementRef,
  HostListener,
  Injector,
  Input,
  OnInit,  
  Renderer2,
  
} from "@angular/core";
import {
  NgControl,
  UntypedFormControl,
  UntypedFormGroup,
  UntypedFormArray,
  ValidationErrors,
  Validators,
} from "@angular/forms";


import { noWhitespaceValidator, rangeValidator } from "../models/custom-validators";
import { AddValidatorsDirective } from "./add-validators.directive";


interface findingObject {
  found: boolean;
  name: string;
}

@Directive({
  selector: "[inputValidator]",
  standalone:true
})
export class ValidatorDirective implements OnInit {
  @Input("inputValidator") inputValidator?: any = true;
  @Input("isDynamic") isDynamic?: boolean = false;

  curNativeElem: any = null;
  currentControlName: string = null;
  currentValidObj: string = null;
  elmToolTip: any;
  submitted = false;

  isModelChange = false;
  allErrors: ValidationErrors[] = [];

  constructor(
    private addValidatorDirective: AddValidatorsDirective,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private injector: Injector,
    private ngControl:NgControl
  ) {
    this.curNativeElem = elementRef.nativeElement;
  }

  ngOnInit() {
    setTimeout(() => {
      this.setCurrentValidationObjectName();
    });
  }

  @HostListener("ngModelChange", ["$event"]) ngModelChange(event: any) {
    setTimeout(() => {
      this.isModelChange = true;
      this.handlingVaidation(this.prepareInputControl().control);
    });
  }

  prepareInputControl() {
    const currentInputControl = this.injector.get(NgControl);
    this.currentControlName = currentInputControl.name.toString();
    return currentInputControl;
  }

  @HostListener("mouseenter")
  onMouseEnter() {
    this.curNativeElem = this.elementRef.nativeElement;
    const inputControl = this.prepareInputControl();

    if (inputControl.dirty && inputControl.touched && inputControl.invalid) {
      this.prepareValidationMessage(inputControl);
      if (!this.elmToolTip) {
        this.showHint(this.allErrors);
      }
    }
  }

  @HostListener("mouseleave")
  onMouseLeave() {
    if (this.elmToolTip) {
      this.removeHint();
    }
  }

  handlingVaidation(control: any) {
    this.inputValidator = this.inputValidator == true || this.inputValidator == "true" || this.inputValidator == undefined || this.inputValidator == "" || this.inputValidator == null ? true : false;
   
    if(this.inputValidator == false) {
      control.setErrors(null);
      control.clearValidators();
      control.updateValueAndValidity();
      this.removeColorIfValidationTrue(control);
    } else {
      // Get validation message model from component      
      const vldObj = !this.addValidatorDirective.validateModel ? {} : this.addValidatorDirective.validateModel;

      // Get exact validation message portion from full model like order, orderItem
      let exactVldModel = this.currentValidObj != null ? vldObj[this.currentValidObj] : {};

      // Current control name
      let ctrlName = control.nativeElement.name || "";
      ctrlName = ctrlName ? ctrlName : control.nativeElement.attributes['name']?.value || "";

      // Check is control name key exist into validation message model
      const isCtrlNameInObjExist = Object.keys(exactVldModel).includes(ctrlName);
      
      if (isCtrlNameInObjExist && this.inputValidator) {
        const propertyVal = exactVldModel[ctrlName];
        const validateControlProperties = Object.keys(propertyVal) || [];

        if(control.status == 'VALID' && validateControlProperties.length) {
          //this.setValidator(propertyVal, control);
          if(typeof control.value === 'string')
          {
            const trimmedValue = control.value ? control.value.trim() : '';
            // control.setValue(trimmedValue, { emitEvent: false });
              if((control.value != null || control.value != '') && trimmedValue.length == 0 &&  validateControlProperties.includes('required'))
              {
                control.addValidators(noWhitespaceValidator);
                control.updateValueAndValidity();
              }
          }
        }
      }

      this.validateOnControl(control);
    }
  }

  validateOnControl(control: any) {
    this.curNativeElem = control.nativeElement || null;
    const elementType = this.curNativeElem.attributes["type"]?.nodeValue || null;
    const outlineInputList = ["checkbox", "radio"];
    
    if(control.dirty || control.touched) {
      control.markAsTouched({ onlySelf: true });
      control.markAsDirty({ onlySelf: true });
    }
    // if(this.isModelChange)
    // {
    //   if(control.invalid == false && (control.value == "" || control.value == null) )
    //   {
    //     control.setValidators(Validators.required);
    //     control.updateValueAndValidity();
    //   }
    // }
    
    if (control.dirty && control.touched && control.invalid) {
      this.applyColorIfValidaionFalse(control, elementType, outlineInputList);
    } else {
      this.removeColorIfValidationTrue(control);
    }
  }

  /*setValidator(propertyVal: any, control: any) {
    let validatorFucnList = [];
    Object.keys(propertyVal).forEach((key: string) => {
      switch (key) {
        case "required":
          validatorFucnList.push(Validators.required);
          break;
        case "email":
          validatorFucnList.push(Validators.email);
          break;
        case "minlength":
          validatorFucnList.push(
            Validators.minLength(propertyVal[key].length)
          );
          break;
        case "maxlength":
          validatorFucnList.push(
            Validators.maxLength(propertyVal[key].length)
          );
          break;
        case "pattern":
          validatorFucnList.push(
            Validators.pattern(propertyVal[key].regex)
          );
          break;
        case "range":
          let start = propertyVal[key].startValue || 0;
          let end = propertyVal[key].endValue || 9999999999;
          if (start >= end) start = 0;
          validatorFucnList.push(rangeValidator(start, end));
          break;
        case "customValidator":
          let method = propertyVal[key].method;
          validatorFucnList.push(method);
          break;
        default:
          break;
      }
    });

    control.markAsTouched({ onlySelf: true });
    control.markAsDirty({ onlySelf: true });
    control.setValidators(validatorFucnList);
    control.updateValueAndValidity();
  }*/

  convertBool(val: string) {
    if (val == "true") {
      return true;
    } else if(val == "false") {
      return false;
    }
  }

  applyColorIfValidaionFalse(control: any, elementType: any, outlineInputList: any) {
    if (elementType != null && outlineInputList.includes(elementType)) {
      this.setStyleAttribute(control.nativeElement, "outline", "2px solid red");
    } else if (elementType != null && !outlineInputList.includes(elementType)) {
      this.setStyleAttribute(control.nativeElement, "border-color", "red");
    } else if (control.nativeElement.tagName === "SELECT") {
      this.setStyleAttribute(control.nativeElement, "border-color", "red");
    }
     else if (control.nativeElement.tagName === "TEXTAREA") {
      this.setStyleAttribute(control.nativeElement, "border-color", "red");
    }
     else {
      const pElement = control.nativeElement.querySelector(".p-component") || control.nativeElement.querySelector(".p-editor-content");
      this.setStyleAttribute(pElement, "border-color", "red");
    }
  }

  setStyleAttribute(element, attr, styleValue) {
    this.renderer.setStyle(element, attr, styleValue);
  }

  removeColorIfValidationTrue(control: any) {
    let element = control.nativeElement;

    const tagName = element?.tagName;
    if (tagName.includes("P-")) {
      element = control.nativeElement.querySelector(".p-component") || control.nativeElement.querySelector(".p-editor-content");
    }

    const borderStyle = element.attributes["style"]?.nodeValue || null;
    const isOutlineColorExist =
      borderStyle !== null ? borderStyle.includes("outline") : false;

    if (isOutlineColorExist) {
      this.renderer.removeStyle(element, "outline");
    } else {
      this.renderer.removeStyle(element, "border-color");
    }

    const isElementToolTipExist = this.elmToolTip || null;
    if (isElementToolTipExist !== null) {
      this.removeHint();
    }
  }

  prepareValidationMessage(control: any) {
    const controlErrors: ValidationErrors = control.errors;
    if (controlErrors != null) {
      this.allErrors.length = 0;
      Object.keys(controlErrors).forEach((keyError) => {
        if (keyError) {
          if(keyError != 'whitespace')
          {
            const message = controlErrors[keyError].message || null;
            const ctrlName = this.currentControlName;
            const text = this.assignVaidateMessage(ctrlName, keyError, message);
  
            const obj: any = {};
            obj[keyError] = text;
            this.allErrors.push(obj);
          }
          
        }
      });
    }
  }

  private assignVaidateMessage(ctrlName: string, keyError: string, message:string) {
    return this.getPropertyValueFromObj(
      this.addValidatorDirective.validateModel,
      
      ctrlName,
      keyError,
      message
    );
  }

  private getPropertyValueFromObj(
    obj: any,
    ctrlName: string,
    keyError: string,
    message:string
  ) {
    let msg = "";
    let originalObject = this.currentValidObj != null ? obj[this.currentValidObj] : {};    
    const isCtrlNameInObjExist = Object.keys(originalObject).includes(ctrlName);

    if (isCtrlNameInObjExist) {
      let valOrObject = originalObject[ctrlName][keyError];
      if (typeof valOrObject === "object") {
        msg += valOrObject.message || "";
      } else {
        msg += valOrObject || "";
      }
    }

    return message ? message : msg ? msg :  `${keyError} validation failed`;
  }

  setCurrentValidationObjectName() {
    let elem = this.elementRef.nativeElement.parentElement;
    this.recurse(elem);
  }

  recurse(elem: any) {
    if (elem.attributes.length) {
      let findingObj: findingObject = this.findValidateObj(elem.attributes);
      if (findingObj.found) {
        this.currentValidObj = findingObj.name;
        return;
      } else {
        if (!elem.parentElement) {
          return;
        }
        this.recurse(elem.parentElement);
      }
    } else {
      if (!elem.parentElement) {
        return;
      }
      this.recurse(elem.parentElement);
    }
  }

  findValidateObj(attr): findingObject {
    let foundObj = { found: false, name: "" } as findingObject;
    if (attr.length) {
      for (let i = 0; i < attr.length; i++) {
        let attribute = attr[i];
        let compareVal = attribute.localName || "";
        if (compareVal == "validationmessage") {
          foundObj.found = true;
          foundObj.name = attribute.nodeValue;
          break;
        }
      }
    }
    return foundObj;
  }

  // Helper recursive handler for validation invoke from component
  validateAllFormFields(formGroup: UntypedFormGroup) {
    this.validateAllFields(formGroup);
  }

  private validateAllFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        if((<any>control).nativeElement){
          control.markAsTouched({ onlySelf: true });
          control.markAsDirty({ onlySelf: true });
          this.handlingVaidation(control);
        }        
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      } else if (control instanceof UntypedFormArray) {
        if (control.controls.length) {
          control.controls.forEach((formGrp: UntypedFormGroup) => {
            this.validateAllFormFields(formGrp);
          });
        }
      }
    });
  }

  removeHint() {
    this.renderer.removeClass(this.elmToolTip, "tooltip");
    this.renderer.removeChild(document.body, this.elmToolTip);
    this.elmToolTip = null;
  }

  showHint(erros: any) {
    if (erros.length > 0) {
      this.elmToolTip = this.renderer.createElement("span");
      const br = this.renderer.createElement("br");

      erros.forEach((errObj, key) => {
        // Getting first property value from error object
        const text = errObj[Object.keys(errObj)[0]];

        const textNode = this.renderer.createText(text);
        this.renderer.appendChild(this.elmToolTip, textNode);

        if (key + 1 !== erros.length) {
          this.renderer.appendChild(this.elmToolTip, br);
        }
      });

      this.renderer.appendChild(document.body, this.elmToolTip);
      this.renderer.addClass(this.elmToolTip, "customTooltip");

      const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
      const pageYOffset = window.pageYOffset;

      const top = hostPos.bottom + pageYOffset;
      const left = hostPos.left;

      this.renderer.setStyle(this.elmToolTip, "top", `${top}px`);
      this.renderer.setStyle(this.elmToolTip, "left", `${left}px`);
      this.renderer.setStyle(this.elmToolTip, "z-index", '9999999999');
    }
  }
}
