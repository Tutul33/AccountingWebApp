import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnInit,
    QueryList,
    ViewChildren,
} from "@angular/core";
import { Router } from "@angular/router";
import { ConfigService } from "./core/services/config.service";
import { GlobalMethods, GlobalConstants } from ".";
import { AdminService, AppMsgService, AuthenticationService } from "./app-shared";
import { MenuService } from "./shared/services/menu.service";
import { DataService } from './shared/services/data.service';
import { HeaderComponent } from "./app-shared/components/header/header.component";
import { OfflineComponent } from "./shared/components/offline/offline.component";
import { SpinnerComponent } from "./shared/components/spinner/spinner.component";
import { SharedModule } from './shared/shared.module';

@Component({
    selector: "app-default",
    templateUrl: "./default.component.html",
    styles: [],
    providers: [MenuService],
    imports:[
        SharedModule,
        HeaderComponent,
        SpinnerComponent,
        OfflineComponent
    ]
})
export class DefaultComponent implements OnInit, AfterViewInit {
    @ViewChildren(PrimeTemplate) templates: QueryList<any>;
    apiKey?: string;
    display: boolean = true;
    currentPage: any = { 'action': '' };
    home: any;
    msgCode = {
        hasPermission: '2168'
    }

    menuSearchText: string = null;
    menuSearchList: any = [];
   
    //For New expand menu
    isToggled: boolean = false;

