import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { GlobalConstants } from 'src/app/app-shared/models/javascriptVariables';
import { GlobalMethods } from 'src/app/core/models/javascriptMethods';
import { AuthenticationService } from '../../../login/services/authentication.service';
import { MenuService } from "src/app/shared/services/menu.service";
import { DataService } from 'src/app/shared/services/data.service';
import { Subject, forkJoin, fromEvent, takeUntil } from 'rxjs';
import { ConfigService } from 'src/app/core/services/config.service';
import { AdminService } from '../../services/admin.service';
import { FieldTitleService } from 'src/app/core/services/field-title.service';
import { BreadcrumbItemClickEvent, BreadcrumbModule } from 'primeng/breadcrumb';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone:true,
  imports:[SharedModule]
})
export class HeaderComponent implements OnInit {
  @ViewChildren(PrimeTemplate) templates: QueryList<any>;
  home: any;
  currentPage: any = { 'action': '' };
  menuSearchText: string = null;
  menuSearchList: any = [];
 
  @Input() pageTitle: string;
  userName:string = '';
  languageList:any = [];
  lgCode:string = localStorage.getItem('languageCd');

  constructor(private router: Router, 
    private authService: AuthenticationService, 
    // private menuService: MenuService,  
    public menuService: MenuService,
    public dataTransferSvc: DataService,
    public adminSvc:AdminService,
    public fieldSvc: FieldTitleService,
    private configSvc: ConfigService,
    private route: ActivatedRoute

  ) {

    //breadcrumb 
    this.home = { label: 'Home', routerLink: this.menuService.defaultBreadcrumb.routerLink };       
    this.menuService.breadcrumbs = GlobalMethods.deepClone([this.menuService.defaultBreadcrumb]);

  }

  ngAfterViewInit() {
      this.currentPage = GlobalConstants.pageInfo;
      setTimeout(() => {
          if(this.menuService.menuList.length == 0){
              //this.msgSvc.showMessage(this.msgCode.hasPermission);
              this.router.navigateByUrl('ADMIN-PAGE/dashboard');
              //this.authService.logout();
            }
          this.menuSearchList = this.prepareMenuSearchList(); // .sort((a, b) => (a.slNo < b.slNo ? -1 : 1));
      }, 250);
  }
  
  prepareMenuSearchList() {
    try {
        let list = [];
        let menuList = GlobalMethods.jsonDeepCopy(this.menuService.menuList);
        if (menuList) {
            menuList.forEach(element => {
                if (element.pageTitle && element.routerLink) {
                    let item = {
                        id: element.id,
                        pageTitle: element.pageTitle,
                        routerLink: element.routerLink
                    };
                    list.push(item);
                }
            });
        }
        return list;
    } catch (e) {

    }
  }
  

  ngOnInit(): void {
    this.userName = GlobalConstants.userInfo.userName;  
    this.getLanguageList();  

    //Apply & save theme color
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    let currentLinkID = this.configSvc.getLocalStorage('currentLinkID');
    if(currentLinkID && currentLinkID != GlobalConstants.pageInfo.id){
        this.menuService.setpageInfoByID(currentLinkID);
    }
  }

  //Color theme
  isDarkMode: boolean = false;
  darkIcon: string = '<i class="pi pi-sun"></i>';
  lightIcon: string = '<i class="pi pi-moon"></i>';

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    // Save the theme to localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  //Apply theme
  applyTheme(): void {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }

  onChanges() {
    console.log('from header change');
    let t = this.lgCode;
  }

  getLanguageList() {
    try {
      this.adminSvc.getLanguageList().subscribe({
        next: (res: any) => {
          this.languageList = res[res.length -1]|| [];
        }
      });
    } catch (e) {
      
    }
  }

  changeLanguage() {
    try {
      localStorage.removeItem('languageCd');
      localStorage.setItem('languageCd',this.lgCode);
      this.updateUserLanguageAndGetFieldDetails(this.lgCode,GlobalConstants.userInfo.userPKID);
    } catch (e) {
      
    }
  }

  updateUserLanguageAndGetFieldDetails(lgCode:string, userID:number) {
    try {
      forkJoin([
        this.fieldSvc.getFieldDetail(lgCode),
        this.adminSvc.UpdateUserLanguageByUserID(lgCode, userID),
      ]).subscribe({
        next: (results: any) => {
        },
        error: (res: any) => { },
      });
    } catch (e) {
      throw e;
    }
  }

  loadHome(){
      var menu = this.menuService.menuList.find(x=>x.routerLink=='/ADMIN-PAGE/dashboard');
      if(menu){
        this.router.navigateByUrl('ADMIN-PAGE/dashboard');
        GlobalMethods.setPageInfo(menu);
              
        this.menuService.breadcrumbs.length = 0;
        this.menuService.breadcrumbs = GlobalMethods.deepClone([this.menuService.defaultBreadcrumb]);
        this.menuService.expandMenuPath();
        this.dataTransferSvc.remove();
      }                                    
  }

  logOut() {
    this.authService.logout();
  }

  onBreadcrumbClick($event: BreadcrumbItemClickEvent) {
    this.menuService.onBreadcrumbClick($event);
  }

}

function PrimeTemplate(PrimeTemplate: any) {
  throw new Error("Function not implemented.");
}