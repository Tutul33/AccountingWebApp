import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Config, GlobalMethods } from '..';
import { ApiService } from './api.service';
import { Location } from "@angular/common";
import {  GlobalConstants } from 'src/app/app-shared';
import { DataService } from 'src/app/shared/services/data.service';
import { MenuItem } from "primeng/api";
import { Title } from '@angular/platform-browser';
import { ConfigService } from 'src/app/core/services/config.service';
import { Router } from '@angular/router';

@Injectable()
export class MenuService {
  baseUrl: string = Config.url.adminLocalUrl;

  //bradcumProperties
  defaultBreadcrumb = { label: 'Dashboard', routerLink: '/ADMIN-PAGE/dashboard' };
  breadcrumbs: MenuItem[];
  pageTitle: string = '';
  pageMenuItems: any[] = [];

  //menuproperties
  menuList: any[] = [];
  items: MenuItem[];
  titleString: string;
  display: boolean = false;
  isMenuCall:boolean=false;
  constructor(
    private configSvc: ConfigService,
    private dataTransferSvc: DataService,
    private location: Location,
    private apiSvc: ApiService,
    private titleService: Title,
    private router: Router
  ) { }

  onBreadcrumbClick(event: any) {
    let menu = this.configSvc.getLocalStorage("preparedMenuList");
    let menuItem = this.findNodeFromTree(menu, event.item.id, event.item.routerLink);

    
    if (menuItem) {
      GlobalMethods.setPageInfo(menuItem);
      this.configSvc.setLocalStorage('currentLinkID', GlobalConstants.pageInfo.id);
      let breadcrumPosition = this.breadcrumbs.map(e => e.label).indexOf(menuItem.breadcrumbs[menuItem.breadcrumbs.length - 1].label);
      if (breadcrumPosition == -1) {
        this.breadcrumbs.length = 0;
        this.breadcrumbs = GlobalMethods.jsonDeepCopy(menuItem.breadcrumbs);
      } else {
        let currentBreadcrumb = GlobalMethods.jsonDeepCopy(this.breadcrumbs);
        currentBreadcrumb.length = breadcrumPosition + 1;

        this.breadcrumbs.length = 0;
        this.breadcrumbs = currentBreadcrumb;
      }
      this.pageTitle = !menuItem.pageTitle ? menuItem.moduleName : menuItem.pageTitle;
      this.expandMenuPath(menuItem.id);

    } else {
      this.breadcrumbs.length = 0;
      this.breadcrumbs = GlobalMethods.deepClone([this.defaultBreadcrumb]);
      this.expandMenuPath();
    }

    if (GlobalConstants.pageInfo.items.length > 0)
      this.pageMenuItems = GlobalConstants.pageInfo.items;
  }

  loadLeftMenu() {
    let storedMenuList = this.configSvc.getLocalStorage("menuList");
    if (storedMenuList) {
      this.menuList = storedMenuList;
      this.prepareMenuList();
    } else {
      // TODO: param need to real data locationId, UserId
      this.getMenus(GlobalConstants.userInfo.locationID, GlobalConstants.userInfo.userPKID).subscribe({
        next: (res: any) => {
            GlobalConstants.menuList = res;
            this.configSvc.setLocalStorage('menuList', res);
            this.menuList = res;
            this.prepareMenuList();
        },
        error: (err) => { },
        complete: () => { },
      });
    }
  }

