import { Injectable } from '@angular/core';
import { GridOption, UtilityService } from '../../index';
import { Config, FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods } from 'src/app/shared';
import { ProjectDTO } from '../../models/project-information/project.model';

@Injectable()
export class ProjectModelService {

  isBranchModuleActive: boolean = false;
  projectDTO: ProjectDTO;
  tempProjectDTO: ProjectDTO;
  projectList: any = [];
  companyList: any = [];
  officeBranchUnitList: any = [];
  projectNameDDList: any = [];
  addressDDList: any = [];
  cntactPersonDDList: any = [];
  contactPersonEmailDDList: any = [];
  contactPersonMobileNoDDList: any = [];
  orgNameDDList: any = [];
  officeBranchUnitDDList: any = [];

  constructor(private utilitySvc: UtilityService) { }

  prepareOfficeBranchUnitList(res) {
    try {
      let orgList = [
        {
          label: "-- Office --",
          value: "office",
          items: [],
        },
        {
          label: "-- Branch --",
          value: "branch",
          items: [],
        },
        {
          label: "-- Unit --",
          value: "unit",
          items: [],
        },
      ];
      res.forEach((item) => {
        if (item.value == "Office") {
          //3 Office
          let objOffice = orgList.find((x) => x.value == "office");
          if (objOffice) {
            objOffice.items.push(item);
          }
        } else if (item.value == "Branch") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "branch");
          if (objBranch) {
            objBranch.items.push(item);
          }
        } else if (item.value == "Unit") {
          //5 Unit
          let objUnit = orgList.find((x) => x.value == "unit");
          if (objUnit) {
            objUnit.items.push(item);
          }
        }
      });
      this.officeBranchUnitList = orgList || [];
    } catch (error) {
      throw error;
    }
  }

  public hasValidBranchProject() {
    try {
      let isInValid = false;
      if(this.isBranchModuleActive && !this.projectDTO.unitBranchID){
        isInValid = true;
      }
      return isInValid;
    } catch (error) {
      throw error;
      
    }
  }

  prepareDataBeforeSave() {
    try {
      if(this.projectDTO.unitBranchID != null)
      {
        this.projectDTO.orgID = this.projectDTO.unitBranchID;
      }
      else
      {
        this.projectDTO.orgID = this.projectDTO.companyID;
      }
    } catch (e) {
      throw e;
    }
  }

  prepareEditForm(entity: any) {
    try {
      this.projectDTO = new ProjectDTO(GlobalMethods.jsonDeepCopy(entity));
      this.tempProjectDTO = new ProjectDTO(GlobalMethods.jsonDeepCopy(entity));
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(entity: ProjectDTO) {
    try {
      this.utilitySvc.deleteCollection(this.projectList, entity);
    } catch (e) {
      throw e;
    }
  }

  //for upoad
  fileUpload: any;
  fileOption = new FileUploadOption();
  officeBranchList: any = [];

  prepareOfficeBranchUnit(data: any) {
      try {
        let categories = [
          {
            label: "-- Office --",
            value: "Office",
            items: [],
          },
          {
            label: "-- Branch --",
            value: "Branch",
            items: [],
          },
  
          {
            label: "-- Unit --",
            value: "Unit",
            items: [],
          }
        ];
  
        data.forEach((item) => {
          if (item.organizationElementID == FixedIDs.orgType.Office) {// office
            let catObj = categories.find((x) => x.value == "Office");
            if (catObj) {
              catObj.items.push(item);
            }
          } else if (item.organizationElementID == FixedIDs.orgType.Branch) {// Branch
            let catObj = categories.find((x) => x.value == "Branch");
            if (catObj) {
              catObj.items.push(item);
            }
          }
          else if (item.organizationElementID == FixedIDs.orgType.Unit) {// Unit
            let catObj = categories.find((x) => x.value == "Unit");
            if (catObj) {
              catObj.items.push(item);
            }
          }
        });
        return {
          categories: categories,
        };
      } catch (error) {
        throw error;
      }
    }
  fileUploadOption() {
    try {
      this.fileOption.isMultipleSelection = false;
      this.fileOption.isMultipleUpload = false;
      this.fileOption.uploadServiceUrl = "File/UploadFiles";
      this.fileOption.acceptedFiles = '.csv,.xlsx,.xls';
      this.fileOption.folderName = Config.imageFolders.project;
      this.fileOption.fileTick = GlobalMethods.timeTick() + 1;
      return this.fileOption;
    } catch (error) {

    }

  }

  newFileInfo: any;
  configFilePath() {
    try {
      this.newFileInfo = GlobalMethods.deepClone<any>(this.fileOption);
      this.newFileInfo.id = 0;
      this.newFileInfo.isThumbnailFormat = true;
      this.newFileInfo.userID = GlobalConstants.userInfo.userPKID;
      this.newFileInfo.name = GlobalConstants.userInfo.userName;
      this.newFileInfo.orgID = this.projectDTO.orgID;
      this.newFileInfo.companyID = this.projectDTO.companyID;
      this.newFileInfo.locationID = GlobalConstants.userInfo.locationID;

    } catch (error) {

    }

  }

  exportCSVReport(gridOption: GridOption, values: any, column?: any[]) {
    this.utilitySvc.exportCSVReport(gridOption, values, column);
  }

}