    constructor(
        private configSvc: ConfigService,
        private router: Router,
        private adminSvc: AdminService,
        private dataTransferSvc: DataService,
        public menuService: MenuService,
        private changeDetectorRef: ChangeDetectorRef,
        private authService: AuthenticationService,
        private msgSvc: AppMsgService,
    ) {
        this.menuService.titleString = "Resturent Management System";

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

    ngOnInit(): void {

        this.setUserInfo();
        this.getBizConfigInfo();
        this.menuService.loadLeftMenu();
        this.setDefaultPageInfoOnLoad();
        this.loadBaseCurrency();
        this.loadDutyConfig();
        this.loadCommonElements();
        this.changeDetectorRef.detectChanges();

        let currentLinkID = this.configSvc.getLocalStorage('currentLinkID');
        if(currentLinkID && currentLinkID != GlobalConstants.pageInfo.id){
          this.menuService.setpageInfoByID(currentLinkID);
        }
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

    onSelectSearchMenu(event) {
        this.router.navigateByUrl(event.routerLink);
        if (this.menuService.menuList.length > 0) {
            let item = this.menuService.menuList.filter(f => f.id == event.id)[0];
            GlobalMethods.setPageInfo(item);
            this.configSvc.setLocalStorage('pageInfo', GlobalConstants.pageInfo);

            this.menuService.breadcrumbs = GlobalMethods.deepClone(item.breadcrumbs);
            this.menuService.pageTitle = item.pageTitle;
            this.menuService.expandMenuPath(item.id);
            this.menuSearchText = null;
            
            this.display = true;
        }
    }

    //Default Data get methods
    private loadBaseCurrency() {
        let storedBaseCurrency = this.configSvc.getLocalStorage("baseCurrency");
        if (storedBaseCurrency) {
            GlobalConstants.companyInfo.currency = storedBaseCurrency.currency;
            GlobalConstants.companyInfo.currencyID = storedBaseCurrency.currencyID;
        } else {
            this.adminSvc.getBaseCurrency().subscribe({
                next: (res: any) => {
                    GlobalConstants.companyInfo.currency = res.currency || '';
                    GlobalConstants.companyInfo.currencyID = res.currencyID || '';
                    this.configSvc.setLocalStorage('baseCurrency', res);
                }
            });
        }

    }

    private loadDutyConfig() {
        let storedDutyConfig = this.configSvc.getLocalStorage("dutyConfig");
        if (storedDutyConfig) {
            GlobalConstants.companyInfo.isDutyInclude = storedDutyConfig;
        } else {
            this.adminSvc.getDutyConfig().subscribe({
                next: (res: any) => {
                    GlobalConstants.companyInfo.isDutyInclude = res || false;
                    this.configSvc.setLocalStorage('dutyConfig', GlobalConstants.companyInfo.isDutyInclude);
                }
            });
        }
    }

 

    prepareDutyProperties(dutyFormulaDetail:any)
    {
        dutyFormulaDetail.forEach(element => {
            switch (element.dutyCd) {
                case 'VAT':
                    GlobalConstants.companyInfo.isVatApplicable = true;
                    break;
                case 'SD':
                    GlobalConstants.companyInfo.isSDApplicable = true;
                    break;
                default:
                    break;
            }
        });
        GlobalConstants.companyInfo.formulaGrpCd = dutyFormulaDetail.length > 0 ? dutyFormulaDetail[0].formulaGrpCd : null;
        
    }


    private loadCommonElements() {
        // let storedcommonElements = this.configSvc.getLocalStorage("commonElements");
        // if (storedcommonElements) {
        //     GlobalConstants.commonElements = storedcommonElements;
        // } else {
            // this.gsSvc.getCommonElements().subscribe({
            //     next: (res: any) => {
            //         GlobalConstants.commonElements = res.body || [];
            //         this.configSvc.setLocalStorage('commonElements', GlobalConstants.commonElements);
            //     }
            // });
        // }

    }
    onBreadcrumbClick(event: any) {
        this.menuService.onBreadcrumbClick(event);
    }

    setDefaultPageInfoOnLoad() {

        let url = this.router.url;
        if(url.includes('pos-customer')) return;
        if (this.menuService.menuList.length > 0) {
            let menu = this.menuService.menuList.filter(f => f.routerLink == url)[0];
            if (menu) {
                GlobalMethods.setPageInfo(menu);
                this.configSvc.setLocalStorage('pageInfo', GlobalConstants.pageInfo);
                this.configSvc.setLocalStorage('currentLinkID', GlobalConstants.pageInfo.id);
                
                this.menuService.pageTitle = !GlobalConstants.pageInfo.pageTitle ? GlobalConstants.pageInfo.moduleName : GlobalConstants.pageInfo.pageTitle;
                this.menuService.breadcrumbs = GlobalMethods.deepClone(menu.breadcrumbs);
                
                
                if (GlobalConstants.pageInfo.items.length){
                   setTimeout(()=>{
                    this.menuService.pageMenuItems = GlobalConstants.pageInfo.items;
                   },20);
                }
                    
            }else{
                setTimeout(() => {
                this.authService.logout();
                }, 4000);
                this.msgSvc.showMessage(this.msgCode.hasPermission);
            }
        }else{
            if(this.menuService.isMenuCall){
                setTimeout(() => {
                    this.authService.logout();
                    }, 4000);
                    this.msgSvc.showMessage(this.msgCode.hasPermission);
            }
        }
        
    }

    setUserInfo() {
        let userInfo = this.configSvc.getLocalStorage("userInfo");
        if (userInfo) {
            if (userInfo.userPKID != GlobalConstants.userInfo.userPKID) {
                GlobalMethods.setLoginInfo(userInfo);
                this.dataTransferSvc.broadcast('userInfo', GlobalConstants.userInfo);
            }
        }
        else {
            GlobalMethods.clearUserInformation();
            this.router.navigateByUrl("/login");
        }
    }

    //BusinessConfig Data get methods
    private getBizConfigInfo() {
        let storedBizConfig= this.configSvc.getLocalStorage("bizConfig");
        if (storedBizConfig) {
            if(storedBizConfig.length > 0)
            {
                storedBizConfig.forEach(element => {
                    switch (element.keyCode) {
                        case 'IBMA':
                            GlobalConstants.bizConfigInfo.isBranchModuleActive = element.isActive;
                            break;
                        case 'IPMA':
                            GlobalConstants.bizConfigInfo.isProjectModuleActive = element.isActive;
                            break;
                        case 'ICA':
                            GlobalConstants.bizConfigInfo.isCodeActive = element.isActive;
                            break;
                        default:
                            break;
                    }
                });
            }
        } else {
            this.adminSvc.getBizConfigInfo().subscribe({
                next: (res: any) => { 
                    if(res.length > 0)
                    {
                        res.forEach(element => {
                            switch (element.keyCode) {
                                case 'IBMA':
                                    GlobalConstants.bizConfigInfo.isBranchModuleActive = element.isActive;
                                    break;
                                case 'IPMA':
                                    GlobalConstants.bizConfigInfo.isProjectModuleActive = element.isActive;
                                    break;
                                case 'ICA':
                                    GlobalConstants.bizConfigInfo.isCodeActive = element.isActive;
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                    this.configSvc.setLocalStorage('bizConfig', res);
                }
            });
        }

    }
   

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.menuSearchList.length == 0) this.menuSearchList = this.prepareMenuSearchList();

        /*if(this.currentPage.action != 'pos' && this.currentPage.action != 'pos-customer' && GlobalConstants.posCustWindow){
            GlobalConstants.posCustWindow.close();
        }*/

        if(GlobalConstants.posCustWindow && GlobalConstants.posCustWindow.closed){
            GlobalConstants.posCustWindow = null;
        }

    }

    panelMenuClick() {
        try {
            this.display = this.menuService.display;
        } catch (e) {
            throw e;
        }
    }

    toggleMenu(): void {
        this.isToggled = !this.isToggled;
    }
    
    //   initMenu(): void {
    //     const menuItems = document.querySelectorAll('#menu li a');
    //     const menuUlItems = document.querySelectorAll<HTMLElement>('#menu ul');
      
    //     // Hide all submenus initially
    //     menuUlItems.forEach((ul) => (ul.style.display = 'none'));
      
    //     menuItems.forEach((menuItem) => {
    //       menuItem.addEventListener('click', (event) => {
    //         const nextElement = menuItem.nextElementSibling as HTMLElement | null;
      
    //         if (nextElement && nextElement.tagName === 'UL') {
    //           const isVisible = nextElement.style.display === 'block';
              
    //           // Hide all visible submenus
    //           menuUlItems.forEach((ul) => (ul.style.display = 'none'));
              
    //           // Toggle the visibility of the clicked submenu
    //           nextElement.style.display = isVisible ? 'none' : 'block';
              
    //           event.preventDefault();
    //         }
    //       });
    //     });
    //   }


    loadHome(){
        var menu=this.menuService.menuList.find(x=>x.routerLink=='/ADMIN-PAGE/dashboard');
        if(menu){
          this.router.navigateByUrl('ADMIN-PAGE/dashboard');
          GlobalMethods.setPageInfo(menu);
                
          this.menuService.breadcrumbs.length = 0;
          this.menuService.breadcrumbs = GlobalMethods.deepClone([this.menuService.defaultBreadcrumb]);
          this.menuService.expandMenuPath();
          this.dataTransferSvc.remove();
        }                                    
    }

}
function PrimeTemplate(PrimeTemplate: any) {
    throw new Error("Function not implemented.");
}

/*function loadGoogleApiKey(adminSvc: AdminService, config: LazyMapsAPILoaderConfigLiteral) {
    return async (): Promise<void> => {
        const res: any = await lastValueFrom(adminSvc.getGoogleApiKey());
        config.apiKey = res.pageConfigValue;
    };
}
export const setGoogleApiKey: FactoryProvider = {
    provide: APP_INITIALIZER,
    useFactory: loadGoogleApiKey,
    deps: [AdminService, LAZY_MAPS_API_CONFIG],
    multi: true,
};*/