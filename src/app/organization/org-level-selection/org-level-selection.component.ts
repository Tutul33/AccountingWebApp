import { Component, OnInit } from "@angular/core";
import { BaseComponent, ProviderService } from "src/app/app-shared";
import { ModalService } from "..";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-org-level-selection',
  templateUrl: './org-level-selection.component.html',
  providers: [ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class OrgLevelSelectionComponent extends BaseComponent implements OnInit {
  parentLevelList:any[] = [];
  childLevelList:any[] = [];
  parentLevel:number = 0;
  childLevel:number = 0;
  totalChildLevel:number = 0;
  constructor(
    protected providerSvc: ProviderService,
    public modalService: ModalService,

  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    try {
      this.parentLevel = this.modalService.modalData?.parentLevel;
      this.totalChildLevel = this.modalService.modalData?.totalChildLevel;
      this.prepareLevelData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  prepareLevelData(){
    try {
      this.parentLevelList.push({
        code:1,
        value:this.parentLevel
      });
      for (let index = 1; index <= this.totalChildLevel; index++) {
        this.childLevelList.push({
          code:index,
          value:index
        })
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  ok()
  {
    try {
      this.modalService.close({
        childLevel:this.childLevel
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  cancel(){
    try {
      this.modalService.close();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

}

