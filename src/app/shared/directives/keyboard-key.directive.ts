import { Directive, Input, HostBinding, HostListener, OnInit, OnDestroy } from '@angular/core';
import { KeyboardService } from '../services/keyboard.service'; 
import { Subscription } from 'rxjs';
@Directive({
  selector: '[appKeyboardKey]',
  standalone:true
})
export class KeyboardKeyDirective implements OnInit, OnDestroy {
  private _values: string[];
  private isShifted: boolean;
  private isAlt: boolean;

  @Input('appKeyboardKey') values: string;

  @HostBinding('innerText') currentValue: string;

  private shiftChangedSubscription: Subscription;
  private altChangedSubscription: Subscription;

  constructor(private keyboard:KeyboardService) { }

  ngOnInit() {
    this._values = this.values.split(' ');
    this.currentValue = this._values[0];

    this.shiftChangedSubscription = this.keyboard.shiftChanged.subscribe(shift => {
      this.isShifted = shift;
      this.updateCurrentValue();
    });
    this.altChangedSubscription = this.keyboard.altChanged.subscribe(alt => {
      this.isAlt = alt;
      this.updateCurrentValue();
    });
  }

  ngOnDestroy() {
    this.shiftChangedSubscription.unsubscribe();
    this.altChangedSubscription.unsubscribe();
  }

  updateCurrentValue() {
    if (!this.isAlt)  {
      if (!this.isShifted) {
        this.currentValue = this._values[0];
      }
      else {
        this.currentValue = this._values[0].toUpperCase();
      }
    }
    else {
      if (!this.isShifted) {
        this.currentValue = this._values[1];
      }
      else {
        this.currentValue = this._values[2];
      }
    }
  }

  @HostListener('click')
  onClick() {
    this.keyboard.fireKeyPressed(this.currentValue);
  }
}