import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, Validators, ValidationErrors, UntypedFormControl } from '@angular/forms';
import { UntypedFormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomValidationService {

  constructor() { }

  pwdMatchValidator(frm: UntypedFormGroup) {
    let pass = frm.get('password').value;
    let confPass = frm.get('confirmPassword').value;
    return pass === confPass ? null : { 'mustMatch': true };
  }

  validateCcNumber(control: UntypedFormControl): ValidationErrors {
    if (!(control.value.startsWith('37')
      || control.value.startsWith('4')
      || control.value.startsWith('5'))
    ) {
      // Return error if card is not Amex, Visa or Mastercard     
      return { creditCard: 'Your credit card number is not from a supported credit card provider' };
    } else if (control.value.length !== 16) {
      // Return error if length is not 16 digits
      return { creditCard: 'A credit card number must be 16-digit long' };
    }
    // If no error, return null  
    return null;
  }

  patternValidator(): ValidatorFn {
    //Validators.nullValidator
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      const regex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$');
      const valid = regex.test(control.value);
      return valid ? null : { invalidPassword: true };
    };
  }

  passwordMatchValidator(frm: UntypedFormGroup): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let pass = frm.get('password').value;
      let confPass = frm.get('confirmPassword').value;
      return pass === confPass ? null : { 'mustMatch': true };
    };
  }

  blue(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
      control.value?.toLowerCase() === 'blue'
        ? null : { wrongColor: control.value };
  }

  forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = nameRe.test(control.value);
      return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
  }

  RepeatPasswordValidator(group: UntypedFormGroup) {
    const password = group.controls.password.value;
    const passwordConfirmation = group.controls.passwordAgain.value;

    return password === passwordConfirmation ? null : { passwordsNotEqual: true }
  }

  MatchPassword(password: string, confirmPassword: string) {
    return (formGroup: UntypedFormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (!passwordControl || !confirmPasswordControl) {
        return null;
      }

      if (confirmPasswordControl.errors && !confirmPasswordControl.errors.passwordMismatch) {
        return null;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    }
  }
}
