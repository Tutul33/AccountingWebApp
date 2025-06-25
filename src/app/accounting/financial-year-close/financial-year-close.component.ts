import { Component, OnInit } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs } from '../../shared';

import {
  ProviderService,
  BaseComponent,
  FinancialYearDataService,
  FinancialYearModelService,
  QueryData
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-financial-year-close',
  templateUrl: './financial-year-close.component.html',
  providers: [FinancialYearDataService, FinancialYearModelService],
  standalone:true,
  imports:[SharedModule]
})
export class FinancialYearCloseComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
    objectState: any = FixedIDs.objectState;
    spData: any = new QueryData();
  
    constructor(
      protected providerSvc: ProviderService,
      public modelSvc: FinancialYearModelService,
      private dataSvc: FinancialYearDataService,
      public dialogService: DialogService,
      //private gsSvc: GeneralSetupService,
    ) {
      super(providerSvc);
    }
  
    ngOnInit(): void {
      this.getDefaultData();
    }
  
  
    getDefaultData() {
      try {
        this.getFinancialYeartList(true);
        this.initGridOption();
      } catch (error) {
        throw error;
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
            this.modelSvc.prepareFinancialYearCloseData();
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
            title: this.fieldTitle["closefinancialyear"]
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
  
    refresh(){
      try {
        this.getFinancialYeartList(true);
      } catch (error) {
        this.showErrorMsg(error);
      }
    }
  
    reopenYear(entity: any) {
      try {
        this.utilitySvc
        .showConfirmModal("2255")
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.updateFinancialYearStatus(entity.id, FixedIDs.FinancialYearStatus.Open).subscribe({
              next: (res: any) => { 
                this.getDefaultData();
                this.modelSvc.isResetModalShow = true;
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
  
    closeYear(entity: any) {
      try {
        this.utilitySvc
        .showConfirmModal("2256")
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            const financialEndingDate = new Date(entity.toDate);
            const currentDate = new Date();
            //financialEndingDate.setHours(0, 0, 0, 0);
            //currentDate.setHours(0, 0, 0, 0);
  
            // Compare the dates
            if (currentDate > financialEndingDate) {
              this.dataSvc.updateFinancialYearStatus(entity.id, FixedIDs.FinancialYearStatus.Closed).subscribe({
                next: (res: any) => { 
                  this.getDefaultData();
                  this.modelSvc.isCloseModalShow = true;
                },
                error: (res: any) => {
                  this.showErrorMsg(res);
                },
              });
            } else {
              this.showMsg("2278");
            }
          }
        });
      } catch (e) {
        this.showErrorMsg(e);
      }
    }
  
    oncloseResetModal(){
      this.modelSvc.isResetModalShow = false;
    }
  
    oncloseCloseModal(){
      this.modelSvc.isCloseModalShow = false;
    }
    
  }
  