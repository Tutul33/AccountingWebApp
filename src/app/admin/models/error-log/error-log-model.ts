import { ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
export class ErrorLog 
{
  public errorList: any = [];
  public userList: any = [];
  public pageList: any = [];
  public userId: number = null;
  public pageId: number = null;
  public dateFrom: Date = null;
  public dateTo: Date = null;

  constructor(defaultData?: Partial<ErrorLog>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}
export function errorLogValidation(): any {
  return {
    errorLogValidateModel: {
      // dateFrom: {
      //   required: "Date From is required.", //GlobalConstants.validationMsg.code,
      // },
      // dateTo: {
      //   required: "Date To is required.",
      // },
      // userId: {
      //   required: "User Id is required.", //GlobalConstants.validationMsg.code,
      // },
      // pageId: {
      //   required: "Page Name is required.",
      // },
    } as ValidatingObjectFormat,
  };
}
