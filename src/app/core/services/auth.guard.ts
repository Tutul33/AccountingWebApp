import { Injectable, Inject } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree
} from "@angular/router";
import { AuthService } from "./auth.service";
import { GlobalConstants } from 'src/app/app-shared';

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService,private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):  boolean | Promise<boolean> {
    let navigateToLogin = () => this.router.navigate(['pos'], { queryParams: { isAccessDenied: true, currentUserID: GlobalConstants.userInfo.userPKID }});
    
    return new Promise((resolve, reject) => {
        this.authService.getAuthStatus(state).subscribe((response) => { 
            if (response) {
                resolve(true);
            }
            else{
                console.log('AuthGuard');
                //navigateToLogin();
                reject(false);
            }
        })
    });
  }
}
