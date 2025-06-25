import { Component, OnInit } from '@angular/core';
import { GlobalConstants, GlobalMethods } from './index';
import { MenuService } from "./shared/services/menu.service";
import { ConfigService } from './core/services/config.service';
import { DataService } from './shared/services/data.service';
import { fromEvent, Subject } from "rxjs";
import { takeUntil } from 'rxjs/operators';
import { Router} from '@angular/router';
import { SharedModule } from './shared/shared.module';
@Component({
  selector: 'app-rms',
  templateUrl: "./menu.component.html",
  styles: [
  ],
  imports:[SharedModule]
})
export class MenuComponent implements OnInit {

  routeData = null;
  menuItems: any[] = [];
  private unsubscriber: Subject<void> = new Subject<void>();

  constructor(
    public menuService: MenuService, 
    public dataTransferSvc: DataService,
    private configSvc: ConfigService ,   
  ) {
    
  }

  ngOnInit(): void {
    history.pushState(null, '');

    fromEvent(window, 'popstate').pipe(
      takeUntil(this.unsubscriber)
    ).subscribe((_) => {
      
      history.pushState(null, '');      
    });
  }

  actionOnMenuClick(menu: any) {
    GlobalMethods.setPageInfo(menu);
    this.configSvc.setLocalStorage('currentLinkID', GlobalConstants.pageInfo.id);

    if (GlobalConstants.pageInfo.items.length)
      this.menuService.pageMenuItems = GlobalConstants.pageInfo.items;

    this.menuService.pageTitle = !menu.pageTitle ? menu.moduleName : menu.pageTitle;
    this.menuService.breadcrumbs = GlobalMethods.deepClone(menu.breadcrumbs);
    this.menuService.expandMenuPath(menu.id);
    this.dataTransferSvc.remove();
  }  
  
  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }
}
