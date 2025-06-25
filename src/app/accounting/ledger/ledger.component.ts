import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { COAModelService } from '../services/coa/coa-model.service';
import { COADataService } from '../services/coa/coa-data.service';
import { ModalService } from 'src/app/shared';
import { NgForm } from '@angular/forms';
import { COA, groupLedgerValidation } from '../models/coa/coa';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.component.html',
  providers: [COAModelService, COADataService, ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class LedgerComponent extends BaseComponent implements OnInit {
  isEdit: boolean;
  tempCoA: any;
  assetTypeList: any;
  transactionNatureList: any;
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("ledgerForm", { static: true, read: NgForm }) ledgerForm: NgForm;

  subLedgerList: any;
  isEditData: boolean;
  parentAssetList: any;
  entity: any = null;

  spData: any = new QueryData();
  isDepRateShow: boolean = false;
  isParentAssetShow: boolean = false;
  controlLedgerList: any;
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
    let lcode = this.isEdit ? this.entity.parent.cOALevelCode : this.entity.cOALevelCode;
    this.getLedgerList();
    this.getIsControlLedgerHide(this.entity.accountNatureCd, lcode);
    this.assetTypeList = FixedIDs.getList(FixedIDs.assetTypeDrop);
    this.transactionNatureList = FixedIDs.getList(FixedIDs.transationNatureDrop);
    this.getSubLedgerTypeList();
    this.getParentAssetList();

    if (this.isEdit && this.entity.id > 0) {

      this.isEditData = true;
      this.modelSvc.coa.isSubLedgerType = this.modelSvc.coa.subLedgerTypeID != null ? true : false;
      if (this.entity.isHideClrgr) {
        //this.modelSvc.coa.parentID = this.entity.editParentID;
        //this.modelSvc.commonDropDownList.find(x=>x.parentID == this.modelSvc.coa.parentID).editParentID;
        this.GetAccountCodeByID(this.entity.editParentID);
        let editObj = this.modelSvc.commonDropDownList.find(x => x.parentID == this.modelSvc.coa.parentID);
        this.modelSvc.coa.parentID = editObj != null ? editObj.editParentID : this.modelSvc.coa.parentID;

      } else {
        this.GetAccountCodeByID(this.entity.id);
        this.modelSvc.coa.parentID = this.entity.parentID;
        this.modelSvc.coa.accountCode = this.entity.accountCode;
      }

    } else {
      this.GetAccountCodeByID(this.entity.isHideClrgr ? this.entity.id : this.entity.editParentID == undefined ? this.entity.id : this.entity.editParentID);
      if (!this.entity.isHideClrgr) {
        this.modelSvc.coa.parentID = this.entity.id;
        this.modelSvc.coa.accountCode = this.entity.accountCode;

      }
    }
    if (this.modelSvc.coa.parentID != null) {
      this.getControlLedgerAndFixedAsset(this.modelSvc.coa.parentID);
    }
    this.modelSvc.coa.note = this.entity.note;
    this.modelSvc.coa.assetTypeCode = this.isEdit ? this.entity.parent.assetTypeCode : this.entity.assetTypeCode;

    this.tempCoA.note = this.entity.note;
    this.tempCoA.assetTypeCode = this.isEdit ? this.entity.parent.assetTypeCode : this.entity.assetTypeCode;

    this.tempCoA.parentID = this.modelSvc.coa.parentID;

    this.modelSvc.coa.oldParentID = this.modelSvc.coa.parentID;

  }

  onControlLedgerChange() {
    try {
      this.getControlLedgerAndFixedAsset(this.modelSvc.coa.parentID);
      this.getLedgerNoteById(this.modelSvc.coa.parentID);
      this.parentLedgerChange();
    } catch (error) {
      this.showErrorMsg(error);
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

  GetAccountCodeByID(id: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getAccountCodeByID(this.spData, id).subscribe({
        next: (res: any) => {
          let results = res[res.length - 1];
          this.modelSvc.coa.accountCode = results[0].accountCode;
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

  getGroupOrSubLedgerListByNatureCdAndLevelCd(nCode: any, lCode: any) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getGroupOrSubLedgerListByNatureCdAndLevelCd(this.spData, nCode, lCode).subscribe({
        next: (res: any) => {
          this.controlLedgerList = res[res.length - 1];
          if (this.entity.isHideClrgr) {
            this.getControlLedger(this.entity.id);
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

  getIsControlLedgerHide(nCode: any, lCode: any) {
    try {
      if (this.entity.isHideClrgr) {

        this.getGroupOrSubLedgerListByNatureCdAndLevelCd(nCode, FixedIDs.accountHead.ControlLedger);
      } else {
        this.getGroupOrSubLedgerListByNatureCdAndLevelCd(nCode, lCode);

      }

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getControlLedger(id: number) {
    try {
      if (this.entity.isHideClrgr) {
        this.dataSvc.getControlLedgerID(this.spData, id).subscribe({
          next: (res: any) => {
            let result = res[res.length - 1] || [];
            if (result.length > 0) {
              this.modelSvc.coa.parentID = result[0].controlLedgerID;
              this.getControlLedgerAndFixedAsset(this.modelSvc.coa.parentID);
            }
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
          complete: () => { },
        });
      }
    } catch (error) {

    }
  }

  getControlLedgerAndFixedAsset(id: number) {
    try {

      this.dataSvc.getControlLedgerAndFixedAsset(this.spData, id).subscribe({
        next: (res: any) => {
          let result = res[res.length - 1] || [];
          if (result.length > 0) {
            let obj = result[0];
            //this.modelSvc.coa.parentID = obj.id;
            if (obj.accountNatureCd == FixedIDs.accountingNature.Assets && obj.assetTypeCode == FixedIDs.assetType.IsFixedAssets) {
              this.isDepRateShow = true;
            } else {
              this.isDepRateShow = false;
            }
            if (obj.accountNatureCd == FixedIDs.accountingNature.Liabilities && obj.assetTypeCode == FixedIDs.assetType.IsFixedAssets) {
              this.isParentAssetShow = true;
            } else {
              this.isParentAssetShow = false;
            }

          }

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (error) {

    }
  }

  addAnother() {
    try {
      this.setNew();
      this.isEdit = false;
      this.isEditData = false;
      this.modelSvc.coa.parentID = this.entity.parentID;
    } catch (error) {

    }
  }

  onSubmit(ledgerForm: NgForm, isAddAnother: boolean) {
    try {
      if (ledgerForm.invalid) {
        this.directive.validateAllFormFields(this.ledgerForm.form);
        return;
      }

      this.modelSvc.coa.accountNatureCd = this.entity.accountNatureCd;
      this.modelSvc.coa.cOALevelCode = FixedIDs.accountHead.Ledger;
      this.modelSvc.coa.subLedgerTypeID = this.modelSvc.coa.isSubLedgerType ? this.modelSvc.coa.subLedgerTypeID : null;
      this.isEdit ? this.modelSvc.coa.setModifyTag() : this.modelSvc.coa.setInsertTag();
      //this.modelSvc.coa.assetTypeCode = null;
      this.save(this.modelSvc.coa, isAddAnother);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private save(coa: COA, isAddAnother: boolean) {
    try {
      let messageCode = coa.id ? this.messageCode.editCode : this.messageCode.saveCode;
      const condeGenPropertyVal = GlobalMethods.codeGenProperty();
      if (this.isEdit && this.modelSvc.coa.parentID != this.tempCoA.parentID) {
       
        condeGenPropertyVal.ParentLedgerCode = coa.parentAccountCode;
      coa.codeGenPropertyVal = JSON.stringify(condeGenPropertyVal).toString();
      }
      if (!this.isEdit){
        condeGenPropertyVal.ParentLedgerCode = coa.accountCode;
        coa.codeGenPropertyVal = JSON.stringify(condeGenPropertyVal).toString();
      }

      this.dataSvc.save(coa).subscribe({
        next: (res: any) => {
          if (res.body) {
            // added list node
            this.modelSvc.commonDropDownList.push(res.body);///

            this.showMsg(messageCode);
            if (this.entity.isHideClrgr) {
              res.body.editParentID = res.body.parentID;
              res.body.parentID = res.body.subLedgerID;

            }
            if (isAddAnother) {
              this.modelSvc.afferSaveData = res.body;
              this.modelSvc.findNodeById(this.modelSvc.treeDataList, res.body.parentID);
              this.setNew();
            } else {
              res.body.isSave = true;
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
        if (this.entity.isHideClrgr) {
          this.tempCoA.parentID = this.entity.editParentID;
        }
        this.GetAccountCodeByID(this.tempCoA.id);
        this.formResetByDefaultValue(this.ledgerForm.form, this.tempCoA);
      } else {
        this.setNew();
        this.modelSvc.coa.parentID = this.tempCoA.parentID;
        this.modelSvc.coa.note = this.tempCoA.note;
        this.modelSvc.coa.assetTypeCode = this.tempCoA.assetTypeCode;
      }
      this.ledgerForm.form.markAsPristine();


    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNew() {
    try {
      this.modelSvc.coa = new COA();
      this.modelSvc.coa.cOALevelCode = FixedIDs.accountHead.Ledger;
      //this.formResetByDefaultValue(this.ledgerForm.form, this.modelSvc.coa);
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

  getLedgerNoteById(id: number) {
    try {
      this.dataSvc.getLedgerNoteById(this.spData, id).subscribe({
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

  getParentAssetList() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getParentAssetList(this.spData).subscribe({
        next: (res: any) => {
          this.parentAssetList = res[res.length - 1];

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

  getSubLedgerTypeList() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getSubLedgerTypeList(this.spData).subscribe({
        next: (res: any) => {
          this.subLedgerList = res[res.length - 1];

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

  getLedgerList() {
    try {
      let accNatures = this.modelSvc.commonDropDownList.filter(x => x.cOALevelCode == FixedIDs.accountHead.Ledger);
      if (accNatures != null) {
        this.accountNatureList = accNatures;
      }
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

}


