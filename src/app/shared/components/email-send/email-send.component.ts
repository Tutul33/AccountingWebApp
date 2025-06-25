import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { ValidatorDirective } from '../../directives/validator.directive';
import { ProviderService } from 'src/app/core/services/provider.service';
import { Email, emailValidation } from '../../models/common.model';
import { BaseComponent } from '../base/base.component';
import { GlobalConstants } from 'src/app/app-shared/models/javascriptVariables';
import { EmailSendDataService, EmailSendModelService } from './services/email-send.service'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalService } from '../../services/modal.service';
import { CommonModule } from '@angular/common';
import { AddValidatorsDirective } from '../../directives/add-validators.directive';
import { EditorModule } from 'primeng/editor';


@Component({
  selector: 'app-email-send',
  templateUrl: './email-send.component.html',
  providers:[ModalService, EmailSendDataService, EmailSendModelService],
  standalone:true,
  imports:[CommonModule,FormsModule,AddValidatorsDirective,EditorModule]
})
export class EmailSendComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive;
  @ViewChild("emailForm", { static: true, read: NgForm }) emailForm: NgForm;
  validationMsgObj: any;
  locationID = GlobalConstants.userInfo.locationID;
  isSubmited: boolean = false;
  ref: DynamicDialogRef;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: EmailSendModelService,
    public dataSvc: EmailSendDataService,
    public dialogService: DialogService,
    public modalService: ModalService,
  ){
    super(providerSvc);
    this.validationMsgObj = emailValidation();
  }

  ngOnInit(): void {
    try { 
      this.modelSvc.setDefaultData(this.modalService?.modalData);
    } catch (e) {
      this.showErrorMsg(e);
    }
    this.modalService.setWidth('650px');
  }


  send(formGroup: NgForm){
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.modelSvc.emailDTO.to = this.modelSvc.emailDTO.email;
      this.sendEmail(this.modelSvc.emailDTO);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  
  private sendEmail(emailDTO: Email) {
    try {
      let messageCode = "2267";

      this.dataSvc.sendEmail(emailDTO).subscribe({ 
        next: (res: any) => {
          this.showMsg(messageCode);
          this.modalService.close(emailDTO);
          setTimeout(() => {
            this.setNew();
          }, 10);
        },
        error: (res: any) => { 
          if(res.error.messageCode == this.messageCode.duplicateEntry)
          {
            this.showMsg(this.messageCode.duplicateEntry);
          }
          else
          {
            this.showErrorMsg(res);
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

    setNew() {
      try {
        this.modelSvc.emailDTO = new Email();
        this.formResetByDefaultValue(this.emailForm.form, this.modelSvc.emailDTO);
        this.focus(this.emailForm.form, 'EmailForm');  
      }
      catch (e) {
        this.showErrorMsg(e);
      }
    }
  
    reset() {
      try { 
        this.focus(this.emailForm.form, "EmailForm");
        if (this.modelSvc.emailDTO.id > 0) {
          this.emailForm.form.markAsPristine();
          this.formResetByDefaultValue(this.emailForm.form, this.modelSvc.tempEmailDTO);
        } 
        else {
          this.setNew();
        }
      }
      catch (e) {
        this.showErrorMsg(e);
      }
    }

}
