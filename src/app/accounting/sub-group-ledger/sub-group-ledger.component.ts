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
  selector: 'app-sub-group-ledger',
  templateUrl: './sub-group-ledger.component.html',
  providers: [COAModelService, COADataService, ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class SubGroupLedgerComponent extends BaseComponent implements OnInit {

  entity: any = null;
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("subGroupLedgerForm", { static: true, read: NgForm }) subGroupLedgerForm: NgForm;

  spData: any = new QueryData();
  isListShow: boolean = false;
  isControlLegerHide: boolean;
  isControlLedger = false;
  isLedger = false;
  ref: DynamicDialogRef;
  groupLedgerList: any;
  accountNatureList = [];


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

  assetTypeList: any;
  isEdit: boolean;
  tempCoA: any;
  isEditData: boolean;
  isCodeActive: boolean;

  ngOnInit(): void {
    this.isCodeActive = GlobalConstants.bizConfigInfo.isCodeActive;
    this.entity = this.modalService.modalData?.entity;
    this.isEdit = this.modalService.modalData?.isEdit;
    this.modelSvc.coa = this.isEdit ? new COA(this.entity) : new COA();
    this.tempCoA = this.isEdit ? new COA(this.entity) : new COA();
    let lcode = this.isEdit ? this.entity.parent.cOALevelCode : this.entity.cOALevelCode;
    this.getSubGroupLedgerList();

    this.getIsControlLedgerHide(this.entity.accountNatureCd, lcode);
    this.assetTypeList = FixedIDs.getList(FixedIDs.assetTypeDrop);

    if (this.isEdit && this.entity.id > 0) {
      this.isEditData = true;
      if (this.entity.isHideClrgr) {
        this.modelSvc.coa.parentID = this.entity.editParentID == undefined ? this.modelSvc.coa.parentID : this.entity.editParentID;
      } else {
        this.modelSvc.coa.parentID = this.entity.parentID;
      }

    } else {
      this.modelSvc.coa.parentID = this.entity.id;
    }

    if (this.isEdit) {
      this.controlObj = this.entity;
    }

    if (this.modelSvc.coa.accountName == null) {
      this.isLedger = true;
    }
    this.tempCoA.parentID = this.modelSvc.coa.parentID;
    this.GetAccountCodeByID(this.isEdit ? this.modelSvc.coa.id : this.modelSvc.coa.parentID);
    this.modelSvc.coa.oldParentID = this.modelSvc.coa.parentID;
  }

  getSubGroupLedgerList() {
    try {
      let accNatures = this.modelSvc.commonDropDownList.filter(x => x.cOALevelCode == FixedIDs.accountHead.SubGroupLedger);
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

  onParentLedgerChange() {
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


  setNew() {
    try {
      this.modelSvc.coa = new COA();
      this.modelSvc.coa.cOALevelCode = FixedIDs.accountHead.SubGroupLedger;//3;
      //this.formResetByDefaultValue(this.subGroupLedgerForm.form, this.modelSvc.coa);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  addAnother() {
    try {
      this.setNew();
      this.isEdit = false;
      this.isEditData = false;
      this.isLedger = false;

    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  onSubmit(subGroupLedgerForm: NgForm, isAddAnother: boolean, isSaveAndClose: boolean) {
    try {
      if (subGroupLedgerForm.invalid) {
        this.directive.validateAllFormFields(this.subGroupLedgerForm.form);
        return;
      }
      this.modelSvc.coa.accountNatureCd = this.entity.accountNatureCd;
      this.modelSvc.coa.cOALevelCode = FixedIDs.accountHead.SubGroupLedger;//3;
      this.isEdit ? this.modelSvc.coa.setModifyTag() : this.modelSvc.coa.setInsertTag();
      this.save(this.modelSvc.coa, isAddAnother, isSaveAndClose);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  controlObj: any;
  isControl: boolean = false;
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
      coa.isControlLegerHide = this.isControlLegerHide

      this.dataSvc.save(coa).subscribe({
        next: (res: any) => {
          res.body.isHideClrgr = this.entity.isHideClrgr; 
          if (res.body) {

            if (isAddAnother) {
              this.modelSvc.afferSaveData = res.body;
              this.isControl = true;
              res.body.isControl = this.isControl;
              this.controlObj = res.body;
              this.isLedger = false;
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
              res.body.isShowLedgerEntryModal = this.isShowLedgerEntryModal;
              res.body.isControlLedgerEntryModal = this.isControlLedgerEntryModal;

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
      if (this.isEdit) {
        this.GetAccountCodeByID(this.tempCoA.id);
        this.formResetByDefaultValue(this.subGroupLedgerForm.form, this.tempCoA);
      } else {
        this.setNew();
        this.modelSvc.coa.parentID = this.tempCoA.parentID;
      }

      this.subGroupLedgerForm.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getGroupOrSubLedgerListByNatureCdAndLevelCd(nCode: any, lCode: any) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getGroupOrSubLedgerListByNatureCdAndLevelCd(this.spData, nCode, lCode).subscribe({
        next: (res: any) => {
          this.groupLedgerList = res[res.length - 1];
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
  isShowLedgerEntryModal: boolean;
  isControlLedgerEntryModal: boolean;


  getIsControlLedgerHide(nCode: any, lCode: any) {
    try {
      if (this.entity.isHideClrgr) {
        this.isControlLegerHide = true;
        this.isShowLedgerEntryModal = true;
        this.getGroupOrSubLedgerListByNatureCdAndLevelCd(nCode, 2);
      } else {
        this.getGroupOrSubLedgerListByNatureCdAndLevelCd(nCode, lCode);
        this.isControlLegerHide = false;
        this.isControlLedgerEntryModal = true;
      }

    } catch (e) {
      this.showErrorMsg(e);
    }
  }


}
