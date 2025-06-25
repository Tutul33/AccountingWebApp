import { Component, OnInit } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { AuthenticationService, FixedIDs, GlobalConstants } from '../../../shared';

import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService,
  AdminService
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-account-head',
  templateUrl: './account-head.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
  standalone:true,
  imports:[
    SharedModule
  ]
})
export class AccountHeadComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  objectState: any = FixedIDs.objectState;
  coaCode:any;
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
    private adminSvc: AdminService,
      private authService: AuthenticationService, 
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.initGridOption();
    this.showCOA();
    this.getUDC_AccountHeadList();
    // setTimeout(() => {
    //   this.getUDC_AccountHeadList();
    // }, 10);
  }

  getUDC_AccountHeadList() {
    try {
      this.dataSvc.getUDC_AccountHeadList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.accountHeadList = data;
          this.modelSvc.tempAccountHeadList = data;

          this.modelSvc.prepareAccountHeadData();
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
        dataSource: "modelSvc.accountHeadList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "sl", header: this.fieldTitle['sl'] },
      { field: "value", header: this.fieldTitle['accountheadlevel'] },
    ]
  }

  refresh() {
    try {
      this.getUDC_AccountHeadList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  changeIsSkipped() {
    try {
      this.modelSvc.code = FixedIDs.accountHead.ControlLedger;
      this.SaveCOALevelDepth();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private SaveCOALevelDepth() {
    try {
      this.dataSvc.saveCOALevelDepth(this.modelSvc.code, this.modelSvc.isSkipped).subscribe({
        next: (res: any) => {
          this.showMsg(this.messageCode.editCode);
          this.getUDC_AccountHeadList();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCOA(){
    try {
      this.dataSvc.saveCOACode(this.coaCode, this.modelSvc.isCOA).subscribe({
        next: (res: any) => {
          this.showMsg(this.messageCode.editCode);
          setTimeout(() => {
            this.authService.logout();
          }, 2900);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

 
  showCOA() {
    try {
      this.adminSvc.getBizConfigInfo().subscribe({
        next: (res: any) => {
          if (res.length > 0) {
            res.forEach(element => {
              switch (element.keyCode) {
                case 'ICA':
                  this.coaCode=element.keyCode
                  this.modelSvc.isCOA = element.isActive;
                  break;
                default:
                  break;
              }
            });
          }

        }
      });
    } catch (e) {

    }
  }
}
