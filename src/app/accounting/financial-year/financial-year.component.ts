import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalConstants, ValidatorDirective } from '../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  FinancialYearDataService,
  FinancialYearModelService,
  QueryData
} from '../index';
import { FinancialYearDTO, financialYearValidation } from "../models/financial-year/financial-year";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-financial-year',
  templateUrl: './financial-year.component.html',
  providers: [FinancialYearDataService, FinancialYearModelService],
  standalone:true,
  imports:[SharedModule]
})
export class FinancialYearComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  spData: any = new QueryData();
  status: any = FixedIDs.FinancialYearStatus;

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("financialYearForm", { static: true, read: NgForm }) financialYearForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: FinancialYearModelService,
    private dataSvc: FinancialYearDataService,
    public dialogService: DialogService,
    //private gsSvc: GeneralSetupService,
  ) {
    super(providerSvc);
    this.validationMsgObj = financialYearValidation();
  }

  ngOnInit(): void {
    this.getDefaultData();
  }


  getDefaultData() {
    try {
      this.modelSvc.financialYearDTO = new FinancialYearDTO();
      this.getFinancialYeartList(true);
      this.getYearList();
      this.getMonthList();
      this.initGridOption();
    } catch (error) {
      throw error;
    }
  }

  getYearList() {
    try {
      this.modelSvc.yearList.push(...this.modelSvc.yearData);

      // this.gsSvc.getYears().subscribe({
      //   next: (res: any) => {
      //     this.modelSvc.yearList = res.filter(x => x.status != 1).reverse();
      //   },
      //   error: (res: any) => {
      //     this.showErrorMsg(res);
      //   }
      // });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getMonthList() {
    try {
      this.modelSvc.monthList.push(...GlobalConstants.months);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  getFinancialYeartList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getFinancialYeartList(this.spData).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);

          let data = res[res.length - 1] || [];
          this.modelSvc.financialYearList = data;
          this.prepareData();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { 
          this.spData.isRefresh = false;
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  prepareData(){
    try {
      this.modelSvc.prepareData();
      if(this.modelSvc.financialYearDTO.fromYearID != null)
      {
        this.changeFromYear();
      }
      if(this.modelSvc.financialYearDTO.fromMonthID != null)
      {
        this.changeFromMonth();
      }

      if(this.modelSvc.financialYearList.length == 0)
      {
        this.modelSvc.financialYearDTO.status = FixedIDs.FinancialYearStatus.Closed;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("Name, Name");
      ddlProperties.push("FromDate, FromDate");
      ddlProperties.push("ToDate, ToDate");
      ddlProperties.push("StatusValue, StatusValue");
    return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.financialYearDDList = data[0];
      this.modelSvc.financialYearFromDateDDList = data[1];
      this.modelSvc.financialYearToDateDDList = data[2];
      this.modelSvc.financialYearStatusDDList = data[3];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
    
  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.financialYearList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["financialyear"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "name", header: this.fieldTitle['financialyear'], isDDFilter: true, dataList: this.modelSvc.financialYearDDList, labelField: 'Name' },
      { field: "fromDate", header: this.fieldTitle['fromdate'], isDDFilter: true, dataList: this.modelSvc.financialYearFromDateDDList, labelField: 'FromDate' },
      { field: "toDate", header: this.fieldTitle['todate'], isDDFilter: true, dataList: this.modelSvc.financialYearToDateDDList, labelField: 'ToDate' },
      { field: "statusValue", header: this.fieldTitle['status'], isDDFilter: true, dataList: this.modelSvc.financialYearStatusDDList, labelField: 'StatusValue' },
      { header: this.fieldTitle['action'] }
    ]
  }

  changeDate(){
    try {
      setTimeout(() => {
      this.changeFromYear();
      this.changeFromMonth();

      if(this.modelSvc.financialYearDTO.fromYearID != null && this.modelSvc.financialYearDTO.toYearID != null 
        && this.modelSvc.financialYearDTO.fromMonthID != null && this.modelSvc.financialYearDTO.toMonthID != null)
      {
        let fromYear = this.modelSvc.financialYearDTO.fromYear;
        let toYear = this.modelSvc.financialYearDTO.toYear;
        let fromMonth = this.modelSvc.financialYearDTO.fromMonth;
        let toMonth = this.modelSvc.financialYearDTO.toMonth;

        let shortFromYear = fromYear.toString().slice(-2);
        let shortToYear = toYear.toString().slice(-2);
        
        let shortFromMonth = this.modelSvc.monthShortNames[fromMonth];
        let shortToMonth = this.modelSvc.monthShortNames[toMonth];

        this.modelSvc.financialYearDTO.name = `${shortFromMonth}-${shortFromYear} To ${shortToMonth}-${shortToYear}`;
      }
      else
      {
        this.modelSvc.financialYearDTO.name = null;
      }
      }, 30);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  changeFromYear() {
    const fromYear = this.modelSvc.financialYearDTO.fromYear;
    this.modelSvc.toYearList = this.modelSvc.yearList.filter(item => item.year >= fromYear);
  }

  changeFromMonth() {
    const fromMonthID = this.modelSvc.financialYearDTO.fromMonthID;
    const fromYear = this.modelSvc.financialYearDTO.fromYearID;
    const toYear = this.modelSvc.financialYearDTO.toYearID; 

    if(fromYear != null && toYear != null && fromMonthID != null && fromYear == toYear)
    {
      this.modelSvc.toMonthList = this.modelSvc.monthList.filter(item => item.code > fromMonthID);
    }
    else if(fromYear != null && toYear != null && fromMonthID != null && toYear > fromYear)
    {
      this.modelSvc.toMonthList = this.modelSvc.monthList;
    }
  }



  refresh(){
    try {
      this.getFinancialYeartList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveFinancialYear(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }


      //check overlap entry
      if (this.modelSvc.checkOverlap(this.modelSvc.financialYearDTO)) {
        this.showMsg("2276");
        return;
      }
      

      //check duplicate entry
      if (this.modelSvc.checkDuplicate(this.modelSvc.financialYearDTO)) {
        this.showMsg(this.messageCode.duplicateCheck);
        return;
      }

      this.save(this.modelSvc.financialYearDTO);

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private save(financialYearDTO: FinancialYearDTO) {
    try {
      let messageCode = financialYearDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
      let isEdit = financialYearDTO.id ? true : false;

      this.dataSvc.saveFinancialYear(financialYearDTO).subscribe({ 
        next: (res: any) => {
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
      this.prepareYearMonthForEdit(entity);
      
      if (this.financialYearForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.modelSvc.prepareEditForm(entity);
              this.financialYearForm.form.markAsPristine();
            }
          });
      } else {
        this.modelSvc.prepareEditForm(entity);
        this.financialYearForm.form.markAsPristine();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  prepareYearMonthForEdit(entity: any)
  {
    try {
      const fromYear = entity.fromYear;
      const fromMonthID = entity.fromMonthID;
      const toYear = entity.toYearID; 
      
      this.modelSvc.toYearList = this.modelSvc.yearList.filter(item => item.year >= fromYear);

      if(fromYear != null && toYear != null && fromMonthID != null && fromYear == toYear)
      {
        this.modelSvc.toMonthList = this.modelSvc.monthList.filter(item => item.code > fromMonthID);
      }
      else if(fromYear != null && toYear != null && fromMonthID != null && toYear > fromYear)
      {
        this.modelSvc.toMonthList = this.modelSvc.monthList;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }



  delete(entity: any) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.remove(entity.id).subscribe({
              next: (res: any) => { 
                this.showMsg(this.messageCode.deleteCode);
                this.setNew();
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
      this.getFinancialYeartList(true);
      this.initGridOption();
      this.gridOption.totalRecords = this.modelSvc.financialYearList.length;
      this.modelSvc.financialYearDTO = new FinancialYearDTO();
      setTimeout(() => {
        this.formResetByDefaultValue(this.financialYearForm.form, this.modelSvc.financialYearDTO);
      }, 30); 
      this.focus(this.financialYearForm.form, 'FinancialYear');
      if(this.modelSvc.financialYearList.length == 0)
      {
        this.modelSvc.isFromDateDisabled = false;
        this.modelSvc.isFromMonthDisabled = false;
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      this.focus(this.financialYearForm.form, "FinancialYear");
      if (this.modelSvc.financialYearDTO.id > 0) {
        this.financialYearForm.form.markAsPristine();
        this.formResetByDefaultValue(this.financialYearForm.form, this.modelSvc.tempFinancialYearDTO);
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
