import { GlobalConstants } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength, ImageFile } from "src/app/shared/models/common.model";
import { ValidatingObjectFormat } from 'src/app/app-shared/models/javascriptVariables';

export class BannerTemplate {
    id: number = 0;
    serialNo: number = 0;
    templateName: string = null;
    templateFileName: string = null;
    uploadDateTime: Date = GlobalConstants.serverDate;
    templateImage = null;
    hasFile = false;
    uploadedByID = GlobalConstants.userInfo.userPKID;
    constructor(defaultData?: Partial<BannerTemplate>) {
        defaultData = defaultData || {},
            Object.keys(defaultData).forEach((key) => {
                const value = defaultData[key];
                if (this.hasOwnProperty(key)) {
                    this[key] = value;
                }
            })
    }
}

export function bannerTemplateValidation(): any {
    return {
        bannerTemplateValidateModel: {
            // serialNo: {
            //     required: "Serial No required",
            // },
            templateName: {
                required: "Banner Template Name is required"
            }
        } as ValidatingObjectFormat,
    }
}