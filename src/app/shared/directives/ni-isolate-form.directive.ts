import { Directive, Host, OnInit, Optional, SkipSelf } from '@angular/core';
import { NgForm, NgModelGroup } from '@angular/forms';

@Directive({
  selector: '[isolateForm]',
  standalone:true
})
export class IsolateFormDirective implements OnInit {
  constructor(
    @Optional() private ngModelGroup: NgModelGroup,
    @Host() @Optional() @SkipSelf() private parentForm: NgForm
  ) {}
/*
@Optional():
# Purpose: Marks a dependency as optional, meaning if Angular cannot find the dependency, it won’t throw an error, and instead, the injected value will be null.
# Usage: @Optional() is used when the existence of a dependency is uncertain or context-dependent.

@Host():
# Purpose: Limits the search for a dependency to the host component (the element on which the directive is applied). It prevents Angular from looking for the dependency in ancestor elements or components beyond the host.
# Usage: @Host() is used when you want to ensure that the dependency is provided by the current component or its directives, not by any ancestors further up the component tree.

@SkipSelf():
# Purpose: Tells Angular to skip the current element’s injector when resolving a dependency and look for it in the parent or ancestor elements.
# Usage: @SkipSelf() is used when you need to inject a dependency from a parent component or directive, not from the current one.
 
# With @Host() @SkipSelf(), Angular skips the local injector (the one tied to the child form group) and looks in the parent context, 
  which contains the actual NgForm associated with the parent form. This allows your directive to interact with the parent form and 
  detach the ngModelGroup as intended.
*/
  ngOnInit(): void {
    setTimeout(() => {
      // Detach the form group from parent form
    if (this.ngModelGroup && this.parentForm) {
      // Remove the form group from parent form controls
      const groupName = this.ngModelGroup.name;
      if (groupName && this.parentForm.form.get(groupName)) {
        this.parentForm.form.removeControl(groupName);
      }
    }
    }, 0);
  }
/*
Conclusion:
# The combination of these decorators allows you to precisely control the resolution of dependencies in a nested form structure. You ensure that:

# The NgModelGroup (if it exists) is accessed for nested form groups.
  The NgForm is correctly retrieved from the parent form, ensuring that the directive interacts with the correct parent form, not the child form group.

# This approach is especially useful when working with complex forms that have multiple nested form groups, and you need to detach or isolate certain 
  parts of the form without affecting the overall form structure.
  */
}

