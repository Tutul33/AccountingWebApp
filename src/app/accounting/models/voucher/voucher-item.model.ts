import { Config, FileUploadOption, GlobalMethods } from "src/app/app-shared";

export class VoucherItemModel {
    id: number = 0;
    parentID: number = null;
    transactionID: number = null;
    voucherID: number = 0;
    toCOAStructID: number = null;
    toSubLedgerTypeID: number = null;
    toSubLedgerDetailID: number = null;
    comment:string=null;
    debitVal:number=null;
    creditVal: number = null;
    fromCOAStructID: number = null;
    fromSubLedgerTypeID:number=null;
    fromSubLedgerDetailID:number=null;
    //projectID: number = null;
    tranModeCd:number=null;
    chequeLeafID:number=null;
    chequeNo: string = '';
    chequeDate:Date=null;
    clearedOnDate:Date=null;
    description: string = '';
    invoiceBillRefNo: string = '';
    tag:number=0;
    
    //extra property
    fromCoaStructBalance:number=0;
    fromSubLedgerBalance:number=0;
    budget:number=0;
    fromAccountName:string='';
    fromSubledgerName:string='';
    toAccountName:string='';
    toAccountBalance:number=0;
    toSubledgerName:string='';
    project:string='';
    transactionModeID:number=null;
    fromSubLedgerDetailList:any[]=[];
    toSubLedgerDetailList:any[]=[];
    transactionNoList:any=[];
    fromCoaStructureList:any=[];
    toCoaStructureList:any=[];
    imageFileList:VoucherItemAttachment[] = [];
    imageFileUploadOpton:FileUploadOption = imageFileUploadOption();
    voucherItemAttachmentList: VoucherItemAttachment[] = [];
    voucherItemID: number = 0;    
    toSubledgerBalance:number=0;
    constructor(defaultData?: Partial<VoucherItemModel>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}

export class VoucherItemAttachment {
    id: number = 0;
    tag: number = 0;
    voucherItemID: number = 0;
    voucherItemAttachmentID: number = 0;
    fileName: string = null;  
    folderName: string = null;
    deletedFileName: string = null;
    fileTick: string = null;
  
    constructor(defaultData?: Partial<VoucherItemAttachment>) {
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
    fileOption.acceptedFiles = '.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xlsx';
    fileOption.folderName = Config.imageFolders.voucher;
    fileOption.uploadServiceUrl = "File/UploadFiles";
    fileOption.fileTick = defaultObj?.fileTick || GlobalMethods.timeTick() + 1;
    fileOption.isMultipleUpload = true;
    fileOption.isMultipleSelection = true;
    return fileOption;
  }

