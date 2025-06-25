import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, FixedIDs, ModalConfig, ProviderService, QueryData } from 'src/app/app-shared';
import { COAModelService } from '../services/coa/coa-model.service';
import { COADataService } from '../services/coa/coa-data.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AccountNatureComponent } from '../account-nature/account-nature.component';
import { ControlLedgerComponent, GroupLedgerComponent, LedgerComponent, SubGroupLedgerComponent } from '..';
import { Tree } from 'primeng/tree';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-coa',
  templateUrl: './coa.component.html',
  providers: [COAModelService, COADataService],
  standalone:true,
  imports:[
    SharedModule
  ]
})
export class CoaComponent extends BaseComponent implements OnInit {
  ref: DynamicDialogRef;
  spData: any = new QueryData();
  isListShow: boolean = false;
  serverDataList: any[] = [];
  tempServerDataList: any = [];
  isControlLegerHide: boolean;
  isEditShowGroup = false;
  msgCode = {
    deleteConfirmation: '2235',
    deleteSuccess: '2236',
  }
  @ViewChild('tree') tree: Tree;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: COAModelService,
    private dataSvc: COADataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getIsControlLedgerHide();

  }

  showSubGroupLedger(node: any) {
    try {
      node.isHideClrgr = this.isControlLegerHide;
      const modalConfig = new ModalConfig();
      const obj = {
        entity: node,
        isEdit: false
      };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['subgroupledger'];
      modalConfig.width = '900px';
      this.ref = this.dialogService.open(SubGroupLedgerComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {debugger
        this.modelSvc.afferSaveData = data;
        if (data) {
        
          if (data.isSaveAndClose) {
            this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
          }
          else if (data.isShowLedgerEntryModal) {
            this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
            this.showLedger(data);
          }
          else if (data.isControlLedgerEntryModal) {
            this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
            this.showControlLedger(data);
          }
        }

      });


    } catch (error) {

    }
  }

  showControlLedger(node: any) {
    try {
      node.isHideClrgr = this.isControlLegerHide;
      const modalConfig = new ModalConfig();
      const obj = {
        entity: node,
        isEdit: false
      };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['controlledger'];
      modalConfig.width = '890px';
      this.ref = this.dialogService.open(ControlLedgerComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
         
          this.modelSvc.afferSaveData = data;
        }
        if (data.isSaveAndClose) {
          this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
        } else if (data.isShowLedgerEntryModal) {
          this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
          this.showLedger(data);
        }

      });
    } catch (error) {

    }
  }

  showLedger(node: any) {
    try {
      node.isHideClrgr = this.isControlLegerHide;
      const modalConfig = new ModalConfig();
      modalConfig.header = this.fieldTitle['ledger'];
      modalConfig.width = '900px';
      const obj = {
        entity: node,
        isEdit: false,
      };
      modalConfig.data = obj;
      this.ref = this.dialogService.open(LedgerComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.modelSvc.afferSaveData = data;
          this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
        }

      });
    } catch (error) {

    }
  }

  onAdd(node: any, isEdit: boolean) {
    try {

      const modalConfig = new ModalConfig();
      const obj = {
        entity: node,
        isEdit: isEdit
      };
      modalConfig.data = obj;
      if (FixedIDs.accountHead.AccountNature == node.cOALevelCode) {
        modalConfig.header = this.fieldTitle['groupledger'];
        modalConfig.width = '900px';
        this.ref = this.dialogService.open(GroupLedgerComponent, modalConfig);

        this.ref.onClose.subscribe((data: any) => {
          this.modelSvc.afferSaveData = data;
          if (data) {
            if (data.isSaveAndClose) {
              this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);//node.id
            } else if (data.isShowSubGroupLedgerEntryModal) {
              this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
              this.showSubGroupLedger(data);
            }

          }

        });

      }
      else if (FixedIDs.accountHead.GroupLedger == node.cOALevelCode) {

        this.showSubGroupLedger(node);

      }
      else if (FixedIDs.accountHead.SubGroupLedger == node.cOALevelCode) {
        if (this.isControlLegerHide) {
          node.isHideClrgr = this.isControlLegerHide;
          this.showLedger(node);
        } else {
          this.showControlLedger(node);
        }


      }
      else if (FixedIDs.accountHead.ControlLedger == node.cOALevelCode) {

        this.showLedger(node);
      }

    } catch (error) {

    }
  }

  editShowGroupLedger(node: any, isEdit: boolean) {
    try {
      node.setModifyTag();
      const modalConfig = new ModalConfig();
      const obj = {
        entity: node,
        isEdit: isEdit,
      };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['groupledger'];
      modalConfig.width = '900px';

      this.ref = this.dialogService.open(GroupLedgerComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        this.modelSvc.afferSaveData = data;
        this.tree.resetFilter();debugger
        if (data.isSaveAndClose) {
          if (data.parentID == node.parentID) {
            this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, node.id);//node.id
          } else {
            this.updateParentAndChildrenProperty(node,'accountNatureCd',data.accountNatureCd);
            this.modelSvc.moveNode(data.id, data.parentID, node.parentID);
            this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, node.id);//node.id
          }
        } else if (data.isShowSubGroupLedgerEntryModal) {
          if (!isEdit) {
            this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
          }
          this.showSubGroupLedger(data);
        }


      });
    } catch (error) {

    }
  }

  editShowSubGroupLeder(node: any, isEdit: boolean) {
    try {
      node.setModifyTag();
      const modalConfig = new ModalConfig();
      const obj = {
        entity: node,
        isEdit: isEdit
      };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['subgroupledger'];
      modalConfig.width = '900px';
      this.ref = this.dialogService.open(SubGroupLedgerComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {debugger
        if (data != undefined) {
          this.tree.resetFilter();
          //note and assettypecode carray 
         this.updateParentAndChildrenProperty(node,'note',data.note);
         this.updateParentAndChildrenProperty(node,'assetTypeCode',data.assetTypeCode);
        }
        this.modelSvc.afferSaveData = data;

        if (data.isSaveAndClose) {
          if (data.parentID == node.parentID) {
            this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, data.id);//node.id
          } else {
            this.modelSvc.moveNode(data.id, data.parentID, node.parentID);
            this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, data.id);//node.id
          }
        }
        else if (data.isShowLedgerEntryModal) {
          if (!isEdit) { this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID); }
          this.showLedger(data);
        }
        else if (data.isControlLedgerEntryModal) {
          if (!isEdit) {
            this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID);
          }
          this.showControlLedger(data);
        }

      });
    } catch (error) {

    }
  }

  editShowControl(node: any, isEdit: boolean) {
    node.setModifyTag();
    const modalConfig = new ModalConfig();
    const obj = {
      entity: node,
      isEdit: isEdit
    };
    modalConfig.data = obj;
    modalConfig.header = this.fieldTitle['controlledger'];
    modalConfig.width = '890px';
    this.ref = this.dialogService.open(ControlLedgerComponent, modalConfig);
    this.ref.onClose.subscribe((data: any) => {
      this.modelSvc.afferSaveData = data;
      if (data != undefined) {
        this.tree.resetFilter();
         //note and assettypecode carray 
         this.updateParentAndChildrenProperty(node,'note',data.note);
         this.updateParentAndChildrenProperty(node,'assetTypeCode',data.assetTypeCode);
      }
      if (data.isSaveAndClose) {
        if (data.parentID == node.parentID) {
          this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, data.id);//node.id
        } else {
          this.modelSvc.moveNode(data.id, data.parentID, node.parentID);
          this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, data.id);//node.id
        }
      } else if (data.isShowLedgerEntryModal) {
        if (!isEdit) { this.modelSvc.findNodeById(this.modelSvc.treeDataList, data.parentID); }
        this.showLedger(data);
      }


    });
  }

  editShowLeder(node: any, isEdit: boolean) {
    try {
      node.setModifyTag();
      const modalConfig = new ModalConfig();
      const obj = {
        entity: node,
        isEdit: isEdit
      };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['ledger']
      modalConfig.width = '900px';
      this.ref = this.dialogService.open(LedgerComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        this.tree.resetFilter();
        this.modelSvc.afferSaveData = data;
        if (data.parentID == node.parentID) {
          this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, data.id);//node.id
        } else {
          this.modelSvc.moveNode(data.id, data.parentID, node.parentID);
          this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, data.id);//node.id
        }

      });
    } catch (error) {

    }
  }


  onEdit(node: any, isEdit: boolean) {
    try {
      node.isHideClrgr = this.isControlLegerHide;
      node.setModifyTag();
      const modalConfig = new ModalConfig();
      const obj = {
        entity: node,
        isEdit: isEdit
      };
      modalConfig.data = obj;
      if (FixedIDs.accountHead.AccountNature == node.cOALevelCode) {
        modalConfig.header = this.fieldTitle['accountnatures'];
        modalConfig.width = '800px';
        this.ref = this.dialogService.open(AccountNatureComponent, modalConfig);
        this.ref.onClose.subscribe((data: any) => {
          if (data != null) {
            if (data.isSave) {
              this.modelSvc.afferSaveData = data;
              this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList, node.id);
            } else {
              this.isEditShowGroup = true;
              this.editShowGroupLedger(isEdit ? data : node, false);//false

            }
          }


        });

      }
      else if (FixedIDs.accountHead.GroupLedger == node.cOALevelCode) {
        this.editShowGroupLedger(node, isEdit);
      }
      else if (FixedIDs.accountHead.SubGroupLedger == node.cOALevelCode) {
        if (this.isControlLegerHide) {
          node.isHideClrgr = this.isControlLegerHide;
          this.editShowSubGroupLeder(node, isEdit);
        } else {
          this.editShowSubGroupLeder(node, isEdit);
        }

      }
      else if (FixedIDs.accountHead.ControlLedger == node.cOALevelCode) {

        this.editShowControl(node, isEdit);

      }
      else if (FixedIDs.accountHead.Ledger == node.cOALevelCode) {
        node.isHideClrgr = this.isControlLegerHide;
        this.editShowLeder(node, isEdit);
      }

    } catch (error) {

    }
  }

  onDelete(node: any) {
    try {
      this.utilitySvc.showConfirmModal(this.msgCode.deleteConfirmation).subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.dataSvc.delete(Number(node.id), Number(node.cOALevelCode)).subscribe({
            next: (res: any) => {debugger
              this.modelSvc.deleteNodeById(this.modelSvc.treeDataList, node.id);
              
              this.showMsg(this.msgCode.deleteSuccess);
            },
            error: (res: any) => { this.showErrorMsg(res) },
          });
        }
      });

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getCOATreeList(isHide: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getCOATreeList(this.spData, isHide).subscribe({
        next: (res: any) => {
          this.modelSvc.commonDropDownList = res[res.length - 1] || [];
          if (this.modelSvc.commonDropDownList.length == 0) {
            console.log('new added');
            this.dataSvc.isEmptyCOA().subscribe({
              next: (res: any) => {
                this.getIsControlLedgerHide();
              }
            })
          }
          this.tempServerDataList = res[res.length - 1] || [];

          this.serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.modelSvc.treeDataList = this.modelSvc.prepareTreeData(this.serverDataList, null);

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getIsControlLedgerHide() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getIsControlLedgerHide(this.spData).subscribe({
        next: (res: any) => {
          let result = res[res.length - 1] || [];

          if (result.length > 0) {
            this.getCOATreeList(1);
            this.isControlLegerHide = true;
          } else {
            this.getCOATreeList(0);
            this.isControlLegerHide = false;
          }

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

   //note and asset type code carry forward business

   updateParentAndChildrenProperty(node:any, targetKey:any, newValue:any) {
    // Update the parent node's property if it exists
    if (node.hasOwnProperty(targetKey)) {
      node[targetKey] = newValue;
    }
  
    // Recursively update all child nodes if they exist
    if (Array.isArray(node.children)) {
      node.children.forEach(child => {
        this.updateParentAndChildrenProperty(child, targetKey, newValue);
      });
    }
  }


}