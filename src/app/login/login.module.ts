import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent,ForgotPasswordComponent,ChangePasswordComponent} from './index';

const routes: Routes = [
  {
    path: '', children: [
      { path: '', redirectTo: 'signin', pathMatch: 'full' },
      { path: 'signin', component: LoginComponent },
      { path: 'forgotpassword', component: ForgotPasswordComponent },
      { path: 'changepassword', component: ChangePasswordComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [],
  providers: []
})
export class LoginModule { }
