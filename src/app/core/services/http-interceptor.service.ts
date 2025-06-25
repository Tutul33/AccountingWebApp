// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
//   HttpResponse,
// } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { finalize } from 'rxjs/operators';
// import { Router } from '@angular/router';
// import { GlobalConstants } from 'src/app/app-shared';
// import { SpinnerHandlerService } from './spinner-handler.service';

// @Injectable({
//   providedIn: 'root',
// })


// export class HeadersInterceptor implements HttpInterceptor {

//   constructor(private router: Router, private spinnerHandler: SpinnerHandlerService) { }

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


//     this.spinnerHandler.handleRequest('plus');
//     const apiKey = 'API_KEY'

//     let currentRequest: any = {
//       stateName: GlobalConstants.pageInfo['action'],
//       clientIpAddress: this.router.url,
//       pageName: GlobalConstants.pageInfo['moduleName'],
//       userName: GlobalConstants.userInfo['userName'],
//       userPKID: GlobalConstants.userInfo['userPKID'] || 0,
//       locationID: GlobalConstants.userInfo['locationID'] || 1,
//     };

//     request = request.clone({
//       setHeaders: {
//         'api-key': apiKey,
//         'timeZoneOffset': (-1 * new Date().getTimezoneOffset()).toString(),
//         'Authorization': GlobalConstants.userInfo['token'] ? 'Bearer ' + GlobalConstants.userInfo['token'] : '',
//         'CurrentRequest': btoa(JSON.stringify(currentRequest))

//       }
//     })
//     //request.urlWithParams.replace('+','%2B');
//     return next
//       .handle(request)
//       .pipe(
//         finalize(this.finalize.bind(this))
//       );

//   }

//   finalize = (): void => this.spinnerHandler.handleRequest();
// }

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SpinnerHandlerService } from './spinner-handler.service';
import { GlobalConstants } from 'src/app/app-shared/models/javascriptVariables';


export const HeadersInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const spinnerHandler = inject(SpinnerHandlerService);

  spinnerHandler.handleRequest('plus');

  const apiKey = 'API_KEY';

  let currentRequest = {
    stateName: GlobalConstants.pageInfo['action'],
    clientIpAddress: router.url,
    pageName: GlobalConstants.pageInfo['moduleName'],
    userName: GlobalConstants.userInfo['userName'],
    userPKID: GlobalConstants.userInfo['userPKID'] || 0,
    locationID: GlobalConstants.userInfo['locationID'] || 1,
  };

  request = request.clone({
    setHeaders: {
      'api-key': apiKey,
      'timeZoneOffset': (-1 * new Date().getTimezoneOffset()).toString(),
      'Authorization': GlobalConstants.userInfo['token'] ? 'Bearer ' + GlobalConstants.userInfo['token'] : '',
      'CurrentRequest': btoa(JSON.stringify(currentRequest)),
    }
  });

  return next(request).pipe(finalize(() => spinnerHandler.handleRequest()));
};
