import { Component, OnInit, ViewChild } from "@angular/core";
import {
  BaseComponent,
  FixedIDs,
  GlobalConstants,
  GlobalMethods,
  GridOption,
  ProviderService,
  QueryData,
} from "src/app/app-shared";
import { NgForm } from "@angular/forms";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { OrgService } from "src/app/app-shared/services/org.service";
import { COADataService } from "../services/coa/coa-data.service";
import { forkJoin, map } from "rxjs";
import { ChartOfAccountReportModelService } from "../index";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-chart-of-accounts-report",
  templateUrl: "./chart-of-accounts-report.component.html",
  providers: [ChartOfAccountReportModelService, COADataService],
  standalone:true,
  imports:[
    SharedModule
  ]
})
export class ChartOfAccountsReportComponent extends BaseComponent
  implements OnInit {
  @ViewChild("filterForm", { static: true, read: NgForm }) filterForm: NgForm;
  gridOption: GridOption;
  spData: any = new QueryData();
  isRefresh: boolean = false;
  searchParam:any={
    projectID:null,
    projectName:'',
    orgID:null,
    orgName:'',
    companyID:GlobalConstants.userInfo.companyID,
    company:GlobalConstants.userInfo.company
  };
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ChartOfAccountReportModelService,
    public dataSvc: COADataService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.setBranchProjectConfig();
    this.modelSvc.fieldTitle = this.fieldTitle;
    this.modelSvc.keyValuePair = GlobalMethods.createKeyValuePair;
    this.isRefresh = true;
    this.initGridOption();
    this.getDefaultData();   
    this.getOfficeBranchList(this.searchParam.companyID);
    this.getProject(this.searchParam.companyID);
  }
  setBranchProjectConfig(){
    try {
      this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getReportData() {
    try {
      let ddlProperties = this.modelSvc.prepareDDLList();
      this.spData = new QueryData({
        ddlProperties: ddlProperties,
        pageNo: 1
      });
        this.populateGrid(this.isRefresh);
    } catch (error) {
      this.showMsg(error);
    }
  }
  
  getDefaultData() {
    try {
          
          forkJoin([
            this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
            this.coreAccountingSvc.getIsSkippedControlLedger()
          ]).subscribe({
              next: (res: any) => {
                this.modelSvc.companyList = res[0] || [];
                this.modelSvc.isSkippedControlLedger = res[1];
                this.getReportData();
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onSelectToCompany() {
    try {
      if(this.searchParam.companyID){
        this.getOfficeBranchList(this.searchParam.companyID);
        this.getProject(this.searchParam.companyID);
      }else{        
      this.searchParam.projectID=null;
      this.searchParam.projectName=null;
      this.searchParam.orgID=null;
      this.searchParam.orgName=null;
      this.searchParam.company=null;
      this.isRefresh=true;
      this.getReportData();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getOfficeBranchList(companyId: any) {
    try {
      this.orgSvc
        .getOrgStructure(
          FixedIDs.orgType.Office.toString() +
            "," +
            FixedIDs.orgType.Branch.toString() +
            "," +
            FixedIDs.orgType.Unit.toString(),
          companyId
        )
        .subscribe({
          next: (res: any) => {
            this.modelSvc.officeBranchList = this.modelSvc.prepareOfficeBranchUnit(
              res || []
            );
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

  getProject(companyId: any) {
    try {
      this.coreAccountingSvc.getProject(companyId).subscribe({
        next: (res: any) => {
          this.modelSvc.projectList = res || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.chartOfAccountList",
        refreshEvent: this.refreshEventHandler,
        columns: this.modelSvc.gridColumns(),
        getServerData: this.onPage,
        filterFromServer: this.filterFromServer,
        lazy: true,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          exportDataEvent: this.onExport,
          title: "",
        },
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {}
  }
  onPage(event: any, isRefresh: boolean = false) {
    try {
      this.spData.pageNo = this.gridOption.serverPageNumber(event);
      this.spData.pageDataCount = event.rows;
      this.populateGrid(isRefresh);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  filterFromServer(event: any, filters: any[]) {
    try {   
      this.spData.searchParams = this.modelSvc.prepareSearchParams(filters);
      this.spData.pageNo = 1;
      this.populateGrid(false);
      this.pageReset(0);  
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  populateGrid(isRefresh: boolean) {
    try {
      this.spData.isRefresh = isRefresh;
      this.dataSvc
        .getChartOfAccountReports(
          this.spData,
          this.searchParam.orgID,
          this.searchParam.projectID
        )
        .subscribe({
          next: (res: any) => {
            if (isRefresh == true) this.bindData(res);
            this.modelSvc.prepareChartOfAccountReportsList(res[res.length - 1] || []);
            this.gridOption.totalRecords = res[res.length - 4].totalData;
            this.spData.isRefresh = false;
            this.isRefresh = false;            
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
          complete: () => {
            this.spData.isRefresh = false;
          },
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindData(data: any) {
    try {
      this.modelSvc.prepareGridDDLList(data);
      this.gridOption.columns = this.modelSvc.gridColumns();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  refreshEventHandler(isRefresh: boolean = true) {
    try {
      this.spData.pageNo = this.gridOption.resetPageNumber(this.gridOption.first);
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  pageReset(pageNumber: number) {
    try {
      this.gridOption.first = pageNumber;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onExport(event: any) {
    try {
      let title = this.fieldTitle["chartofaccountsreport"];
      if(this.searchParam.company)  
        {
          title+="("+this.searchParam.company;
        }
      if(this.searchParam.orgName)  
        {
          title+=","+this.searchParam.orgName;
        }
      if(this.searchParam.projectName)  
        {
          title+=","+this.searchParam.projectName;
        }
      
      title+=")";        
      event.exportOption.title =title;
      let spData = GlobalMethods.jsonDeepCopy(this.spData);
      spData.pageNo = 0;
     
      return this.dataSvc
        .getChartOfAccountReports(
          spData,
          this.searchParam.orgID,
          this.searchParam.projectID
        )
        .pipe(
          map((response: any) => {
            return {
              values: this.modelSvc.prepareChartOfAccountReportsExportData(response[response.length - 1]),
              columns: this.modelSvc.prepareReportHeaderList(),
            };
          })
        );
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onSelectToProject() {
    try {
      if(!this.searchParam.projectID)
        this.searchParam.projectName=null;
      
      this.isRefresh = true;
      this.getReportData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onSelectToOrg() {
    try {
      if(!this.searchParam.orgID)
        this.searchParam.orgName=null;

      this.isRefresh = true;
      this.getReportData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
}
