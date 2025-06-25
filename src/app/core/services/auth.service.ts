import { Injectable } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router'
import { map, mergeMap } from 'rxjs';
import { ConfigService } from './config.service';
import { DataService } from '../../shared/services/data.service';
import { GlobalConstants } from 'src/app/app-shared';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private configSvc: ConfigService, private dataTransferSvc: DataService

  )
   { }

  getAuthStatus(state: RouterStateSnapshot) { 
   // return true;
   return this.dataTransferSvc.on('userInfo')
   .pipe(map((response: any) => {
        if(response) { 
          if(response.userPKID == GlobalConstants.userInfo.userPKID)
            return true && this.checkValidRoute(state.url);
          else
            return false;
        }          
        else {
            let userInfo = this.configSvc.getLocalStorage("userInfo");
            if (userInfo) {                
                return true && this.checkValidRoute(state.url);                
            }else{
                return false;            
            }
        }
      })
    );
  }

  checkValidRoute(url: string): boolean{
    
    return true;

    let result: any = false;

    console.log(GlobalConstants.pageInfo.id);

    if(GlobalConstants.pageInfo.id) {
      
      if(GlobalConstants.pageInfo.isPageOrMenu == 1)
        result = true;
      else 
      {
        let menu = GlobalConstants.menuList.filter(menu => '/' + menu.projectFileName + '/' + menu.action == url); 

        if(menu.length)
          result = true;
      }
    }

    return result;
  }
}
