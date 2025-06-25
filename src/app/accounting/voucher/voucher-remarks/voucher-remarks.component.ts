import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalService } from 'src/app/shared';

import {
  ProviderService,
  BaseComponent,
} from '../../index';
import { SharedModule } from 'src/app/shared/shared.module';


@Component({
  selector: 'app-voucher-remarks',
  templateUrl: './voucher-remarks.component.html',
  providers: [ ModalService ],
  standalone:true,
  imports:[SharedModule]
})
export class VoucherRemarksComponent extends BaseComponent implements OnInit{
  ref: DynamicDialogRef;
  remarksMessage: string = "";
  voucherNo: string = "";

  constructor(
    protected providerSvc: ProviderService,
    public modalService: ModalService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void 
  {
    this.remarksMessage = this.modalService.modalData?.remarksMessage;  
    this.voucherNo = this.modalService.modalData?.voucherNo;  
  }
  
}