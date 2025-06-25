import { GlobalConstants, ValidatingObjectFormat } from "../..";
import { LanguageKeyValue } from "./languageKeyValue.model";

export class LanguageKey {
    id: number = 0;
    keyCode:string=null;
    languageKeyValueList:LanguageKeyValue[]=[];
    constructor(defaultData?: Partial<LanguageKey>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}

export function languageKeyValidation(): any {
    return {
        languageKeyValidationModel: {
            keyCode: {
                required: GlobalConstants.validationMsg.keyCode,
              }
      } as ValidatingObjectFormat,
    };
}