import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthenticationService } from './app-shared';
import { GlobalConstants } from './app-shared/models/javascriptVariables';
import { ConfigService } from './core/services/config.service';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  templateUrl: "./app.component.html",
  standalone:true,
  imports:[SharedModule]
})
export class AppComponent {
  userActivity: any;
  userInactive: Subject<any> = new Subject();

  title = 'NEXT-POS';
  currentRoute: string = null;

  constructor(private router: Router,
     private configSvc: ConfigService, 
     private authService: AuthenticationService
    ) {
    this.setTimeout();
    this.checkIsExistUserInfo();
    this.userInactive.subscribe(() => {
      const currentUrl = this.router.url;
      if (currentUrl) {
        if(currentUrl.includes('/signin')){
          localStorage.removeItem(GlobalConstants.localStorageKey.lastActiveRouteForForceLogout);
        }else{
          this.configSvc.setLocalStorage(
            GlobalConstants.localStorageKey.lastActiveRouteForForceLogout,
            currentUrl
          );
        }        
        this.authService.logout();
      }
    });
  }

  setTimeout() {
    
    this.userActivity = setTimeout(
      () => this.userInactive.next(undefined),
      GlobalConstants.APP_IDLE_TIMEOUT_LIMIT * 60000
    );
  }

  checkIsExistUserInfo(){
    let userInfo = this.configSvc.getLocalStorage("userInfo");
    if (!userInfo) {                  
      this.router.navigateByUrl('signin');
    }
  }

  @HostListener('window:mousemove') refreshUserState() {   
    clearTimeout(this.userActivity);
    this.setTimeout();
    this.checkIsExistUserInfo();
  }
  
}
