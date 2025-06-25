import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import {
  BaseComponent,
  Config,
  FixedIDs,
  GlobalConstants,
  GlobalMethods,
  GridOption,
  ProviderService,
  ValidatingObjectFormat,
  ValidatorDirective,
} from "src/app/app-shared";
import {
  FileUploadComponent,
  JournalVoucherDataService,
  JournalVoucherModelService,
} from "../../../index";
import { NgForm, UntypedFormGroup } from "@angular/forms";
import {
  VoucherValidation,
  SingleJournalVoucherValidation,
  VoucherModel,
} from "src/app/accounting/models/voucher/voucher.model";
import {
  ColumnType,
  FileOption,
  FileUploadOption,
  ModalConfig,
  QueryData,
} from "src/app/shared/models/common.model";
import { VoucherItemModel } from "src/app/accounting/models/voucher/voucher-item.model";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { OrgService } from "src/app/app-shared/services/org.service";
import { forkJoin, Subject, takeUntil } from "rxjs";
import { SharedModule } from "src/app/shared/shared.module";
@Component({
  selector: "app-journal-voucher-entry",
  templateUrl: "./journal-voucher-entry.component.html",
  providers:[JournalVoucherModelService,JournalVoucherDataService,],
  standalone:true,
  imports:[SharedModule]
})
export class JournalVoucherEntryComponent extends BaseComponent
  implements OnInit, AfterViewInit {
  isSubmitted: boolean = false;
  projectOfficeBranch: string = "";
  companyName: string = "";
  isMultiEntry: boolean = false;
  isEdit:boolean=false;
  spData: any = new QueryData();
  voucherID:number=0;
  private $unsubscribe = new Subject<void>();
  ref: DynamicDialogRef;
  public validationMsgObj: ValidatingObjectFormat;
  public singleValidationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("multiJournalVoucherForm", { static: true, read: NgForm })
  multiJournalVoucherForm: NgForm;
  gridOption: GridOption;
  loginUserID: number = GlobalConstants.userInfo.userPKID;
  decimalPlace: number = 2;

  //Single
  @ViewChild("singleJournalVoucherForm", { static: true, read: NgForm })
  singleJournalVoucherForm: NgForm;
  fileUploadOption: FileUploadOption;

  constructor(
    protected providerSvc: ProviderService,
    private dataSvc: JournalVoucherDataService,
    public modelSvc: JournalVoucherModelService,
    public coreAccService: CoreAccountingService,
    public orgService: OrgService,
    public dialogService: DialogService
  ) {
    super(providerSvc);
    this.validationMsgObj = VoucherValidation();
    this.singleValidationMsgObj = SingleJournalVoucherValidation();
  }

  ngOnInit() {
    try {
      this.setBranchProjectConfig();
      this.modelSvc.initiate();
      this.loadOtherData();     
      this.getFileUploadOption();
      this.initGridOption();
      this.modelSvc.journalVoucherModel.companyID = GlobalConstants.userInfo.companyID;
      this.modelSvc.journalVoucherModel.company = GlobalConstants.userInfo.company;
      this.dataTransferSvc
        .on("voucherID")
        .pipe(takeUntil(this.$unsubscribe))
        .subscribe((response) => {
          if (response) {
            const voucherID = Number(JSON.parse(JSON.stringify(response)));
            this.voucherID=voucherID;
            this.loadVoucherByID(voucherID);
          }

          this.dataTransferSvc.unsubscribe(this.$unsubscribe);
        });
      this.dataTransferSvc.broadcast("voucherID", null);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  isInValidBranch:boolean=false;
  
  setBranchProjectConfig(){
    try {
      this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  ngAfterViewInit() {
    try {
      this.modelSvc.multiJournalVoucherForm = this.multiJournalVoucherForm.form;
      this.modelSvc.singleJournalVoucherForm = this.singleJournalVoucherForm.form;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  loadVoucherByID(voucherID) {
    try {
      this.spData.isRefresh = true;
      this.spData.pageNo = 0;

      this.dataSvc.GetVoucherByVoucherID(voucherID, this.spData).subscribe({
        next: (res: any) => {
          const voucherData = res[0];
          const data = voucherData;

          if (data.id) {
            this.isEdit=true;
           
            this.modelSvc.isMultipleEditMode=true;              
            this.modelSvc.isSingleEditMode=true;
         
            this.modelSvc.tempVoucherModel = JSON.stringify(GlobalMethods.deepClone(res[0]));
            this.setDataModel(data);
            
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {},
      });
    } catch (error) {}
  }

  setDataModel(data) {
    try {
      this.modelSvc.prepareDataForEdit(data);
      if (!this.modelSvc.journalVoucherModel.isMultiEntry) {
        this.isMultiEntry=this.modelSvc.journalVoucherModel.isMultiEntry;
        this.getLedgerBalance(
          "from",
          this.modelSvc.journalVoucherModel,
          this.modelSvc.journalVoucherModel.fromCOAStructID,
          this.modelSvc.journalVoucherModel.companyID,
          null,
          this.modelSvc.journalVoucherModel.orgID,
          this.modelSvc.journalVoucherModel.projectID
        );
        this.getLedgerBalance(
          "from",
          this.modelSvc.journalVoucherModel,
          this.modelSvc.journalVoucherModel.fromCOAStructID,
          this.modelSvc.journalVoucherModel.companyID,
          this.modelSvc.journalVoucherModel.fromSubLedgerDetailID,
          this.modelSvc.journalVoucherModel.orgID,
          this.modelSvc.journalVoucherModel.projectID
        );

        this.getLedgerBalance(
          "to",
          this.modelSvc.journalVoucherModel,
          this.modelSvc.journalVoucherModel.toCOAStructID,
          this.modelSvc.journalVoucherModel.companyID,
          null,
          this.modelSvc.journalVoucherModel.orgID,
          this.modelSvc.journalVoucherModel.projectID
        );
        this.getLedgerBalance(
          "to",
          this.modelSvc.journalVoucherModel,
          this.modelSvc.journalVoucherModel.toCOAStructID,
          this.modelSvc.journalVoucherModel.companyID,
          this.modelSvc.journalVoucherModel.toSubLedgerDetailID,
          this.modelSvc.journalVoucherModel.orgID,
          this.modelSvc.journalVoucherModel.projectID
        );

          this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID);
          this.modelSvc.filterSubLedgerDetail(this.modelSvc.journalVoucherModel);
          setTimeout(()=>{          
            this.loadBranchOfficeUnit();
            this.loadProject();
            },70);
      } else {
        this.isMultiEntry=this.modelSvc.journalVoucherModel.isMultiEntry;
     
        this.modelSvc.journalVoucherModel.voucherItemList.forEach((item) => {
          this.getLedgerBalance(
            "from",
            item,
            item.fromCOAStructID,
            this.modelSvc.journalVoucherModel.companyID,
            null,
            this.modelSvc.journalVoucherModel.orgID,
            this.modelSvc.journalVoucherModel.projectID
          );
          this.getLedgerBalance(
            "from",
            item,
            item.fromCOAStructID,
            this.modelSvc.journalVoucherModel.companyID,
            item.fromSubLedgerDetailID,
            this.modelSvc.journalVoucherModel.orgID,
            this.modelSvc.journalVoucherModel.projectID
          );
        });
        setTimeout(()=>{          
          this.loadBranchOfficeUnit();
          this.loadProject();

          setTimeout(()=>{          
            this.modelSvc.journalVoucherModel.voucherItemList.forEach((item)=>{
              this.modelSvc.filterCOAStructure(item,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID);
              this.modelSvc.filterSubLedgerDetail(item);
            });
            this.modelSvc.processBalances();
          },150)
          },50);
        
      }
      this.modelSvc.totalSumDebitCredit();
     
    } catch (error) {}
  }

  getLedgerBalance(
    type: any,
    voucherModel: any,
    cOAStructureID: number,
    companyID: number,
    subLedgerDetailID?: number,
    orgID?: number,
    projectID?: number
  ) {
    try {
      this.coreAccService.getLedgerBalance(
          cOAStructureID,
          companyID,
          subLedgerDetailID,
          orgID,
          projectID
        )
        .subscribe({
          next: (res: any) => {
            const balance = res || [];
            //get sub-ledger balance
            if (type == "from") {
              if (cOAStructureID && subLedgerDetailID) {
                voucherModel.fromSubLedgerBalance = balance.length
                  ? balance[0].balance
                  : 0;
              } else {
                voucherModel.fromCoaStructBalance = balance.length
                  ? balance[0].balance
                  : 0;
              }
            } else {
              if (cOAStructureID && subLedgerDetailID) {
                voucherModel.toSubledgerBalance = balance.length
                  ? balance[0].balance
                  : 0;
              } else {
                voucherModel.toAccountBalance = balance.length
                  ? balance[0].balance
                  : 0;
              }
            }
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  loadOtherData() {
    try {
      this.loadAllData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  loadAllData(){
    try {
      let elementCode='';
      elementCode= FixedIDs.orgType.Branch.toString();
      elementCode+= ','+FixedIDs.orgType.Office.toString();
      elementCode+= ','+FixedIDs.orgType.Unit.toString(); 
    const orgID=GlobalConstants.userInfo.companyID.toString();
     
    forkJoin(
      [
       this.orgService.getOrgStructure(elementCode,orgID),
       this.coreAccService.getProject(GlobalConstants.userInfo.companyID),
       this.coreAccService.getCOAStructure(),
       this.coreAccService.getSubLedgerDetail(),
       this.coreAccService.getFinancialYear(),
       this.coreAccService.getVoucherEntryEditPeriod(GlobalConstants.userInfo.companyID,null,null),
       this.coreAccService.getVoucherNotification(),
       this.orgService.getOrgStructure(FixedIDs.orgType.Company.toString(), ''),
      ]
     ).subscribe({
         next: (res: any) => {console.log("COA Structure:",res[2]);
          this.modelSvc.prepareOrgList(res[0]);     
          this.modelSvc.projectList = res[1] || []; 

          const coaStructureList = res[2] || [];  
          
          let transactionNature = [
            {
              code: FixedIDs.transactionNatureCd.bankNature.code
            },
            {
              code: FixedIDs.transactionNatureCd.cashNature.code
            }
          ];

          this.modelSvc.coaStructureList = coaStructureList.filter((x) => {
            // Check if the code exists in transactionNature
            return !transactionNature.some(
              (tn) => tn.code === x.transactionNatureCode
            );
          });
          
          if(this.modelSvc.journalVoucherModel.orgID)
            {
              this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,null);
            }    
            else{
              this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,null,null);  
            } 

            this.modelSvc.subLedgerDetailList = res[3] || [];

            if (res[4].length) {
              this.modelSvc.financialYearAll = res[4];
            }
            if (res[5].length) {
              this.modelSvc.validityVoucherEntryEdit = res[5];
            }
            setTimeout(() => {
              this.modelSvc.setMinDateMaxDate();
              this.modelSvc.setMinMaxDateBasedOnComapnyProjectOrg();
            }, 10);
            //console.log(res[6]);
            this.modelSvc.companyList=res[7]||[];
         },
         error: (res: any) => {
           this.showErrorMsg(res);
         },
       });
  } catch (error) {
    this.showErrorMsg(error);
  }
    
  }

  onChangeCompany(){
    try {
      this.loadBranchOfficeUnit();
      this.loadProject();
    } catch (error) {
      
    }
  }
  loadBranchOfficeUnit(){
    try {
      let elementCode='';
      elementCode= FixedIDs.orgType.Branch.toString();
      elementCode+= ','+FixedIDs.orgType.Office.toString();
      elementCode+= ','+FixedIDs.orgType.Unit.toString(); 
      const orgID=this.modelSvc.journalVoucherModel.companyID;
      this.orgService.getOrgStructure(elementCode,orgID.toString()).subscribe({
        next: (res: any) => {
         this.modelSvc.prepareOrgList(res);  
         if(this.modelSvc.journalVoucherModel.orgID){
          if(!this.modelSvc.journalVoucherModel.isMultiEntry)
          {
            this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID);
          }
          else{
           if(this.modelSvc.journalVoucherModel.id==0){
            this.modelSvc.journalVoucherModel.voucherItemList=[];
            this.modelSvc.addNewItem();
           }
          }
        } else{
          this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID);
        }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  loadProject(){
    try {
      this.coreAccService.getProject(this.modelSvc.journalVoucherModel.companyID).subscribe({
        next: (res: any) => {
          this.modelSvc.projectList = res|| []; 
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  getSubLedgerDetail() {
    this.coreAccService.getSubLedgerDetail().subscribe({
      next: (res: any) => {
        let getSubLedgerDetailList = res || [];
        this.modelSvc.subLedgerDetailList = getSubLedgerDetailList;
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  }
  //load data start
  getCOAStructure(orgID?: number, projectID?: number) {
    try {
      this.coreAccService.getCOAStructure(orgID, projectID).subscribe({
        next: (res: any) => {
          let coaStructureList = res||[];
          //let coaStructureList = [res[0]];
          let transactionNature = [
            {
              code: FixedIDs.transactionNatureCd.bankNature.code
            },
            {
              code: FixedIDs.transactionNatureCd.cashNature.code
            }
          ];

          this.modelSvc.coaStructureList = coaStructureList.filter((x) => {
            // Check if the code exists in transactionNature
            return !transactionNature.some(
              (tn) => tn.code === x.transactionNatureCode
            );
          });

          this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  getOrgList() {
    try {
      let elementCode = "";
      elementCode = FixedIDs.orgType.Branch.toString();
      elementCode += "," + FixedIDs.orgType.Office.toString();
      elementCode += "," + FixedIDs.orgType.Unit.toString();
      const orgID = GlobalConstants.userInfo.companyID.toString();
      this.orgService.getOrgStructure(elementCode, orgID).subscribe({
        next: (res: any) => {          
          this.modelSvc.prepareOrgList(res);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getProject() {
    try {
      const orgID = GlobalConstants.userInfo.companyID;
      this.coreAccService.getProject(orgID).subscribe({
        next: (res: any) => {
          this.modelSvc.projectList = res || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  markFormAsPristine(form: NgForm): void {
    Object.keys(form.controls).forEach((controlName) => {
      const control = form.controls[controlName];
      control.markAsPristine();
      control.markAsUntouched();
    });
  }

  getVoucherEntryEditPeriod(
    companyID: number,
    orgID?: number,
    projectID?: number
  ) {
    try {
      forkJoin(
        this.coreAccService.getFinancialYear(),
        this.coreAccService.getVoucherEntryEditPeriod(
          companyID,
          orgID,
          projectID
        )
      ).subscribe({
        next: (res: any) => {
          //get Voucher Entry Edit Period
          if (res[0].length) {
            this.modelSvc.financialYearAll = res[0];
          }
          if (res[1].length) {
            this.modelSvc.validityVoucherEntryEdit = res[1];
          }
          setTimeout(() => {
            this.modelSvc.setMinDateMaxDate();
            this.modelSvc.setMinMaxDateBasedOnComapnyProjectOrg();
          }, 10);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private getFileUploadOption() {
    this.fileUploadOption = new FileUploadOption();
    this.fileUploadOption.folderName = Config.imageFolders.voucher;
    this.fileUploadOption.uploadServiceUrl = "File/UploadFiles";
    this.fileUploadOption.fileTick = GlobalMethods.timeTick();
    this.fileUploadOption.acceptedFiles =
      ".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xlsx";
    this.fileUploadOption.isMultipleUpload = true;
    this.fileUploadOption.isMultipleSelection = true;
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "modelSvc.journalVoucherModel.voucherItemList",
        columns: this.gridColumns(),
        paginator: false,
        isGlobalSearch: false,
        exportOption: {
          exportInPDF: false,
          exportInXL: false,
          title: "",
        } as FileOption,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    try {
      return [
        {
          field: "fromCOAStructID",
          header: this.fieldTitle["fromaccountname"],
          isRequired: true,
        },
        { field: "fromCoaStructBalance", header: this.fieldTitle["balance"] },
        {
          field: "fromSubLedgerDetailID",
          header: this.fieldTitle["subledger"],
        },
        { field: "fromSubLedgerBalance", header: this.fieldTitle["balance"] },
        { field: "description", header: this.fieldTitle["description"] },
        { field: "budget", header: this.fieldTitle["budget"] },
        {
          field: "debitVal",
          header: this.fieldTitle["debit"],
          isRequired: true,
        },
        {
          field: "creditVal",
          header: this.fieldTitle["credit"],
          isRequired: true,
        },
        // { field: "projectID", header: this.fieldTitle["project"] },
        {
          field: "toCOAStructID",
          header: this.fieldTitle["toaccountname"],
          isRequired: true,
        },
        { field: "toSubLedgerDetailID", header: this.fieldTitle["subledger"] },
        { field: "", header: this.fieldTitle["ref.doc"] },
        { field: "", header: this.fieldTitle["action"] },
      ];
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onFormResetFormMultiple() {
    try {
      
      this.isSubmitted = false;
     
      if (this.modelSvc.tempVoucherModel) {
        let data=JSON.parse(this.modelSvc.tempVoucherModel);
        if (data.id) {
          this.setDataModel(data);
          this.formResetByDefaultValue(this.modelSvc.multiJournalVoucherForm, this.modelSvc.journalVoucherModel);

        }
        
      } else {        
        this.modelSvc.resetFormMultiple();      

        this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID);
        this.addNewJournalItem();
        this.modelSvc.totalCredit=0;
        this.modelSvc.totalDebit=0;
        this.formResetByDefaultValue(this.modelSvc.multiJournalVoucherForm, this.modelSvc.journalVoucherModel);
        // this.modelSvc.setSingleORG();
        setTimeout(()=>{
          this.modelSvc.journalVoucherModel.company = GlobalConstants.userInfo.company;
          this.modelSvc.journalVoucherModel.companyID = GlobalConstants.userInfo.companyID;
          this.modelSvc.journalVoucherModel.voucherDate = new Date();
          this.loadBranchOfficeUnit();
          this.loadProject();
        },5);  
      }

     
      
      this.modelSvc.isMultipleEditMode=false;
      this.modelSvc.isSingleEditMode=false;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onFormResetFormSingle() {
    try {
      
      this.isSubmitted = false;
      if (this.modelSvc.tempVoucherModel) {
        let data=JSON.parse(this.modelSvc.tempVoucherModel);
        if (data.id) {
          this.formResetByDefaultValue(this.modelSvc.singleJournalVoucherForm, this.modelSvc.journalVoucherModel);
          this.setDataModel(data);
         
        }
      } else {
        this.modelSvc.resetFormSingle();
        this.formResetByDefaultValue(this.modelSvc.singleJournalVoucherForm, this.modelSvc.journalVoucherModel);
        this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID);
        setTimeout(()=>{
          this.modelSvc.journalVoucherModel.company = GlobalConstants.userInfo.company;
          this.modelSvc.journalVoucherModel.companyID = GlobalConstants.userInfo.companyID;
          this.modelSvc.journalVoucherModel.voucherDate = new Date();
          //this.modelSvc.setSingleORG();
          this.loadBranchOfficeUnit();
          this.loadProject();
        },5);
   
      }
      this.modelSvc.isMultipleEditMode=false;
      this.modelSvc.isSingleEditMode=false;
     } catch (error) {
      this.showErrorMsg(error);
    }
  }

  multiSave(multiJournalVoucherForm: NgForm) {
    try {
      if (!multiJournalVoucherForm.valid) {
        this.directive.validateAllFormFields(
          multiJournalVoucherForm.form as UntypedFormGroup
        );

        const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
        if (objBrnchPjctInValid) {  
          this.isInValidBranch=true;
          this.showMsg('2281');          
        }

        return;
      }
      const validItem = this.modelSvc.journalVoucherModel.voucherItemList.filter(
        (x) => x.tag != 2
      );
      if (!validItem.length) {
        this.showMsg("2247");
        return;
      }

      if (this.modelSvc.checkValidityForDuplicateMultiEntry()) {
        this.showMsg("2248");
        return;
      }

      let validityCheck = this.modelSvc.checkDataValidityForMultiEntry();

      if (validityCheck.isInvalid) {
        if (validityCheck.isInvalidCaseOne) {
          this.showMsg("2249");
        }
        if (validityCheck.isInvalidCaseTwo) {
          this.showMsg("2250");
        }
        if (validityCheck.isInvalidCaseThree) {
          this.showMsg("2251");
        }
        if (validityCheck.isInvalidCaseFour) {
          this.showMsg("2252");
        }
        return;
      }
      this.modelSvc.prepareDataForMultiEntry();
      this.checkEntryValidityToSave();     
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  singleSave(singleJournalVoucherForm: NgForm) {
    try {
           
      if (!singleJournalVoucherForm.valid) {
        this.directive.validateAllFormFields(
          singleJournalVoucherForm.form as UntypedFormGroup
        );

        const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
        if (objBrnchPjctInValid) {  
          this.isInValidBranch=true;
          this.showMsg('2281');          
        }      
        return;
      }
      
      if (
        !this.modelSvc.checkValidityOfFromAccountSubLedgerAndToAccountSubLedger()
      ) {
        this.showMsg("2246");
        return;
      }

      if (!this.modelSvc.checkValidityOfFromAccountSubLedger()) {
        this.showMsg("2245");
        return;
      }

      if (!this.modelSvc.checkValidityOfToAccountSubLedger()) {
        this.showMsg("2243");
        return;
      }

      if (!this.modelSvc.checkValidityOfNoSubLedgerButSameFromAndToAccount()) {
        this.showMsg("2244");
        return;
      }

      this.modelSvc.prepareDataForSingleEntry();
      
      this.checkEntryValidityToSave();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  checkEntryValidityToSave() {
    try {
          const isInvalid=this.modelSvc.checkAmountValidation();
          if(isInvalid){
            if(this.modelSvc.journalVoucherModel.isMultiEntry){
              this.modelSvc.journalVoucherModel.voucherItemList.forEach((item,index)=>{
                this.validateDebitCreditFields(item,index);
              })              
            }else{
              this.validateDebitCreditFields(this.modelSvc.journalVoucherModel);
            }
            return;
          }
          const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
          if (objBrnchPjctInValid) {  
            this.isInValidBranch=true;
            this.showMsg('2281');
            return;
          }else{
            this.isInValidBranch=false;
          }
           
          const objValidity = this.modelSvc.checkEntryEditValidity();
          if (objValidity.isInvalid) {
              this.showMsg(objValidity.message);
              return;
          }
          
          this.finalSave();
        } catch (error) {
          this.showErrorMsg(error);
        }
  }

  finalSave() {
    try {
      let messageCode = this.messageCode.saveCode;
      
      this.modelSvc.setTempVoucher(this.modelSvc.journalVoucherModel);

      this.dataSvc.save(this.modelSvc.finalVoucherModel).subscribe({
        next: (res: any) => {
          this.showMsg(messageCode);
          this.modelSvc.prepareDataAfterSave(res.body);
          if(this.isEdit)
            this.modelSvc.tempVoucherModel = JSON.stringify(GlobalMethods.deepClone(this.modelSvc.journalVoucherModel));
           else{
            this.modelSvc.tempVoucherModel=null;
           } 
          this.modelSvc.singleJournalVoucherForm.markAsPristine();
          this.modelSvc.multiJournalVoucherForm.markAsPristine();
          
          this.modelSvc.isMultipleEditMode=false;
          this.modelSvc.isSingleEditMode=false;
          this.isSubmitted = true;
          if(this.singleJournalVoucherForm)
            this.modelSvc.singleJournalVoucherForm.markAsPristine();

          if(this.multiJournalVoucherForm)
            this.modelSvc.multiJournalVoucherForm.markAsPristine();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
          this.isSubmitted = false;
        },
        complete: () => {},
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  addNew() {
   try {    
    this.isEdit=false;
    this.modelSvc.initiate();
    //this.modelSvc.setSingleORG();
    this.modelSvc.journalVoucherModel.isMultiEntry = this.isMultiEntry;

    this.loadBranchOfficeUnit();
    this.loadProject();
    //this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID)
    this.isSubmitted = false;
    this.modelSvc.tempVoucherModel=null;
    if(this.isMultiEntry)
      {
        this.addNewJournalItem();
        this.modelSvc.totalSumDebitCredit();
      }


    if(!this.isMultiEntry){
        this.markFormAsPristine(this.singleJournalVoucherForm);
    }
    
    setTimeout(()=>{
      if(this.isMultiEntry)
        this.modelSvc.multiJournalVoucherForm.markAsPristine();
    },0);
    
    this.modelSvc.isSingleEditMode=false;
    this.modelSvc.isMultipleEditMode=false;
   
   } catch (error) {
    this.showErrorMsg(error);
   }
  }

  addNewJournalItem() {
    try {
      if(this.modelSvc.checkFromAccountToAccountOnAddNewItem()){ 
        this.showMsg("2271");
        return;
      }
      this.modelSvc.addNewItem();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  removeVoucherItem(item: any) {
    try {
      if(this.modelSvc.journalVoucherModel.voucherItemList.length>1){
        this.modelSvc.removeItem(item);
      }else{
        this.showMsg("2273");
      }
      this.modelSvc.totalSumDebitCredit();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  tabChange() {
    try {
      this.isSubmitted = false;
      this.isMultiEntry = !this.isMultiEntry;
      this.isEdit=false;
      this.modelSvc.resetFormSingle();
      this.modelSvc.resetFormMultiple();
      this.modelSvc.journalVoucherModel.isMultiEntry=this.isMultiEntry;
      this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel);
      if(this.modelSvc.journalVoucherModel.isMultiEntry)
      {
        this.modelSvc.setSingleORG();
        this.addNewJournalItem();
      }
      this.modelSvc.isSingleEditMode=false;
      this.modelSvc.isMultipleEditMode=false;
      this.isInValidBranch=false;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  fileUploadSingleEntryModal() {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.header = this.fieldTitle["fileupload"];
      modalConfig.closable = false;

      modalConfig.data = {
        uploadOption: this.fileUploadOption,
        targetObjectList: this.modelSvc.journalVoucherModel
          .voucherAttachmentList,
      };

      this.ref = this.dialogSvc.open(FileUploadComponent, modalConfig);

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.modelSvc.singleJournalVoucherForm.markAsDirty();
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  fileUploadMultiEntryModal(item: VoucherItemModel) {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.header = this.fieldTitle["fileupload"];
      modalConfig.closable = false;

      modalConfig.data = {
        uploadOption: item.imageFileUploadOpton,
        targetObjectList: item.voucherItemAttachmentList,
      };

      this.ref = this.dialogSvc.open(FileUploadComponent, modalConfig);

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.modelSvc.fileManagement(item);
          this.modelSvc.multiJournalVoucherForm.markAsDirty();
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onDebitFieldChange(entity: any,event:any,rowIndex?:number) {
    try {
      this.modelSvc.onDebitFieldChange(entity);
      this.modelSvc.totalSumDebitCredit();
      this.validateDebitCreditFields(entity,rowIndex);  
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private removeBorderColor(rowIndex?: number) {
    const elementCreditName = rowIndex != undefined ? "creditVal_" + rowIndex : "creditVal";
    let inputClementCreditName = document.getElementById(elementCreditName) as HTMLInputElement;
    if (inputClementCreditName) {
      inputClementCreditName.style.borderColor = "";
    }
    const elementDebitName = rowIndex != undefined ? "debitVal_" + rowIndex : "debitVal";
    let inputElementDebitName = document.getElementById(elementDebitName) as HTMLInputElement;
    if (inputElementDebitName) {
      inputElementDebitName.style.borderColor = "";
    }
  }

  private setBorderColor(rowIndex?: number) {
    const elementCreditName = rowIndex != undefined ? "creditVal_" + rowIndex : "creditVal";
    let inputClementCreditName = document.getElementById(elementCreditName) as HTMLInputElement;
    if (inputClementCreditName) {
      inputClementCreditName.style.borderColor = "red";
    }
    const elementDebitName = rowIndex != undefined ? "debitVal_" + rowIndex : "debitVal";
    let inputElementDebitName = document.getElementById(elementDebitName) as HTMLInputElement;
    if (inputElementDebitName) {
      inputElementDebitName.style.borderColor = "red";
    }
  }

  onCreditFieldChange(entity: any,event:any,rowIndex?:number) {
    try {      
      this.modelSvc.onCreditFieldChange(entity);
      this.modelSvc.totalSumDebitCredit();
      this.validateDebitCreditFields(entity,rowIndex);    
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  validateDebitCreditFields(model: any,rowIndex?:number) {    
    const debitVal = model.debitVal ? parseFloat(model.debitVal) : 0;
    const creditVal = model.creditVal ? parseFloat(model.creditVal) : 0;
  
    if ((debitVal === 0 && creditVal === 0) || (debitVal > 9999999999999.99 || creditVal > 9999999999999.99)) {
      model.isInvalidDebitValue = true;
      model.isInvalidCreditValue = true;
      this.setBorderColor(rowIndex);
    } else {
      model.isInvalidDebitValue = false;
      model.isInvalidCreditValue = false;
      this.removeBorderColor(rowIndex);
    }
  }

  onSelectFromAccountSubLedger(entity: any) {
    try {
      
      setTimeout(() => {
        if (this.modelSvc.checkSubLedgerFromAccount(entity)) {
          this.showMsg("2242");
        }
        if (this.modelSvc.checkValidityForDuplicateMultiEntry()) {
          entity.fromSubLedgerDetailID = null;
          this.showMsg("2248");
          return;
        }
        if (entity.fromCOAStructID && entity.fromSubLedgerDetailID) {
          this.coreAccService.getLedgerBalance(
              entity.fromCOAStructID,
              entity.companyID,
              entity.fromSubLedgerDetailID,
              entity.orgID,
              entity.projectID
            )
            .subscribe({
              next: (res: any) => {
                const fromAccountSubLedgerBalance = res || [];
                this.modelSvc.setSubLedgerFromAccount(
                  entity,
                  fromAccountSubLedgerBalance.length
                    ? fromAccountSubLedgerBalance[0].balance
                    : 0
                );
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
        } else {
          this.modelSvc.setSubLedgerFromAccount(entity, 0);
        }
      }, 0);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  onSelectFromAccountSubLedgerMulti(entity: any) {
    try {      
      setTimeout(() => {
        if (this.modelSvc.checkSubLedgerFromAccount(entity)) {
          this.showMsg("2242");
        }

        if (entity.fromCOAStructID && entity.fromSubLedgerDetailID) {
          this.coreAccService.getLedgerBalance(
              entity.fromCOAStructID,
              this.modelSvc.journalVoucherModel.companyID,
              entity.fromSubLedgerDetailID,
              entity.orgID,
              entity.projectID
            )
            .subscribe({
              next: (res: any) => {
                const fromAccountSubLedgerBalance = res || [];
                this.modelSvc.setSubLedgerFromAccountMulti(
                  entity,
                  fromAccountSubLedgerBalance.length
                    ? fromAccountSubLedgerBalance[0].balance
                    : 0
                );
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
        } else {
          this.modelSvc.setSubLedgerFromAccountMulti(entity, 0);
        }
      }, 0);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  onSelectToAccountSubLedgerMulti(entity) {
    try {
      setTimeout(() => {
        
        if (this.modelSvc.checkSubLedgerToAccount(entity)) {
          this.showMsg("2242");
        }
         if (this.modelSvc.checkValidityForDuplicateMultiEntry()) {
          entity.toSubLedgerDetailID = null;
          this.showMsg("2248");
          return;
        }
        if (entity.toCOAStructID && entity.toSubLedgerDetailID) {
          this.coreAccService.getLedgerBalance(
              entity.toCOAStructID,
              this.modelSvc.journalVoucherModel.companyID,
              entity.toSubLedgerDetailID,
              this.modelSvc.journalVoucherModel.orgID,
              entity.projectID
            )
            .subscribe({
              next: (res: any) => {
                const toAccountSubLedgerBalance = res || [];
                this.modelSvc.setSubLedgerToAccountMulti(
                  entity,
                  toAccountSubLedgerBalance.length
                    ? toAccountSubLedgerBalance[0].balance
                    : 0
                );
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
        } else {
          this.modelSvc.setSubLedgerToAccountMulti(entity, 0);
        }
      }, 0);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  onSelectToAccountSubLedger(entity) {
    try {
      
      setTimeout(() => {
        if (this.modelSvc.checkSubLedgerToAccount(entity)) {
          this.showMsg("2242");
        }

        if (this.modelSvc.checkValidityForDuplicateMultiEntry()) {
          entity.toSubLedgerDetailID = null;
          this.showMsg("2248");
          return;
        }
        if (entity.toCOAStructID && entity.toSubLedgerDetailID) {
          this.coreAccService.getLedgerBalance(
              entity.toCOAStructID,
              entity.companyID,
              entity.toSubLedgerDetailID,
              entity.orgID,
              entity.projectID
            )
            .subscribe({
              next: (res: any) => {
                const ToAccountSubLedgerBalance = res || [];
                this.modelSvc.setSubLedgerToAccount(
                  entity,
                  ToAccountSubLedgerBalance.length
                    ? ToAccountSubLedgerBalance[0].balance
                    : 0
                );
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
        } else {
          this.modelSvc.setSubLedgerToAccount(entity, 0);
        }
      }, 0);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectFromAccount(item) {
    try {
      if(item.fromCOAStructID){
      item.fromSubLedgerTypeID = this.modelSvc.coaStructureList.find(
        (x) => x.id == item.fromCOAStructID
      )?.subLedgerTypeID;
      this.modelSvc.filterSubLedgerDetail(item);
      this.coreAccService.getLedgerBalance(
          item.fromCOAStructID || 0,
          item.companyID,
          null,
          item.orgID,
          item.projectID
        )
        .subscribe({
          next: (res: any) => {
            const toAccountBalance = res || [];
            this.modelSvc.onSelectFromAccount(
              item,
              toAccountBalance.length ? toAccountBalance[0].balance : 0
            );
            this.modelSvc.journalVoucherModel.fromSubLedgerBalance = 0;
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
      }else{
        this.modelSvc.journalVoucherModel.fromCoaStructBalance = 0;
        this.modelSvc.journalVoucherModel.fromSubLedgerBalance = 0;
        item.fromSubLedgerDetailList=[];
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectOrg(item) {
    try {
      item.voucherItemList = [];      
      this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID);
     
      let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
      let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);
  

        if(!fromCoaList.length || !toCoaList.length){
          this.modelSvc.journalVoucherModel.fromCOAStructID = null;
          this.modelSvc.journalVoucherModel.fromSubLedgerDetailID = null;
          this.modelSvc.journalVoucherModel.fromSubLedgerTypeID = null;
          this.modelSvc.journalVoucherModel.fromCoaStructBalance = null;
          this.modelSvc.journalVoucherModel.toCOAStructID = null;
          this.modelSvc.journalVoucherModel.toSubLedgerDetailID = null;
          this.modelSvc.journalVoucherModel.toSubLedgerTypeID = null;
          this.modelSvc.journalVoucherModel.toSubledgerBalance = null;
          this.modelSvc.journalVoucherModel.creditVal = null;
          this.modelSvc.journalVoucherModel.debitVal = null;
          this.modelSvc.journalVoucherModel.description = null;
          this.modelSvc.journalVoucherModel.voucherAttachmentList = [];
          this.markFormAsPristine(this.singleJournalVoucherForm);
          this.markFormAsPristine(this.multiJournalVoucherForm);

          
       
          if(!fromCoaList.length && !toCoaList.length)
            this.showMsg("2270");
     
          if(!fromCoaList.length && toCoaList.length)
            this.showMsg("2268");
    
          if(fromCoaList.length && !toCoaList.length)
            this.showMsg("2269");

        }
        if(this.isMultiEntry)
          {
            this.addNewJournalItem();
            this.modelSvc.totalSumDebitCredit();
          }
        if(this.modelSvc.isBranchModuleActive)
          this.isInValidBranch= this.modelSvc.journalVoucherModel.orgID?false:true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectProject(item) {
    try {
     
        this.modelSvc.filterCOAStructure(this.modelSvc.journalVoucherModel,this.modelSvc.journalVoucherModel.orgID,this.modelSvc.journalVoucherModel.projectID);
        let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
        let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);

        if(!fromCoaList.length || !toCoaList.length){
          if(this.singleJournalVoucherForm)
          this.markFormAsPristine(this.singleJournalVoucherForm);

          
       
          if(!fromCoaList.length && !toCoaList.length)
            this.showMsg("2270");
 
          if(!fromCoaList.length && toCoaList.length)
            this.showMsg("2268");

          if(fromCoaList.length && !toCoaList.length)
            this.showMsg("2269");
        }
    
      setTimeout(() => {
        item.fromCOAStructID =null;
        item.fromCoaStructBalance = 0;
        item.fromSubLedgerDetailID = null;
        item.fromSubLedgerTypeID = null;
        item.fromSubLedgerBalance = 0;

        item.toCOAStructID =null;
        item.toAccountBalance = 0;
        item.toSubLedgerDetailID = null;
        item.toSubLedgerTypeID = null;
        item.toSubledgerBalance = 0;

        // item.creditVal = null;
        // item.debitVal = null;
        item.voucherAttachmentList = [];
      }, 0);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  // private getCoaStructureByOrgAndProject(item: any) {
  //   let coaList = this.modelSvc.coaStructureList.filter(x => 
  //     (!item.orgID || x.orgID === item.orgID) && 
  //     (!item.projectID || x.projectID === item.projectID)
  //   );
  //   return coaList;
  // }

  onSelectToAccount(item) {
    try {
      if(item.toCOAStructID){
        item.toSubLedgerTypeID = this.modelSvc.coaStructureList.find(
          (x) => x.id == item.toCOAStructID
        )?.subLedgerTypeID;
       this.modelSvc.filterSubLedgerDetail(item);
        this.coreAccService.getLedgerBalance(
            item.toCOAStructID || 0,
            item.companyID,
            null,
            item.orgID,
            item.projectID
          )
          .subscribe({
            next: (res: any) => {
              const toAccountBalance = res || [];
  
              this.modelSvc.onSelectToAccount(
                item,
                toAccountBalance.length ? toAccountBalance[0].balance : 0
              );
              item.toSubledgerBalance = 0;
              item.toSubLedgerDetailID=null;
            },
            error: (res: any) => {
              this.showErrorMsg(res);
            },
          });
      }else{
        item.toAccountBalance=0;
        item.toSubledgerBalance = 0;
        item.toSubLedgerDetailList=[];
        item.toSubLedgerDetailID=null;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectFromAccountMulti(item) {
    try {
      if(item.fromCOAStructID){
        item.fromSubLedgerTypeID = this.modelSvc.coaStructureList.find(
          (x) => x.id == item.fromCOAStructID
        )?.subLedgerTypeID;
        this.modelSvc.filterSubLedgerDetail(item);
        this.coreAccService.getLedgerBalance(
            item.fromCOAStructID || 0,
            this.modelSvc.journalVoucherModel.companyID,
            null,
            this.modelSvc.journalVoucherModel.orgID,
            item.projectID 
          )
          .subscribe({
            next: (res: any) => {
              const fromAccountBalance = res || [];
  
              this.modelSvc.onSelectFromAccountMulti(
                item,
                fromAccountBalance.length ? fromAccountBalance[0].balance : 0
              );
  
              if (this.modelSvc.checkValidityForDuplicateMultiEntry()) {
                item.fromCOAStructID = null;
                this.showMsg("2248");
                return;
              }
            },
            error: (res: any) => {
              this.showErrorMsg(res);
            },
          });
      }else{
        item.fromCoaStructBalance=0;
        item.fromSubLedgerBalance=0;
        item.fromSubLedgerDetailList=[];
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectToAccountMulti(item) {
    try {
     if(item.toCOAStructID){
      item.toSubLedgerTypeID = this.modelSvc.coaStructureList.find(
        (x) => x.id == item.toCOAStructID
      )?.subLedgerTypeID;
      this.modelSvc.filterSubLedgerDetail(item);
      this.coreAccService.getLedgerBalance(
          item.toCOAStructID || 0,
          this.modelSvc.journalVoucherModel.companyID,
          null,
          this.modelSvc.journalVoucherModel.orgID,
          item.projectID||0
        )
        .subscribe({
          next: (res: any) => {
            const toAccountBalance = res || [];

            this.modelSvc.onSelectToAccountMulti(
              item,
              toAccountBalance.length ? toAccountBalance[0].balance : 0
            );
            item.toSubledgerBalance = 0;

            if (this.modelSvc.checkValidityForDuplicateMultiEntry()) {
              item.toCOAStructID = null;
              this.showMsg("2248");
              return;
            }
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
     }else{
      item.toSubledgerBalance = 0;
      item.toAccountBalance = 0;
      item.toSubLedgerDetailList = [];
     }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectToProjectMulti(item) {
    try {
      item.voucherItemList = [];   
      this.addNewJournalItem();
      this.modelSvc.totalSumDebitCredit();
        this.modelSvc.filterCOAStructure(item,this.modelSvc.journalVoucherModel.orgID,item.projectID);
        let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
        let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);

        if(!fromCoaList.length || !toCoaList.length){
          setTimeout(()=>{
            this.markFormAsPristine(this.multiJournalVoucherForm);            
          },10);

          
       
            if(!fromCoaList.length && !toCoaList.length)
              this.showMsg("2270");
       
            if(!fromCoaList.length && toCoaList.length)
              this.showMsg("2268");
      
            if(fromCoaList.length && !toCoaList.length)
              this.showMsg("2269");
        }
      
      item.toAccountBalance = 0;
      item.toSubLedgerDetailID = null;
      item.toSubLedgerTypeID = null;
      item.toCOAStructID = null;      
      item.description = null;

      if (item?.voucherItemAttachmentList) item.voucherItemAttachmentList = [];
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  //Print
  printVoucher(voucher: VoucherModel) {
    try {
      this.coreAccService.printVoucher(
        voucher.voucherTypeCd,
        voucher.id
      );
    } catch (e) {
      throw e;
    }
  }

  getTotalDifference(){
    try {
      let total=Math.abs(this.modelSvc.totalDebit-this.modelSvc.totalCredit);
      return total.toFixed(this.decimalPlace);
    } catch (e) {
      throw e;
    }
  }
  
}
