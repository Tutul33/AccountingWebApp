import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnInit,
  Optional,
  Self,
} from "@angular/core";
import {
  ControlContainer,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  FormControl,
} from "@angular/forms";

import { rangeValidator } from "../models/custom-validators";

interface findingObject {
  found: boolean;
  name: string;
}

@Directive({
  selector: "[addValidators]",
  exportAs: 'addValidators',
  standalone:true
})
export class AddValidatorsDirective implements OnInit, AfterViewInit {
  @Input("addValidators") validateModel: any;
  currentValidObj: string = null;
  currentObj: any;

  constructor(
    private elementRef: ElementRef,
    @Optional() @Self() private formGroup: ControlContainer
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.setCurrentValidationObjectName();
      this.currentObj = this.validateModel[this.currentValidObj];
      if (this.formGroup !== null) {
        if (this.formGroup?.control) {
          const controls = (this.formGroup?.control as UntypedFormGroup).controls;
          this.addValidation(controls);
        }
      }
    });
  }

  addValidation(controls: any) {
    Object.keys(controls).forEach((field) => {
      const control = controls[field];
      if (control instanceof UntypedFormControl) {
        let dirNodeValue = false;
        if((control as any).nativeElement) {
          const element = (control as any).nativeElement;
          let inputValidator = element.attributes["inputvalidator"];
          let isReadonly = element.attributes["readonly"];
          //if(isReadonly == undefined) dirNodeValue = inputValidator == undefined ? false : true;
          if(isReadonly == undefined) 
          {
            if(inputValidator == undefined)
            {
              dirNodeValue = false;
            }
            else
            {
              if(inputValidator.value != "false" || inputValidator.value != false)
              {
                dirNodeValue = true;
              }
            }
          }
        }

        let isRequired = dirNodeValue; // ? this.convertBool(dirNodeValue) : true;
        let isDynamic = false; //  dynamicAttr ? this.convertBool(dynamicAttr) : false;

        if(isRequired) {
          const propertyVal = this.currentObj ? this.currentObj[field] : null;
          if (propertyVal) {
            const validateControlProperties = Object.keys(propertyVal) || [];
            if (validateControlProperties.length) {
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
  
              controls[field].setValidators(validatorFucnList);
              controls[field].updateValueAndValidity();
            }
          } else {
            if(isDynamic) {
              let validatorFucnArray = [];
              validatorFucnArray.push(Validators.required);
              controls[field].setValidators(validatorFucnArray);
              controls[field].updateValueAndValidity();
            }
          }
        }        
      }
    });
  }

  convertBool(val: string) {
    if (val == "true") {
      return true;
    } else if(val == "false") {
      return false;
    }
  }

  setCurrentValidationObjectName() {
    let elem = this.elementRef.nativeElement;
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
}
