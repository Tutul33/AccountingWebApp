
import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

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


