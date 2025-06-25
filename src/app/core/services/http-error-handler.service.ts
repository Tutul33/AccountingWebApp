import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { TimeoutError } from 'rxjs';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Config } from 'src/app/app-shared/models/config';
import { OnlineOfflineService } from 'src/app/shared/services/online-offline.service';
/**
 * Shows a user-friendly error message when a HTTP request fails.
 */

@Injectable({
    providedIn: 'root',    
})
export class HttpErrorHandler {

    private subscription$: Subscription;
    private isCheckOnlineIntervalAssigned = false;
    targetDiv: any;

    constructor(private _http: HttpClient, public onlineOfflineSvc: OnlineOfflineService
    ) { }
    
    checkOnline() {
        this.isCheckOnlineIntervalAssigned = true;
        this.subscription$ = interval(3000).subscribe((res) => {
            this._http
            .get(Config.url.adminLocalUrl+'Login/Online', { observe: 'response' })
            .pipe(first())
            .subscribe(
                {
                next: resp => {
                    if (resp.status === 200) {
                        this.isCheckOnlineIntervalAssigned = false;
                        this.onlineOfflineSvc.updateServerOnlineStatus(true);
                        this.subscription$.unsubscribe();
                    } 
                },
                error: err => console.log(err)
                }
            );
        });
    }

    handle(error: Error | HttpErrorResponse) {
        if (error instanceof TimeoutError) {
            return this.openDialog('error', `No connection to server.`);
        }

        if (error instanceof Error) 
        {
            switch (error.message) {
                default:
                    return this.openDialog('error', `An unknown error occurred`);
            }
        }

        // Generic HTTP errors
        switch (error.status) 
        {
            case 400:
                switch (error.error) {
                    case 'invalid_username_or_password':
                        return this.openDialog('error', 'Invalid username or password');
                    default:
                        return this.openDialog('error', 'Bad request');
                }

            case 401:
                this.openDialog('error', `Unauthorization: 401`);
            case 403:
                return this.openDialog('error', `You don't have the required permissions`);

            case 404:
                return this.openDialog('error', 'Resource not found');

            case 422:
                return this.openDialog('error', 'Invalid data provided');

            case 500:
            case 501:
            case 502:
            case 503:
                return this.openDialog('error', 'An internal server error occurred');

            case -1:
                return this.openDialog(
                    'error',
                    'You appear to be offline. Please check your internet connection and try again.'
                );

            case 0:
                if(!this.isCheckOnlineIntervalAssigned){
                    this.checkOnline();
                }

                return this.openDialog('error', `CORS issue?`);

            default:
                return this.openDialog('error', `An unknown error occurred`);
        }
    }

    private openDialog(severity: string, message: string) {
        if (message?.trim()) {
            /*const rect = this.targetDiv.nativeElement.getBoundingClientRect();
            this.messageService.add({
                key: 'interceptor',
                severity: severity,
                summary: 'Информация',
                detail: message,
                life: 3000
            });*/
        }
    }
}
