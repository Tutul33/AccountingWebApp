import {
    FormGroup,
    AbstractControl,
    ValidationErrors,
    ValidatorFn,
  } from '@angular/forms';
  
  export function createPasswordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
  
      if (!value) {
        return null;
      }
  
      const hasUpperCase = /[A-Z]+/.test(value);
  
      const hasLowerCase = /[a-z]+/.test(value);
  
      const hasNumeric = /[0-9]+/.test(value);
  
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;
  
      return !passwordValid ? { passwordStrength: true } : null;
    };
  }
  
  export function rangeValidator(
    startValue: number,
    endValue: number
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let val = Number(control.value);
      if(val === undefined){
        return null;
      } else if(val === null){
        return null;
      } else if(val < startValue){
        return { range: true };
      } else if(val > endValue){
        return { range: true };
      } else {
        return null;
      }  
    };
  }
  
  // export function emailValidator(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const value = control.value;
  
  //     if (!value) {
  //       return null;
  //     }
  
  //     const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  //     const isValid = regexp.test(value);
  
  //     return !isValid ? { emailValid: true } : null;
  //   };
  // }
  
  
  export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const trimmedValue = value ? value.trim() : '';
    return trimmedValue.length === 0 ? { whitespace: true } : null;
  }
  