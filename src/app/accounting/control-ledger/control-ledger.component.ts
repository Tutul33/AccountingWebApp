import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { COAModelService } from '../services/coa/coa-model.service';
import { COADataService } from '../services/coa/coa-data.service';
import { ModalService } from 'src/app/shared';
import { NgForm } from '@angular/forms';
import { COA, groupLedgerValidation } from '../models/coa/coa';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-control-ledger',
  templateUrl: './control-ledger.component.html',
  providers: [COAModelService, COADataService, ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class ControlLedgerComponent extends BaseComponent implements OnInit {

  entity: any = null;
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("controlLedgerForm", { static: true, read: NgForm }) controlLedgerForm: NgForm;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  isEdit: boolean;
  tempCoA: any;
  assetTypeList: any;
  isEditData: boolean;
  accountNatureList = [];
  ledgerObj: any;
  isLedger: boolean = false;
  isCodeActive: boolean;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: COAModelService,
    public modalService: ModalService,
    public dataSvc: COADataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = groupLedgerValidation();
  }

  ngOnInit(): void {
    this.isCodeActive = GlobalConstants.bizConfigInfo.isCodeActive;
    this.entity = this.modalService.modalData?.entity;
    this.isEdit = this.modalService.modalData?.isEdit;
    this.modelSvc.coa = this.isEdit ? new COA(this.entity) : new COA();
    this.tempCoA = this.isEdit ? new COA(this.entity) : new COA();
    let lcode = this.isEdit ? this.entity.parent.cOALevelCode : this.entity.cOALevelCode;
    this.getGroupOrSubLedgerListByNatureCdAndLevelCd(this.entity.accountNatureCd, lcode);
    this.getControlLedgerList();

    this.assetTypeList = FixedIDs.getList(FixedIDs.assetTypeDrop);

    if (this.isEdit && this.entity.id > 0) {
      this.isEditData = true;
      this.modelSvc.coa.parentID = this.entity.parentID;
      this.modelSvc.coa.accountCode = this.entity.accountCode;
    } else {
      this.modelSvc.coa.parentID = this.entity.id;
      this.modelSvc.coa.accountCode = this.entity.accountCode;
    }

    if (this.isEdit) {
      this.ledgerObj = this.entity;
    }

    this.modelSvc.coa.note = this.entity.note;
    this.modelSvc.coa.assetTypeCode = this.isEdit ? this.entity.parent.assetTypeCode : this.entity.assetTypeCode;

    this.tempCoA.note = this.entity.note;
    this.tempCoA.assetTypeCode = this.isEdit ? this.entity.parent.assetTypeCode : this.entity.assetTypeCode;

    this.tempCoA.parentID = this.modelSvc.coa.parentID;
    this.GetAccountCodeByID(this.isEdit ? this.modelSvc.coa.id : this.modelSvc.coa.parentID);
    this.modelSvc.coa.oldParentID = this.modelSvc.coa.parentID;
  }

  getControlLedgerList() {
    try {
      let accNatures = this.modelSvc.commonDropDownList.filter(x => x.cOALevelCode == FixedIDs.accountHead.ControlLedger);
      if (accNatures != null) {
        this.accountNatureList = accNatures;
      }
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

  GetAccountCodeByID(id: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getAccountCodeByID(this.spData, id).subscribe({
        next: (res: any) => {
          let results = res[res.length - 1];
          this.modelSvc.coa.accountCode = results[0].accountCode;
          if (this.isEdit && this.modelSvc.coa.parentID != this.tempCoA.parentID) {
            this.modelSvc.coa.parentAccountCode = results[0].accountCode;
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onSubGroupLedger() {
    try {
      this.getLedgerNoteById();
      this.parentLedgerChange();
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

  getLedgerNoteById() {
    try {
      this.dataSvc.getLedgerNoteById(this.spData, this.modelSvc.coa.parentID).subscribe({
        next: (res: any) => {
          let result = res[res.length - 1];
          if (result.length > 0) {
            this.modelSvc.coa.note = result[0].note;
            this.modelSvc.coa.assetTypeCode = result[0].assetTypeCode;
          }

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

  parentLedgerChange() {
    try {
      if (this.isEdit && this.modelSvc.coa.parentID != this.tempCoA.parentID) {
        this.spData.pageNo = 0;
        this.dataSvc.getAccountCodeByID(this.spData, this.modelSvc.coa.parentID).subscribe({
          next: (res: any) => {
            let results = res[res.length - 1];
            this.modelSvc.coa.parentAccountCode = results[0].accountCode;
          }
        });
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  addAnother() {
    try {
      this.setNew();
      this.isEdit = false;
      this.isEditData = false;
    } catch (e) {
      this.showErrorMsg(e);
    }

  }


  onSubmit(controlLedgerForm: NgForm, isAddAnother: boolean, isSaveAndClose: boolean) {
    try {
      if (controlLedgerForm.invalid) {
        this.directive.validateAllFormFields(this.controlLedgerForm.form);
        return;
      }
      this.modelSvc.coa.accountNatureCd = this.entity.accountNatureCd;
      this.modelSvc.coa.cOALevelCode = FixedIDs.accountHead.ControlLedger;
      this.isEdit ? this.modelSvc.coa.setModifyTag() : this.modelSvc.coa.setInsertTag();

      this.save(this.modelSvc.coa, isAddAnother, isSaveAndClose);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }


  private save(coa: COA, isAddAnother: boolean, isSaveAndClose: boolean) {
    try {
      let messageCode = coa.id ? this.messageCode.editCode : this.messageCode.saveCode;
      const condeGenPropertyVal = GlobalMethods.codeGenProperty();
      if (this.isEdit && this.modelSvc.coa.parentID != this.tempCoA.parentID) {
        condeGenPropertyVal.ParentLedgerCode = coa.parentAccountCode;
        coa.codeGenPropertyVal = JSON.stringify(condeGenPropertyVal).toString();
      }
      if (!this.isEdit) {
        condeGenPropertyVal.ParentLedgerCode = coa.accountCode;
        coa.codeGenPropertyVal = JSON.stringify(condeGenPropertyVal).toString();
      }
      this.dataSvc.save(coa).subscribe({
        next: (res: any) => {
          if (res.body) {
            if (isAddAnother) {
              this.modelSvc.afferSaveData = res.body;
              this.ledgerObj = res.body;
              this.modelSvc.findNodeById(this.modelSvc.treeDataList, res.body.parentID);
              this.setNew();
              this.showMsg(messageCode);
            } else if (isSaveAndClose) {
              res.body.isSaveAndClose = true;
              this.showMsg(messageCode);
              this.closeModal(res.body);
            }
            else {
              if (!this.isEdit) {
                this.showMsg(messageCode);
              }
              res.body.isShowLedgerEntryModal = true;
              this.closeModal(res.body);
            }
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

  reset() {
    try {
      if (this.isEdit) {
        this.GetAccountCodeByID(this.tempCoA.id);
        this.formResetByDefaultValue(this.controlLedgerForm.form, this.tempCoA);
      } else {
        this.setNew();
        this.modelSvc.coa.parentID = this.tempCoA.parentID;
        this.modelSvc.coa.note = this.tempCoA.note;
        this.modelSvc.coa.assetTypeCode = this.tempCoA.assetTypeCode;
      }

      this.controlLedgerForm.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNew() {
    try {
      this.modelSvc.coa = new COA();
      this.modelSvc.coa.cOALevelCode = FixedIDs.accountHead.ControlLedger;//4;
      // this.formResetByDefaultValue(this.controlLedgerForm.form, this.modelSvc.coa);

    }
    catch (e) {
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

  controlLedgerList: any;
  getGroupOrSubLedgerListByNatureCdAndLevelCd(nCode: any, lCode: any) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getGroupOrSubLedgerListByNatureCdAndLevelCd(this.spData, nCode, lCode).subscribe({
        next: (res: any) => {
          this.controlLedgerList = res[res.length - 1];

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

}
