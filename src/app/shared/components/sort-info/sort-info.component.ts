import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-sort-info',
  templateUrl: './sort-info.component.html',
  styles: [
  ],
  standalone:true,
  imports:[CommonModule,FormsModule,CheckboxModule]
})
export class SortInfoComponent implements OnInit {
  @Input() input: ISort[] = [];
  @Input() sortedProps: string;
  @Output() output = new EventEmitter<object>();


  lastSLNo: number;
  mappedStr: string = "";
  mappedProps: string = "";
  tempSortedProps: string = "";
  tempInput: ISort[];
  constructor() { }

  ngOnInit(): void {
    this.tempInput = this.input;
    this.tempSortedProps = this.sortedProps;

    if (this.sortedProps) {
      let selectedList = this.sortedProps.split(',');

      selectedList.forEach((selected, index) => {
        this.input.map(x => {
          if (x.propertyName === selected) {
            x.isSelected = true;
            this.lastSLNo = x.slNo = 1 + index++;
          }
        });

      });
      this.mappedSerial();
    }
  }

  onChecked(): void {
   
    // last serial no
    let lastSLNo = this.input.filter(x => x.isSelected).length;
    // reset serial no
    this.input.filter(x => !x.isSelected)
      .map(x => {
        x.slNo = null;
      });


    this.input.filter(x => x.isSelected)
      .map(x => {
        //set serial number
        x.slNo = x.slNo == null ? lastSLNo : x.slNo;
      })
    this.mappedSerial();
  }

  mappedSerial(): void {
    //reset previous mapped 
    this.mappedProps = this.mappedStr = '';

    this.input.filter(x => x.isSelected)
      .sort((a, b) => (a.slNo > b.slNo) ? 1 : -1)
      .map(x => {
        //mapped property and display name
        if (this.mappedProps == "") {
          this.mappedProps = x.propertyName;
          this.mappedStr = x.displayName;
        } else {
          this.mappedProps += ',' + x.propertyName;
          this.mappedStr += ',' + x.displayName;
        }
      })
  }

  onChangeSerial(): void {
    //this.input.filter(x => x.propertyName == item.propertyName)
    //  .map(x => {
    //    //set serial number
    //    x.slNo = x.slNo == null ? lastSLNo : x.slNo;
    //  })
    this.mappedSerial();
  }

  closeModal(): void {
    try {
      let result = {
        selectedFields: this.mappedProps,
        selectedValue: this.mappedStr
      }
      this.output.emit(result);
    } catch (ex) {
      throw ex;
    }
  }

  reset(): void {

    this.input = this.tempInput;
    this.sortedProps = this.tempSortedProps;

    this.ngOnInit();
    //this.input
    //  .map(x => {
    //    x.slNo = null;
    //    x.isSelected = false;
    //  });
    //this.mappedProps = this.mappedStr = "";
  }

}




interface ISort {
  id: number;
  isSelected: boolean;
  displayName: string;
  propertyName: string,
  slNo?: number | null;
}
