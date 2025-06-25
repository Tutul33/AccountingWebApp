import { Component, OnInit } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs } from '../../../shared';

import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';
import { AccountDestinationDTO } from "../../models/business-config/business-config.model";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-destinations-define',
  templateUrl: './destinations-define.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
   standalone:true,
    imports:[
      SharedModule
    ]
})
export class DestinationsDefineComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  objectState: any = FixedIDs.objectState;
  accountDestination: any = FixedIDs.AccountDestination;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.initGridOption();
    setTimeout(() => {
      this.getAccountDestinationList();
    }, 10);
  }

  getAccountDestinationList() {
    try {
      this.dataSvc.getAccountDestinationList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.accountDestinationList = data;
          this.modelSvc.tempaccountDestinationList = data;
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
        dataSource: "modelSvc.accountDestinationList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "destinationCode", header: this.fieldTitle['code'] },
      { field: "destinations", header: this.fieldTitle['destinations'] },
      { field: "isActive", header: this.fieldTitle['isenable'] },
    ]
  }

  refresh(){
    try {
      this.getAccountDestinationList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  changeActiveStatus(entity: any)
  {
    try {
      this.modelSvc.prepareDestinationDefine(entity);

      this.saveAccountDestination(this.modelSvc.accountDestinationDTOList);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private saveAccountDestination(accountDestinationDTOList: AccountDestinationDTO[]) {
    try {
      let messageCode = this.messageCode.editCode;
      this.dataSvc.saveAccountDestination(accountDestinationDTOList).subscribe({
        next: (res: any) => {
          this.showMsg(messageCode);
        },
        error: (e: any) => {
          this.showMsg(e);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
}

