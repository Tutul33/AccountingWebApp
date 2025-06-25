
import { GlobalConstants } from 'src/app/app-shared';
import { Injectable, ErrorHandler } from '@angular/core';
import { ApiService } from './api.service';

export interface ErrorLogData {
  errorUrl: string;
  errorMessage: string;
  stackTrace: string;
  userName: string;
  moduleName: string;
  actionName: string;
}

export class PageInfoClass {
  constructor(
    public id: number,
    public locationID: number,
    public applicationID: number,
    public parentID: number,
    public moduleName: string,
    public pageTitle: string,
    public serialNo: string,
    public pageType: string,
    public imageName: string,
    public uRL: string,
    public action: string   
  ) {}
}

@Injectable({
  providedIn: 'root',
})

export class ErrorLogService  implements ErrorHandler {
  serviceName = '';
  errorLogData: ErrorLogData = {} as ErrorLogData;
  
  handleError(error) {
    
  }

  constructor(private apiSvc: ApiService) {}

  public LogErrors(exception: any, cause?: string): void {
    this.errorLogData.errorUrl = window.location.href;
    this.errorLogData.errorMessage = exception ? 'Undefine' : exception.message;
    this.errorLogData.stackTrace = exception ? 'Undefine' : exception.stack;
    this.errorLogData.userName = GlobalConstants.userInfo.userName;
    
    this.errorLogData.moduleName = '';
    this.errorLogData.actionName = 'pageInfo action';

    this.serviceName = 'service name here using url';
    this.apiSvc.save(GlobalConstants.ERP_MODULES_URL.adminLocalUrl + 'errorLog/logErrors', this.errorLogData, true);
  }
}
