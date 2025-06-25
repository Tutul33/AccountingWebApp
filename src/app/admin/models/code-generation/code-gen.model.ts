import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { CodeGenItemDTO } from "./code-gen-item.model";
export class CodeGenDTO 
{
  id:number=0;
  locationID: number = GlobalConstants.userInfo.locationID;
  keyCode: string = null;
  valFrom: number = null;
  valTo: number = null;
  genCodeFormat: string = null;
  codeGenVarID: string = null;
  dataVariantID: number = null;
  isActive:boolean=false;
  valFromFormat: string = null;
  codeGenItems:CodeGenItemDTO[]=[];

  isVariantRequired:boolean=false;
  constructor(defaultData?: Partial<CodeGenDTO>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}
export function codeGenValidation(): any {
  return {
    codeGenValidateModel: {
       keyCode: {
         required: "KeyCode is required.",
       },
       valFromFormat: {
         required: "Satrt is required.", 
       }
       ,
    } as ValidatingObjectFormat,
    
    codeGenItemValidateModel: {
      propertyName:{
        required: "Perperty is required.", 
      }
    } as ValidatingObjectFormat
    
  };
}
