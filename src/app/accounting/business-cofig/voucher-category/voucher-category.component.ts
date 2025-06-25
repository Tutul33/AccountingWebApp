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

import { VoucherCategoryDTO, voucherCategoryValidation } from "../../models/business-config/business-config.model";
import { SharedModule } from "src/app/shared/shared.module";


@Component({
  selector: 'app-voucher-category',
  templateUrl: './voucher-category.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
   standalone:true,
    imports:[
      SharedModule
    ]
})
export class VoucherCategoryComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  objectState: any = FixedIDs.objectState;

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("voucherCategoryForm", { static: true, read: NgForm }) voucherCategoryForm: NgForm;
  public validationMsgObj: any;
  isPlaceholderDisable: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = voucherCategoryValidation();
  }

  ngOnInit(): void {
    this.getDefaultData();
  }


  getDefaultData() {
    try {
      this.modelSvc.voucherCategoryDTO = new VoucherCategoryDTO();
      this.modelSvc.getVoucherList();
      this.getVoucherCategoryList();
      this.initGridOption();
      if(this.modelSvc.voucherList.length == 1) {
        this.isPlaceholderDisable = true;
      }
      else
      {
        this.isPlaceholderDisable = false;
      }
    } catch (error) {
      throw error;
    }
  }


  getVoucherCategoryList() {
    try {
      this.dataSvc.getVoucherCategoryList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.voucherCategoryList = data;
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
        dataSource: "modelSvc.voucherCategoryList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        // exportOption: {
        //   exportInPDF: true,
        //   exportInXL: true,
        //   title: this.fieldTitle["vouchercategory"]
        // }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "title", header: this.fieldTitle['vouchercategorytitle'] },
      { field: "voucherType", header: this.fieldTitle['vouchertype'] },
      { field: "transactionNatureName", header: this.fieldTitle['transactionnature'] },
      // { field: "isActive", header: this.fieldTitle['active'], isBoolean: true, styleClass: "d-center" },
      { header: this.fieldTitle['action'] }
    ]
  }

  refresh(){
    try {
      this.getVoucherCategoryList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveVoucherCategory (formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      if(this.modelSvc.voucherCategoryDTO.voucherCode == 0)
      {
        this.modelSvc.voucherCategoryDTO.voucherCode = null;
      }
      this.save(this.modelSvc.voucherCategoryDTO);
    } catch (error) {
      
    }
  }

  private save(voucherCategoryDTO: VoucherCategoryDTO) {
    try {
      let messageCode = voucherCategoryDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.saveVoucherCategory(voucherCategoryDTO).subscribe({ 
        next: (res: any) => {
          this.modelSvc.voucherCategoryList.push(res.body);

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
      if (this.voucherCategoryForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.modelSvc.prepareVoucherCategoryEditForm(entity);
              setTimeout(() => {
                this.voucherCategoryForm.form.markAsPristine();
              }, 50);
            }
          });
      } else {
        this.modelSvc.prepareVoucherCategoryEditForm(entity);
        setTimeout(() => {
          this.voucherCategoryForm.form.markAsPristine();
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
            this.dataSvc.removeVoucherCategory(entity.id).subscribe({
              next: (res: any) => { 
                this.modelSvc.deleteVoucherCategoryCollection(entity);
                this.showMsg(this.messageCode.deleteCode);
                this.gridOption.totalRecords = this.modelSvc.voucherCategoryList.length;
                if (entity.id == this.modelSvc.tempVoucherCategoryDTO.id) {
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
      this.formResetByDefaultValue(this.voucherCategoryForm.form, this.modelSvc.voucherCategoryDTO);
      this.focus(this.voucherCategoryForm.form, 'voucherCategoryDTO');
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      this.focus(this.voucherCategoryForm.form, "voucherCategory");
      if (this.modelSvc.voucherCategoryDTO.id > 0) {
        this.voucherCategoryForm.form.markAsPristine();
        this.formResetByDefaultValue(this.voucherCategoryForm.form, this.modelSvc.tempVoucherCategoryDTO);
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
