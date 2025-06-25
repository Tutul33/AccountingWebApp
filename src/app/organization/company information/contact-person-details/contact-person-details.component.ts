import { Component, OnInit, Input } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrgBasicDTO, OrgContactDetailsDTO } from '../../models/company-information/company-information';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalMethods } from '../../../shared';
import { EmployeeListComponent } from 'src/app/admin/employee-list/employee-list.component'


import {
  ProviderService,
  ModalConfig,
  BaseComponent,
  CompanyInformationDataService,
  CompanyInformationModelService,
  ORGStructureModelService
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-contact-person-details',
  templateUrl: './contact-person-details.component.html',
  providers: [CompanyInformationModelService, CompanyInformationDataService, ORGStructureModelService],
  standalone:true,
  imports:[SharedModule]
})
export class ContactPersonDetailsComponent extends BaseComponent implements OnInit {

  @Input() orgStructureID: number = 0;
  @Input() organizationName: string = "";
  @Input() addressTypeCd: number = 0;
  @Input() orgStructureIDParentID: number = 0;
  
  isSubmited: boolean = false;
  gridOptionContactPerson: GridOption;
  ref: DynamicDialogRef;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: CompanyInformationModelService,
    private dataSvc: CompanyInformationDataService,
    public orgModelSvc: ORGStructureModelService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.initGridOptionContactPerson();
    setTimeout(() => {
      this.modelSvc.orgContactDetailsDTO = new OrgContactDetailsDTO();
      this.modelSvc.tempOrgContactDetailsDTO = new OrgContactDetailsDTO();
      this.modelSvc.orgBasicDTO= new OrgBasicDTO();
      this.modelSvc.tempOrgBasicDTO= new OrgBasicDTO();

      this.modelSvc.organizationName = this.organizationName;
      this.modelSvc.orgStructureID = this.orgStructureID;
      this.getContactDetailsData(this.orgStructureID);
    }, 10);
  }

    
  initGridOptionContactPerson() {
    try {
      const gridObj = {
        title: this.fieldTitle["contactpersonlist"],
        dataSource: "modelSvc.contactDetailsList",
        refreshEvent: this.refreshContactDetails,
        columns: this.gridColumnsContactPerson(),
        isGlobalSearch: true,
      } as GridOption;
      this.gridOptionContactPerson = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumnsContactPerson(): ColumnType[] {
    return [
      { field: "hR_EmployeeID", header: this.fieldTitle['employeeid'] },
      { field: "employeeName", header: this.fieldTitle['employeename'] },
      { field: "designation", header: this.fieldTitle['designation'] },
      { field: "organization", header: this.fieldTitle['organization'] },
      { field: "email", header: this.fieldTitle['email'] },
      { field: "contactNo", header: this.fieldTitle['contactno']},
      { header: this.fieldTitle['action'] }
    ]
  }

  refreshContactDetails(){
    try {
      this.getContactDetailsData(this.orgStructureID);

      this.modelSvc.disableContactDetailRestButton = true;
      this.modelSvc.disableContactDetailSaveButton = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getContactDetailsData(orgStructureID: number){
    try {
      this.dataSvc.getOrgContactDetailsData(orgStructureID).subscribe({
        next: (res: any) => {
          this.modelSvc.contactDetailsList = [];
          let data = res[res.length - 1] || [];
          this.modelSvc.prepareContactDetailsSaveData(data);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  showEmployeeModal() {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.data = {
        option: 1,
        isActive: true
      };
      this.ref = this.dialogService.open(
        EmployeeListComponent,
        modalConfig
      );
      this.ref.onClose.subscribe((obj: any) => {
        if(this.modelSvc.contactDetailsList.find(x=> x.employeeID == obj.id && x.tag != FixedIDs.objectState.deleted && (x.tag == FixedIDs.objectState.added || x.tag == FixedIDs.objectState.detached)))
        {
          this.showMsg("2226");
        }
        else
        {
          this.modelSvc.addContactDetails(obj);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  deleteContactDetails(data: any) {
    try {
      this.modelSvc.deleteContactDetails(data); 
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveContactDetail() {
    try {
      this.saveContactDetailData(this.modelSvc.contactDetailsList);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private saveContactDetailData(contactDetailsList: OrgContactDetailsDTO[]) {
    try {
      let messageCode = this.messageCode.editCode;
      this.dataSvc.saveContactDetailInfo(contactDetailsList).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareContactDetailsDataAfterSave(res.body);
          this.showMsg(messageCode);
        },
        error: (e: any) => {
          this.showMsg(e);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  resetContactDetail(){
    try {
      this.modelSvc.contactDetailsList = GlobalMethods.jsonDeepCopy(this.modelSvc.tempContactDetailsListList);
      this.modelSvc.contactDetailsListLength = GlobalMethods.jsonDeepCopy(this.modelSvc.tempContactDetailsListLength);
      
      this.modelSvc.disableContactDetailRestButton = true;
      this.modelSvc.disableContactDetailSaveButton = true;
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


}
