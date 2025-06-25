
import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { Config, FileUploadOption, GlobalMethods, IRange } from "../..";
import { ImageFile } from "src/app/shared/models/common.model";

export class LedgerSummary {

    id: number = 0;
    financialYearID: number = 0;
    companyID: number = null;
    orgID?: number = null;
    CreatedDatetime:Date = new Date();
    projectID?: number = null;
    isManuallyUploded: boolean = false;
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID?: number = GlobalConstants.userInfo.userPKID;
    InsertUserID?: number = GlobalConstants.userInfo.userPKID;

    ledgerSummaryDetailList: LedgerSummaryDetail[] = [];
    ledgerSummaryAttachmnetList: LedgerSummaryAttachmnet[] = [];
    imageFileUploadOpton:FileUploadOption = imageFileUploadOption();
        
    tag: any = 0;

    //
    //financialYear: any = null;
    financialDate: any = null;
    name:any = null;
    year:any = null;



    constructor(defaultData?: Partial<LedgerSummary>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }

}

export class LedgerSummaryDetail {

    id: number = 0;
    ledgerSummaryID: number = 0;
    cOAStructureID: number = null;
    subLedgerTypeID?: number = null;
    subLedgerDetailID?: number = null;
    debitVal: number = null;
    creditVal: number = null;
    tag: any = 0;

    toCoaStructureList:any;
    toSubLedgerDetailList:any;




    constructor(defaultData?: Partial<LedgerSummaryDetail>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }

}

export class LedgerSummaryAttachmnet {

    id: number = 0;
    ledgerSummaryID: number = 0;
    fileName?: string = null;


    //

    imageFile: ImageFile =  new ImageFile();
    constructor(defaultData?: Partial<LedgerSummaryAttachmnet>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }

}


export function imageFileUploadOption(defaultObj?: any){
    const fileOption = new FileUploadOption()
    defaultObj = defaultObj || {};
    fileOption.acceptedFiles = '.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xlsx,.csv';
    fileOption.folderName = Config.imageFolders.openingBalance;
    fileOption.uploadServiceUrl = "File/UploadFiles";
    fileOption.fileTick = defaultObj?.fileTick || GlobalMethods.timeTick() + 1;
    fileOption.isMultipleUpload = false;
    fileOption.isMultipleSelection = false;
    return fileOption;
  }

 export function OpeningBalanceValidation(): any {
    return {
        openingBalanceValidationModel: {
            companyID:{
          required: GlobalConstants.validationMsg.companyID
        },
        orgID:{
          required: GlobalConstants.validationMsg.orgID
        }
      } as ValidatingObjectFormat,

      openingBalanceValidationDetailModel: {
        cOAStructureID:{
          required: GlobalConstants.validationMsg.cOAStructureID
        },
        
        debitVal: {
          required: "Debit value length can not be less than 0",
          range: {
              message: 'Debit value can not be more than 9999999999999.99',
              startValue: 0,
              endValue: 9999999999999.99
          } as IRange
        },
        creditVal: {
          required: "Credit value length can not be less than 0",
          range: {
            message: 'Credit value can not be more than 9999999999999.99',
            startValue: 0,
            endValue: 9999999999999.99
          } as IRange
        }
      } as ValidatingObjectFormat,
    };
  }


  export function OpeningBalanceBulkUploadValidation(): any {
    return {
        openingBalanceBulkUploadValidationModel: {
            companyID:{
          required: GlobalConstants.validationMsg.companyID
        },
        orgID:{
          required: GlobalConstants.validationMsg.orgID
        }
      } as ValidatingObjectFormat,

      
    };
  }

