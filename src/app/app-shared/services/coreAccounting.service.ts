import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Config, FixedIDs, GlobalConstants, GlobalMethods } from '../index';
import { FileUploadOption, QueryData } from 'src/app/shared/models/common.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { forkJoin, Observable, of } from 'rxjs';
import { VoucherNotificationLogDTO } from 'src/app/accounting/models/voucher-notification-log/voucher-notification-log';
import { VoucherItemChequeAttachmentDTO } from 'src/app/accounting/models/voucher/voucher.model';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CoreAccountingService {
  spData: any = new QueryData();
  controllerName = Config.url.accountingLocalUrl + "CASvc";
  constructor(private apiSvc: ApiService, private fileUploadSvc: FileUploadService) { this.spData.pageNo = 0; }

  getReport(entity: any): Observable<any> {
    return this.apiSvc.post(Config.url.accountingLocalUrl + 'Report/ShowReport', entity);
  }

  getReports(entity: any) {
    return this.apiSvc.post(Config.url.accountingLocalUrl + 'Report/ShowReports', entity);
  }
  printReport(reportData: any) {
    try {
      this.getReport(reportData).subscribe({
        next: async (res: any) => {
          let pdfName = res.body.message;
          window.open(Config.url.accountingReportFileUrl + pdfName, '_blank');
        },
        error: (res: any) => { },
      });
    } catch (e) {
      throw e;
    }
  }
  printReports(reportData: any) {
    try {
      this.getReports(reportData).subscribe({
        next: async (res: any) => {
          let pdfName = res.body.message;
          window.open(Config.url.accountingReportFileUrl + pdfName, '_blank');
        },
        error: (res: any) => { },
      });
    } catch (e) {
      throw e;
    }
  }
  getChartOfAccount(orgID?: number, projectID?: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetChartOfAccount`, { orgID: orgID == null ? '' : orgID, projectID: projectID == null ? '' : projectID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }

  getCOAStructure(orgID?: number, projectID?: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetCOAStructure`, { orgID: orgID == null ? '' : orgID, projectID: projectID == null ? '' : projectID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getTransactionMode(isActive?: boolean): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetTransactionMode`, { isActive: isActive == null ? '' : isActive, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getVoucherNotification(voucherCode?: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetVoucherNotification`, { data: JSON.stringify(this.spData), voucherCode: voucherCode == null ? '' : voucherCode })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getSubLedgerType(isActive?: boolean): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetSubLedgerType`, { isActive: isActive == null ? '' : isActive, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getSubLedgerDetail(subLedgerTypeID?: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetSubLedgerDetail`, { subLedgerTypeID: subLedgerTypeID == null ? '' : subLedgerTypeID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getProject(orgID?: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetProject`, { orgID: orgID == null ? '' : orgID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getLedgerBalance(cOAStructureID: number, companyID: number, subLedgerDetailID?: number, orgID?: number, projectID?: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetLedgerBalance`, { cOAStructureID: cOAStructureID == null ? '' : cOAStructureID, companyID: companyID == null ? '' : companyID, subLedgerDetailID: subLedgerDetailID == null ? '' : subLedgerDetailID, orgID: orgID == null ? '' : orgID, projectID: projectID == null ? '' : projectID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getVoucherEntryEditPeriod(companyID: number, orgID?: number, projectID?: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetVoucherEntryEditPeriod`, { companyID: companyID == null ? '' : companyID, orgID: orgID == null ? '' : orgID, projectID: projectID == null ? '' : projectID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getFinancialYear(): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetFinancialYear`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getVoucher(voucherTypeCd: number, voucherID: number) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetVoucher`, { voucherTypeCd: voucherTypeCd, voucherID: voucherID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1] || [];
        })
      );
  }

  getChequeByVoucherItemID(voucherItemID: number) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetChequeByVoucherItemID`, { voucherItemID: voucherItemID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1] || [];
        })
      );
  }


  getVoucherList(spData: any, companyID: number, fromDate: Date, toDate: Date, voucherTypeCd?: number, approvalStatus?: number, isDraft?: boolean, userID?: number) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetVoucherList`,
        {
          data: JSON.stringify(spData),
          companyID: companyID == null ? '' : companyID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          voucherTypeCd: voucherTypeCd == null ? '' : voucherTypeCd,
          approvalStatus: approvalStatus == null ? '' : approvalStatus,
          isDraft: isDraft == null ? '' : isDraft,
          userID: userID == null ? '' : userID
        })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getVoucherListForApproval(spData: any, companyID: number, fromDate: Date, toDate: Date) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetVoucherListForApproval`,
        {
          data: JSON.stringify(spData),
          companyID: companyID == null ? '' : companyID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null)
        })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  delete(id: number,voucherItemID:number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/Delete`, { id: id,voucherItemID:voucherItemID })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  saveApprovalStatus(id: number, approvalStatus: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/SaveApprovalStatus`, { id: id, approvalStatus: approvalStatus })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  saveApprovalComments(id: number, comments: string): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/SaveApprovalComments`, { id: id, comments: comments == null ? '' : comments })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getIsSkippedControlLedger() {
    return this.apiSvc
      .get(`${this.controllerName}/GetIsSkippedControlLedger`)
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getVoucherTitle() {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetVoucherTitle`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1] || [];
        })
      );
  }
  approveNoApproveVoucherByIds(voucherList: any) {
    return this.apiSvc.save(`${this.controllerName}/ApproveNoApproveVoucherByIds`, voucherList, true);
  }

  getChequeLeafNo() {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetChequeLeafNo`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1] || [];
        })
      );
  }



  /*********************Voucher Print*************************/
  printVoucher(voucherTypeCd: number, voucherID: number) {
    try {
      this.getVoucher(voucherTypeCd, voucherID).subscribe({
        next: (data: any) => {
          let reportData = this.prepareVoucherOption(data);
          this.printReport(reportData);
        },
        error: (res: any) => {
          throw res;
        }
      });
    } catch (e) {
      throw e;
    }
  }
  private prepareVoucherOption(data: any[]) {
    try {
      let title = null;
      if (data.length > 0) title = data[0].title;
      this.prepareInWord(data);
      return {
        reportName: 'Voucher',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.getRptParameter(title),
        dataColumns: this.getVoucherColumnHeader(),
        dataSetName: "SpACM_GetJournalVoucher",
      };
    } catch (e) {
      throw e;
    }
  }

  getRptParameter(title: string) {
    try {
      var params = [
        {
          key: "CompanyLogoUrl",
          value: GlobalConstants.companyInfo.companyLogoUrl,
        },
        {
          key: "Currency",
          value: GlobalConstants.companyInfo.currency
        },
        {
          key: "VoucherName",
          value: title
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        }
      ];
      return params;
    } catch (e) {
      throw e;
    }
  }

  private prepareInWord(data) {
    try {
      if (data.length > 0) {
        var total = 0;
        data.forEach(element => {
          total += element.debitVal;
        });
        data[0].inWord = GlobalMethods.priceInWord(total, "", "PAISA");
      }
    } catch (e) {
      throw e;
    }
  }

  private getVoucherColumnHeader() {
    try {
      let list = [];
      list.push({ key: 'SerialNo', value: 'S.N.' });
      if (GlobalConstants.bizConfigInfo.isCodeActive) {
        list.push({ key: 'LedgerCode', value: 'Code' });
      }
      list.push({ key: 'Particulars', value: 'Particulars' },
        { key: 'DebitVal', value: 'Debit' },
        { key: 'CreditVal', value: 'Credit' });
      return list;
    } catch (e) {
      throw e;
    }
  }

  sendSMS(smsList: any[]): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SendSMS`, smsList, true);
  }

  saveNotification(notificationList: any[]): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveNotification`, notificationList, true);
  }

  saveVoucherNotificationLog(voucherNotificationLogDTO: VoucherNotificationLogDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveVoucherNotificationLog`, voucherNotificationLogDTO, true);
  }
  SaveVoucherItemChequeAttachment(voucherItemChequeAttachmentDTO: VoucherItemChequeAttachmentDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveVoucherItemChequeAttachment`, voucherItemChequeAttachmentDTO, true);
  }

  getSubLedgerTypeWiseLedger(): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetSubLedgerTypeWiseLedger`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  getReportStreams(reportData: any) {
    //return this.apiSvc.post(`${this.controllerName}/Report/GetBytesReportStreams`, reportData);
    return this.apiSvc.post(Config.url.accountingLocalUrl + 'Report/GetBytesReportStreams', reportData);
  }


  // saveInvoiceAttachment(entity: any): Observable<any> {
  //   try {
  //     return this.apiSvc.save(`${this.controllerName}/CASvc/SaveVoucherItemChequeAttachment`, entity, true);
  //   } catch (e) {
  //     throw e;
  //   }
  // }


  getVoucherReportFileName(voucherTypeCd: number, voucherID: number): Observable<any> {
    return this.getVoucher(voucherTypeCd, voucherID).pipe(
      switchMap((data: any) => {
        const reportData = this.prepareVoucherOption(data);
        return this.getReport(reportData).pipe(
          map((res: any) => res.body.message),
          catchError((error) => {
            return of(error);
          })
        );
      }),
      catchError((error) => {
        return of(error);
      })
    );
  }


  /*********************Print Cheque*************************/

  printCheque(voucherItemID: number, payTo: string) {
    try {
      this.getChequeByVoucherItemID(voucherItemID).subscribe({
        next: (data: any) => {
          let reportData = this.prepareChequeOption(data, payTo);
          this.printReport(reportData);
        },
        error: (res: any) => {
          throw res;
        }
      });
    } catch (e) {
      throw e;
    }
  }
  private prepareChequeOption(data: any[], payTo: string) {
    try {
      if (data[0].payTo == payTo) {
        payTo = data[0].payTo;
      }
      this.prepareInWordCheque(data);
      return {
        reportName: 'cheque',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: data[0].voucherItemID,
        data: data,
        params: this.getChequeRptParameter(data[0], payTo),
        dataColumns: [],
        dataSetName: "SpACM_GetChequeByVoucherItemID",
      };
    } catch (e) {
      throw e;
    }
  }

  getChequeRptParameter(data: any, payTo: string) {
    try {
      const wordinTk = data.inWord;
      const inwordFirstPart = wordinTk.slice(0, 28);
      const inwordSecondPart = wordinTk.slice(28);
      const amounttk = '**'+ data.amount.toString() + '**';

      payTo = payTo == null || payTo == "" ? null : '**' + payTo +'**';

      //Prepere cheque date number
      const chequeDate = formatDate(data.chequeDate, FixedIDs.fixedIDs.format.dateFormat, "en");
      const chequeDateDigits = chequeDate.replace(/\D/g, '').split('').map(Number);
      let paramObj: any = {};
      paramObj.d = chequeDateDigits[0];
      paramObj.d1 = chequeDateDigits[1];
      paramObj.m = chequeDateDigits[2];
      paramObj.m1 = chequeDateDigits[3];
      paramObj.y = chequeDateDigits[4];
      paramObj.y1 = chequeDateDigits[5];
      paramObj.y2 = chequeDateDigits[6];
      paramObj.y3 = chequeDateDigits[7];
      var params = [
        {
          key: "PayTo",
          value: payTo
        },
        {
          key: "InwordFirstPart",
          value: wordinTk.length <= 28 ? '**'+ inwordFirstPart + '**' : '**'+ inwordFirstPart
        },
        {
          key: "InwordSecondPart",
          value: inwordSecondPart.length == 0 ? inwordSecondPart  :  inwordSecondPart + '**' 
        },
        {
          key: "d",
          value: paramObj.d.toString()
        },
        {
          key: "d1",
          value: paramObj.d1.toString()
        },
        {
          key: "m",
          value: paramObj.m.toString()
        },
        {
          key: "m1",
          value: paramObj.m1.toString()
        },
        {
          key: "y",
          value: paramObj.y.toString()
        },
        {
          key: "y1",
          value: paramObj.y1.toString()
        },
        {
          key: "y2",
          value: paramObj.y2.toString()
        },
        {
          key: "y3",
          value: paramObj.y3.toString()
        },
        {
          key: "InWord",
          value: data.inWord
        },

        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "RptName",
          value: "Cheque"
        },
        {
          key: "Amount",
          value: amounttk
        },
      ];
      return params;
    } catch (e) {
      throw e;
    }
  }

  private prepareInWordCheque(data) {
    try {
      if (data.length > 0) {
        var total = 0;
        data.forEach(element => {
          total += element.amount;
        });
        data[0].inWord = GlobalMethods.priceInWord(total, "", "PAISA");
      }
    } catch (e) {
      throw e;
    }
  }

  /******************* end print ************************/


  /******************* save soft cheque  ************************/

  saveSoftCheque(voucherItemID: number, payTo: string) {
    try {
      this.getChequeByVoucherItemID(voucherItemID).subscribe({
        next: (data: any) => {
          if (data.length > 0) {
            let reportData = this.prepareChequeOption(data, payTo);
            this.manageReportStreams(reportData, voucherItemID, payTo);
          }
        },
        error: (res: any) => {
          throw res;
        }
      });
    } catch (e) {
      throw e;
    }
  }

  private manageReportStreams(reportData: any, voucherItemID: number, payTo: string) {
    try {
      let list = [];
      list[0] = reportData;
      this.getReportStreams(list).subscribe({
        next: (res: any) => {
          let singleFileUploadOption = new FileUploadOption();
          singleFileUploadOption.folderName = Config.imageFolders.cheque;
          singleFileUploadOption.fileTick = GlobalMethods.timeTick();

          let chequeAttachment = new VoucherItemChequeAttachmentDTO();
          chequeAttachment.voucherItemID = voucherItemID;
          chequeAttachment.fileName = chequeAttachment.voucherItemID + ".pdf";
          chequeAttachment.folderName = Config.imageFolders.cheque;
          chequeAttachment.fileTick = GlobalMethods.timeTick();
          chequeAttachment.payTo = payTo;
          this.saveReportStream(res.body.data, singleFileUploadOption, chequeAttachment);
        },
        error: (res: any) => { throw res },
      });
    } catch (e) {
      throw e;
    }
  }

  private saveReportStream(streamData, uploadOption, targetObject) {
    try {
      this.fileUploadSvc.streamDataUploadAsFile(streamData, uploadOption, targetObject).subscribe({
        next: (res: any) => {
          if (res) {
            this.saveAttachment(res);
          }
        }
      });
    } catch (e) {
      throw e;
    }
  }

  private saveAttachment(invoiceAttachment: VoucherItemChequeAttachmentDTO) {
    try {
      this.SaveVoucherItemChequeAttachment(invoiceAttachment).subscribe();
    } catch (e) {
      throw e;
    }
  }
}




