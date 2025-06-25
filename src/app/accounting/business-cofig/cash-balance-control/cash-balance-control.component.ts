import { Component, OnInit, ViewChild } from "@angular/core";
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs,  GlobalConstants,  GlobalMethods,  ValidatorDirective } from '../../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';

import { OrgService } from "src/app/app-shared/services/org.service";
import { OrgCashConfigDTO, orgCashConfigValidation } from "../../models/business-config/business-config.model";
import { SharedModule } from "src/app/shared/shared.module";


@Component({
  selector: 'app-cash-balance-control',
  templateUrl: './cash-balance-control.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
   standalone:true,
    imports:[
      SharedModule
    ]
})
export class CashBalanceControlComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  isInValidBranch: boolean = false;
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("orgCashConfigForm", { static: true, read: NgForm }) orgCashConfigForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    private orgSvc: OrgService,
  ) {
    super(providerSvc);
    this.validationMsgObj = orgCashConfigValidation();
  }

  ngOnInit(): void {
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.getDefaultData();
  }

  getDefaultData() {
    try {
      this.modelSvc.orgCashConfigDTO = new OrgCashConfigDTO();
      this.getCompanyBranchList();
      this.getCompanyList();
      this.initGridOption();
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getCompanyBranchList() {
    try {
      this.dataSvc.getCompanyBranchList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.companyBranchList = data;
          this.getOrgCashConfigList();
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

  getCompanyList() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res || [];
          this.onChangeCompany();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany() {
    try {
      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      let orgID = this.modelSvc.orgCashConfigDTO.companyID ? this.modelSvc.orgCashConfigDTO.companyID.toString() : null;
    
      this.orgSvc.getOrgStructure(elementCode, orgID).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareOfficeBranchUnitList(res || []);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {},
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getOrgCashConfigList() {
    try {
      this.dataSvc.getOrgCashConfigList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.orgCashConfigList = data;

          this.modelSvc.prepareCashBalanceListData();
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

  onSelectOrg() {
    try {
      if(this.modelSvc.isBranchModuleActive)
        this.isInValidBranch = this.modelSvc.orgCashConfigDTO.orgID ? false : true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

    
  // initGridOption() {
  //   try {
  //     const gridObj = {
  //       dataSource: "modelSvc.orgCashConfigList",
  //       columns: this.gridColumns(),
  //       refreshEvent: this.refresh,
  //       exportOption: {
  //         exportInPDF: true,
  //         exportInXL: true,
  //         title: this.fieldTitle["cashbalancecontrolconfig"]
  //       }
  //     } as GridOption;
  //     this.gridOption = new GridOption(this, gridObj);
  //   } catch (e) {
  //   }
  // }


  // gridColumns(): ColumnType[] {
  //   return [
  //     { field: "companyName", header: this.fieldTitle['company'] },
  //     ...(this.modelSvc.isBranchModuleActive ? [{ field: "unitBranchName", header: this.fieldTitle['unit/branch'] }] : []),
  //     //{ field: "unitBranchName", header: this.fieldTitle['unit/branch'] },
  //     { field: "isNegativeBalanceAllowed", header: this.fieldTitle['isnegetivebalanceacceptence'], isBoolean: true, styleClass: "d-center" },
  //     { header: this.fieldTitle['action'] }
  //   ]
  // }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.companyBranchList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["cashbalancecontrolconfig"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "companyName", header: this.fieldTitle['company'] },
      ...(this.modelSvc.isBranchModuleActive ? [{ field: "unitBranchName", header: this.fieldTitle['unit/branch'] }] : []),
      //{ field: "unitBranchName", header: this.fieldTitle['unit/branch'] },
      { field: "isNegativeBalanceAllowed", header: this.fieldTitle['isnegetivebalanceacceptence'], isBoolean: true, styleClass: "d-center" },
    ]
  }

  refresh(){
    try {
      this.getOrgCashConfigList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveOrgCashConfig (formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.save(this.modelSvc.orgCashConfigDTO);

      // this.modelSvc.prepareOrgCashConfigDataBeforeSave();
      // this.checkEntryValidityToSave();
    } catch (error) {
      
    }
  }

  checkEntryValidityToSave() {
    try {
      const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
      if (objBrnchPjctInValid) {  
        this.isInValidBranch = true;
        this.showMsg('2281');
        return;
      }else{
        this.isInValidBranch = false;
      }

      this.save(this.modelSvc.orgCashConfigDTO);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private save(orgCashConfigDTO: OrgCashConfigDTO) {
    try {
      let messageCode = orgCashConfigDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.saveOrgCashConfig(orgCashConfigDTO).subscribe({ 
        next: (res: any) => {
          this.getOrgCashConfigList();
          //this.modelSvc.updateOrgCashConfigCollection(res.body);

          //this.setNew();
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
      if (this.orgCashConfigForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.modelSvc.prepareOrgCashConfigEditForm(entity);
              setTimeout(() => {
                this.orgCashConfigForm.form.markAsPristine();
              }, 50);
            }
          });
      } else {
        this.modelSvc.prepareOrgCashConfigEditForm(entity);
        setTimeout(() => {
          this.orgCashConfigForm.form.markAsPristine();
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
            this.dataSvc.removeOrgCashConfig(entity.id).subscribe({
              next: (res: any) => { 
                this.modelSvc.prepareOrgCashConfigEditForm(entity);
                this.showMsg(this.messageCode.deleteCode);
                this.gridOption.totalRecords = this.modelSvc.orgCashConfigList.length;
                if (entity.id == this.modelSvc.tempOrgCashConfigDTO.id) {
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
      this.formResetByDefaultValue(this.orgCashConfigForm.form, this.modelSvc.orgCashConfigDTO);
      this.focus(this.orgCashConfigForm.form, 'orgCashConfigDTO');
      this.modelSvc.orgCashConfigDTO;
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      this.focus(this.orgCashConfigForm.form, "orgCashConfig");
      if (this.modelSvc.orgCashConfigDTO.id > 0) {
        this.orgCashConfigForm.form.markAsPristine();
        this.formResetByDefaultValue(this.orgCashConfigForm.form, this.modelSvc.tempOrgCashConfigDTO);
      } 
      else {
        this.setNew();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  changeActiveStatus(entity) {
    try {
      this.modelSvc.tempOrgCashConfigDTO = GlobalMethods.jsonDeepCopy(entity);
      let saveData = new OrgCashConfigDTO(entity);

      this.save(saveData);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
}
