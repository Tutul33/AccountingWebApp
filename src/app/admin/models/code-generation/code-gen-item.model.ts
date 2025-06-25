import { ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
export class CodeGenItemDTO 
{
  id:number=0;
  codeGenItemID:number=0;
  codeGenID: number = 0;
  propertyName: string = null;
  value: string = null;
  prefix: boolean = false;
  pSL: number = null;
  sufffix: boolean = null;
  sSL: number = null;
  startIndex:number=null;
  length: number = null;
  action:string='';
  reset:boolean=false;

  //extra property
  lastIndex:boolean=false;
  isPrefixOrSuffixSelected:boolean=false;
  isActionNotSelected:boolean=false;
  tag:number = 0;
  constructor(defaultData?: Partial<CodeGenItemDTO>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}
