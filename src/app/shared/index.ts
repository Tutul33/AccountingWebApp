///////* Services */
////export { ModalService } from '../commonComponents/services/modal.service';
export { DataService } from '../shared/services/data.service';
export { ModalService } from '../shared/services/modal.service';
export { ApiService } from '../shared/services/api.service';
export { DynamicReportService } from './../shared/services/dynamic-report.service';
export { AuthenticationService } from '../login/services/authentication.service';
export { AppMsgService } from '../shared/services/app-msg.service';
export { ProviderService } from '../core/services/provider.service';

///* Components */
export { NiWebcamComponent } from './components/ni-webcam/ni-webcam.component';
export { NiMultipleFileViewComponent } from './components/ni-multiple-file-view/ni-multiple-file-view.component';
export { AddressPickerComponent } from './components/address-picker/address-picker.component';
export { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
export { BaseComponent } from '../shared/components/base/base.component';


export { ConfirmOTPComponent } from '../shared/components/confirm-otp/confirm-otp.component';

///* Models */
export {
    QueryData,
    FileOptions,
    ExportOptionInterface,
    ExportOption,
    FileUploadOption,
    ModalConfig
  } from '../shared/models/common.model';

/// * Directive */
export { ValidatorDirective } from '../shared/directives/validator.directive';

// Others
export { Config } from 'src/app/app-shared/models/config';
export { GlobalMethods } from '../core/models/javascriptMethods';
export { GlobalConstants } from '../app-shared/models/javascriptVariables';
export { FixedIDs } from '../app-shared/models/fixedIDs';
