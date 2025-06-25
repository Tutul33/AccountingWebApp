import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, ValidatorDirective } from '../../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";
import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';

import { SubLedgerTypeDTO, subLedgerTypeValidation } from "../../models/business-config/business-config.model";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-sub-ledger-type',
  templateUrl: './sub-ledger-type.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
   standalone:true,
    imports:[
      SharedModule
    ]
})
export class SubLedgerTypeComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  objectState: any = FixedIDs.objectState;

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("subLedgerTypeForm", { static: true, read: NgForm }) subLedgerTypeForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = subLedgerTypeValidation();
  }

  ngOnInit(): void {
    this.getDefaultData();
  }


  getDefaultData() {
    try {
      this.modelSvc.subLedgerTypeDTO = new SubLedgerTypeDTO();
      this.modelSvc.getSubLedgerTypeSourceCd();
      this.getSET_SubLedgerTypeList();
      this.initGridOption();
    } catch (error) {
      throw error;
    }
  }


  getSET_SubLedgerTypeList() {
    try {
      this.dataSvc.getSET_SubLedgerTypeList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.subLedgerTypeList = data;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

    
  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.subLedgerTypeList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["subledgertype"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "name", header: this.fieldTitle['subledgertype'] },
      { field: "code", header: this.fieldTitle['code'] },
      { field: "source", header: this.fieldTitle['source'] },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true },
      { header: this.fieldTitle['action'], styleClass:"d-center" }
    ]
  }

  refresh(){
    try {
      this.getSET_SubLedgerTypeList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveSubLedgerType (formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      if(this.modelSvc.subLedgerTypeDTO.code == 0)
      {
        this.modelSvc.subLedgerTypeDTO.code = null;
      }
      this.save(this.modelSvc.subLedgerTypeDTO);
      
    } catch (error) {
      
    }
  }

  private save(subLedgerTypeDTO: SubLedgerTypeDTO) {
    try {
      let messageCode = subLedgerTypeDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.saveSubLedgerType(subLedgerTypeDTO).subscribe({ 
        next: (res: any) => {
          this.modelSvc.subLedgerTypeList.push(res.body);

          this.setNew();
          this.showMsg(messageCode);
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

  edit(entity: any) {
    try {
      if (this.subLedgerTypeForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.modelSvc.prepareSubLedgerTypeEditForm(entity);
              setTimeout(() => {
                this.subLedgerTypeForm.form.markAsPristine();
              }, 50);
            }
          });
      } else {
        this.modelSvc.prepareSubLedgerTypeEditForm(entity);
        setTimeout(() => {
          this.subLedgerTypeForm.form.markAsPristine();
        }, 50);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  delete(entity: any) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.removeSubLedgerType(entity.id).subscribe({
              next: (res: any) => { 
                this.modelSvc.deleteSubLedgerTypeCollection(entity);
                this.showMsg(this.messageCode.deleteCode);
                this.gridOption.totalRecords = this.modelSvc.subLedgerTypeList.length;
                if (entity.id == this.modelSvc.tempSubLedgerTypeDTO.id) {
                  this.setNew();
                }
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
          }
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNew() {
    try {
      this.getDefaultData();
      this.formResetByDefaultValue(this.subLedgerTypeForm.form, this.modelSvc.subLedgerTypeDTO);
      this.focus(this.subLedgerTypeForm.form, 'subLedgerTypeDTO');
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      this.focus(this.subLedgerTypeForm.form, "subLedgerType");
      if (this.modelSvc.subLedgerTypeDTO.id > 0) {
        this.subLedgerTypeForm.form.markAsPristine();
        this.formResetByDefaultValue(this.subLedgerTypeForm.form, this.modelSvc.tempSubLedgerTypeDTO);
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