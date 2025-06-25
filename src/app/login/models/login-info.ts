import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
export interface LoginInfo {
    userName: string;
    password: string;
}
export function loginInfoValidation(): any {
    return {
        loginInfoValidateModel: {
         userName: {
          required: GlobalConstants.validationMsg.username,
        },
        password: {
          required: GlobalConstants.validationMsg.password,
        }
      } as ValidatingObjectFormat,
    };
  }