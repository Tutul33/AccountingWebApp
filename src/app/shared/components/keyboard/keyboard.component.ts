import { Component, HostListener, HostBinding, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css'],
  standalone:true
})
export class KeyboardComponent implements OnDestroy, AfterViewInit {
  @HostBinding('style.top.px') top: number;
  @HostBinding('style.left.px') left: number;
  contentHeight: number = 0;
  spaceAbove:number = 0;
  spaceBelow:number = 0;
  inputHeight:number = 0;
  constructor(public keyboardSvc: KeyboardService, private el: ElementRef) {
  }

  ngAfterViewInit() {
    this.contentHeight = this.el.nativeElement.offsetHeight;
    if(this.spaceBelow < this.contentHeight && this.spaceBelow < this.spaceAbove)
    {
      this.top = this.top - this.inputHeight - this.contentHeight;
    }
    this.left = this.left + 2000;
  }
  ngOnDestroy(): void {
    this.keyboardSvc.alt = false;
    this.keyboardSvc.shift = false;
  }

  onShift() {
    this.keyboardSvc.shift = !this.keyboardSvc.shift;
  }

  onAlt() {
    this.keyboardSvc.alt = !this.keyboardSvc.alt;
    this.keyboardSvc.shift = false;
  }

  onBackspace() {
    this.keyboardSvc.fireBackspacePressed();
  }

  onEnter() {
    this.keyboardSvc.fireEnterPressed();
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('click', ['$event'])
  onMouseEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}