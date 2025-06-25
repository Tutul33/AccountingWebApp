import { Directive, Input, HostBinding, HostListener, OnInit, OnDestroy } from '@angular/core';
import { NumericKeyboardService } from '../services/numeric-keyboard.service';
@Directive({
  selector: '[appNumKeyboardKey]',
  standalone:true
})
export class NumericKeyboardKeyDirective implements OnInit, OnDestroy {
  private _values: string[];

  @Input('appNumKeyboardKey') values: string;

  @HostBinding('innerText') currentValue: string;

  constructor(private keyboardSvc:NumericKeyboardService) { }

  ngOnInit() {
    this._values = this.values.split(' ');
    this.currentValue = this._values[0];
  }

  ngOnDestroy() {

  }

  

  @HostListener('click')
  onClick() {
    this.keyboardSvc.fireKeyPressed(this.currentValue);
  }
}