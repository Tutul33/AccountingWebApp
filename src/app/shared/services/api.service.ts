
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import {
  catchError, map, mergeMap
} from 'rxjs/operators';
import { Config, GlobalConstants } from '..';
import { TokenService } from 'src/app/core/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService 
{
  baseURL: string;
  ipAddress: any;
  baseUrl: string = Config.url.adminLocalUrl;
  
 constructor(private http: HttpClient,  private router: Router,private tokenSvc:TokenService)
  {
    this.baseURL = "";
    //this.ipAddress = this.router; 

  }

  private getApiEndPointUrl(routePath: string): string {
    return `${this.baseURL}${routePath}`;
  }

  get(url: string): Observable<any> 
  {
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http.get(url, { observe: 'response' });
      })
      );
  }

  getWithParam(url: string, params: HttpParams): Observable<any> {
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
      .get(url, { params: params, observe: 'response' })
      .pipe(
        // For example, network interruptions are common in mobile scenarios
        // Trying again can produce a successful result
        // retry(2),
        catchError(this.handleError));
      })
      );
  }

  save(url: string, data: any, hasAction?: boolean): Observable<any> 
  {
    if (!hasAction) 
    {
      url = url + 'SaveChanges';
    }

    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
          .post<any>(url, data, { observe: 'response' })
          .pipe(catchError(this.handleError));
      })
    );
  }

  remove(
    url: string,
    entity: any,
    hasAction: boolean = false,
    key?: string
  ): Observable<any> {
    if (!hasAction) {
      url = url + '/Delete';
    }
    const pk: number = typeof key === 'undefined' ? entity.id : entity[key];

    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
      .post<boolean>(url, pk, { observe: 'response' })
      .pipe(
        catchError(this.handleError)
      );
    })
    );
  }

  removeByID(url: string, id: number): Observable<any> {
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
      .delete(`${url}/${id}`, { observe: 'response' })
      .pipe(
        catchError(this.handleError)
      );
    })
    );
  }

  postWithParam(url: string, body: any, params?: HttpParams): Observable<any> {
    // return this.http.post<Person>(this.baseURL + 'people', body,{'headers':headers, 'params': params})
    // return this.http.post<Person>(this.baseURL + 'people', body,{'headers':headers, responsetype: 'text'})
    // return this.http.post(this.baseURL + 'people', body,{'headers':headers, observe: 'response',reportProgress: true})
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
      .post(url, {}, { params, observe: 'response' })
      .pipe(catchError(this.handleError));
    })
    );
  }

  putWithParam(url: string, body: any): Observable<any> 
  {
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
      .put<any>(url, body, { observe: 'response' })
      .pipe(catchError(this.handleError));
    })
    );
  }

  postWithParameter(url: string, body: any, params?: any): Observable<any> {
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
      .post(url, body, {
        params: params,        
        observe: 'response',
      })
      .pipe(catchError(this.handleError));
    })
    );
  }

     
  post(url: string, data: any): Observable<any> 
  {
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http.post<any>(url, data,   { observe: 'response',})
        .pipe(catchError(this.handleError));
      })
      );
  }

  
executeQuery(
  url: string,
  data: any,
  isPost: boolean = false
): Observable<any> 
{

  if (!isPost) {
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
      .get(url, { params: data, observe: 'response' })
      .pipe(catchError(this.handleError));
    })
    );
  } else {
    return this.tokenSvc.checkJWTokenExpiration().pipe(
      mergeMap(() => {
        return this.http
      .post<any>(url, data, {         
        observe: 'response',
      })
      .pipe(catchError(this.handleError));
    })
    );
  }
}
 
  private handleError(error: HttpErrorResponse) 
  {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = error.error.message;
      const errMessage = error.error.message;
      console.error('An error occurred:', errMessage);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => error || 'Server error');
  }
}
