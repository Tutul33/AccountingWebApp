import {
  Directive,
  ElementRef,
  HostListener,
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  ComponentRef,
  EmbeddedViewRef
} from "@angular/core";
import { KeyboardService } from "../services/keyboard.service";
import { Subscription } from "rxjs";
import { NgControl } from "@angular/forms";
import { KeyboardComponent } from "../components/keyboard/keyboard.component";

@Directive({
  selector: "[appOskInput]",
  standalone:true
})
export class OskInputDirective {
  private keySubscription: Subscription;
  private backspaceSubscription: Subscription;
  private enterSubscription: Subscription;
  private componentRef: ComponentRef<any> | null = null;

  constructor(
      private el: ElementRef, 
      private ngControl: NgControl, 
      private keyboardSvc: KeyboardService,
      private appRef: ApplicationRef,
      private componentFactoryResolver: ComponentFactoryResolver, 
      private injector: Injector
    ) { }

  isTouchScreendevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
  }
  
  @HostListener("focus")
  private onFocus() {
    try {
      if (this.isTouchScreendevice()) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(KeyboardComponent);
        this.componentRef = componentFactory.create(this.injector);
        this.appRef.attachView(this.componentRef.hostView);
        const [appKeyBoardElement] = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes;
        const {top, left, bottom, height} = this.el.nativeElement.getBoundingClientRect();
        this.componentRef.instance.left = Math.round(left) - 2000;
        this.componentRef.instance.top = Math.round(bottom + window.pageYOffset);
        this.componentRef.instance.spaceAbove = top;
        this.componentRef.instance.spaceBelow = window.innerHeight - bottom;
        this.componentRef.instance.inputHeight = height;

        document.body.appendChild(appKeyBoardElement);
        this.subscribeToKeyboardEvents();
      }
    } catch (error) {
      
    }
  }
  @HostListener("blur")
  private onBlur() {
    this.destroy();
  }
  @HostListener('window:keyup', ['$event'])
  private keyEvent(event: KeyboardEvent) {
    this.destroy();
  }
  @HostListener('window:resize', ['$event'])
  private onResize(event) {
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
    let element = this.el.nativeElement,
      start = element.selectionStart,
      end = element.selectionEnd;

    element.value = element.value.substr(0, start) + key + element.value.substr(end);

    this.ngControl.control.setValue(element.value);
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
    this.el.nativeElement.dispatchEvent(new KeyboardEvent('keyup',{ key: 'Enter' }));
    this.el.nativeElement.blur();
  }
}
