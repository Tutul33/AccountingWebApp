import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { OrgCashConfigDTO, AccountDestinationDTO, SubLedgerTypeDTO, TransactionModeDTO, VoucherNotificationDTO, ProjectBranchDTO, VoucherCategoryDTO } from '../../models/business-config/business-config.model';

@Injectable()
export class BusinessConfigDataService {
  controllerName = Config.url.accountingLocalUrl + "BusinessConfig"; 

  constructor(private apiSvc: ApiService) { }

  saveAccountDestination(accountDestinationDTOList: AccountDestinationDTO[]): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveAccountDestination`, accountDestinationDTOList, true);
  }

  getAccountDestinationList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetAccountDestinationList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getUDC_AccountHeadList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetUDCAccountHeadList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  saveCOALevelDepth(code: number, isSkipped: boolean): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/SaveCOALevelDepth`, { code: code, isSkipped: isSkipped})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  saveCOACode(code: any, isSkipped: boolean): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/SaveCOACode`, { code: code, isSkipped: isSkipped})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  saveSubLedgerType(subLedgerTypeDTO: SubLedgerTypeDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveSubLedgerType`, subLedgerTypeDTO, true);
  }

  removeSubLedgerType(id: number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/DeleteSubLedgerType`, { id: id})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  getSET_SubLedgerTypeList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetSET_SubLedgerTypeList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }


  saveTransactionMode(transactionModeDTO: TransactionModeDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveTransactionMode`, transactionModeDTO, true);
  }

  removeTransactionMode(code: number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/DeleteTransactionMode`, { code: code})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  getUDC_TransactionModeList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetUDC_TransactionModeList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  saveVoucherNotification(voucherNotificationDTO: VoucherNotificationDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveVoucherNotification`, voucherNotificationDTO, true);
  }

  getVoucherNotificationList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetVoucherNotificationList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  saveProjectBranch(projectBranchDTO: ProjectBranchDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveProjectBranch`, projectBranchDTO, true);
  }

  getVoucherListForBizConfig(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetVoucherListForBizConfig", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getProjectBranchList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetProjectBranchList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  saveVoucherCategory(voucherCategoryDTO: VoucherCategoryDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveVoucherCategory`, voucherCategoryDTO, true);
  }

  getVoucherCategoryList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetVoucherCategoryList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  removeVoucherCategory(id: number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/DeleteVoucherCategory`, { id: id})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  saveOrgCashConfig(orgCashConfigDTO: OrgCashConfigDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveOrgCashConfig`, orgCashConfigDTO, true);
  }

  getOrgCashConfigList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgCashConfigList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getCompanyBranchList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetCompanyBranchList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  
  removeOrgCashConfig(id: number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/DeleteOrgCashConfig`, { id: id})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  getUDC_ChequeLeafStatusList(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetUDC_ChequeLeafStatusList", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  updateChequeLeafStatus(code: number, isActive: boolean): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/UpdateChequeLeafStatus`, { code: code, isActive: isActive})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  getChequeStatusNotifyBizConfig(){
    return this.apiSvc.executeQuery(this.controllerName + "/GetChequeStatusNotifyBizConfig", { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  updateChequeStatusNotify(id: number, value: number, isActive: boolean): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/UpdateChequeStatusNotify`, { id: id, value: value, isActive: isActive})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }


}
