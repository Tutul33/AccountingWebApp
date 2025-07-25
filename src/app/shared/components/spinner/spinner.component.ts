import { Component } from '@angular/core';

import { SpinnerHandlerService } from '../../../core/services/spinner-handler.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone:true,
  imports:[ProgressSpinnerModule,CommonModule]
})
export class SpinnerComponent {

  spinnerActive: boolean = true;

  constructor(
    public spinnerHandler: SpinnerHandlerService
  ) {
    this.spinnerHandler.showSpinner.subscribe(this.showSpinner.bind(this));
  }

  showSpinner = (state: boolean): void => {
    this.spinnerActive = state;
  };

}