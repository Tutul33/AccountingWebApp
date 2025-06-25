import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { SortInfoComponent } from './sort-info.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  //declarations: [SortInfoComponent],
  imports: [
    CommonModule,
    CheckboxModule,
    FormsModule,
    SortInfoComponent
  ],
  exports: [
    SortInfoComponent
  ]

})
export class SortInfoModule { }
