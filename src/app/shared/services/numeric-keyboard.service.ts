import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';

@Injectable()
export class NumericKeyboardService {


  private _keyboardRequested: Subject<any>;

  private _keyPressed: Subject<string>;
  private _backspacePressed: Subject<void>;
  private _enterPressed: Subject<void>;

  constructor() {
    this._keyboardRequested = new Subject<any>();

    this._keyPressed = new Subject<string>();
    this._backspacePressed = new Subject<void>();
    this._enterPressed = new Subject<void>();
  }

  get keyboardRequested() {
    return this._keyboardRequested;
  }

  get keyPressed() {
    return this._keyPressed;
  }

  get backspacePressed() {
    return this._backspacePressed;
  }

  get enterPressed() {
    return this._enterPressed;
  }

  fireKeyboardRequested(value:any) {
    this._keyboardRequested.next(value);
  }

  fireKeyPressed(key:string) {
    this._keyPressed.next(key);
  }

  fireBackspacePressed() {
    this._backspacePressed.next();
  }

  fireEnterPressed() {
    this._enterPressed.next();
  }

}