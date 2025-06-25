import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class StruetureElementDTO {
    id: number = 0;
    elementName: string = null;
    isSelected: boolean = false;
    typeCd: string = null;

    structureElementMapList: any = [];
    //extra properties

    typeName: string = null;
    behaviorName: string = null;
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:number = 0;

    constructor(defaultData?: Partial<StruetureElementDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export class StruetureElementMapDTO {
    id: number = 0;
    elementID: number = 0;
    behaviorCd: string = null;

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:number = 0;

    constructor(defaultData?: Partial<StruetureElementMapDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

  export function struetureElementValidation(): any {
    return {
        struetureElementValidation: {
            elementName: {
                required: 'Element Name is required.'
            },
            behaviorCd: {
                required: 'Behavior is required.'
            },
            typeCd: {
                required: 'Type is required.'
            },
        } as ValidatingObjectFormat,

    }
}

