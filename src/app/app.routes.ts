import { Routes } from '@angular/router';
import { DefaultComponent } from './default.component';
import { MenuComponent } from './menu.component';
import { ConfirmOTPComponent } from './shared';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'confirmOTP', component : ConfirmOTPComponent},
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '', redirectTo:'ADMIN', pathMatch: 'full' },
      
      {
        path: 'ADMIN',
        children:[
          {path: '', component: MenuComponent},
          {path: 'sub-menu/:id', component: MenuComponent}
        ]
      },
      {
        path: 'ADMIN-PAGE',
        loadChildren: () =>
          import('./admin/admin.module').then((m) => m.AdminModule),
      }, 
     
      {
        path: 'ORG',
        children:[
          {path: '', component: MenuComponent},
          {path: 'sub-menu/:id', component: MenuComponent}
        ]
      },
      {
        path: 'ORG-PAGE',
        loadChildren: () => import('./organization/ogranization.module').then((m) => m.OrganizationModule),
      }
      ,
      {
        path: 'ACC',
        children:[
          {path: '', component: MenuComponent},
          {path: 'sub-menu/:id', component: MenuComponent}
        ]
      },
      {
        path: 'ACC-PAGE',
        loadChildren: () => import('./accounting/accounting.module').then((m)=> m.AccountingModule)          
      }
    ]
  },
];