  getMenus(locationID: number, userId: number) {
    const params = new HttpParams()
      .set('locationID', !locationID ? '0' : locationID.toString())
      .set('userID', userId.toString());

    return this.apiSvc.executeQuery(this.baseUrl + 'Admin/GetMenus', params).pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  private findNodeFromTree(sourceTree, id, routerLink) {
    for (const node of sourceTree) {
      if (node.routerLink === routerLink && node.id === id)
        return node;
      if (node.items?.length) {
        const child = this.findNodeFromTree(node.items, id, routerLink);
        if (child) return child;
      }
    }
  }

  private prepareMenuList() {
    for (let i = 0; i < this.menuList.length; i++) {
      this.menuList[i].command = this.onMenuClick.bind(this, [this, event]);
    }

    if (this.menuList.length) {
      const preparedMenuList = this.getRecursiveNestedChildren(this.menuList, null);
      this.concatRouteLink(preparedMenuList, "", []);
      this.items = preparedMenuList;
      this.configSvc.setLocalStorage("preparedMenuList", preparedMenuList);

    }
    // if (this.menuList.length==0) {
    //   this.authService.logout();
    // }
  }

  private onMenuClick(self: any, event?: any) {
    this.setSelectedMenu(event.item);
  }

  private setSelectedMenu(menu: any){
    if (menu.items == undefined) {
      this.display = true;
    }
    else {
      this.display = false;
    }

    this.breadcrumbs.length = 0;
    //set page info
    GlobalMethods.setPageInfo(menu);
    this.configSvc.setLocalStorage('currentLinkID', GlobalConstants.pageInfo.id);
    this.configSvc.setLocalStorage('pageInfo', GlobalConstants.pageInfo);

    if (GlobalConstants.pageInfo.items.length > 0)
      this.pageMenuItems = GlobalConstants.pageInfo.items;
    this.pageTitle = !menu.pageTitle ? menu.moduleName :menu.pageTitle;
    this.breadcrumbs = GlobalMethods.jsonDeepCopy(menu.breadcrumbs);
    this.dataTransferSvc.remove();
  }

  //Resursive Methods
  private getRecursiveNestedChildren(arr, parentID) {
    const master: any[] = [];
    for (let i = 0; i < arr.length; i++) {
      const val = arr[i];
      if (val.parentID === parentID) {
        //const tempArr = arr.filter((item) => item.parentID === val.id);

        const items = this.getRecursiveNestedChildren(arr, val.id);

        this.map(val);

        if (items.length) {
          val.items = items;
        }

        master.push(val);
      }
    }
    return master;
  }

  private concatRouteLink(arr, pre, breadcrumbs) {
    const thisVar = this;


    return [].concat.apply(
      [],
      arr.map(function (x) {
        const projectFileName = x.projectFileName;
        let parentBreadCrum = [];

        if (pre.indexOf(x.projectFileName) > -1) {
          x.projectFileName = null;
        }

        if (!x.parentID)
          pre = "";

        x.breadcrumbs = [];
        if (x.parentID) {
          for (let i = 0; i < breadcrumbs.length; i++)
            x.breadcrumbs.push({ id: breadcrumbs[i].id, label: breadcrumbs[i].label, routerLink: breadcrumbs[i].routerLink });
        }



        let link = '';

        link = (pre + (!x.action ? '/' + x.projectFileName + (x.projectFileName == 'sub-menu' ? '/' + x.id : '') : '-PAGE/' + x.action)).trim();
        //link = (pre + '/' + (!x.action ?  x.projectFileName : x.action)).trim();
        link = link.replace(new RegExp('/null', 'g'), '');

        if (!x.parentID)
          pre = '/' + x.projectFileName;


        x.routerLink = link;
        x.breadcrumbs.push({ id: x.id, label: x.label, routerLink: x.routerLink })

        if (x.items) {
          for (let i = 0; i < x.breadcrumbs.length; i++)
            parentBreadCrum.push({ id: x.breadcrumbs[i].id, label: x.breadcrumbs[i].label, routerLink: x.breadcrumbs[i].routerLink });
        }

        if (x.isPageOrMenu === 1) {
          x.expanded = thisVar.checkActiveState(link);
        }

        x.projectFileName = projectFileName;
        return x.items ? thisVar.concatRouteLink(x.items, pre, parentBreadCrum) : link;
      })
    );
  }

  private map(arr) {
    arr.label = arr.moduleName ?? arr.pageTitle;
    arr.icon = arr.imageName ?? "pi pi-globe";
  }

  private checkActiveState(givenLink) {
    let currentPath = this.router.url;
    if (currentPath.includes(givenLink) && givenLink != "") {
      return true;
    } else {
      return false;
    }
  }

  setpageInfoByUrl(routerLink: string, pageTitle?: string, isAttachBreadcrumb?: boolean, menuID?: number) {
    if (this.menuList.length > 0) {
      let item = this.menuList.filter(f => f.routerLink == routerLink)[0];
      this.manageSelectedPage(item, pageTitle, isAttachBreadcrumb);
    }
  }

  setpageInfoByID(menuID?: number) {
    if (this.menuList.length > 0) {
      let item = this.menuList.filter(f => f.id == menuID)[0];
      this.setSelectedMenu(item);
    }
  }

  private manageSelectedPage(menu: any, pageTitle?: string, isAttachBreadcrumb?: boolean) {
    if (menu) {
      GlobalMethods.setPageInfo(menu);
      this.configSvc.setLocalStorage('currentLinkID', GlobalConstants.pageInfo.id);
      if (pageTitle) GlobalConstants.pageInfo.pageTitle = pageTitle;
      this.configSvc.setLocalStorage('pageInfo', GlobalConstants.pageInfo);

      this.pageTitle = !GlobalConstants.pageInfo.pageTitle ? GlobalConstants.pageInfo.moduleName : GlobalConstants.pageInfo.pageTitle;

      
      if (!isAttachBreadcrumb) {
        this.breadcrumbs.length = 0;
        this.breadcrumbs = GlobalMethods.jsonDeepCopy(menu.breadcrumbs);
      } else {
        let currentBreadcrumb = GlobalMethods.jsonDeepCopy(this.breadcrumbs);
        currentBreadcrumb.push(menu.breadcrumbs[menu.breadcrumbs.length - 1]);          

        this.breadcrumbs.length = 0;
        this.breadcrumbs = currentBreadcrumb;          
      }
    }
  }

  expandMenuPath(menuID?) {
    this.menuList.map((x) => { x.expanded = false });

    let menu = this.menuList.find(menu => menu.id === menuID);
    while (menu) {
      menu.expanded = true;
      menu = this.menuList.find(parent => parent.id === menu.parentID);
    }
  }
}
