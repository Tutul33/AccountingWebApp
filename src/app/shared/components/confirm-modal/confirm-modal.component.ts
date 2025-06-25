import { Component, OnInit } from '@angular/core';
import { DefaultService } from '../../services/default.service';
import { ModalService } from '../../services/modal.service';
@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  providers: [ModalService],
  standalone:true
})
export class ConfirmModalComponent implements OnInit {
  msg: string;
  msgCode: any;

  constructor(private defaultSvc: DefaultService, private modalSvc: ModalService) { }

  ngOnInit(): void {
    this.msgCode = this.modalSvc.modalData.msgCode;

    if (!isNaN(Number(this.msgCode))) {
      this.msg = this.defaultSvc.getMessage(this.msgCode).engMessage;
    } else {
      this.msg = this.msgCode;
    }
  }

  close(isConfirm: boolean) {
    if (this.modalSvc.isModal) {
      this.modalSvc.close(isConfirm);
    }
  }
}
