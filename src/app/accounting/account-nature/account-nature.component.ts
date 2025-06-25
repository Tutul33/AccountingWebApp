import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, FixedIDs, GlobalConstants, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { COAModelService } from '../services/coa/coa-model.service';
import { COADataService } from '../services/coa/coa-data.service';
import { ModalService } from 'src/app/shared';
import { NgForm } from '@angular/forms';
import { accountNatureValidation, COA } from '../models/coa/coa';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-account-nature',
  templateUrl: './account-nature.component.html',
  providers: [COAModelService, COADataService, ModalService],
  standalone:true,
    imports:[
      SharedModule
    ]
})
export class AccountNatureComponent extends BaseComponent implements OnInit {

  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("accountNatureForm", { static: true, read: NgForm }) accountNatureForm: NgForm;
  spData: any = new QueryData();
  isEdit: boolean;
  entity: any = null;
  ref: DynamicDialogRef;
  tempCoA: any = null;
  accountNatureList = [];
  isCodeActive:boolean;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: COAModelService,
    public modalService: ModalService,
    public dataSvc: COADataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = accountNatureValidation();
  }

  ngOnInit(): void {
    this.isCodeActive = GlobalConstants.bizConfigInfo.isCodeActive;
    this.entity = this.modalService.modalData?.entity;
    this.isEdit = this.modalService.modalData?.isEdit;
    this.modelSvc.coa = this.isEdit ? new COA(this.entity) : new COA();
    this.tempCoA = this.isEdit ? new COA(this.entity) : new COA();
    this.modelSvc.coa.setModifyTag();
    this.getAccountNatureList();
  }

  getAccountNatureList() {
    try {
      let accNatures = this.modelSvc.commonDropDownList.filter(x => x.cOALevelCode == FixedIDs.accountHead.AccountNature);
      if (accNatures != null) {
        this.accountNatureList = accNatures;
      }
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

  showGroupLegder() {
    try {
      this.modalService.close(this.entity);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveCOA(accountNatureForm: NgForm) {
    try {
      if (accountNatureForm.form.invalid) {
        this.directive.validateAllFormFields(accountNatureForm.form);
        return;
      }
      this.modelSvc.coa = Object.assign(this.modelSvc.coa, accountNatureForm.value);
      this.save(this.modelSvc.coa);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private save(coa: COA) {
    try {
      let messageCode = coa.id ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.save(coa).subscribe({
        next: (res: any) => {
          if (res.body) {
            this.showMsg(messageCode);
            res.body.isSave = true;
            this.closeModal(res.body);
          }

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  closeModal(data: any) {
    try {
      if (this.modalService.isModal) {
        this.modalService.close(data);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      this.formResetByDefaultValue(this.accountNatureForm.form, this.tempCoA);
      this.accountNatureForm.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


}
