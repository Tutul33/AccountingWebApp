import { ErrorLogService } from './error-log.service';
import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import { DefaultService } from './default.service';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppMsgService {
  msg: any;
  constructor(
    private defaultSvc: DefaultService,
    private toastr: ToastrService,
    private errorLogSvc: ErrorLogService
  ) {}

  showMessage(msgCode: any): any {
    try {
      this.processMessage(msgCode);
    } catch (error) {
      throwError(() => new Error(error || 'Server error'));
    }
  }

  showExceptionMessage(ex: any) {
    try {
      let msg;
      // if an exception does not contain status  or status is 0 then system identified that such exception is http exception
      // Hence we logged server exception in server side then there is no need to logged it again
      if (ex && ex.status !== undefined && ex.status !== 0) {
        if (ex.error.message === undefined || ex.error.message === '') {
          msg = this.processMessage('999');
        } else {
          if (ex.error.message == parseInt(ex.error.message, 10)) {
            msg = this.processMessage(ex.error.message);
          } else {
            msg = ex.error.message;
            this.toastr.error(ex.error.message);
          }
        }
      } else {
        msg = this.processMessage('999');
        this.errorLogSvc.LogErrors(ex);
      }

      // If an exception contains entity then system assign entity error in onError property
      if (ex && typeof ex.entity !== 'undefined') {
        if (!ex.entity.onError) {
          ex.entity.onError = true;
          ex.entity.onErrorMsg = msg;
        }
      }
    } catch (e) {
      throw e;
    }
  }

  getMessageString(code: any) {
    return this.defaultSvc.getMessage(code).engMessage;
  }

  // used to show custom message from server
  processMessage(code: any) {
    try {
      if (!isNaN(Number(code))) {
        const msg = this.defaultSvc.getMessage(code);
        if (msg) {
          // severity 1 means success message
          if (Number(msg.severity) === 1) {
            this.toastr.success(msg.engMessage, '', { timeOut: 3000 });
          } else if (Number(msg.severity) === 2) {
            this.toastr.info(msg.engMessage, '', { timeOut: 3000 });
          } else if (Number(msg.severity) === 4) {
            this.toastr.error(msg.engMessage, '', { timeOut: 3000 });
          } else {
            this.toastr.info(msg.engMessage, '', { timeOut: 3000 });
          }
        } else {
          this.toastr.error('An Error Occured.', '', { timeOut: 3000 });
        }
      } else {
        this.toastr.info(code,'', { timeOut: 3000 });
      }
    } catch (error) {
      throwError(() => new Error(error || 'Server error'));
    }
  }

  clearAll(){
    try {
      this.toastr.clear();
    } catch (error) {
      throwError(() => new Error(error || 'Server error'));
    }
  }
}
