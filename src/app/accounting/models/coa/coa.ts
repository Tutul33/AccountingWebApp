
import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class COA {
    id: number = 0;                  
    parentID?: number = null;  
    oldParentID?: number = null;
    accountNatureCd: number = 0;     
    accountCode: string = null;  
    cOALevelCode: number = 0;       
    accountName: string = null;         
    assetTypeCode?: number = null;      
    subLedgerTypeID?: number = null;    
    note?: string = null;               
    depreciationRate?: number = 0;  
    parentLedgerID?: number = null;     
    isHide: boolean = false;             
    isActive: boolean = true; 
    transactionNatureCode?: number = null;
    codeGenPropertyVal:string = null;
    parentAccountCode: string = null;  
    tag:any = 0;

    isSubLedgerType:boolean = false;
    isControlLegerHide:boolean;
    subLedgerID?:any;
    
    constructor(defaultData?: Partial<COA>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }

}

export function accountNatureValidation(): any {
    return {
        accountNatureModelValidation: {
            accountName: {
                required: GlobalConstants.validationMsg.accountName
            },
        } as ValidatingObjectFormat,

    }
}

export function groupLedgerValidation(): any {
    return {
        groupLedgerModelValidation: {
            accountName: {
                required: GlobalConstants.validationMsg.accountName
            },
            parentID: {
                required: GlobalConstants.validationMsg.parentID
            },
        } as ValidatingObjectFormat,

    }
}







export class ORGStructureDTO {
    id:number = 0;
    parentID: number = 0;
    elementID: number = null;
    name: string = null;
    isOffice: boolean = false;
    textColorCd: string = null;
    fillColorCd: string = null;
    tag:any = 0;

    parentName? :string = null;
    office?:string = null;
    orgElementID: number = null; //0;
    childOrgList?:ORGStructureDTO[] = [];
    childID?:number = 0;

    constructor(defaultData?: Partial<ORGStructureDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

  export function orgStructureValidation(): any {
    return {
        orgStructureModelValidation: {
            elementID: {
                required: GlobalConstants.validationMsg.elementid
            },
            name: {
                required: GlobalConstants.validationMsg.name
            },
            
            // textColorCd: {
            //     required: GlobalConstants.validationMsg.textColorCd
            // },
            // fillColorCd: {
            //     required: GlobalConstants.validationMsg.fillColorCd
            // }
        } as ValidatingObjectFormat,

    }
}


