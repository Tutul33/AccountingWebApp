import { ValidatingObjectFormat } from "../..";

export class LanguageKeyValue {
    id: number = 0;
    languageName:string=null;
    languageID:number=null;
    languageKeyID:number=null;
    languageCode:string=null;
    languageKeyCode:string=null;
    value:string="";
    tag:number=0;
    constructor(defaultData?: Partial<LanguageKeyValue>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}

export function languageKeyValueValidation(): any {
    return {
        languageKeyValueValidationModel: {
      } as ValidatingObjectFormat,
    };
}
  