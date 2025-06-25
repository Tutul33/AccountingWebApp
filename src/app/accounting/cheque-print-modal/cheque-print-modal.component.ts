import { Component, OnInit } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ModalService } from '../../shared';
import {
  ProviderService,
  BaseComponent,
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-cheque-print-modal',
  templateUrl: './cheque-print-modal.component.html',
  providers: [ModalService],
  standalone:true,
    imports:[
      SharedModule
    ]
})
export class ChequePrintModalComponent extends BaseComponent implements OnInit {

  payTo:string = null;
  entity:any;
  constructor(
    protected providerSvc: ProviderService,
    public dialogService: DialogService,
    public modalService: ModalService,
  ) {
    super(providerSvc);
   
  }

  ngOnInit(): void {
   this.entity = this.modalService.modalData?.entity;
   this.payTo = this.entity.toSubLedgerDetail;
  }

  onPrintCheque() {
    try {
      this.modalService.close(this.payTo == null ? '' :this.payTo );
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

}
