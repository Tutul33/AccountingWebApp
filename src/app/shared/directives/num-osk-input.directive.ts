import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  ComponentRef,
  EmbeddedViewRef
} from "@angular/core";
import { Subscription } from "rxjs";
import { NumericKeyboardService } from "../services/numeric-keyboard.service";
import { NgControl } from "@angular/forms";
import { NumericKeyboardComponent } from "../components/numeric-keyboard/numeric-keyboard.component";

@Directive({
  selector: "[appNumOskInput]",
  standalone:true
})
export class NumOskInputDirective {
  @Input("appNumOskInput") isDecimal?: boolean = false;

  private keySubscription: Subscription;
  private backspaceSubscription: Subscription;
  private enterSubscription: Subscription;
  private componentRef: ComponentRef<any> | null = null;

  constructor(
    private el: ElementRef, 
    private ngControl: NgControl,
    private keyboardSvc: NumericKeyboardService,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver, 
    private injector: Injector
  ) 
  {

  }

  isTouchScreendevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
  }


  @HostListener("focus")
  private onFocus() {
    try {
      if (this.isTouchScreendevice()) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NumericKeyboardComponent);
        this.componentRef = componentFactory.create(this.injector);
        this.appRef.attachView(this.componentRef.hostView);
        const [appKeyBoardElement] = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes;
        const {top, left, bottom, height} = this.el.nativeElement.getBoundingClientRect();
        this.componentRef.instance.left = Math.round(left) - 2000;
        this.componentRef.instance.top = Math.round(bottom + window.pageYOffset);
        this.componentRef.instance.isDecimal = this.isDecimal == true ? true : false;
        this.componentRef.instance.spaceAbove = top;
        this.componentRef.instance.spaceBelow = window.innerHeight - bottom;
        this.componentRef.instance.inputHeight = height;

        document.body.appendChild(appKeyBoardElement);

        
        this.subscribeToKeyboardEvents();
      }
    } catch (error) {
      // throw error;
    }
  }

  @HostListener("blur")
  private onBlur() {
    this.destroy();
  }
  @HostListener('window:keyup')
  keyEvent() {
    this.destroy();
  }
  @HostListener('window:resize')
  onResize() {
    this.destroy();
  }
  @HostListener('window:wheel')
  private onWheel() {
    this.destroy();
  }
  private destroy(){
    if (this.isTouchScreendevice()) {
      this.unsubscribeFromKeyboardEvents();
      this.el.nativeElement.dispatchEvent(new Event('keyup'));
      this.el.nativeElement.dispatchEvent(new Event('change'));

      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  private subscribeToKeyboardEvents() {
    this.keySubscription = this.keyboardSvc.keyPressed.subscribe(key =>
      this.onKey(key)
    );
    this.backspaceSubscription = this.keyboardSvc.backspacePressed.subscribe(_ =>
      this.onBackspace()
    );
    this.enterSubscription = this.keyboardSvc.enterPressed.subscribe(_ =>
      this.onEnter()
    );
  }

  private unsubscribeFromKeyboardEvents() {
    if (this.keySubscription)
      this.keySubscription.unsubscribe();
    if (this.backspaceSubscription)
      this.backspaceSubscription.unsubscribe();
    if (this.enterSubscription)
      this.enterSubscription.unsubscribe();
  }

  private onKey(key: string) {
    // TODO Refactor this into a single method with the code in onBackspace
    let element = this.el.nativeElement,
      start = element.selectionStart,
      end = element.selectionEnd;

    let maxLength =  this.el.nativeElement.attributes['maxlength']?.nodeValue || null;
    if(Number(maxLength) > 0)
    {
      if(element.value.length == Number(maxLength))
      {
        return;
      }
    }
    element.value = element.value.substr(0, start) + key + element.value.substr(end);
    this.ngControl.control.setValue(element.value, { emitEvent: true });

    element.focus();
    element.selectionStart = element.selectionEnd = start + 1;

  }

  private onBackspace() {
    let element = this.el.nativeElement,
      start = element.selectionStart,
      end = element.selectionEnd;

    if (start == 0 && end == 0) {
      return;
    }

    if (start == end) {
      start--;
    }

    element.value = element.value.substr(0, start) + element.value.substr(end);
    this.ngControl.control.setValue(element.value);
    element.focus();
    element.selectionStart = element.selectionEnd = start;

  }
  private onEnter() {
    this.el.nativeElement.dispatchEvent(new Event('keyup'));
    this.el.nativeElement.blur();
  }
}
