import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { FixedIDs, GlobalConstants, ValidatorDirective } from '../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";
import { forkJoin } from 'rxjs';

import {
  ProviderService,
  BaseComponent,
  BankReconciliationDataService,
  BankReconciliationModelService,
  QueryData
} from '../index';
import { BankReconciliationDTO, bankReconciliationValidation } from "../models/bank-reconciliation/bank-reconciliation";
import { SharedModule } from "src/app/shared/shared.module";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { OrgService } from "src/app/app-shared/services/org.service";

@Component({
  selector: 'app-bank-reconciliation',
  templateUrl: './bank-reconciliation.component.html',
  providers: [BankReconciliationDataService, BankReconciliationModelService],
  standalone:true,
  imports:[SharedModule]
})
export class BankReconciliationComponent extends BaseComponent implements OnInit {
  spData: any = new QueryData();
  isPlaceholderDisableCompany: boolean = false;
  fileName: string = "";
  isInValidBranch: boolean = false;

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("bankReconciliationForm", { static: true, read: NgForm }) bankReconciliationForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BankReconciliationModelService,
    private dataSvc: BankReconciliationDataService,
    public dialogService: DialogService,
    private coreAccountingSvc: CoreAccountingService,
    private orgSvc: OrgService,
  ) {
    super(providerSvc);
    this.validationMsgObj = bankReconciliationValidation();
  }

  ngOnInit(): void {
    this.modelSvc.prepareData();
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.getDefaultData();
  }
  
  
  getDefaultData() {
    try {
      forkJoin([
        this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
        this.dataSvc.getOpenFinancialYearDateList(),
        this.dataSvc.getBankReconciliationLedgerList(),
      ]).subscribe({
          next: (res: any) => {
            this.modelSvc.companyList = res[0] || [];
            this.modelSvc.openFinancialYearDateList = res[1] || [];
            this.modelSvc.bankReconciliationLedgerList = res[2] || [];
            this.modelSvc.tempBankReconciliationLedgerList = res[2] || [];
            
            this.onChangeCompany();

            if(this.modelSvc.companyList.length == 1) {
              this.isPlaceholderDisableCompany = true;
            }
            else
            {
              this.isPlaceholderDisableCompany = false;
            }
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany(){
    try {
      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      forkJoin([
        this.orgSvc.getOrgStructure(elementCode, this.modelSvc.bankReconciliationDTO.companyID.toString()),
        this.coreAccountingSvc.getProject(this.modelSvc.bankReconciliationDTO.companyID),
      ]).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareOfficeBranchUnitList(res[0] || []);
          this.modelSvc.projectList = res[1] || []; 
          this.modelSvc.manageDropdownList();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {},
      });

      setTimeout(() => {
        this.modelSvc.loadBankAccounts();
      }, 50);
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeOrgProject(){
    this.modelSvc.loadBankAccounts();
  }

  onImageChange(entity) {
    try {
      if(!entity.tag)
      {
        entity.setModifyTag();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onRemoveImage(entity) {
    try {
      if(!entity.tag)
      {
        entity.setModifyTag();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveBankReconciliation(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      const isFinancialYearValidation = this.modelSvc.checkFinancialYearValidation();
      if(!isFinancialYearValidation)
      {
        this.showMsg("2287");
        return;
      }

      // const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
      // if (objBrnchPjctInValid) {  
      //   this.isInValidBranch = true;
      //   this.showMsg('2281'); 
      //   return;         
      // }  

      this.modelSvc.prepareDataBeforeSave();
      this.save(this.modelSvc.bankReconciliationDTO);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  save(bankReconciliationDTO: BankReconciliationDTO) {
    try {
      let messageCode = bankReconciliationDTO.id > 0 ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.save(bankReconciliationDTO).subscribe({
        next: (res: any) => {

          let resData = res.body;

          this.setNew();
          this.showMsg(messageCode);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
      
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      this.modelSvc.bankReconciliationLedgerList = this.modelSvc.tempBankReconciliationLedgerList;
      this.focus(this.bankReconciliationForm.form, "bankReconciliationDTO");
      if (this.modelSvc.bankReconciliationDTO.id > 0) {
        this.bankReconciliationForm.form.markAsPristine();
        this.formResetByDefaultValue(this.bankReconciliationForm.form, this.modelSvc.tempBankReconciliationDTO);
      } 
      else {
        this.setNew();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNew() {
    try {
      this.modelSvc.prepareData();
      this.getDefaultData();
      this.formResetByDefaultValue(this.bankReconciliationForm.form, this.modelSvc.bankReconciliationDTO);
      this.focus(this.bankReconciliationForm.form, 'bankReconciliationDTO');
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }
}
