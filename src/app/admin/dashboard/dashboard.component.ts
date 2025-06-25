import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalConstants } from 'src/app/app-shared';
import { MenuService } from 'src/app/shared/services/menu.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [
  ],
  standalone:true
})
export class DashboardComponent implements OnInit {

  constructor(public menuService: MenuService) {
    this.menuService.pageTitle = 'Dashboard';
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.menuService.pageMenuItems = this.menuService.menuList.filter(f => !f.parentID);
    }, 1000);
      
  }
}
