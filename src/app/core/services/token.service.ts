import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { GlobalConstants } from 'src/app/app-shared';
import { Config } from 'src/app/app-shared/models/config';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })
  export class TokenService {
    baseUrl: string = Config.url.adminLocalUrl;
  
    constructor(private http: HttpClient) { }

    checkJWTokenExpiration(): Observable<any>| null 
    {

      if(GlobalConstants.skipRefreshTokenCheck || !GlobalConstants.userInfo['userPKID'])
      {
        return of([]);
      }
      if(!GlobalConstants.userInfo['token']){
        return of([]);
      }
        const jwtToken = JSON.parse(atob(GlobalConstants.userInfo['token'].split('.')[1]));
        const tokenExpired = Date.now() > (jwtToken.exp * 1000);

        if(tokenExpired){        
          return this.http.get(this.baseUrl + 'Login/RefreshToken', { observe: 'response' }).pipe(          
            map((res: any) => {
              console.log('token regenerate');
              GlobalConstants.userInfo['token'] = res.body;
            }),catchError(() => { console.log('token expired & regeneration failed.'); return of([]); } )
          );
        }
        else
        {
          return of([]);
        }
    }
}