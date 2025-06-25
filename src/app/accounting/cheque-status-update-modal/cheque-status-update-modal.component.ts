import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalConstants, GlobalMethods, ModalService, ValidatorDirective } from '../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  QueryData,
} from '../index';
import { OrgService } from "src/app/app-shared/services/org.service";
import { ChequeBookModelService } from "../services/cheque-book/cheque-book-model.service";
import { ChequeBookDataService } from "../services/cheque-book/cheque-book-data.service";
import { ChequeBookDTO, chequeBookValidation, ChequeLogDTO } from "../models/cheque-book/cheque-book";
import { SharedModule } from "src/app/shared/shared.module";



@Component({
  selector: 'app-cheque-status-update-modal',
  templateUrl: './cheque-status-update-modal.component.html',
  providers: [ChequeBookDataService, ChequeBookModelService,ModalService],
  standalone:true,
    imports:[
      SharedModule
    ]
})
export class ChequeStatusUpdateModalComponent extends BaseComponent implements OnInit {

  chequeLog:ChequeLogDTO = new ChequeLogDTO();
  @ViewChild("chequeBookForm", { static: true, read: NgForm }) chequeBookForm: NgForm;
  entity:any;
  visibilityDate:boolean=false;
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ChequeBookModelService,
    private dataSvc: ChequeBookDataService,
    public dialogService: DialogService,
    public modalService: ModalService,
  ) {
    super(providerSvc);
   
  }

  ngOnInit(): void {
   this.entity = this.modalService.modalData?.entity;
   this.modalService.setWidth("540px");
   setTimeout(() => {
    this.visibilityDate = true;
  }, 10);
  }

  updateStatus(formGroup: NgForm) {
    try {
      this.entity.statusDate = this.chequeLog.statusDate;
      this.entity.note = this.chequeLog.note;
      this.chequeLog =  new ChequeLogDTO(this.entity);
      this.chequeLog.statusCd = this.entity.code;
      this.chequeLog.voucherItemID = this.entity.voucherItemID;
      
      this.save(this.chequeLog);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private save(chequeDTO: ChequeLogDTO) {
    try {
      let messageCode = chequeDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
      this.dataSvc.saveChequeLog(chequeDTO).subscribe({
        next: (res: any) => {
          this.showMsg(messageCode);
          this.modalService.close(true);
          this.modalService.close(true);
        },
        error: (res: any) => {
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

 
}
