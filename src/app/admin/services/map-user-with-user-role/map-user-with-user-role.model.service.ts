import { Injectable } from "@angular/core";
import { UtilityService } from "src/app/shared/services/utility.service";
import { UserGroup } from "../../models/user-wise-role-set-up/user-group.model";
import { GlobalMethods } from "../..";

@Injectable()
export class MapUserWithUserRoleModelService {
  userWiseRoleList: UserGroup[] = [];
  userList: any[] = [];
  roleList: any[] = [];
  tempRoleList: any[] = [];

  constructor(
    private utilitySvc: UtilityService
  ) {

  }
  
  setDefaultData(){
    try {
        this.userWiseRoleList=[];
    } catch (error) {
       throw error; 
    }
  }

  prepareRoleList(data){
    try {        
        this.tempRoleList= GlobalMethods.jsonDeepCopy(data);
        this.roleList=data;
    } catch (error) {
        throw error;
    }
  }

  resetAfterSave(){
    try {        
        this.prepareRoleList(this.tempRoleList);
        this.userList=[];
    } catch (error) {
        throw error;
    }
  }

  prepareUserList(data){
    try {
        this.userList=data;
    } catch (error) {
        throw error;
    }
  }

  updateCollection(item){
    try {
        this.utilitySvc.updateCollection(this.userWiseRoleList,item);
    } catch (error) {
        throw error;
    }
  }

  deleteItemFromCollection(item){
    try {
        this.utilitySvc.deleteCollection(this.userList,item);
    } catch (error) {
        throw error;
    }
  }

  checkSelectedUserList(){
    try {
      return this.userList.length?true:false;
    } catch (error) {
      throw error;
    }
  }

  checkSelectedRoleList(){
    try {
      let selectedRoleList=this.roleList.filter(x=>x.isSelected);
      return selectedRoleList.length?true:false;
    } catch (error) {
      throw error;
    }
  }
  
  prepareDataBeforeSave(){
    try {
        let userGroupList=[];
        let selectedRoleList=this.roleList.filter(x=>x.isSelected);

        this.userList.forEach((item)=>{
          selectedRoleList.forEach((role)=>{
                let userGroup=new UserGroup();
                userGroup.GroupID=role.id;
                userGroup.UserID=item.id;
                userGroupList.push(userGroup);
            });
        });

        return userGroupList;
    } catch (error) {
        throw error;
    }
  }
}
