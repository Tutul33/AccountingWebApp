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
  selector: 'app-group-ledger',
  templateUrl: './group-ledger.component.html',
  providers: [COAModelService, COADataService, ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class GroupLedgerComponent extends BaseComponent implements OnInit {

  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("groupLedgerForm", { static: true, read: NgForm }) groupLedgerForm: NgForm;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  isEdit: boolean;
  isEditShowGroup: boolean;
  isEditData: boolean;
  tempCoA: any;
  entity: any = null;
  assetList: any;
  subGroupObj: any;
  isSubGroup: boolean = false;
  accountNatureList = [];
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
    this.getGroupLedgerList();
    this.getAccountNatureList();
    if (this.isEdit && this.entity.id > 0) {
      this.isEditData = true;
    } else {
      this.modelSvc.coa.parentID = this.entity.id;

    }

    this.GetAccountCodeByID(this.isEdit ? this.modelSvc.coa.id : this.modelSvc.coa.parentID);

    this.modelSvc.coa.oldParentID = this.modelSvc.coa.parentID;
  }

  getGroupLedgerList() {
    try {
      let accNatures = this.modelSvc.commonDropDownList.filter(x => x.cOALevelCode == FixedIDs.accountHead.GroupLedger);
      if (accNatures != null) {
        this.accountNatureList = accNatures;
      }
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

  addAnother() {
    try {
      this.setNew();
      this.isEdit = false;
      this.isEditData = false;

    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  onSubmit(groupLedgerForm: NgForm, isAddAnother: boolean, isSaveAndClose: boolean) {
    try {
      if (groupLedgerForm.invalid) {
        this.directive.validateAllFormFields(this.groupLedgerForm.form);
        return;
      }

      let accNature = this.modelSvc.commonDropDownList.find(x => x.id == this.modelSvc.coa.parentID);
      this.modelSvc.coa.accountNatureCd = accNature.accountNatureCd;//this.entity.accountNatureCd;
      this.modelSvc.coa.cOALevelCode = FixedIDs.accountHead.GroupLedger;//2;
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
            //this.showMsg(messageCode);
            if (isAddAnother) {
              this.modelSvc.afferSaveData = res.body;
              this.isSubGroup = true;
              res.body.isSubGroup = this.isSubGroup = true;
              this.subGroupObj = res.body;

              this.modelSvc.findNodeById(this.modelSvc.treeDataList, res.body.parentID);
              this.setNew();
              this.showMsg(messageCode);
            } else if (isSaveAndClose) {
              res.body.isSaveAndClose = true;
              this.showMsg(messageCode);
              this.closeModal(res.body);
            }
            else {
              res.body.isShowSubGroupLedgerEntryModal = true;
              res.body.isEdit = this.isEdit;
              if (!this.isEdit) {
                this.showMsg(messageCode);
              }
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
        this.formResetByDefaultValue(this.groupLedgerForm.form, this.tempCoA);
      } else {
        this.setNew();
        this.modelSvc.coa.parentID = this.entity.id;
      }

      this.groupLedgerForm.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNew() {
    try {
      this.modelSvc.coa = new COA();
      this.modelSvc.coa.cOALevelCode = FixedIDs.accountHead.GroupLedger;//2
      this.formResetByDefaultValue(this.groupLedgerForm.form, this.modelSvc.coa);

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

  showSubGroupLegder() {
    try {
      this.isEdit ? this.entity.isShowSubGroup = true : this.subGroupObj.isShowSubGroup = true;
      this.modalService.close(this.isEdit ? this.entity : this.subGroupObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getAccountNatureList() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getAccountNatureList(this.spData).subscribe({
        next: (res: any) => {
          this.assetList = res[res.length - 1];
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

}