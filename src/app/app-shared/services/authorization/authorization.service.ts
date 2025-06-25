import { Injectable } from '@angular/core';
import { UserAuthorization } from '../../models/authorization/authorization.model';

@Injectable()
export class AuthorizationModelService {
  authModel:UserAuthorization;
  authPermissionList:any = [];
  isSubmitted:boolean = false;
  userOrgID:number = 0;
  constructor() {
  }
  
}
