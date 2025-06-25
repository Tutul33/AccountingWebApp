import { Component, HostListener, HostBinding, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { NumericKeyboardService } from '../../services/numeric-keyboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-numeric-keyboard',
  templateUrl: './numeric-keyboard.component.html',
  styleUrls: ['./numeric-keyboard.component.css'],
  standalone:true,
  imports:[CommonModule]
})
export class NumericKeyboardComponent implements AfterViewInit  {
  @HostBinding('style.top.px') top: number;
  @HostBinding('style.left.px') left: number;
  isDecimal:boolean=false;
  contentHeight: number = 0;
  spaceAbove:number = 0;
  spaceBelow:number = 0;
  inputHeight:number = 0;
  constructor(public keyboardSvc: NumericKeyboardService, private el: ElementRef) {
  }

  ngAfterViewInit() {
    this.contentHeight = this.el.nativeElement.offsetHeight;
    if(this.spaceBelow < this.contentHeight && this.spaceBelow < this.spaceAbove)
    {
      this.top = this.top - this.inputHeight - this.contentHeight;
    }
    this.left = this.left + 2000;
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